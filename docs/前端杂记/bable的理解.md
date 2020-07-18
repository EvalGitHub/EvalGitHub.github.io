# 关于babel的理解

## babel主要解决的问题

babel主要是解决ES6浏览器不支持ES6的问题，会将代码转化成AST之后，通过遍历AST树对其进行部分修改，将其转化为code，这样就可以使用哪些es6语法了。

## babel家族的主要成员

- @babel/core

AST的转换核心，如果使用了babel，那个这个模块是必须的

- @babel/cli 

看到cli这个就能想到他可以提供命令行操作环境，类似的还有webpack-cli
安装 npm i -D @babel/core @babel/cli 之后你就可以在命令行对js文件做操作
> babel script.js

- @babel/preset-env

作用是：可以使得最新的js语法在浏览器上运行，他基本上面满足了大部分es6语法转换，减少了开发者的很多配置工作。

let/const， 模版字符串， let快级作用域，函数参数默认值，展开运算符

- @babel/plugin*

babel的插件主要是解决开发者的特定需求(Babel基础功能不满足的时候)提供的一个解决方案，像比较常见的热更新，组件懒加载。
```
plugins: [
  'react-hot-loader/babel',
  '@babel/plugin-syntax-dynamic-import',
]
```

- @babel/runtime

减少代码体积，避免重复性引入；创造一个沙盒环境使得你可以直接使用es6的新api，不会影响全局作用域，常用于公共库开发。


- @babel/polyfill

es6提供了大量的新语法以及新的api，对于新的语法我们通过@babel/preset-env基本上可以解决，但是对于新的api（promise、weakMap、Array.from、Object.assign）他就无能为力了，这个时候你可以选择@babel/polyfill。

 **关于@babel/polyfill需要注意：**

1. 它一般用于项目开发，而不用于函数库框架等开发，因为他会修改全局的作用域和原型prototype，所以在开发的时候我们要清楚的知道自己在做什么；在开发一个公用的库的时候不使用@babel/polyfill，而是使用 @babel/plugin-transform-runtime
避免在别人的项目因引入你的库而出现不可与预知的问题。

- .babelrc/babel.config.js

如果我们使用的是webpack作为构建工具，一般来说可以直接在babel-loader中进行配置
```
{
  test: /\.js$/,
  exclude: /(node_modules|bower_components)/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: [
        ['@babel/preset-env', 
        {
          "module": 'commonjs',
          "targets": {
            "browsers": [
              "> 1%",
              "last 2 versions",
              "not ie <= 8"
            ]
          },
          "corejs": "3",
          "useBuiltIns": "usage", // entry|usage
        }], 
        '@babel/preset-react'
      ],
      plugins: [
        '@babel/plugin-syntax-dynamic-import',
      ]
    }
  }
},
```
当然如果我们有意将这配置提取出来，或者其他的构建工具不支持这样的配置，就可以使用配置文件，在项目的根目录创建babel.config.js文件加入配置即可。

## 关于@babel/preset-env的几个重要知识点

@babel/preset-env可以是的我们使用js的新语法以及代码支持浏览器的新特性，他是babel7这个版本推出的，所以不支持 stage-x 这种类型插件。

### Browserslist

涉及到浏览器新特性以及js的新语法，我们应该很好理解的就是@babel/preset-env在在进行代码转化的时候肯定会有一个支持范围（不会对所有类型及版本的浏览器都提供支持），browserslist就是这个可以用设置兼容浏览器范围的属性(ToKnow:这个属性列表的作用？？)

设置方式有多种，你可以在package.json中设置
```
 "browserslist": [
    "defaults",
    "not ie < 11",
    "last 2 versions",
    "> 1%",
    "ios 7",
    "last 3 ios versions"
  ]
```
也可以在babel-preset-env的tagets中设置
```
{
  "targets": {
    "browsers": [
      "chrome": "58",
      "ie": "11"
    ]
  }
}
```
如果我们不指定需要兼容的浏览器范围，它会转换所有的es6代码，但是随着es6的普及已经有越来越多的浏览器已经支持了部分es6语法，所以建议我们指定浏览器兼容范围，以至于不需要babel/preset-env转换多有的es6语法，减少代码体积。

### modules

将ES6模块语法转换成其他类型（amd | umd | systemjs | commonjs | cjs | auto | false），默认default，false不会转换。

在做开发的时候我们可能会遇到一些奇葩的babel错误提醒，例如```Cannot assign to read only property 'exports' of object #<Object>```；错误的根源就是webpack不能混合使用import和module.exports；
这个时候我们或许可以使用这个配置变量来解决问题。

> "module": 'commonjs',

### useBuiltIns

值得注意的是es6中的新特性可以分为两大类：

1. syntax 语法
  
  let, const, class, decorator...

2. 新的api

  includes, map, includes....

对于新的syntax，使用@babel/preset-env是可以进行转换的，但是对于新的api他就无能为力，这个时候就需要polyfill上场了。值得一聊的是如果使用的是@babel/polyfill，这个属性就可以发挥很大作用。

**useBuiltIns的三个选项及作用**

- useBuiltIns: 'entry'

设置为entry之后，如果在main.js中引入了@babel/polyfill，就不能再多次引入了，否则会报错，官方推荐在单页应用中这个选项。它会为根据环境的不同为引入不同的core-js，只是单纯的对应环境的不同加载不同的垫片，可不是按需加载哦。

**note：** 使用这个设置的时候我们必须在入口处显示的引入@babel/polyfill

- useBuiltIns: 'usage'

为每一个需要转化的js文件导入他们需要的polyfills，并且每个文件之后加载相同的polyfill一次。

**note：** 不需要手动引入@babel/polyfill

- useBuiltIns: 'false'

默认false，啥也不做

### corejs

如果设置了useBuiltIns：entry/usage，那么这选项才有作用，默认为2。
coreje的版本有2，3默认是2（只有稳定版的js特性才会被注入，对于一些提案的新特性是不会注入的），如果你想注入那些正在提案中的新特性可以
```
useBuiltIns: 'usage'
corejs: { 
  version: 3, 
  proposals: true
}
```
或者
```
js文件中导入：import "core-js/proposals/string-replace-all"

useBuiltIns: "entry"
```
**note：** 设置了useBuiltIns:entry，就不支持配置corejs。


[值得看的babel讲解文章](<https://zhuanlan.zhihu.com/p/58624930>)

[不容错过的 Babel7 知识](<https://juejin.im/post/5ddff3abe51d4502d56bd143#heading-8>)