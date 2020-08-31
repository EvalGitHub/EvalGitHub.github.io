# js内存管理

js具备自动回收机制

## js垃圾回收的原理

## 回收策略

- 标记清除

- 引用计数

当声明了一个变量a并将一个引用类型值（{name:'cc'}）赋给该变量时，则这个值的引用次数就是1，如果a（{name:'cc'}）又赋给另一个变量b，则该值的引用次数加1。反之，如果a赋值{name:'xx'}，则{name:'cc'}这个值的引用次数减1。当{name:'cc'}这个值的引用的次数变为0时，则说明没有办法再访问{name:'cc'}这个值了，因而可以将其占用的内存空间回收。这样，当垃圾回收器工作的时候，{name:'cc'}这个值占用的内存空间就会被回收。

但是有一个严重问题：循环引用。

```
function circleReferenceProbem(){
  let objectA = new Object()
  let objectB = new Object()

  objectA.someOtherObject = objectB
  objectB.anotherObject = objectA
}
```

执行这个函数后，因为这两个引用值的引用次数永远不会为0，垃圾回收器永远不会回收它们占用的内存空间。