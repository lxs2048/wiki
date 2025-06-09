---
slug: react-dnd
title: react-dnd实践
authors: [dolphin]
tags: [拖拽, 拖放, react-dnd]
date: 2022-08-20T10:00
---

公司使用react-dnd作为项目拖拽库，一时兴起做个简单的拖拽demo

```
npm i react-dnd react-dnd-html5-backend
```

<!--truncate-->

## react-dnd

基础代码如下

```js
import { useEffect, useState } from "react";
import { styled } from '@mui/system';
const initData = [
    { id: 1, text: "text1" },
    { id: 2, text: "text2" },
    { id: 3, text: "text3" },
    { id: 4, text: "text4" }
]
interface CardItem {
    id: number,
    text: string
}
interface CardProps {
    cardItemData: CardItem
}

const MyDnd = () => {
    let [source, setSource] = useState<CardItem[]>([]);
    useEffect(() => {
        setTimeout(() => {
            setSource(initData)
        }, 10)
    }, [])
    return (
        <>
            {source.map((item) => {
                return <Card key={item.id} cardItemData={item} />;
            })}
        </>
    );

};
export default MyDnd;


const Card = (props: CardProps) => {
    const { cardItemData } = props;
    return <CatdItem>{cardItemData.text}</CatdItem>;
};

const CatdItem = styled('div')({
    backgroundColor: 'coral',
    color: '#fff',
    width: '300px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '5px 0px',
    cursor: 'move',
})
```

![image-20220730215212530](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181623976.png!blog.guiyexing)

一、DndProvider

使用DndProvider组件包裹我们的组件

```js {1-2,11,15}
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
const MyDnd = () => {
    let [source,setSource] = useState<CardItem[]>([]);
    useEffect(()=>{
        setTimeout(()=>{
            setSource(initData)
        },10)
    },[])
    return (
        <DndProvider backend={HTML5Backend}>
            {source.map((item) => {
                return <Card key={item.id} cardItemData={item} />;
            })}
        </DndProvider>
    );

};
export default MyDnd;
```

DndProvider组件为应用程序提供React Dnd的功能，使用时**必须**通过backend属性注入一个后端

**后端抽象出浏览器差异并处理原生DOM事件,并将DOM事件转换为React DnD 可以处理的内部Redux操作**

`react-dnd-html5-backend`使用HTML5拖放API，不支持触摸事件，不适用移动设备，可使用`react-dnd-touch-backend`

二、useDrag

拖拽分两步拖动和放置

* 当我们在屏幕上拖动某物的时候，并不是在拖一个DOM节点，而是说某种类型(type)的项目(item)
* 这个项目就是一个js对象，用来描述被拖动的内容
* 每个项目都会有一个type类型，类型可以是字符串或者是Symbol,可以唯一的标识某个项目的类型
* 拖放源很多，放置目标也很多，只有type相同时才能将拖放源放置到对应的accept目标

useDrag对应项目拖动源DragSource

使用useDrag拖动项目

```js {1-2,5-19,21,24,34}
import { useEffect, useState, useRef } from "react";
import { DndProvider, useDrag } from "react-dnd";
const Card = (props: CardProps) => {
    const { cardItemData } = props;
    const dragRef = useRef(null);
    // useDrag hook提供一种将组件作为拖拽源连接到React Dnd系统的方法
    // DragSource Ref 拖动源的连接器，连接真实DOM和React Dnd系统
    let [collectedProps, drag] = useDrag({
        type: "custom-card",
        // item:用于描述拖动源的普通JS对象
        item: () => ({ ...cardItemData }),
        // collect:收集属性,返回一个JS对象，返回的值会合并到组件属性中
        // monitor里面存放的是一些拖动的状态，当拖动状态发生变化时通知组件重新获取属性并进行刷新组件
        collect: (monitor) => ({
            isDragging: monitor.isDragging() //项目是否正在被拖拽的状态
        })
    });
    drag(dragRef);
    return <CatdItem isDragging={collectedProps.isDragging} ref={dragRef}>
        {cardItemData.text}
    </CatdItem>
};

const CatdItem = styled('div')(({ isDragging }: { isDragging: boolean }) => ({
    backgroundColor: 'coral',
    color: '#fff',
    width: '300px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '5px 0px',
    cursor: 'move',
    opacity: `${isDragging ? 0.1 : 1}`,
}))
```

拖动项目后原项目的透明度变成0.1但是还不能放到某位置进行交互

三、useDrop

useDrop对应的项目叫放置目标DropTarget

