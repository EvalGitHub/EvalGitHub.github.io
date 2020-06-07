# vue3.0更新点以及新特性

## 更新的原因： 
1. 当项目比较复杂，随着项目周期的延长，开发人员很难去明白某些代码的功能，现存的api会强制开发者去组织某些代码逻辑，但是通过功能逻辑组织代码会更有意义。

2. 组件之间的共能逻辑复用成本较高。

## 较大的更新点：

1. 更好的类型约束,引入Typescript

低于大型项目我们需要对js做类型约束，降低错误的风险。

2. 编程风格改变，更倾向与函数编程风格

不使用class的写法原因是对于this的上下文处理比较复杂，得不偿失。

3. API更新

4. 数据侦测使用proxy代替Object.defineProperty，很好的解决了数组，对象的侦测问题
  （v2.0中对于数组的侦测需要使用vue改写的8种数组操作API push，pop，shift，unshift，splice，sort，reverse, 针对对象使用$set来处理），但是总是不优雅，
  改写Array的原生api，$set的重新添加侦测。

5. 性能提升
  重新写了虚拟dom的实现，编译模板的优化（将模板划分为静态节点，非静态节点，静态节点是不参与分析与diff的，而是直接复用） 

6. tree shaking的支持
  很多时候我们可能不需要vue的所有功能个（比如v-model, transition）,vue3将做到按需加载

**setup**

- 释意：这是一个新提出的组件属性，充当整个组件的入口，在组件属性初始化的时候会调用，早于beforeCreate生命周期。

- 使用：setup返回一个对象，对象的属性直接可使用与模版（直接合并到组件模版上下文）

- 参数：可以接受一个props作为第一个参数,这个参数是可响应的，如果有新值传入就会改变，可以通过watch进行监控；
第二个参数是对象context，暴漏了一些属性【attrs，slots，slot】, attrs，slots都是组件实例的内部代理，都是实时的最新值。
```
<template>
  <div>{{ object.foo }}</div>
</template>
<script>
  import {reactive} from 'vue';
  export default {
    props: {
      name: String
    }
    setup(props) {
      const object = reactive({foo: 'bar'});

      watch(() => {
        console.log(`name is: ` + props.name)
      })

      return {
        object
      }
    }
  }
</script>
```

**reactive**

- 释意：这个api相当vue2中的Vue.observable()，不过他的是实现是基于es6的proxy，
- 使用：接受一个对象并且返回一个对象。 

```
const obj = reactive({ count: 0 })
```

vue3.0中使用proxy来实现了数据劫持功能，替换了之前的object.defineProperty，原因是使用Object.defineProperty在对对象进行
劫持的时候需要对对象进行**层层的遍历，重写set，get方法，如果目标对象结构比较复杂，这是个十分消耗性能**的方法；此外如果在初始化之后去修改这个对象的属性，或者给目标数组增加新值，**可能会造成数据的更新是非响应式的**。

针对以上问题官网给出了解决方案，针对对象增加新属性可以使用vue.$set，针对数组设置新值可以使用指定的api[push, pop, shift, unshift, splice, sort, reverse]

在vue3中使用了proxy就可避免上面的两个问题

>var proxy = new Proxy(target, handler);

第一个参数是所要代理的目标对象，即如果没有Proxy的介入，操作原来要访问的就是这个对象
第二个参数是一个配置对象，对于每一个被代理的操作，需要提供一个对应的处理函数，该函数将拦截对应的操作
```
var proxy = new Proxy({}, {
  get: function(target, propKey) {
    return 35;
  }
});
proxy.time // 35
proxy.name // 35
proxy.title /
```

**ref**

- 释意：接受一个值返回一个可响应的，可变的ref object
- 使用：ref object内部用个.value属性指向他的内部值

```
const count = ref(0);
conunt.value++;
console.log(count.value);
```

如果是在模版上使用不需要添加.value可直接获取值
```
<template>
  <div>{{ count }}</div>
</template>
<script>
export default {
  setup() {
    return {
      count: ref(0)
    }
  }
}
</script>
```

**isRef**

可用于检查一个值是否是ref object

```
const unwrapped = isRef(foo) ? foo.value : foo
```

**toRef**

- 解释：可以将一个reactived对象转化为一个普通对象，但是这个普通对象的上的每一个属性都是原始reactive对象的每个属性的ref

```
const state = reactive({
  foo: 1,
  bar: 2
});
const stageAsRefs = toRefs(state);
state.foo++;
console.log(stateAsRefs.foo); // 2

stateAsRefs.foo.value++;
console.log(state.foo);
```

- 使用场景：

如果一个函数返回了一个reactive对象obj，在外面需要结构这个obj，这个时候结构生成的属性都不是可响应的了
```
function getDataObj() {
  const state = reactive({
    foo:1,
    bar:2,
  });
  return state;
}
export default {
  setup() {
    const {foo, bar} = getDataObj();
    return {
      foo,
      bar
    }
  }
}
```

解决方法：使用toRef进行转换
```
function getDataObj() {
  const state = reactive({
    foo: 1,
    bar: 2
  })
  return toRefs(state)
}
```

**computed**

使用：

- 方法一：默认接受一个get方法，返回一个不可修改的reactive ref对象

```
const count = ref(1);
const pl = computed(() => count.value +1);
console.log(pl.value); // 2
// plusOne是不可修改的
pl.value++ // error
```

- 方法二：提供get，set方法，这个时候会返回一个可写的ref对象

```
const count = ref(1)
const plusOne = computed({
  get: () => count.value + 1,
  set: val => { count.value = val - 1 }
})
plusOne.value = 1
console.log(count.value) // 0
```

**readonly** 

接受一个对象（普通，或者reactive，ref）返回一个只读的对象

```
const original = reactive({ count: 0 })
const copy = readonly(original)
```

## 生命周期hook

- beforeCreate -> setup()
- created -> setup()
- beforeMount -> onBeforeMount
- mounted -> onMounted
- beforeUpdate -> onBeforeUpdate
- updated -> onUpdated
- beforeDestroy -> onBeforeUnmount
- destroyed -> onUnmounted
- errorCaptured -> onErrorCaptured

这些生命周期函数在使用之前需要通过import引入，并且只能在setup中使用

```
import { onMounted, onUpdated, onUnmounted } from 'vue';
setup() {
  onMounted(() => {
    console.log('mounted!')
  })
  onUpdated(() => {
    console.log('updated!')
  })
  onUnmounted(() => {
    console.log('unmounted!')
  })
}
```

# 为什么vue3.0不实现时间分片？

原因就是不需要，vue的响应式设计原理相对于react的Reactivity（通过setState去出发更新）已经减少了很多不必要的
DOM重新渲染。

时间分片的目的就是充分利用cpu的效率去执行程序，但是他只是改善了cpu的执行效率，而不是解决DOM的更新优化；
在react中由于他的底层实现原理，以及JSX语法等相对与vue来说都是比较消耗性能的（react因此提供了一些钩子函数（shouldComponent, pureComponent, useMemo, useCallback）让开发者自行去优化，但是大部分情况下都是被忽视的），因此react相对于vue是更需要时间分片的；

[Why remove time slicing from vue3?](https://github.com/vuejs/rfcs/issues/89)

参考：

[vue-composition-api](https://vue-composition-api-rfc.netlify.com/api.html#setup)

[尤雨溪在Vue3.0 Beta直播里聊到了这些…](https://juejin.im/post/5e9f6b3251882573a855cd52#heading-24)

[Vue3 究竟好在哪里？（和 React Hook 的详细对比）](https://juejin.im/post/5e9ce011f265da47b8450c11#heading-9)