# 插件vite-plugin-mock

mock数据: 模拟数据

前后端一般是并行开发（接口文档），mock数据去做前端的工作

1. 简单方式: 直接去写死一两个数据 方便调试

  - 缺陷： 

    - 没法做海量数据测试
    - 没法获得一些标准数据 
    - 没法去感知http的异常


2. mockjs: 模拟海量数据的，vite-plugin-mock的依赖项就是mockjs

## 测试vite-plugin-mock

https://github.com/vbenjs/vite-plugin-mock

```
npm i vite-plugin-mock mockjs -D
```

vite配置

```js
import { viteMockServe } from 'vite-plugin-mock'
export default {
	plugins: [
		viteMockServe(),
	]
};
```

vite默认会寻找根目录下mock文件夹，示例如下，参照[Mock.js](http://mockjs.com/)=>[wiki](https://github.com/nuysoft/Mock/wiki)

```js title="/mock/index.js"
const mockJS = require("mockjs");

const userList = mockJS.mock({
  "records|100": [{
    "id|+1": 1, //递增id
    name: "@cname", // 表示生成不同的中文名
    ename: mockJS.Random.name(), // 生成不同的英文名
    image:mockJS.Random.image(),
    time: "@time",
    date: "@date",
  }]
})

module.exports = [
  {
    method: "post",
    url: "/api/users",
    response: ({ body }) => {
      return {
        code: 200,
        msg: "success",
        data: userList
      };
    }
  },
]
```

测试发送请求

```js title="main.js"
fetch("/api/users", {
    method: "post"
}).then(response => response.json()).then(data=>{
    console.log(data)
}).catch(error => {
    console.log("error", error);
})
```

![image-20221030213207035](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210302132069.png!blog.guiyexing)

## 手写vite-plugin-mock

更新vite配置：

```js
import MyVitePluginMock from './plugins/MyVitePluginMock'
export default {
	plugins: [
		MyVitePluginMock()
	]
};
```

![image-20221030233653656](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210302336699.png!blog.guiyexing)

在本地开发时如果我们没有设置`baseUrl`，发送的网络请求就会自动拼接当前本地服务的域名端口，请求本地的服务器，我们处理的其中一种方式就是手动处理这些请求，拦截到请求以后响应对应mock的数据。

注意：`configureServer` 在运行生产版本时不会被调用

插件核心就是在内部中间件运行前进行判断，如果是请求接口属于mock的接口，就拦截下来进行响应mock的数据，否则`next()`进入下一个中间件

```js title="plugins/MyVitePluginMock.js"
const fs = require("fs");
const path = require("path");
// 获取当前本地mock所有接口的信息
const getMockApi = () => {
  const mockStat = fs.statSync("mock");
  const isDirectory = mockStat.isDirectory();
  let mockResult = [];
  if (isDirectory) {
    // process.cwd() ---> 获取你当前的执行根目录
    mockResult = require(path.resolve(process.cwd(), "mock/index.js"));
  }
  /*形如：[{ method: 'post', url: '/api/users', response: [Function: response] }]*/
  return mockResult;
}

// 判断请求里的路由是否匹配
const isUrlInMock = (req,mockList)=>{
  // 路由与方式都匹配
  return mockList.find(mockDescriptor => mockDescriptor.url === req.url && mockDescriptor.method.toUpperCase() === req.method);
}

module.exports = () => {
  return {
    configureServer(server) {
      // 服务器的相关配置
      // req, 请求对象 --> 用户发过来的请求, 请求头请求体 url cookie
      // res: 响应对象, - res.header
      // next: 是否交给下一个中间件, 调用next方法会将处理结果交给下一个中间件

      server.middlewares.use((req, res, next) => {
        const matchItem = isUrlInMock(req,getMockApi());//获取匹配到的mock的某一项数据否则undefined
        if(matchItem){
          // mock中存在就拦截
          const responseData = matchItem.response(req);
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(responseData));
        }else{
          next();//进入下一个中间件
        }
      })
    }
  }
}
```

如果请求的地址不在mock的地址范围，进入next后匹配不到该请求对应的文件或者处理的路由，就默认给返回404

![image-20221030234815978](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210302348015.png!blog.guiyexing)