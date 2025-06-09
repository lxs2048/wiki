# vite-aliases

插件是什么？

> vite会在生命周期的不同阶段中去调用不同的插件以达到不同的目的

插件学习由简入繁

社区插件：https://github.com/vitejs/awesome-vite#plugins

## 自动别名测试

[vite-aliases](https://github.com/subwaytime/vite-aliases) - Alias auto-generation based on project structure.

vite-aliases可以帮助我们自动生成别名: **检测你当前目录下包括src在内的所有文件夹, 并帮助我们去生成别名**

我们在`test-vite`进行一些测试

首先我们停止使用上文`resolve.alias`配置

![image-20221029180508369](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210291805523.png!blog.guiyexing)

接下来我们安装插件`vite-aliases`

```
npm i vite-aliases@0.9.2 -D
```

指定版本是因为当前`0.9.7`有https://github.com/Subwaytime/vite-aliases/issues/43错误

在`vite.config.js`中配置插件

```js
import { ViteAliases } from 'vite-aliases'

export default {
	plugins: [
		ViteAliases()
	]
};
```

配置好以后，将自定生成以下配置

![image-20221029183748080](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210291837117.png!blog.guiyexing)

然后我们在项目里面就可以直接使用了。

详细配置：https://github.com/Subwaytime/vite-aliases#configuration

## 手写vite-aliases

插件API：https://cn.vitejs.dev/guide/api-plugin.html

整个插件就是在vite的生命周期的不同阶段去做不同的事情

通用钩子：vite在开发环境用自己的一套方案，在构建生产包的时候用的是Rollup，Rollup本身有自己的生命周期，vite起了同名的生命周期，所有这些生命周期在Vite和Rollup中都会被调用

我们思路是**抢在vite执行配置文件之前去改写配置文件，去生成resolve.alias配置**

![image-20221029193925083](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210291939117.png!blog.guiyexing)

通过vite.config.js 返回出去的配置对象以及我们在插件的config生命周期中返回的对象都不是最终的一个配置对象，**vite会把这几个配置对象进行一个merge合并**

接下来我们开始写插件

核心逻辑是读src下的所有目录，建立别名的映射关系，然后把配置返回，默认为src增加了别名

```js title="plugins/MyViteAliases.js"
// vite的插件必须返回给vite一个配置对象
const fs = require("fs");
const path = require("path");

// 区分文件夹与文件
function diffDirAndFile(dirFilesArr = [], basePath = "") {
    const result = {
        dirs: [],
        files: []
    }
    dirFilesArr.forEach(name => {
        // 我直接用异步的方式去写的
        const currentFileStat = fs.statSync(path.resolve(__dirname, basePath + "/" + name));
        const isDirectory = currentFileStat.isDirectory();

        if (isDirectory) {
            result.dirs.push(name);
        } else {
            result.files.push(name);
        }

    })

    return result;
}
// 返回别名与路径的映射对象
function getTotalSrcDir(keyName) {
    const result = fs.readdirSync(path.resolve(__dirname, "../src"));
    const diffResult = diffDirAndFile(result, "../src");
    const resolveAliasesObj = {
        [keyName]:path.resolve(__dirname, "../src")
    }; // 放的就是一个一个的别名配置 @assets: xxx
    diffResult.dirs.forEach(dirName => {
        const key = `${keyName}${dirName}`;
        const absPath = path.resolve(__dirname, "../src" + "/" + dirName);
        resolveAliasesObj[key] = absPath;
    })
    console.log(resolveAliasesObj,'数据😎😎😎resolveAliasesObj');

    return resolveAliasesObj;
}

module.exports = ({
    keyName = "@"
} = {}) => {
    return {
        config(config, env) {
            // console.log(config,env,'数据😎😎😎config,env');
            // config: 目前的一个配置对象;env: {mode: string, command: string, ssrBuild:Boolean}
            return {
                // 在这我们要返回一个resolve出去, 将src及目录下的所有文件夹进行别名控制
                resolve: {
                    alias: getTotalSrcDir(keyName)
                }
            };
        }
    }
}
```

在vite配置我们自己的插件

```js
import MyViteAliases from "./plugins/MyViteAliases"

export default {
	plugins: [
		MyViteAliases()
	]
};
```

![image-20221029200710639](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210292007667.png!blog.guiyexing)

这样就实现了一个粗糙的插件来自动生成别名
