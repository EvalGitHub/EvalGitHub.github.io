# react-redux的学习与使用

#### react-redux的作用是react与redux的润滑剂，有了它在react中使用redux会很变得很简单，但是他不是必须的。

## provider

provider的作用是将store中的state注入组件中，这样你就可以在组件中直接获取state

使用方法： 

```
import store from './redux/store'；
const rootElement = document.getElementById('root')
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  rootElement
)
```

## connect

connect的作用是用ui组件转化为容器组件

```
import { connect } from 'react-redux'
class TodoList extends React.Component<initProps, initState> {
    render () {
        return (
        	<> 
        		this is TodoList component
        	</>
        )
    }
}
const mapStateToProps = (store) => {
  return {
    counter: state.counter
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TodoList)
```

## mapStateToProps

他是一个函数，建立一个从state对象到（ui组件）props对象的映射关系；字面意思就是把state映射到props中去，其实是把redux中的数据映射到React的props中去。单纯的只使用redux，如果想获取redux中的数据，方式是store.getState()。

```
const mapStateToProps = function(store) {
  return {
    temData: store.changeDataReducer
  };
};
export default connect(mapStateToProps)(RedexUse);
```

通过以上代码操作之后可以直接在RedexUse组件中通过this.props.temData获得数据

## mapDispatchToProps

用来建立 UI 组件的参数到store.dispatch方法的映射，它定义了哪些用户的操作应该当作 Action，传给 Store。它可以是一个函数，也可以是一个对象。各种dispatch也变成了props让你可以直接使用；单纯的只是使用redux，如果想使用action，方式是store.dispatch(action);

```
class RedexUse2 extends React.Component{
    render () {
        const { onDecrement2, addBook, deleteBook } = this.props;
        return (
         	<>
            <button className="btn btn-danger my-2" onClick={onDecrement2}>
              react-redux的使用方法[Decrease]
            </button>
            <button className="btn btn-redux" 
              onClick={addBook}>测试下reduxAction是不是正确的[添加一本书]</button>
          </>
        )
    }
    
}
const mapDispatchToProps = (dispatch) => {
  return {
    onDecrement2: () => {
      dispatch({...Action.decrease(),  preload: {quantity:3}})
    },
    addBook: () => {
      dispatch({...CreateAct.addBook(),  payload: {name: '牵牛花的春天', author: '石墨烯', type: 'math', id:2}})
    },
    deleteBook: () => {
      dispatch({...CreateAct.deleteBook(),  payload: {type: 'math', id:2}})
    }
  }
};
export default connect(mapStateToProps, mapDispatchToProps)(RedexUse2);
```

通过mapDispatchProps之后就可以在this.props中获取对应的方法。

<strong>react-redux官当文档：</strong>
<https://react-redux.js.org/introduction/quick-start>

<strong>参考学习：</strong>
<https://juejin.im/post/5ce0ae0c5188252f5e019c2c>