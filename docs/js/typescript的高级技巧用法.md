# TypeScript的高级技巧用法

## 联合类型

> let a: string | number = '123'  // 变量a的类型既可以是string，也可以是number
a = 123

## keyof

将一个类型的属性名全部提取出来当做联合类型

```
interface Person {
  name: string;
  age: number;
 }
type PersonAttribute = keyof Person; 
// 类似于 type PersonAttribute = 'name' | 'age'
```

## Record

Record用于属性映射

1. 定义一个普通的对象类型

```
type MyObject = Record<string, string>;
等价于
type MyObject = {
  [x: string]: string;
}
```

2. 搭配联合类型用法

```
type Test = 'name' | 'age' | 'sex';
type TestOne = Record<Test, string>; 
等价于
type TestOne = {
  name: string;
  age: string;
  sex: string;
}
```

3. 射对象,让对象的每个属性都是一个拥有特定键值对的类型

```
interface Test {
  name: string;
  age: string;
  sex: string;
}
type Person = Record<string, Test>;

等价于
type Person = {
    [x: string]: Test;
}
```

- Record的内部定义，接收两个泛型参数

```
type Record<K extends string|number|symbol, T> = {
  [P in K] : T;
}
```

## Partial

ts中就是让一个定义中的所有属性都变成可选参数

```
interface Person {
  name: string
  age: number
}
const studentOne:Person = {
  name: 'tom'
}
```
上述例子studentOne如果只有nam属性，ts会提醒缺失age属性, 这个时候可以使用Partial

```
const studentOne:Partial<Person> = {
  name: 'tom'
}
```
内部实现

```
type Partial<T> = {
  [P in keyof T]?: T[P]
}
```

## Required

和Partial刚好相反，将一个定义中的属性全部变成必选参数

```
interface Person {
  name?: string
  age: number
}
const studentOne:Person = {
  age: 333
}
```
上述例子中定义了name为可选属性，所以studentOne中即使定义了age也是可以通过的

```
interface Person {
  name?: string
  age: number
}
const studentOne:Required<Person> = {
  age: 333
}
```
但是这个时候就会提示缺失name属性了

- 实现原理
```
type Required<T> = {
  [P in keyof T]?: T[P];
}
```

## Pick

可以选择一个原来的接口中一部分的属性定义

```
interface Person {
  name?: string;
  sex:string;
  age: number;
}
type newPerson = Pick<Person, 'name'|'age'>

等价于
type newPerson = {
  name: string;
  age: number;
}
```

- 内部实现原理

```
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

第一个泛型 T 便是 interface 或者 type 定义
第二个就是第一个定义中的属性， extends就代表继承
K extends keyof T 等同于 k extends ‘name’ | ‘age’,意思就是k只能是age或者name
```

## Readonly 

让一个定义中的所有属性都变成只读参数

```
interface Person {
  name?: string;
  sex:string;
  age: number;
}
let newPerson:Readonly<Person>= {
  name: 'eee',
  sex: 'eee',
  age: 2
} 
newPerson.age = 4444; // 这句话会报错
```
上面的写法等价于

```
interface Person {
  readonly name?: string;
  readonly sex:string;
  readonly age: number;
}
let newPerson:Readonly<Person>= {
  name: 'eee',
  sex: 'eee',
  age: 2
} 
```
- 内部实现原理

```
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
}
```

## Exclude

ts中可以排除 **联合类型** 中一部分的内容

```
type StuType = 'age' | 'sex' | 'name';
type newPersonType = Exclude<Person, 'age'>;

等价于 
type newPersonType = 'sex' | 'name';
```

- Exclude的原理

```
type Exclude<T, U> = T extends U ? never : T
```

我们这里用 StuType 也就是 ‘name’ | ‘age’ | sex 去代表 T
用 age 属性去代表第二个泛型 U
T extends U 就判断是否’name’ | ‘age’ | 'sex' 有 name， 有name就返回never,就代表将其排除

## Omit (省略的)

将 **接口或者类型** 的键值对删除一部分

```
interface Person {
  readonly name?: string;
  readonly sex:string;
  readonly age: number;
}
type newPerson = Omit<Person, 'age'>;
等价于
type newPerson = {
  name: string,
  sex: string,
} 
```
- Omit实现原理

```
type Omit<T, K extends string | number | symbol> = {
  [P in Exclude<keyof T, K>]: T[P]
}
```