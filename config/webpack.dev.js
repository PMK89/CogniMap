/**
 * @author: @AngularClass
 */

const helpers = require('./helpers');
const { merge, mergeWithRules } = require('webpack-merge'); // used to merge webpack configs
const webpackMergeDll = mergeWithRules({plugins: 'replace'});
const commonConfigFn = require('./webpack.common.js'); // the settings that are common to prod and dev
const COMMON_METADATA = require('./webpack.common.js').METADATA;

/**
 * Webpack Plugins
 */
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');

/**
 * Webpack Constants
 */
const ENV = process.env.ENV = process.env.NODE_ENV = 'development';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;
const HMR = helpers.hasProcessFlag('hot');
const METADATA = merge(COMMON_METADATA, {
  host: HOST,
  port: PORT,
  ENV: ENV,
  HMR: HMR
});

/**
 * Webpack Dll Bundles
 */
// const DllBundlesPlugin = require('webpack-dll-bundles-plugin').DllBundlesPlugin; // Still commented out

/**
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = function (options) {
  return merge(commonConfigFn({env: ENV}), { // Restoring the merge

    /**
     * Developer tool to enhance debugging
     *
     * See: http://webpack.github.io/docs/configuration.html#devtool
     * See: https://github.com/webpack/docs/wiki/build-performance#sourcemaps
     */
    devtool: 'cheap-module-source-map',

    /**
     * Options affecting the output of the compilation.
     *
     * See: http://webpack.github.io/docs/configuration.html#output
     */
    output: {

      /**
       * The output directory as absolute path (required).
       *
       * See: http://webpack.github.io/docs/configuration.html#output-path
       */
      path: helpers.root('dist'),

      /**
       * Specifies the name of each output file on disk.
       * IMPORTANT: You must not specify an absolute path here!
       *
       * See: http://webpack.github.io/docs/configuration.html#output-filename
       */
      filename: '[name].bundle.js',

      /**
       * The filename of the SourceMaps for the JavaScript files.
       * They are inside the output.path directory.
       *
       * See: http://webpack.github.io/docs/configuration.html#output-sourcemapfilename
       */
      sourceMapFilename: '[file].map',

      /** The filename of non-entry chunks as relative path
       * inside the output.path directory.
       *
       * See: http://webpack.github.io/docs/configuration.html#output-chunkfilename
       */
      chunkFilename: '[id].chunk.js',

      library: 'ac_[name]',
      libraryTarget: 'var',
    },

    module: {

      rules: [
      //  {
      //    test: /\.ts$/,
      //    use: [
      //      {
      //        loader: 'tslint-loader',
      //        options: {
      //          configFile: 'tslint.json'
      //        }
      //      }
      //    ],
      //    exclude: [/\.(spec|e2e)\.ts$/]
      //  },

        /*
         * css loader support for *.css files (styles directory only)
         * Loads external css styles into the DOM, supports HMR
         *
         */
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
          include: [helpers.root('src', 'styles')]
        },

        /*
         * sass loader support for *.scss files (styles directory only)
         * Loads external sass styles into the DOM, supports HMR
         *
         */
        {
          test: /\.scss$/,
          use: [
            'style-loader',
            { loader: 'css-loader', options: { url: false, importLoaders: 1 } },
            { loader: 'sass-loader', options: { implementation: require('sass'), webpackImporter: false } }
          ],
          include: [helpers.root('src', 'styles')]
        },

      ]

    },

    plugins: [

      /**
       * Plugin: DefinePlugin
       * Description: Define free variables.
       * Useful for having development builds with debug logging or adding global constants.
       *
       * Environment helpers
       *
       * See: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
       */
      // NOTE: when adding more properties, make sure you include them in custom-typings.d.ts
      new DefinePlugin({
        'ENV': JSON.stringify(METADATA.ENV),
        'HMR': METADATA.HMR,
        'process.env': {
          'ENV': JSON.stringify(METADATA.ENV),
          'NODE_ENV': JSON.stringify(METADATA.ENV),
          'HMR': METADATA.HMR,
        }
      }),

      // new DllBundlesPlugin({ // Still Temporarily commented out
      //   bundles: {
      //     polyfills: [
      //       'core-js',
      //       {
      //         name: 'zone.js',
      //         path: 'zone.js/dist/zone.js'
      //       },
      //       {
      //         name: 'zone.js',
      //         path: 'zone.js/dist/long-stack-trace-zone.js'
      //       },
      //     ],
      //     vendor: [
      //       '@angular/platform-browser',
      //       '@angular/platform-browser-dynamic',
      //       '@angular/core',
      //       '@angular/common',
      //       '@angular/forms',
      //       '@angular/http',
      //       '@angular/router',
      //       '@angularclass/hmr',
      //       'rxjs',
      //     ]
      //   },
      //   dllDir: helpers.root('dll'),
      //   webpackConfig: mergeWithRules(commonConfigFn({env: ENV}), {
      //     devtool: 'cheap-module-source-map',
      //     plugins: []
      //   })
      // }),

      // new AddAssetHtmlPlugin([ // Still Temporarily commented out
      //   { filepath: helpers.root(`dll/${DllBundlesPlugin.resolveFile('polyfills')}`) },
      //   { filepath: helpers.root(`dll/${DllBundlesPlugin.resolveFile('vendor')}`) }
      // ]),

    ],

    /**
     * Webpack Development Server configuration
     * Description: The webpack-dev-server is a little node.js Express server.
     * The server emits information about the compilation state to the client,
     * which reacts to those events.
     *
     * See: https://webpack.github.io/docs/webpack-dev-server.html
     */
    devServer: {
      port: METADATA.port,
      host: METADATA.host,
      historyApiFallback: true,
      watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
      }
    },

  });
}