```js {3,16-18,28-34,37-38,48,55,63-85}
import { useEffect, useState, useRef } from "react";
import { styled } from '@mui/system';
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
const initData = [
    { id: 1, text: "text1" },
    { id: 2, text: "text2" },
    { id: 3, text: "text3" },
    { id: 4, text: "text4" }
]
interface CardItem {
    id: number,
    text: string
}
interface CardProps {
    cardItemData: CardItem,
    index: number,
    moveCard: (dragIndex: number, hoverIndex: number) => void
}

const MyDnd = () => {
    let [source, setSource] = useState<CardItem[]>([]);
    useEffect(() => {
        setTimeout(() => {
            setSource(initData)
        }, 10)
    }, [])
    const moveCard = (dragIndex: number, hoverIndex: number) => {
        const dragCard = source[dragIndex];
        let cloneSouce = [...source];
        cloneSouce.splice(dragIndex, 1);
        cloneSouce.splice(hoverIndex, 0, dragCard);
        setSource(cloneSouce);
    };
    return (
        <DndProvider backend={HTML5Backend}>
            {source.map((item, index) => {
                return <Card key={item.id} cardItemData={item} index={index} moveCard={moveCard} />;
            })}
        </DndProvider>
    );

};
export default MyDnd;


const Card = (props: CardProps) => {
    const { cardItemData, index, moveCard } = props;
    const dragRef = useRef(null);
    // useDrag hook提供一种将组件作为拖拽源连接到React Dnd系统的方法
    // DragSource Ref 拖动源的连接器，连接真实DOM和React Dnd系统
    let [collectedProps, drag] = useDrag({
        type: "custom-card",
        // item:用于描述拖动源的普通JS对象
        item: () => ({ ...cardItemData, index }),
        // collect:收集属性,返回一个JS对象，返回的值会合并到组件属性中
        // monitor里面存放的是一些拖动的状态，当拖动状态发生变化时通知组件重新获取属性并进行刷新组件
        collect: (monitor) => ({
            isDragging: monitor.isDragging() //项目是否正在被拖拽的状态
        })
    });
    drag(dragRef);
    let [, drop] = useDrop({
        // 一个字符串，这个放置目标只会对指定类型的拖动源发生反映
        accept: "custom-card",
        collect: () => ({}),
        // 其他拖动源拖动到该项目上触发hover事件，item是拖动源的item返回的内容
        hover(item: { id: number, text: string, index: number }, monitor) {
            const dragIndex = item.index; //拖动的卡片的索引
            const hoverIndex = index; //当前hover的索引
            if (dragIndex === hoverIndex) return; //当前项目hover到当前项目
            const { top, bottom } = dragRef.current.getBoundingClientRect();
            const halfOfHoverHeight = (bottom - top) / 2; //当前项目高度的一半值
            const { y } = monitor.getClientOffset(); //event.clientY,当前鼠标的纵坐标
            const isUpOfHalfArea = y - top < halfOfHoverHeight; //拖拽到中心线的上方
            if (
                (dragIndex < hoverIndex && !isUpOfHalfArea) ||
                (dragIndex > hoverIndex && isUpOfHalfArea)
            ) {
                moveCard(dragIndex, hoverIndex);//更新数据
                item.index = hoverIndex;//替换当前拖动元素的index
            }
        }
    });
    drop(dragRef);
    return <CatdItem isDragging={collectedProps.isDragging} ref={dragRef}>
        {cardItemData.text}
    </CatdItem>
};

const CatdItem = styled('div')(({ isDragging }: { isDragging: boolean }) => ({
    backgroundColor: 'coral',
    color: '#fff',
    width: '300px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '5px 0px',
    cursor: 'move',
    opacity: `${isDragging ? 0.1 : 1}`,
}))
```

最终效果如下：

![2022_07_30_21_57_36_90](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181623982.gif)

## 原生

参考：[菜鸟](https://www.runoob.com/html/html5-draganddrop.html)

draggable使元素可拖动

拖动事件ondragstart，函数里使用e.dataTransfer.setData() 设置类型和值

drop事件的默认行为是以链接形式打开，ondragover内阻止默认行为 event.preventDefault() 来避免浏览器对数据的默认处理

进行放置使用ondrop，通过ev.dataTransfer.getData();获取对应类型的值

拖动位置的一般在ondragover内处理逻辑，生成的一般在ondrop里处理

```html
<body>
    <div ondragover="dragover(event)" ondrop="dropEnd(event)">
        hello
    </div>
    <div draggable="true" ondragstart="dragStart(event)">
        world
    </div>
    <script>
        function dropEnd(e){
            e.preventDefault();
            const data = JSON.parse(e.dataTransfer.getData('text/plain'))
            console.dir(data)
        }
        function dragStart(e){
            e.dataTransfer.setData("text/plain", JSON.stringify({a:1}))
        }
        function dragover(e){
            e.preventDefault()
        }

    </script>
</body>
```

## 案例

github参考案例：https://github.com/AdolescentJou/react-dnd-demo

重点：自定义预览，如在批量和单个拖拽的时候，自定义设置不同的样式（如：单个的时候展示多个的数据，多个的时候展示叠加的卡片，最上层展示第一个，右上角标记有几个），目前这个仓库还没有实现，不过组合一下还是可以实现的

![image-20230323102937681](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202303231029800.png!blog.guiyexing)