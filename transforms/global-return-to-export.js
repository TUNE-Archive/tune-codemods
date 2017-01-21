const parser = require('babel-eslint');
const addTypes = require('./helpers/add-types');

module.exports = function transformer(file, api) {
  addTypes(api);
  const j = api.jscodeshift.withParser(parser);
  const root = j(file.source);

  let mutations = 0;

  mutations += root
    .find(j.ReturnStatement)
    .filter(p => p.parent.node.type === j.Program.name)
    .replaceWith(p => j.exportDefaultDeclaration(p.node.argument))
    .size();

  return mutations ? root.toSource() : null;
};
