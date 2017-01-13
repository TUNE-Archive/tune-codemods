module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  let mutations = 0;

  const instanceCount = (scope, identifier, filter = () => true) => {
    const count = scope
      .find(j.Identifier, { name: name => name === identifier.name })
      .filter(i => i.node !== identifier && filter(i))
      .size();
    return count || identifier.name === 'React';
  };

  const isExport = (nodePath) => (nodePath.value.type === j.ExportNamedDeclaration.name ||
    nodePath.value.type === j.ExportDefaultDeclaration.name) ||
    (nodePath.parent != null && isExport(nodePath.parent));

  root
    .find(j.ImportDeclaration)
    .forEach(p => {
      const scope = j(p).closestScope();

      const specifiers = p.value.specifiers.filter(spec => {
        return instanceCount(scope, spec.local);
      });

      if (specifiers.length !== p.value.specifiers.length) {
        p.value.specifiers = specifiers;
        mutations++;
      }
    });

  root
    .find(j.VariableDeclaration)
    .forEach(p => {
      // If this is an export statement skip it.
      if (isExport(p)) {
        return;
      }

      const pathRoot = j(p);
      const scope = pathRoot.closestScope();

      const filterArray = (arr) => {
        const elements = arr.filter(elem => instanceCount(scope, elem));

        if (elements.some((elem, i) => arr[i] !== elem)) {
          return arr;
        }

        return elements;
      };

      const declarations = p.value.declarations.filter(dec => {
        function filterParent(node) {
          let result = true;
          j(node).closest(j.VariableDeclaration).forEach((p1) => {
            result = p1 !== p;
          });
          return result;
        }

        switch (dec.id.type) {
          case j.Identifier.name:
            return instanceCount(scope, dec.id);
          case j.ObjectPattern.name:
            // if properties contains rest do not remove properties before the rest
            if (dec.id.properties.some((prop) => prop.type === j.RestProperty.name)) {
              dec.id.properties = dec.id.properties.filter(prop => {
                switch (prop.type) {
                  case j.RestProperty.name:
                    return instanceCount(scope, prop.argument, filterParent);
                  default:
                    return true;
                }
              });
            } else {
              dec.id.properties = dec.id.properties.filter(prop => {
                switch (prop.type) {
                  case j.ObjectProperty.name:
                    if (prop.value.type === j.Identifier.name) {
                      return instanceCount(scope, prop.value, filterParent);
                    }
                    return instanceCount(scope, prop.key, filterParent);
                  default:
                    return true;
                }
              });
            }
            return dec.id.properties.length;
          case j.ArrayPattern.name:
            dec.id.elements = filterArray(dec.id.elements);
            return dec.id.elements.length;
          default:
            console.warn(`${dec.id.type}: is not supported`);
            return true;
        }
      });

      if (!declarations.length) {
        mutations++;
        p.prune();
      } else if (declarations.length !== p.value.declarations.length) {
        mutations++;
        p.value.declarations = declarations;
      }
    });

  return mutations ? root.toSource() : null;
};

module.exports.parser = 'babylon';
