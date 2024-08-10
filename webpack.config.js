const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: './src/scripts/init.js',
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, './docs'),
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
                test: /\.(png|jpe?g|gif|ico)$/i,
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
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer']
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            inject: 'head',
        }),
    ],
    resolve: {
        fallback: {
            buffer: require.resolve('buffer/')
        }
    },
    mode: 'production',
    // mode: 'development',
    // devtool: 'source-map',
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
        splitChunks: {
            chunks: 'all', // 分割所有类型的代码
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
                metadata: {
                    test: /[\\/]lib[\\/]png-metadata\.js$/,
                    name: 'metadata',
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