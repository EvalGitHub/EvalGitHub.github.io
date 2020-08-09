# react 对比 vue 的区别

## 核心思想不同

- vue 降低前端开发的门槛

  - Vue推崇灵活易用（渐进式开发体验），数据可变，双向数据绑定（依赖收集）
  - vue推崇的组件配置的方式，template，data，methods，watcher
  - vue提供了许多便于开发的指令：v-if，v-show，v-bind；而react却没有
  - vue的所有解决方案都是官方提供的vue-router，vuex

- react 推崇编程的最佳实践

  - React推崇函数式编程（纯组件），数据不可变以及单向数据流
  - rjx语法，hook无class编程
  - 只关注react的维护，把其他的对应工具交给社区

## 响应式原理不同

- vue使用的是数据劫持依赖收集，核心是Object.defineproperty(vue2)，proxy(vue3)，用户不需要可以关注数据的变化，当数据变化的时候，最自动触发视图的更新。

- react强调state的不可变，每一个更新state必须返回一个新的对象，不对数据的改变进行监控；需要开发者手动触发setState，forceUdare，ReactDom.render()去触发更新。

## 事件机制不同

react使用了一种合成事件机制，会将每个元素上绑定的事件委托到doucment，这么做的目的是为了解决事件的兼容性问题（不同浏览器，不同运行环境reactNative）。

vue使用web标准事件，兼容性问题有开发者自己解决。

## diff算法的异同？？

- 相同点：

  - 对于不同类型的组件或节点直接删除然后新建
  - 同一层次的相同类型节点可以 通过key进行diff优化

- 不同点：

  - vue在进行节点diff时使用的是双向链表，边对比边更新DOM
  - React使用呢diff队列保存需要更新的DOM得到patch树，然后统一更新
 