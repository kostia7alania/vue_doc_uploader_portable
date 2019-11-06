var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'build.js'
  },
  module: {
    rules: [

      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ],
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader'
        ],
      },
      {
        test: /\.sass$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader?indentedSyntax'
        ],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
            // the "scss" and "sass" values for the lang attribute to the right configs here.
            // other preprocessors should work out of the box, no loader config like this necessary.
            'scss': [
              'vue-style-loader',
              'css-loader',
              'sass-loader'
            ],
            'sass': [
              'vue-style-loader',
              'css-loader',
              'sass-loader?indentedSyntax'
            ]
          }
          // other vue-loader options go here
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      },


    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['*', '.js', '.vue', '.json']
  },
  devServer: {
    historyApiFallback: true, // noInfo: true,
    overlay: true,//вывод ошибок на экран
    open: false,
    hot: true,
    proxy: {
      '/doc_upload.php*': {//все запросы))
        target: 'https://portcall.marinet.ru/doc_upload.php',
        secure: false,
        changeOrigin: true,
        onProxyRes(proxyRes, req, res) {
          if (proxyRes.headers.location) { // Если есть заголовок со свойством location (Где храниться полный адрес запроса к локальному серверу)
            let location = proxyRes.headers.location; // Сохраняем адрес зоголовка location из ответа в переменную location
            console.log(`LOCATION: ${proxyRes.headers.location}`); // Выводит в консоль адрес до замены
            location = location.replace('anyships.site', 'anyships.site:3000'); // Заменяем адрес локального сервера на адрес webpack dev server'a
            proxyRes.headers.location = location; // Присваиваем в заголовок location подмененный адрес из переменной location
            console.log(`REPLACED: ${proxyRes.headers.location}`); // Выводит в консоль адрес после замены
          }
        },
        pathRewrite: { '^/api': '' }
      }
    }
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map'
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}
