module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'ReactTruncateMarkup',
      externals: {
        react: 'React',
      },
    },
  },
  karma: {
    testFiles: ['__tests__/browser.js', '__tests__/utils.js'],
  },
};
