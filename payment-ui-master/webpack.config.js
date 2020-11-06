var path = require('path');
var webpack = require('webpack');
module.exports = {
    entry: ['./src/index.js'],
    module: {
        preLoaders: [
            {
                test: /\.js?$/,
                loader: 'eslint',
                exclude: /node_modules/
            }
        ],
        loaders: [
            {
                test: /\.scss/,
                loader: 'style-loader!css-loader!sass-loader'
            }, {
                test: /\.css/,
                loader: 'style-loader!css-loader!sass-loader'
            }, {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: [
                        'react', 'es2015', 'stage-0'
                    ],
                    plugins: ['transform-decorators-legacy', 'transform-class-properties']
                }
            }
        ]
    },
    output: {
        path: '',
        filename: 'dist/index.js'
    },
    plugins: [],
    node: {
        fs: "empty"
    },
    resolve: {
        alias: {
            react: path.resolve('./node_modules/react'),
            'material-ui': path.resolve('./node_modules/material-ui')
        }
    }
};
