const parser = require('babel-eslint');
const addTypes = require('./helpers/add-types');

module.exports = function transformer(fileInfo, api) {
  addTypes(api);
  const j = api.jscodeshift.withParser(parser);
  const root = j(fileInfo.source);

  const superClassImport = root.find(j.ImportDeclaration, {
    specifiers: [{
      type: 'ImportDefaultSpecifier',
      local: {
        type: 'Identifier',
        name: 'TxlBase',
      },
    }]
  });

  // If it doesn't have TxlBase imported, there's nothing to do
  if(!superClassImport.length) { return null; }

  superClassImport.find(j.ImportDefaultSpecifier).remove();

  // Remove the rest of the import if TxlBase was the only thing being imported
  if (!superClassImport.get(0).node.specifiers.length) {
    superClassImport.remove();
  }

  const superClass = root.find(j.ClassDeclaration, {
    superClass: {
      type: 'Identifier',
      name: 'TxlBase',
    },
  });

  superClass.replaceWith(nodePath => {
    const { node } = nodePath;
    node.superClass = j.identifier('React.Component');

    return node;
  });

  return root.toSource({ quote: 'single', trailingComma: true });
};
