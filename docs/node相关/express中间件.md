# express中间件

## express中间件类型

- 应用层中间件

常用实现方法：app.use / app.method

```
var app = express()

app.use(function (req, res, next) {
  console.log('Time:', Date.now())
  next()
})
app.use('/user/:id', function (req, res, next) {
  console.log('Request Type:', req.method)
  next()
})
```

- 路由层中间件

```
var app = express()
var router = express.Router()

// a middleware function with no mount path. This code is executed for every request to the router
router.use(function (req, res, next) {
  console.log('Time:', Date.now())
  next()
})
```

- 错误处理中间件

```
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})
```

- 内置中间件

> express.static，express.json，express.urlencoded

- 第三方中间件 - [来自社区](https://www.expressjs.com.cn/resources/middleware.html)

```
var express = require('express')
var app = express()
var cookieParser = require('cookie-parser')
// load the cookie-parsing middleware
app.use(cookieParser())
```

## 中间件解释

> 中间件是一个**函数模块**，他可以修改request object, response object；结束request-response循环，调用stack中的下一个中间件。

如果当前中间件没有并不打算结束整个request-response cycle，需要调用 **next()** 将控制权交给下一个中间件，否则将会使得请求挂起。

如果不指定路径，那么就意味着每一个请求都会触发这个中间件。

**关于next(route)**

跳过当前路由分组中的剩余路由

```
var stack = [
  {path: '/user/:id', fns: [fn1, fn2, fn3], // 路由组1
  {path: '/user/:id', fns: [fn4, fn5, fn5] // 路由组2
]
```

如果没有next('route')，一路next()调用下去的话，调用顺序是这样的：
fn1 -> fn2 -> fn3 -> fn4 -> fn5 -> fn6；
调用next('route')然后就变成了 fn1 -> fn4 -> fn5 -> fn6

## 自己写一个中间件

首先需要明确的是中间件是一个函数模块，如果在这个中间中没有想结束整个response-request cycle，那么就需要执行next()方法，将控制权交给后面的中间件。
常见的结束循环的方法，res.send/render/json。

下面这个中间件来自项目中的需求，

**背景：**在网页访问这个页面，而且在页面渲染之前需要判断某个活动的类型，对应前端返回不同的页面组件

**方案：**在server层获取路径，拿到活动id调用接口判断类型，做路径处理

```
const app_config = require('../config')()
const http = require('https');
const url = require('url');
function getStudioType(studioId) {
  let url = app_config.runtime.api.host + `/web/studios/${studioId}`;
  let data = '';
  return new Promise((resolve, reject) => {
    http.get(url, function (res) {
      res.setEncoding('utf8');  
      res.on("data", (chunk) => {
        data += chunk;
      }).on("end", () => {
        resolve(JSON.parse(data));
        })
      }).on("error", (e) => {
        reject(e)
    }).end()
  });
}

module.exports = function(req, res, next) {
  let reqPath = url.parse(req.url);
  if (reqPath.pathname.search(/studio/) > -1) {
    let studioId = reqPath.pathname.slice(reqPath.pathname.lastIndexOf('/')+1);
    getStudioType(studioId).then((httpRes) => {
      if (httpRes.platform === 1) { // pc端的活动，手机模式不进行适配
        req.url = req.url + `?paltform_type=pc`;
      }
      next();
    }).catch((err) => {
      console.log(err);
    });
  } else {
    next()
  }
}
```

server层使用

```
app.use(require('./define_active_type'))
app.use(require('./head_server'))
```

## express中间件原理分析

中间件的注册方式是使用app.use(some middleware)，如果要执行下一个中间件就使next()
因此我们的重点是研究app.use()，和next()

源码文件：express/lib/application.js

```
app.use = function use(fn) {
  var offset = 0;
  var path = '/';

  // default path to '/'
  // disambiguate app.use([fn])
  if (typeof fn !== 'function') { // 判断第一个参数是否是函数如果不是
    var arg = fn;

    while (Array.isArray(arg) && arg.length !== 0) { // 如果是一个数组的话，只取值数组中的第一个值
      arg = arg[0];
    }

    // first arg is the path
    if (typeof arg !== 'function') { // 如果不是函数，将offset偏移一位
      offset = 1;
      path = fn;
    }
  }

  var fns = flatten(slice.call(arguments, offset)); // 获取所有的回调函数,形成一个数组

  if (fns.length === 0) {
    throw new TypeError('app.use() requires a middleware function')
  }

  // setup router
  this.lazyrouter();      // 初始化router
  var router = this._router;

  fns.forEach(function (fn) { // 遍历这个数组，将path与函数对应起来可能会有多个回调函数，但是对应的路径是唯一的）
    // non-express app
    if (!fn || !fn.handle || !fn.set) {
      return router.use(path, fn);  // 使用router.use进行存储对应关系
    }

    debug('.use app under %s', path);
    fn.mountpath = path;
    fn.parent = this;

    // restore .app property on req and res
    router.use(path, function mounted_app(req, res, next) {
      var orig = req.app;
      fn.handle(req, res, function (err) {
        setPrototypeOf(req, orig.request)
        setPrototypeOf(res, orig.response)
        next(err);
      });
    });

    // mounted an app
    fn.emit('mount', this);
  }, this);

  return this;
};
```

查看this._router的定义

```
app.lazyrouter = function lazyrouter() {
  if (!this._router) {
    this._router = new Router({ // 使用Router进行实例化
      caseSensitive: this.enabled('case sensitive routing'),
      strict: this.enabled('strict routing')
    });

    this._router.use(query(this.get('query parser fn')));
    this._router.use(middleware.init(this));
  }
};
```

Router的源码 express/lib/router/index.js

```
proto.use = function use(fn) {
  var offset = 0;
  var path = '/';

  // default path to '/'
  // disambiguate router.use([fn])
  if (typeof fn !== 'function') {
    var arg = fn;

    while (Array.isArray(arg) && arg.length !== 0) {
      arg = arg[0];
    }

    // first arg is the path
    if (typeof arg !== 'function') {
      offset = 1;
      path = fn;
    }
  }

  var callbacks = flatten(slice.call(arguments, offset));

  if (callbacks.length === 0) {
    throw new TypeError('Router.use() requires a middleware function')
  }

  // 前面的逻辑同app.use相同，这里不做分析
  for (var i = 0; i < callbacks.length; i++) {
    var fn = callbacks[i];

    if (typeof fn !== 'function') {
      throw new TypeError('Router.use() requires a middleware function but got a ' + gettype(fn))
    }

    // add the middleware
    debug('use %o %s', path, fn.name || '<anonymous>')

    var layer = new Layer(path, {  // 将fn回调函数以及path的对应关系生成一个Layer，然后存储在this.stack中，stack就是一个数组
      sensitive: this.caseSensitive,
      strict: false,
      end: false
    }, fn);

    layer.route = undefined;

    this.stack.push(layer); // 将中间件存储在stack数组中
  }

  return this;
};
```

所以一句话总结就是express中是先将中间件与路径生成一个layer，然后以数组的形式将中间件函数存储在一个自定义的stack数组中，next方法就是执行
stack中下一个中间件，通过下标加一的方法。

express()实例app的next()方法定义在 “express/lib/router/index.js”中的handle方法中

```
function next(err) {
    var layerError = err === 'route'
      ? null
      : err;

    // remove added slash
    if (slashAdded) { // 如果包含‘/’
      req.url = req.url.substr(1);
      slashAdded = false;
    }

    // restore altered req.url
    if (removed.length !== 0) {
      req.baseUrl = parentUrl;
      req.url = protohost + removed + req.url.substr(protohost.length);
      removed = '';
    }

    // signal to exit router
    if (layerError === 'router') {
      setImmediate(done, null)
      return
    }

    // no more matching layers
    if (idx >= stack.length) {
      setImmediate(done, layerError);
      return;
    }

    // get pathname of request
    var path = getPathname(req);

    if (path == null) {
      return done(layerError);
    }

    // find next matching layer
    var layer;
    var match;
    var route;

    while (match !== true && idx < stack.length) { // 这里会去循环整个stack数组
      layer = stack[idx++];
      match = matchLayer(layer, path);  // path，与layer的对应匹配，如果匹配上了就设置为true
      route = layer.route;

      if (typeof match !== 'boolean') {
        // hold on to layerError
        layerError = layerError || match;
      }

      if (match !== true) {
        continue;
      }

      if (!route) {
        // process non-route handlers normally
        continue;
      }

      if (layerError) {
        // routes do not match with a pending error
        match = false;
        continue;
      }

      var method = req.method;
      var has_method = route._handles_method(method);

      // build up automatic options response
      if (!has_method && method === 'OPTIONS') {
        appendMethods(options, route._options());
      }

      // don't even bother matching route
      if (!has_method && method !== 'HEAD') {
        match = false;
        continue;
      }
    }

    // no match
    if (match !== true) {
      return done(layerError);
    }

    // store route for dispatch on change
    if (route) {
      req.route = route;
    }

    // Capture one-time layer values
    req.params = self.mergeParams
      ? mergeParams(layer.params, parentParams)
      : layer.params;
    var layerPath = layer.path;

    // this should be done for the layer
    self.process_params(layer, paramcalled, req, res, function (err) {
      if (err) {
        return next(layerError || err);
      }

      if (route) {
        return layer.handle_request(req, res, next); // 通过handle_request执行这个中间件
      }

      trim_prefix(layer, layerError, layerPath, path);
    });
  }
```

handle_request

```
Layer.prototype.handle_request = function handle(req, res, next) {
  var fn = this.handle;

  if (fn.length > 3) {
    // not a standard request handler
    return next();
  }

  try {
    fn(req, res, next);
  } catch (err) {
    next(err);
  }
};
```







