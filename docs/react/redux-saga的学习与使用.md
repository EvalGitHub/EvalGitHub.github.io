# react-saga的使用实践

在react项目开发中，如果涉及到很多的状态维护工作，比较合适的处理方式就是使用react-redux + redux来进行处理，但是我们知道的是redux的设计的大原则其中之一就是**修改state的必须是纯函数**；这就意味着对于异步请求(副作用)的状态维护我们需要另一种合适的方案 -- react-saga。

**纯函数的定义：**

相同的输入得到相同的输出，无任何副作用。

## 为什么需要redux-saga？

redux的设计原则之一使用纯函数修改state，其目的就是为了保证状态的可以预测性。

## redux-saga的常用api注解 
> take，call，put，select，fork，takeEvery，takeLatest

- take用来监听action，返回的是一个对象

em:
```
dispatch({type: 'CHANGE_NAME', value: XXX})

function *watchName() {
  const acton = yield ('CHANGE_NAME');
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

## redux与redux-saga的使用实例

在正常使用react-redux与reduxd搭建起之后，需要使用redux的中间件插件"applyMiddleware"

**因此你的store.js文件是这样的：**

```
import {createStore, applyMiddleware} from 'redux'
import createSagaMiddleware  from 'redux-saga'
import Reducers from './reducers'
import rootSaga from '../saga';

const sagaMiddleware = createSagaMiddleware()

const store = createStore(Reducers,applyMiddleware(sagaMiddleware));
sagaMiddleware.run(rootSaga); // 执行所有的saga

export default store
```

**actionType.js的文件是这样的：**

```
export const GET_ERROR = 'getError'
export const ARTICLE_FETCH_REQUEST = 'getArticleList'
export const GET_ARTICLE_LIST_SUCC = 'getArticListSucc'
export const GET_ARTICLE_LIST_FAIL = 'getArticListFail'
```
**saga/index.js文件是这样的：**

```
import {call, put, takeEvery, takeLatest} from 'redux-saga/effects'
import article from '../service/article/index';

import { ARTICLE_FETCH_REQUEST, GET_ARTICLE_LIST_SUCC, GET_ARTICLE_LIST_FAIL } from '../redux/actionType'
import {get_errors, get_users} from '../redux/action'

function* getArticleList(obj) {
  try {
    const articleListData = yield call(article.getArticleList, {...obj.preload});
    yield put({
      type: GET_ARTICLE_LIST_SUCC,
      preload: articleListData
    });
  } catch(e) {
    yield put({
      type: GET_ARTICLE_LIST_FAIL,
      message: e.message
    });
  }
}
 
// wacther saga
function* watchGetPosts() {
  yield takeEvery(ARTICLE_FETCH_REQUEST, getArticleList);
}

// root saga
export default function* rootSaga() {
  yield watchGetPosts()
} 
```
分析下以上代码的数据走向：

1. 首先export rootSaga，在store中通过sagaMiddleware.run(rootSaga)启动了所有的监听
2. 在watchGetPosts中又监听了“ARTICLE_FETCH_REQUEST”这个action，一旦触发就执行 getArticleList方法
3. getArticleList中通过call去发起异步请求，成功就put一个名为"GET_ARTICLE_LIST_SUCC"的action，参数为请求成功返回的结果
失败就put一个名为“GET_ARTICLE_LIST_FAIL”的action，参数为message
4. 通过匹配action返回新state的操作在reducer中执行

**对应的reducer：**

```
import * as ActionTypes from './actionType'
import {errorInfo} from './data.js'
const initialState = {
  ...errorInfo
}

export const fetchInfoReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.GET_ARTICLE_LIST_FAIL: 
      return {
        status: 400,
        msg: '获取文章列表失败'
      }  
    case ActionTypes.GET_ARTICLE_LIST_SUCC: 
      return {
        status: 200,
        msg: '获取文章列表成功succ'
      }  
    default:
      return state
  }
}
```

上面的实例代码实现了部分数据流，还差一个启动“ARTICLE_FETCH_REQUEST” 的操作
在实际的运用场景下，可以通过点击一个按钮去触发拉取数据请求。

```
<li  className="redux-li-item"> 
  <button className="btn btn-redux" onClick={getArticleList}>测试下redux-saga</button>
  <p>
    {JSON.stringify(this.props.errorInfo)}
  </p>
</li>

...
......
.......

const mapStateToProps = function(store) {
  return {
    productList: store.changeDataReducer,
    bookList: store.BookReducer,
    errorInfo: store.fetchInfoReducer
  };
};

// 通过mapDispatchProps
const mapDispatchToProps = (dispatch) => {
  return {
    onDecrement2: () => {
      dispatch({...Action.decrease(),  preload: {quantity:3}})
    },
    getArticleList: () => {
      dispatch({type: 'getArticleList', preload: {type: '', pageStart: 0}})
    }
  }
};
```
https://github.com/Arrayeval/react_pro/blob/master/src/base/reduxUse2.js

[彻彻底底教会你使用Redux-saga(包含样例代码)](<https://segmentfault.com/a/1190000015583055#item-5>)






