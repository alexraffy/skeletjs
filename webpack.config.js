
const webpack = require("webpack");
const path = require('path');

module.exports = {
    mode: "production",
    entry: './build/index.js',
    output: {
        filename: 'skelet.min.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'var',
        library: 'skelet',
    },
    externals: {
        "mentatjs": "var mentatjs",
        "typescript": "typescript",
        "flowbreaker": "flowbreaker"

    },
    resolve: {
        fallback: {
            "url": require.resolve("url/"),
            "path": require.resolve("path-browserify"),
            "http": require.resolve("stream-http"),
            "https": require.resolve("https-browserify")
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
    ],
    optimization: {
        minimize: false
    },

};