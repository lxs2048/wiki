# vite脚手架与vite的区别

vite官网搭建vite项目: https://vitejs.dev/guide/#scaffolding-your-first-vite-project

我们使用`yarn create vite`命令

1. 帮我们全局安装一个东西: create-vite (vite的脚手架)
2. 直接运行这个create-vite在bin目录的下的一个执行配置

有人可能会存在这样的误区: **认为官网中使用对应yarn create构建项目的过程也是vite在做的事情**

使用vue-cli会内置webpack，vue-cli可以和webpack分的很清楚

create-vite和vite的关系是什么呢？

create-vite内置了vite，只不过vite和create-vite都是vue团队的

**vue团队希望弱化vite的一个存在感, 但是我们去学习的时候不能弱化的**

我们自己搭建一个项目: 下载vite, vue, post-css, less, babel

create-vite给你一套预设: 下载vite, vue, post-css, less, babel好了, 并且做好了最佳实践的配置

![image-20221027214859788](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210272148825.png!blog.guiyexing)

官网：https://classic.yarnpkg.com/en/docs/cli/create

然而在执行vite的命令时全局没有找到`create-vite`

这个特性并不是yarn特有的，也可以使用npm create vite，询问是否安装`create-vite`，同样在全局没有找到包

![image-20221027220547121](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210272205155.png!blog.guiyexing)

使用windows全局搜索，终于在yarn的缓存中找到了，路径如下

C:\Users\lxs\AppData\Local\Yarn\Cache\v6\npm-create-vite-3.2.0-d0ea3951ae3b8f65f3c512135dbc96bfa636be4c-integrity\node_modules

如下这种半执行的情况下全局搜索create-vite

![image-20221027230657350](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210272306382.png!blog.guiyexing)