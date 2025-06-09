---
sidebar_position: 4
---

# mac环境

## 检查shell与架构

打开terminal检查操作系统用的哪个shell

```
echo $SHELL
```

显示 `/bin/zsh` shell就是zsh，显示 `/bin/bash` shell就是bash

echo $(uname -m)查看系统架构：arm64

## 安装homebrew

使用官网安装homebrew失败

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

卸载命令

```
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/uninstall)"
```

使用国内源安装命令

```
/bin/zsh -c "$(curl -fsSL https://gitee.com/cunkai/HomebrewCN/raw/master/Homebrew.sh)"
```

配置环境变量

使用 `sudo vim ~/.zshrc` 编辑文件，添加如下配置

```
export PATH="/opt/homebrew/bin:$PATH"
export PATH="/opt/homebrew/sbin:$PATH"
```

刷新zshrc文件

```
source ~/.zshrc
```

## 美化terminal

```
brew install iterm2
git clone https://gitee.com/mirrors/oh-my-zsh ~/.oh-my-zsh
cp ~/.oh-my-zsh/templates/zshrc.zsh-template ~/.zshrc
```

## mac安装nvm

**下载[nvm](https://github.com/nvm-sh/nvm)**

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

zsh类型的shell需要将以上命令中的bash改为zsh

执行命令`Failed to connect to raw.githubusercontent.com port 443 after 5 ms: Connection refused`

GitHub的*raw.githubusercontent.com*域名解析被污染,

查询真实IP

在https://www.ipaddress.com/查询raw.githubusercontent.com的真实IP。

通过修改`hosts`解决此问题`sudo vim /etc/hosts`

```
199.232.28.133 raw.githubusercontent.com
```

**打开终端，进入用户的home目录中**

```js
cd ~/
```

**检查配置文件**

使用 `ls -a` 显示这个目录下的所有文件（夹）（包含隐藏文件及文件夹），查看有没有 `.zshrc` 这个文件

**新建.zshrc文件**

如果没有，则新建一个

```js
touch ~/.zshrc
```

**配置.zshrc文件**

将 nvm 环境变量添加到 shell 中, 这里我系统默认的是的zsh而不是bash，需要配置一下，打开.zshrc文件，添加如下配置

```js
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
```

**加载配置文件**

```js
source ~/.zshrc
```

**使用方式**

```
nvm -v
nvm list
nvm install 14.19.1
nvm install 16.15.1
nvm use 14.19.1
```

**查看node版本**

```
node -v
```

查看版本时`Bad CPU type in executable`

安装Rosetta 2：`softwareupdate --install-rosetta`

**node的安装位置**

在终端我们可以使用 `which node` 来查看我们的 `node` 被安装到了哪里，这里终端打印出来的地址其实是你当前使用的 `node` 版本快捷方式的地址

```js
/Users/用户名/.nvm/versions/node/v14.19.1/bin/node
```

## 安装docker

安装docker： `https://docs.docker.com/desktop/mac/apple-silicon/`

安装docker-compose： `https://formulae.brew.sh/formula/docker-compose`

## SSH连接服务器

ssh -p 22 root@101.43.181.81

## python版本管理

https://github.com/conda-forge/miniforge

![image-20220928222313803](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202209282223863.png!blog.guiyexing)

安装包是一个. SH文件，我们需要进入下载目录，以命令形式安装

`sudo bash ./Miniforge3-MacOSX-arm64.sh` ，然后一路回车与yes

**配置环境变量**

使用 `sudo vim ~/.zshrc` 编辑文件，添加如下配置后刷新zshrc文件

```
export PATH="/Users/用户名/miniforge3/bin:$PATH"
```

此时使用python3命令来来看是否安装好，使用quit()退出

![image-20220928231619592](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202209282316639.png!blog.guiyexing)

**重启terminal激活CONDA**

```
source /Users/用户名/miniforge3/bin/activate
```

![image-20220928232139738](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202209282321781.png!blog.guiyexing)

命令行前面出现base，说明安装成功了，然后执行如下命令

```
conda init zsh
```

**查看信息**

```
conda info -e
```

**给conda配置国内下载源**

```
conda config --add channels https://mirrors.ustc.edu.cn/anaconda/pkgs/main/
conda config --add channels https://mirrors.ustc.edu.cn/anaconda/pkgs/free/
conda config --add channels https://mirrors.ustc.edu.cn/anaconda/cloud/conda-forge/
conda config --add channels https://mirrors.ustc.edu.cn/anaconda/cloud/msys2/
conda config --add channels https://mirrors.ustc.edu.cn/anaconda/cloud/bioconda/
conda config --add channels https://mirrors.ustc.edu.cn/anaconda/cloud/menpo/
conda config --set show_channel_urls yes
```

**查看配置**

```
conda config --show
```

**创建指定版本的虚拟环境，这里需要3.9.0版本**

```
sudo conda create -n py390 python=3.9.0
```

![image-20220928233211462](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202209282332505.png!blog.guiyexing)

**切换到390**

```
conda activate py390
```

![image-20220928233355947](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202209282333991.png!blog.guiyexing)

**退出环境**

```
conda deactivate
```

## pycharm

https://www.jetbrains.com/pycharm/download

创建项目

![image-20220928234447761](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202209282344796.png!blog.guiyexing)

选择Previously configured interpreter，Add Interpreter

![image-20220928234725373](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202209282347406.png!blog.guiyexing)

选择对应版本

![image-20220928234922129](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202209282349165.png!blog.guiyexing)

执行默认项目

![image-20220928235109422](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202209282351458.png!blog.guiyexing)
