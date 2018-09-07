//This webpack file is used to package SDK. It's NOT used for the server.

var webpack = require('webpack');
var config = [{
    entry: './sdk/src/entry.js',
    output: {
        path: './sdk/dist',
        filename: 'cloudboost.js',
        library: "cloudboost",
        libraryTarget: 'umd',
        umdNamedDefine: true,

    },
    externals: {
        IO: "socket.io-client",
        Axios: "axios"
    },
    module: {
        noParse: /node_modules\/localforage\/dist\/localforage.js/,
        loaders: [
            { test: /\.json$/, loader: 'json' },
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ["es2015-without-strict"],
                    compact: false
                }
            }
        ]
    },
    plugins: []
}, {
    entry: './sdk/src/entry.js',
    output: {
        path: './sdk/dist',
        filename: 'cloudboost.min.js',
        library: "cloudboost",
        libraryTarget: 'umd',
        umdNamedDefine: true,

    },
    externals: {
        IO: "socket.io-client",
        Axios: "axios"
    },
    module: {
        noParse: /node_modules\/localforage\/dist\/localforage.js/,
        loaders: [
            { test: /\.json$/, loader: 'json' },
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ["es2015-without-strict"],
                    compact: false
                }
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
            mangle: false,
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
}];

module.exports = config;