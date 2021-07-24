# webpack, esbuild, rollup比对

> 当我们构建越来越大的应用时，需要处理的js代码量呈指数级增长，导致需要很长的时间才能启动开发服务器；即使使用
HMR，文件修改之后也需要几秒钟才能在浏览器中反映出来。

## webpack [bundle based dev server] 为什么会慢？

每次构建的时候webpack都会将js代码，以及依赖的模块重新构建，随着项目越来越大，它的构建时间也会越来越长; 即使提供了一些优化手段，例如第三方不常更改库文件
可以通过webpack.dll进行优化处理，但是对于与大量的源码并不能做编译优化处理。

![avatar](../assets/bunlde_server.png)

## vite 为啥会快?

vite 将应用中的模块分为依赖，源码两类。

- 依赖：

使用esbuild的预构建，**esbuild是通过GO语言实现**，这也是它编译快的原因（比以 JavaScript 编写的打包器预构建依赖快 10-100 倍）

- 源码：

对于源码部分，vite使用原声ESM方式（**按需加载**），如果文件变更了，在就会发送请求，vite会拦截
请求，针对性的进行转化。（只在当前屏幕上实际使用的代码才会进行处理）

![avatar](../assets/esm.png)

## esbuid

vite的开发环境就使用使用的esbuild为基础，提供了极快的编译速度，并且在原先的热更新基础上
利用了HTTP缓存来加速整个页面的重新加载；但是esbuild也有暂时做不了的事情 ---- 代码分割
& css处理，所以在vite生产部署的时候使用了rollup。

## Rollup
 
rollup支持文件打包编译压缩，代码分割，更好的tree-shaking等，因此他是很好的js模块打包工具，但是不支持热更新(HMR)，所以在开发环境不会使用rollup。