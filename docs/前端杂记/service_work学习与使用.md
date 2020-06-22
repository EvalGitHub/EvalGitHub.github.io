# service_work的学习与使用

## service_work原理？

Service worker是一个**注册在指定源和路径下的事件驱动worker**。它采用JavaScript控制关联的页面或者网站，拦截并修改访问和资源请求，细粒度地缓存资源。可以完全控制应用在特定情形（最常见的情形是网络不可用）下的表现。

## 解决了什么问题及使用场景？其他方案，及对比其它方式的区别？

解决离线，以及断网情况下给用户带来较好的体验，可支持离线缓存，提升页面载入速度，降低服务器压力。
service_work可以很好的对**资源缓存**和**自定义网络请求**进行控制。

- 相比localstorage，cache而言，service_work是运行在worker上下文，因此不能访问DOM，不会造成阻塞，使用异步来完成任务
- 只支持HTTPS，或者local本地开发（因为service_work会提供修改网络请求的能力，所以需要避免中间人攻击）

### 使用场景
TODO:

## 发展历史？
TODO:

## service的基础认知

- [cache](https://developer.mozilla.org/zh-CN/docs/Web/API/Cache)

表示用于**Request/Response对象对**的存储，作为ServiceWorker生命周期的一部分被缓存


### 关于service_work的重要概念

### 生命周期


## service的项目使用


