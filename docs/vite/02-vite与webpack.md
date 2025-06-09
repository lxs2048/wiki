# vite与webpack

官方文档: https://cn.vitejs.dev/guide/why.html#the-problems

> 当我们开始构建越来越大型的应用时，需要处理的 JavaScript 代码量也呈指数级增长。包含数千个模块的大型项目相当普遍。我们开始遇到性能瓶颈 —— 使用 JavaScript 开发的工具通常需要很长时间（甚至是几分钟！）才能启动开发服务器，即使使用 HMR(热更新)，文件修改后的效果也需要几秒钟才能在浏览器中反映出来。如此循环往复，迟钝的反馈会极大地影响开发者的开发效率和幸福感。

![image-20221026131219518](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210261312554.png!blog.guiyexing)

我们的项目越大，webpack所要处理的js代码就越多，这跟webpack的一个构建过程（工作流程）有关系

webpack能不能改? 如果一旦要改那么将会动到webpack的大动脉

**webpack支持多种模块化，你的工程可能不只是跑在浏览器端，而vite只支持浏览器端的项目**

在一个ts文件里面使用两种导入方式

```js
// index.js
const lodash = require("lodash"); // commonjs 规范
import Vue from "vue"; // es6 module
```

webpack使用AST抽象语法分析的工具，分析出你写的这个js文件有哪些导入和导出操作

```js
// webpack的一个转换结果
const lodash = webpack_require("lodash");
const Vue = webpack_require("vue");
```

```js
(function(modules) {
    function webpack_require() {}
    // 入口是index.js
    // 通过webpack的配置文件得来的: webpack.config.js ./src/index.js
    modules[entry](webpack_require);

}, ({
    "./src/index.js": (webpack_require) => {
        const lodash = webpack_require("lodash");
        const Vue = webpack_require("vue");
    }
}))
```

实践测试：

![image-20221026130436455](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210261304490.png!blog.guiyexing)

**因为webpack支持多种模块化, 他一开始必须要统一模块化代码, 所以意味着他需要将所有的依赖全部读一遍**

**vite是基于es modules的, 与webpack侧重点不一样, webpack更多的关注兼容性, 而vite关注浏览器端的开发体验**

vite的上手难度更低, webpack的配置是非常多的, loader, plugin...

在vite中进行测试：

![image-20221026131005643](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210261310675.png!blog.guiyexing)

他会把require当着一个可执行的函数去执行，然后未定义。
