const { resolve } = require('path');
const { CheckerPlugin, TsConfigPathsPlugin } = require('awesome-typescript-loader');
const DtsGeneratorPlugin = require('dts-generator-webpack-plugin').default;
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const tsconfig = require('./tsconfig');
const package = require('../package');

const path = {
  root: resolve(process.env.ROOT_PATH),
  source: resolve(process.env.SOURCE_PATH),
  target: resolve(process.env.TARGET_PATH),
  test: resolve(process.env.TEST_PATH)
};

const pattern = {
  source: /^.*src\//
};

const modulePath = {
  index: resolve(path.source, 'index'),
  harness: resolve(path.test, 'harness'),
  shim: resolve(path.source, 'shim')
};

// if `make test-check` was run, type check during lint (takes _forever_)
const typeCheck = process.env['TEST_CHECK'] === 'true';

module.exports = {
  devtool: 'source-map',
  entry: {
    main: modulePath.index,
    test: [modulePath.harness, 'sinon', 'chai']
  },
  externals: {
    'lodash': 'commonjs lodash'
  },
  mode: 'none',
  module: {
    noParse: [
      /dtrace-provider/
    ],
    rules: [{
      test: /\.tsx?$/,
      rules: [{
        enforce: 'pre',
        use: [{
          loader: 'tslint-loader',
          options: {
            configFile: 'config/tslint.json',
            typeCheck
          }
        }]
      }, {
        use: [{
          loader: 'awesome-typescript-loader',
          options: {
            configFileName: 'config/tsconfig.json',
            inlineSourceMap: false,
            sourceMap: true
          }
        }]
      }]
    }]
  },
  node: {
    __dirname: false,
    __filename: false
  },
  output: {
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    filename: '[name]-bundle.js',
    hashDigest: 'base64',
    hashFunction: 'sha256',
    library: package.name,
    libraryTarget: 'umd',
    path: path.target
  },
  plugins: [
    new CheckerPlugin(),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      generateStatsFile: true,
      openAnalyzer: false,
      reportFilename: 'bundles.html'
    }),
    new DtsGeneratorPlugin({
      name: package.name,
      project: path.root,
      exclude: [
        'node_modules/**/*',
        'test/**/*'
      ],
      resolveModuleId: (params) => {
        const module = params.currentModuleId.replace(pattern.source, '');
        if (module === 'index') {
          return package.name;
        }
        return package.name + '/' + module;
      },
      resolveModuleImport: (params) => {
        return package.name + '/' + params.importedModuleId.replace(pattern.source, '');
      }
    })
  ],
  resolve: {
    alias: [{
      name: 'src',
      alias: path.source,
      onlyModule: false
    }, {
      name: 'test',
      alias: path.test,
      onlyModule: false
    }],
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    plugins: [
      new TsConfigPathsPlugin({ tsconfig, compiler: 'typescript' })
    ]
  },
  target: 'node'
};