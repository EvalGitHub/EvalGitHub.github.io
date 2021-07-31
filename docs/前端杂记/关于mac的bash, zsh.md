# mac的bash_profile, zsh

## mac打开.bash_porfile

1. 启动终端Terminal

2. 进入当前用户的home目录
> 输入cd ~

3. 创建.bash_profile
>输入touch .bash_profile

4. 编辑.bash_profile文件
>输入open -e .bash_profile

5. 保存文件，关闭.bash_profile

6. 更新刚配置的环境变量
>输入source .bash_profile

## 如何解决zsh: command not found:

1. 命令行输入 
>vim ~/.zshrc

2. 点击"i" , 回车enter

3. 保存，退出 , esc
> :wq

4. 执行
>source ~/.zshrc

