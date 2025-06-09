# resolve.alias的原理

## vite配置别名

```js
import path from "path";
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // 设置别名, 在其他组件中可以使用@来代替src这个目录
      "@assets": path.resolve(__dirname, "./src/assets"),
    }
  },
})
```

## 实现别名解析

基于模拟vite开发服务器`vite-dev-server`项目,我们进一步测试

我们先在项目根目录创建一个`vite.config.js`文件，加入如下配置

```js
const path = require("path");

module.exports = {
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@assets": path.resolve(__dirname, "./src/assets")
        }
    }
}
```

我们不用把配置返回给客户端，且约定的名字就叫做vite.config.js，所以可以直接在入口引入查看效果

```js
const viteConfig = require("./vite.config");
console.log(viteConfig)
```

![image-20221025221218173](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210252212206.png!blog.guiyexing)

然后我们添加一个条件判断

```js
// 如果当前文件的url是以js后缀结尾的
if (ctx.request.url.endsWith(".js")) {
  const JSContent = await fs.promises.readFile(path.resolve(__dirname, "." + ctx.request.url)); // 在服务端一般不会这么用
  console.log("JSContent", JSContent);
  // 直接进行alias的替换
  const lastResult = aliasResolver(viteConfig.resolve.alias, JSContent.toString());
  ctx.response.body = lastResult; // 作为响应体发给对应的请求的人
  ctx.response.set("Content-Type", "text/javascript");
}
```

我们的处理函数`aliasResolver`可以为

```js
function aliasResolver(aliasConf, JSContent) {
    let lastContent = JSContent;
    const entires = Object.entries(aliasConf);
    entires.forEach(entire => {
        const [alia, path] = entire;
        console.log(entire)
        // 会做path的相对路径的处理-官方使用的更复杂全面
        const srcIndex = path.indexOf("/src");
        // alias别名最终做的事情就是一个字符串替换
        const realPath = path.slice(srcIndex, path.length);
        lastContent = lastContent.replace(alia, realPath);
    })
    return lastContent;
}
```

接下来就可以进行测试了，我们在main.js中增加导入

```js title="main.js"
console.log('main.js')
import "@/hello.js"
import "@assets/hi.js"
```

两个js分别为

```js title="/src/hello.js"
console.log('hello.js')
```

```js title="/src/assets/hi.js"
console.log('hi.js')
```

我们在控制台得到了打印结果

![image-20221025224201091](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210252242125.png!blog.guiyexing)

网络请求得到的main.js文件中导入文件的路径被替换，所以就可以请求hello与hi的js文件了

![image-20221025224356578](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210252243604.png!blog.guiyexing)

**本质是字符串的replace操作**

**本质是字符串的replace操作**

**本质是字符串的replace操作**

## 局限性

后续看了前面写的处理函数存在问题

1. 使用replace只能替换一个第一个匹配到的

2. 匹配方式有问题，配置有`@`,`@assets`，然后导入方式`import "@/hello.js";import "@assets/hi.js"`，遍历的时候匹配了第一个`@`，只替换第一个，然后进入下一轮循环，匹配第一个`@assets`，刚好可以解析

3. 如果我调换顺序`import "@assets/hi.js";import "@/hello.js"`，解析结果就会变成
   ```js
   import "/srcassets/hi.js"
   import "@/hello.js"
   ```

   第一次匹配到`@`替换，第一次变量匹配不到`@assets`

所以，我的理解是要兼容配置中的单独一个@的配置，在替换的时候需要加一个后缀如匹配`@/`，`@assets/`进行全量替换

```js {10}
function aliasResolver(aliasConf, JSContent) {
    let lastContent = JSContent;
    const entires = Object.entries(aliasConf);
    entires.forEach(entire => {
        const [alia, path] = entire;
        // 会做path的相对路径的处理-官方使用的更复杂全面
        const srcIndex = path.indexOf("/src");
        // alias别名最终做的事情就是一个字符串替换
        const realPath = path.slice(srcIndex, path.length);
        lastContent = lastContent.replaceAll(alia+'/', realPath+'/');
    })
    return lastContent;
}
```

注意：nodejs 15.X开始支持replaceAll方法

nodejs14.X以下replaceAll的处理方法：

将searchValue中的元素aaa替换成bbbb

```js
searchValue.split(aaa).join(bbbb);

let pattern = new RegExp(aaa,"g");
searchValue.replace(pattern,bbb)
```
