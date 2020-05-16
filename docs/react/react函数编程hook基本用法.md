# react函数编程hook
**定义**
> Hook 是 React 16.8 的新增特性。它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性

**解决问题：**
- class组件逻辑难复用（高阶组件，render props） ---> 自定义hook实现逻辑的复用，因为组件和 Hook 都是函数，所以操作起来很方便。
- class组件代码趋于复杂不易被理解 ---> 使用function
- class组件的生命周期中往往会注入许多逻辑代码,甚至是滥用 ---> 去掉构造函数、生命周期提升性能，useEffect中可以返回回调函数清除副作用，而不需要在多个生命周期中写入处理代码
- class组件this的必须邦定， hook中不需要绑定this

至于性能方面的提升还有带商榷。

**好处**
>从此可以很流畅的编写无状态组件，减少代码量

**注意**

- Hook不能在class组件中使用

- 不要在循环，条件或者嵌套函数中调用hook，确保总是在React最顶层调用

  列举一种经常的错误：

  ```
    // 🔴 在条件语句中使用 Hook 违反第一条规则
    if (name !== '') {
      useEffect(function persistForm() {
        localStorage.setItem('formData', name);
      });
    }
  ```

  > 确保 Hook 在每一次渲染中都按照同样的顺序被调用。这让 React 能够在多次的 useState 和 useEffect 调用之间保持 hook 状态的正确。


## useState
> import React, { useState } from 'react';

- useState会返回一对值：当前状态、更新状态的函数；类似 class 组件的 this.setState，但是它不会把新的 state 和旧的 state 进行合并
- useState 唯一的参数就是初始state
- 使用Object.is进行判断，如果传入的值相等就不会更新，这点相对于class组件来时是做了优化处理，不需要手动去使用
shouldComponentUpdate去判断。

函数组件：
```
import * as React from 'react';
export function Example () {
  const [count, setCount] = React.useState(0);
  const [obj, setObj] = React.useState({
    name: '测试对象',
    age: 12
  })
  return (
    <div>
      <p>You clicked {count} times</p>
      <p>You age {obj.age} </p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
      <button onClick={() => setObj({...obj, age: obj.age+1})}>
        Add you age
      </button>
    </div>
  );
}
```
> 如果我们想要在 state 中存储两个不同的变量，只需调用 useState() 两次即可。

useState可以传入函数

```
setState(prevState => { // 可以拿到上一次的 state 值
  // 也可以使用 Object.assign
  return {...prevState, ...updatedValues};
});
```

**源码分析**

常规用法：const [count, setCount] = React.useState(0)
返回一个函数，第一个参数是一个state值，第二个参数是修改state的函数

```
Object.assing(React,  {
  useState(initVal:any) {
   function setVal(val:any) {
     initVal = val;
   }
   return [initVal, setVal] 
  }
})
```

## useEffect

**副作用/作用的概念**
>数据获取、订阅或者手动修改过 DOM。我们统一把这些操作称为“副作用”，或者简称为“作用”；可分为需要清除的副作用，和不需要清除的副作用。

**useEffect的作用**
>useEffect 就是一个 Effect Hook，给函数组件增加了操作副作用的能力。它跟 class 组件中的 componentDidMount、componentDidUpdate 和 componentWillUnmount 具有相同的用途

**使用useEffect：不需要清除的副作用**
```
import React, { useState, useEffect } from 'react';
function Example() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```
>默认在组件挂载完之后，和组件更新之后都会执行

**使用useEffect：需要清除的副作用**
- 只需要在useEffect中返回一个函数，React将会在**组件卸载时**执行清除操作
- 每个 effect 都可以返回一个清除函数,可选的清除机制
- 会在调用一个新的effect之前对前一个effect进行清理，对于需要清理的副作用(定时器，监听器)我们需要定义这个函数，
  并且为防止内存泄漏，清除函数会在组件卸载前执行。
