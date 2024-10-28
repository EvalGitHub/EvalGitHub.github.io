---
runme:
  id: 01HM5WFQG3BXKKSGA7QYS9PF8T
  version: v2.2
---

# 编写一个webpack的插件（plugin）

webpack插件的是用于代码的压缩，混淆等优化

webpack的插件本质上都是一些类，形如：

```css {"id":"01HM5WFQG3BXKKSGA7QQSEGWJP"}
class xxxxWebpackPlugin {
    constructor (options) {
        ....初始化
    };
    apply (compiler) {
        // .....
    }
}
```

关于apply函数，是每个插件在运行的时候都会执行的，其参数compiler可以看做是webpack的一个实例，可以利用他去调用插件的钩子函数，做相关操作。

**其中 compilation:存放的是这次打包相关的内容，compilation:存放的是这次打包相关的内容**

钩子函数可以参考：<https://www.webpackjs.com/api/compiler-hooks/>

钩子函数分为同步和异步两种，他们的调用方式也有所不同。

- 异步钩子的调用形式：

```ini {"id":"01HM5WFQG3BXKKSGA7QSMTRC03"}
 compiler.hooks.[钩子函数名].tapAsync（‘插件名’, (compilation, cb) => {
     ....
     ....
     cb();
 }）
```

- 同步钩子的调用形式：

```js {"id":"01HM5WFQG3BXKKSGA7QTFFMMAC"}
 compiler.hooks.compiler.tap('CopyrightWebpackPlugin', (compilation) => {
    ....
    console.log('compiler')
 })
```

现在有个需求是在webpack打包快结束之时，在dist目录生成一个copyright.txt文件

```groovy {"id":"01HM5WFQG3BXKKSGA7QYFAJMW5"}
class CopyrightWebpackPlugin {
  constructor (options) {
    console.log('插件被使用了', options)
  }
  apply (compiler) { 
    compiler.hooks.emit.tapAsync('CopyrightWebpackPlugin',
    	(compilation, cb) => { // compilation:存放的是这次打包相关的内容
          compilation.assets['copyright.txt'] = {
            source: function () {
              return 'copyright by dell lee';
            },
            size: function () {
              return 21;
            }
          };
      	 cb();
    });
  }
}
module.exports = CopyrightWebpackPlugin;
```

详情可参考：

<https://git.lug.ustc.edu.cn/EvalGitHub/wepack-loader-plugin/blob/master/plugins/cpoyright-webpack-plugin.js>

