
# 收集一些不寻常的异步问题

## 红灯 3s 亮一次，绿灯 1s 亮一次，黄灯 2s 亮一次；如何让三个灯不断交替重复亮灯？

```
function red () {
  console.log('red');
}
function green() {
  console.log('green');
}
function yellow() {
  console.log('yellow')
}

function dealFun(time, funCallback) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      funCallback();
      resolve();
    }, time)
  }) 
}

function step() {
  dealFun(3000, red).then(() => {
    dealFun(1000, green)
  }).then(() => {
    dealFun(2000, yellow)
  }).then(() => step());
}
step();
```

尝试把上面的代码放在浏览器中会发现，执行速度并不是我们预期的那样，仔细分析会发现问题就出现在

```
function step() {
  dealFun(3000, red).then(() => {
    dealFun(1000, green)
  }).then(() => {
    dealFun(2000, yellow)
  }).then(() => step());
}
```
在resolve中如果不手动返回resolve，会默认返回一个resoive

用代码翻译：

```
function step() {
  dealFun(3000, red).then(() => {
    dealFun(1000, green)
    return Promise.resolve();
  }).then(() => {
    dealFun(2000, yellow)
    return Promise.resolve();
  }).then(() => step());
}
```

会发现**return Promise.resolve();** 并不会等待**dealFun(1000, green)**执行完毕再执行，所以导致执行效果与我们预期不同；

解决思路： 

```
function step() {
  dealFun(3000, red).then(() => {
    return dealFun(1000, green)
  }).then(() => {
    return dealFun(2000, yellow)
  }).then(() => step());
}

// or 

function step() {
  dealFun(3000, red).then(() => dealFun(1000, green)).then(() => dealFun(2000, yellow)).then(() => step());
}
```

这样的话就阻止了默认的返回resolve。

## 请写出下面的结果？

```
async function async1() {
  console.log('async1 start')
  await async2()
  console.log('async1 end')
}

async function async2() {
  console.log('async2')
}

console.log('script start')

setTimeout(function() {
  console.log('setTimeout') 
}, 0)  

async1()

new Promise(function(resolve) {
  console.log('promise1')
  resolve()
}).then(function() {
  console.log('promise2')
})

console.log('script end')
```
async/await是promise的语法糖（对promise做的二次封装）。

在一开始写出的答案是：
> script start -> async1 start -> promise1 -> script end  -> async2 -> async1 end -> promise2 -> setTimeout

但是真正的答案： 
> script start -> async1 start -> async2 -> promise1 -> script end -> async1 end -> promise2 -> setTimeout

上面的答案出现的错误就在与没能真正理解async/await，所以导致对于async2的执行时间判断有偏差。

先回顾下js基础知识，js中存在的任务可分为两种，一中是可以立即执行的同步任务，一种是需要等待某些时间才可以执行的异步任务，对于单线程的js来说，如果不对异步任务做特殊处理就会导致执行阻塞。因此js中出现了异步任务队列（专门用于收集异步任务，待主程序执行完同步任务，再来循环遍历这个异步人任务队列，这就是常说的js事件循环event loop）。

**同步任务**

> 当前主线程将要消化执行的任务，这些任务一起形成执行栈（execution context stack）

**异步任务**

> 不进入主线程，而是进入任务队列（task queue），即不会马上进行的任务。

- 异步任务可分： 
  - 宏任务
    - setTimeout
    - setInterval
    - I/O
    - 事件
    - postMessage
    - setImmediate (Node.js，浏览器端该 API 已经废弃)
    - requestAnimationFrame
    - UI 渲染
  - 微任务 
    - Promise.then
    - MutationObserver
    - process.nextTick (Node.js)

[Event Loop和js引擎，渲染引擎的关系](https://mp.weixin.qq.com/s/g_-blGV4CVF5EogYZaPMzQ)

**关于执行顺序总体来说就是： 同步任务 >  微任务 > 宏任务**

```
分析： 

先看同步任务： 

console.log('script start') 优先执行  --- script start (1)

setTimeout  添加异步任务队列

async1()
  console.log('async1 start')      ----- async1 start (2)
  await async2()                   ----- async2       (3)
  console.log('async1 end') 添加到异步任务队列


Promise() 
  console.log('promise1')           ---- promise1     (4)
  console.log('promise2') 添加到异步任务队列

console.log('script end')           ---- script end   (5)

至此同步任务执行完毕，开始执行异步任务
微任务Promise.then优先与setTimeout

console.log('async1 end')          ---- async1 end    (6)

console.log('promise2')            ---- promise2      (7)

setTimeout                          --- setTimeout    (8)
```

**补充两点：** 

- Promise.then是异步，但是Promise不是异步 因此 “console.log('promise1')“会同步执行。
- async/await是promise的语法糖
  - async 声明的函数，其返回值必定是 promise 对象，如果没有显式返回 promise 对象，也会用 Promise.resolve() 对结果进行包装，保证返回值为 promise 类型
  - 如果 await 右侧表达逻辑是个 promise，让出主线程，继续执行 async 函数外的同步代码，等待同步任务结束后，且该 promise 被 resolve 时，继续执行 await 后面的逻辑
如果 await 右侧表达逻辑不是 promise 类型，那么仍然异步处理，将其理解包装为 promise， async 函数之外的同步代码执行完毕之后，会回到 async 函数内部，继续执行 await 之后的逻辑

```
async function async1() {
  console.log('async1 start')
  await async2()
  console.log('async1 end')
}
```
等价与
```
function async1() {
  new Promise(function(resolve, reject) {
    console.log('async1 start')
    async2()
    resolve()
  })
}

function async2 () {
  return new Promise(function(resolve, reject) {
    console.log('async2')
    resolve()
  }).then(() => {
    console.log('async1 end')
  })
}
async1()
```