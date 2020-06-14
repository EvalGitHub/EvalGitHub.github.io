# 混合开发jsBridge及原理？

混合开发使用少不了原生与js之间的方法互调，解决方案就是[Dsbridge](https://github.com/wendux/DSBridge-Android/blob/master/readme-chs.md)


## 使用方法

- 初始化dsBridge

>/cdn方式引入初始化代码(中国地区慢，建议下载到本地工程)
//<script src="https://unpkg.com/dsbridge@3.1.3/dist/dsbridge.js"> </script>
//npm方式安装初始化代码
//npm install dsbridge@3.1.3
var dsBridge=require("dsbridge")

### 原生传递值给js

- js定义一个函数

js接受传值，直接通过dsBridge.register()方法接受，第一个参数是约定好的注册名与原生保持一致，
第二个参数js方法，data就是原生传递的值，方法的return 返回值就是传递给原生的

```
dsBridge.register('addValue', function (data) {
  var value = JSON.parse(data);
  document.getElementById("test").innerHTML = value.html;
  return "success"
});
```

- 原生通过webview去调用

通过webView.callHandler()方法 将第一个参数约定为注册函数的名称，与js相同
第二个参数是需要传递的值；第三个参数是接受js返回的回调，可用于js接受成功后再去通知原生。

```
dwebView.callHandler("addValue",new Object[]{3,4},new OnReturnValue<Integer>(){
  @Override
  public void onValue(Integer retValue) {
    Log.d("jsbridge","call succeed,return value is "+retValue);
  }
});
```

### js传值给原生(js调用原生fun)

- 原生通过addJavascriptObject注册一个方法

>方法名与注册名一致；第一个参数是传递的值；第二个参数可回调信息给js

```
public class JsEchoApi {
  @JavascriptInterface
  public Object syn(Object args) throws JSONException {
    return  args;
  }

  @JavascriptInterface
  public void asyn(Object args,CompletionHandler handler){
    handler.complete(args);
  }
}
//namespace is "echo"
dwebView.addJavascriptObject(new JsEchoApi(),"echo");
```

- js通过dsBridge调用

>第一个参数是约定注册的名称，与原生接受处方法名一致；   第二个参数是要传递的值；   第三个参数是接受原生返回的回调。

```
// call echo.syn
var ret=dsBridge.call("echo.syn",{msg:" I am echoSyn call", tag:1})
alert(JSON.stringify(ret))  
// call echo.asyn
dsBridge.call("echo.asyn",{msg:" I am echoAsyn call",tag:2},function (ret) {
  alert(JSON.stringify(ret));
})
```

[DSBridge for Android](https://github.com/wendux/DSBridge-Android/blob/master/readme-chs.md)

## 原理解析

- js如何调用原生方法

以安卓为例：

方案一：
**将java对象映射为一个js对象**，并通过Webview提供的方法【addjavascriptinterface|@javascriptinterface】(版本不同api可能不同)将注入到js的window上，这样js就可以调用

方案二：
**系统提供了一些方法也会触发java某些事件的回调** 例如console，alert，confirm，prompt

安全问题：由于addjavascriptinterface存在[安全问题](https://blog.csdn.net/leehong2005/article/details/11808557)，因此dsbridge采用两种相结合的方式。

1. 当安卓版本高于 4.2 时，使用 addJavascriptInterface 的方式向 webview 注入 java 的对象；
2. 当安卓版本低于 4.2 的时候，采取给 ua 添加上一串字符串，标注原生已经初始化完 dsbridge 了，此时就采取方法2通信。

在 js 中，如果在 window 下能够找到通过 addJavascriptInterface 注入的对象，则使用它；
否则，检查 useragent 中是否存在约定好的字符串（说明原生准备好了 dsbridge），这个时候，一般通过 prompt 来传递信息（因为通过 prompt 接口可以拿到返回值），如

```
prompt("_dsbridge=" + method, arg);
```

- 原生如何调用js的方法：

以安卓为例：

如果原生要调用web的方法，一般需要与web约定好某个挂载在window下的接口，通过 WebView.loadUrl 的方式去调用它。

```
WebView.loadUrl("javascript:window.__say_hello('hello, ***')");
```
但是这个方法只能调用那个方法，安卓4.4+之后，又多了一个接口evaluateJavascript，这个方法需要两个参数：一个url，以及一个获得返回值的回调函数。

因此，在 dsbridge 中，对这个方法做了封装，如果安卓版本小于4.4，则使用 loadUrl 的方法，否则使用 evaluateJavascript。

```
private void _evaluateJavascript(String script) {
  if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
    DWebView.super.evaluateJavascript(script, null);
  } else {
    super.loadUrl("javascript:" + script);
  }
}
```

https://www.yuque.com/docs/share/359ce3cd-e9b3-4742-9a41-f18dce553c5c?#