# mobx的学习与使用

## mobx是解决什么问题的？

## mobx工作原理？

## 与redux的区别

## 简单的使用公式



https://cn.mobx.js.org/refguide/tojson.html
https://mobx-react.js.org/observer-hook
https://ymbo.github.io/2018/03/06/mobx%E5%9F%BA%E6%9C%AC%E7%94%A8%E6%B3%95/

# 使用mobx的理由

1. 使用mobx+react项目类似与vue，可以在数据状态更新之后立即获取最新的值（不存在setState的异步问题）
2. 如果状态值没有更新就不会触发组件的重新渲染，省去了shouldComponentUpdate/immutable.js这几个优化操作