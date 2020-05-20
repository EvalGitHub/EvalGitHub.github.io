# mob-react的使用

## 使用注意

- 如果项目中存在class components就使用mobx-react@5
- 如果项目中既有class components 和 hooks就使用mobx-react@6 (包含mobx-react-lite)
- 如果项目中没有class components就使用mobx-react-lite

**note：**

> The Provider/inject in mobx-react@6 has been migrated to React Context, however it might be removed in future versions completely. Consider using Context directly.

## 状态管理

### 创建state

```
import { observable } from 'mobx'
import { useLocalStore } from 'mobx-react' // 6.x or mobx-react-lite@1.4.0
function CreatingState() {
  const simpleState = React.useRef(observable.array([1, 2, 3])).current
  const localState = useLocalStore(() => ({
    count: 0,
    inc() {
      localState.count += 1
    },
  }))
  return <Rendering simple={simpleState}  local={localState} />
}
```

### 获取state 

**方式一：** 创建state，通过useReducer
**方式二：** 创建state，通过props传递
**方式三：** 全局创建，然后在需要使用的地方import
**方式四：** 使用React.context

**useLocalStore**

在组件内部可以使用useLocalStore创建局部的可观测的state（useLocalStore也可用与创建全局state）

```
import React from 'react'
import { useLocalStore, useObserver } from 'mobx-react' // 6.x

export const SmartTodo = () => {
  const todo = useLocalStore(() => ({
    title: 'Click to toggle',
    done: false,
    toggle() {
      todo.done = !todo.done
    },
    get emoji() {
      return todo.done ? '😜' : '🏃'
    },
  }))

  return useObserver(() => (
    <h3 onClick={todo.toggle}>
      {todo.title} {todo.emoji}
    </h3>
  ))
}
```

## 区别Observer, useObserver, observer

没什么本质区别，只是写法不一样（Observer, useObserver只能在组件内部使用）

```
import { observable } from 'mobx'
import { Observer, useObserver, observer } from 'mobx-react' // 6.x or mobx-react-lite@1.4.0
import ReactDOM from 'react-dom'

const person = observable({
  name: 'John',
})

// named function is optional (for debugging purposes)
const P1 = observer(function P1({ person }) {
  return <h1>{person.name}</h1>
})

const P2 = ({ person }) => <Observer>{() => <h1>{person.name}</h1>}</Observer>

const P3 = ({ person }) => {
  return useObserver(() => <h1>{person.name}</h1>)
}

ReactDOM.render(
  <div>
    <P1 person={person} />
    <P2 person={person} />
    <P3 person={person} />
  </div>,
)

setTimeout(() => {
  person.name = 'Jane'
}, 1000)
```

## 实战例子

1. 创建一个store [counter_store.tsx]

```
import { observable, action, computed } from 'mobx';
export class CounterStore {
  @observable 
  count = 0;

  @action
  increment() {
    this.count++:
  }

  @action 
  decrement() {
    this.count--;
  }

  @computed
  get doubleCount() {
    return this.count *2;
  }
}
```
2. 然后在全局context上注册store [store.tsx]

```
import React from 'react';
import { CounterStore } from "./counter_store";

export const storeContext = React.createContext({
  counterStore: new CounterStore()
})

export const useStores = () => React.useContext(storeContext);
```
3. 然后在组件中使用这个context

```
import React from "react";
import { observer } from "mobx-react";
import { useStores } from "../store";

export const Counter = observer(() => {
  const { counterStore } = useStores();
  return (
    <>
      <div>{counterStore.count}</div>
      <button onClick={() => counterStore.increment()}>++</button>
      <button onClick={() => counterStore.decrement()}>--</button>
    </>
  );
});
```

[实践例子](<https://codesandbox.io/s/mobx-reactpeihecontextdeshiyongfangfa-1hol6?file=/src/component/friend_make.tsx>)，[mobx-react教程](<https://mobx-react.js.org/recipes-migration>)