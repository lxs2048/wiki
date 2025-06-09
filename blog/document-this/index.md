---
slug: document-this
title: js注释规范
authors: [dolphin]
tags: [document this]
date: 2022-11-07T22:57
---

注释规范参考https://zhuanlan.zhihu.com/p/37922974

<!--truncate-->

以下插件可以来做一些特殊的注释区分

![image-20221107225050210](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211072250255.png!blog.guiyexing)

接下来就看看怎么在js项目里使用注释达到简单的类型检查效果

方案一：

我们不需要任何配置，在js项目的首行加上`// @ts-check`

![image-20221107225556536](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211072255572.png!blog.guiyexing)

我们还可以使用`// @ts-ignore`忽略此错误

```js
// @ts-check
/**
 * Student Name
 * @type {string}
 */
// @ts-ignore
const studentName = 1;
```

方案二：

配置`.vscode/settings.json`

增加`"js/ts.implicitProjectConfig.checkJs":true`配置，就会对有这种多行注释的变量进行类型检查了

![image-20221107225903623](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211072259651.png!blog.guiyexing)

下面是修复后的ali-oss备份脚本

```js
import OSS from 'ali-oss'
import path from 'path'
import dotenv from 'dotenv'
dotenv.config({path:path.join(process.cwd(),'.env')});//根目录执行该文件
let client = new OSS({
    // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
    region: 'oss-cn-qingdao',
    // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
    accessKeyId: process.env.accessKeyId || '',
    accessKeySecret: process.env.accessKeySecret || '',
    bucket: 'blog-guiyexing'
});

const FROMDIR = "blogImg/"
const RECEPTIONDIR = "wastebasket/"
const handleLists = ['202211061605739.png']

/**
 * 备份文件：先拷贝文件到RECEPTIONDIR目录然后删除FROMDIR下的文件
 * @param {string} name 操作的文件名，带后缀
 */
async function backupFile(name) {
    try {
        // 操作文件要包含Bucket名称在内的Object的完整路径，例如example/test.txt。
        await client.head(FROMDIR+name); // 文件是否存在
        await client.copy(RECEPTIONDIR+name,FROMDIR+name); // 拷贝文件
        await client.delete(FROMDIR+name); // 删除原文件
        console.log('success');
    } catch (error) {
        console.log('fail:',error.code);
    }
}
/**
 * 主函数
 */
function main(){
    for(let i=0;i<handleLists.length;i++){
        backupFile(handleLists[i])
    }
}
main()
```

