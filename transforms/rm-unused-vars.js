module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  let mutations = 0;

  const instanceCount = (scope, identifier) => scope
    .find(j.Identifier, { name: name => name === identifier.name })
    .filter(i => i.node !== identifier)
    .size();

  root
    .find(j.ImportDeclaration)
    .forEach(p => {
      const scope = j(p).closestScope();

      p.value.specifiers = p.value.specifiers.filter(spec => {
        const getNode = (spec) => {
          switch (spec.type) {
            case j.ImportSpecifier.name:
              return spec.imported;
            case j.ImportNamespaceSpecifier.name:
            case j.ImportDefaultSpecifier.name:
              return spec.local;
            default:
              console.warn(`${spec.type}: is not supported`);
          }
        };
        mutations++;
        return instanceCount(scope, getNode(spec));
      });

      if (!p.value.specifiers.length) {
        mutations++;
        p.prune();
      }
    });

  root
    .find(j.VariableDeclaration)
    .forEach(p => {
      const pathRoot = j(p);
      const scope = pathRoot.closestScope();

      p.value.declarations = p.value.declarations.filter(dec => {
        mutations ++;

        switch (dec.id.type) {
          case j.Identifier.name:
            return instanceCount(scope, dec.id);
          case j.ObjectPattern.name:
            dec.id.properties = dec.id.properties.filter(prop => prop.key && instanceCount(scope, prop.key));
            return dec.id.properties.length;
          case j.ArrayPattern.name:
            dec.id.elements = dec.id.elements.filter(elem => instanceCount(scope, elem.name));
            return dec.id.elements.length;
          default:
            console.warn(`${dec.id.type}: is not supported`);
            return true;
        }
      });

      if (!p.value.declarations.length) {
        mutations++;
        p.prune();
      }
    });

  return mutations ? root.toSource() : null;
};
