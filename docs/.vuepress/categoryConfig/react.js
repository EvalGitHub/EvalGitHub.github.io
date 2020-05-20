var fs = require('fs');
var path = require('path');

// console.log(path.join(__dirname, '../', 'react'));
// var fileArr = fileDisplay(path.join(__dirname, '../../', 'react'));

async function fileDisplay(_filePath) {
  let _fileNameArr = await fs.readdirSync(path.resolve(_filePath));
  let fileNameArr = _fileNameArr.map((fileItem, index) => {
    if (fileItem === 'README.md') {
      return '/react/'
    }
    return `/react/${fileItem.slice(0, -3)}`
  })
  return fileNameArr;
}

module.exports = {
  title: 'react',
  collapsable: true,
  children: () => fileDisplay(path.join(__dirname, '../../', 'react')) || [],
  // [
  //   "/react/",
  //   "/react/react-router",
  //   "/react/浅析react_fiber",
  //   "/react/react使用优化实践",
  //   "/react/react-redux的学习与使用",
  //   "/react/react生命周期",
  //   "/react/react合成事件与原生事件",
  //   "/react/react中关于state的不常用技巧",
  //   "/react/react函数编程hook基本用法",
  //   "/react/react中抽离公共逻辑复用的方式",
  //   "/react/创建一个全局toast",
  //   "/react/react全局方法使用",
  //   "/react/react中组件之间的相互通信",
  //   "/react/react中setState异步思想",
  //   "/react/redux与react-redux的使用实践",
  //   "/react/redux-saga的学习与使用",
  //   "/react/mobx的学习与使用",
  //   "/react/mobx-react的使用",
  //   "/react/使用errorboundary优化错误处理",
  // ],
  sidebarDepth: 2, // 默认是1: 提取h2标题 0: 禁用headers链接 2: 提取h2, h3标题
  // displayAllHeaders: true, // 是否展示所有标题
  activeHeaderLinks: false,
}