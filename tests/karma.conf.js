var webpackConfiguration = require("../webpack.config.js");

module.exports = function (config) {
  config.set({
    basePath: '../',
    webpack: webpackConfiguration,
    browsers: ['Firefox', 'Chrome'],
    client: {
      captureConsole: true,
      mocha: {'ui': 'tdd'}
    },
    externals: {
      // Stubs out `import ... from 'three'` so it returns `import ... from window.THREE` effectively using THREE global variable that is defined by AFRAME.
      three: 'THREE'
    },
    envPreprocessor: ['TEST_ENV'],
    files: [
      {pattern: 'tests/**/*.test.js'}
    ],
    frameworks: ['mocha', 'sinon-chai', 'chai-shallow-deep-equal', 'webpack'],
    preprocessors: {'tests/**/*.js': ['webpack', 'env']},
    reporters: ['mocha']
  });
};
