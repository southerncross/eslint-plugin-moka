module.exports = {
  meta: {
    type: 'suggestion',
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
        if (node.type === 'JSXElement' && node.openingElement.name.name === 'Trans') {
          return true;
        } else {
          node = node.parent;
        }
      }
      return false;
    };

    const hasChineseWords = (node) => {
      if (!node) {
        return false;
      }

      switch (node.type) {
        case 'Literal':
          return /[\u4e00-\u9fa5]/.test(node.value);
        case 'TemplateLiteral':
          return node.quasis.some((x) => /[\u4e00-\u9fa5]/.test(x.value.raw));
        default:
          return false;
      }
    };

    const isDisplayAttribute = (node) => {
      if (!node) {
        return false;
      }

      switch (node.name.name) {
        case 'tooltip':
        case 'title':
          return true;
        default:
          return false;
      }
    }

    const isLogMessage = (node) => {
      if (!node) {
        return false;
      }

      switch (node.type) {
        case 'MemberExpression':
          // log.info('xxx')
          return node.object.name === 'log';
        default:
          return false;
      }
    };

    const isEqualOperator = (node) => {
      if (!node) {
        return false;
      }

      return node.operator === '===' || node.operator === '==' || node.operator === '!==' || node.operator === '!=';
    };

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      Literal: function(node) {
        if (typeof node.value !== 'string' || !hasChineseWords(node)) {
          return true;
        }

        if (node.parent.type === 'CallExpression' && (
          isI18nMethod(node.parent.callee, ['_', 'i18nMark']) ||
          isLogMessage(node.parent.callee)
        )) {
          // i18n.t, i18n._, i18nMark('xxx')
          return true;
        }

        if (node.parent.type === 'NewExpression' && node.parent.callee.name === 'Error') {
          // new Error('xxx)
          return true;
        }

        if (node.parent.type === 'Property' && (
          isI18nMethod(node.parent.parent.parent.callee, ['plural']) ||
          isLogMessage(node.parent.parent.parent.callee)
        )) {
          // i18n.plural({ value: count, other: '等#人' })
          return true;
        }

        if (node.parent.type === 'JSXElement' && insideTrans(node.parent)) {
          // <Trans>你好</Trans>
          return true;
        }

        if (node.parent.type === 'JSXAttribute' && !isDisplayAttribute(node.parent)) {
          // <div className="xxx"></div>
          // 如果attribute作为展示的string,这里是检测不出来的
          // 但如果attribute是tooltip等涉及展示的,还是需要处理的
          return true;
        }

        if (node.parent.type === 'ImportDeclaration') {
          // import React from 'react'
          return true;
        }

        if (node.parent.type === 'BinaryExpression' && isEqualOperator(node.parent)) {
          // if (status === '你好')
          // 这种是不需要翻译的
          return true;
        }

        context.report({
          node,
          message: ERR_MSG,
        });
      },
      TemplateLiteral: function(node) {
        if (!hasChineseWords(node)) {
          return true;
        }

        if (node.parent.type === 'CallExpression' && isLogMessage(node.parent.callee)) {
          return true;
        }

        if (node.parent.type === 'TaggedTemplateExpression' && (
          isI18nMethod(node.parent.tag, ['t']) ||
          isLogMessage(node.parent.callee)
        )) {
          return true;
        }

        context.report({
          node,
          message: ERR_MSG,
        });
      },
    };
  },
};
