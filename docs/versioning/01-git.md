---
sidebar_position: 0

---

# git

## 版本控制

​		保留文件所有的修改历史记录，可以方便地撤销之前对文件的修改操作。

​		版本控制是指对软件开发过程中各种程序代码、说明文档等文件的变更进行管理，它将追踪文件变化，记录文件的变更时间、变更内容、甚至变更执行人进行记录，同时对每一个阶段性变更（不仅仅只是一个文件的变化）添加版本编号，方便将来进行查阅特定阶段的变更信息，甚至是回滚。

## 什么是git？

Git is a free and open source distributed version control system。

git是一个免费并且开源的分布式版本控制系统。

官网：https://git-scm.com/

下载：https://npm.taobao.org/mirrors/git-for-windows/

## git如何工作

首先，我们得先了解什么是`状态`和`区域`

git文件生命周期如下：

![lifecycle.png](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181824242.png!blog.guiyexing)

同时，git 又提供了三种（也可以说是四种）不同的记录`状态`

- 已修改（modified）
- 已暂存（staged）
- 已提交（committed）

有一个特殊的状态

- 未追踪（Untracked）

区域：

git 提供了三个不同的工作区，用来存放不同的内容

- 工作目录
- 暂存区域
- Git 仓库

![areas.png](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181824239.png!blog.guiyexing)

## 初始化本地仓库

进入希望纳入 git 版本控制的项目目录，使用 `git init` 初始化

```
git init
```

该命令将创建一个名为 `.git` 的子目录，这个子目录含有你初始化的 Git 仓库中所有的必须文件，这个目录也是上面我们说的三个区域之一，这个目录也是 Git 保存数据记录的地方，不要轻易改动。

## 配置

当安装完 Git 应该做的第一件事就是设置你的用户名称与邮件地址。 这样做很重要，因为每一个 Git 的提交都会使用这些信息，并且它会写入到你的每一次提交中，不可更改

```
git config user.name "你的姓名"
git config user.email "你的邮箱"
```

-- global

通过 `--global` 选项可以设置全局配置信息

```
git config --global user.name "你的姓名"
git config --global user.email "你的邮箱"
```

**检查配置**

```
# 打印所有config
git config --list
# 打印指定config
git config user.name
```

## 查看工作区的文件状态

```
git status
```

查看工作区中的文件状态

​		当一个项目被 Git 初始化以后，只是表示我们希望通过 Git 来管理当前的这个项目文件的不同时期版本记录，但是这个时候项目中已存在的文件，或者以后新增的文件都是没有进入版本控制管理的，它们是 `未追踪（Untracked）` 的状态。

## 乱码

git status 显示乱码：

```
git config --global core.quotepath false
```

终端乱码：

菜单 -> 设置 -> 文本 -> 本地 / 编码

## 添加工作区文件到暂存区

```
git add 1.txt
# 添加多个文件
git add 2.txt 3.txt
# 添加整个目录
git add ./a
# 添加多个目录
git add ./b ./c
# 添加所有文件
git add .
```

查看状态是已暂存状态staged

修改文件1.txt的内容->

查看状态是已修改状态modified

## 创建版本

**对于已修改的文件需要先git add添加到暂存区然后在次提交创建版本**

```
git commit
```

将暂存区里的改动给提交到本地 git 仓库，也就是为这次工作（一般会把某个具有特定意义的工作作为一个版本，它可以是多个文件的变化）

- 每次提交同时会生成一个 40 位的哈希值，作为该次提交版本的唯一 id

**提交备注**

每次提交都需要填写备注信息

```
git commit
```

会调用默认（或自定义）的文本编辑器

**单行备注**

```
git commit -m '备注信息'
```

每次都要输入add命令好麻烦，从工作目录提交到暂存区后，直接提交（如果存在未追踪的文件，必须先add，否则git不会管理）

```
git commit -a -m '描述'
```

## 查看提交日志

完整格式

```
git log
```

简要格式（单行）

```
git log --oneline
```

查看所有历史提交（包括已删除的）

```
git reflog
```

## 设置不需要追踪

.git同级目录新建.gitignore文件，将不需要追踪的文件写入即可

```
abc.js
```

如果自身也不需要追踪

```
.gitignore
abc.js
```

## 修复提交

```
git commit --amend
```

修复（替换上一次）提交，在不增加一个新的提交版本的情况下将新修改的代码追加到前一次的提交中

```
git commit --amend -m '提交'
git commit -a --amend -m '提交'  #同时加到暂存区
```

## 删除

```
git rm
```

从 git 仓库暂存区与工作区中删除指定文件

```
git rm 文件
```

只删除 git 仓库暂存区中的文件

```
git rm --cached 文件
```

rm 以后，需要 commit 这次操作，否则 rm 将保留在暂存区

```
git commit -m '修改描述描述'
```

## 从暂存区中撤销到工作区

从暂存区中撤销一个指定文件

```
git reset HEAD 文件名称
```

从暂存区中撤销所有文件

```
git reset HEAD .
```

## 回退版本

回退到指定的 commitID 版本

```
git log --oneline #查看版本
git reset --hard commitID
```

在次回到最新版本

```
 git reflog #查看最新版记录
 git reset --hard commitID #再次即可
```

## 比较

