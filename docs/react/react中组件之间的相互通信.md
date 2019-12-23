# react中组件相互通信的方式
项目开发中组件之间的相互传递属性是十分常见的，尤其在react这种单向数据流框架中。

## 父，子组件传递信息（props的使用）

- 最常用的方式就是通过props来进行属性的传递
```
 <DataList
  pageSize={this.state.pageSize}
  initalCurrentPage={this.state.initalCurrentPage}
  dataList={this.state.dataList} 
  getWorksInfo={this.getWorksInfo.bind(this)}/>
```
我们可以看到在上面的例子中我们通过props(pageSize,initalCurrentPage,dataList)向组件DataList传递了三个属性值，在DataList中我们只需要通过this.props[变量名]即可获取父组件传递的值，这样就完成了**父组件向子组件**的一个信息传递。

- 那么在父组件中如何调用子组件的方法了？

通过ref获取到子组件实例，然后可以使用这个实例对子组件做很多是（函数的调用，state的更改等等...）
```
class ParentComponent {
  private SearchTab: SearchTab;
  ...
  ...

  updateDateList () {
    this.SearchTab.setState({
      count: 0;
    });
    this.SearchTab.filterData();
  };

  render () {
    return (
      <>
        <DataList
          ref={r => this.SearchTab = r} 
          pageSize={this.state.pageSize}
          initalCurrentPage={this.state.initalCurrentPage}
          getWorksInfo={this.getWorksInfo.bind(this)}
          />
      </>
    )
  }
}
```
> 也可以通过React.createRef()方法实现，原理相同

- 如何实现子组件向父组件传递信息了？

最常用的方式就是通过在子组件中回调父组件传递的方法；在上面例子中我们可以看到**getWorksInfo**这个属性是一个函数（绑定了父组件的getWorksInfo方法），那么在DataList中就可以使用**this.props.getWorksInfo(prams1,....)**来调用父组件中的方法了（可以传递参数更新父组件的state,还可以在这个回调中调用父组件其他方法）这样就简单完成了从子组件向父组件的之间的通信。

## 跨级组件之间的相互通信（context，React.forwardRef）

在项目开发中经常会用到跨级组件的之间的相互通信

我们可以通过context进行消息传递，关于context的使用，参考示例代码如下：[React.createContext](<https://github.com/EvalGitHub/webpack_reactJS/blob/master/src/index.tsx>)

关于[React.forwardRef](<https://zh-hans.reactjs.org/docs/react-api.html#reactforwardref>)

## 组件之间通信的其他方式

以上的几种方式都是react官方明确给出，组件之间的相互通信涉及两种：状态属性的传递，触发组件之间的方法；但是对于属性的传递我们可以跳出react还有很多思路

1. 借助浏览器缓存（localStorage，sessionStorage）
2. redux等第三方状态管理工具库

## 兄弟组件之间的相互通信
- 通过props与ref的组合形式

  **具体思路：** 父组件将方法fn（fn中通过ref获取组件B的实例）通过props传递给组件A，组件A就可以通过回调fn间接与组件B进行通信了。

- 通过redux

  详细使用方式参照redux的使用方式。

- 通过自定义事件的方式(此方法不仅仅适用于兄弟组件之间的通信)（借助[Node.js Events](<https://www.npmjs.com/package/events>)模块的浏览器版实现）

**具体实现方式：**

1. 首先需要在建立一个模块

create_event.tsx
```
import { EventEmitter } from 'events';
export const emitter = new EventEmitter();
```
2. 使用这个模块emitter去emit定义一个消息'changeMessage'，以及传递参数

detail.tsx
```
emitter.emit('changeMessage', '改变msg');
```
3. 订阅这个消息

react_create_ele.tsx
```
createMsg () {
  this.eventEmitter = emitter.on('changeMessage', (message) => {
    this.setState({
      message,
    });
  }).removeListener('updateUserInfoSucc', () => {
    // 每一次监听之后就移除，避免重复监听
    console.log('移除');
  });;
};
componentWillUnmount() {
  // emitter.removeAllListeners();
  emitter.removeListener(this.eventEmitter, () => {});
};
componentDidMount () {
  this.createMsg();
};
```
具体实现代码参考：[event_trans_info](<https://github.com/EvalGitHub/webpack_reactJS/tree/master/src/components/event_trans_info>) 


参考：[React中组件通信的几种方式](<https://segmentfault.com/a/1190000012361461?utm_source=tag-newest#articleHeader6>)
