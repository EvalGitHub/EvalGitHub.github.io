const ReactConfig = require('./categoryConfig/react');
const FontEndConfig = require('./categoryConfig/fontend');
const VueConfig = require('./categoryConfig/vue');
const JSConfig = require('./categoryConfig/javascript');
const WebpackConfig = require('./categoryConfig/webpack');
const FlutterConfig = require('./categoryConfig/flutter');
const H5 = require('./categoryConfig/h5');
const WebSafe = require('./categoryConfig/webSafe');
const Http = require('./categoryConfig/http');
const FinancialManageConfig = require('./categoryConfig/financialManage');
module.exports = {
  title: '个人主页',
  description: '学习总结',
  dest: './dist',
  themeConfig: {
    // serviceWorker: {
    //     updatePopup: true 
    // },
    //  repo: 'vuejs/vuepress',
    nav: [
      { text: 'react', link: '/react/' },
      { text: 'vue', link: '/vue/' },
      { text: '附录：错误码', link: '/error' }
    ],
    sidebar: [
      {
        title: '文档介绍',
        collapsable: true,
        children: [
          "/", // 指的是根目录的md文件 也就是 README.md 里面的内容
          "apiword", // 根目录创建 apiword.md文件
          "api", // 根目录创建 api.md文件
          "error" // 根目录创建 error.md文件
        ],
        sidebarDepth: 2, // 默认是1: 提取h2标题 0: 禁用headers链接 2: 提取h2, h3标题
        // displayAllHeaders: true, // 是否展示所有标题
        activeHeaderLinks: false,
      },
      { ...ReactConfig },
      { ...VueConfig },
      { ...FontEndConfig },
      { ...JSConfig },
      { ...WebpackConfig},
      { ...FlutterConfig },
      { ...H5 },
      { ...WebSafe },
      { ...Http },
      // { ...FinancialManageConfig },
    ]

    // // fallback
    // '/': [
    //     "/", //指的是根目录的md文件 也就是 README.md 里面的内容
    //     "apiword", // 根目录创建 apiword.md文件
    //     "api", // 根目录创建 api.md文件
    //     "error" // 根目录创建 error.md文件
    // ]
    //} 

  },
  configureWebapck: {
    resolve: {
      alias: {
        '@alias': '../.vuepress'
      }
    }
  }
}
