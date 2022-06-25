# git基本操作

![avatar](../assets/git_command.png)

## 版本控制初始化

> git init 

项目代码文件中会生成 .git 文件，称之为版本库，自动创建master分支，并且将HEAD指针指向master分支

## 配置基础信息

可分为：仓库级（--local）， 全局(用户)级（--global），系统级（--system），优先级依次降低

- 仓库：当前仓库目录下 .gitconfig
- 全局：用户名目录下 .gitconfig
- 系统：git安装目录下 .gitconfig

查看方式：

> 这种文件一般是被隐藏的，如果需要查看mac上 command+shift+ '.' 即可查看

查看配置信息：

> git config --[local|global|system] --list 

如果使用的是vscode，强烈推荐"git-autoconfig"插件；

## git代码区

- 工作区：写代码的地方

- 暂存区：写完代码，**git add .**将文件添加到暂存区，从此不用担心**ctrl+z/git checkout .**代码撤销了

- 本地仓库：使用**git commit -m 'feat: some msg'**将代码提交到本地仓库

- 远程仓库：使用**git push**将代码添加到远程仓库（git/gitlab/....）

## 分支管理



### 查看分支

- 所有分支 git branch -a
- 本地分支 git branch
- 远程分支 git branch -r

### 分支处理

![avatar](../assets/git_branch.png)

- 单纯的切分支 

  > git checkout featture_name

- 创建并且切换分支 

  >git checkout -b feature_name

- 删除本地/远程分支

  > git branch -d feature_name

  > git push origin -d feature_name

- 分支重命名

  > git branch -m oldbranch-name newbranch-name

- 拉取远程分支

  > git checkout -b 本地分支名x origin/远程分支名x 

  // 另外一种方式,也可以完成这个操作。

  > git fetch origin branch-name:local-branch-name
   
- 分支合并

  > git merge/rebase
  
—no-ff: 会将被合并分支上的提交信息都展示出来，在目标分支上不会出现提交节点
   
—squash: 将多个提交信息进行汇总合并(不会把多个提交信息展示出来)，会在目标分支上创建新的commit节点 

>--no-ff指的是强行关闭fast-forward方式。

> fast-forward方式就是当条件允许的时候，git直接把HEAD指针指向合并分支的头，完成合并。属于“快进方式”，不过这种情况如果删除分支，则会丢失分支信息。因为在这个过程中没有创建commit

> git merge --squash 是用来把一些不必要commit进行压缩，比如说，你的feature在开发的时候写的commit很乱，那么我们合并的时候不希望把这些历史commit带过来，于是使用--squash进行合并，此时文件已经同合并后一样了，但不移动HEAD，不提交。需要进行一次额外的commit来“总结”一下，然后完成最终的合并。

>总结：
--no-ff：不使用fast-forward方式合并，保留分支的commit历史
--squash：使用squash方式合并，把多次分支commit历史压缩为一次


### rebase/merge的区别？

// TODO:

## 撤销操作[reset] 

提交步骤的撤退，会撤销过程中的所有提交记录

- 如果修改一些文件，但是又不想进行保存或者提交；丢弃单个文件
> git checkout fileName

如果想丢弃所有的文件，
>git checkout .

- 如果发现之前的代码提交错了分支，想回退

> git reset --[soft|hard] HEAD~n 根据步骤数进行撤退

> git reset --[soft|hard] commitHash 根据提交记录的hash值，直接跳到指定的某一个提交;常用于git reset —hard 失误操作的恢复

commitHash 可以根据git reflog进行查看，他记录了你的每一次操作


## 撤销操作[revert]

Git revert commitHash 根据提交记录进行撤销，不会丢失过程中的其他提交记录，和reset的区别是，reset比较常用的是根据步骤数进行撤退；

## 文件暂存

在项目开发时，经常会遇到开发了一些功能，需要切换分支去修改另一个分支上的紧急bug；有两种方式可以解决这个问题。

- 方案一：创建一个本地新分支，将更改提交，然后在合并

- 方案二：git stash的使用

> git stash save 'feat: somemsg'

git stash 可以同时使用多次，使用 **git stash list** 查看多条记录；每条记录可以通过stash@(id)区分；

如果在多次操作的时候发现其中一次的暂存是不想保存的，可使用**git stash drop stash@{id}**

如果想清除所有的存储记录 **git stash clear**;

恢复自己想要的 **git stash pop stash@{id}**

git stash pop 应用最近的一次暂存 & 删除暂存记录； git stash apply 应用最近的一次暂存，不会删除， git stash pop 等于 git stash apply + git stash pop

## 复制[cherry-pick]

在一个分支上开发了某些功能，想着迁移到另一个分支

> Gti cherry-pick 从一个分支复制到另一个分支

- git cherry-pick com1Hash  复制一个提交
- git cherry-pick com1Hash commitHash 复制2个提交
- git cherry-pick commit1^..commit2 区间复制

## 查看/操作仓库信息

查看仓库地址

> git remote -v 

仓库关联

> git remote add origin 

## 设置短指令

例如：

方式一：
>git config --global alias.ps push

方式二：

1. 打开配置文件 vim ~/.gitconfig
2. 写入内容
```
[alias] 
  co = checkout
  ps = push
  pl = pull
  mer = merge --no-ff
  cp = cherry-pick
```

参考：[git基本操作](https://www.cnblogs.com/evaling/p/9159047.html) , [一劳永逸,一张脑图带你掌握Git命令](https://juejin.im/post/6869519303864123399#heading-5), [5条提高效率的git命令](https://juejin.cn/post/7071780876501123085#heading-7)