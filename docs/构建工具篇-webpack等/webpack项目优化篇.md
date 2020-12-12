# webpack打包插件篇

webpack 中的插件用于代码资源的打包优化，混合，压缩，treeShaking，去掉注释等等...

**学习目标：** 提供代码的利用率(coverage)，提高页面访问速度。

ctrl + shift + i 使用chrome自带的代码覆盖率检查工具

<https://blog.csdn.net/Aero_K/article/details/82492634>

## SplitChunksPlugin代码分割

代码分割的作用就是减小入口文件的体积，将其分割为多个代码块资源，减少加载时间。

```
optimization: {
    splitChunks: {
      chunks: "all", 
      // 同步异步都会进行代码分割（默认只对异步代码进行分割,webpack认为只有异步组件才能提升性能）
      // 同步代码只是对缓存做了优化处理，分割入口主文件为多个小文件，修改的时候只会更新被修改的文件
      minSize: 30000, // 做代码分割的最小字节，小于这个就不分割
      maxSize: 50000,  
      minChunks: 1, // 当一个模块被打包之后的chunk引用次数至少多少次，才分割
      maxAsyncRequests: 5, 
      maxInitialRequests: 3, // 入口处的代码分割数
      automaticNameDelimiter: '~', // 文件生成的连接符
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/, // 如果是从node_module中安装的，就打包在vendors中
          priority: -10,  // 优先级，-10 > -20 ,如果缓存组条件有多个满足的时，按优先级来划分打包组
          filename: 'vendors.js'
        },
        default: { // 默认匹配规则，
          // minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,  
          // 如果一个包之前被打包过，则不会重复打包 
          // （例如a模块中引入了b, b之前被c引用并且打包过,则a会重复使用之前的打包的b）
          filename: 'common.js'
        } 
      }
    }
  },
```

<https://www.webpackjs.com/plugins/split-chunks-plugin/>

## 懒加载 

按需加载，分割代码。

懒加载： 

demo01

```
  getComponent = async () => {
    const _ = await import(/* webpackChunkName:"lodash" */'lodash');
    let element = document.createElement('div');
    element.innerHTML = _.join(['Dell', 'Lee'], '-');
    document.body.appendChild(element);
  };
```

demo02

```
// utils/index.js
export async function createElement () {
  const element = document.createElement('div');
  const  _  = await import(/* webpackChunkName: "lodash" */ 'lodash');
  element.innerHTML = _.join(['Hello', 'webpack'], ' ');
  return element;
};
```

```
 // ...
 getComponent2 = async () => {
    const module = await import(/* webpackChunkName:"createElement" */ '@/utils/index');
    module.createElement().then((component:any) => {
      document.body.appendChild(component);
    });
  };
```

<https://webpack.js.org/guides/lazy-loading/>

## 预加载prefetching，preloading

在需要搜首次展示的资源加载完之后，浏览器处理空闲的时候，我们可以充分利用网络资源，进行预加载。

**例如：**在首页有个登录弹框，只有在用户点击之后才需要加载对应的资源，这个时候如果我们将这个弹窗资源用懒加载的方式，则用户体验不是很好；如果写成同步的随首页资源一起加载下来则会影响首页加载速度。

```
 import(/* webpackPrefetch: true */'lodash').then(res  => {
   console.log(_.join([1,2,4,5], "ABCD"))
 })
```
[实现方式](https://webpack.js.org/guides/code-splitting/#prefetchingpreloading-modules)

[webpack动态导入及预加载](https://evalgithub.github.io/webpack/%E5%8A%A8%E6%80%81%E5%AF%BC%E5%85%A5%E4%BB%A5%E5%8F%8A%E9%A2%84%E5%8A%A0%E8%BD%BD.html#import%E5%8A%A8%E6%80%81%E5%AF%BC%E5%85%A5%EF%BC%88%E4%BB%A3%E7%A0%81%E5%88%86%E5%89%B2%EF%BC%89)

## css代码分割 MiniCssExtractPlugin

这个不支持热更新，所以一般用于生产环境，不用于开发环境，（开发使用style-loader）

## css压缩[optimize-css-assets-webpack-plugin]

```
new OptimizeCssAssetsPlugin({
  assetNameRegExp: /\.css$/g,
  cssProcessor: require('cssnano'),
  cssProcessorOptions: {
    safe: true,
    discardComments: {
      removeAll: true
    }
  },
  canPrint: true
}),
```

## [tree shaking](https://webpack.docschina.org/guides/tree-shaking/)

打包时候去除冗余代码，去除第三方模块中没被使用到的代码

依赖于ES2015的静态特性（import，export可做静态分析）

- 必须满足
  - 使用es2015模块语法
  - 确保没有编辑器将你的ES2015模块语法转为CommonJS(将其设置为false)
  - 在项目的 package.json 文件中，添加 "sideEffects" 属性
  - 使用 mode 为 "production" 的配置项以启用更多优化项，包括压缩代码与 tree shaking

package.json
```
sideEffect: false 
// or
"sideEffects": [
  "**/*.css",
  "**/*.scss",
  "./esnext/index.js",
  "./esnext/configure.js"
],
```
如果设置为false标明所用的模块都会被treeShaking，可以使用数组
形式指定不被treeShaking的文件