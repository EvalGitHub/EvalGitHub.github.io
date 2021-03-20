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


