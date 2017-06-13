var path = require('path');
var webpack = require('webpack');
var WebpackBuildNotifierPlugin = require('webpack-build-notifier');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const PATHS = {
  src: path.join(__dirname, './src'),
  build: path.join(__dirname, './dist')
};

module.exports = {

  entry: {
    'wonder': PATHS.src + '/wonder.ts'
  },
  output: {
    path: PATHS.build,
    filename: '[name].js',
    library: 'Wonder',
    libraryTarget: 'umd'
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
    new WebpackBuildNotifierPlugin()
  ]
};
