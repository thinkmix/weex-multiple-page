const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');
const config = require('./config');
const helper = require('./helper');
const glob = require('glob');
const vueLoaderConfig = require('./vue-loader.conf');
const vueWebTemp = helper.rootNode(config.templateDir);
const hasPluginInstalled = fs.existsSync(helper.rootNode(config.pluginFilePath));
const isWin = /^win/.test(process.platform);
// const weexEntry = {
//   'index': helper.root('entry.js')
// }
let fileType = '', webEntry = {}, weexEntry = {};

/**
 * Plugins for webpack configuration.
 */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const plugins = [
  /*
   * Plugin: BannerPlugin
   * Description: Adds a banner to the top of each generated chunk.
   * See: https://webpack.js.org/plugins/banner-plugin/
   */
  new webpack.BannerPlugin({
    banner: '// { "framework": "Vue"} \n',
    raw: true,
    exclude: 'Vue'
  })
];

const getEntryFileContent = (entryFile, fullpath) => {
  let  relativePath = path.relative(path.join(entryFile, '../'), fullpath);
  let relativePluginPath = helper.rootNode(config.pluginFilePath);
  if (isWin) {
    relativePluginPath = relativePluginPath.replace(/\\/g, '\\\\');
    relativePath = relativePath.replace(/\\/g, '\\\\');
  }

  let dependence = `import Vue from 'vue'\n`;
  dependence += `import weex from 'weex-vue-render'\n`;
  dependence += `weex.init(Vue)\n`;
  dependence += `const App = require('${ relativePath }')\n`;
  dependence += `new Vue(Vue.util.extend({el: '#root'}, App))\n`;
  
  // let entryContents = fs.readFileSync(source).toString();
  let entryContents = '';
  let contents = '';
  entryContents = dependence + entryContents;
  // entryContents = entryContents.replace(/\/\* weex initialized/, match => `weex.init(Vue)\n${match}`);
  
  if (hasPluginInstalled) {
    contents += `\n// If detact plugins/plugin.js is exist, import and the plugin.js\n`;
    contents += `import plugins from '${relativePluginPath}';\n`;
    contents += `plugins.forEach(function (plugin) {\n\tweex.install(plugin)\n});\n\n`;
    // entryContents = entryContents.replace(/\.\/router/, routerpath);
    entryContents = entryContents.replace(/weex\.init/, match => `${contents}${match}`);
  }
  return entryContents;
}

// The entry file for web needs to add some library. such as vue, weex-vue-render
// 1. src/entry.js 
// import Vue from 'vue';
// import weex from 'weex-vue-render';
// weex.init(Vue);
// 2. src/router/index.js
// import Vue from 'vue'

// const getRouterFileContent = (source) => {
//   const dependence = `import Vue from 'vue'\n`;
//   let routerContents = fs.readFileSync(source).toString();
//   routerContents = dependence + routerContents;
//   return routerContents;
// }

// const getEntryFile = () => {
//   const entryFile = path.join(vueWebTemp, config.entryFilePath)
//   const routerFile = path.join(vueWebTemp, config.routerFilePath)
//   fs.outputFileSync(entryFile, getEntryFileContent(helper.root(config.entryFilePath), routerFile));
//   fs.outputFileSync(routerFile, getRouterFileContent(helper.root(config.routerFilePath)));
//   return {
//     index: entryFile
//   }
// }
// const webEntry = getEntryFile();


// Retrieve entry file mappings by function recursion
const walk = (dir) => {
  dir = dir || '.';
  const directory = helper.root(dir);

  fs.readdirSync(directory).forEach((file) => {
    const fullpath = path.join(directory, file);
    const stat = fs.statSync(fullpath);
    const extname = path.extname(fullpath);
    if (stat.isFile() && extname === '.vue' || extname === '.we') {
      if (!fileType) {
        fileType = extname;
      }
      if (fileType && extname !== fileType) {
        console.error('Error: This is not a good practice when you use ".we" and ".vue" togither!');
      }
      const name = path.join(dir, path.basename(file, extname));
      if (extname === '.vue') {
        const entryFile = path.join(vueWebTemp, dir, path.basename(file, extname) + '.js');
        fs.outputFileSync(path.join(entryFile), getEntryFileContent(entryFile, fullpath));
        webEntry[name] = entryFile + '?entry=true';
      }
      
      weexEntry[name] = fullpath + '?entry=true';
    } else if (stat.isDirectory() && file !== 'build' && file !== 'include') {
      const subdir = path.join(dir, file);
      walk(subdir);
    }
  });
};
walk(config.pageFilePath);
console.log(webEntry)

