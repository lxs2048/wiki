---
sidebar_position: 0

---

# part 1

## 数据的键类型

```js
let arr = []
arr[0] = 1
arr['0'] = 2
console.log(arr[0]+arr['0'])
```

js中数组的本质就是对象，结果为4

## 为什么a元素的颜色不会继承父元素

```html
<style>
    .container{
        color:red;
    }
</style>

<div class="container">
    <p>红色文件</p>
    <a href="">不是红色</a>
</div>

```

![image-20220717141119221](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181820826.png!blog.guiyexing)

当一个元素没有相关样式时，才需要从父元素去继承

## span为什么是行内元素

div，p元素是块级的原因是因为浏览器默认样式表里面设置了一个`display:block`

span，a元素是行级的原因是因为浏览器默认样式表里面没有设置display，如果没有设置，默认就是行`inline`

以上就是有的元素是块级有的是行级的根本原因，完全取决于浏览器的默认样式表里面是否设置了display，html5中摒弃了行级和块级说法，一个元素是行还是块`完全取决于css中的display属性`

p元素默认样式表*user agent stylesheet*如下

![image-20220717142047289](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181820829.png!blog.guiyexing)

## 为什么浮动的行内元素可以设置宽高

行级元素不能设置宽高

如果设置了浮动，或其他定位，就会自动把display设置为block，就可以设置宽高了，且手动设置`display:inline`也是无效的

![image-20220717142926750](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181820830.png!blog.guiyexing)

## 你会使用多少种方式画三角形

```html
<style>
    .container{
        width:0px;
        height: 0px;
        border: 50px solid;
        border-color: transparent transparent green transparent;
    }
</style>
<div class="container">
</div>
```

![image-20220717143528785](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181820831.png!blog.guiyexing)

除了边框外，还可以使用svg，canvas，裁剪等方式

## 如何保持宽高比例

```html
<style>
    .container{
        width: 50%;
        box-sizing: border-box;
        background-color: aquamarine;
        padding: 20px 30px;
    }
    .inner{
        width: 100%;
        /* 如何让高度为宽度的75% */
        height: 200px;
        background-color: bisque;
    }
</style>
<div class="container">
    <div class="inner"></div>
    <p>这是一些文字</p>
</div>
```

只需要将固定的`height: 200px;`替换为`padding-top: 75%;`或`padding-bottom: 75%;`

任何一个方向的内边距，只要设置百分比，一定是相对于父元素的内容宽度

![image-20220717145930742](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181820841.png!blog.guiyexing)

## 图片尺寸的问题

https://developer.mozilla.org/zh-CN/docs/Web/CSS/object-fit

```html
<style>
img{
    width: 150px;
    height: 150px;
    border: 3px solid seagreen;
}
.fill {object-fit: fill;}
.contain {object-fit: contain;}
.cover {object-fit: cover;}
.none {object-fit: none;}
</style>
<img class="fill" src="./a.jpeg" alt="">
<img class="fill" src="./b.jpeg" alt=""><span>fill</span><br/>
<img class="contain" src="./a.jpeg" alt="">
<img class="contain" src="./b.jpeg" alt=""><span>contain</span><br/>
<img class="cover" src="./a.jpeg" alt="">
<img class="cover" src="./b.jpeg" alt=""><span>cover</span><br/>
<img class="none" src="./a.jpeg" alt="">
<img class="none" src="./b.jpeg" alt=""><span>none</span>
```

![image-20220717152031467](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181820846.png!blog.guiyexing)

## 浮动的经典问题

```html
.item{
    width: 200px;
    height: 200px;
    margin-right: 20px;
    float: left;
    background-color: aquamarine;
}
</style>
<div>
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
</div>
<div class="main">
    舜发于畎亩之中，傅说举于版筑之间，胶鬲举于鱼盐之中，管夷吾举于士，孙叔敖举于海，百里奚举于市。故天将降大任于是人也，必先苦其心志，劳其筋骨，饿其体肤，空乏其身，行拂乱其所为，所以动心忍性，曾益其所不能。人恒过，然后能改，困于心，衡于虑，而后作；征于色，发于声，而后喻。入则无法家拂士，出则无敌国外患者，国恒亡，然后知生于忧患而死于安乐也。
</div>
```

为什么main这个div的文字表现如下：

![image-20220717153321010](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181820564.png!blog.guiyexing)

item元素浮动后导致container的高度塌陷，main依次在后排列

而css中有个规则是文字排列的时候要避开浮动元素

那么这个问题就转换为了当子元素皆浮动，如何撑开父元素

一、在子元素后面补充同级的空元素，并定义清除浮动样式

```html
<style>
...
// highlight-start
.clearfix{
    clear: both;
}
// highlight-end
</style>
<div class="container">
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
    // highlight-start
    <div class="clearfix"></div>
    // highlight-end
</div>
```

二、触发BFC机制，该机制不会让子元素和父元素重叠

```css
.container{
    overflow:hidden;
}
```

**块格式化上下文（Block Formatting Context，BFC）** 是 Web 页面的可视 CSS 渲染的一部分，是块级盒子的布局过程发生的区域，也是浮动元素与其他元素交互的区域。[参考](https://developer.mozilla.org/zh-CN/docs/Web/Guide/CSS/Block_formatting_context)

## 如何把网页变成黑白

使用css的filter属性，设置全部或者某个区域使用灰度放大器grayscale,设置区域为0-1

```css
filter:grayscale(1);
```

![image-20220717154638376](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181820569.png!blog.guiyexing)

## 什么是containing block

[布局和包含块](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Containing_block)

> 包含块就是这个元素最近的祖先[块元素](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Block-level_elements)的[内容区](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Box_Model/Introduction_to_the_CSS_box_model#content-area)，但也不是总是这样。确定一个元素的包含块的过程完全依赖于这个元素的 [`position`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/position) 属性

可以理解为一个元素的参考系
