# react生命周期(16v)

每个组件都包含“生命周期方法”，你可以重写这些方法，以便于在运行过程中特定的阶段执行这些方法
<a href="http://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/">点击查看详细描述</a>
## componentWillMount
* 执行场景：
	* 在render()方法之前
* 解释
	* 因为这个函数执行在render之前，所以在这个方法中执行setState不会重新渲染re-render
	* 这是服务器端渲染中的唯一调用的钩子
	
## render	 
* 执行场景
	* 在componentWilMount方法之后
	* 在componentWillReceiveProps之后
	
## componentDidMount
* 执行场景
	* 在render()方法之后
	* 解释
		* 这个方法会在render()之后立即执行；
		* 这里可以对DOM进行操作，这个函数之后ref变成实际的DOM
		
## componentWillReceiveProps
* 执行场景
	* 在已经挂在的组件(mounted component)接收到新props时触发;	(简单说初始化的时候不会执行)
* 解释
  * 组件初次渲染时不会执行componentWillReceiveProps；
  * 当props发生变化时执行componentWillReceiveProps；
  * 在这个函数里面，旧的属性仍可以通过this.props来获取；
  * 此函数可以作为 react 在 prop 传入之后， render() 渲染之前更新 state 的机会。即可以根据属性的变化，通过调用this.setState()来更新你的组件状态，在该函数中调用 this.setState() 将不会引起第二次渲染。
  * 也可在此函数内根据需要调用自己的自定义函数，来对prop的改变做出一些响应。
	  如果你只是调用this.setState()而不是从外部传入props, 那么不会触发componentWillReceiveProps(nextProps)函数；这就意味着: this.setState()方法不会触发componentWillReceiveProps(), props的改变或者props没有改变就会触发这个方法;但是值得注意的是componentWillReceiveProps被调用了不一定意味着props的改变。
  [a=>b不等于b=>a](<https://reactjs.org/blog/2016/01/08/A-implies-B-does-not-imply-B-implies-A.html>)
  ```
  componentWillReceiveProps (nextProps:any) {
    this.setState({
      ...nextProps.recordProp
    })
  };
  ```
  上面实现的就是在componentWillReceiveProps中讲props的值复制给state,因为props是不允许被修改的（因为props一般是从父组件传递给子组件，这就需要保证props的不变性，确定所有的子组件都能获取相同的props值）。
  正是由于这个问题，在实现Input的双向绑定的时候，如果从父组件中传递给子组件，直接绑定到Input[value]，这个时候即使你输入不同的值，输入框的内容是不会更改的，因此我们需要有一个合适的地方（componentWillReceiveProps）中将props的值赋值给state。
## shouldComponentUpdate
* 执行场景
	* 在接收到新props或state时，或者说在componentWillReceiveProps(nextProps)后触发
* 解释
	* 在接收新的props或state时确定是否发生重新渲染，默认情况返回true，表示会发生重新渲染
	* 在首次渲染时或者forceUpdate()时不会触发;
	* 这个方法如果返回false, 那么props或state发生改变的时候会阻止子组件发生重新渲染;

## componentWillUpdate
* 执行场景
	* 在props或state发生改变或者shouldComponentUpdate(nextProps, nextState)触发后, 在render()之前	 
* 解释
	* 初始化时不会被调用
	* 不要在这个函数中调用this.setState()方法.会造成死循环
	* 如果确实需要响应props的改变，那么你可以在componentWillReceiveProps(nextProps)中做响应操作

## componentDidUpdate
* 执行场景
	* 在发生更新或componentWillUpdate(nextProps, nextState)后	
* 解释： 
	* 使用这个方法可以对组件中的DOM进行操作
		 
## componentWillUnmount
* 执行场景
	* 在组件卸载(unmounted)或销毁(destroyed)之前
* 解释
	* 处理一些必要的清理操作，比如无效的timers、interval，或者取消网络请求，或者清理任何在componentDidMount()中创建的DOM元素(elements) 		 	 		 

## 组件生命周期执行过程 	
1）组件初始化

```
componentWillMount -> render -> componentDidMount
```
2）组件更新 – props change

```
componentWillReceiveProps -> 
shouldComponentUpdate -> 
componentWillUpdate -> 
render -> 
componentDidUpdate
```
3）组件更新 – state change

```
shoudlComponentUpdate -> 
componentWillUpdate -> 
render-> componentDidUpdate
```
4）组件卸载或销毁

```
componentWillUnmount
```