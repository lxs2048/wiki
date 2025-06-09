---
sidebar_position: 2
---

# CICD持续集成

:::tip 目标：
将本地仓库代码push到github时，执行打包构建，并将产物推送到服务器的指定位置（服务器将该位置作为某个站点的入口）
:::

## 测试的项目目录如下

```
pism
├── backend
├── frontend
├── .gitignore
├── README.md
└── package.json
```

## 创建秘钥

![image-20220409141857495](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181711553.png!blog.guiyexing)

创建秘钥然后下载保存私钥

## 绑定秘钥对

1. 服务器关机

2. 绑定秘钥对

![image-20220409142114509](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181711556.png!blog.guiyexing)

3. 绑定密钥对后需刷新页面才会显示
4. 本地xshell验证使用秘钥登录成功

## 新建.yml文件

方式一：

1. 进入GitHub Actions菜单

Build, test, and deploy your code. Make code reviews, branch management, and issue triaging work the way you want. Select a workflow to get started.

Skip this and [set up a workflow yourself ](https://github.com/lxs2048/pism/new/main?filename=.github%2Fworkflows%2Fmain.yml&workflow_template=blank)

2. 点击 set up a workflow yourself

3. 直接 start commit

会自动在我们项目目录下新建.github/workflows/main.yml文件，yml文件内容默认即可

actions会自动执行执行一次，并且可以看到执行结果。

4. 拉取代码到本次，在本地修改yml配置文件。

方式二：

直接在项目根目录新建.github/workflows文件夹

新建任意文件名称但需要以.yml为后缀

## 配置部署秘钥

项目->setting->Secret->Actions->New repository secret

![image-20220410225718892](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181711562.png!blog.guiyexing)

后续yml文件中的部署步骤中，服务器的ip、端口号、用户名、秘钥、我们都没有直接写在文件里面，为了安全考虑，从secrets中读取

```
REMOTE_HOST # host
REMOTE_PORT # 端口号
REMOTE_USER # 用户名
REMOTE_USER_SSH_KEY # 用户名对应的私钥
SOURCE_PATH # 需要复制的文件源
TARGER_PATH # 复制到目标路径
```

## 配置.yml文件

配置前端的部署任务build-frontend如下

```
# 定义workflow的名称，如果没有定义，则会默认使用执行脚本文件名作为workflow名称
name: pism actions
# 触发workflow的条件或者事件，比如push的时候就像执行workflow
on:
  #监听push操作
  push:
    # mian分支，可以改成其他任何分支
    branches: [ main ]
# jobs是一个workflow的核心任务，我们大部分的操作在jobs中完成，我们的任务（job）放在jobs这个集合下
jobs:
  # 任务ID-任意命名
  build-frontend:
    # 运行环境-linux的版本
    runs-on: ubuntu-latest
    # 步骤
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js environment
      uses: actions/setup-node@v3.1.0
      with:
        node-version: '16.X'
    - name: deploy-frontend
      run: |
          cd frontend
          npm i
          npm run build
    - name: copy file via ssh key
      uses: appleboy/scp-action@v0.1.2
      with:
        host: ${{ secrets.REMOTE_HOST }}
        port: ${{ secrets.REMOTE_PORT }}
        username: ${{ secrets.REMOTE_USER }}
        key: ${{ secrets.REMOTE_USER_SSH_KEY }}
        source: ${{ secrets.SOURCE_PATH }}
        target: ${{ secrets.TARGER_PATH }}
        strip_components: 2
```

```
appleboy/scp-action配置注意
source和target都不可以出错，否则tar: empty archive...报错
source是需要复制的文件源，这里如果有文件嵌套就需要设置为frontend/dist/
没有嵌套就直接使用dist/
strip_components:删除指定数量的前导路径元素(不设置时，仅dist会把dist文件夹也复制到指定的目录，多层也会同时复制过去，所以如果源嵌套两层时可以设置为2，这样仅会把打包后的文件夹dist里面的内容复制到指定位置)
target:复制到目标路径,根据不同用户来设置(如想把文件复制到ubuntu用户的nginx/html目录下就设置为/home/ubuntu/nginx/html)
注意:配置secrets时都不需要手动加引号
```

