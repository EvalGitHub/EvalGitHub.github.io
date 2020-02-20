# vue知识点

## 简单说下mvc, mvvm 

- mvc 

mvc这种设计模式来源于后端开发，v（view）用于控制视图结构展示，c（controller）用于对接视图的响应,业务逻辑处理，m（model）用于数据库数据处理；对应到前端m的作用发生了改变，在前端m主要负责数据模型变化响应到view；
mvc的所有通信都是单向的。至于angularjs是mvc的说法都

- mvvm

v（view）视图的变更会触发vm（viewModel）的监听事件去修改数据模型model；model的数据更改会触发vm的数据绑定进而驱动v的更新。

![avatar](../assets/mvvm.png)

## vue响应式数据原理

组件data中定义的属性，在组件初始化的时候会对data进行深层遍历，对每一个属性使用Object.defineProperty执行getter/setter转化，
每一个属性都有一个watcher实例，会在渲染过程中为数据属性记录依赖，如果属性值发生改变则会触发setter函数，依赖数组执行notify函数通知watcher，watcher会执行相关compiler函数进而触发关联组件的重新渲染。

[深入理解vue响应式原理](https://cn.vuejs.org/v2/guide/reactivity.html#ad)

[我的第一个vue实现-evel-vue](https://github.com/Arrayeval/evel-vue/tree/master/vue-coding)

使用Object.defineProperty写一个简单的双向绑定
```
<input type="text" id='nameEl'>
<span id='nameShow'></span>  
<script>
  var obj = {};
  Object.defineProperty(obj, 'name', {
    set: function(newVal) {
      document.getElementById('nameEl').value = newVal;
      document.getElementById('nameShow').innerHTML = newVal;
    }
  });

  document.addEventListener('keyup', function(e) {
    obj.name = e.target.value;
  })
</script>
```
使用proxy实现一个简单的双向绑定
```
<input type="text" id='nameEl'>
<span id='nameShow'></span>  
<script>
  var obj = {};
  
  let infoData = new Proxy(obj, {
    set: function(obj, prop, value) {
      document.getElementById('nameEl').value = newVal;
      document.getElementById('nameShow').innerHTML = newVal;
    }
  })

  document.addEventListener('keyup', function(e) {
    obj.name =  e.target.value;
  })
</script>
```

## vue如何检测数组的变化

## vue中异步渲染，以及异步渲染的原因

## nextTick的作用，及原理

## vue组件生命周期，以及各做了什么事情











