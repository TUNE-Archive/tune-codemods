const parser = require('babel-eslint');
const addTypes = require('./helpers/add-types');
const util = require('./util');

module.exports = function transform(fileInfo, api) {
  addTypes(api);
  const j = api.jscodeshift.withParser(parser);
  const createCallChain = util.createCallChain(j);
  const root = j(fileInfo.source);

  const triggerPropFuncCalls = root.find(j.CallExpression, {
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'ThisExpression',
      },
      property: {
        type: 'Identifier',
        name: '_triggerPropFunc',
      },
    }
  });

  // Don't need to continue because if there's no calls to _triggerPropFunc
  if (!triggerPropFuncCalls.length) {
    return null;
  }

  const componentName = root.find(j.ClassDeclaration).get(0).node.id.name;

  const getDefaultPropsNode = () => (
    root.find(j.AssignmentExpression, {
      operator: '=',
      left: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: componentName,
        },
        property: {
          type: 'Identifier',
          name: 'defaultProps',
        },
      },
    })
  );
  let defaultProps = getDefaultPropsNode();

  const getDefaultPropValueForProp = (propName) => {
    const defaultPropsNode = defaultProps.find(j.Property, {
      key: {
        type: 'Identifier',
        name: propName,
      }
    });

    return defaultPropsNode.length ? defaultPropsNode.get(0).node.value : undefined;
  };

  let propTypes = root.find(j.ExpressionStatement, {
    expression: {
      type: 'AssignmentExpression',
      operator: '=',
      left: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: componentName,
        },
        property: {
          type: 'Identifier',
          name: 'propTypes',
        },
      },
    }
  });

  // Add defaultProps definition if there are triggerPropFuncCalls but no defaultProps
  if (triggerPropFuncCalls.length && !defaultProps.length) {
    const defaultPropsLocation = propTypes.length ?  propTypes : root.find(j.ExportDefaultDeclaration);
    defaultPropsLocation.at(0).insertAfter(j.expressionStatement(
      j.assignmentExpression(
        '=',
        j.memberExpression(
          j.identifier(componentName),
          j.identifier('defaultProps'),
          false
        ),
        j.objectExpression([])
      )
    ));

    // Re-search for default props node now that we've added one
    defaultProps = getDefaultPropsNode();
  }

  // Add NOOP as the default prop if there isn't one for this prop func
  let didAddNewDefaultProps = false;
  const defaultPropsNodes = defaultProps.find(j.ObjectExpression).get(0).node.properties;
  triggerPropFuncCalls.forEach(nodePath => {
    const { node } = nodePath;
    const [ propFuncName ] = node.arguments;
    const defaultPropsValue = getDefaultPropValueForProp(propFuncName.value);
    if (!defaultPropsValue) {
      didAddNewDefaultProps = true;
      defaultPropsNodes.push(
        j.property(
          'init',
          j.identifier(
            propFuncName.value
          ),
          j.identifier('NOOP')
        )
      );
    }
  });
  // Sort the default props by name since we added some and they are likely no longer sorted
  if (didAddNewDefaultProps) {
    defaultPropsNodes.sort((a, b) => {
      const aName = a.type === 'SpreadProperty' ? `...${a.argument.object.name}` : a.key.name;
      const bName = b.type === 'SpreadProperty' ? `...${b.argument.object.name}` : b.key.name;

      if (aName < bName) { return -1; }
      if (aName > bName) { return 1; }
      return 0;
    });
  }

  triggerPropFuncCalls.replaceWith(nodePath => {
    const { node } = nodePath;
    const emptyObjectNode = j.objectExpression([]);
    const [ propFuncName, propFuncArguments = emptyObjectNode ] = node.arguments;

    const defaultPropsValue = getDefaultPropValueForProp(propFuncName.value);

    const args = [propFuncArguments];
    const callChain = ['this', 'props', propFuncName.value];

    // If there's a default prop value that's not NOOP, we need to call apply(this, args) on the prop func
    // instead of just calling it directly
    if (defaultPropsValue && defaultPropsValue.name !== 'NOOP') {
      callChain.push('apply');
      const currentArgs = args.pop();
      args.push(j.thisExpression(), j.arrayExpression([currentArgs]));
    }

    return createCallChain(callChain, args);
  });

  return root.toSource({ quote: 'single', trailingComma: true });
};
