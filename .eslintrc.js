module.exports = {
  extends: ['airbnb', 'prettier', 'prettier/react'],
  parser: 'babel-eslint',
  env: {
    browser: true,
    es6: true,
  },
  settings: {
    ecmascript: 6,
    jsx: true,
  },
  rules: {
    'no-underscore-dangle': 0,
    'no-return-assign': [2, 'except-parens'],

    'react/prefer-stateless-function': 0,
    'react/jsx-filename-extension': 0,
  },
};