// use Eslint
const createLintingRule = () => ({
  test: /\.(js|vue)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [helper.rootNode('src'), helper.rootNode('test')],
  options: {
    formatter: require('eslint-friendly-formatter'),
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
})
const useEslint = config.dev.useEslint ? [createLintingRule()] : []


// Config for compile jsbundle for web.
const webConfig = {
  entry: Object.assign(webEntry, {
    'vendor': [path.resolve('node_modules/phantom-limb/index.js')]
  }),
  output: {
    path: helper.rootNode('./dist'),
    filename: '[name].web.js'
  },
  /**
   * Options affecting the resolving of modules.
   * See http://webpack.github.io/docs/configuration.html#resolve
   */
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '@': helper.resolve('src')
    }
  },
  /*
   * Options affecting the resolving of modules.
   *
   * See: http://webpack.github.io/docs/configuration.html#module
   */
  module: {
    // webpack 2.0 
    rules: useEslint.concat([
      {
        test: /\.js$/,
        use: [{
          loader: 'babel-loader'
        }],
        exclude: config.excludeModuleReg
      },
      {
        test: /\.vue(\?[^?]+)?$/,
        use: [{
          loader: 'vue-loader',
          options: Object.assign(vueLoaderConfig({useVue: true, usePostCSS: false}), {
            /**
             * important! should use postTransformNode to add $processStyle for
             * inline style prefixing.
             */
            optimizeSSR: false,
            postcss: [
              // to convert weex exclusive styles.
              require('postcss-plugin-weex')(),
              require('autoprefixer')({
                browsers: ['> 0.1%', 'ios >= 8', 'not ie < 12']
              }),
              require('postcss-plugin-px2rem')({
                // base on 750px standard.
                rootValue: 75,
                // to leave 1px alone.
                minPixelValue: 1.01
              })
            ],
            compilerModules: [
              {
                postTransformNode: el => {
                  // to convert vnode for weex components.
                  require('weex-vue-precompiler')()(el)
                }
              }
            ]
            
          })
        }],
        exclude: config.excludeModuleReg
      }
    ])
  },
  /*
   * Add additional plugins to the compiler.
   *
   * See: http://webpack.github.io/docs/configuration.html#plugins
   */
  plugins: plugins
};
// Config for compile jsbundle for native.
const weexConfig = {
  entry: weexEntry,
  output: {
    path: path.join(__dirname, '../dist'),
    filename: '[name].js'
  },
  /**
   * Options affecting the resolving of modules.
   * See http://webpack.github.io/docs/configuration.html#resolve
   */
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '@': helper.resolve('src')
    }
  },
  /*
   * Options affecting the resolving of modules.
   *
   * See: http://webpack.github.io/docs/configuration.html#module
   */
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [{
          loader: 'babel-loader'
        }],
        exclude: config.excludeModuleReg
      },
      {
        test: /\.vue(\?[^?]+)?$/,
        use: [{
          loader: 'weex-loader',
          options: vueLoaderConfig({useVue: false})
        }],
        exclude: config.excludeModuleReg
      }
    ]
  },
  /*
   * Add additional plugins to the compiler.
   *
   * See: http://webpack.github.io/docs/configuration.html#plugins
   */
  plugins: plugins,
  /*
  * Include polyfills or mocks for various node stuff
  * Description: Node configuration
  *
  * See: https://webpack.github.io/docs/configuration.html#node
  */
  node: config.nodeConfiguration
};

module.exports = [webConfig, weexConfig];
