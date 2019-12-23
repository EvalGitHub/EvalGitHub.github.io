# react-saga的使用实践

在react项目开发中，如果涉及到很多的状态维护工作，比较合适的处理方式就是使用react-redux + redux来进行处理，但是我们知道的是redux的设计的大原则其中之一就是**修改state的必须是纯函数**；这就意味着对于异步请求(副作用)的状态维护我们需要另一种合适的方案 -- react-saga。

**纯函数的定义：**

相同的输入得到相同的输出，无任何副作用。

## 为什么需要redux-saga？

redux的设计原则之一使用纯函数修改state，其目的就是为了保证状态的可以预测性。

redux-saga的api: 
> take，call，put，select，fork，takeEvery，takeLatest

- take用来监听action，返回的是一个对象

em:
```
dispatch({type: 'CHANGE_NAME', value: XXX})

function *watchName() {
  const acton = yiled('CHANGE_NAME');
  ...
  ...
}
```
action就是{type:XXX, value:XXX}

- call(apply)
> call(fn, ...args);

call和apply方法与js中的call和applay相似，在redux-saga中使用异步请求等常用call方法来实现。

> yield call(fetch,'/userInfo',username)

在call方法调用结束之前，call方法之后的语句是无法执行的，这是一种阻塞型的方法。

- put 

redux-saga执行完副作用函数后，必须发出action，然后这个action被reducer监听，从而达到更新state的目的。相应的这里的put对应与redux中的dispatch。

>  yield put({type:'login'})

- select

如果想在中间件中获取state，就可以使用，对应redux的getState

> const id = yield select(state => state.id);

- fork

非阻塞调用，执行fn时，不会暂停Generator

> yield fork(getList)

- takeEvery/takeLatest

takeEvery和takeLatest用于监听相应的动作并执行相应的方法。

> takeEvery('login',loginFunc)

takeEvery可以同时监听到多个相同的action。

> takeLatest('login',loginFunc)

takeLatest是会监听执行最近的那个被触发的action。








[彻彻底底教会你使用Redux-saga(包含样例代码)](<https://segmentfault.com/a/1190000015583055#item-5>)






