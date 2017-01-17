const flatten = require('lodash.flattendeep');
const parser = require('babel-eslint');
const { EOL } = require('os');

const addTypes = require('./helpers/add-types');
const importType = require('./helpers/resolve-imports');

const tuneModules = ['txl/', 'tune'];

function isEqual(arr1, arr2) {
  return (arr1.length === arr2.length) && !arr1.some((o, i) => arr2[i] !== o);
}

function isTuneModule(name) {
  return tuneModules.some(mod => name.indexOf(mod) > -1);
}

function groupBy(arr, fn) {
  let output = [];
  let prev = arr[0];
  let group = [];
  arr.forEach(v => {
    if (!fn(v, prev)) {
      output.push(group);
      group = [];
    }
    group.push(v);
  });

  if (group.length) {
    output.push(group);
  }

  return output;
}

function groupByRank(arr) {
  const sortedArr = arr.sort((a, b) => {
    return b.rank - a.rank;
  });

  return groupBy(sortedArr, (a, b) => a.rank === b.rank)
}

function groupByAbsolute(arr) {
  const sortedArr = arr.sort((a, b) =>
    importType.isAbsolute(b.name) - importType.isAbsolute(a.name)
  );

  return groupBy(sortedArr, (a, b) =>
    importType.isAbsolute(a.name) === importType.isAbsolute(b.name));
}

function groupByCustom(arr) {
  const sortedArr = arr.sort((a, b) =>
    isTuneModule(a.name) - isTuneModule(b.name)
  );

  return groupBy(sortedArr, (a, b) => isTuneModule(a.name) === isTuneModule(b.name))
}

function thunk(arr, fns) {
  if (!fns.length) {
    return arr;
  }

  const [fn, ...rest] = fns;
  return fn([...arr]).map(group => thunk(group, rest));
}

module.exports = function transformer(file, api) {
  addTypes(api);
  const j = api.jscodeshift.withParser(parser);
  const root = j(file.source);

  let imports = [];

  const groups = importType.getGroups(file.filename).reverse();

  root.find(j.ImportDeclaration).forEach(p => {
    const { source } = p.value;
    const path = importType.resolve(source.value);
    const name = path != null ? path : source.value;
    const type = importType(source.value, path);

    imports.push({
      path: j(p),
      rank: importType.getRank(type, groups),
      name
    });
  });

  const sortByName = (a, b) => a.name.localeCompare(b.name);

  const sortedImports = flatten(thunk(imports, [
    groupByRank,
    groupByAbsolute,
    groupByCustom,
    (arr) => arr.sort(sortByName)
  ]));

  if (!isEqual(imports, sortedImports)) {
    const comments = imports[0].path.get('comments').value;
    imports[0].path.get('comments').replace();
    sortedImports[0].path.forEach(p => {
      p.value.comments = comments;
    });

    let output = '';
    let prev = sortedImports[0];

    sortedImports.forEach(info => {
      if (info.rank !== prev.rank) {
        output += EOL;
      }

      output += info.path.toSource().trim() + EOL;
      info.path.remove();
      prev = info;
    });

    return output + EOL + root.toSource();
  }

  return null;
};