---
slug: input-pinyin
title: input拼音触发input事件
authors: [dolphin]
tags: [拼音触发input]
date: 2022-08-27T18:57
---

## 原生事件

监听文本输入框的input事件，在输入法拼写汉字但汉字并未实际填充到文本框中时会触发input事件，代码如下

<!--truncate-->

```html
<input id="txt" type="text">
<script>
    $('#txt').on('keyup',function(){
        let _this = this;
        console.log($(_this).val());
    })
</script>
<Input type="text" onChange={(e)=>{console.log(e.target.value)}} />
```

会出现如下效果:

![image-20210908164825912](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181617613.png!blog.guiyexing)

我们希望得到的效果是汉字输入进去以后再触发事件

input有两个事件：**compositionstart**和**compositionend**

 **compositionstart**：事件触发于一段文字的输入之前（类似于 keydown 事件，但是该事件仅在若干可见字符的输入之前，而这些可见字符的输入可能需要一连串的键盘操作、语音识别或者点击输入法的备选词）,可以理解为输入拼音状态开始执行的事件

**compositionend**：当文本段落的组织已经完成或取消时，会触发该事件。可以理解为输入拼音结束，按下空格将汉字输入完成以后执行的事件。

实现拼音阶段不触发预定事件的思路

1. 声明一个全局变量flag，设置为true 
2. 添加compositionstart事件，在该事件执行时将flag设置为false
3. 添加compositionend事件，在该时间执行时将flag设置为true
4. 添加onkeyup事件，在该事件执行时判断flag是否为true，如果为true，则事件触发。

代码如下：

```html
<input id="txt" type="text">
<script>
    let flag = true;
    $('#txt').on('compositionstart',function(){
        console.log('正在输入中文...')
        flag = false;
    })
    $('#txt').on('compositionend',function(){
        console.log('输入中文完成...')
        flag = true;
    })
    $('#txt').on('keyup',function(){
        let _this = this;
        if(flag){
            console.log($(_this).val());
        }
    })
</script>
```

效果图如下：

![image-20210908165616453](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181617620.png!blog.guiyexing)

![image-20210908165726582](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181617619.png!blog.guiyexing)

## react实践

```react
let isOnComposition = useRef(false)
let [searchVal,setSearchVal] = useState('')
const handleComposition = (evt) => {
  if (evt.type === 'compositionend') {
    isOnComposition.current = false
  } else {
    isOnComposition.current = true
  }
}
const handleChange = (evt)=>{
    if(!isOnComposition.current){
        setSearchVal(evt.target.value)
    }
}
<h2>{searchVal}</h2>
<Input
    type="text"
    onCompositionStart={handleComposition}
    onCompositionEnd={handleComposition}
    onChange={handleChange}
/>
```

谷歌浏览器跟其他浏览器的执行顺序不同：

> 谷歌浏览器： compositionstart -> onChange -> compositionend

> 其他浏览器： compositionstart -> compositionend -> onChange

以上代码在火狐浏览器中可以拿到预期效果，谷歌onChange先于compositionend执行，所以isOnComposition还未更新，就无法打印。

```react
const isChrome = navigator.userAgent.indexOf('Chrome') > -1
const handleComposition = (evt) => {
    if (evt.type === 'compositionend') {
        isOnComposition.current = false
        // 谷歌浏览器再次执行change事件
        if (!isOnComposition.current && isChrome) {
            handleChange(evt)
        }
    } else {
        isOnComposition.current = true
    }
}
```

![2022_08_04_22_05_57_444](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181617638.gif)
