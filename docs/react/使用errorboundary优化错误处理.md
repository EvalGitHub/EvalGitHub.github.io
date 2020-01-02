# 关于errorboundary的使用

在react16中，任何未被错误边界捕获的错误将会导致整个 React 组件树被卸载。

## 使用errorboundary的原因

以react为框架的项目开发中如果遇到一些没被处理的javascript错误，会导致整个应用崩溃，为了更好的用户体验，优雅的处理错误的方式，errorBoundary由此而生，他会在错误发生的时候不去渲染那些错误的组件，而去渲染开发者提供的备用组件。

## errboundary也不是万能的

errorBoundary也不是能够处理所有的异常错误

- 不能捕获非子组件的错误
- 不能捕获异步，setTimeout/setInterval中的错误
- 不能捕获事件处理中的错误

对于以上不能被处理的错误方式，只能通过其他的方式去处理

try....catch，window.onerror

## errboundary的错误捕获

一般会封装一个简单的ErrorBoundary组件去包裹需要进行处理的组件；如果子组件中出现了错误，我们可以在Errorboundary组件的“getDerivedStateFromError”，或者“componentDidCatch”中捕获到错误，我们可以针对于个人的需要封装多种errorboundar组件来应对需要。

## errboundary的使用方式

封装一个简单的Errorboundary组件
```
interface InitProps {}
interface InitState {}
export class ErrorBoundary extends React.Component<InitProps, InitState> {
  state = {
    hasError: false
  };

  componentDidCatch(error: Error, info: any) {
    this.setState({
      hasError: true
    });
  }
  
  render() {
    if (this.state.hasError) {
      return <h1 className="error_wrapper">there is something error</h1>;
    }
    return this.props.children;
  }
}
```
然后可以使用ErrorBoundary包裹你要进行处理的组件
```
import { Detail } from "./container/detail/index";
import { ErrorBoundary } from "./component/errorBoundary";
function App() {
  return (
    <div className="App">
      <h1>ErrorBoundary</h1>
      <ErrorBoundary>
        <Detail />
      </ErrorBoundary>
    </div>
  );
}
```

[errorboundary的简单使用](<https://codesandbox.io/s/react-error-boundary-2zee4>)