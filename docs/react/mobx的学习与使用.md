# mobx的学习与使用

## mobx是解决什么问题的？

mobx是用来解决项目开发中的状态管理的工具，在某种角度上讲它和redux做着同样的事情，但是处理方式相比redux来说简单很多。

## mobx工作原理？

通过object.defineproperty/proxy将所有数据都变成响应式的

## 与redux的区别

redux的工作流程，dispatch一个action({type, preload})，在reducer中匹配action的type值，修改state然后返回一个新的state，如果需要对应视图的变化，则需要通过this.setState()这种方式；相比而言mobx将所有数据变成了响应式的，监听数据的变化，如果数据变化了可以自动的更新视图（前提是组件也需要被设置成响应式组件）。

## 重要概念

在使用mobx的时候建议配制
```
// “强制动作” 强制所有状态变更都必须通过动作来完成。在大型、长期的项目中，这是十分有用的最佳实践
configure({ enforceActions: true });
```

### observable/@observable

1. 使用obsevable将数据变成响应式的，内部原理也是使用Object.defineproperty / proxy来对数据进行劫持监听
2. 把一个普通的 JavaScript 对象传递给 observable 方法，对象的所有属性都将被拷贝至一个克隆对象并将克隆对象转变成可观察的

@observable是observable的装饰器形式

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

### @computed

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

### autorun

autorun(callback, object{
  delay: 可用于对效果函数进行去抖动的数字(以毫秒为单位)。如果是 0(默认值) 的话，那么不会进行去抖。

})

> autorun用于监听受控数据的变化，如果数据变化了，这个方法会自动触发，在某种程度上和computed的功能相似，区别在于autorun不会产生新的受控数据，而computed会产生新的受控数据；因此autorun被用于异步接口数据请求。

在函数创建之初会自动执行一次。

```
const MobxState:any = observable({
  count: 0,
  price: 100,
  total: 0,
})
....
....

let disposer = autorun(() => {
  MobxState.total = MobxState.count * MobxState.price;
  console.log('autorun执行了');
}, {
  delay: 300 // 每次变化时将其发送给服务器，但发送前至少要等300毫秒
})
// disposer(); 如果执行了这个，以后就不会监听了
```

区分computed和autorun ?

> 如果你想响应式的产生一个可以被其它 observer 使用的值，请使用 @computed，如果你不想产生一个新值，而想要达到一个效果，请使用 autorun。 举例来说，效果是像打印日志、发起网络请求等这样命令式的副作用。

### reaction

reaction是autorun的更加精细的控制

在函数**创建之初会不会执行**。

基础用法：

>reaction(() => data, (data, reaction) => { sideEffect }, options?)

第一个函数被称为数据函数，第二个函数被称为效果函数；

Reaction在创建之初不会立即执行，只有在数据表达式首次返回一个新值后才会运行。

```
reaction(() => MobxState.count, (data, reaction) => {
  console.log('reaction中的data' + data) 
  if (data === 10) {
    reaction.dispose(); // 清除这个监听
  }
})
```

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

### when

```
constructor(props:initProps) {
    super(props);
    when(
       // 第一个函数是一个条件值，返回true就会执行第二个
       // 函数（然后就会被清除，意味着只能执行一次）
      () => MobxState.count === 5,
      () => this.getAlertMsg(),
    );
    autorun(() => {
      MobxState.total = MobxState.count * MobxState.price;
      console.log('autorun执行了');
    })
  }
```

### action

如果我们配制了**configure({ enforceActions: true });**，那么就要求所有针对observe的数据更改，需要在action中进行，否则会报错

```
class MobxUse extends React.Component<initProps, initState>{
  @observable age = 0;

  @action.bound // 所有状态变更都必须通过动作来完成。
  changeAge = () => {
    this.age++;
  }
  render() {
    return <>
      <button className={style.btn} onClick={this.changeAge}>changeAge++</button>
    </>;
  }
}
```

### runInAction

```
mobx.configure({ enforceActions: true })

class Store {
    @observable githubProjects = []
    @observable state = "pending" // "pending" / "done" / "error"

    @action
    fetchProjects() {
        this.githubProjects = []
        this.state = "pending"
        fetchGithubProjectsSomehow().then(
            projects => {
                const filteredProjects = somePreprocessing(projects)
                // 将‘“最终的”修改放入一个异步动作中
                runInAction(() => {
                    this.githubProjects = filteredProjects
                    this.state = "done"
                })
            },
            error => {
                // 过程的另一个结局:...
                runInAction(() => {
                    this.state = "error"
                })
            }
        )
    }
}
```

[常用与异步处理](<https://cn.mobx.js.org/best/actions.html>)

## 使用mobx的理由

1. 使用mobx+react项目类似与vue，可以在数据状态更新之后立即获取最新的值（不存在setState的异步问题）
2. 如果状态值没有更新就不会触发组件的重新渲染，省去了shouldComponentUpdate/immutable.js这几个优化操作
3. 对比redux较简单，而且不需要其他的中间件（例如react-redux， redux-saga）

## observer 函数/装饰器可以用来将 React 组件转变成响应式组件

```
import { observer } from 'mobx-react';

@observer class MobxUse extends React.Component<initProps, initState> {
  // @observable count = 0;
  constructor(props:initProps) {
    super(props);
    when( // 第一个函数是一个条件值，返回true就会执行第二个函数（然后就会被清除，意味着只能执行一次）
      () => MobxState.count === 5,
      () => this.getAlertMsg(),
    );
    autorun(() => {
      MobxState.total = MobxState.count * MobxState.price;
      console.log('autorun执行了');
    })
  }

  render() {
    return (
      <>
        ....
        ....
      </>
    )
  }
}
```
如果是无状态组件

```
const Timer = observer(({ timerData }) =>
    <span>Seconds passed: { timerData.secondsPassed } </span>
);
```

- 参考链接：
https://cn.mobx.js.org/refguide/tojson.html 

https://mobx-react.js.org/observer-hook

https://ymbo.github.io/2018/03/06/mobx%E5%9F%BA%E6%9C%AC%E7%94%A8%E6%B3%95/