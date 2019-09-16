module.exports = {
  extends: ['react-app', 'prettier', 'prettier/react'],
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
    'no-return-assign': [2, 'except-parens'],
    'newline-before-return': 2,
    'import/no-extraneous-dependencies': [
      2,
      { devDependencies: ['demo/**/*.js', '__tests__/**/*.js'] },
    ],
  },
};
