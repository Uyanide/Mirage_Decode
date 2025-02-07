const { merge } = require('webpack-merge');
const common = require('./webpack.config.js');
const HtmlinlineScriptPlugin = require('html-inline-script-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = merge(common, {
    entry: './src/scripts/entries/offline.js',
    mode: 'production',
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, './page'),
        publicPath: '',
    },
    plugins: [new HtmlinlineScriptPlugin()],
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
});
