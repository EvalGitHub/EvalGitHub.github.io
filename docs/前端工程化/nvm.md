# node版本管理工具

本地多项目可能会使用到不同的node版本，不同版本node，在项目运行时候可能会有不同的问题出现，急需能够在统一系统下共存多种node
版本，这个时候可以使用nvm来进行node版本控制。

## 安装

[nvm安装方式](https://github.com/nvm-sh/nvm)

## 使用命令

- 查看所有能安装的node version
> nvm ls-remote

- 查看本地安装的node version
> nvm ls

- 安装指定版本的node
> nvm install 10.13.1

上面就是安装10.13.1的node，如果要安装最新的 **nvm install node**

- 安装完成要使用某version的node
> nvm use v10.13.1

- 制定默认node version
> nvm alias default nodeVersion

- 安装当前node version支持的最新npm
> nvm install-latest-npm
