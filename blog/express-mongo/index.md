---
slug: express-init
title: 初始化express连接mongo
authors: [dolphin]
tags: [node-server,express,mongo]
date: 2022-09-18T18:57
---

初始化一个查询与注册用户的服务端，供前端连接测试

<!--truncate-->

## 初始化express

```
npm init -y
npm i express
npm i modemon -D
```

## 配置package.json

```json
{
  //...
  "type": "module",
  "scripts": {
    "start": "nodemon src/app.js"
  },
}
```

## 配置连接mongoDB

使用本地docker启动mongo服务

```js title="src/db/connectMongoDB.js"
import mongoose from 'mongoose'
function connectMongoDB() {
  return mongoose.connect('mongodb://localhost:27017/api_db', {
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

## 配置入口文件

在连接mongoDB后启动node服务

```js title="src/app.js"
import express from 'express'
import bodyParser from 'body-parser'
import connectMongoDB from "./db/connectMongoDB.js"
import Route from './routers/index.js'
const app = express()
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
Route(express.Router, app)
/* 连接mongoDB */
connectMongoDB().then(()=>{
    app.listen(8888, () => {
        console.log(`http://localhost:8888`)
    })
},(err)=>{
    console.log(err)
})
```

## 配置Route入口

在这里配置所有的路由

```js title="src/routers/index.js"
import account from './accountInfo.js'
export default function(Router,app){
    const router = Router()
    /* 配置路由 */
    app.use(`/account`,account(router))
        app.use('/',(res,req)=>{
        req.send({
            success: false,
            msg: `${res.method}:${res.url}不存在,请检查请求URL或类型`
        })
    })
}
```

## 配置用户信息路由

如下一个用于查数据，一个用于注册

```js title="src/routers/accountInfo.js"
import {addAccountInfo, getAccountInfo} from '../controller/accountInfo.js'
export default function (router) {
    router.get('/', getAccountInfo)
    router.post('/register', addAccountInfo);
    return router
}
```

## 配置控制器

接下来进入控制器看如何查询

```js title="src/controller/accountInfo.js"
import AccountInfoModel from "../model/accountInfo.js"
const addAccountInfo = (req, res) => {
    const { username, password, address } = req.body
    AccountInfoModel.insertMany({
        username,
        password,
        address,
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
    let { pageSize=10, current=1 } = req.body
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

## 配置模型

接下来看看模型是如何配置的，这里关闭了版本，重命名创建与更新时间并更改格式，移除原本`_id`主键

```js title="src/model/accountInfo.js"
import mongoose from 'mongoose'
const AccountInfoSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true,
        select:false
    },
    address: {
        type: String,
        require: true
    },
    created: {
        type: Number
    },
    updated: {
        type: Number
    }
}, {
    versionKey: false,//关闭版本信息，The default is '__v'
    timestamps: { createdAt: 'created', updatedAt: 'updated' },
})
AccountInfoSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) { delete ret._id }
});
// 参数 1:模型名称（首字母大写），参数 2:Schema，参数 3:数据库集合名称(无参数3，集合名称同模型名称)
const AccountInfoModel = mongoose.model('AccountInfo', AccountInfoSchema, 'account')
export default AccountInfoModel
```

## 配置docker

最后参考本地docker配置方法

```
docker
└── mongo
│   ├── mongo-volume
│   └── init-mongo.js
└── docker-compose.yml
```

配置`docker-compose.yml`

```
version: '3.8'
services:
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
```

配置`init-mongo.js`

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

