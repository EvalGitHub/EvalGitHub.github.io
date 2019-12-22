# react中关于state的不常用技巧

## 实现react的双向绑定功能

input框中输入值，对应页面刷新
```
interface initState {
  showModal: boolean,
  targetUrl: string,
  [propsName:string]:any
};

class Component extends React.Component <initProps, initState> {
  handleStateValue = (event:any) => {
    this.setState({
      [event.target.name]: event.target.value
    })
  };
  render () {
    return (
      <>
       <Input className='input_itme' name='targetUrl'  
        value={this.state.targetUrl}
        onInput={this.handleStateValue} placeholder='显示之前填入的配置链接'/>
      </>
    )
  } 
}
```
**补充一点：**
 ```
  this.setState({
    [stateName]: stateValue
  })
 ```
 这种形式可以实现state的健和值的动态变化

#### 通过props传递下来的值，怎么实现input的双向绑定了？
<strong>问题描述：</strong>上面的代码基本上已经实现了一个简单的双向绑定功能【通过state与onInput相结合】，但是存在一个问题是，如果是父组件向子组件中传递一个值（props），这个时候怎么能将props中的属性赋值给state上的同名变量呢？

<strong>解决方案：</strong>我们需要一个时机，将props上的需要属性赋值给state，同时不会引起界面的重新渲染。在react框架提供了很多生命周期函数，其中<strong>componentWIllReceiveProps</strong>正是我们需要的，在这个生命周期函数中，我们可以获取到最新的props，同时修改state也不会引起视图的重新渲染，关键代码如下：
```
componentWillReceiveProps (nextProps:any) {
  this.setState({
    ...nextProps.recordProp
  })
};
```
相关介绍：<https://www.jianshu.com/p/ebe8823c8299>

## 关于setState的异步操作-如何立即获得最新的状态
为了提升性能react将setState设置为异步【将合成事件以及生命周期中的多次状态更新集中处理】，减少对试图的频繁更新
- 因此这就会造成连续多次的setState只会执行最后一次
- setState之后不能立即获取最新的状态值

#### 如果想在setState之后立即获得状态？

- 在原生事件，或者setTimeout、setInterval中更新状态
```
componentDidMount () {
  this.setState({
    rtCode1: 222
  })
  console.log(this.state.rtCode1)
  setTimeout(() => {
    this.setState({
      rtCode2: 222
    })
    console.log(this.state.rtCode2)
  })
}
```
> undefined  2

- setState的回调函数中获取最新的状态（setState在更新完状态之后会执行回调函数）
```
setState({
  name: '测试的名字'
}, () => {
  console.log(this.state.name)
})
```
> 测试的名字
- 在生命周期函数componentDidUpdate中获取最新的状态（props，state的更新都会触发此生命周期函数）

## 使用state去更新state
因为state的异步更新问题，所以很难使用当前的状态去更新当前的状态，但也不是不可能。

<strong>存在的需求：</strong>需要在当前状态上添加更新，例如页面有个计数器需要点击一次就更新下状态，同步到视图。

**需要使用setState的另一种形式，setState除了可以接受一个对象，还可以接受一个函数(注意它的使用形式)**

- 第一个参数：当前的最新状态
- 第二个参数：当前的最新props
```
this.setState((prevState, props) => ({
  counter: prevState.counter + props.increment
}))
```
接受函数的这种方式，也可以有效的使得react连续更新state
```
class App extends React.Component {
  state = {
    counter: 0,
  }
  handleClick = () => {
    this.setState(prev => ({ counter: prev.counter + 1 }));
    this.setState(prev => ({ counter: prev.counter + 1 }));
    this.setState(prev => ({ counter: prev.counter + 1 }));
  }
  render() {
    return (
      <div>
        counter is: {this.state.counter}
        <button onClick={this.handleClick} >点我</button>
      </div>
    )
  }
}
```
> 界面显示的是3，如果是接受对象的形式，则是1

## 根据state的类型更新
- **状态是基础类型，直接赋值即可**
```
//原state
this.state = {
  count: 0,
  title : 'React',
  success:false
}
//改变state
this.setState({
  count: 1,
  title: 'bty',
  success: true
})
```
- **状态是引用类型（数组，对象）则需要返回一个新的数组，对象**

react执行diff算法时候比较的是两个引用，所以为了状态的改变能更新视图，我们需要返回一个新的引用
```
// 方法一：将state先赋值给另外的变量，然后使用slice创建新数组
let books = this.state.books; 
this.setState({
  books: books.slice(1,3)
})
// 方法二：使用preState、slice创建新数组
this.setState(preState => ({
  books: preState.books.slice(1,3)
}))

// 方法一：将state先赋值给另外的变量，然后使用Object.assign创建新对象
var owner = this.state.owner;
this.setState({
  owner: Object.assign({}, owner, {name: 'Jason'})
})
// 方法二：使用preState、Object.assign创建新对象
this.setState(preState => ({
  owner: Object.assign({}, preState.owner, {name: 'Jason'})
}))
 
this.setState(preState => ({
  owner: {...preState.owner, name: 'Jason'}
}))
```
> 注意：不要使用push、pop、shift、unshift、splice等方法修改数组类型的状态，因为这些方法都是在原数组的基础上修改，而concat、slice、filter会返回一个新的数组。

参考文章：<https://blog.csdn.net/b954960630/article/details/79822639>

