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


## ReactDOM.createPortal

## 使用React.memo提升性能
react性能提升，只在props属性更新了，才会触发重新渲染，功能同React.PureComponent，但是他只使用与函数组件。

- 如果你的函数组件在给定相同 props 的情况下渲染相同的结果，那么你可以通过将其包装在 React.memo 中调用。

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

参考链接：[React中PureComponent的浅比较](<https://www.jianshu.com/p/0d0587fc33de>)
