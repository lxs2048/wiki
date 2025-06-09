---
sidebar_position: 5
---

# 整合全栈持续集成

## 1.宿主机使用nginx

```
apt update
apt install nginx
nginx -v/V # nginx version: nginx/1.18.0 (Ubuntu)
curl 0.0.0.0:80 # 访问默认页面-welcome to nginx

# 修改配置
cd /etc/nginx
# 原conf.d中的配置*.conf中的默认配置default.conf移动到了sites-available为default,nginx.conf可查看配置
```

简化/etc/nginx/sites-available/default如下

```
server{
    listen 80;
    server_name localhost;
    location / {
        root /var/www/html/demo80;
        index index.html index.htm;
    }
}
```

编辑入口html

```
cd /var/www/html
rm -rf *
mkdir demo80 && cd demo80
vim index.html # 写入内容
nginx -s reload # 重启nginx后重新访问
# 如果没有启动使用以下启动命令
systemctl start nginx.service # 启动nginx服务命令
```

## 2.安装docker

[ubuntu安装docker](https://docs.docker.com/engine/install/ubuntu/)

同时安装docker-compose

## 3.准备前后端项目

Node版本v14.19.1

```
pism-web
├── backend                                 // 中台express
│   ├── node_modules						// 项目开发所有的依赖
│   ├── src                                 // 源码目录
│   ├── .gitignore							// Git忽略文件
│   ├── package-lock.json                   // 固化当前安装的每个软件包的版本
│   ├── package.json						// 对项目或者模块包的描述
│   ├── process.yml                         // 
├── blog                                    // 前台UmiJS
│   ├── mock								// 存储mock文件
│   ├── node_modules						// 项目开发所有的依赖
│   ├── src
│       ├── .umi							// 临时文件目录
│       └── pages							// 所有路由组件存放在这里
│           ├── index.less
│           └── index.tsx
│   ├── public
│       └── favicon.ico
│   ├── .editorconfig
│   ├── .gitignore							// Git忽略文件
│   ├── .prettierignore
│   ├── .prettierrc
│   ├── .umirc.ts							// 配置文件，包含 umi 内置功能和插件的配置。
│   ├── package-lock.json                   // 固化当前安装的每个软件包的版本
│   ├── package.json						// 对项目或者模块包的描述
│   ├── README.md
│   ├── tsconfig.json
│   ├── typings.d.ts
└── pism                            		// 后台UmiJS-目录结构同blog
```

**中台：**

```
mkdir pism-web && cd pism-web
mkdir backend && cd backend
npm init -y
npm i express
```

创建一个入口文件src/app.js

```js
const express = require('express')
const app = express()
app.get('/hello',(req,res)=>{
    res.send({
        hello:'hello hi hi'
    })
})
app.listen(3000,()=>{
    console.log(`http://localhost:3000`)
})
```

创建process.yml

```
apps:
  - script: src/app.js
    instances: 2
    watch: true
    env:
      NODE_ENV: production
