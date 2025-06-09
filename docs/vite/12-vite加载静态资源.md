# vite加载静态资源

什么是静态资源？

对前端工程来说，一般认为加载图片, 视频，字体图标等一系列的放在本地的约定俗成的assets目录下，有的放在public目录下的资源

服务端除了动态API以外，其他基本资源都可以被视作静态资源

vite对静态资源基本上是开箱即用的

我们首先规范一下`test-vite`项目，新增src目录

```
src
├── assets
│		├── images
│		├── json
│		└── svgs
├── components
├── imageLoader.js
└── svgLoader.js
```

## 加载图片

我们写一个加载图片的loader

```js title="imageLoader.js"
import cat from "./assets/images/cat.png";
const img = document.createElement("img");
img.src = cat;
document.body.append(img);
```

然后再入口中使用

```js title="main.js"
import './src/imageLoader'
```

![image-20221025001332205](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210250013249.png!blog.guiyexing)

我们打印cat变量，发现他是一个字符串：`/src/assets/images/cat.png`

服务端在发现用户请求图片资源时，他会去读取这个图片文件的内容，他读到的是二进制字符串Buffer

## 加载JSON(tree shaking)

```js title="main.js"
import './src/imageLoader'
import testJSON from './src/assets/json/test.json'
console.log(testJSON,JSON.stringify(testJSON))
```

在其他的一些构建工具里json文件的导入可能会作为一个JSON字符串形式存在，vite帮我们做了解析，并且在解构时也会有提示

![image-20221025002225318](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210250022354.png!blog.guiyexing)

如果全盘导入的话，在打包到生产环境时， rollup默认会认为当前这个testJSON里面的所有字段全部都是要用到的

类似在平时的开发中

```
import _ from 'lodash'
_.sortBy()
```

无论是vite还是webpack，在构建生产环境的时候，看到这样的导入，默认认为lodash里面的所有方法都要用，没法进行**摇树优化**

**可以这样理解：**这个对象我都用到了, 那么打包工具敢删除对象里面的成员吗？？

tree shaking 摇树优化: 打包工具会自动帮你移除掉那些你没有用到的变量或者方法

所以如果生产环境非常的臃肿和性能差，可以考虑的一个点就是**控制导入**

## 加载SVG

svg: scalable vector graphics 可伸缩矢量图形

传统图片格式: jpg, jpeg...

1. svg是不会失真的
2. 尺寸小

缺点： 没法很好的去表示层次丰富的图片信息

我们在前端领域里更多的是用svg 去做图标

加载svg方案一：

```js title="main.js"
import './src/svgLoader'
```

```js title="svgLoader.js"
import svgIcon from "./assets/svgs/bear.svg";
const img = document.createElement("img");
img.src = svgIcon;
document.body.appendChild(img);
```

![image-20221025130412847](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210251304573.png!blog.guiyexing)

这种方式有个缺陷，比如要改变他的样式，hover上去后改变他的颜色，这样是没有办法做到的，可能需要两张图片，hover上去后展示另一种配色图片，比较麻烦

方案二：

在路径后加参数`?raw`，默认的参数是`?url`，加上参数后打印的raw就是svg文件的字符串

```js
import svgRaw from "./assets/svgs/bear.svg?raw";
document.body.innerHTML = svgRaw;
console.log(svgRaw);

const svgElement = document.getElementsByTagName("svg")[0];
svgElement.onmouseenter = function() {
    // 不是去改他的background也不是color
    // 而是fill属性
    this.style.fill = "green";
}
```

这里同时设置了在鼠标件在鼠标指针移动到元素上时触发改变颜色

![image-20221025210611001](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210252106041.png!blog.guiyexing)

## vite在生产环境对静态资源的处理

打包后的静态资源为什么要有hash？

浏览器是有一个缓存机制，静态资源名字没有变化，在发送请求的时候就会直接读取缓存

hash算法：将一串字符串经过运算得到一个新的乱码字符串，字符串不变得到的新的值也不变。

利用好hash算法可以让我们更好的去控制浏览器的缓存机制

配置vite使用rollup的构建策略

```js
build: { // 构建生产包时的一些配置策略
  rollupOptions: { // 配置rollup的一些构建策略
      output: { // 控制输出
          // 在rollup里面, hash代表将你的文件名和文件内容进行组合计算得来的结果
          assetFileNames: "[hash].[name].[ext]"
      }
  },
  assetsInlineLimit: 4096, // 默认4kb，如果小于4kb的话就把图片编译成base64
  outDir: "build", // 配置输出目录
  assetsDir: "static", // 配置输出目录中的静态资源目录
  emptyOutDir: true, // 清除输出目录中的所有文件
}
```
