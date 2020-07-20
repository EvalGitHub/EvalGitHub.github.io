# service_work的学习与使用

## service_work原理？

Service worker是一个**注册在指定源和路径下的事件驱动worker**。它采用JavaScript控制关联的页面或者网站，拦截并修改访问和资源请求，细粒度地缓存资源。
可以完全控制应用在特定情形（最常见的情形是网络不可用）下的表现。但是可以通过消息传递的方式（postMessage）与javascript主线程进行通信。

## 解决了什么问题及使用场景？其他方案，及对比其它方式的区别？

解决离线，以及断网情况下给用户带来较好的体验，可支持离线缓存，提升页面载入速度，降低服务器压力。
service_work可以很好的对**资源缓存**和**自定义网络请求**进行控制。

- 相比localstorage，cache而言，service_work是运行在worker上下文，因此不能访问DOM，不会造成阻塞，使用异步来完成任务
- 只支持HTTPS，或者local本地开发（因为service_work会提供修改网络请求的能力，所以需要避免中间人攻击）
- 相比于http缓存而言，service worker可以做到更加细粒度的缓存控制（可以指定缓存的文件），借助service worker可以实现离线访问应用

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

>解析成功，正在安装，安装成功，正在激活，激活成功，废弃

- 解析
当serviceWork.register执行成功之后，只是代表注册的service worker文件解析成功，不代表安装或者激活了

- 安装中
注册完之后，service worker会转入installing状态，触发onInstall状态（可以在其中做些静态资源缓存的操作）

- 已安装
onInstall处理完成之后，状态变为installed，此时service worker处理等待状态，可以手动调用self.skipWating
或者重新打开页面进行激活（第一次安装之后会自动触发激活）

- 激活中
激活状态下会触发onActivate事件，可以在其中处理一些旧版本资源删除操作，在此状态下手动调用self.client.claim()，
相关页面会立即被新的service work线程控制。

- 已激活
onActivate事件中处理逻辑完成之后，状态变为已激活。

- 废弃
安装失败，激活失败会导致当前注册的service worker线程废弃；新的service worker线程激活成功，会导致旧的serive worker线程废弃

**note:** 如果是首次启动service work页面会首先尝试安装，安装成功之后会被激活。
如果现有的service work已经启用，新版本会在后台安装，但是不会被激活，处于woker in waiting，直到所有加载的页面不再使用旧的service work才会激活
新的service work（active worker）。

## service worker的更新机制

- 独立的更新进程，安装和更新都是独立的进程
- 零客户时更新，用户关闭了所有旧版页面之后，新的worker才会被激活

以下情况会导致service worker的更新

如果cdn上一个资源更新了，前端使用了service_worker，该怎么做到网页更新了？？？

- 注册一个新的service_worker

  前端打包发版，使用一个新的service worker名字，注册一个新的service worker（多次注册同一个 Service Worker 不会触发更新）

- 浏览器默认自己会去更新（这种情况下如果你的service worker文件没变化，仍然没反应，所以还是需前端发板）

  默认情况下，Service Worker 文件必定会每24小时被下载一次，如果下载的文件是新文件，
  那么它就会被重新注册和安装，但不会被激活，当不再有页面使用旧的 Service Worker 的时候，它就会被激活。 

## service worker存储空间资源的大小

## service worker线程的退出

service worker并不会一直运行，在以下条件会停止，节省系统资源

- service worker文件中存在异常（js语法错误，service worker文件激活失败，线程执行存在未捕获的异常）

- service worker线程监听事件函数是否处理完成，变为空闲状态，service worker会自动退出

- service worker执行时间过长，会自动退出（service workerJS执行时间超过30s，fetch请求超过5分钟）

- 浏览器会周期性的检查service worker线程是否可以退出（在启动线程30s之后会检查，关闭空闲超过30s的线程）

## service_work理想缓存的项目使用

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
var urlsToCache = [ // 待缓存的内容 （这个数组的内容是绝对或者相对地址）
  '/',
  '/index.js',
  '/assets/**.jpg'
];
self.addEventListener('install', function(e) {
  self.skipWaiting();
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
            // 失败的请求，以及跨域请求不进行缓存（一般指接口）
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
> caches.match(event.request) 允许我们对网络请求的资源和 cache 里可获取的资源进行匹配，
查看是否缓存中有相应的资源。这个匹配通过 url 和 vary header进行，就像正常的 http 请求一样。

> Response() 构造函数允许你创建一个自定义的response

> response.type指的是响应类型，只读，取值包括
 - basic: 同源响应
 - cors: 跨域请求
 - error: 网络错误

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

**note**

使用servive worker用户第一次访问页面的时候，资源请求时早与service worker安装的，所以静态资源是无法缓存的，
只有当用户第二次访问时，这些资源才会被缓存。

[service worker的使用](https://developers.google.com/web/fundamentals/primers/service-workers/registration)

[如何使用service work](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API/Using_Service_Workers)

[w3c service worker](https://w3c.github.io/ServiceWorker/#service-worker-registration-update)