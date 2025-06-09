# vite环境变量配置

## 环境变量

环境变量: **会根据当前的代码环境产生值的变化的变量就叫做环境变量**

**代码环境:**
1. 开发环境
2. 测试环境
3. 预发布环境
4. 灰度环境
5. 生产环境

举两个🌰:

* 百度地图sdk测试环境和生产还有开发环境用不同的key（我们去请求第三方sdk接口的时候需要带上的一个身份信息）

* 我们在和后端同学对接的时候, 前端在开发环境中请求的后端API地址和生产环境的后端API前缀不一致

**在vite中的环境变量处理：**

vite内置了`dotenv`这个第三方库，dotenv会自动读取.env文件, 并解析这个文件中的对应环境变量并将其注入到process对象下(但是vite考虑到和其他配置的一些冲突问题, 他不会直接注入到process对象下)

涉及到vite.config.js中的一些配置:
- root
- envDir: 用来配置当前环境变量的文件地址

vite给我们提供了一些补偿措施：我们可以调用vite的loadEnv来手动确认env文件

## 测试配置

我们在项目的根目录创建`.env`配置文件

```
HELLO = hello
```

在`vite.config.js`中获取env

```js title='vite.config.js' {2}
export default defineConfig(({command})=>{
    console.log(process.env)
    return envResolver[command]()
})
```

使用命令`yarn dev`启动后，打印中并没有`HELLO`这个环境变量，调用vite的loadEnv来手动确认env文件

```js title='vite.config.js' {2-6}
export default defineConfig(({command,mode})=>{
    // loadEnv(mode: string, envDir: string, prefixes?: string | string[] | undefined): Record<string, string>
    // 第三个为前缀，为空表示所有的
  	// process.cwd方法: 返回当前node进程的工作目录
    const env = loadEnv(mode,process.cwd(),'')
    console.log(mode,env)
    return envResolver[command]()
})
```

这样就可以在配置里读到环境变量，也就是可以在Node环境中读到环境变量，同时还可以读取到`.env.development`中的环境变量，因为mode在启动项目时默认是development

**拓展：**

`.env`: 所有环境都需要用到的环境变量

`.env.development`: 开发环境需要用到的环境变量(默认情况下vite将我们的开发环境取名为development)

`.env.production`: 生产环境需要用到的环境变量(默认情况下vite将我们的生产环境取名为production)

**我们可以自定义启动模式：**

`yarn dev --mode development` 会将mode设置为development传递进来

当我们调用loadenv的时候, 他会做如下几件事:
1. 直接找到.env解析其中的环境变量放进一个对象里
2. 然后将传进来的mode这个变量的值进行拼接: ```.env.development```,  并根据我们提供的目录去取对应的配置文件并进行解析拼接到该对象

## 创建其他类型配置

**假如我们要创建一个测试环境的配置：**

我们可以创建一个`.env.test`文件

使用`yarn dev --mode test`启动项目，则会自动匹配到`.env.test`文件，并获取到其内部的配置，此时的mode就是test

## 客户端获取环境变量

vite会将对应的环境变量注入到`import.meta.env`下

但是vite做了一个拦截, 为了防止我们将隐私性的变量直接送进`import.meta.env`中, 所以他做了一层拦截, 默认如果你的环境变量不是以VITE开头的, 他就不会帮你注入到客户端中去, 如果我们想要更改这个前缀, 可以去使用envPrefix配置

`.env.test`配置如下

```
VITE_TEST = test
ABC_HI = hi
```

```js title="main.js"
console.log(import.meta.env); //打印了VITE前缀的配置
```

![image-20221023141537172](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210231415226.png!blog.guiyexing)

更改配置：

```js
/**
 * @type import("vite").UserConfig
 */
const viteBaseConfig = {
    envPrefix:"ABC_"
}
export default viteBaseConfig
```

![image-20221026215830065](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210262158095.png!blog.guiyexing)

补充一个小知识:

为什么vite.config.js可以书写成esmodule的形式?

这是因为vite他在读取这个vite.config.js的时候会率先去解析文件语法, 如果发现你是esmodule规范会直接将你的esmodule规范进行替换变成commonjs规范

