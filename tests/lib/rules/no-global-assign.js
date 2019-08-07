'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../lib/rules/no-global-assign');

const RuleTester = require('eslint').RuleTester;

RuleTester.setDefaultConfig({
  parserOptions: {
    ecmaVersion: 6,
  },
});

const ERR_MSG = 'You may not want to assign variable to window/global.';


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();
ruleTester.run('no-global-assign', rule, {
  valid: [
    {
      code: 'const a = 123;',
    },
  ],

  invalid: [
    {
      code: 'window.test = 123;',
      errors: [{
        message: ERR_MSG,
      }],
    },
    {
      code: 'global.test = 123;',
      errors: [{
        message: ERR_MSG,
      }],
    },
  ],
});
