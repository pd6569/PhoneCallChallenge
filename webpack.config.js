/**
 * Created by peter on 01/09/2017.
 */

/**
 * Created by peter on 22/05/2017.
 */

/**
 * Created by peter on 11/05/2017.
 */

const path = require('path');
const webpack = require('webpack');

module.exports = {

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                include: path.resolve('./src'),
                loader: 'babel-loader',
            },

        ],
    },

    entry: path.resolve('./src/app.js'),

    output: {
        filename: './dist/bundle.js',
    },

    devtool: 'source-map',

    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        })
    ]

};
