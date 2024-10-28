# vite剖析

## vite执行流程梳理

![avatar](../assets/vite.svg)
## 构建本地服务

使用node的http模块创建一个静态服务，然后监听
```
let httpServer = require('http').createServer(app).listen(port);
```

- 在vite中如果首次的端口被占用会，会自动将端口加1，启动；实现方式就是监听错误日志，如果被占用就自动加1

```
const onError = (e: Error & { code?: string }) => {
    if (e.code === 'EADDRINUSE') {
    if (options.strictPort) {
        httpServer.removeListener('error', onError)
        reject(new Error(`Port ${port} is already in use`))
    } else {
        info(`Port ${port} is in use, trying another one...`)
        httpServer.listen(++port) // 将端口自动加一
    }
    } else {
    httpServer.removeListener('error', onError)
    reject(e)
    }
}
// 监听启动的错误
httpServer.on('error', onError); 
```

- vite会将localhost以及网络ip端口都会打印出来

实现方式：使用node的 "os"模块

```
const interfaces = os__default.networkInterfaces();
// console.log('interfaces', interfaces);
Object.keys(interfaces).forEach(
    (key) => (interfaces[key] || [])
    .filter((details) => details.family === 'IPv4')
    .map((detail) => {
    return {
        type: detail.address.includes('127.0.0.1')
            ? 'Local:   '
            : 'Network: ',
        host: detail.address.replace('127.0.0.1', hostname)
    };
})
    .forEach(({ type, host }) => {
    const url = `${protocol}://${host}:${source.bold(port)}${base}`;
    info(`  > ${type} ${source.cyan(url)}`);
}));
```
## 监听文件的改变&热更新

- 是如何监听到文件的改变的

使用开源库 [chokidar](https://www.npmjs.com/package/chokidar)

```
// 监听整个目录的改变
const watcher = chokidar.watch(path.resolve(root), {
    ignored: ['**/node_modules/**', '**/.git/**', ...ignored],
    ignoreInitial: true,
    ignorePermissionErrors: true,
    disableGlobbing: true,
    ...watchOptions
}) as FSWatcher;

// 文件的改变
watcher.on('change', async (file) => {
    file = normalizePath(file)
    // invalidate module graph cache on file change
    moduleGraph.onFileChange(file)
    if (serverConfig.hmr !== false) {
        try {
            await handleHMRUpdate(file, server)
        } catch (err) {
            ws.send({
                type: 'error',
                err: prepareError(err)
            })
        }
    }
})

// 文件的添加
watcher.on('add', (file) => {
    handleFileAddUnlink(normalizePath(file), server)
})

// 文件的删除
watcher.on('unlink', (file) => {
    handleFileAddUnlink(normalizePath(file), server, true)
})
```
## 文件改变是怎么实现浏览器实时更新的

通过websocket进行实时通信, 发送请求，请求的url中包含地址，文件名，通过解析相关信息，拼接成完整的文件地址，读取文件内容，返回到对应请求。

- 浏览器怎么发的请求？

使用import来对文件进行请求，因为import本身就是一个promise, 发送请求，然后返回读取的文件内容


## vite对比市场上的其他有什么优劣点 

### vite的预构建
代码分为两部分，业务代码和第三方组件库代码，
- 对于业务源码部分不会进行打包，直接使用es module的形式发送Http请求进行加载；
- 对于第三方组件库代码仍需要进行bundle打包，其过程使用的是esbuild, 这样处理的原因是第三方组件
1. 第三方组件库可能不支持es module的形式，需要进行转换
2. 瀑布请求的问题，依赖嵌套，浏览器大量请求，会阻塞浏览器进程。

因此依赖预构建主要做了两件事情：
- 一是将其他格式(如 UMD 和 CommonJS)的产物转换为 ESM 格式，使其在浏览器通过
``` <script type="module"><script>的方式正常加载。```

- 二是打包第三方库的代码，将各个第三方库分散的文件合并到一起，减少 HTTP 请求数量，避免页面加载性能劣化。

而这两件事情全部由性能优异的 Esbuild (基于 Golang 开发)完成，而不是传统的 Webpack/Rollup，所以也不会有明显的打包性能问题，反而是 Vite 项目启动飞快(秒级启动)的一个核心原因；并且对于依赖的http请求都会设置强缓存，避免重复请求。

上面提到了预构建中本地文件系统的产物缓存机制，而少数场景下我们不希望用本地的缓存文件，比如需要调试某个包的预构建结果，我推荐使用下面任意一种方法清除缓存:

删除node_modules/.vite目录。
在 Vite 配置文件中，将server.force设为true。(注意，Vite 3.0 中配置项有所更新，你需要将 optimizeDeps.force 设为true)
命令行执行npx vite --force或者npx vite optimize。
Vite 项目的启动可以分为两步，第一步是依赖预构建，第二步才是 Dev Server 的启动，npx vite optimize相比于其它的方案，仅仅完成第一步的功能。

### esbuild的优势
1. esbuild支持浏览器的esm的方式对资源进行加载并利用了缓存，而不需要像webpack样去将所有代码进行编译打包成bundle的形式。转换为浏览器支持的模式，所以每一次代码的编辑都会重新构建编译，花费时间较长
2. Esbuild使用go语言进行编码，执行效率要高于js的单线程，esbuild会将不是esm的代码编译成esm的形式
3. Vite 在首次请求模块时进行编译，并将结果缓存起来，这样后续请求相同的模块时可以直接从缓存中读取，避免重复工作，进一步提高了速度。

### 为什么生产用rollup?
1. Rollup很好的支持js打包,   treeShaking, 代码分割等能力都比esbuild要更加好，相比webpack而言执行效率更快
2. rollup社区生态&插件机制成熟
3. rollup支持esm的形式， 内置默认支持treeShaking

但是在vite2.6之后生产环境已经将esbuild以插件的形式用于js和css的压缩处理

