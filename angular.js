function Scope() {
  this.$$watchers= [];
}

Scope.prototype.$watch = function(watchFn, listenerFn) {
  var watcher = {
    watchFn: watchFn,
    listenerFn: listenerFn
  }
  this.$$watchers.push(watcher);
}

Scope.prototype.$digest = function() {
  this.$$watchers.forEach(function(watch) {
    watch.listenerFn();
  })
}

var scope = new Scope();

scope.$watch(
  function() {console.log('watchFn')},
  function() {console.log('listener')}
)

scope.$digest();
scope.$digest();
scope.$digest();
