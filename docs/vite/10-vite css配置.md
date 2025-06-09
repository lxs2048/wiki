# vite css配置

## css基础配置

在vite.config.js中我们通过`css`属性去控制整个vite对于css的处理行为

`modules`是对css模块化的默认行为进行覆盖，`modules`配置最终会丢给`postcss modules`

```js
"css":{
  modules: {
    localsConvention: "camelCaseOnly",
    scopeBehaviour: "local",
    // 类名规则
    generateScopedName: "[name]_[local]_[hash:5]",
    // 可以使用函数形式来配置
    // generateScopedName: (name, filename, css) => {
    //     // name -> 代表的是你此刻css文件中的类名
    //     // filename -> 是你当前css文件的绝对路径
    //     // css -> 给的就是你当前样式
    //     console.log("name", name, "filename", filename, "css", css);
    //     // 配置成函数以后, 返回值就决定了他最终显示的类型
    //     return `${name}_${Math.random().toString(36).substr(3, 8) }`;
    // }
    hashPrefix: "hello", // 生成hash会根据你的类名 + 一些其他的字符串(文件名 + 他内部随机生成一个字符串)去进行生成, 如果你想要你生成hash更加的独特一点, 你可以配置hashPrefix, 你配置的这个字符串会参与到最终的hash生成, （hash: 只要你的字符串有一个字不一样, 那么生成的hash就完全不一样, 但是只要你的字符串完全一样, 生成的hash就会一样）
    globalModulePaths: ["./componentB.module.css"], // 代表你不想参与到css模块化的路径
  },
  devSourcemap: true,// 开启css的sourceMap（文件索引）
},
```

