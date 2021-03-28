var fs = require('fs');
var path = require('path');

const moduleTitle = 'babel';
var fileArr = fileDisplay(path.join(__dirname, '../../', moduleTitle));

function fileDisplay(_filePath) {
  let _fileNameArr = fs.readdirSync(path.resolve(_filePath));
  let fileNameArr = _fileNameArr.map((fileItem, index) => {
    if (fileItem === 'README.md') {
      return `/${moduleTitle}/`
    }
    let afterAffixIndex = fileItem.lastIndexOf('.md')
    return `/${moduleTitle}/${fileItem.slice(0, afterAffixIndex)}`
  })
  return fileNameArr;
}

module.exports =  {
  title: moduleTitle,
  collapsable: true,
  children: fileArr,
  sidebarDepth: 2, // 默认是1: 提取h2标题 0: 禁用headers链接 2: 提取h2, h3标题
  // displayAllHeaders: true, // 是否展示所有标题
  activeHeaderLinks: false,
}