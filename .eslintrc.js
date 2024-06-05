module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: 'twilio',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'prettier/prettier': 0,
    'import/no-extraneous-dependencies': 0,
    'no-console': 0,
    'sonarjs/no-duplicate-string': 0,
    'sonarjs/no-identical-functions': 0,
    'func-names': 0,
    'global-require': 0,
    'no-shadow': 0,
    'import/order': 0,
    'max-classes-per-file': 0,
  },
};
