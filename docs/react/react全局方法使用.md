# react全局方法的使用

## 使用React.createElement创建组件
> 基本语法：React.createElement( type, [props], [...children] )

在react中创建一个组件的最常用方式：代码如下
```
import * as React from 'react';
import  * as style from './index.scss';
export class CreateEle extends React.Component {
  render () {
    return (
      <div id='one' className={style.two}'>
        <span id='spanOne'>只是测试代码第一个span</span>
        <span id='spanTwo'>只是测试代码第二个span</span>
      </div>
    )
  }
}
```
使用React.createElement的方式：代码如下
```
export class CreateEle extends React.Component {
  render () {
    return (
      <div>
        {
          React.createElement(
            'div', 
            {id: 'one', className: style.two },
            React.createElement('span', { id: 'spanOne'}, '只是测试代码第一个span 标签'),
            React.createElement('span', { id: 'spanTwo'}, '只是测试代码第二个span 标签'),
          )
        }
      </div>
    )
  }
}
```
## React.cloneElement

以 element 元素为样板克隆并返回新的 React 元素。**返回元素的 props 是将新的 props 与原始元素的 props 浅层合并后的结果**。新的子元素将取代现有的子元素，而来自原始元素的 key 和 ref 将被保留

```
React.cloneElement(
  element,
  [props],
  [...children]
)
```

- demo: 

```
function FatherComponent({ children }){
    const newChildren = React.cloneElement(children, { age: 18})
    return <div> { newChildren } </div>
}

function SonComponent(props){
    console.log(props)
    return <div>hello,world</div>
}

class Index extends React.Component{    
    render(){      
        return <div className="box" >
            <FatherComponent>
                <SonComponent name="alien"  />
            </FatherComponent>
        </div>   
    }
}
```

