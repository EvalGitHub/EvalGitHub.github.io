# 前端引入通过script引入js的几种方式

## 直接通过script标签
```
<script type="text/javascript" 
  charset="utf-8"
  src="http://connect.qq.com/qc_jssdk.js">
</script>
```
一般情况下这中操作是没问题的，但是在webpack畅行的前端中，如果引入的是相对地址文件(项目中的下载的一个lib文件)，例如下面的操作
```
<script type="text/javascript" 
  charset="utf-8"
  src="../lib/connect.qq.com/qc_jssdk.js">
</script>
```
这种情况下可能就会出现问题，最终经过打包之后你会发现打包好的文件中并没有这个qc_jssdk.js文件，原因就是webpack tree shaking的优化使不用的文件被丢弃。

针对这个问题我们可以使用copy-webpack-plugin来解决。

## 动态创建script，赋值src属性

实现方式：
```
function dynamicAddJs() {
  if (['product'].includes(getConfig().env)) {
    let ele = document.createElement('script');
    ele.src = `/lib/qc_jssdk.js`;
    ele.type = 'text/javascript';
    ele.charset = 'utf-8';
    if (document.documentElement.append) {
      document.documentElement.append(ele);
    } else {
      document.documentElement.appendChild(ele);
    }
  }
}
```
常见问题：如果是绝对地址没问题，如果是相对地址就会出现404，因为在预编译的时候webpack会觉得这个资源没用到而不打包。

**解决方案：** 使用copy-webpack-plugin配合使用

这个插件的作用就是可以手动的将一些文件拷贝到打包之后指定文件中，具体实现：
```
const CopyPlugin = require('copy-webpack-plugin');
......
......
plugins: [
  new CopyPlugin([
    {
      from: path.resolve(__dirname, '../src/lib/**.*'),
      top: path.resolve(__dirname, '../build/lib/[name].[ext]')
    }
  ])
],
```
上面的代码就是将src/lib下面的所有文件拷贝到打包之后的build/lib文件下，解决了打包之后的文件中存在需要加载的目标文件，接着就可以通过script动态加载了，代码同上。

**note：** 注意src地址不能写成'./lib/**.js’否则会有问题；
【./于/的区别】./是相对地址， /是绝对地址。

## 使用webpack.DllPlugin
加载资源的最终效果是生成一个script标签，src属性为我们的需要的目标文件。因此可以借助webpack.DllPlugin巧妙的实现。

webpack.DllPlugin使用来加快编译速度的，他的作用就是将那些固定不变的库或者插件单独抽离出来，使webpack在进行项目打包的时候不需要重复性的编译这些文件，提升打包速度，最终在index.html中将这些文件通过script方式引入。

了解原理之后我们需要做的就是将qc_jssdk.js通过webpack.DllPlugin生成script标签引入即可。

**需要注意的几个问题：**

- 这个库文件我们不希望babel再进行编译（看个人需求）
```
test: /\.js$/,
exclude: /(node_modules|bower_components|src\/lib\/qc_jssdk.js)/,
use: {
  loader: 'babel-loader',
  options: { .... }
```
- 需要确定这个文件是一个模块

通过module.exports进行处理过

```
// 一般的lib都是个自执行函数,形式如下,需要转换为一个模块
let qc_jssdk = function() {.....}();
module.exports = qc_jssdk; 
```

- 要想这个文件被执行，需要在入口文件通过import引入
```
require('./lib/qc_jssdk.js');
```

## 通过nodeJS读取打包之后的文件，动态替换内容

```
const htmlContent = fs.readFileSync('./build/index.html', 'utf8', 
  function (err, data) {
    if (err) {
      console.error(err);
      return false;
    }
  });

const scriptContent = fs.readFileSync('./src/libs/qc_jssdk.js', 'utf8', 
  function (err, data) {
    if (err) {
      console.error(err);
      return false;
    }
  });

const dynamicScript = `<script type='text/javascript' defer async>${scriptContent}</script>`;

const newHtml = htmlContent.replace(/<!-- qc_jssdk inject import -->/i, dynamicScript);

fs.writeFileSync('./build/index.html', newHtml, 'utf8', 
  function (err) {
    if (err) {
      console.error(err);
      return false;
    }
  });
```

## 使用HtmlWebpackPlugin提供的hook

HtmlWebpackPlugin这个插件是用于为webpack打包文件提供服务的，生成简易模板，可以挂载script标签，css link标签。

他提供了些许hook，我们可以利用某些hook做动态插入script的需求。

[htmlWebpackPlugin的hook](https://github.com/jantimon/html-webpack-plugin#events)

### 创建一个webpack插件用于动态插入script

- 创建html-alert-plugin

```
const HtmlWebpackPlugin = require('html-webpack-plugin');

class HtmlAlertPlugin {
  apply(compiler) {
    compiler.hooks.complition.tap('HtmlAlertPlugin', (compiltion) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync('HtmlAlertPlugin', (data, cb) => {
        data.html = data.html.replace(/<\/head>/, '<script src="https:some.name.link.js"></script>')
        cb(null, data)
      })
    })
  }
}
module.exports = HtmlAlertPlugin
```

- 插件应用

```
plugins: [
  new HtmlWebpackPlugin({
    template: './index.html', // 文件模板
    filename: `index.html`, // 生成的文件名
    chunks: ['vendors', 'main'] // 需要引入的模块js
  }),
  new HtmlAlertPlugin(),
]
```



