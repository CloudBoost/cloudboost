var webpack = require('webpack')
console.log(process.env['CLOUDBOOST_HOSTED'])

var config = {
    entry: './src/ACL.js',

    output: {
        path: './dist',
        filename: 'acl.js',
        libraryTarget: "umd"
    },
    externals: {
        'react': 'commonjs react',
        'react-dom': 'commonjs react-dom',
        'material-ui': 'commonjs material-ui',
        'react-bootstrap': 'commonjs react-bootstrap',
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loaders: ["style-loader", "css-loader"]
            },
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    cacheDirectory: true,
                    plugins: ['transform-decorators-legacy', "transform-class-properties"],
                    presets: ['es2015', 'react', "stage-0"]
                }
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
            output: {
                comments: false,
            },
        }),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        })
    ]
}

module.exports = config;