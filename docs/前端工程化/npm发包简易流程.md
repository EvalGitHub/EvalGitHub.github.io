# 发包的简易流程

## 注册一个账号使用方法指南

你有两种方式注册一个账号：

去npm网站注册或者使用npm adduser命令

## 输入npm init 初始化一个项目，准备好自己的包文件

> name: 包名

> version: 包版本号

## 注册完之后使用npm login 进行登陆

- 如果你以前使用过npm淘宝镜像的下载链接，这个时候要将下载链接设置回来

> npm config set registry http://registry.npmjs.org

## 查看这个包的版本：

> npm view common-fun version

6. 更新一个之前发布的包：

> npm version <update_type>

> npm publish 

参考：https://blog.csdn.net/cvper/article/details/79051048

## 错误集锦

> npm publish error: 403. You do not have permission to publish 'project name'：包同名

> Registry returned 409 for PUT on http://registry.npm.taobao.org/-/user/org.couchdb.user:666: conflict

- 解决：http://zccbbg.top/2018/12/24/npm-adduser-%E6%8A%A5%E9%94%99e409-Conflict/

## 我的线上例子

[common-fun](https://www.npmjs.com/package/common-fun), [evel-react-cli](https://www.npmjs.com/package/evel-react-cli)

参考链接：[npm发布](https://www.jianshu.com/p/ea64fd01679c)

