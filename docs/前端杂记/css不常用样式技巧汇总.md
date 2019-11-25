# css不常用样式技巧汇总 
## 滚动条样式：

```
 &::-webkit-scrollbar {
     /*滚动条整体样式*/
     width: 12px; /*高宽分别对应横竖滚动条的尺寸*/
     height: 12px;
 }
 &::-webkit-scrollbar-thumb {
     /*滚动条里面小方块*/
     border-radius: 10px;
     background: rgba(0, 0, 0, 0.2);
 }
 &::-webkit-scrollbar-track {
     /*滚动条里面轨道*/
     border-radius: 0;
     background: rgba(0, 0, 0, 0.1);
 }
```

## input 框placeholder样式设置：

```
  >input::-webkit-input-placeholder {
      /* WebKit browsers */
      color: #fff;
  }
  >input:-moz-placeholder {
      /* Mozilla Firefox 4 to 18 */
      color: #fff;
  }
  >input::-moz-placeholder {
      /* Mozilla Firefox 19+ */
      color: #fff;
  }
  >input:-ms-input-placeholder {
      /* Internet Explorer 10+ */
      color: #fff;
  }
```

## 文字换行

单行文本换行
css需设置属性

```
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
```

多行文本换行
css需设置属性：（-webkit内核才有效）

```
overflow : hidden;
display: -webkit-box;
-webkit-line-clamp:3;
-webkit-box-orient: vertical;
```
-webkit-line-clamp属性用来限制文本的行数