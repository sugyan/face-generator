/* eslint-env node */

const webpack = require('webpack');

const config = {
    entry: './src/js/main.jsx',
    output: {
        path: './static/js',
        publicPath: '/static/js',
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ['es2015', 'react']
                }
            }
        ]
    },
    devServer: {
        proxy: {
            '/api/*': {
                target: 'http://localhost:' + (process.env.PORT || 5000)
            }
        }
    }
};

if (process.env.NODE_ENV === 'production') {
    config.plugins = [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ];
}

module.exports = config;
