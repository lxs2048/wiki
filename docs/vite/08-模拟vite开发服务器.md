# 模拟vite开发服务器

在项目开发的时候看到了这样的请求，那浏览器怎么识别到.tsx文件的?

![image-20221023185843693](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210231858726.png!blog.guiyexing)

接下来我们来实现一套简单的vite的开发服务器

使用node端的koa框架创建项目：

```
mkdir vite-dev-server
cd vite-dev-server
yarn init -y
yarn add koa
```

配置package.json

```json title="package.json"
"scripts": {
  "dev":"node index.js"
},
```

首先创建服务的入口文件

```js title="index.js"
const Koa = require("koa");
const fs = require("fs");
const path = require("path");

const app = new Koa();

app.use(async (ctx) => {
    //context上下文request的请求信息与响应信息
    // 用中间件去帮我们读文件就行了
    if (ctx.request.url === "/") {
        const indexContent = await fs.promises.readFile(path.resolve(__dirname, "./index.html")); // 在服务端一般不会这么用
        ctx.response.body = indexContent;
        ctx.response.set("Content-Type", "text/html");
    }
    if (ctx.request.url === "/main.js") {
        const indexContent = await fs.promises.readFile(path.resolve(__dirname, "./main.js")); // 在服务端一般不会这么用
        ctx.response.body = indexContent;
        ctx.response.set("Content-Type", "text/javascript");
    }
})

app.listen(5173, () => {
    console.log("vite dev serve listen on 5173");
})
```

当请求`/`时返回html，请求`main.js`时返回该文件，我们在`index.html`中导入`main.js`,将自动发送请求

```html title="index.html"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    my vite dev server
    <script type="module" src="./main.js"></script>
</body>
</html>
```

```js title="main.js"
console.log('main.js')
```

`npm run dev`，然后访问服务可以看到main.js被打印

![image-20221023192801227](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210231928266.png!blog.guiyexing)

测试tsx结尾请求：

我们在main中增加导入`import './App.tsx'`

```js title="App.tsx"
console.log('App.tsx')
```

入口文件处理`/App.tsx`路由的content类型为javascript

```js title="index.js"
if (ctx.request.url === "/App.tsx") {
  const indexContent = await fs.promises.readFile(path.resolve(__dirname, "./App.tsx")); // 在服务端一般不会这么用
  ctx.response.body = indexContent;
  ctx.response.set("Content-Type", "text/javascript");
}
```

![image-20221026221241737](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210262212782.png!blog.guiyexing)

main.js中的响应里有一个导入的字符串，这样就会生成`http://localhost:5173/App.tsx`的请求

![image-20221023192349383](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210231923415.png!blog.guiyexing)

说明了浏览器是不会去看请求的后缀，而是去看得到的响应的`Content-Type`
