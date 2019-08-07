module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Forbid assigning variables to global object.',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
  },

  create: function(context) {

    // variables should be defined here

    const ERR_MSG = 'You may not want to assign variable to window/global.';

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      AssignmentExpression: function(node) {
        if (node.left.type === 'MemberExpression' && (
          node.left.object.name === 'window' || node.left.object.name === 'global')
        ) {
          context.report({
            node,
            message: ERR_MSG,
          });
        }
      },
    };
  },
};
