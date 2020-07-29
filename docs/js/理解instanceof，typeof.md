# 理解instanceof，typeof

## instanceof的原理

A instanceof B

判断B的prototype是否在A的原型链上

- Object instanceof Object 结果及原因？

```
Object.__proto__ === Function.prototype;

Function.prototype.__proto__ === Object.prototype
```

- Function instanceof Function 结果及原因？

```
Function.__proto === Function.prototype
```

https://juejin.im/post/5b0b9b9051882515773ae714