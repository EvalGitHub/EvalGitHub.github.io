const fs = require('fs');
const path = require('path');
const moduleTitle = "前端杂记";
var fileArr = fileDisplay(path.join(__dirname, '../../', moduleTitle));

function fileDisplay(_filePath) {
  let _fileNameArr = fs.readdirSync(path.resolve(_filePath));
  let fileNameArr = _fileNameArr.map((fileItem, index) => {
    if (/README.md/g.test(fileItem)) {
      return `/${moduleTitle}/`
    }
    return `/${moduleTitle}/${fileItem.slice(0, -3)}`
  })
  return fileNameArr;
}

module.exports =  {
  title: '前端杂记',
  collapsable: true,
  children: fileArr,
  sidebarDepth: 2, // 默认是1: 提取h2标题 0: 禁用headers链接 2: 提取h2, h3标题
  // displayAllHeaders: true, // 是否展示所有标题
  activeHeaderLinks: false,
}


// module.exports = {
//   title: '前端杂记',
//   collapsable: true,
//   children: [
//     "/前端杂记/搭建环境react,webapck,typescript",
//     "/前端杂记/关于图片的优化",
//     "/前端杂记/关于网页开发的优化",
//     "/前端杂记/关于meta的几点",
//     "/前端杂记/锚点滚动，监听屏幕滚动",
//     "/前端杂记/前端下载文件",
//     "/前端杂记/适配解决方案",
//     "/前端杂记/图片上传七牛云",
//     "/前端杂记/疑难杂症的bug",
//     "/前端杂记/域名的设置",
//     "/前端杂记/css不常用样式技巧汇总",
//     "/前端杂记/bable的理解",
//     "/前端杂记/前端引入第三js实践总结",
//     "/前端杂记/如何获取localStorage已使用空间，以及最大存储空间"
//   ],
//   sidebarDepth: 3, // 默认是1: 提取h2标题 0: 禁用headers链接 2: 提取h2, h3标题
//   // displayAllHeaders: true, // 是否展示所有标题
//   activeHeaderLinks: false,
// }