---
slug: ali-oss
title: node使用阿里oss
authors: [dolphin]
tags: [node-server,ali-oss]
date: 2022-09-28T18:57
---

当前的文档中有一些图片资源做了调整，有一些无用的图片，想着从blogImg中删掉，考虑到可能失误，所以决定将其移动到垃圾文件夹暂存

<!--truncate-->

阿里对象存储OSS：https://help.aliyun.com/document_detail/32067.html

没有直接移动的API，所以可以使用先复制后删除的原理

```js title="src/ali-oss/index.js"
import OSS from 'ali-oss'
import path from 'path'
import dotenv from 'dotenv'
dotenv.config(path.join(process.cwd(),'.env'));//根目录执行该文件
let client = new OSS({
    // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
    region: 'oss-cn-qingdao',
    // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
    accessKeyId: process.env.accessKeyId,
    accessKeySecret: process.env.accessKeySecret,
    bucket: 'blog-guiyexing'
});

const FROMDIR = "blogImg/"
const RECEPTIONDIR = "wastebasket/"
const handleLists = ['202208181914010.png','202208181914011.png','202208181914012.png']

// 备份文件
async function backupFile(name, options = {}) {
    try {
        await client.head(FROMDIR+name, options); // 文件是否存在
        await client.copy(RECEPTIONDIR+name,FROMDIR+name); // 拷贝文件
        await client.delete(FROMDIR+name); // 删除原文件
        console.log('success');
    } catch (error) {
        console.log('fail:',error.code);
    }
}
// 用于判断未开启版本控制状态的Bucket中的Object是否存在。
// yourObjectName填写不包含Bucket名称在内的Object的完整路径，例如example/test.txt。
for(let i=0;i<handleLists.length;i++){
    backupFile(handleLists[i])
}
```

`accessKeyId`与`accessKeySecret`使用环境变量来保存

```shell
node src/ali-oss/index.js
```

后续优化方案：通过前端界面输入要删除的文件
