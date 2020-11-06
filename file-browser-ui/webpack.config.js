var path = require('path');
var webpack = require('webpack');
module.exports = {
    entry: ['./dev/js/index.js'],
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
                test: /\.json$/,
                loader: "json-loader"
            },
            {
                test: /\.scss/,
                loaders: ["style-loader", "css-loader", "sass-loader"]
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
                    plugins: ['react-html-attrs', 'transform-decorators-legacy', 'transform-class-properties']
                }
            }
        ]
    },
    output: {
        path: '',
        filename: 'src/js/bundle.min.js'
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
