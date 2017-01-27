export default (fileInfo, api) => {
  const j = api.jscodeshift;
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

  if (superClassImport.length) {
    superClassImport.find(j.ImportDefaultSpecifier).remove();

    // Remove the rest of the import if TxlBase was the only thing being imported
    if (!superClassImport.get(0).node.specifiers.length) {
      superClassImport.remove();
    }
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

module.exports.parser = 'babylon';
