# document滚动相关的取值属性

在做页面根元素获取属性时候，常常会用到document。例如获取屏幕的可视区域的clientWidth，clientHeight，scrollTop
常见的手段就是

```
document.documentElement.scrollTop , document.documentElement.clientHright
```
但是有时候也看到

```
document.body.scrollTop , document.body.clientHright 
```

## document.documentElement 与 document.body有什么区别呢？？？

本质上都是从元素上获取一些信息，只是使用场景不同（有无 &lt;DOCTYPE html&gt;）；

在html文件中我们最先写的就是

```
<!DOCTYPE html>
```
> &lt;!DOCTYPE html&gt; 声明不是 HTML 标签；它是指示 web 浏览器关于页面使用哪个 HTML 版本进行编写的指令， 这句话标明当前是以html5进行编写的

就是这句话，对我们是使用 document.documentElement 还是 document.body 有着至关的影响

- 无 DOCTYPE html，使用 document.body
- 有 DOCTYPE html，使用 document.documentElement

## 介绍document.scrollingElement.scrollTop

鉴于以上的问题，可以使用 **document.scrollingElement** 来统一解决，不关你是什么版本

## 测试示例 (注意&lt;!DOCTYPE html&gt;的有无对比)

```
<!-- <!DOCTYPE html> -->
<html><head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>滚动高度获取</title>
  <style>
  .result {
    position: fixed;
    pointer-events: none;	
    top: 0; left: 0; right: 0;
    padding: 8px;
    font-size: 12px;
    max-height: 100vh;
    white-space: pre-wrap;
    overflow: hidden;
  }
  </style>
  </head>
  
  <body>
  <div style="height:4000px;"></div>
  <div id="result" class="result"></div>
  <script>
  var logs = '';
  window.addEventListener('scroll', function () {
    logs += '\ndocument.documentElement.scrollTop是：' + document.documentElement.scrollTop + '\ndocument.body.scrollTop是：' + document.body.scrollTop + '\ndocument..scrollingElement:' + document.scrollingElement.scrollTop;
    result.innerHTML = logs;
    result.scrollTop = 9999999;
  });
  </script>
  </body></html>
```