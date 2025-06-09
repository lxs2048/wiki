---
slug: MouseEventHandler
title: 可拉伸侧边栏
authors: [dolphin]
tags: [component_templates,MouseEventHandler,可拉伸侧边栏]
date: 2022-09-03T22:18
---

核心原理

1. 整体布局相对侧边栏绝对定位，侧边栏的宽度与内容区域的paddingLeft使用同一变量控制、
2. 侧边栏右侧添加一个透明的竖条，用于控制用户拖拽（捕获鼠标按下去的动作）
3. 用户按下去以后记录距离屏幕左侧的位置，和启动拖拽状态(显示全屏的遮罩监听鼠标移动)
4. 鼠标在遮罩上移动->计算并设置当前的宽度，同时更新开始位置
5. 当鼠标抬起时，关闭拖拽状态，并且将值记录到localStorage

补充：容易联想到可以有一个图标点击之后直接设置宽度为预设的两种状态

<!--truncate-->

使用material改造Layout

```tsx
import React from "react";
import { Outlet, Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { styled } from "@mui/system";
import { teal } from "@mui/material/colors";
const defaultWidth = {
  minW: 100,
  maxW: 300
}
type mouseEventHandler = React.MouseEventHandler<HTMLDivElement>
/**
 * 自定义layout，可控制是否展示sider与header=》?hideSider=true&hideHeader=true
 * @export
 * @return {*}
 */
const Layout = (): any => {
  const [siderWidth, setSiderWidth] = useState(
    parseInt(localStorage.getItem("siderWidth") || '150')
  );
  const [dragging, setDragging] = useState(false);
  const [startPageX, setStartPageX] = useState(0);

  // 解析路由，设置隐藏
  let [params] = useSearchParams();
  const hideHeader = params.get("hideHeader") === 'true';//隐藏header
  const hideSider = params.get("hideSider") === 'true';//隐藏侧边栏

  // 拖动事件开始
  const handleMouseDown: mouseEventHandler = (event) => {
    setStartPageX(event.pageX);
    setDragging(true);
  };
  const handleMouseMove: mouseEventHandler = (event) => {
    const currentSiderWidth = siderWidth + event.pageX - startPageX;
    if (currentSiderWidth > defaultWidth.maxW || currentSiderWidth < defaultWidth.minW) return;
    setSiderWidth(currentSiderWidth);
    setStartPageX(event.pageX);
  };
  const handleMouseUp = () => {
    setDragging(false);
    localStorage.setItem("siderWidth", String(siderWidth));
  };
  // 拖动事件结束

  return (
    <MyLayout siderWidth={siderWidth} hideSider={hideSider}>
      {!hideSider && <CustomSider siderWidth={siderWidth}>
        <div>
          <Link to="/home">home</Link><br />
          <Link to="/demo1">demo1</Link> <br />
          <Link to="/demo2">demo2</Link>
        </div>
      </CustomSider>}
      {!hideSider && <CustomSiderResizer siderWidth={siderWidth} onMouseDown={handleMouseDown}>
        {dragging && (<CustomResizeMask
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp} />
        )}
      </CustomSiderResizer>}
      <CustomContainer>
        {!hideHeader && <CustomHeader>header</CustomHeader>}
        <CustomContent hideHeader={hideHeader}>
          <Outlet />
        </CustomContent>
      </CustomContainer>
    </MyLayout>
  );
}
export default Layout

const MyLayout = styled('div')(({ siderWidth, hideSider }: { siderWidth: number, hideSider: boolean }) => ({
  position: 'relative',
  height: '100vh',
  width: '100%',
  boxSizing: 'border-box',
  paddingLeft: hideSider ? '0px' : `${siderWidth}px`
}))

const CustomSider = styled('div')(({ siderWidth }: { siderWidth: number }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  backgroundColor: teal[100],
  width: `${siderWidth}px`
}))

const CustomContainer = styled('div')({
  width: '100%',
  height: '100%',
})
const CustomHeader = styled('div')({
  backgroundColor: teal[50],
  height: '60px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
})

const CustomContent = styled('div')(({ hideHeader }: { hideHeader: boolean }) => ({
  boxSizing: 'border-box',
  backgroundColor: '#fff',
  padding: '8px',
  overflow: 'hidden',
  width: '100%',
  height: hideHeader ? '100%' : 'calc(100% - 60px)',
}))

const CustomSiderResizer = styled('div')(({ siderWidth }: { siderWidth: number }) => ({
  position: 'absolute',
  width: '4px',
  top: 0,
  bottom: 0,
  cursor: 'col-resize',
  left: `${siderWidth - 4}px`,
  backgroundColor: teal[100],
  // backgroundColor: 'transparent'
}))

const CustomResizeMask = styled('div')({
  background: 'transparent',
  position: 'fixed',
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  cursor: 'col-resize',
})
```

![image-20220905161508010](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202209051615084.png!blog.guiyexing)
