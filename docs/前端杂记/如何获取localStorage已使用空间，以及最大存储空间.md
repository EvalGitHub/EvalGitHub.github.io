# 如何获取localStorage已使用空间，以及最大存储空间

## 已使用空间

```
function getUsedSize() {
  let count = 0;
  Object.keys(localStorage).forEach(itmeKey => {
    count += localStorage[itmeKey].length;
  })
  console.log(count / 1024 / 1024 + 'M');
} 
```

英文和数字占一个字节(bit)，1024bit = 1kb ，1024kb = 1G 
中文占一个字符，也就是两个字节
一个字节等于 8 位。所有的数据所占空间都可以用字节数来衡量。例如一个字符占 2 个字节，一个 int 占 4 个字节，一个 double 占 8 个字节 等等。

## 全部空间

```
function getTotalSize() {
  let text= '1234567890';
  function addTextStr(str) {
    text+=str;
    if (text.length < 10240) { // 10kb的字符串
      addTextStr(text);
    }
  }
  addTextStr(text);

  if (!window.localStorage) {
    return;
  }
  let timer = setInterval(() => {
    text+=text;
    try {
      window.localStorage.removeItem('countStr');
      window.localStorage.setItem('countStr', text);
    } catch(e) {
      clearTimeout(timer);
      console.log('容积就是：' + text.length / 1024 / 1024 + 'M');
    }
  }, 0);
}
```