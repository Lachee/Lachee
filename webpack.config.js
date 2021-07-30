const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


module.exports = (env) => {
  return {
    entry: './src/index.js',
    output: {
      filename: 'app.js',
      path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
      alias: {
        'images': '/images'
      }
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.ya?ml$/,
          type: 'json', // Required by Webpack v4
          use: { loader: 'yaml-loader' }
        },
        {
          test: /\.(png)|(jpe?g)|(gif)$/i,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 100,
                name: '../images/[name].[ext]',
              }
            }
          ]
        },
        {
          test: /\.m?jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: [
                "@babel/plugin-proposal-class-properties",
                "@babel/plugin-proposal-private-methods",
                '@babel/plugin-transform-runtime'
              ]
            },
          }
        },
        {
          test: /\.s?[ac]ss$/i,
          use: [
            MiniCssExtractPlugin.loader,
            { loader: 'css-loader' },
            { 
              loader: 'sass-loader', 
              options: { 
                sourceMap: !env.production,
                additionalData: (content, loaderContext) => {
                  
                  // Define the variables
                  let variables = {};
                  
                  // Add some variables
                  const PROFILE_IMAGE = env.PROFILE_IMAGE || process.env.PROFILE_IMAGE;
                  if (PROFILE_IMAGE) 
                    variables['profile-image-url'] = `'${PROFILE_IMAGE}'`;
                  
                  // Build the new content
                  for(const key in variables) 
                    content = `$${key}: ${variables[key]};\n${content}`;
                  
                  // Return
                  return content;
                }
              } 
            },
          ]
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
          use: [{ loader: 'file-loader', options: { name: 'fonts/[name].[ext]' } }]
        },
      ]
    },
    plugins: [
      new webpack.WatchIgnorePlugin({ paths: [/node_modules/, /images/] }),
      new MiniCssExtractPlugin({
        filename: 'app.css',
        chunkFilename: 'app.[name].css',
      }),
    ],
  };
};