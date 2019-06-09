'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../lib/rules/no-jsx-spread-attribute');

const RuleTester = require('eslint').RuleTester;

RuleTester.setDefaultConfig({
  parserOptions: {
    ecmaVersion: 6,
    ecmaFeatures: {
      jsx: true,
    },
  },
});

const ERR_MSG = 'Spread attribute is not allowed in jsx element.';


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();
ruleTester.run('no-jsx-spread-attribute', rule, {

    valid: [
        {
            code: '<ChildComponent prop={this.props}/>',
        },
    ],

    invalid: [
        {
            code: '<ChildComponent {...this.props}/>',
            errors: [{
                message: ERR_MSG,
            }],
        },
    ],
});
