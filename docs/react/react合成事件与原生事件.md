
# react合成事件与原生事件

### 合成事件存在的原因？
如果DOM上绑定过多事件处理函数，整个页面响应以及内存占用都会有影响，另外还有各种兼容性引起的事件差异性问题，所以react实现了一个中间层---合成事件（SyntheticEvent）。

在原生js开发中如果一个元素被重复绑定相同事件，则这些事件会按绑定顺序依次执行，如果想终止，可以使用 <strong>event.stopImmediatePropagation</strong>。

MDN：
<https://developer.mozilla.org/zh-CN/docs/Web/API/Event/stopImmediatePropagation>
### 合成事件的原理？
react中，如果需要绑定事件

```
<div onClick={this.getUserName.bind(this)}>
  获取用户名
</div>
```
react并不是将事件真正的绑定在这个div元素上，而是在document处监听所有支持的事件，当事件发生并<strong>冒泡</strong>至document处时，react将事件内容封装并交由真正的处理函数运行。

### 如何在react中使用原生事件？
在一些情况下我们拥有使用原生事件的必要原因（window上的操作，全局弹窗关闭）
与合成事件相比，原生事件是真实绑定在DOM上，所以一般在componentDidMount阶段进行操作，
在componentWillUnmount进行事件的解除避免内存泄漏。

> 1）除兼容所有浏览器外，它还拥有和浏览器原生事件相同的接口，包括 stopPropagation() 和 preventDefault()；
你需要使用浏览器的底层事件时，只需要使用 nativeEvent 属性来获取即可。

>2）如果因为某些原因，当你需要使用浏览器的底层事件时，只需要使用 nativeEvent 属性来获取即可。

#### 事件池
>SyntheticEvent(合成事件是合并而来)，这意味着这个对象可能会被重用，而且在事件回调函数被调用之后，所有的属性都会无效，出于性能考虑，你不能通过异步访问事件。

```
 deleteTest (event:any) {
 	 // event.persist()；
    console.log(event);
    console.log(event.nativeEvent);
    console.log(event.type); // => "click"
    const eventType = event.type; // => "click"
  
    setTimeout(function() {
      console.log(event.type); // => null 报错
      console.log(eventType); // => "click"
    }, 0);
  };
```

如果你想异步访问事件属性，你需在事件上调用 event.persist()，此方法会从池中移除合成事件，允许用户代码保留对事件的引用。

```
class Demo extends React.PureComponent {
    componentDidMount() {
        const $this = ReactDOM.findDOMNode(this)
        $this.addEventListener('click', this.onDOMClick, false)
    }

    onDOMClick = evt => {
       // ...
    }

    render() {
        return (
          <div>Demo</div>
        )
    }
}

```
### 合成事件与原生事件的混合使用？
- 合成事件监听器是统一注册在document上，且仅有冒泡阶段。所以原生事件的监听器响应要比合成事件的监听器早。
- 阻止原生事件的冒泡会阻止合成事件的监听执行。

几个例子学习下？
[前提是都是点击子元素触发事件；事件都是先捕获-执行-冒泡]

```
  onParentDOMClick = (evt:any) => {
      console.log('captrue: parent dom event')
  }

  onChildDOMClick = (evt:any) => {
      console.log('bubble: child dom event')
  }    

  onParentClick = (evt:any) => {
      console.log('capture: parent react event')
  }

  onChildClick = (evt:any) => {   
    console.log('bubble: child react event')
  }

  componentDidMount () {
    const $parent:any = ReactDOM.findDOMNode(this)
    const $child = $parent.querySelector('.child')
    $parent.addEventListener('click', this.onParentDOMClick, true)
    $child.addEventListener('click', this.onChildDOMClick, false)
  };

<div onClickCapture={this.onParentClick} style={{padding: '20px', background: 'red'}}>
  <div className="child" onClick={this.onChildClick} 
  	style={{background: 'green'}}>
     Demo
  </div>
</div>
```
> captrue: parent dom event -- bubble: child dom event 
> -- capture: parent react event -- captrue: parent dom event

<strong>reason：</strong>

- 首先原生事件要早于合成事件，另外在原生事件中的事件捕获要早于事件冒泡。
- 在合成事件中外层元素事件触发要早于内层子元素 


### 常见的一个问题，在合成事件中使用stopPropgation（阻止事件冒泡，默认行为）不生效

```
class SommeComponent extends React.Component {

  handleClick = (e) => {
    e.stopPropagation();
  }
  
  handleDivClick = () => {
    console.log('測試冒泡')
  }

  componentDidMount () {
    document.body.addEventListener('click', e => {
      if (e.target.id = 'btn') return;
      console.log('我是body上的click');
    })
  };

  render() {
    return <>
      <div onClick={this.handleDivClick}>
        <p className="code" id='btn' onClick={this.handleClick}>
          <img src='som.jpg'/>
        </p>
      </div>
  }
}

```
就以上的例子我们点击p元素，触发了handleClick方法，使用了 e.stopPropagation();可以验证“handleDivClick()”不会有输出，
但是有意思的是"我是body上的click"依旧输出。

**原因分析：**
使用e.stopPropagation()有效阻止了事件冒泡，所以"handleDivClick()"不会输出，但是这两个事件都是合成事件（且是click类型），意味着在body上会有这个这个click事件，
所以通过原生事件还是能捕捉到（合成事件中的阻止事件冒泡只能影响合成事件，不能影响原生事件）; 但如果在原生事件中阻止事件冒泡，则会阻止原生/合成事件冒泡。

**建议不要将原生事件与合成事件一起使用：**

如果有时候真的没得办法，那我们有以下两种选择方案可以解决：

1. 合理使用e.stopPropagation() 【两个角度原生事件中使用，合成事件中使用】
2. 使用事件对象event.target来判断的信息来判断

### 在合成事件中怎么获得原生事件对象了

```
// 阻止事件冒泡&捕获
e.nativeEvent.stopPropagation(); 

// 阻止事件冒泡&捕获 && 阻止同一事件的其他绑定执行（一个元素被绑定多个click事件，stopImmediatePropagation使得只会执行一次）
e.nativeEvent.stopImmediatePropagation();
```

[合成事件的例子](https://mp.weixin.qq.com/s/NLJlcdhMcPPgrS8KrnmQ9A)

参考：

react官网合成事件：
<https://react-1251415695.cos-website.ap-chengdu.myqcloud.com/docs/events.html>

<https://juejin.im/post/59db6e7af265da431f4a02ef>

