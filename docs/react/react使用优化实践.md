# react使用优化实践

#### 一：setState 只管理渲染相关的数据

临时变量，数据，以及其他只是用来做标记或者与后端交互这些值不应该用setState

#### 二：this的绑定问题

##### 1）渲染时的绑定

```
render() {
    return (
        <User onClick = {this.getUsername.bind(this)}></User>
    )
}
```

**劣势**：每次重新渲染组件时都会创建一个新的函数。虽然听起来好像很严重，但实际上对性能的损耗并不明显。

##### 2）渲染时使用箭头函数

```
render () {
    return (
    	<div onClick={e => this.getUsername(e)}></div>
    )
}
```

**劣势**：该方式和上一种本质是相同的，都会有潜在的性能问题。

##### 3）在constructor中绑定

```
class User extends React.component <initProps, initState> {
    constructor （props） {
        super(props)
        this.getUsername = this.getUsername.bind(this)
    }
    
}
```

**优点：** 构造函数只会在组件第一次挂载时执行，所以整个生命周期中只会执行一次。在构造函数中对方法进行this绑定，就不会像前面的方法那样重复创建新函数而造成性能问题

**劣势：**如果方法很多的时候，这个构造函数的可读性就很差了。

##### 4）函数申明式

```
class User extends Component {
    selectUser = (e) => {
        ...
    }
    render () {
        return (
        	<div onClick={this.selectUser}/>
        )
    }
}
```

**优点：**使用下面的方法完美解决上面的所有问题。既不会造成性能问题，也不会导致代码冗长难于阅读。

#### 三）jsx中的判断

&&运算会比三目运算性能更好

```
return (
    { title &&
        <div className="tui-dialog__hd">
            <strong className="weui-dialog__title">{title}</strong>
        </div>
    }
)
```

#### 四）在react中，组件的state，props改变都会导致整个组件的的重新渲染

为了避免不必要的re-render和diff, 可以在shouldComponentUpdate其中进行判断

> // 接收两个参数，分别为待更新的属性及状态值
> shouldComponentUpdate(nextProps, nextState) {
>  // 如果当前的value值与待更新不相等，才执行更新
>  return this.props.value !== nextProps.value;
>  // return this.state.user !== nextState.user;
> }

React v15.3开始提供了一个叫做 PureComponent 的组件来替代 Component 来封装 shouldComponentUpdate 以达到上述目的。

但是这样实际上有一个问题，它们进行的都是浅比较，也就是说如果对比的值是一个对象或者数组，那么它的引用会一直相等，从而造成误判。

解决这个问题：

1. Immutable.js 用来替代浅拷贝和深拷贝的方式，用来创建不可变的数据。

### 五）保持稳定的Dom结构

通过css影藏或者显示节点而不是真正的移除或者添加DOM节点。

> React 只会简单地考虑同层级节点的位置变换，而对于不同层级的节点，只有创建和删除操作

参考：<https://www.jianshu.com/p/c46e5866eaec>