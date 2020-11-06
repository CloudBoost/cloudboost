const config = {
  entry: './public/app/main.js',
  devtool: 'source-map',
  output: {
    path: './',
    filename: 'public/index.min.js'
  },
  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: "json-loader"
      },
      {
        test: /\.scss$/,
        loaders: ["style-loader", "css-loader", "sass-loader"]
      }, {
        test: /\.css$/,
        loaders: ["style-loader", "css-loader"]
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
          plugins: [
              'transform-decorators-legacy',
              "transform-class-properties"
          ],
          presets: ['es2015', 'react', "stage-0"]
        }
      }
    ]
  }
}

module.exports = config;
