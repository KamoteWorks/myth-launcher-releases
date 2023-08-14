/**
 * Webpack config for production electron main process
 */

import path from 'path';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import * as dotenv from 'dotenv';
import baseConfig from './webpack.config.base';
import webpackPaths from './webpack.paths';
import checkNodeEnv from '../scripts/check-node-env';
import deleteSourceMaps from '../scripts/delete-source-maps';

dotenv.config();

checkNodeEnv('production');
deleteSourceMaps();
const SF_VERSION_URL = process.env.SF_VERSION_URL || 'default_value';
const SF_PATCH_URL = process.env.SF_PATCH_URL || 'default_value';
const SF_MANIFEST_URL = process.env.SF_MANIFEST_URL || 'default_value';
const SF_DELETE_URL = process.env.SF_DELETE_URL || 'default_value';
const SF_LOCAL_VERSION = process.env.SF_LOCAL_VERSION || 'default_value';
const SF_UPDATE_PREFIX = process.env.SF_UPDATE_PREFIX || 'default_value';
const SF_COMMON_PATH = process.env.SF_COMMON_PATH || 'default_value';
const SF_EXECUTABLE = process.env.SF_EXECUTABLE || 'default_value';
const MYTH_GAMES_APIURL = process.env.MYTH_GAMES_APIURL || 'default_value';
const configuration: webpack.Configuration = {
  devtool: 'source-map',

  mode: 'production',

  target: 'electron-main',

  entry: {
    main: path.join(webpackPaths.srcMainPath, 'main.ts'),
    preload: path.join(webpackPaths.srcMainPath, 'preload.ts'),
  },

  output: {
    path: webpackPaths.distMainPath,
    filename: '[name].js',
  },

  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
    ],
  },

  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.ANALYZE === 'true' ? 'server' : 'disabled',
    }),

    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      DEBUG_PROD: false,
      START_MINIMIZED: false,
      SF_VERSION_URL: JSON.stringify(SF_VERSION_URL),
      SF_PATCH_URL: JSON.stringify(SF_PATCH_URL),
      SF_MANIFEST_URL: JSON.stringify(SF_MANIFEST_URL),
      SF_DELETE_URL: JSON.stringify(SF_DELETE_URL),
      SF_LOCAL_VERSION: JSON.stringify(SF_LOCAL_VERSION),
      SF_UPDATE_PREFIX: JSON.stringify(SF_UPDATE_PREFIX),
      SF_COMMON_PATH: JSON.stringify(SF_COMMON_PATH),
      SF_EXECUTABLE: JSON.stringify(SF_EXECUTABLE),
      MYTH_GAMES_APIURL: JSON.stringify(MYTH_GAMES_APIURL),
    }),

    new webpack.DefinePlugin({
      'process.type': '"main"',
    }),
  ],

  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false,
  },
};

export default merge(baseConfig, configuration);
