# 用js实现ease-out的置顶滚动效果

文档置定可以使用document.scrollingElement.scrollTop = 0 来实现

但是如果直接这么写很显然是没有这种ease-out的动画效果了（先快后慢）

- ease-out的效果实现构思

如果能每次滑动剩余距离的一半，就能实现先快后慢的效果了

```
var curPos = curPos + (curPos - targetPos) / 2;
```
- 怎么样实现连续执行滚动了

使用requestAnimation

```
window.requestAnimationFrame = function() {
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      setTimeout(callback, 17) // 60HZ ，16.7ms执行一次
    }
  }
}
function topAction(scrollEl, curPos, targetPos, rate, callback) {
  var topFun = () = > {
    curPos = curPos + (targetPos - curPos) / rate;
    if (curPos <= 1) {
      scrollEl.scrollTop = curPos;
      callback && callback();
      return;
    }
    scrollEl.scrollTop = curPos;
    requestAnimationFrame(topFun);
  }
  topFun();
}
topAction(
  document.scrollingElement, 
  document.scrollingElement.scrollTop, 
  0, 2,
  function () {
    alert('已经到顶部了！！！');
  }
);
```

[即插即用的私藏缓动动画JS小算法](https://www.zhangxinxu.com/wordpress/2017/01/share-a-animation-algorithm-js/)
[如何使用Tween.js各类原生动画运动缓动算法](https://www.zhangxinxu.com/wordpress/2016/12/how-use-tween-js-animation-easing/)