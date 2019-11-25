# react中优雅抽离公共逻辑的方式
## 自定义hook
>hook是react16.8的新增特性，可以让我们在不编写class的情况下使用state以及其他的react特性

聊天程序中的组件，该组件用于显示好友的在线状态：
```
import React, { useState, useEffect } from 'react';
function FriendStatus(props) {
  const [isOnline, setIsOnline] = useState(null);
  useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline);
    }
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    };
  });
  if (isOnline === null) {
    return 'Loading...';
  }
  return isOnline ? 'Online' : 'Offline';
}
```
当用户在线时需要把名字设置为绿色:
```
import React, { useState, useEffect } from 'react';

function FriendListItem(props) {
  const [isOnline, setIsOnline] = useState(null);
  useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline);
    }
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    };
  });
  return (
    <li style={{ color: isOnline ? 'green' : 'black' }}>
      {props.friend.name}
    </li>
  );
}
```
存在的问题是两个功能代码中存在相同逻辑，这个时候我们可以自定义hook的形式抽离公共逻辑
```
import React, { useState, useEffect } from 'react';
function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);
  useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline);
    }
    ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);
    };
  });
  return isOnline;
}

// 组件
function FriendStatus(props) {
  const isOnline = useFriendStatus(props.friend.id);
  if (isOnline === null) {
    return 'Loading...';
  }
  return isOnline ? 'Online' : 'Offline';
}

// 组件
function FriendListItem(props) {
  const isOnline = useFriendStatus(props.friend.id);
  return (
    <li style={{ color: isOnline ? 'green' : 'black' }}>
      {props.friend.name}
    </li>
  );
}
```
**几点说明：**
- 自定义 Hook 必须以 “use” 开头；react可以以此判断这个函数内部包含了hook的调用，检查你的 Hook 是否违反了 Hook 的规则。
- 两个组件使用的相同的hook不会公用state，其中的所有 state 和副作用都是完全隔离的【一个组件中多次调用 useState 和 useEffect，它们是完全独立的】。

## render props
> 术语 “render prop” 是指一种在 React 组件之间使用一个值为函数的 prop 共享代码的简单技术；render prop 的组件接受一个函数，该函数返回一个 React 元素并调用它而不是实现自己的渲染逻辑。

**例如：**
```
<DataProvider render={data => (
  <h1>Hello {data.target}</h1>
)}/>
```
**借用一个官方的例子:实现一张图片跟随鼠标移动**
```
class Cat extends React.Component {
  render() {
    const mouse = this.props.mouse;
    return (
      <img src="/cat.jpg" style={{ position: 'absolute', left: mouse.x, top: mouse.y }}/>
    );
  }
}

class MouseMove extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.state = { x: 0, y: 0 };
  }
  handleMouseMove(event) {
    this.setState({
      x: event.clientX,
      y: event.clientY
    });
  }
  render() {
    return (
      <div style={{ height: '100%' }} onMouseMove={this.handleMouseMove}>
        <Cat mouse={this.state} />
      </div>
    );
  }
}
```
以上是我们一种很常见的书写组件的方式，通过props的方式传递一些必要参数。但是这个并不能实现代码的复用，我们明显的发现上面的代码中获取鼠标的移动坐标是一个很常见的需求，上面例子中

```
<Cat mouse={this.state}/>
```

是硬编码到MouseMove组件中的，我们需要动态的进行组件渲染而不是这种固定组件的形式。
```
class MouseMove extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.state = { x: 0, y: 0 };
  }
  handleMouseMove(event) {
    this.setState({
      x: event.clientX,
      y: event.clientY
    });
  }
  render() {
    return (
      <div style={{ height: '100%' }} onMouseMove={this.handleMouseMove}>
        {this.props.render(this.state)}
      </div>
    );
  }
}

class MouseTracker extends React.Component {
  render() {
    return (
      <MouseMove render={pos => (<Cat mouse={pos}/>)}/>
    )
  }
}
```
上述代码通过props，传入了一个函数形式返回一个cat组件，这样就很好地实现了动态渲染组件的功能，在某一种角度上复用了MouseMove组件。

## 高阶组件HOC

> 高阶组件是react中复用组件逻辑的一种高级技巧

**高阶组件是参数为组件，返回值为新组件的函数**

形式： 

```
function createComponent (TargetComponent, propsDate) {
    return class extends React.Component {
        /** 
        **此处省略组件的公用逻辑代码
        **
        ***********
        **/
        render () {
            return <TargetComponent >
        }
    }
}
```

借用官网的一个例子：有两个组件CommentList ， BlogPost 

CommentList .js

```
class CommentList extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      // 假设 "DataSource" 是个全局范围内的数据源变量
      comments: DataSource.getComments()
    };
  }
  componentDidMount() {
    // 订阅更改
    DataSource.addChangeListener(this.handleChange);
  }
  componentWillUnmount() {
    // 清除订阅
    DataSource.removeChangeListener(this.handleChange);
  }
  handleChange() {
    // 当数据源更新时，更新组件状态
    this.setState({
      comments: DataSource.getComments()
    });
  }
  render() {
    return (
      <div>
        {this.state.comments.map((comment) => (
          <Comment comment={comment} key={comment.id} />
        ))}
      </div>
    );
  }
}
```

BlogPost.js

```
class BlogPost extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      blogPost: DataSource.getBlogPost(props.id)
    };
  }
  componentDidMount() {
    DataSource.addChangeListener(this.handleChange);
  }
  componentWillUnmount() {
    DataSource.removeChangeListener(this.handleChange);
  }
  handleChange() {
    this.setState({
      blogPost: DataSource.getBlogPost(this.props.id)
    });
  }
  render() {
    return <TextBlock text={this.state.blogPost} />;
  }
}
```

分析以上两个组件我们可以很清楚的看到，他们的 数据处理逻辑完全一样， 只是render函数中的渲染不同，因此可以做出优化。

```
// 此函数接收一个组件...
function withSubscription(WrappedComponent, selectData) {
  // ...并返回另一个组件...
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.handleChange = this.handleChange.bind(this);
      this.state = {
        data: selectData(DataSource, props)
      };
    }
    componentDidMount() {
      // ...负责订阅相关的操作...
      DataSource.addChangeListener(this.handleChange);
    }
    componentWillUnmount() {
      DataSource.removeChangeListener(this.handleChange);
    }
    handleChange() {
      this.setState({
        data: selectData(DataSource, this.props)
      });
    }
    render() {
      // ... 并使用新数据渲染被包装的组件!
      // 请注意，我们可能还会传递其他属性
      return <WrappedComponent data={this.state.data} {...this.props} />;
    }
  };
}
```





