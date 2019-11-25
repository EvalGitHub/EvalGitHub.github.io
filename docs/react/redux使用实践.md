# redux使用实践
redix是有个状态管理工具库，可以用于很多框架(vue，angular，jquery)，不只是服务于react，但是为了在react中使用更加方便，因此推荐使用react-redux + redux

### 单一数据原则

整个应用的 state 被储存在一棵 object tree 中，并且这个 object tree 只存在于唯一一个 store 中
```
console.log(store.getState())
```

### state 是只读的
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

### 使用纯函数来执行修改
为了描述 action 如何改变 state tree ，你需要编写 reducers
```
function visibilityFilter(state = 'SHOW_ALL', action) {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter
    default:
      return state
  }
};
import { combineReducers } from 'redux';
let reducer = combineReducers({ visibilityFilter });
```

### 项目中实际运用
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

 

https://www.jianshu.com/p/f6c5434c6e2d

https://www.jianshu.com/p/ad7eddb23d66