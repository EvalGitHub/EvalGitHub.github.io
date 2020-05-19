# redux与react-redux的使用实践
redix是有个状态管理工具库，可以用于很多框架(vue，angular，jquery)，不只是服务于react，但是为了在react中使用更加方便，因此推荐使用react-redux + redux

## redux设计的原则

### 单一数据原则

整个应用的 state 被储存在一棵 object tree 中，并且这个 object tree 只存在于唯一一个 store 中

> 控制数据涞源，便于数据维护

```
console.log(store.getState())
```

### state是只读的，只能通过action来修改

唯一改变 state 的方法就是触发(dispatch)一个 action去修改state，action 是一个用于描述已发生事件的普通对象，每一次都返回一个新的state
```
store.dispatch({
  type: 'COMPLETE_TODO', // 表示动作
  index: 1	// 参数
})
store.dispatch({
  type: 'SET_VISIBILITY_FILTER',
  filter: 'SHOW_COMPLETED'
})
```
> 约定修改state的方式只能是action，便于问题追踪

### 使用纯函数来执行修改state

为了描述 action 如何改变 state tree ，你需要编写 reducers，并且他必须是纯函数

```
function visibilityFilter(state = 'SHOW_ALL', action) {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return { ...action.filter }
    default:
      return state
  }
};
import { combineReducers } from 'redux';
let reducer = combineReducers({ visibilityFilter });
```
> 使用纯函数保证相同的输入得到相同的输出，保证状态的可预测性。

### 如果有修改就返回一个新的对象，否则就返回初始化state

因为redux在进行状态对比时候只是一个浅比较（key, value的比较）, 如果redux发现返回的值没变则返回原来的state

**项目中实际运用：**

**redux/actions**：

```
import { ADDNAME,ADDAGE } from "./actionType";
export const addNameCreater = (name:string) => {
  return {type:ADDNAME,data:name}
};
export const addAgeCreater = (age:number) => ({type:ADDAGE,data:age});
```

**redux/actionType**：

```
export const ADDNAME = 'ADDNAME';
export const ADDAGE = 'ADDAGE';
```

**redux/reducer**：

```
import * as ActionTypes from './actionType';
import { combineReducers } from 'redux';
function addName (state:any = {
  name: 'tom'
}, action:any) {
  switch (action.type) {
    case 'ADDNAME': 
      return action.data
    default: 
      return state
  }
}
function addAge (state:any = {
  age: 12
}, action:any) {
  switch (action.type) {
    case 'ADDAGE': 
      return action.data
    default: 
      return state
  }
} 
export const funReducer = combineReducers({
  addName, addAge
})
```

**redux/store**：

```
import { createStore } from 'redux';
import { funReducer } from './reducer';
const store = createStore(funReducer);
export default store;
```

**通过store.dispatch(action)触发一个动作修改state**

em：

```
import {addAgeCreater, addNameCreater } from './actions';
store.dispatch(addAgeCreater('Tom'))
store.getState() // 获得最新的state值
```

**subscribe(listener)监听state的变化**

每当dispatch action的时候都会执行subscribe; 保证所有的监听器都注册在 [`dispatch()`](http://cn.redux.js.org/docs/api/Store.html#dispatch) 启动之前，这样，在调用监听器的时候就会传入监听器所存在时间里最新的一次 state。

## 使用react-redux将react与redux完美结合起来

从上面的简单的例子中我们不难看到，如果只是单纯在react项目中使用redux进行数据操作的时候会有诸多不便，例如如何在组件中优雅的获取redux中的state了？以及如何将这变化同步到视图呢？

这个时候我们需要一个辅助工具[react-redux](<https://react-redux.js.org/introduction/quick-start>)

- provider 接受redux的store，处于整个redux应用的顶层
- connect 提供整个react应用的任意组件中获取store的数据能力

### 关于provider

一般用于入口组件处，进行包裹
```
import { Provider } from 'react-redux';
import store from './store';

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  rootElement
)
```
这样就能在每个组件中使用connect将你的组件积习进行connected

### 关于connect

将react组件与redux的store联系起来，它会返回一个新的被包裹的组件。

```
function connect(mapStateToProps?, mapDispatchToProps?, mergeProps?, options?)
```

connect的参数：

1. mapStateProps(state, ownProps?) => Object

redux的store的更新都会触发这个方法，返回一个空对象；这个对象将会合并到组件自己的props中，因此可以直接通过this.props[store中的state名字]访问store的中属性。

2. mapDispatchToProps?:Object | (dispatch, ownProps?) => Object

在redux中使用store.dispatch来触发一个action去修改state，如果使用了react-redux的mapDispatchToProps，就可以通过props直接访问这个dispatch方法了。

**使用方式：**
```
class SomeComponent extends React.Component<InitState, InitProps> {
  constructor(props:InitProps) {
    super(props)
  }
  render () {
    <div onClick={this.props.onCreament2.bind(this)}>
      <p>{this.props.productionList}</p>
    </div>
  }
}

const mapDispatchToProps = (dispath) => {
  return {
    onCreament2: () => {
      dispath({...Action.decrease(), preload: {quantity:3}})
    }
  }
}

const mapStateToProps = (store) => {
  return {
    productionList: store.changeDataReducer,
    bookList: store.BookReducer
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SomeComponent);
```
示例代码：
<https://github.com/Arrayeval/react_pro/blob/master/src/base/reduxUse2.js>

[参考文章1](<https://github.com/naihe138/react-plan>)，
[参考文章2](<https://www.jianshu.com/p/f6c5434c6e2d>)，
[参考文章3](<https://www.jianshu.com/p/ad7eddb23d66>)




