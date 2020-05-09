# 如何获取localStorage已使用空间，以及最大存储空间

## 已使用空间

```
function getUsedSize() {
  let count = 0;
  Object.keys(localStorage).forEach(itmeKey => {
    count += localStorage[itmeKey].size;
  })
  console.log(count / 1024 / 1024 + 'M');
} 
```

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