[参考官网](<https://zh-hans.reactjs.org/docs/react-api.html#cloneelement>)

## ReactDOM.createPortal

可以使用这个方法将子节点渲染到父组件意外的DOM节点

>ReactDOM.createPortal(child, container)

- child

是任何可渲染的React子元素（元素，字符串，fragment）

- container

是一个dom元素

>通常来讲，当你从组件的 render 方法返回一个元素时，该元素将被挂载到 DOM 节点中离其最近的父节点：

```
render() {
  // React 挂载了一个新的 div，并且把子元素渲染其中
  return (
    <div>
      {this.props.children}
    </div>
  );
}
```
然而，有时候将子元素插入到 DOM 节点中的不同位置也是有好处的：

```
render() {
  // React 并*没有*创建一个新的 div。它只是把子元素渲染到 `domNode` 中。
  // `domNode` 是一个可以在任何位置的有效 DOM 节点。
  return ReactDOM.createPortal(
    this.props.children,
    domNode
  );
}
```
## 使用React.memo提升性能
react性能提升，只在props属性更新了，才会触发重新渲染，功能同React.PureComponent，但是他只使用与函数组件。

- 如果你的**函数组件**在给定相同 props 的情况下渲染相同的结果，那么你可以通过将其包装在 React.memo 中调用。

使用方式：
```
function MyComponent(props) {
  /* 使用 props 渲染 */
}
function areEqual(prevProps, nextProps) {
  /*
  如果把 nextProps 传入 render 方法的返回结果与
  将 prevProps 传入 render 方法的返回结果一致则返回 true，
  否则返回 false
  */
}
export default React.memo(MyComponent, areEqual);
```
一个简单例子：
```
function areEqual(prevProps, nextProps) {
  if (prevProps.val === nextProps.val) {
    return true;
  } else {
    return false;
  }
}

// React.memo()两个参数,第一个是纯函数,第二个是比较函数
export default React.memo(function twentyChild(props) {
  console.log("MemoSon rendered : " + Date.now());
  return <div>{props.val}</div>;
}, areEqual);
```

**补充：** React.PureComponent在比较组件前后状态是否相等的时候使用的是一种浅比较（基础值类型比较是否相等，引用类型比较健值对）

## 使用React.pureComponent提升类组价的性能

React.pureComponent与React.memo功能类似(避免比必要的重新渲染，所有的生命周期都不会执行)，不过前者是针对类组件，后者是针对函数组件

实现原理：对父组件的props，以及自己内部的state值，使用**shouldComponentUpdate(nextProps, nextState)**来进行浅比较，判读是否需要更新

**使用条件：**

- 要state, props是一个比较简单的基本类型数据（因为只会简单的比较键值是否相等）

>如果数据结构太复杂可能不会监测到变化；假设数据结构就是很复杂，但是又使用到了pureComponent，我们需要在修改父组件state中那个用于子组件的props，每一次都是返回一个新的引用（新数组[]，新的对象{}）

参考链接：[React中PureComponent的浅比较](<https://www.jianshu.com/p/0d0587fc33de>)


## React.forwardRef

- 利用forwardRef进行值传递

```
import React from "react";
import "./styles.css";
import { Pcom } from "./pCom";
import { Ppcom } from "./ppCom";
export default function App() {
  let [num, setNum] = React.useState(0);
  function addNum() {
    setNum(++num);
  }
  return (
    <div className="App">
      <button onClick={addNum}>add num:</button>
      <Pcom
        content={React.forwardRef((props, ref) => (
          // props是Pcom传递的属性值
          <Ppcom num={num} {...props} />
        ))}
      />
    </div>
  );
}
```

pCom.js

```
export function Pcom(props) {
  const Content = props.content;
  return (
    <>
      <Content name="name" age="age" />
    </>
  );
}
```

ppCom.js

```
export function Ppcom(props) {
  return (
    <>
      <p>{props.num}</p>
      <p>{props.age}</p>
      <p>{props.name}</p>
    </>
  );
}
```

- 利用forwardRef转发Ref

如果父组件想获取孙组件的某一个dom, 这种隔代ref的获取引用

```
function Son (props){
    const { grandRef } = props
    return <div>
        <div> i am alien </div>
        <span ref={grandRef} >这个是想要获取元素</span>
    </div>
}

class Father extends React.Component{
    constructor(props){
        super(props)
    }
    render(){
        return <div>
            <Son grandRef={this.props.grandRef}  />
        </div>
    }
}

const NewFather = React.forwardRef((props,ref)=><Father grandRef={ref}  {...props} />  )

class GrandFather extends React.Component{
    constructor(props){
        super(props)
    }
    node = null 
    componentDidMount(){
        console.log(this.node)
    }
    render(){
        return <div>
            <NewFather ref={(node)=> this.node = node } />
        </div>
    }
}
```


## React.Lazy && React.Suspense

> React.lazy 和 Suspense 技术还不支持服务端渲染。如果你想要在使用服务端渲染的应用中使用，我们推荐 Loadable Components 这个库

- React.Lazy和React.Suspense可以达到组件动加载的效果

**React.lazy 接受一个函数，这个函数需要动态调用 import()。它必须返回一个 Promise ，该 Promise 需要 resolve 一个 default export 的 React 组件。**

```
import Test from './comTest'
const LazyComponent =  React.lazy(()=> new Promise((resolve)=>{
  setTimeout(()=>{ // 两秒之后才返回组件
    resolve({
      default: ()=> <Test />
    })
  },2000)
}));

class index extends React.Component{   
  render(){
    return <div className="context_box" style={ { marginTop :'50px' } }   >
      <React.Suspense fallback={ <div className="icon"><SyncOutlined spin /></div>}>
        <LazyComponent />
      </React.Suspense>
    </div>
  }
}
```

## React.Fragment 

- 常用于render函数返回多个标签的情况下，进行包裹。

```
<React.Fragment>
  <div>1</div> 
  <div>1</div> 
  <div>1</div> 
</React.Fragment>
```

## React.StrictMode

>严格模式，用于检测react项目中的潜在的问题; 与Fragment一样， StrictMode不会渲染任何可见的UI 。它为其后代元素触发额外的检查和警告;
严格模式检查仅在开发模式下运行；它们不会影响生产构建

- 实践:识别不安全的生命周期

## React.createContext

[见《react函数编程hook基本用法》]

## ReactDOM.unstable_batchedUpdates

解决多次render问题

在react 合成事件中如果多次连续使用setState改变一个state的值，他只会执行一次；一次常见的解决方式就是在react合成事件之外去处理，
例如使用setTimeout, promise简单包裹下

```
this.state = { number: 1}
handleChangeNum =()=>{
  Promise.resolve().then(()=>{
      this.setState({ number : this.state.number + 1 })
      console.log(this.state.number)
      this.setState({ number : this.state.number + 1 })
      console.log(this.state.number)
      this.setState({ number : this.state.number + 1 })
      console.log(this.state.number)
  })
}
```

> 2, 3, 4

但是这存在另一个问题，回重复渲染三次，那么该如何优化呢？？

```
this.state = { number: 1}
handleChangeNum =()=>{
  ReactDOM.unstable_batchedUpdates(() => {
    Promise.resolve().then(()=>{
        this.setState({ number : this.state.number + 1 })
        console.log(this.state.number)
        this.setState({ number : this.state.number + 1 })
        console.log(this.state.number)
        this.setState({ number : this.state.number + 1 })
        console.log(this.state.number)
    })
  })
}
```

## ReactDOM.flushSync

>可以将回调函数中的更新任务，放在一个较高的优先级中。我们知道react设定了很多不同优先级的更新任务。
如果一次更新任务在flushSync回调函数内部，那么将获得一个较高优先级的更新。

```
import ReactDOM from 'react-dom'
class Index extends React.Component{
  state={ number:0 }
  handerClick=()=>{
    setTimeout(()=>{
      this.setState({ number: 1  });
      console.log(this.state.number);
    })
    this.setState({ number: 2  })
    ReactDOM.flushSync(()=>{
      this.setState({ number: 3  })
    })
    this.setState({ number: 4  })
  }
  render(){
    const { number } = this.state
    console.log(number) // 打印什么？？
    return <div>
      <div>{ number }</div>
      <button onClick={this.handerClick} >测试flushSync</button>
    </div>
  }
}
```

> 3, 4, 1, 1

结果分析：ReactDOM.flushSync中的优先执行， 2， 4批量更新只会执行后面的一个，setTimeout延时执行最慢,但是他是同步,因为处于非react函数，合成事件中，他就是同步执行，所以能立马获取到number的值。

## ReactDOM.findDOMNode

>ReactDOM.findDOMNode(component)

用于访问组件DOM元素节点，react推荐使用ref模式

- findDOMNode只能用在已经挂载的组件上。

- 如果组件渲染内容为 null 或者是 false，那么 findDOMNode返回值也是 null。

- findDOMNode 不能用于函数组件。

```
class Index extends React.Component{
    handerFindDom=()=>{
        console.log(ReactDOM.findDOMNode(this))
    }
    render(){
        return <div style={{ marginTop:'100px' }} >
            <div>hello,world</div>
            <button onClick={ this.handerFindDom } >获取容器dom</button>
        </div>
    }
}
```

## React.unmountComponentAtNode

从 DOM 中卸载组件，会将其事件处理器和 state 一并清除。如果指定容器上没有对应已挂载的组件，这个函数什么也不会做。如果组件被移除将会返回 true ，如果没有组件可被移除将会返回  false 。

```
function Text(){
  return <div>hello,world</div>
}

class Index extends React.Component{
  node = null
  constructor(props){
    super(props)
    this.state={
      number:1,
    }
  }

  componentDidMount(){
    /*  组件初始化的时候，创建一个 container 容器 */
    ReactDOM.render(<Text/> , this.node )
  }

  handerClick=()=>{
    /* 点击卸载容器 */ 
    const state =  ReactDOM.unmountComponentAtNode(this.node)
    console.log(state)
  }

  render(){
    return <div  style={{ marginTop:'50px' }}  > 
      <div ref={ ( node ) => this.node = node  }  ></div>  
      <button onClick={ this.handerClick } >click me</button>
    </div>
  }
}
```

