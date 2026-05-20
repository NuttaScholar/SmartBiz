module.exports = {
  mode: "development",
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: "tsconfig.spec.json",
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
};