```

创建git忽略文件.gitignore

```
# dependencies
/node_modules
/npm-debug.log*
/yarn-error.log
/yarn.lock
/package-lock.json
```

配置package.json

```json
"scripts": {
    "start": "node src/app.js",
    "start:pm2": "pm2 start process.yml"
},
```

可使用两种方式启动项目

**前台：**

```
mkdir blog
npx @umijs/create-umi-app
```

.umirc.ts配置代理

```js
// 配置ico-根目录新增public/favicon.ico
links: [{ rel: 'icon', href: '/favicon.ico' }],
proxy: {
  '/api': {
    'target': 'http://localhost:3000',
    'changeOrigin': true,
    'pathRewrite': { '^/api' : '' },
  },
},
// 配置两个路由测试
{ path: '/detail', component: '@/pages/detail' },
{ path: '*', component: '@/pages/notFound' },
```

请求中台数据

```tsx
import { useEffect, useState } from 'react';
import styles from './index.less';
import request from 'umi-request';
export default function IndexPage() {
  const [msg,setMsg] = useState('')
  useEffect(() => {
    request
      .get('/api/hello')
      .then(function (response) {
        setMsg(response.hello)
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [])
  return (
    <div>
      <h1 className={styles.title}>blog</h1>
      <div>{msg}</div>
    </div>
  );
}

```

后台数据同前台blog替换为了pism

## 4.dockerfile

backend新增.dockerignore

```
node_modules
```

backend新增Dockerfile

```
FROM keymetrics/pm2:14-alpine
WORKDIR /usr/src/app
ADD . /usr/src/app
RUN npm config set registry https://registry.npm.taobao.org/ && \
    npm i
EXPOSE 3000
#pm2在docker中使用命令为pm2-docker
CMD ["pm2-runtime", "start",  "process.yml"]
```

## 5.nginx

项目根目录新增nginx配置

```
pism-web
└── nginx
│   ├── blog
│   	├── conf.d
│   		├── blog.conf
│   	└── logs
│   ├── pism
│   	├── conf.d
│   		├── pism.conf
│   	└── logs
│   └── conf
│   	└── log_format.conf
```

blog.conf配置

```
server {
    listen       80;
    server_name  localhost;
    location / {
        root   /var/www/html;
        index  index.html;
        try_files $uri $uri/ /index.html;
    }
    location /api/ {
        proxy_pass  http://backendContainer:3000/;
    }
}
```

pism.conf配置同blog.conf

log_format.conf配置

```
if ($time_iso8601 ~ "^(d{4})-(d{2})-(d{2})T(d{2}):(d{2}):(d{2})") {
    set $year $1;
    set $month $2;
    set $day $3;
    set $hour $4;
}
access_log /var/log/nginx/${server_name}_${year}-${month}-${day}-${hour}_access.log main;
```

## 6.docker-compose

根目录新增docker-compose.yml

```
version: '3.8'
services:
  backend:
    container_name: backendContainer
    build: ./backend
    restart: always
    ports:
      - "3000:3000"
  pism:
    image: nginx:1.21.6-alpine
    container_name: pismContainer
    restart: always
    ports:
      - 7001:80
    volumes:
      - ./pism/dist:/var/www/html/
      - ./nginx/pism/conf.d/:/etc/nginx/conf.d
      - ./nginx/conf/log_format.conf:/etc/nginx/log_format.conf
      - ./nginx/pism/logs/:/var/log/nginx
  blog:
    image: nginx:1.21.6-alpine
    container_name: blogContainer
    restart: always
    ports:
      - 7002:80
    volumes:
      - ./blog/dist:/var/www/html/
      - ./nginx/blog/conf.d/:/etc/nginx/conf.d
      - ./nginx/conf/log_format.conf:/etc/nginx/log_format.conf
      - ./nginx/blog/logs/:/var/log/nginx
```

## 7.部署服务端

https://docs.docker.com/compose/reference/up/

```
# 创建或者重新创建容器，以下相当于docker-compose build --no-cache 和 docker-compose up -d 的集合体，构建镜像时根据Dockerfile的最新内容，而不使用缓存
docker-compose up --build -d
# 停止和删除容器、网络、镜像
docker-compose down
# 删除无用镜像
docker rmi $(docker images -f "dangling=true" -q)
```

## 8.宿主机https

准备域名如guiyexing.site，添加admin记录，同时为两者申请证书并上传到服务器

这里把证书保存到了/etc/nginx/cert

```
server {
  listen 80;
  server_name guiyexing.site,admin.guiyexing.site;
  # 将请求转成https
  rewrite ^(.*)$ https://$host$1 permanent;
}
server{
  listen 443 ssl;
  server_name guiyexing.site;
  ssl_certificate      cert/guiyexing.site_nginx/guiyexing.site_bundle.pem;
  ssl_certificate_key  cert/guiyexing.site_nginx/guiyexing.site.key;
  ssl_session_timeout 5m;
  ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
  ssl_prefer_server_ciphers on;
  location / {
    proxy_pass http://localhost:7002;
    proxy_redirect off;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
server{
  listen 443 ssl;
  server_name admin.guiyexing.site;
  ssl_certificate      cert/admin.guiyexing.site_nginx/admin.guiyexing.site_bundle.pem;
  ssl_certificate_key  cert/admin.guiyexing.site_nginx/admin.guiyexing.site.key;
  ssl_session_timeout 5m;
  ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
  ssl_prefer_server_ciphers on;
  location / {
    proxy_pass http://localhost:7001;
    proxy_redirect off;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

## 9.访问测试

![image-20220521111916112](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202209121447698.png!blog.guiyexing)

以上方式需要提前打包，把dist文件夹同步到服务器，然后使用数据卷的方式把静态文件同步到容器中

我们可以使用以下方式进行扩展，使得在docker-compose启动的时候自动打包，如果需要频繁的查看效果还是直接使用以上方式然后更新dist即可

## 10.自动打包

blog与pism配置.dockerignore

分别配置Dockerfile

```
FROM keymetrics/pm2:14-alpine As myBuild
RUN echo "-------------------- blog打包 --------------------"
WORKDIR /app
ADD . .
RUN npm config set registry https://registry.npm.taobao.org/ && \
    npm i && \
    npm run build
RUN echo "-------------------- dist拷贝 --------------------"

FROM nginx:1.21.6-alpine
# 跳转到 nginx 的 80 静态服务对应的目录
WORKDIR /var/www/html/
# 删掉里面的文件
RUN rm -rf ./*
# 将打包文件拷贝到这里
COPY --from=myBuild /app/dist .
```

修改docker-compose.yml

```
pism:
    container_name: pismContainer
    build: ./pism
    restart: always
    ports:
      - 7001:80
    volumes:
      - ./nginx/pism/conf.d/:/etc/nginx/conf.d
      - ./nginx/conf/log_format.conf:/etc/nginx/log_format.conf
      - ./nginx/pism/logs/:/var/log/nginx
blog:
    container_name: blogContainer
    build: ./blog
    restart: always
    ports:
   	  - 7002:80
    volumes:
      - ./nginx/blog/conf.d/:/etc/nginx/conf.d
      - ./nginx/conf/log_format.conf:/etc/nginx/log_format.conf
      - ./nginx/blog/logs/:/var/log/nginx
```

之后就不需要打包了，在根目录运行以下命令就可以直接运行起来

```
docker-compose up --build -d
```

## 11.mongo

backend新增目录

```
src
├── db
│   └── index.js
├── model
│   └── accountInfo.js
├── controller
│   └── accountInfo.js
```

```js
// db/index.js
import mongoose from 'mongoose'
function connectMongoDB() {
  return mongoose.connect('mongodb://mongo:27017/api_db', {
    authSource:'api_db',
    authMechanism:'SCRAM-SHA-1',
    user:'api_user',
    pass:'api1234',
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
}
export default connectMongoDB
```

```js
//model/accountInfo.js
import mongoose from 'mongoose'
const AccountInfoSchema = new mongoose.Schema({
    website: {
        type: String,
        require: true
    },
    username: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    address: {
        type: String,
        require: true
    },
    remark: {
        type: String,
        require: true
    }
},{
    versionKey:false,//关闭版本信息，The default is '__v'
    timestamps: true
})
// 参数 1:模型名称（首字母大写），参数 2:Schema，参数 3:数据库集合名称(无参数3，集合名称同模型名称)
const AccountInfoModel = mongoose.model('AccountInfo',AccountInfoSchema)
export default AccountInfoModel
```

```js
//controller/accountInfo.js
import AccountInfoModel from "../model/accountInfo.js"
const addAccountInfo = (req, res) => {
    const { website, username, password, address, remark } = req.fields
    AccountInfoModel.insertMany({
        website,
        username,
        password,
        address,
        remark
    }).then((resp) => {
        res.send({
            success: true,
            msg: '新增成功',
            data: {
                records: resp
            }
        })
    }).catch(() => {
        res.send({
            success: false,
            msg: '新增失败'
        })
    });
}
const getAccountInfo = (req, res) => {
    let { pageSize, current } = req.fields
    pageSize = parseInt(pageSize),current = parseInt(current)
    AccountInfoModel.find({}).count().then(total => {
        AccountInfoModel.find({}).skip((current - 1) * pageSize).limit(pageSize).then(result => {
            res.json({
                code: 200,
                msg: "查询成功",
                success:true,
                data: {
                    records: result,
                    pagination: {
                        total,
                        pageSize,
                        current,
                        page:Math.ceil(total/pageSize)
                    }
                }
            })
        }).catch(() => {
            res.send({
                success: false,
                msg: '查询失败'
            })
        });
    })
}
export {
    addAccountInfo, getAccountInfo
}
```

更新app.js

```js
import express from 'express'
import ExpressFormidable from "express-formidable";
import connectMongoDB from "./db/index.js"
import {addAccountInfo, getAccountInfo} from './controller/accountInfo.js'
const app = express()
app.use(ExpressFormidable());
app.get('/hello',(req,res)=>{
    res.send({
        hello:'hello hi hi'
    })
})
app.get('/getAccountInfo',getAccountInfo)
app.get('/addAccountInfo',addAccountInfo)

/* 连接mongoDB */
connectMongoDB().then(()=>{
    app.listen(3000, () => {
        console.log(`http://localhost:3000`)
    })
},(err)=>{
    console.log(err)
})
```

更新Dockerfile

```
FROM keymetrics/pm2:14-alpine
WORKDIR /usr/src/app
ADD . /usr/src/app

RUN npm config set registry https://registry.npm.taobao.org/ && \
    npm i
EXPOSE 3000

# ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x ./wait
RUN chmod +x ./pm2Start.sh

CMD ./wait && ./pm2Start.sh
#pm2在docker中使用命令为pm2-docker
# CMD ["pm2-runtime", "start",  "process.yml"]
```

backend手动新增了wait，也可以放开使用从github获取的wait文件

同时backend新增了pm2Start.sh，用来写启动命令

```
#!/bin/sh
echo 💥 backend 💥
pm2-runtime start process.yml
echo --------------------------
```

目的：为了使mongo可以连接后再启动后端项目，仅使用depends_on只能保证容器启动而不是服务启动

更新docker-compose.yml

```
version: '3.8'
services:
  backend:
    container_name: backendContainer
    build: ./backend
    restart: always
    ports:
      - "3000:3000"
    depends_on:
      - mongo
    environment:
      - WAIT_HOSTS=mongo:27017
      - WAIT_HOSTS_TIMEOUT=300
      - WAIT_SLEEP_INTERVAL=30
      - WAIT_HOST_CONNECT_TIMEOUT=30
  pism:
    image: nginx:1.21.6-alpine
    container_name: pismContainer
    restart: always
    ports:
      - 7001:80
    volumes:
      - ./pism/dist:/var/www/html/
      - ./nginx/pism/conf.d/:/etc/nginx/conf.d
      - ./nginx/conf/log_format.conf:/etc/nginx/log_format.conf
      - ./nginx/pism/logs/:/var/log/nginx
  blog:
    image: nginx:1.21.6-alpine
    container_name: blogContainer
    restart: always
    ports:
      - 7002:80
    volumes:
      - ./blog/dist:/var/www/html/
      - ./nginx/blog/conf.d/:/etc/nginx/conf.d
      - ./nginx/conf/log_format.conf:/etc/nginx/log_format.conf
      - ./nginx/blog/logs/:/var/log/nginx
  # 服务名称
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

  # pism:
  #   container_name: pismContainer
  #   build: ./pism
  #   restart: always
  #   ports:
  #     - 7001:80
  #   volumes:
  #     - ./nginx/pism/conf.d/:/etc/nginx/conf.d
  #     - ./nginx/conf/log_format.conf:/etc/nginx/log_format.conf
  #     - ./nginx/pism/logs/:/var/log/nginx
  # blog:
  #   container_name: blogContainer
  #   build: ./blog
  #   restart: always
  #   ports:
  #     - 7002:80
  #   volumes:
  #     - ./nginx/blog/conf.d/:/etc/nginx/conf.d
  #     - ./nginx/conf/log_format.conf:/etc/nginx/log_format.conf
  #     - ./nginx/blog/logs/:/var/log/nginx
```

根目录新增mongo/mongo-volume空目录用来挂载mongo数据

新增mongo/init-mongo.js，用来执行mongo的初始化任务

```js
db = db.getSiblingDB('api_db');
db.createUser(
  {
    user: 'api_user',
    pwd: 'api1234',
    roles: [{ role: 'readWrite', db: 'api_db' }],
  },
);
```

项目启动后测试接口

新增数据：

![image-20220529173213415](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202209121447699.png!blog.guiyexing)

查询数据：

![image-20220529173312718](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202209121447700.png!blog.guiyexing)

数据可视化：

生产环境关闭端口活不要使用mongo-express

![image-20220529173408321](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202209121447709.png!blog.guiyexing)

## 12.redis

backend新增redis逻辑

```js
import { createClient } from 'redis';
const client = createClient({
    url: 'redis://:654321@redis:6379'
});
client.on('connect', () => console.log('Redis Client Success'));
client.on('error', (err) => console.log('Redis Client Error', err));
client.connect();

app.get('/hello',async (req,res)=>{
    await client.set('hello', Math.random());
    const value = await client.get('hello');
    res.send({
        hello:value
    })
})
```

项目根目录增加如下目录

```
redis
├── conf
│   └── redis.conf
└── redis-volume
```

可下载redis.conf模板 http://download.redis.io/redis-stable/redis.conf修改配置

redis.conf配置

```
bind 0.0.0.0
protected-mode no
port 6379
tcp-backlog 511
timeout 0
tcp-keepalive 300

################################# GENERAL #####################################
daemonize no
supervised no
pidfile /var/run/redis_6379.pid
loglevel notice
logfile ""
databases 2

################################ SNAPSHOTTING  ################################
save 1 1
#save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir ./

################################# REPLICATION #################################
slave-serve-stale-data yes
slave-read-only yes
repl-diskless-sync no
repl-diskless-sync-delay 5
repl-disable-tcp-nodelay no
slave-priority 100

################################## SECURITY ###################################
requirepass 654321

################################### LIMITS ####################################
maxclients 10000

############################## APPEND ONLY MODE ###############################
appendonly yes
appendfilename "appendonly.aof"
# appendfsync always
appendfsync everysec
# appendfsync no
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
aof-load-truncated yes

################################ LUA SCRIPTING  ###############################
lua-time-limit 5000

################################ REDIS CLUSTER  ###############################
cluster-enabled no

################################## SLOW LOG ###################################
slowlog-log-slower-than 10000
slowlog-max-len 128

################################ LATENCY MONITOR ##############################
latency-monitor-threshold 0

############################# EVENT NOTIFICATION ##############################
notify-keyspace-events ""

############################### ADVANCED CONFIG ###############################
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
list-compress-depth 0
set-max-intset-entries 512
zset-max-ziplist-entries 128
zset-max-ziplist-value 64
hll-sparse-max-bytes 3000
activerehashing yes
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit slave 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60
hz 10
aof-rewrite-incremental-fsync yes
```

docker-compose.yml的backend服务扩展配置redis

```
depends_on:
  - mongo
  - redis
WAIT_HOSTS=mongo:27017, redis:6379
```

redis配置

```
redis:
    image: redis:6.2.6
    container_name: redisContainer
    restart: always
    ports:
      - 6379:6379
    command: redis-server /etc/conf/redis.conf
    #环境变量
    # privileged: true
    volumes:
      - ./redis/redis-volume:/data
      - ./redis/conf/redis.conf:/etc/conf/redis.conf
    environment:
      - TZ=Asia/Shanghai
      - LANG=en_US.UTF-8
```

