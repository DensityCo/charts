const path = require('path');

const jsonImporter = require('@density/node-sass-json-importer');

// Webpack config
module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            },
          },
          {
            loader: 'sass-loader',
            // Apply the JSON importer via sass-loader's options.
            options: {
              importer: jsonImporter,
            },
          },
        ],
        include: path.resolve(__dirname, '../'),
      },
    ],
  },
};
