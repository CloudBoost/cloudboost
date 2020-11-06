var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var webpack = require('webpack');

var config = {
  entry: './app/index.js',

  output: {
    path: './',
    filename: 'public/client.min.js'
  },
  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader']
      }, {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader']
      }, {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
          plugins: [
            'transform-decorators-legacy',
            'transform-class-properties'
          ],
          presets: ['es2015', 'react', 'stage-0']
        }
      }, {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
          plugins: [
            'transform-decorators-legacy',
            'transform-class-properties'
          ],
          presets: ['es2015', 'react', 'stage-0']
        }
      }
    ]
  },
  plugins: [
    new UglifyJSPlugin({
      compress: {
        warnings: false
      },
      output: {
        comments: false
      }
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ]
};

module.exports = config;
