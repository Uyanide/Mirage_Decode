const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
// const HtmlinlineScriptPlugin = require('html-inline-script-webpack-plugin');

module.exports = {
    entry: './src/scripts/init.js',
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, './docs'),
        publicPath: '',
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
                        plugins: ['@babel/plugin-syntax-dynamic-import'],
                    },
                },
            },
            {
                test: /\.(png|jpe?g)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]',
                        },
                    },
                ],
            },
            {
                test: /\.ico$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            name: '[name].[hash].[ext]',
                        },
                    },
                ],
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            inject: 'head',
            scriptLoading: 'defer',
        }),
        // new HtmlinlineScriptPlugin(),
    ],
    resolve: {
        fallback: {
            buffer: require.resolve('buffer/'),
        },
    },
    mode: 'production',
    // mode: 'development',
    // devtool: 'source-map',
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                },
                piexif: {
                    test: /[\\/]lib[\\/]piexif\.js$/,
                    name: 'piexif',
                    chunks: 'all',
                },
                jpegEncoder: {
                    test: /[\\/]lib[\\/]encoder\.js$/,
                    name: 'jpegEncoder',
                    chunks: 'all',
                },
            },
        },
    },
    devServer: {
        static: {
            directory: path.join(__dirname, './docs'),
        },
        compress: true,
        port: 9000,
    },
};
