module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Remind you to return something for the next promise chain.',
      category: 'Possible Errors',
      recommended: true,
    },
    fixable: null,
    schema: [],
  },

  create: function(context) {

    // variables should be defined here

    const ERR_NO_RETURN = 'You may forget to return something since the next promise chain needs parameters.';
    const ERR_RETURN_UNDEFINED = 'You may want to return something defined since the next promise chain needs parameters.';

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    /**
     * Whether it is a `.then()`
     *
     * @param {Node} node - AST node
     * @return {boolean}
     */
    function checkIsThenNode(node) {
      return node
        && node.type === 'CallExpression'
        && node.callee.type === 'MemberExpression'
        && node.callee.property.name === 'then';
    }

    /**
     * Whether it is a callback function of `then`
     *
     * @param {Node} node - AST node
     * @param {boolean} requireParam - whether the callback function requires parameters.
     * @return {boolean}
     */
    function checkIsCallback(node, requireParam) {
      return node
        && (node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression')
        && (!requireParam || node.params.length > 0);
    }

    /**
     * Given a `.then()`, find the previous `.then()`
     *
     * @param {CallExpression} node - the given `.then()`
     * @return {CallExpression|null} the previous `.then()`
     */
    function findPrevThenNode(node) {
      if (node && checkIsThenNode(node.callee.object)) {
        return node.callee.object;
      } else {
        return null;
      }
    }

    /**
     * Whether a statement is able to "returns" something defined.
     *
     * @param {object} options
     * @param {Statement} options.statement
     * @param {Node} options.parent - parent node of the statement
     * @param {number} [options.depth=0] - depth of the recursion
     * @return {boolean}
     */
    function shouldReturnSomething({ statement, parent, depth = 0 }) {
      if (!statement) {
        return false;
      }

      // whether the statement can return something.
      let returnable = false;
      depth++;

      if (/Expression|Literal|Identifier/.test(statement.type)) {
        returnable = depth === 1;
      } else if (/ReturnStatement/.test(statement.type)) {
        returnable = true;
      }

      switch (statement.type) {
        case 'ReturnStatement':
          if (!statement.argument) {
            // `return;`
            context.report({
              node: statement,
              message: ERR_RETURN_UNDEFINED,
            });
          } else {
            // otherwise check recursively.
            returnable |= shouldReturnSomething({
              statement: statement.argument,
              parent: statement,
              depth,
            });
          }
          break;
        case 'CallExpression':
          // whether the call expression is another `.then()`
          if (parent.type === 'ReturnStatement' && checkIsThenNode(statement) && checkIsCallback(statement.arguments[0], false)) {
            returnable |= shouldReturnSomething({
              statement: statement.arguments[0].body,
              parent: statement,
              depth: 0, // We should reset depth incase of something like `() => () => () => value`
            });
          }
          break;
        case 'BlockStatement':
          statement.body.forEach((stmt) => {
            returnable |= shouldReturnSomething({
              statement: stmt,
              parent: statement.body,
              depth,
            });
          });
          break;
        case 'WhileStatement':
        case 'DoWhileStatement':
        case 'ForStatement':
        case 'ForInStatement':
        case 'ForOfStatement':
          returnable |= shouldReturnSomething({
            statement: statement.body,
            parent: statement,
            depth,
          });
        case 'IfStatement':
          returnable |= shouldReturnSomething({
            statement: statement.consequent,
            parent: statement,
            depth,
          });
          returnable |= shouldReturnSomething({
            statement: statement.alternate,
            depth,
          });
          break;
        case 'SwitchStatement':
          statement.cases.forEach((caseNode) => {
            caseNode.consequent.forEach((stmt) => {
              returnable |= shouldReturnSomething({
                statement: stmt,
                parent: caseNode,
                depth,
              });
            });
          });
          break;
        case 'TryStatement':
          returnable |= shouldReturnSomething({
            statement: statement.block,
            parent: statement,
            depth,
          });
          break;
        default:
          break;
      }

      if (depth === 1 && !returnable) {
        context.report({
          node: parent,
          message: ERR_NO_RETURN,
        });
      }

      return returnable;
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      CallExpression: function(node) {
        if (checkIsThenNode(node) && checkIsCallback(node.arguments[0], true)) {
          const prev = findPrevThenNode(node);
          if (checkIsThenNode(prev) && checkIsCallback(prev.arguments[0], false)) {
            shouldReturnSomething({
              statement: prev.arguments[0].body,
              parent: prev.arguments[0],
            });
          }
        }
      },
    };
  },
};
