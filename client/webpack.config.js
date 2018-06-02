const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const bundleAnalyzerParms = {analyzerMode: 'static'};

module.exports = {
  entry: ['./src/index.js'],
  devtool: 'inline-source-map',
  output: {
    filename: 'bundle.js',
  },
  watch: true,
  devServer: {
    contentBase: './src',
    compress: true,
   // port: 9000,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [require('@babel/plugin-proposal-object-rest-spread')]
          },
        },
      },
      {
        test: /\.css$/,
        use:['style-loader','css-loader']
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i, 
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['babel-preset-env'],
            plugins: [require('babel-plugin-transform-object-rest-spread')],
          },
//          loader: 'url?limit=10000!img?progressive=true'
        },
      },
    ],
  },
  plugins: [
    //new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('production') }),
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  //          new BundleAnalyzerPlugin(bundleAnalyzerParms)
  ],
// optimization: {
//         splitChunks: {
//             cacheGroups: {
//                 commons: {
//                     test: /[\\/]node_modules[\\/]/,
//                     name: 'vendor',
//                     chunks: 'all'
//                 }
//             }
//         }
//     },
};
