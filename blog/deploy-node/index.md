---
slug: deploy-node
title: docker部署node-server
authors: [dolphin]
tags: [node-server,docker,deploy]
date: 2022-09-20T18:57
---

参照[整合全栈持续集成](/docs/deploy/整合全栈Docker部署),完成前后端分离且不在同一项目目录的node-server中台独立部署

<!--truncate-->

基于初始化express继续进行扩展容器化部署

首先在根目录配置`docker-compose.yml`

```yaml title="docker-compose.yml"
version: '3.8'
services:
  backend:
    container_name: backendContainer
    build: ./
    image: backend920:1.0.0
    restart: always
    ports:
      - "8888:8888"
    depends_on:
      - mongo
    environment:
      - WAIT_HOSTS=mongo:27017
      - WAIT_HOSTS_TIMEOUT=300
      - WAIT_SLEEP_INTERVAL=30
      - WAIT_HOST_CONNECT_TIMEOUT=30
    networks:
      - backend_net
  mongo:
    # 安装镜像
    image: mongo:5.0.6
    # 容器名称
    container_name: mongoContainer
    # 挂掉之后重新自启
    restart: always
    command: --auth
    # 比如容器中的 /data/db 里面的东西都会放到我们服务器中的 ~mongo/mongo-volume 目录
    volumes:
      - ./mongo/mongo-volume/:/data/db
      # init-mongo.js文件会在 mongodb 容器初始化完成之后执行，给数据库创建默认的角色
      - ./mongo/init-mongo.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    environment:
      # 时区，设置为上海，就是东八区
      TZ: Asia/Shanghai
      # 初始化 mongodb 的账户，这个账户会创建在 admin 下，就是超管权限
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: rootpwd
    ports:
      # 将容器的27017端口映射到宿主机的27017端口
      - 27017:27017
    networks:
      - backend_net
  mongo-express:
    image: mongo-express:0.54.0
    container_name: mongoExpressContainer
    restart: always
    ports:
      - 8081:8081
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: root
      ME_CONFIG_MONGODB_ADMINPASSWORD: rootpwd
      ME_CONFIG_MONGODB_SERVER: mongo
    depends_on:
      - mongo
    networks:
      - backend_net
networks:
  backend_net:
    driver: bridge
```

backend服务执行当前目录Dockerfile制作镜像,自定义的名称和版本号分别为`backend920`，`1.0.0`，dockerfile配置如下：

```text title="Dockerfile"
FROM keymetrics/pm2:14-alpine
WORKDIR /usr/src/app
ADD . /usr/src/app

RUN npm config set registry https://registry.npm.taobao.org/ && \
    npm i

EXPOSE 8888
# ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x ./wait
RUN chmod +x ./pm2Start.sh

CMD ./wait && ./pm2Start.sh
#pm2在docker中使用命令为pm2-docker
# CMD ["pm2-runtime", "start",  "process.yml"]
```

项目依赖mongodb的服务完全启动后才可以启动成功，depends_on仅依赖于容器启动是不够的，所以使用wait【远程仓库太慢，所以放在了根目录，不需要同步到代码仓库】监听mongo的端口27017，可以连接后执行`pm2Start.sh`使用pm2守护node进程，配置如下：

```sh title="pm2Start.sh"
#!/bin/sh
echo 💥 backend 💥
pm2-runtime start process.yml
echo --------------------------
```

使用`pm2-runtime`执行`pricess.yml`

```text title="process.yml"
apps:
  - script: src/app.js
    instances: 2
    watch: true
    env:
      NODE_ENV: productionapps
```

:::tips
mongo服务和mongo-express需要注意的是生产密码不要如此简单，且应停止mongo-express容器
:::

配置`init-mongo.js`文件会在 mongodb 容器初始化完成之后执行，给数据库创建默认的角色，非本地开发时使用在`docker-compose.yml`中配置的`mongo`这个服务名称

```js
return mongoose.connect('mongodb://mongo:27017/api_db', {...})
```

另外一种重点是自定义了网络类型于名称，这里配置桥接模式，且将所有容器networks设置同名backend_net，这样就可以实现容器间网络互通

在`Dockerfile`中使用`ADD . /usr/src/app`会把当前项目的所有文件都复制到该工作目录下，所以使用ignore文件排除，mongo目录仅在启动mongo容器时使用初始化执行的js，而另外一个文件则是作为数据卷

```text title=".dockerignore"
/node_modules
/mongo
```

最后就是如何推动到服务器了，还是使用deploy插件

```json title=".vscode/settings.json"
{
    "deploy": {
        "packages": [{
            "files": [
                "**/*",
            ],
            "exclude": [
                "node_modules/**",
                ".git/**",
                ".vscode/**",
                "**/node_modules/**",
                "mongo/mongo-volume/**",
            ],
            "deployOnSave": false,
            "button": {
                "text": "服务发布测试环境",
                "tooltip": "点击发布到测试环境...",
                "targets": [ "nodeServer" ]
            }
        }],
        "targets": [{
            "type": "sftp",
            "name": "nodeServer",
            "dir": "/home/ubuntu/service/node-server",
            "host": "101.43.181.81",
            "port": 22,
            "user": "ubuntu",
            "privateKey": "/Users/dolphin/source/CI"
        }],
    },
}
```

点击`服务发布测试环境`将项目推送到服务器使用`docker-compose up --build -d`启动项目，有错误不要使用`-d`查看日志