- localConvention: 修改生成的配置对象的key的展示形式(驼峰还是中划线形式)【映射对象的key的转化(如在css中一般使用中划线，配置camelCaseOnly以后在映射里只有该类名的驼峰的类名)，在给组件设置类名时就要使用驼峰的方式了】
- scopeBehaviour: 配置当前的模块化行为是模块化还是全局化 (有hash就是开启了模块化的一个标志, 因为他可以保证产生不同的hash值来控制我们的样式类名不被覆盖)，【默认local，设置为global就表示关闭模块化，不会生成映射关系，类名不转化】
- generateScopedName: 生成的类名的规则【生成转化后的类名】(可以配置为函数, 也可以配置成字符串规则: https://github.com/webpack/loader-utils#interpolatename)
- hashPrefix: 生成hash会根据你的类名 + 一些其他的字符串(文件名 + 他内部随机生成一个字符串)去进行生成, 如果你想要你生成hash更加的独特一点, 你可以配置hashPrefix, 你配置的这个字符串会参与到最终的hash生成, （hash: 只要你的字符串有一个字不一样, 那么生成的hash就完全不一样, 但是只要你的字符串完全一样, 生成的hash就会一样）
- globalModulePaths: 代表你不想参与到css模块化的路径

`sourceMap`：文件之间的索引

假设我们的代码被压缩或者被编译过了, 这个时候假设程序出错, 他将不会产生正确的错误位置信息，如果设置了sourceMap, 他就会有一个索引文件map

sourceMap解决的问题极其的微小, 但是他的实现过程非常的复杂

## less

假设没有使用构建工具, 我们又想去编译less文件的话

```
npm i less # lessc的编译器
```

你只要安装了node, 你就可以使用node index.js，你只要安装了less你就可以使用lessc去编译less文件

```
npx lessc test.less
```

同时在使用命令行的时候可以传递一些options，如`npx lessc --math="always" test.less`，如下如果没有使用`--math="always"`参数margin是不会被计算的

![image-20221023220346767](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210232203800.png!blog.guiyexing)

`preprocessorOptions`主要是用来配置css预处理的一些全局参数，部分less配置如下

```js
"css":{
  //...
  preprocessorOptions: {
    // key + config key代表预处理器的名
    less: { // 整个的配置对象都会最终给到less的执行参数（全局参数）中去
      // 在webpack里就给less-loader去配置就好了
      math: "always",
      globalVars: { // 增加全局变量
        mainBgColor: "gray",
      }
      // https://lesscss.org/usage/#less-options
    },
    saas:{
      //...
    }
  },
}
```

在vite中只需要安装了less，就可以自动识别less文件了

![image-20221027222658411](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210272226451.png!blog.guiyexing)

同时支持less的模块化

![image-20221027222839809](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210272228842.png!blog.guiyexing)

## postcss

vite天生对`postcss`有非常良好的支持

水龙头里来的水是自来水，自来水从管道里先到这个全屋净水系统，给全屋净水系统做一些插槽 --> 去除砂砾 --> 净化细菌微生物 --> ... --> 输送到水龙头 --> 我们可以喝的纯净水 （为了保证到我们身体里喝的水是万无一失）

`postcss`他的工作基本和全屋净水系统一致，保证css在执行起来是万无一失的

**有人对postcss有一个误区: 他们认为postcss和less sass是差不多级别**，我们知道我们写的`.less`，`.scss`代码都有各自的工具去将语法进行编译(嵌套语法，函数，变量)成原生css，而postcss可以做更多，postcss自己维护了编译成css语法的插件，还有对未来的高级css语法进行降级、前缀补全等插件来处理css，最后交给客户端去执行

然而目前less和sass等一系列预处理器的postcss插件postcss维护成本较大，postcss官方已经停止维护了，，所以需要使用各自的编译工具编译完, 然后把编译结果给postcss，**所以业内就产生了一个新的说法: postcss是后处理器**

对于js来说通过babel将最新的ts语法进行转换js语法然后再做一次语法降级，最后交给客户端去执行。

**使用postcss：**

在一个没有vite的新项目安装依赖

```
yarn add postcss-cli postcss postcss-preset-env -D
```

创建一个css文件

```css
:root {
    --globalColor: lightblue;
}

div {
    background-color: var(--globalColor);
    width: max(200px, min(50%, 200px));
    filter: blur(30px);
}
```

使用postcss编译：`npx postcss index.css -o ret.css`，输出到ret.css，没有任何的插件，所以不会有什么变化。

然后我们书写描述文件`postcss.config.js`

```js
// 就类似于全屋净水系统的加插槽
// 预设环境里面是会包含很多基础的插件
// 语法降级 --> postcss-low-level
// 编译插件 --> postcss-compiler
// ...
const postcssPresetEnv = require("postcss-preset-env");

// 预设就是帮你一次性的把这些必要的插件都给你装上了
// 做语法的编译 less语法 sass语法 （语法嵌套 函数 变量) postcss的插件 --> 
module.exports = {
    plugins: [postcssPresetEnv(/* pluginOptions */)]
}
```

然后我们再次编译就会发现生成的文件里div下增加了`background-color: lightblue;`的兼容

## vite配置postcss篇

我们首先增加一些比较新的css语法

```css title="test.less"
@mainColor: aliceblue;

.a {
    color: @mainColor;
    background-color: @mainBgColor;
    // 响应式布局, 左侧一个菜单栏 宽度自适应根据屏幕 30%
    // 400px ---> 父容器
    // 120px  200 * 0.3 -> 60  100px 240px 200px; preset-env会帮助我们做语法降级  vite内部会有一个主流浏览器的支持表
    width: clamp(100px, 30%, 200px);
    user-select: none; // 他在其他浏览器上不支持

    .b {
        padding: (100px / 2);
        margin: 100px /2;
    }
}
```

![image-20221024204935853](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210242049886.png!blog.guiyexing)

:::tip 在vite中使用postcss
首先安装`postcss-preset-env`，注意我们不需要安装`postcss`与`postcss-cli`
:::

方案一：

直接在css.postcss中进行配置, 该属性直接配置的就是postcss的配置

```js title="vite.base.config.js"
import postcssPresetEnv from "postcss-preset-env"
//...
"css":{
  //...
  postcss:{
  	plugins:[postcssPresetEnv()]
	}
}
```

方案二：

在项目的根目录创建`postcss.config.js`

```js
const postcssPresetEnv = require('postcss-preset-env')
module.exports = {
  plugins: [postcssPresetEnv()]
}
```

两者都可以实现css降级，同时存在vite配置中的优先级更高

![image-20221024210015745](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210242100794.png!blog.guiyexing)

## 原生全局变量

假设我们在`a.module.css`中定义全局变量

```css
:root {
    --globalColor: lightblue;
}
```

然后替换两个组件的背景色`background-color: var(--globalColor);`，在页面上我们可以看到颜色已经都已经是我们想要的，但是b中的背景色并没有被编译

![image-20221024211333192](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210242113224.png!blog.guiyexing)

对于全局变量我们可以做一个优化，把他们统一写在一个文件里，如`variable.css`

```css
/* 我们使用的一些未来的css特性是不需要经过less sass的预处理器进行编译, 我们交给postcss去处理 */
:root {
    --globalColor: lightblue;
}
```

我们在`main.js`优先导入全局变量css文件，去掉`a.module.css`定义的全局变量

```js title="main.js" {2}
import { count } from "./counter.js";
import './variable.css'
import './CmpA.js'
import './CmpB.js'
import './index.css'
import './test.less'
console.log(count)
```

当我们再次打开页面发现两者都没有编译，这是因为vite是按需加载解析完这个文件就不管了，遇到新的css又重新解析，但是之前解析过的全局变量他并没有保存，解析完就丢了，我们我们要做一个特殊的处理，保证能够拿到，**不是在vite本身的配置中更新配置需重启**

```js title="postcss.config.js" {2,7-8}
const postcssPresetEnv = require("postcss-preset-env");
const path = require("path");

module.exports = {
    plugins: [
        postcssPresetEnv({
            importFrom: path.resolve(__dirname, "./variable.css"),
          // 就好比你现在让postcss去知道 有一些全局变量他需要记下来
        })
    ]
}
```

现在两个组件的背景样式都能看到编译后的结果了

![image-20221024213144858](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210242131904.png!blog.guiyexing)
