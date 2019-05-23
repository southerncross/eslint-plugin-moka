'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../lib/rules/promise-return');

const RuleTester = require('eslint').RuleTester;

RuleTester.setDefaultConfig({
    parserOptions: {
        ecmaVersion: 6,
    },
});

const ERR_NO_RETURN = 'You may forget to return something since the next promise chain needs parameters.';
const ERR_RETURN_UNDEFINED = 'You may want to return something defined since the next promise chain needs parameters.';


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();
ruleTester.run('promise-return', rule, {

    valid: [
        {
            code: 'Promise.resolve().then(() => {}).then(() => {})',
        },
        {
            code: 'Promise.resolve().then(() => { return \'something\'; }).then((result) => {})',
        },
        {
            code: 'Promise.resolve().then(() => foo()).then((result) => {})',
        },
        {
            code: 'Promise.resolve().then(() => 123).then((result) => {})',
        },
        {
            code: 'Promise.resolve().then(() => id).then((result) => {})',
        },
        {
            code: `
            Promise.resolve().then(() => {
                try {
                    return 1;
                } catch (e) {
                    // do nothing
                }
            })
            .then((result) => {})
            `,
        },
    ],

    invalid: [
        {
            code: 'Promise.resolve().then(() => {}).then((result) => {})',
            errors: [{
                message: ERR_NO_RETURN,
            }],
        },
        {
            code: 'Promise.resolve().then(() => { return; }).then((result) => {})',
            errors: [{
                message: ERR_RETURN_UNDEFINED,
            }],
        },
        {
            code: `
            Promise.resolve().then(() => {
                return asyncFunction().then(() => {})
             })
            .then((result) => {})
            `,
            errors: [{
                message: ERR_NO_RETURN,
            }],
        },
        {
            code: `
            Promise.resolve().then(() => {
                return asyncFunction().then(() => {
                    return asyncFunction().then(() => {})
                })
             })
            .then((result) => {
              const a = 123;
            })
            `,
            errors: [{
                message: ERR_NO_RETURN,
            }],
        },
        {
            code: `
            Promise.resolve().then(() => {
                return asyncFunction().then(() => {
                    return asyncFunction().then(() => { return; })
                })
             })
            .then((result) => {})
            `,
            errors: [{
                message: ERR_RETURN_UNDEFINED,
            }],
        },
    ],
});
