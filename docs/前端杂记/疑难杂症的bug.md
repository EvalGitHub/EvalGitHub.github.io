

## 关于ios10.3.3的问题记录：cannot declare a let variable twice 'n'
> 问题描述：页面在其他机器上都正常，但是在ios10的机器上js完全不执行，插线调试（用iphone链接mac，在safari中进行调试）发现控制台中有一个报错，如下：cannot declare a let variable twice 'n'

很显然，这个变量并不是我们定义的，因为此时执行的代码都是被uglify-es处理之后。谷歌一下，发现果然是ios10的坑，而且官方也承认了这是一个bug

**解决方案：**

```
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
optimization: {
  minimizer: [
      new UglifyJsPlugin({
       exclude: /node_modules/,
      cache: true,
      parallel: true,
      uglifyOptions: {
        sourceMap: false,
        safari10: false,
      }
    }),
  ]
}
```
参考链接：
<https://blog.csdn.net/weixin_33734785/article/details/91387074>

<https://juejin.im/post/5bc5a4cb5188255c90320002>

<https://hughfenghen.github.io/fe/bug1-safari10.html>

## ant-design , element-ui 表格锁列导致不对齐

如果锁定某一列，会导致各种不对齐的问题，原因就是组件动态计算问题

- 方案

手动触发resize事件

```
setTimeout(() => {
  window.dispatchEvent(new Event('resize'));
}, 500);
```