```
# 比较 工作区和暂存区
git diff 文件 
# 比较 暂存区和仓库
git diff --cached [commitId] 文件
# 比较 工作区和仓库
git diff commitId filename
# 比较 仓库不同版本
git diff commitId1 commitId2
```

## 分支

我们的开发就像是游戏的任务，默认是在主线（master）上进行开发的。许多时候，还有各种支线任务，git 支持我们创建分支来进行项目开发，在工作区新创建的文件，没有提交前切换了分区都能看到，如果提交了，就会在提交的分支上显示。

### 查看分支

```
git branch  #默认master分支
```

### 创建分支

```
git branch 分支名称
```

### 切换分支

```
git checkout 分支名称
git checkout -b 分支名称 //创建并且切换
```

### 分支合并

在新分支修改了内容必须提交才有意义，没有提交前切换了分区都能看到，如果提交了，就会在提交的分支上显示。切换到主分区也不会显示，合并分支也才有意义。

```
# B 合并到 A，需要切换到 A 分支
git merge 被合并分支
# 查看已经合并的分支
git branch --merged
# 查看未合并的分支
git branch --no-merged
```

### 删除分支

**删除前最好保证已经合并**

```
# 如果分支为未合并状态，则不允许删除
git branch -d 分支名称
# 强制删除
git branch -D 分支名称
```

### 合并冲突

有的时候，不同的分支可能会对同一个文件内容和位置上进行操作，这样在合并的过程中就会产生冲突

- 查看冲突文件
- 修复冲突内容
- 提交

## 标签

有的时候，我们希望给某一个特定的历史提交打上一些标签

### 新建 tag

```
git log --oneline
git tag -a v1.0.0 commitId  #esc + ZZ
```

### 查看 tag

```
git tag #v1.0.0
```

## 协同开发

以上所有的操作都是建立在本地的，如果我们希望进行团队协同开发，那么这个时候，我们就需要把 git 仓库信息与团队中的所有人进行共享

分布式 - 中心化与去中心化

## github

**生成新 SSH 密钥**

https://help.github.com/cn/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent

**并添加到 ssh-agent**

https://docs.github.com/cn/github/authenticating-to-github/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account

### 创建仓库

会生成https或ssh连接

### 连接

如果是第一次

```
git remote add origin git@github.com:xxx/demo-test.git
```

否则先删除原先的连接，然后再连接

```
git remote rm origin
```

### 提交（同步）远程

```
#同步本地仓库到远程
git push -u origin master
# -u 简化后续操作
git push origin master
```

### 远程分支

```
# 提交到远程（分支）
git push origin [本地分支名称]:[远程分支名称]

# 远程先创建好分支然后拉取到本地
git checkout -b [本地分支名称] origin/[远程分支名称]

# 拉取远程分支到本地
git pull origin [远程分支名称]:[本地分支名称]

# 查看远程仓库
git remote show origin

# 查看本地分支
git branch

# 查看远程分支
git branch -r

# 查看所有分支o
git branch -a

# 删除本地分支
git branch -d [本地分支名称]

# 删除远程分支
git push origin --delete [远程分支名称]
# or
git push origin :[远程分支名称]

# 设置默认提交分支
git branch --set-upstream-to=origin/[远程分支名称] [本地分支名称]
```

### 远程tag

```
# 提交远程tag
git push origin [标签名]

# 推送所有标签
git push origin --tags

# 删除本地标签
git tag -d [标签名]

# 删除远程标签
git push origin --delete [标签名]
```

## git stash

常用git stash命令

* git stash save "save message":执行存储时，添加备注，使用git stash的提交方式没有备注在查找时不方便识别

* git stash list:查看stash存储列表

* git stash show:显示文件级别的改动，默认show第一个存储，要显示其他存储:git stash show stash@{$num}

* git stash show -p:显示内容级别的改动，默认show第一个存储，要显示其他存储:git stash show stash@{$num} -p

* git stash apply:应用某个存储,但不会把存储从存储列表中删除，默认使用第一个存储,使用其他存储:git stash apply stash@{$num}

* git stash pop:应用存储的同时将缓存堆栈中的对应stash删除，默认为第一个stash,应用并删除其他stash:git stash pop stash@{$num}

* git stash drop stash@{$num}:从列表中删除某个存储

* git stash clear:删除所有缓存的stash

> 注意：没有在git版本控制中的文件，是不能被git stash存起来的，也就是新增的文件直接执行stash是不会被存储的

## 远程新增分支拉取代码开发步骤

0. 远程新增abc分支
1. git fetch // 将远程仓库的分支列表更新到最新，取回本地以便查看远程分支列表
2. git branch -a   // 查看全部本地远程分支列表
3. git checkout -b my_abc origin/abc   // 核心一步：将远程仓库的origin/abc分支拉取到本地my_abc分支，并切换到my_abc分支
4. git push --set-upstream origin abc_dol //首次提交=>简写：git push origin HEAD -u
5. New merge request

## 回滚操作

远程ID：c275382提交错误内容，本地也都提交上去了

![image-20220304172221686](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181824241.png!blog.guiyexing)

想要回退到f8c6fde

```
git reset f8c6fde
```

![image-20220304172453202](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181824248.png!blog.guiyexing)

本地可以看到所有相对于f8c6fde更改了的代码

之后执行push HEAD

```
git push origin HEAD --force
```
