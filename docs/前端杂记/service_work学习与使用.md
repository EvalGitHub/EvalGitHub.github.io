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

>cache.match(request, options)

返回一个 Promise对象，resolve的结果是跟 Cache 对象匹配的第一个已经缓存的请求

>Cache.matchAll(request, options)

返回一个Promise 对象，resolve的结果是跟Cache对象匹配的所有请求组成的数组

>Cache.add(request)

抓取这个URL, 检索并把返回的response对象添加到给定的Cache对象.这在功能上等同于调用 fetch(), 然后使用 Cache.put() 将response添加到cache中.

>Cache.addAll(requests)

抓取一个URL数组，检索并把返回的response对象添加到给定的Cache对象。

>Cache.put(request, response)

同时抓取一个请求及其响应，并将其添加到给定的cache。

>Cache.delete(request, options)

搜索key值为request的Cache 条目。如果找到，则删除该Cache 条目，并且返回一个resolve为true的Promise对象；如果未找到，则返回一个resolve为false的Promise对象。

>Cache.keys(request, options)

返回一个Promise对象，resolve的结果是Cache对象key值组成的数组。

### 生命周期

>下载-> 安装 -> 激活

1. service worker URL 通过 serviceWorkerContainer.register() 来获取和注册。
2. 如果注册成功，service worker 就在 ServiceWorkerGlobalScope 环境中运行； 这是一个特殊类型的 woker 上下文运行环境，与主运行线程（执行脚本）相独立，同时也没有访问 DOM 的能力。
3. 受 service worker 控制的页面打开后会尝试去安装 service worker。最先发送给 service worker 的事件是安装事件
4. 当 oninstall 事件的处理程序执行完毕后，可以认为 service worker 安装完成了。
5. 下一步是激活。当 service worker 安装完成后，会接收到一个激活事件(activate event)。 onactivate 主要用途是清理先前版本的service worker 脚本中使用的资源。
6. ervice Worker 现在可以控制页面了

**note** 如果是首次启动service work页面会首先尝试安装，安装成功之后会被激活。
如果现有的service work已经启用，新版本会在后台安装，但是不会被激活，处于woker in waiting，直到所有加载的页面不再使用旧的service work才会激活
新的service work（active worker）。

## service的项目使用

1. 注册你的worker

```
useServiceWork();
function useServiceWork() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      // 这个文件的url 是相对于 origin， 而不是相对于引用它的那个 JS 文件
      navigator.serviceWorker.register('/sw.js', 
      { //  scope 参数是选填的，可以被用来指定你想让 service worker 控制的内容的子目录
        scope: '/' 
      }).then(function(registration) {
        // Registration was successful
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function(err) {
        // registration failed :(
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }
}
```
2. 安装和激活

```
var CACHE_NAME = 'my-site-cache_2ss003e'; // 缓存名字
var urlsToCache = [ // 待缓存的内容
  '/',
  '/index.js',
  '/assets/**.jpg'
];
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache); // 向缓存中添加文件
      }).catch((err) => {
        console.log(err);
      })
  );
});
```
>ExtendableEvent.waitUntil()  方法——这会确保Service Worker 不会在 waitUntil() 里面的代码执行完毕之前安装完成。

3. 自定义请求的响应

>可以给 service worker 添加一个 fetch 的事件监听器，接着调用 event 上的 respondWith() 方法来劫持我们的 HTTP 响应。

```
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      if (response) { // 命中缓存,直接返回缓存
        return response
      }
      // 未缓存的先请求再缓存
      var fetchRequest = e.request.clone(); // 请求和响应流只能被读取一次
      return fetch(fetchRequest).then(
        function(response) {
          if(!response || response.status !== 200 || response.type !== 'basic') { 
            // 失败的请求，以及非自身发起的请求不进行缓存
            return response;
          }

          // 进行页面缓存
          var responseToCache = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, responseToCache);
          });
          return response;
        }
      )
    }).catch(function(e) { // 如果出现错误就显示配置的页面
      return new Response(
        errResponseContent,
        {headers: {"Content-Type": "text/html"}}
      )  
      // or 
      // return caches.match('/assets/error.jpg');
    })
  );
})
```
>caches.match(event.request) 允许我们对网络请求的资源和 cache 里可获取的资源进行匹配，
查看是否缓存中有相应的资源。这个匹配通过 url 和 vary header进行，就像正常的 http 请求一样。

>Response() 构造函数允许你创建一个自定义的 response

```
new Response('<p>Hello from your friendly neighbourhood service worker!</p>', {
  headers: { 'Content-Type': 'text/html' }
})
```
4. 更新你的 service worker，删除旧缓存

>如果你的 service worker 已经被安装，但是刷新页面时有一个新版本的可用，新版的 service worker 会在后台安装，但是还没激活。当不再有任何已加载的页面在使用旧版的 service worker 的时候，新版本才会激活。

```
self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (CACHE_NAME !== cacheName) {
            return caches.delete(cacheName);
          }
        })
      )
    })
  )
});
```

[如何使用service work](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API/Using_Service_Workers)
