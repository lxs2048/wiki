---
slug: strange-record
title: 杂记
authors: [dolphin]
date: 2022-11-13T11:15
---

## 尾部省略样式

开发中见到样式，记录一下

不论文字多长结尾覆盖一部分并显示省略，如果文字很短就会看到丢失了

<!--truncate-->

![image-20221113113442557](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211131134582.png!blog.guiyexing)

抽取代码如下：

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .top {
            display: inline-block;
        }

        .in {
            text-overflow: ellipsis;
            overflow: hidden;
            display: inline-block;
            max-width: calc(100% - 12px);
            white-space: nowrap;
        }
    </style>
</head>

<body>
    <div>
        <span class="top">
            <span class="in">console.log('hello world')</span>
        </span>
        <span class="top">
            <span class="in">hi</span>
        </span>
        <span class="top">
            <span class="in">print('hello world')</span>
        </span>
    </div>
</body>

</html>
```

## 字符串true可以通过JSON.parse转化成布尔值

https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse

**`JSON.parse()`** 方法用来解析 JSON 字符串，构造由字符串描述的 JavaScript 值或对象，关于 JSON 的语法格式，请参考：[`JSON`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON)。

因为“true”是有效的json字符串，这几种值都是有效的json字符串

[值可以是双引号中的字符串、数字、true、false或null、对象或数组。这些结构可以嵌套。](https://www.json.org/json-en.html)

![image-20221113122746938](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211131227967.png!blog.guiyexing)

测试

![image-20221113183608984](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211131836021.png!blog.guiyexing)
