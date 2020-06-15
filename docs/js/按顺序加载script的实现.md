# 按顺序加载script的实现

**背景**

前端经常会加载很多很多js，如果多个模块之间有依赖执行的先后顺序，我们该怎么？em：c.js的执行依赖b.js，b.js的执行
依赖a.js，那么我们必须实现这些模块的按序加载。

**思路**

动态创建script，监听他的onload的事件，在每个onload事件中加载后一个js文件，

**代码实现**

```
// 按照顺序加载js
export function loadScript(url:string, callback?:() => void) {
  let script:any = document.createElement("script");
  script.type = "text/javascript";
  script.defer='defer';
  script.src = url;
  document.body.appendChild(script);
  if (script.readyState) { // ie  
    /*
      “uninitialized” – 原始状态 
      “loading” – 下载数据中..
      “loaded” – 下载完成
      “interactive” – 还未执行完毕.
      “complete” – 脚本执行完毕.
    */
    return new Promise((resolve, reject) => {
      script.onreadystatechange = function() {
        if (script.readyState === "loaded" || script.readyState === "complete") {
          script.onreadystatechange = null;
          callback && callback();
          resolve(0);
        }
      };
    });
  } else {
    return new Promise((resolve, reject) => {
      script.onload = function() { // ie并不支持 script.onload
        callback && callback();
        resolve(0);
      };
      script.onerror = function() {
        // callback();
        resolve(0);
      };
    })
  }
}
```

**使用**

```
async componentDidMount() {
  await loadScript("https://connect.qq.com/qc_jssdkeee.js", () => {});
  await loadScript("https://nemo.codemao.cn/lib/tingyun-rum.js", () => {});
  await loadScript("https://kn-cdn.codemao.cn/nemoy/jquery.dll.js?5958b534d8d5ab510f20", () => {});
  await loadScript("https://kn-cdn.codemao.cn/nemoy/main.334e0cb7.js", () => {});
}
```