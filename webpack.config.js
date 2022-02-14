const dotenv       = require('dotenv');
const dotenvResult = dotenv.config();

const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Map the variables to keys
const defineVariables = { 'process.env': JSON.stringify(dotenvResult.parsed) };
for(let key in dotenvResult.parsed) {
  defineVariables[`process.env.${key}`] = JSON.stringify(dotenvResult.parsed[key]);
}

const DIST_DIR = dotenvResult && dotenvResult.parsed['OUTPUT_DIR'] ? dotenvResult.parsed['OUTPUT_DIR'] : 'build';

module.exports = (env) => {
  return {
    entry: './src/index.js',
    output: {
      filename: 'app.js',
      path: path.resolve(__dirname, `${DIST_DIR}/dist`),
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

                  const HIDE_PRIDE = env.HIDE_PRIDE || process.env.HIDE_PRIDE;
                  if (HIDE_PRIDE)
                    variables['hide-pride'] = 'true';

                  const HIDE_SKILLS = env.HIDE_SKILLS || process.env.HIDE_SKILLS;
                  if (HIDE_SKILLS)
                    variables['hide-skills'] = 'true';

                  const HIDE_PLATFORMS = env.HIDE_PLATFORMS || process.env.HIDE_PLATFORMS;
                  if (HIDE_PLATFORMS)
                    variables['hide-platforms'] = 'true';

                  const EMAIL = env.EMAIL || process.env.EMAIL;
                  if (EMAIL)
                    variables['email-address'] = `'${EMAIL}'`;

      

                  // Build the new content
                  for (const key in variables)
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
    optimization: {
      minimize: env.production,
    },
    plugins: [
      new webpack.WatchIgnorePlugin({ paths: [/node_modules/, /images/] }),
      new webpack.DefinePlugin(defineVariables),
      new MiniCssExtractPlugin({
        filename: 'app.css',
        chunkFilename: 'app.[name].css',
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'images', to: `../images` },
          { from: 'index.html', to: `../index.html`}
        ]
      })
      // new HtmlWebpackPlugin({
      //   filename: '../index.html',
      //   template: 'src/index.html',
      //   email:    env.EMAIL,
      //   phone:    env.phone
      // })
    ],
  };
};