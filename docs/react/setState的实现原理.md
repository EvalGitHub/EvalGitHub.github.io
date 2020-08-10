# setState的异步分析及实现原理 

在react中如果要实现当前组件的view更新，必须手动调用setState，forceUpdate

- setState，forceUpdate使用场景及区别

forceUpdate会导致组件重新执行render渲染，跳过shouldComponentUpdate，
在父子组件之间相互传递props的时候，如果子组件使用了shouleComponentUpdate/pureComponent优化手段，
父组件传递的props过于复杂，即使props更新了，子组件也可能不会进行更新（因为shouleComponentUpdate使用的
是浅比较），这个时候可以在子组件中使用forceUpdate来进行重新render。

## setState的异步更新思想

在执行setState更新一个状态之后，如果在react的合成事件，以及生命周期函数中直接获取这个更新的state，会发现
最终的结果还是没有更新之前的结果，组件也只会渲染一次。（如果是在原生事件中会获得最新的结果）

说说结果并解析下原因
``  
this.state = {
  num: 0,
  num2: 0,
  value: 2
};
test = () => {
  for (let i = 0; i < 3; i++) {
    this.setState(prevState => {
      return {
        num: prevState.num + 1
      };
    });
    this.setState({
      num2: this.state.num2 + 1
    });
    console.log('num2', this.state.num2);
    console.log('num', this.state.num);
  }
  setTimeout(() => {
    this.setState({
      num3: 2
    });
    console.log('num3', this.state.num3);
  });
};
render() {
  <div className="App">
    <p>
      {this.state.num}---{this.state.num2}
    </p>
    <button onClick={this.test}>test</button>
  </div>
}
```

> num2 0, 
  num 0
  num2 0, 
  num 0
  num2 0, 
  num 0

  num3 2

> 最终的界面显示：3 --- 

[demo例子](https://codesandbox.io/s/setstatedeyibusixiang-b248j)

- 分析：setState是异步执行的，并且test是react的合成事件，因此在不能立即获取最新的执行结果，所有num2,num都是0；而setTimeout
是非合成事件尽管setState异步但是仍然能立即获取最新值；关于setSate的两种使用形式一种是传入函数（可以获取当前state之前的state），
一种是传递对象。

**思考拓展**

```
test = () => {
  for (let i = 0; i < 10; i++) {
    this.setState({
      num: this.state.num + 1
    });
    this.setState(prevState => {
      return {
        num: prevState.num + 1
      };
    });
    console.log("num", this.state.num);
  }
}
```
如果改成这样结果是什么样呢？

>  2

分析：因为第一个setState在执行的时候，总是会将num置为1，所以不管遍历多少次最终的返回结果都是第二个setState 加 1 返回 2

## 为什么setState要是异步？？

异步的原因：
  - 性能优化，减少不必要的渲染，提升用户体验
  - 即使state能做到同步更新，但是props不能

https://github.com/facebook/react/issues/11527

## setSate的简单实现

https://zhuanlan.zhihu.com/p/44537887






