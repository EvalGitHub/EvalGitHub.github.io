# nodemon的原理

监听文件的改变，重新执行命令

- 使用chokidar监听文件的改变
- 使用spawn执行node命令

## 使用chokidar监听文件的改变

- nodemon.js

```
const chokidar = require('chokidar');
const { spawn } = require('child_process');
let time_id = null;
let child_process = null;

chokidar.watch(['main.js', 'test.js']).on("all", (event, path) => {
  debounce(() => reStart(path), 500)();
})

function debounce(fn, delay) {
  return () => {
    clearTimeout(id);
    time_id = setTimeout(() => {
      fn();
    }, delay);
  }
}

function reStart(path) {
  child_process && child_process.kill();
  console.log(`${path}改变了...`);
  child_process = spawn('node', ['main.js'], {
    stdio: [process.stdin, process.stdout, process.stderr]
  })
}

const chokidar = require('chokidar');
const { spawn } = require('child_process');
let time_id = null;
let child_process = null;

chokidar.watch(['main.js', 'test.js']).on("all", (event, path) => {
  debounce(() => reStart(path), 500)();
})

function debounce(fn, delay) {
  return () => {
    clearTimeout(id);
    time_id = setTimeout(() => {
      fn();
    }, delay);
  }
}

function reStart(path) {
  child_process && child_process.kill();
  console.log(`${path}改变了...`);
  child_process = spawn('node', ['main.js'], {
    stdio: [process.stdin, process.stdout, process.stderr]
  })
}
```

- main.js 

```
const Koa = require('koa');

const app = new Koa();
app.use(ctx => {
    ctx.body = "hi my name is cuixiaorui";
});
app.listen(3002, () => {
  console.log('listening on port:3002');
});
```