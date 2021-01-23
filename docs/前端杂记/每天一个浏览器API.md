# 每天一个浏览器的API

## window.getSelection

> 返回一个section对象，表示用户选择的文本范围或光标的当前位置

```
var selection = window.getSelection();
var selContent = selection.getRangeAt(0);
var range1= selContent.getRangeAt(0);
console.log(range1.startContainer);
```

[关于window.getSelection](https://blog.csdn.net/weixin_42420703/article/details/84892528)

## Text.splitText()

> splitText() 方法按照指定的 offset 把文本节点分割为两个节点


## event.target.closet

> 遍历元素和他的父级别元素，至到返回目的元素

```
<article>
  <div id="div-01">Here is div-01
    <div id="div-02">Here is div-02
      <div id="div-03">Here is div-03</div>
    </div>
  </div>
</article>

var el = document.getElementById('div-03');

var r1 = el.closest("#div-02");
// returns the element with the id=div-02

var r2 = el.closest("div div");
// returns the closest ancestor which is a div in div, here it is the div-03 itself

var r3 = el.closest("article > div");
// returns the closest ancestor which is a div and has a parent article, here it is the div-01

var r4 = el.closest(":not(div)");
```

## Window.speechSynthesis | SpeechSynthesisUtterance

> 语音api

```
// speechSynthesis.getVoices() 可以获取浏览器支持的语音
var u = new SpeechSynthesisUtterance();
u.text = "文字播放";
u.lang = 'zh-HK'; // ja-JP 
u.rate = 8
speechSynthesis.speak(u);
```
https://github.com/mdn/web-speech-api/
