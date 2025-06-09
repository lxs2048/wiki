# vite 配置文件

配置文件`vite.config.js`

## 语法提示

配置方式一：

defineConfig的入参出参都是UserConfigExport，利用TS的提示

```js
import { defineConfig } from "vite"
export default defineConfig({
    optimizeDeps:[]
})
```

![image-20221022160927398](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210221609427.png!blog.guiyexing)

配置方式二：

类型标注方式

```js
/**
 * @type import("vite").UserConfig
 */
const viteConfig = {
    optimizeDeps:[],
}
export default viteConfig
```

平时在写函数标记的时候，使用标准的注释风格，如下在知道返回值是string类型时，后续就会有该类型的方法提示

![image-20221022161855554](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210221618584.png!blog.guiyexing)

## 环境处理

过去我们使用webpack的时候, 我们要区分配置文件的一个环境

- webpack.base.config
- webpack.dev.config
- webpack.prod.config

基于公共配置通过webpack-merge合并到开发或者生产环境

vite可以做类似配置：

根目录新增三个配置文件

```js title="vite.base.config.js"
/**
 * @type import("vite").UserConfig
 */
const viteBaseConfig = {}
export default viteBaseConfig
```

```js title="vite.dev.config.js"
/**
 * @type import("vite").UserConfig
 */
const viteDevConfig = {}
export default viteDevConfig
```

```js title="vite.prod.config.js"
/**
 * @type import("vite").UserConfig
 */
const viteProdConfig = {}
export default viteProdConfig
```

配置`vite.config.js`

```js title="vite.config.js" {6-16}
import { defineConfig } from "vite"
import viteBaseConfig from "./vite.base.config"
import viteDevConfig from './vite.base.config'
import viteProdConfig from './vite.base.config'

// 策略模式
const envResolver = {
    "build":()=>{
        console.log('生产环境')
        return {...viteBaseConfig,...viteProdConfig}
    },
    "serve":()=>{
        console.log('开发环境')
        return Object.assign({},viteBaseConfig,viteDevConfig)
    }
}

export default defineConfig(({command})=>{
    return envResolver[command]()
    // if(command === 'serve'){
    //     // 开发模式
    // }else{
    //     // build：生产环境
    // }
})
```

测试结果如下：

![image-20221022164247042](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210221642076.png!blog.guiyexing)