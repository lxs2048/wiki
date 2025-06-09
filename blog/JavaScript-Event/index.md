---
slug: JavaScript-Event
title: 事件流传播
authors: [dolphin]
tags: [事件冒泡,事件捕获,阻止默认事件,阻止事件传播]
date: 2022-08-27T14:20
---

有如下bug与需求

* 一个富文本内的图片在点击以后显示大图，其中有各种表格文字等
*  一个区域本身绑定了方法，在该区域内hover后弹出的菜单上点击后触发了绑定的方法
* ...

<!--truncate-->

以上都示例涉及到了事件传播

## 事件流的传播

通常，一个事件会从父元素开始向目标元素传播，然后它将被传播回父元素。

JavaScript 事件分为三个阶段：

- **捕获阶段**：事件从父元素开始向目标元素传播，从 `Window` 对象开始传播。
- **目标阶段**：该事件到达目标元素或开始该事件的元素。
- **冒泡阶段**：这时与捕获阶段相反，事件向父元素传播，直到 `Window` 对象。

准备案例HTML与样式

```js
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    .top {
      width: 200px;
      height: 150px;
      background-color: bisque;
      margin: 50px auto;
    }

    .inner {
      width: 80px;
      height: 80px;
      background-color: teal;
    }
  </style>
</head>

<body>
  <div class="top">
    div外部
    <div class="inner">div内部</div>
  </div>
</body>

</html>
```

![image-20220831145727043](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208311457141.png!blog.guiyexing)

## 事件捕获

事件捕获是事件传播的初始场景，从包装元素开始，一直到启动事件生命周期的目标元素。

使用 `addEventListener()` 方法的 `useCapture` 参数来注册捕捉阶段的事件。

```js
<script>
  window.addEventListener("click", () => {
    console.log('Window');
  }, true);

  document.addEventListener("click", () => {
    console.log('Document');
  }, true);

  document.querySelector(".top").addEventListener("click", () => {
    console.log('div外部');
  }, true);

  document.querySelector(".inner").addEventListener("click", () => {
    console.log('div内部');
  }, true);
</script>
```

事件处理的顺序将是 `Window`、`Document`、`div外部`、`div内部`。

![Event_buhuo](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208311459932.gif)

这里我们可以看到，事件捕获只发生在被点击的元素或目标上，该事件不会传播到子元素。

## 事件冒泡

事件冒泡将从一个子元素开始，在 DOM 树上传播，直到最上面的父元素事件被处理。

在 `addEventListener()` 中省略或将 `useCapture` 参数设置为 `false`，将注册冒泡阶段的事件，所以，事件监听器默认监听冒泡事件。

```js
<script>
  window.addEventListener("click", () => {
    console.log('Window');
  }, false);

  document.addEventListener("click", () => {
    console.log('Document');
  }, false);

  document.querySelector(".top").addEventListener("click", () => {
    console.log('div外部');
  }, false);

  document.querySelector(".inner").addEventListener("click", () => {
    console.log('div内部');
  }, false);
</script>
```

事件处理的顺序将是`div内部`、`div外部`、`Document`、 `Window`。

![Event_maopao](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208311515402.gif)

当然，我们可以使用组合的方式，比如想让Document在捕获的时候执行，其他在冒泡的时候执行，那么只需将Document的监听事件useCapture设置为true，这样在表现上Document总是优先被打印

## 防止事件传播

### preventDefault

