---
slug: material
title: material体验
authors: [dolphin]
tags: [component_templates,material]
date: 2022-09-03T16:15
---

[mui](https://mui.com/zh/core/)核心库

[material design](https://material.io/design)介绍整个界面风格，他是一种纯粹UI设计和技术无关，该站点内的component同样是在设计层面，可以看到设计的指导思想，注重动画效果抓住用户注意力，帮助用户知道下一步该怎么做

<!--truncate-->

## 体验Button

https://mui.com/zh/material-ui/react-button

```jsx
import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

export default function BasicButtons() {
  return (
    <Stack spacing={2} direction="row">
      <Button variant="text">Text</Button>
      <Button variant="contained">Contained</Button>
      <Button variant="outlined">Outlined</Button>
    </Stack>
  );
}
```

![image-20220903113445553](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202209031134603.png!blog.guiyexing)

```jsx
<Button sx={{pr:2,pl:'20px'}} style={{color:'black'}} color="secondary" variant="contained">Contained</Button>
```

除常规属性定制样式外，支持css扩展sx：[sx-prop](https://mui.com/zh/system/getting-started/the-sx-prop/)，可以设置定量或默认尺寸的倍数

默认中等按钮的padding为8px，使用如上sx配置后，`padding-right:16px`,`padding-left:20px`

## 颜色工具

- [mui-theme-creator](https://bareynol.github.io/mui-theme-creator/)：一个帮助设计和定制 MUI 组件库主题的工具。 这其中包括基本的网站模板，并且展示各种组件以及它们如何受到主题的影响
- [Material 调色板生成器](https://material.io/inline-tools/color/)：您可以在 Material 调色板生成器中输入的任何颜色，它将帮您生成一系列的颜色组合。
- [Color Tool](https://material.io/resources/color/#!/?view.left=0&view.right=0&primary.color=9575CD)给定了不同颜色名称和色号

```js
import {red} from "@mui/material/colors"
<Button style={{color:red[600]}} variant="text">Text</Button>
```

## 定制

查看[默认主题](https://mui.com/zh/material-ui/customization/default-theme/)配置

[Theming 主题](https://mui.com/zh/material-ui/customization/theming/)

```jsx
import IndexRouter from "router/IndexRouter";
import {ThemeProvider,createTheme} from "@mui/material"
import {orange} from "@mui/material/colors"
function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: orange[500],
      },
    },
  });
  return <ThemeProvider theme={theme}>
    <IndexRouter />
  </ThemeProvider>;
}

export default App;
```

## styled

https://mui.com/system/styled/

```jsx
import { styled } from '@mui/system';
import {red} from "@mui/material/colors"
const MyComponent = styled('h1')({
    color:red[100]
})

function Home() {
    return (
        <div>
            <MyComponent>Home</MyComponent>
        </div>
    )
}
export default Home
```