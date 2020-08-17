# angularjs脏值检查的原理

在使用angularJS的时候，$scope用来定义变量，当我们使用angularjs的指令
ng-click, ng-mouse，ng-click, ng-modal, ng-keyup等方法更新$scope上的变量时，
会触发视图的更新，因为这些angular的内部指令封装了$apply。

但是如果是使用原生方法去修改了$scope上的变量则会发现视图并没有得到更新，这个时候我们会使用 **$scope.$apply** 来解决这个问题。

分析其实现原理：

### 使用$watch建立绑定关系

当一个作用域创建的时候，angular会去解析当前作用域下的模板结构，寻找动态插值
或者函数调用的地方，并用$watch建立绑定，对应的信息被绑定到angular内部的一个
watcher中，他是一个队列（数组）。

### $digest遍历递归watcher数组

脏值检查的核心就是 **$digest循环**

 1. 当用户执行某些操作之后，angular就会执行$digest遍历整个数组，并用一个dirty（默认为true）变量记录watchers里面那些$scope属性是否有变化（取出属性的oldVal和newVal进行对比，如果有变化用新值代替就值）。

 2. 当有变化的时候dirty设置为true，在$digest执行结束时候会再次检查dirty，如果还是为true，他会再次执行$digest，直到dirty为false（如果递归执行次数超过10次，会直接抛出错误，并挑出循环）。

### 将变化后的$scope重新渲染到界面

当递归流程执行结束之后，$digest会将变化后的$scope重新渲染到界面上

[angular脏检查原理及伪代码实现](https://juejin.im/post/6844903617992851463#heading-0)，

[理解angularJs](https://github.com/xufei/Make-Your-Own-AngularJS/blob/master/01.md)