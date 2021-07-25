# rollup入门教程

## rollup.config.js

```
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import json from "@rollup/plugin-json";

export default {
    input: ['./src/index.js'],
    output: {
        file: './dist/bundle.js',
        format: 'umd',
        name: 'experience'
    },
    plugins: [resolve(), commonjs(), babel(), json()],
    external: ["the-answer"],

}
```
### 为什么要使用resolve插件

> @rollup/plugin-node-resolve

在上面的入门案例中，我们打包的对象是本地的js代码和库，但实际开发中，不太可能所有的库都位于本地，我们大多会通过npm下载远程的库。
与webpack和browserify这样的其他捆绑包不同，rollup不知道如何打破常规去处理这些依赖。因此我们需要添加一些配置。

### 关于external

虽然我们使用了resolve插件，但可能我们仍然想要某些库保持外部引用状态，这时我们就需要使用external属性，来告诉rollup.js哪些是外部的类库

### 关于commonJS

rollup.js编译源码中的模块引用默认只支持 ES6+的模块方式import/export。然而大量的npm模块是基于CommonJS模块方式，这就导致了大量 npm模块不能直接编译使用

## package.json

```
 "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "rollup -c -w"
  },
```

## .babelrc

```
{
    "presets": [
      [
        "@babel/preset-env",
        {
          "modules": false,
          // "useBuiltIns": "usage"
        }
      ]
    ]
}
```

参考：[一文带你快速上手 Rollup](https://mp.weixin.qq.com/s/S-WgcO9aFrYp2tvnMMsRPg)