# 编写一个简单的loader

webpack是一个js模块打包机器，至于不是js的文件的处理一般需要相关的loader做处理。

loader本质上是一个函数：

> replaceLoader.js

```
module.exports = function (source) { 
	// 不能写箭头函数，因为this会有很多loader参数,如果是箭头函数则会丢失
  let result = source.replace('loaderAsync', 'loader1')
  this.callback(null, result) // 支持返回多个参数
}
```

source包含的就是打包之后的文件内容，因此通过loader,我们可以轻松的从source中获取内容然后做相关的处理。

上面的loader的作用是将代码中的“loaderAsync”替换为“loader1”

补充一点：如果操作是异步的我们可以使用webpack提供的this.async方法

```
module.exports = function (source) { 
  console.log(this.query)
  let result = source.replace('loader', this.query.name)
  // this.callback(null, result) // 支持返回多个参数
  const callback = this.async(); // 异步loader
  setTimeout(() => {
    callback(null, result)
  }, 1000)
}
```

相关示例代码：<https://git.lug.ustc.edu.cn/EvalGitHub/wepack-loader-plugin>

webpack文档：<https://www.webpackjs.com/api/loaders/>

