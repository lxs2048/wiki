# vite和ts的结合

## 使用ts

我们基于`vite-test`，直接把`main.js`改为`main.ts`就可以直接使用ts语法了，并且结合编辑器的提示，进行类型检查

![image-20221031215518611](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210312155653.png!blog.guiyexing)

然而我们还是可以正确看到控制台的打印

![image-20221031215650900](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210312156927.png!blog.guiyexing)

## 错误提示

我们希望这种错误可以提示出来，所以安装插件`vite-plugin-checker`

根据[vite-plugin-checker](https://vite-plugin-checker.netlify.app/introduction/getting-started.html)给出的提示完成前两步，启动项目，这时会发现缺少`tsconfig.json`

```json title="tsconfig.json"
{
    "compilerOptions": {
        "skipLibCheck": true,//跳过node_module目录的检查
    }
}
```

这个时候启动项目就会发现在终端显示错误日志了

![image-20221031221943198](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210312219236.png!blog.guiyexing)

在页面中也会以弹框的形式展示给开发者

![image-20221031222056771](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210312220795.png!blog.guiyexing)

官网给出了解释为什么不引入checker，vite不给我们报错的原因

![image-20221031222708747](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210312227770.png!blog.guiyexing)

## 生产检查

我们修改build的script命令

```js
"build": "tsc --noEmit && vite build"
```

这样在打包的前检查到了语法错误，就不会执行打包构建工作了

## 声明文件

我们在使用环境变量的时候会给错误提示

![image-20221031223650017](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210312236042.png!blog.guiyexing)

`import.meta`只能在高级的js语法中出现，所以我们修改ts配置

```json
compilerOptions.module: "ESNext"
```

错误消失，然后我们使用`.env`就又会提示错误

![image-20221031224148221](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210312241257.png!blog.guiyexing)

我们就需要了解**声明文件**

新建一个叫`vite-env.d.ts`的文件，vite暴露出一个客户端相关的类型`vite/client`，以下使用三斜线指令，就相当于`import vite/client`

```ts title="vite-env.d.ts"
/// <reference types="vite/client" />
```

![image-20221031224720507](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210312247538.png!blog.guiyexing)

然后我们继续向下读我们的配置文件，发现并没有我们写好的配置

![image-20221031224911637](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210312249671.png!blog.guiyexing)

我们写一个接口暴露给vite，最终vite是要读这个默认文件的，发现有这个文件后，会把`ImportMetaEnv`与默认的类型进行合并

```ts title="vite-env.d.ts"
interface ImportMetaEnv {
    readonly ABC_HI:string
}
```

![image-20221031225251791](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210312252822.png!blog.guiyexing)

因为我在配置里写的是匹配`ABC_`为前缀，所以显示的不是默认`VITE_`

补充：

为什么我们在vite.config.js里可以使用esmodule:

主要是因为vite在读取配置文件并执行的前一刻会进行替换

## 模块解析方案

现在vite也是ts不知道你的模块解析方案是什么，所以在`main.ts`导入第三方包的时候会给出如下提示：

![image-20221101221327496](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211012213538.png!blog.guiyexing)

提示我们把`compilerOptions.moduleResolution`设置为`node`，配置模块解析方案为node，就会去`node_modules`里面去找了，找到就不会有错误提示了

然后这个时候会提示我们没有声明文件

![image-20221101222054062](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211012220095.png!blog.guiyexing)

假设我们在安装某个库以后没有ts的类型声明，所以可以需要根据提示去安装包

```
npm i --save-dev @types/lodash
```

后续导包也会有提示

![image-20221101222536975](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211012225010.png!blog.guiyexing)