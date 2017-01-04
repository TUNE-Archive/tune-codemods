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
            case j.ImportDefaultSpecifier.name:
              return spec.local;
            default:
              console.warn(`type ${spec.type}, not supported`);
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

        if (dec.id.type === j.Identifier.name) {
          return instanceCount(scope, dec.id)
        } else {
          dec.id.properties = dec.id.properties.filter(prop => instanceCount(scope, prop.key));
          return dec.id.properties.length;
        }
      });

      if (!p.value.declarations.length) {
        mutations++;
        p.prune();
      }
    });

  return mutations ? root.toSource() : null;
};
