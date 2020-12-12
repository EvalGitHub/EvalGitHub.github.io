# webpack多页打包实现,以及多配置同时运行

## **实现多页打包的功能需要如下步骤**

1）多个入口（entry里面配置多个入口）

```
entry: {
  index: './index.tsx',
  list: './list.tsx'
},
```

2）设置多个HtmlWebpackPlugin

```
new HtmlWebpackPlugin({
  template: '../index.html', // 文件模板
  filename: 'index.html', // 生成的文件名
  chunks: ['vendors', 'index'] // 需要引入的模块js
}),
new HtmlWebpackPlugin({
  template: '../index.html', // 文件模板
  filename: 'list.html', // 生成的文件名
  chunks: ['vendors', 'list'] // 需要引入的模块js
}),
```

**template：**是多页配置的文件模板

**filename：**生成的文件名

**chunks**：可以配置需要的模块js

只需要设置以上两个步骤即可实现多页面打包，但是问题是如果每一次新增加一个文件入口，都需要重新更改plugins是很麻烦的？

因此可以做如下的优化：

明确一点是HtmlWebpackPlugin的配置是根据entry中的数据息息相关。

```
let config = {
  context: path.resolve(__dirname, '../src'),
  entry: {
    index: './index.tsx',
    list: './list.tsx'
  },
  ....
  ....
  ....
};
function mutipleEntry (config) {
  Object.keys(config.entry).forEach((item) => {
    plugins.push(
      new HtmlWebpackPlugin({
        template: '../index.html', // 文件模板
        filename: `${item}.html`, // 生成的文件名
        chunks: ['vendors', `${item}`] // 需要引入的模块js
      }),
    )
  })
  return plugins;
};
config.plugins = mutipleEntry(config);
module.exports = config;
```

##  多个webpack的不同配置同时并行

如果项目中存在多个webpack的不同配置，想同时并行运行，这个时候我们可以使用 [parallel-webpack](<https://www.npmjs.com/package/parallel-webpack>)

[thead-loade](<https://www.webpackjs.com/loaders/thread-loader/>)