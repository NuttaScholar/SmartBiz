const webpackConfig = require("./webpack.config");

module.exports = function configureKarma(config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine"],
    files: [{ pattern: "tests/*.spec.ts" }],
    preprocessors: {
      "tests/*.spec.ts": ["webpack"],
    },
    webpack: webpackConfig,
    reporters: ["progress"],
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ["ChromeHeadless"],
    singleRun: true,
    mime: {
      "text/x-typescript": ["ts", "tsx"],
    },
  });
};
