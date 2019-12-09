1. 动态创建script，复制src属性
 常见问题如果是绝对地址没问题，如果是相对地址就会出现404，因为在预编译的时候webpack会觉得这个资源没用到而不打包。

2. 使用copy-webpack-plugin配合使用

```
const CopyPlugin = require('copy-webpack-plugin');

plugins: [
    new CopyPlugin([
      {
        from: path.resolve(__dirname, '../src/lib/**.*'),
        top: path.resolve(__dirname, '../build/lib/[name].[ext]')
      }
    ])
  ],
```

```
function addTingyun() {
  if (['development', 'production', 'staging'].includes(getConfig().env)) {
    let ele = document.createElement('script');
    ele.src = `/lib/tingyun-rum.js`;
    ele.type = 'text/javascript';
    ele.charset = 'utf-8';
    if (document.documentElement.append) {
      document.documentElement.append(ele);
    } else {
      document.documentElement.appendChild(ele);
    }
  }
}
```
注意src地址不能写成'./lib/tingyun-rum.js’否则会有问题。
【./于/的区别】

3. 使用webpack.DllPlugin
最终效果是生成一个script标签,暂时fail，猜测可能是需要import目标js才行

4. 服务器预渲染的方式，读取index.html的内容和js文件中的内容，动态替换
```
const htmlContent = fs.readFileSync('./dist/index.html', 'utf8', function (err, data) {
    if (err) {
      console.error(err);
      return false;
    }
  });
  const tingyunScriptContent = fs.readFileSync('./src/libs/tingyun.js', 'utf8', function (err, data) {
    if (err) {
      console.error(err);
      return false;
    }
  });
  const tingyunScript = `<script type='text/javascript' defer async>${tingyunScriptContent}</script>`;
  const newHtml = htmlContent.replace(/<!-- tingyun inject import -->/i, tingyunScript);
  fs.writeFileSync('./dist/index.html', newHtml, 'utf8', function (err) {
    if (err) {
      console.error(err);
      return false;
    }
  });
```