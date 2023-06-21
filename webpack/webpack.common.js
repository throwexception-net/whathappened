const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");

module.exports = {
  entry: {
    popup: path.join(srcDir, 'popup.tsx'),
    options: path.join(srcDir, 'options.tsx'),
    background: path.join(srcDir, 'background/index.ts'),
    content_script: path.join(srcDir, 'content_script.tsx'),
    injected_script: path.join(srcDir, 'injected_script.ts'),
    interceptors: path.join(srcDir, 'interceptors/index.ts'),
    preview: path.join(srcDir, 'preview.tsx'),
  },
  output: {
    path: path.join(__dirname, "../dist/js"),
    filename: "[name].js",
  },
  optimization: {
    splitChunks: {
      name: "vendor",
      chunks(chunk) {
        return chunk.name !== 'background' && chunk.name !== 'injected_script'
      }
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{from: ".", to: "../", context: "public"}],
      options: {},
    }),
  ],
};
