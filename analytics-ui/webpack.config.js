var path = require('path');
var webpack = require('webpack');
module.exports = {
    entry: ['./dev/js/index.js'],
    module: {
        // preLoaders: [
        //     {
        //         test: /\.js?$/,
        //         loader: 'eslint',
        //         exclude: /node_modules/
        //     }
        // ],
        loaders: [
            {
              test: /\.scss$/,
              loaders: ['style-loader', 'css-loader', 'sass-loader']
            }, {
              test: /\.css$/,
              loaders: ['style-loader', 'css-loader']
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
            }, {
                test: /\.js?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: [
                        'react', 'es2015', 'stage-0'
                    ],
                    plugins: ['react-html-attrs', 'transform-decorators-legacy', 'transform-class-properties']
                }
            }, {
                test: /\.(png|jpg|jpeg)$/,
                loader: 'url-loader'
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
    }
};
