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
};
