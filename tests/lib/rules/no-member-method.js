'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../lib/rules/no-member-method');

const RuleTester = require('eslint').RuleTester;

RuleTester.setDefaultConfig({
  parserOptions: {
    ecmaVersion: 6
  },
  parser: 'babel-eslint',
});

const ERR_MSG = 'don\'t use class member method';


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();
ruleTester.run('no-member-method', rule, {
  valid: [
    {
      code: `
        class abc {
          method = () => {};
        }
      `,
    },
    {
      code: `
        class abc {
          static method () {}
        }
      `
    },
    {
      code: `
        class constructor {
          static method () {}
        }
      `
    },
  ],
  invalid: [
    {
      code: `
        class abc {
          method () {};
        }
      `,
      errors: [{
        message: ERR_MSG,
      }],
      output: `
        class abc {
          method = () => {};
        }
      `
    },
    {
      code: `
        class abc {
          method (a, b) {
            console.log(a, b);
            return b;
          }
        }
      `,
      errors: [{
        message: ERR_MSG,
      }],
      output: `
        class abc {
          method = (a, b) => {
            console.log(a, b);
            return b;
          };
        }
      `
    },
    {
      code: `
        class abc {
          method (a, b) {
            console.log(a, b);
            return (b) => {
              return b;
            };
          }
        }
      `,
      errors: [{
        message: ERR_MSG,
      }],
      output: `
        class abc {
          method = (a, b) => {
            console.log(a, b);
            return (b) => {
              return b;
            };
          };
        }
      `
    },
  ],
});
