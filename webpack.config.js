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
    wonder: PATHS.src + '/wonder'
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
  externals: {
    MessagingStub: 'MessagingStub'

    //MessagingStub: /^(http|ftp|https):\/\/.*\.js/
        /*function(context, request, callback) {
      if (/^(http|ftp|https):\/\/.*.js/.test(request)){
        console.log(request);
        return callback(null, 'commonjs ' + request);
      }
      callback();
    }*/
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
    new WebpackBuildNotifierPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ]
};
