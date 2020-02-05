module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'no member method.',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
  },

  create: function(context) {

    // variables should be defined here

    const ERR_MSG = 'don\'t use class member method';

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    const getParamsRange = (params, offset) => {
      if (!params || !params.length) {
        return [];
      } else {
        
        return [params[0].start - offset, (params[params.length - 1].end) - offset];
      }
    }

    const assertEndWithSemi = (context, node) => {
      const sourceCode = context.getSourceCode(node);
      const nextToken = sourceCode.getTokenAfter(node);
      const isSemi = nextToken.value === ";" && nextToken.type === "Punctuator";
      return isSemi;
    }

    // React Commonly Used Lifecycle Methods
    const noTransMethodName = new Set([
      'constructor',
      'render',
      'componentDidMounted',
      'componentWillReceiveProps',
      'componentWillMount',
      'componentDidMount',
      'componentWillUpdate',
      'componentDidUpdate',
      'shouldComponentUpdate',
      'componentWillUnmount',
      'getSnapshotBeforeUpdate',
      'componentDidCatch',
      'UNSAFE_componentWillMount',
      'UNSAFE_componentWillReceiveProps',
      'UNSAFE_componentWillUpdate',
    ]);

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      MethodDefinition: function(node) {
        const methodName = node.key.name; 
        if (!node.static && !noTransMethodName.has(methodName)) {
          context.report({
            node,
            message: ERR_MSG,
            fix: function(fixer) {
              const start = node.start;
              const _function = node.value;
              const argsRange = getParamsRange(_function.params, start);
              const sourceCode = context.getSourceCode().getText(node);
              const hasSemi = assertEndWithSemi(context, node);
              const args = (argsRange.length && sourceCode.slice(argsRange[0], argsRange[1])) || ''
              const fnBody = sourceCode.slice(_function.body.start - start, _function.body.end - start);
              const arrowFnText = `${methodName} = (${args}) => ${fnBody}${hasSemi ? '' : ';'}`;
              return fixer.replaceText(node, arrowFnText);
            }
          });
        }
      },
    };
  },
};
