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

  root.find(j.ObjectExpression).forEach(p => {
    const { value } = p;
    const sorted = value.properties
      .filter(prop => prop.key != null && prop.key.type === j.Identifier.name)
      .sort((a, b) => a.key.name.localeCompare(b.key.name));

    value.properties
      .forEach((prop, i) => {
        if (prop.key == null || prop.key.type !== j.Identifier.name) {
          sorted.splice(i, 0, prop);
        }
      });

    if (!isEqual(value.properties, sorted)) {
      mutations++;
      value.properties = sorted;
    }
  });

  return mutations ? root.toSource() : null;
};
