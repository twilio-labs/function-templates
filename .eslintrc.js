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
    'prettier/prettier': 'allow',
    'import/no-extraneous-dependencies': 'allow',
    'no-console': 0,
    'sonarjs/no-duplicate-string': 'allow',
    'sonarjs/no-identical-functions': 'allow',
    'func-names': 0,
    'global-require': 0,
    'no-shadow': 0,
    'import/order': 'allow',
    'max-classes-per-file': 0,
  },
};
