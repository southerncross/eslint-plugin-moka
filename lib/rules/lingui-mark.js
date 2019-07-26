module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Non-i18n string detector.',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
  },

  create: function(context) {

    // variables should be defined here

    const ERR_MSG = 'You may forget translate raw string with i18n.';

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------
    const isI18nMethod = (node, names = []) => {
      if (!node) {
        return false;
      }

      switch (node.type) {
        case 'MemberExpression':
          // i18n.t, i18n._
          return node.object.name === 'i18n' && names.includes(node.property.name);
        case 'Identifier':
          // i18nMark();
          return names.includes(node.name);
        default:
          return false;
      }
    }

    const insideTrans = (node) => {
      while (node && node.type !== 'ExpressionStatement') {
        console.log('boring >>>> ', node)
        if (node.type === 'JSXElement' && node.openingElement.name.name === 'Trans') {
          return true;
        } else {
          node = node.parent;
        }
      }
      return false;
    };

    const isChoiceMethod = (node) =>
      node === 'MemberExpression' &&
      node.object.name === 'i18n' && (
        node.property.name === 'plural' ||
        node.property.name === 'select' ||
        node.property.name === 'selectOrdinal'
      );

    const isFormatMethod = (node) =>
      node === 'MemberExpression' &&
      node.object.name === 'i18n' && (
        node.property.name === 'date' ||
        node.property.name === 'number'
      );

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      Literal: function(node) {
        if (node.parent.type === 'CallExpression' && isI18nMethod(node.parent.callee, ['_', 'i18nMark'])) {
          // i18n.t, i18n._, i18nMark('xxx')
          return true;
        } else if (node.parent.type === 'Property' && isI18nMethod(node.parent.parent.parent.callee, ['plural'])) {
          // i18n.plural({ value: count, other: '等#人' })
          return true;
        } else if (node.parent.type === 'JSXElement' && insideTrans(node.parent)) {
          // <Trans>你好</Trans>
          return true;
        } else if (node.parent.type === 'JSXAttribute') {
          // <div className="xxx"></div>
          // 如果attribute作为展示的string,这里是检测不出来的
          return true;
        } else {
          context.report({
            node,
            message: ERR_MSG,
          });
        }
      },
      TemplateLiteral: function(node) {
        if (node.parent.type === 'TaggedTemplateExpression' && isI18nMethod(node.parent.tag, ['t'])) {
          return true;
        } else {
          context.report({
            node,
            message: ERR_MSG,
          });
        }
      },
    };
  },
};