[`Event`](https://developer.mozilla.org/zh-CN/docs/Web/API/Event) 接口的 **`preventDefault()`**方法，告诉[user agent](https://developer.mozilla.org/zh-CN/docs/Glossary/User_agent)：如果此事件没有被显式处理，它默认的动作也不应该照常执行。此事件还是继续传播，除非碰到事件侦听器调用[`stopPropagation()`](https://developer.mozilla.org/zh-CN/docs/Web/API/Event/stopPropagation) 或[`stopImmediatePropagation()`](https://developer.mozilla.org/zh-CN/docs/Web/API/Event/stopImmediatePropagation)，才停止传播。

修改div外部为a标签，当执行到这个标签绑定的click事件时，默认会先执行完所有的捕获或冒泡事件，最后执行默认的跳转

```html
<a class="top" href="/.vscode/demo.html">
    div外部
    <div class="inner">div内部</div>
</a>
```

基于以上Document事件捕获阶段执行，其他冒泡阶段执行，为`.top`绑定的事件打断点，效果如下：

![Event_preventDefault](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208311538271.gif)

阻止默认行为，[`Event.cancelable`](https://developer.mozilla.org/zh-CN/docs/Web/API/Event/cancelable) 可以检查该事件是否支持取消。为一个不支持 cancelable 的事件调用`preventDefault()`将没有效果。

```js
document.querySelector(".top").addEventListener("click", (e) => {
    if(e.cancelable){
      e.preventDefault()
    }
    console.log('div外部');
}, false);
```

**阻止默认行为后，此事件还将继续传播**

### stopPropagation

[`Event`](https://developer.mozilla.org/zh-CN/docs/Web/API/Event) 接口的 **`stopPropagation()`** 方法阻止捕获和冒泡阶段中当前事件的进一步传播。但是，它不能防止任何默认行为的发生；例如，对链接的点击仍会被处理。如果要停止这些行为，请参见 [`preventDefault()`](https://developer.mozilla.org/zh-CN/docs/Web/API/Event/preventDefault) 方法。

如为`.top`绑定的事件添加阻止传播事件

```js
document.querySelector(".top").addEventListener("click", (e) => {
    if(e.cancelable){
      e.preventDefault()
    }
    e.stopPropagation()
    console.log('div外部');
 }, false);
```

点击div内部时执行顺序为`Document`、`div内部`、`div外部`，不执行默认的跳转

当我尝试阻止捕获阶段的传播时,为了更明显修改了href地址

```js
document.addEventListener("click", (e) => {
    console.log('Document');
    e.stopPropagation()
}, true);
```

确实阻止了事件的进一步传播，没有执行后续的方法，也就意味着没有执行阻止默认行为的方法，点击完div内部后只打印`Document`，然后跳转。

stopPropagation它可以阻止事件触发后默认动作的发生。它也不能阻止附加到相同元素的相同事件类型的其它事件处理器，如果要阻止这些处理器的运行，请参见 [`stopImmediatePropagation()`](https://developer.mozilla.org/zh-CN/docs/Web/API/Event/stopImmediatePropagation) 方法。

继续为`.top`绑定点击事件

```js
document.querySelector(".top").addEventListener("click", (e) => {
    if(e.cancelable){
      e.preventDefault()
    }
    e.stopPropagation()
    console.log('div外部');
}, false);
document.querySelector(".top").addEventListener("click", () => {
    console.log('div外部1');
}, false);
document.querySelector(".top").addEventListener("click", () => {
    console.log('div外部2');
}, false);
```

点击div内部时执行顺序为`Document`、`div内部`、`div外部`，`div外部1`、`div外部2`，不执行默认的跳转

### stopImmediatePropagation

[`Event`](https://developer.mozilla.org/zh-CN/docs/Web/API/Event) 接口的 **`stopImmediatePropagation()`** 方法阻止监听同一事件的其他事件监听器被调用。

如果多个事件监听器被附加到相同元素的相同事件类型上，当此事件触发时，它们会按其被添加的顺序被调用。如果在其中一个事件监听器中执行 `stopImmediatePropagation()` ，那么剩下的事件监听器都不会被调用。

为div外部1添加阻止事件

```js
document.querySelector(".top").addEventListener("click", (e) => {
    console.log('div外部1');
    e.stopImmediatePropagation()
}, false);
```

点击div内部时执行顺序为`Document`、`div内部`、`div外部`，`div外部1`，不执行默认的跳转，`div外部2`被阻止

## 解决方法

### img自定义预览示例

事件冒泡，监听点击的子元素是否是图片

```js
import React, { useState,useMemo } from 'react';
import './assets/files.scss'
import { Modal } from 'antd';
import demoImg from './assets/abc.png'
const Files = ()=>{
    const [isShow, setIsShow] = useState('');//显示图片地址
    const [visibleImg, setVisibleImg] = useState(false);//是否显示图片
    const handleClick = (e)=>{
        if (['img', 'IMG'].includes(e.target.tagName)) {
            e.preventDefault();
            setIsShow(e.target.src)
            setVisibleImg(true)
        }
    }
    return <>
        <Modal
            visible={visibleImg}
            onOk={()=>{setVisibleImg(true)}}
            onCancel={()=>{setVisibleImg(false)}}
            footer={null}
        >
           <img style={{width:'100%'}} src={isShow} alt=""/>
        </Modal>
        <div className='img-box' onClick={(e)=>{handleClick(e)}}>
            <p>hello</p>
            <img src={demoImg} />
            <p>haha</p>
        </div>
    </>
}
export default Files;
```

```scss
.img-box{
    width: 300px;
    height: 300px;
    background-color: #d3d3d350;
    img{
        width: 100%;
    }
}
```

### 事件传播分析

* 一个区域本身绑定了方法，在该区域内hover后弹出的菜单上点击后触发了绑定的方法

该区域是一个分组，点击以后就selected该分组，分组里有很多子表单，子表单点击后也可以selected，菜单的功能是添加子表单，并selected到其上，执行了selected设置的方法，但是又执行了分组的selected方法，将两者合并更新，点击添加菜单后锁定到了分组的问题

最终的方案也就是使用`e.stopPropagation()`阻止事件进一步传播

需要注意的是antd组件绑定的事件中的Event事件可能在domEvent中

```js
<Menu.Item onClick={(e) => abc(e,item)} key={item.id}>{item?.name}</Menu.Item>
const addItemComponent = (e,item) => {
  e?.domEvent?.stopPropagation?.()
  // ...
}
```

## return false阻止？

网络上流传`return false;`会同时阻止事件冒泡也会阻止默认事件很多没有说明前提

 **jQuery 的 return false 能够阻止事件冒泡。**

**但是原生 JavaScript 的 return false 并不具备此能力。**

```js
<script src="http://libs.baidu.com/jquery/1.9.0/jquery.js"></script>
<script>
    window.onload = function () {
        $(".inner").click(function (e) {
            // e.stopPropagation()
            console.log('in')
            return false
        })
        $(".top").click(function () {
            console.log('top')
        })
    }
</script>
```
