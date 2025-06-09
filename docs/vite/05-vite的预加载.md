# vite的预加载

```js
import _ from "lodash"; // lodash可能也import了其他的东西
```

vite在处理的过程中如果看到有`非绝对或相对`的引用, 他会进行`预加载`，并开启`路径补全`

```js
import _ from "/node_modules/.vite/deps/lodash";

import __vite__cjsImport0_lodash from "/node_modules/.vite/deps/lodash.js?v=ebe57916";
```

![image-20221022153451634](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210221534730.png!blog.guiyexing)

![image-20221026210223920](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210262102950.png!blog.guiyexing)

生产和开发的区别：

* vite在开发环境使用依赖预构建
* vite在生产环境会全权交给rollup的库去完成打包

有的第三方包，比如react使用commonjs规范的导出`module.exports`，vite使用依赖预构建。

**依赖预构建**: 首先vite会找到对应的依赖, 然后调用esbuild(对js语法进行处理的一个库), 将其他规范的代码转换成esmodule规范, 然后放到当前目录下的`node_modules/.vite/deps`, 同时对esmodule规范的各个模块进行统一集成

```js
// a.js
export default function a() {}
```

```js
//index.js
export { default as a  } from "./a.js"
```

vite重写以后
```js
//index.js
function a() {}
```

他解决了3个问题:
1. 不同的第三方包会有不同的导出格式(这是vite没法约束的事情)
2. 对路径的处理上可以直接使用.vite/deps, 方便路径重写（当导入安装好的包的时候就可以在.vite/deps中看到编译后的结果）
3. **网络多包传输的性能问题**(也是原生esmodule规范不敢支持node_modules的原因之一)，我们知道使用import导入的每个模块，都会重新发一次网络请求，有了依赖预构建以后无论他有多少的额外export和import，**vite都会尽可能的将他们进行集成最后只生成一个或者几个模块**

我们安装loadsh的esmodule的形式`lodash-es`

```
npm i lodash-es
```

可以看到`lodash-es`导出了许多的模块

![image-20221022154929029](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210221549060.png!blog.guiyexing)

而在网络请求里我们可以看到vite把他重写了，即把模块进行统一集成

![image-20221022155136007](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210221551037.png!blog.guiyexing)

**vite配置：**

配置文件`vite.config.js`

vite.config.js === webpack.config.js

```js
export default {
  optimizeDeps:{
    exclude:["lodash-es"],//当遇到lodash-es这个依赖的时候不进行预构建
  }
}
```

重启服务后就会发现会发送很多的网络请求去加载依赖

![image-20221022155751428](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210221557461.png!blog.guiyexing)

注意：**找寻依赖的过程是自当前目录依次向上查找的过程, 直到搜寻到系统根目录或者搜寻到对应依赖为止**

测试：把node_modules移动到当前项目的上级，依然可以在当前项目里启动，启动时会把预构建的文件放到当前项目的node_modules下，在当前安装包又会安装到当前的node_modules下，可以同时导入当前和上级的包使用。

![image-20221026211859020](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210262118054.png!blog.guiyexing)
