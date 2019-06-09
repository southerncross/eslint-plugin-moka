module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Forbid jsx spread attribute for better static analysis.',
      category: 'Possible Errors',
      recommended: true,
    },
    fixable: null,
    schema: [],
  },

  create: function(context) {

    // variables should be defined here

    const ERR_MSG = 'Spread attribute is not allowed in jsx element.';

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      JSXOpeningElement: function(node) {
        node.attributes.forEach((attr) => {
          if (attr.type === 'JSXSpreadAttribute') {
            context.report({
              node: attr,
              message: ERR_MSG,
            });
          }
        });
      },
    };
  },
};
