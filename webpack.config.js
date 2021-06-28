"use strict";
const path = require("path");

const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");

const isDev = process.env["NODE_ENV"] === "development";

const root = path.resolve(__dirname);

const PATHS = {
  appPackageJson: path.resolve(root, "package.json"),
  appSrc: path.resolve(root, "./src"),
  appDist: path.resolve(root, "./dist"),
  nodeModules: path.resolve(root, "./node_modules"),
};

const PUBLIC_URL_PATH = "/";

console.log("Webpack build", isDev ? "[development]" : "[production]");

module.exports = {
  mode: isDev ? "development" : "production",

  devtool: "source-map",

  devServer: {
    contentBase: PATHS.appDist,
    hot: isDev,
    historyApiFallback: true,
  },

  entry: {
    client: [path.join(PATHS.appSrc, "./index.tsx")],
  },

  output: {
    filename: "[name].[fullhash].bundle.js",
    path: PATHS.appBuild,
    publicPath: isDev ? "/" : PUBLIC_URL_PATH,
  },

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".json"],
    alias: {
      "@": PATHS.appSrc,
    },
  },

  module: {
    rules: [
      // Process source maps in input sources
      //  All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: "pre",
        test: /\.(jsx?|tsx?)$/,
        loader: "source-map-loader",
        include: [/src\/.+\.tsx?/],
      },

      {
        test: /\.tsx?$/,
        use: ["ts-loader"],
      },

      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },

      {
        test: /\.(woff|woff2)$/,
        use: {
          loader: "url-loader",
          options: {
            name: "fonts/[hash].[ext]",
            limit: 5000,
            mimetype: "application/font-woff",
          },
        },
      },
      {
        test: /\.(ttf|eot|svg)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "fonts/[fullhash].[ext]",
          },
        },
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(isDev ? "development" : "production"),
      },
    }),

    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(PATHS.appSrc, "index.ejs"),
    }),
  ],

  optimization: {
    runtimeChunk: true,
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        npm: {
          test: /node_modules/,
          name: (mod) => {
            const relToModule = path.relative(PATHS.nodeModules, mod.context);
            const moduleName = relToModule.substring(
              0,
              relToModule.indexOf(path.sep),
            );
            return `npm.${moduleName}`;
          },
        },
      },
    },
  },
};
