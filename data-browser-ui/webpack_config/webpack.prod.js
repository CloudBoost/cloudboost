const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack')
const merge = require('webpack-merge');
const devConfig = require('./webpack.dev');

const config = merge(devConfig, {
  plugins: [
    new UglifyJSPlugin({
        compress: {
            warnings: false,
        },
        output: {
            comments: false,
        },
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': JSON.stringify('production')
        }
    })
  ]
});

module.exports = config;
