# mobx的学习与使用

## mobx是解决什么问题的？

mobx是用来解决项目开发中的状态管理的工具，在某种角度上讲它和redux做着同样的事情，但是处理方式相比redux来说简单很多。

## mobx工作原理？

将所有数据都变成响应式的，响应式数据改变了就会更新视图。

## 与redux的区别

redux的工作流程，dispatch一个action({type, preload})，在reducer中匹配action的type值，修改state然后返回一个新的state，如果需要对应视图的变化，则需要通过this.setState()这种方式；相比而言mobx将所有数据变成了响应式的，监听数据的变化，如果数据变化了可以自动的更新视图（前提是组件也需要被设置成响应式组件）。

## 重要概念

**observable**

1. 使用obsevable将数据变成响应式的

```
// 正对对象：
const person = observable({
  firstName: "Clive Staples",
  lastName: "Lewis"
});

// 数组
const list = observable([1, 2, 4]);

// 原始数据
@observable price = 0;
@observable amount = 1;

@computed get total() {
  return this.price * this.amount;
}
```
对于单个数据的另一种处理形式
```
import {observable} from "mobx";
const cityName = observable.box("Vienna");

cityName.observe(function(change) {
  console.log(change.oldValue, "->", change.newValue);
});
cityName.set("Amsterdam");
```

**@computed**

可以在任意类属性的getter上使用 @computed 装饰器来声明式的创建计算属性

```
@observable price = 0;
@observable amount = 1;
@computed get total() {
  return this.price * this.amount;
}

increasePriece() {
  this.price++;
}
```
如果price变化了，total也会自动变化

**autorun**

autorun用于监听受控数据的变化，如果数据变化了，这个方法会自动触发，在某种程度上和computed的功能相似，区别在于autorun不会产生新的受控数据，而computed会产生新的受控数据；因此autorun被用于异步接口数据请求。
在函数创建之初会自动执行一次。

**reaction**

reaction是autorun的更加精细的控制

基础用法：

>reaction(() => data, (data, reaction) => { sideEffect }, options?)

第一个函数被称为数据函数，第二个函数被称为效果函数；
Reaction在创建之初不会立即执行，只有在数据表达式首次返回一个新值后才会运行。

**note：效果函数仅对数据函数中访问的数据作出反应**

```
const reaction3 = reaction(
  () => counter.count,
  (count, reaction) => {
    console.log("reaction 3: invoked. counter.count = " + count);
    reaction.dispose();
  }
);
```
传入 reaction 的第二个函数(副作用函数)当调用时会接收两个参数。 第一个参数是由 data 函数返回的值。 第二个参数是当前的 reaction，可以用来在执行期间清理 reaction。

# 使用mobx的理由

1. 使用mobx+react项目类似与vue，可以在数据状态更新之后立即获取最新的值（不存在setState的异步问题）
2. 如果状态值没有更新就不会触发组件的重新渲染，省去了shouldComponentUpdate/immutable.js这几个优化操作

- 参考链接：
https://cn.mobx.js.org/refguide/tojson.html
https://mobx-react.js.org/observer-hook
https://ymbo.github.io/2018/03/06/mobx%E5%9F%BA%E6%9C%AC%E7%94%A8%E6%B3%95/