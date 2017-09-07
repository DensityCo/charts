const path = require('path');

// module.exports = {
//   module: {
//     rules: [
//       {
//         test: /\.scss$/,
//         loaders: ["style-loader", "css-loader", "sass-loader"],
//         include: path.resolve(__dirname, '../')
//       }
//     ]
//   }
// }


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
          },
        ],
        include: path.resolve(__dirname, '../'),
      },
    ],
  },
};
