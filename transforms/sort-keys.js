const parser = require('babel-eslint');
const addTypes = require('./helpers/add-types');

function isEqual(arr1, arr2) {
  return (arr1.length === arr2.length) && !arr1.some((o, i) => arr2[i] !== o);
}

module.exports = function transformer(file, api) {
  addTypes(api);
  const j = api.jscodeshift.withParser(parser);
  const root = j(file.source);

  let mutations = 0;

  const getValue = node => {
    switch (node.key.type) {
      case j.Identifier.name:
        return node.key.name;
      case j.Literal.name:
        return typeof node.key.value === 'string' ? node.key.value : node.key.raw;
    }

    return '';
  };

  root.find(j.ObjectExpression).forEach(p => {
    const { value } = p;
    const sorted = value.properties
      .filter(prop => prop.key != null &&
        (prop.key.type === j.Identifier.name || prop.key.type === j.Literal.name))
      .sort((a, b) => {
        // align sort with eslint sort-keys
        const valA = getValue(a);
        const valB = getValue(b);
        if (valA > valB) {
          return 1;
        }

        if (valA < valB) {
          return -1;
        }

        return 0;
      });

    value.properties
      .forEach((prop, i) => {
        if (prop.key == null || [j.Identifier.name, j.Literal.name].indexOf(prop.key.type) === -1) {
          sorted.splice(i, 0, prop);
        }
      });

    if (value.properties.length !== sorted.length) {
      console.log(value.properties.filter(n => n).map(getValue));
      console.log(sorted.filter(n => n).map(getValue));
    }
    
    if (!isEqual(value.properties, sorted)) {
      mutations++;
      value.properties = sorted;
    }
  });

  return mutations ? root.toSource() : null;
};
