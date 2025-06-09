# css模块化

## 处理css

在`test-vite`中测试

```js title="main.js"
import './index.css'
```

```css title="index.css"
html,body{
    width: 100%;
    height: 100%;
    background-color: bisque;
}
```

1. main.js导入了main.css，浏览器请求index.css
2. vite直接去使用fs模块去读取index.css中文件内容
3. 将该css文件中的内容直接替换为js脚本(方便热更新或者css模块化), 同时设置Content-Type为`application/javascript`从而让浏览器以JS脚本的形式来执行该css后缀的文件

脚本大致内容：创建一个style标签, 将index.css中文件内容直接copy进style标签里，将style标签插入到index.html的head中

![image-20221026222709935](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210262227959.png!blog.guiyexing)

css样式覆盖场景:

- 一个组件最外层的元素类名一般取名：wrapper
- 一个组件最底层的元素类名一般取名：footer

你取了footer这个名字, 别人因为没有看过你这个组件的源代码, 也可能去取名footer这个类名，最终可能会导致样式被覆盖（因为类名重复）, 这就是我们在协同开发的时候很容易出现的问题

`css module`就是来解决这个问题的，基于node，其大致原理如下:

1. module.css (module是一种约定, 表示需要开启css模块化)
2. 在以上`vite直接去使用fs模块去读取index.css中文件内容`时，将你的所有类名进行一定规则的替换（如将footer 替换成 _footer_1o5kg_1）
3. 把样式替换成JS脚本，创建一个映射对象如`{ footer: "_footer_1o5kg_1" }`，然后将创建的映射对象在脚本中进行默认导出

## css module测试

创建两个组件，并且分别引入各自的样式

```js title="CmpA.js"
console.log('CmpA')
import './a.css'
const compA = document.createElement('div')
document.body.append(compA)
compA.className = "footer"
```

```css title="a.css"
.footer{
    width: 100px;
    height: 100px;
    margin: 10px;
    background-color: blue;
}
```

```js title="CmpB.js"
console.log('CmpB')
import "./b.css"
const compB = document.createElement('div')
document.body.append(compB)
compB.className = "footer"
```

```css title="b.css"
.footer{
    width: 100px;
    height: 100px;
    margin: 10px;
    background-color: green;
}
```

在main.js中引入这两个组件就可以挂载到页面

```js
import './CmpA.js'
import './CmpB.js'
```

这个时候我们就会发现样式被覆盖了

![image-20221023200039554](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210232000601.png!blog.guiyexing)

这个时候我们来看看使用module的效果

首先把`a.css`与`b.css`改为`a.module.css`与`b.module.css`，然后分别导入

```js
import './a.module.css';//CmpA导入

import "./b.module.css";//CmpB导入
```

![image-20221026224245702](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210262242746.png!blog.guiyexing)

我们发现css的类名改变了，组件的类名还是原先的，当我把其中的footer替换为任意被编译后的类名页面都会变成想要的样式。

所以css module要这样使用才有意义

```js
import styleA from './a.module.css'//CmpA导入
console.log(styleA)
```

我们打印看styleA的结果，这是一个映射对象，记录了原本的类名与编译后的类名

![image-20221026224819472](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210262248513.png!blog.guiyexing)

我们使用该映射关系：`compA.className = styleA.footer`，组件B同理。

![image-20221026225237550](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210262252588.png!blog.guiyexing)

这样就实现了样式的模块化