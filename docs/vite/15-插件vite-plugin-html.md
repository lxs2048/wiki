# 插件vite-plugin-html

webpack --> webpack-html-plugin / clean-webpack-plugin (clean: true)


其实就是因为vite他内置了非常多的插件, 然后我们作为普通的开发者不需要承担这么高的心智负担

https://github.com/vitejs/vite/search?q=resolvePlugin

![image-20221030144256547](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210301442585.png!blog.guiyexing)

## 测试vite-plugin-html

[vite-plugin-html](https://github.com/vbenjs/vite-plugin-html)就是帮我们动态的去控制整个html文件中内容

```
npm i vite-plugin-html -D
```

添加vite配置：

```js
import { createHtmlPlugin } from 'vite-plugin-html'
export default {
	plugins: [
		createHtmlPlugin({
      inject:{
        data: {
          title: 'index',
        }
      }
    })
	]
};
```

添加EJS到`index.html`

```html
 <title><%= title %></title>
```

![image-20221030152003470](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210301520506.png!blog.guiyexing)

## 手写vite-plugin-html

更新vite配置：

```js
import MyCreateHtml from './plugins/MyCreateHtml'
export default {
	plugins: [
		MyCreateHtml({
      inject:{
        data: {
          title: 'index-test',
        }
      }
    })
	]
};
```

安装EJS

``` 
npm install ejs -D
```

[EJS](https://ejs.bootcss.com/)是一套简单的模板语言，帮你利用普通的 JavaScript 代码生成 HTML 页面。EJS 没有如何组织内容的教条；也没有再造一套迭代和控制流语法；有的只是普通的 JavaScript 代码而已。

ejs在服务端会用的比较频繁 因为服务端可能经常会动态的去修改index.html的内容

![image-20221030155517396](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210301555422.png!blog.guiyexing)

![image-20221030160445636](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210301604666.png!blog.guiyexing)

插件内容如下：

核心思路是导入ejs解析我们的html并返回，这里要在核心插件运行前执行【插件顺序】

```js title="plugins/MyCreateHtml.js"
let ejs = require('ejs');
module.exports = (options) => {
    return {
        // enforce将我们插件的一个执行时机提前
        transformIndexHtml: {
            enforce: "pre",
            transform: (html, ctx) => {
                // ctx 表示当前整个请求的一个执行期上下文
                console.log("html", html);
                return ejs.render(html, options.inject.data);
            }
        }
    }
}
```

