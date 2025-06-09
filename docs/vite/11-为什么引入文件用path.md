# 为什么引入文件用path

我们创建一个测试项目在当前项目下执行js文件，使用相当路径读取文件并打印，看起来一切都好

![image-20221024230320877](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210242303910.png!blog.guiyexing)

但是当我们在其他路径执行时就会出现问题，比如我在上级目录执行就会因为找不到文件而报错

![image-20221024231229381](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210242312403.png!blog.guiyexing)

事实上，node端去读取文件或者操作文件的时候, 如果发现你用的是相对路径, 则会去使用`process.cwd()`来进行对应的拼接

process.cwd: 获取当前的node执行目录

我们打印一下看效果：

![image-20221024231418629](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210242314656.png!blog.guiyexing)

所以，在Desktop中执行时，最终会被拼接为`/Users/dolphin/Desktop/variable.css`

commonjs规范会往文件中注入几个变量如：

`__dirname`：始终返回的是当前文件所在的目录

![image-20221024231754846](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210242317873.png!blog.guiyexing)

所以我们可以做一个拼接，这样就可以在任意位置执行js文件且正确读取文件了。

![image-20221024231908439](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210242319468.png!blog.guiyexing)

然后windows的路径是`\`形式的，我们需要做兼容，所以这个时候就用到了`path`这个模块，它里面有非常多的路径字符串处理方法

![image-20221024232246694](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210242322728.png!blog.guiyexing)

如上所示，`path.resolve`帮我们做了拼接，我们不需要考虑环境的问题。

---

最后稍微拓展`commonjs模块化`

我们先引入一个模块

```js title="main.js"
const {hello} = require('./test')
console.log(hello)
```

```js title="test.js"
const hello = 'hello'
module.exports = {
    hello
}
```

这是正常的写法，然而**Node在读取到文件以后会把内容放到一个立即执行函数里面**，我们可以在`test.js`加一句`console.log(arguments)`，就会看到输出了如下数据：

```js
[Arguments] {
  '0': {},
  '1': [Function: require] {
    resolve: [Function: resolve] { paths: [Function: paths] },
    main: Module {
      id: '.',
      path: '/Users/dolphin/Desktop/test-path',
      exports: {},
      parent: null,
      filename: '/Users/dolphin/Desktop/test-path/main.js',
      loaded: false,
      children: [Array],
      paths: [Array]
    },
    extensions: [Object: null prototype] {
      '.js': [Function (anonymous)],
      '.json': [Function (anonymous)],
      '.node': [Function (anonymous)]
    },
    cache: [Object: null prototype] {
      '/Users/dolphin/Desktop/test-path/main.js': [Module],
      '/Users/dolphin/Desktop/test-path/test.js': [Module]
    }
  },
  '2': Module {
    id: '/Users/dolphin/Desktop/test-path/test.js',
    path: '/Users/dolphin/Desktop/test-path',
    exports: { hello: 'hello' },
    parent: Module {
      id: '.',
      path: '/Users/dolphin/Desktop/test-path',
      exports: {},
      parent: null,
      filename: '/Users/dolphin/Desktop/test-path/main.js',
      loaded: false,
      children: [Array],
      paths: [Array]
    },
    filename: '/Users/dolphin/Desktop/test-path/test.js',
    loaded: false,
    children: [],
    paths: [
      '/Users/dolphin/Desktop/test-path/node_modules',
      '/Users/dolphin/Desktop/node_modules',
      '/Users/dolphin/node_modules',
      '/Users/node_modules',
      '/node_modules'
    ]
  },
  '3': '/Users/dolphin/Desktop/test-path/test.js',
  '4': '/Users/dolphin/Desktop/test-path'
}
hello
```

这些就是立即执行函数传入的参数

```js
(function(exports, require, module, __filename, __dirname) {
  //传入了__dirname,所以可以直接使用不会undefined
    console.log("__dirname", __dirname);
}())
```

