# 搭建环境react,webapck,typescript问题

## 使用tsLoader之后不能识别div，h1，p等html元素标签

```
npm i typescript -g  
npm link typescript
```
## 修改代码之后不想重新刷新浏览器，需要热更新

1. 启动webpack-devserver hot:true
2. new webpack.HotModuleReplacementPlugin()
3. 引入如下代码

```
if(module.hot) {
    module.hot.accept(() => {
        // to nothong
    })
}
```
## 在使用ts之后提示module上没有hot属性

```
npm install --save-dev @types/webpack-env
```
## css-loader 模块化（module:true）不生效？

```
use: [
    'style-loader',
    {
    loader: 'css-loader',
        options: {
        	importLoaders:2,
       	 	modules: true,
        }
	},
```

这样之后我们就可以在组件中导入scss/css文件了

```
const styles = require(@/scss/login/index.scss); 
```

使用方式：

```
<button className={[`${styles.login_btn}`, `${this.state.canLogin ?  styles.active : ' '}`].join(' ')} onClick={this.login.bind(this)} >立即登录</button>
....
<p className={styles.login_nav}>登录</p>
```

值得注意的是如果你使用ESModule的方式引入样式文件

```
import  * as styles from '@/scss/login/index.scss';
```

ts会提醒你，Can't find index.scss 模块，

> **reason：**TypeScript does not know that there are files other than `.ts`or `.tsx` so it will throw an error if an import has an unknown file suffix.

参考链接：

<https://stackoverflow.com/questions/40382842/cant-import-css-scss-modules-typescript-says-cannot-find-module?r=SearchResults>

解决方法： 需求新建一个 **declaration.d.ts**文件，写入一下代码

```
declare module '*' 
```

<https://blog.csdn.net/qq_20473985/article/details/79132787>

<https://www.jianshu.com/p/5109ac3f593b>

## webpack的alias路径简化总是提醒找不到模块

例如： ‘@/common/toast’ 提醒找不到,在tsconfig.json中设置

```
{
  .......
  "baseUrl": ".",
  "paths": {
    "@/*": ["./src/*"]
  }
  .....
}    
```
## css不支持单行注释  

em: // margin: 20px

但是可以使用 /* margin：20px  */

需要在postscss loader中配置postcss-scss

```
{
  loader: 'postcss-loader',
  options: {
  parser: 'postcss-scss',
    plugin: [
    require('autoprefixer')
    ]
  }
}
```
## 关于热更新

为了能在改动代码的时候我们能很舒服的观察到浏览器上的变化，需要使用webpack的热更新。
需要注意的是热更新只需要在开发环境进行配置。

webpack.dev.js
```
plugins: [
  new webpack.HotModuleReplacementPlugin(),
]
```
另外需要在入口文件通常是inde.tsx/app.tsx加入以下代码
```
if (module.hot) {
  module.hot.accept(() => {
    console.log('app 更新了');
  });
}
```
至此已经完成了简单的热更新，在修改css文件的时候不需要重新reload整个浏览器就可以看到变化，但是对于js文件的变更，好像还是会重新刷新整个浏览器。

**解决方案：** react-hot-loader

**具体配置方式：**

1. index.tsx
```
import { hot } from 'react-hot-loader/root';
class App extends React.Component {
  render() {
    return (
      <AppRouteConfig/>
    );
  }
}
hot(App); // @1
if (module.hot) {
  module.hot.accept(() => {
    console.log('app 更新了');
  });
}
```
2. 还需要修改webpack.common.config.js的plugin
```
entry: {
  main: [
    "react-hot-loader/patch", // @2
    './index.tsx'
  ],
},
....
{
  loader: 'babel-loader',
  options: {
    babelrc: false,
    presets: ['@babel/preset-env', '@babel/preset-react'],
    plugins: ['react-hot-loader/babel'] // @3
  },
}
```
[react-hot-loader使用](<http://gaearon.github.io/react-hot-loader/getstarted/>)

值得注意的几个问题：

**note:** react-hot-loader只支持同步加载的组件，不支持懒加载的组件

**warning:** 你可能会遇到这个问题“component appears to be a function component that returns a class instance” 

解决方案：安装[@hot-loader/react-dom](<https://github.com/gaearon/react-hot-loader#hot-loaderreact-dom>)

然后作如下修改：
```
module.exports = {
  // ...
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
};
```

## 关于使用react-router刷新回到首页的问题

1. Redirect必须放在所有的route之后
2. 使用Switch组件

```
<Router>
  <Switch>
    {
      routes.map((itemRoute, key) => {
        return <Route path={itemRoute.path} key={key} component={itemRoute.component}/>;
      })
    }
    <Redirect exact from="/" to="/manage/works"></Redirect>
  </Switch>
</Router>
```

## 本地打包之后图片路径总是不对？

**可能原因：**

1. 重复添加url-loader，优先排查webpack.common.config.js 和webpack.dev.config.js

```
{
  test: /\.(png|svg|jpg|gif)$/,
  use: [
    {
      loader: 'url-loader',
      options: {
        outputPath: 'assets/',
        publicPath:  `${config.buildtime.cdn_path}assets`,
        limit: 20024, // 20kb(20*1024)
        name: '[name].[ext]'
      }
    }
  ]
}
```

public一般会用在图片资源上传七牛的时候用到

## 实现tree shaking

在项目中会使用很多第三库，但是有时候我们只是使用了其中的部分方法，如果不做特殊处理的话，会将整个库进行打包，这是十分
没有必要的，针对这个问题，webpack提出了treeShaking的思路。

**前提：必须是esmodule的形式引入文件，commonJs的形式不支持；因为esmodule的静态化，在编译时候(决定import 不能放在执行代码中)确定模块之间的以来关系，以及输入输出变量。**

[js的模块化规范](https://www.cnblogs.com/evaling/p/10341112.html)

配置方式：

1. 修改package.json

```
  "sideEffects": false 或者 ["*.css", "*.scss"],
```
如果配置成false，则对所有的import引入都做tree shaking，如果是数组则是避免tree shaking的处理

2. 配置webpack的配置(如果是生产环境则不需要处理（默认配置）)

```
 optimization: {
    usedExports: true 
  }
```