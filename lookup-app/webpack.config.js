const path = require('path');

module.exports = {
    entry: './assets-src/lookup.jsx',
    output: {
        filename: 'lookup-spa-dist.js',
        path: path.resolve(__dirname, 'assets')
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    }
}