```
import React, { useState, useEffect } from 'react';
function FriendStatusWithCounter(props) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  const [isOnline, setIsOnline] = useState(null);
  useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline);
    }
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    };
  });
  // ...
}
```
对于上面的例子我么会发现，每一次的组件更新都会执行**document.title = `You clicked ${count} times**，问题是有时候即使我们没有更新count但还是会执行这句话，就是没有必要的性能浪费。

- class组件中可以做如下优化

```
componentDidUpdate (preProps, preState) {
  if(preState.count !== this.state.count) {
    document.title = `You clicked ${count} times
  }
}

```
- 在useEffect中
```
useEffect(() => {
  document.title = `You clicked ${count} times`;
}, [count]); // 仅在 count 更改时更新
```
> 如果数组中有多个元素，即使只有一个元素发生变化，React 也会执行 effect。

### 关于第二个参数

常见的一个问题，如果第二个参数省略了在useEffect中执行了相关的异步操作并且修改了某个状态，会发现一直循环的执行下去，
这个时候就可以传入了一个空数组（[]）去解决这个问题，传入一个空数组的作用就相当于是状态组件的componentDidMounted中
执行一样，只会在组件mount之后，ummount之前执行。

>函数组件初始化，以及状态更新的时候(如果没有提供第二个参数)，都会执行useEffect。

[useEffect使用指南](<https://zhuanlan.zhihu.com/p/65773322>)

**源码分析**

useEffect接受两个参数，第一个回调函数，第二个参数是一个数组

```
Object.assign(React, {
  let _tmp = null;
  useEffect(callback, depArr:any[]) {
    if (!_tmp) {
      _tmp = depArr.slice();
    }
    let _shouldUpdate = depArr.length === 0 ? true : depArr.every((item:any, index:number) => _tmp[index]) ? false : true;
    if (_shouldUpdate) {
      callback();
      _tmp = depArr.slice();
    }
  }
})
```

**进一步拓展**

>在react hook的使用限制中明确指出，reactHook必须在函数组件的最顶层建立，不能在条件语句循环语句，以及自定义的函数中建立的原因是什么？

首先我们可以看到在定义React.useState、React.useEffect的时候我们可以建立多个，在使用的时候，并不会出现混淆，原因就是hook的源码中使用数组来存储着他们的定义顺序（多以禁忌在条件语句中定义）。

进一步优化上面的源码：

```
const React = (function(){
  let hooks = [];
  let currentIndex = 0;
  return Object.design(React, {
    useState(initStateVal) {
      hooks[currentIndex] = initStateVal;
      function setState(val) {
        hooks[currentIndex] = val;
      }
      return [hooks[currentIndex++], setState]
    },
   
    useEffect(callback, depArr) {
      hooks[currntIndex] = depArr.slice();
      let shouleUpdate = depArr.length === 0? hooks[currntIndex].every((item:any, index:number) => hooks[currntIndex][index] === item) ? false : true;
      if (shouleUpdate) {
        callback();
        hooks[currntIndex++] = depArr;
      }
    }
  })
})()

```
## useContext

接受一个context对象并返回该context的当前值；读取 context 的值以及订阅 context的变化

- useContext 的参数必须是 context 对象本身

**在父组件中创建一个context**
- createContext（）创建一个上下文
- Provider：用于生产共享数据的地方；value：用于放置共享的数据
```
// index.tsx
// 创建一个context
export const NameContext = React.createContext({
  name: "默认名称",
  changeName: () => {}
});
class App extends React.Component<initProps, initState> {
  constructor (props:any) {
    super (props);  
    this.state = {
      name: '我不是默认值'
    }
  }
  changeName = () => {
    this.setState({
      name: '我是改变的值'
    })
  };
  render() {
    return (
     <NameContext.Provider value={{name: this.state.name, changeName: this.changeName}}>
      {Routeconfig()}
     </NameContext.Provider>
    );
  }
};
```

**子组件中消费context**

- Consumer：Consumer需要嵌套在生产者(provider)下面才能通过回调的方式拿到共享的数据源。当然也可以单独使用（例如不是父(index.tsx)子(hook_component.tsx)关系的list.tsx与index.tsx组件），那就只能消费到上文提到的defaultValue
```
import { NameContext } from '@/index';
class List extends React.Component<initProps, initState> {
  render () {
    return (
      <NameContext.Consumer>
        {
          (context) => (
            <>
              <div>this is list page</div>
              <p>{context.name}</p>
            </>
          )
        }
      </NameContext.Consumer>
    )
  }
};
```
如果把子组件写成函数式组件
```
import * as React from 'react';
import { NameContext } from '@/index';
export function HookComponent () {
  const context = React.useContext(NameContext);
  return (
    <>
      <p>this is context {context.name}</p>
      <button onClick={() => context.changeName()}>
        cahngeContext
      </button>
    </>
  );
}
```
参考代码：[index.txs、hook_componen.tsx、list.tsx](<https://github.com/EvalGitHub/webpack_reactJS/blob/master/src/index.tsx>)

## useRef

useRef可用于获取元素节点，常见的操作就是获取input这个元素，实现初始化的自动获取焦点。

```
const Example:React.FC<InitProps> = (props:InitProps) => {
  const inputEl = useRef(null);
  const onBtnClick = () => {
    inputEl.current.focus();
  };
  return (
    <>
      <input ref={inputEl} type="text"/>
      <button onClick={onBtnClick}>clickBtn</button>
    </>
  );
}
```
上面的例子可以清晰看到，使用useRef获取了input这个元素节点，然后修改属性自动获取焦点。

**useRef返回的ref对象在组件的整个生命周期内保持不变**

利用上面的这个特性能做规避很多问题：

1. timeout中读不到其他状态的新值

```
export default function App() {
  const [flag, setFlag] = React.useState(false);
  function dealClick() {
    setValue(!flag);
    timer = window.setTimeout(() => {
      setValue(!flag);
      console.log(value);
    }, 1000);
  }
  return (
    <>
      <p>{value ? "true" : "false"}</p>
      <button onClick={dealClick}>click me </button>
    </>
  );
}
```
我们可以看到在点击按钮之后界面上显示true，1s之后打印出false,但是界面并没有更新为false，上面的问题就是**setValue(!flag)**
这句有问题，因为setValue是用来修改flag（flag是一个状态，对于状态的修改必须返回新的state才会是的视图更新）

使用UseRef来救场

```
export default function App() {
  const [flag, setFlag] = React.useState(false);
  const valueRef = React.useRef(flag); 
  valueRef.current = flag;

  function dealClick() {
    setFalg(!valueRef.current); 
    timer = window.setTimeout(() => {
      setValue(!valueRef.current);
    }, 1000);
  }
  return (
    <>
      <p>{valueRef.current}</p>
      <button onClick={dealClick}>click me </button>
    </>
  );
}
```
因为valueRef.current对于flag来说就是一个新的状态。

## useReducer

可以看做是useState的替代方案
```
const [state, dispatch] = useReducer(reducer, initialArg, init);
```
useReducer 会比 useState 更适用，例如 state 逻辑较复杂且包含多个子值，或者下一个 state 依赖于之前的 state 等。并且，使用 useReducer 还能给那些会触发深更新的组件做性能优化，[因为你可以向子组件传递 dispatch 而不是回调函数](<https://zh-hans.reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down>)。

示例代码参考官网：[代码](<https://zh-hans.reactjs.org/docs/hooks-reference.html#usereducer>)


**比较useState，useReducer**

使用useState的情况：

- state 为基本类型（也要看情况）
- state 转换逻辑简单的场景
- state 转换只会在当前组件中出现，其他组件不需要感知这个 state
- 多个 useState hooks 之间的 state 并没有关联关系

使用 useReducer 的情况：

- state 为引用类型（也要看情况）
- state 转换逻辑比较复杂的场景
- 不同 state 之间存在较强的关联关系，应该作为一个 object，用一个 state 来表示的场景

### useReducer的使用方法

store.js

```
import React from 'react';
const store = React.createContext(null);

export const initialState  = {
 // ....
 // ...
}

export const reducer = (state, action) => {
  switch (action.type) {
    // ...
  }
}

export default store
```
Provider根组件的挂载

```
import React, { useReducer } from 'react'
import store, { reducer, initialState } from './store'

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
     <store.Provider value={{ state, dispatch }}>
      <div/>
     </store>
  )
}
```
业务组件就可以直接使用：

```
import React, { useContext } from 'react'
import store from './store'

cosnt Child = props => {
  const { state, dispatch } = useContext(store)
  // ...
  return (
    <>
      <button onClick={() => dispatch({type: 'increment'})}>+</button>
    </>
  )
}
```


## useCallback，useMemo

这两个hook可用于优化react性能，在项目中经常会存在大批量的逻辑运算，其中有些函数是纯函数（没有任何副作用），相同的输入会返回相同的结果，但是如果不做处理，这些计算会在react组件重新渲染的时候会又一次的去执行，所有我们有必要将这些纯函数逻辑进行缓存，对于相同输入的
情况直接去缓存结果，而不需要重新计算，这就是useCallback，useMemo存在的目的。

> reack hook在组件diff的时候是会重新执行一遍的，这就意味着如果你在react组件中定义普通变量都会重新初始化，但是
如果使用的是useState等hook函数声明的变量只能被是对应的函数更新。

useCallback返回缓存的函数
```
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b],
);
```
useMemo返回缓存的变量
```
const expensiveCount = useMemo(() => {
  let sum = 0;
  for (let i = 0; i < count * 100; i++) {
    sum += i;
  }
  return sum;
}, [count]);
```

useCallback(fn, deps) 相当于 useMemo(() => fn, deps)。

[react中useMemo的用法](<https://blog.csdn.net/hesongGG/article/details/84347484>)

https://zhuanlan.zhihu.com/p/65773322
https://juejin.im/post/5dbbdbd5f265da4d4b5fe57d