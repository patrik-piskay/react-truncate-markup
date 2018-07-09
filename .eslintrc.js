module.exports = {
  extends: ['airbnb', 'prettier', 'prettier/react'],
  parser: 'babel-eslint',
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  settings: {
    ecmascript: 6,
    jsx: true,
  },
  rules: {
    'no-underscore-dangle': 0,
    'no-return-assign': [2, 'except-parens'],
    'newline-before-return': 2,
    'no-nested-ternary': 0,
    'import/no-extraneous-dependencies': [
      2,
      { devDependencies: ['demo/**/*.js', '__tests__/**/*.js'] },
    ],

    'react/prefer-stateless-function': 0,
    'react/jsx-filename-extension': 0,
    'react/no-array-index-key': 0,
    'react/no-danger': 0,
    'react/sort-comp': 0,

    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-static-element-interactions': 0,
  },
};
