(window.webpackJsonp=window.webpackJsonp||[]).push([[114],{575:function(n,e,t){"use strict";t.r(e);var s=t(28),a=Object(s.a)({},(function(){var n=this,e=n.$createElement,t=n._self._c||e;return t("ContentSlotsDistributor",{attrs:{"slot-key":n.$parent.slotKey}},[t("h1",{attrs:{id:"nodemon的原理"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#nodemon的原理"}},[n._v("#")]),n._v(" nodemon的原理")]),n._v(" "),t("p",[n._v("监听文件的改变，重新执行命令")]),n._v(" "),t("ul",[t("li",[n._v("使用chokidar监听文件的改变")]),n._v(" "),t("li",[n._v("使用spawn执行node命令")])]),n._v(" "),t("h2",{attrs:{id:"使用chokidar监听文件的改变"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#使用chokidar监听文件的改变"}},[n._v("#")]),n._v(" 使用chokidar监听文件的改变")]),n._v(" "),t("ul",[t("li",[n._v("nodemon.js")])]),n._v(" "),t("div",{staticClass:"language- extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[n._v("const chokidar = require('chokidar');\nconst { spawn } = require('child_process');\nlet time_id = null;\nlet child_process = null;\n\nchokidar.watch(['main.js', 'test.js']).on(\"all\", (event, path) => {\n  debounce(() => reStart(path), 500)();\n})\n\nfunction debounce(fn, delay) {\n  return () => {\n    clearTimeout(id);\n    time_id = setTimeout(() => {\n      fn();\n    }, delay);\n  }\n}\n\nfunction reStart(path) {\n  child_process && child_process.kill();\n  console.log(`${path}改变了...`);\n  child_process = spawn('node', ['main.js'], {\n    stdio: [process.stdin, process.stdout, process.stderr]\n  })\n}\n\nconst chokidar = require('chokidar');\nconst { spawn } = require('child_process');\nlet time_id = null;\nlet child_process = null;\n\nchokidar.watch(['main.js', 'test.js']).on(\"all\", (event, path) => {\n  debounce(() => reStart(path), 500)();\n})\n\nfunction debounce(fn, delay) {\n  return () => {\n    clearTimeout(id);\n    time_id = setTimeout(() => {\n      fn();\n    }, delay);\n  }\n}\n\nfunction reStart(path) {\n  child_process && child_process.kill();\n  console.log(`${path}改变了...`);\n  child_process = spawn('node', ['main.js'], {\n    stdio: [process.stdin, process.stdout, process.stderr]\n  })\n}\n")])])]),t("ul",[t("li",[n._v("main.js")])]),n._v(" "),t("div",{staticClass:"language- extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[n._v("const Koa = require('koa');\n\nconst app = new Koa();\napp.use(ctx => {\n    ctx.body = \"hi my name is cuixiaorui\";\n});\napp.listen(3002, () => {\n  console.log('listening on port:3002');\n});\n")])])])])}),[],!1,null,null,null);e.default=a.exports}}]);