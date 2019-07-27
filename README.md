# eslint-plugin-moka

Eslint Plugin of Moka

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-moka`:

```
$ npm install eslint-plugin-moka --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-moka` globally.

## Usage

Add `moka` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "moka"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "moka/rule-name": 2
    }
}
```

## Supported Rules

* promise-return - Remind you to return something defined when the next promise chain needs parameters.

  ```js
  .then(() => {
    // not allowed (forget to return a value)
  })
  .then((result)) => {
  })
  ```

* no-jsx-spread-attribute - Forbid spread attribute in jsx element for better static anslysis.

  ```js
  <MyComponent {...this.props}/> // not allowed (using spread attribute)
  ```

* lingui-mark - Non-i18n string detector

  ```js
  const message = '你好世界' // Non-i18n string is detected
  ```
