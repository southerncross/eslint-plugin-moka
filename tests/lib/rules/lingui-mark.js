'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../lib/rules/lingui-mark');

const RuleTester = require('eslint').RuleTester;

RuleTester.setDefaultConfig({
  parserOptions: {
    ecmaVersion: 6,
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: 'module',
  },
});

const ERR_MSG = 'You may forget translate raw string with i18n.';


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();
ruleTester.run('lingui-mark', rule, {

  valid: [
    {
      code: 'i18n.t`你好`',
    },
    {
      code: "i18n._('你好')",
    },
    {
      code: "i18nMark('你好')",
    },
    {
      code: "i18n.plural({ value: count, other: '等#人' })",
    },
    {
      code: '<Trans>欢迎加入<a href="www.mokahr.com">我们</a></Trans>',
    },
    {
      code: '<div className="table"></div>',
    },
    {
      code: "import React from 'react'",
    },
    {
      code: 'const a = true',
    },
    {
      code: "db('').select('*').from('applications').where('archived', true);",
    },
    {
      code: '<div tooltip={i18n.t`你好`}></div>',
    },
    {
      code: "log.info('你好')",
    },
    {
      code: "log.error(new Error('你好'), { value: 1 })",
    },
    {
      code: "log.info(`你好`)",
    },
    {
      code: "if (status === '你好') { success = true; }",
    },
  ],

  invalid: [
    {
      code: '\'你好\'',
      errors: [{
        message: ERR_MSG,
      }],
    },
    {
      code: '"你好"',
      errors: [{
        message: ERR_MSG,
      }],
    },
    {
      code: '`你好`',
      errors: [{
        message: ERR_MSG,
      }],
    },
    {
      code: '<div>你好</div>',
      errors: [{
        message: ERR_MSG,
      }],
    },
    {
      code: '<div tooltip="你好"></div>',
      errors: [{
        message: ERR_MSG,
      }],
    },
    {
      code: '<Modal title="你好"></Modal>',
      errors: [{
        message: ERR_MSG,
      }],
    },
    {
      code: "httpErrors.BadRequestError('你好')",
      errors: [{
        message: ERR_MSG,
      }],
    },
  ],
});
