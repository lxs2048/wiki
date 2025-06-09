---
slug: react-router
title: react-router
authors: [dolphin]
tags: [component_templates,react-router]
date: 2022-09-03T11:15
---

## 初始化TS项目

```
npx create-react-app component_templates --template typescript
```

指定启动端口

```
"start": "set PORT=3006 && react-scripts start",
```

<!--truncate-->

TS配置

```json
{
  "compilerOptions": {
    "target": "es5", // 指定 ECMAScript 版本
    "baseUrl": "./src",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ], // 要包含在编译中的依赖库文件列表
    "allowJs": true, // 允许编译 JavaScript 文件
    "skipLibCheck": true, // 跳过所有声明文件的类型检查
    "esModuleInterop": true, // 禁用命名空间引用 (import * as fs from "fs") 启用 CJS/AMD/UMD 风格引用 (import fs from "fs")
    "allowSyntheticDefaultImports": true, // 允许从没有默认导出的模块进行默认导入
    "strict": false, // 是否启用所有严格类型检查选项
    "forceConsistentCasingInFileNames": true, // 不允许对同一个文件使用不一致格式的引用
    "module": "esnext", // 指定模块代码生成
    "moduleResolution": "node", // 使用 Node.js 风格解析模块
    "resolveJsonModule": true, // 允许使用 .json 扩展名导入的模块
    "noEmit": true, // 不输出(意思是不编译代码，只执行类型检查)
    "jsx": "react-jsx", // 在.tsx文件中支持JSX
    "sourceMap": true, // 生成相应的.map文件
    "declaration": true, // 生成相应的.d.ts文件
    "noUnusedLocals": true, // 报告未使用的本地变量的错误
    "noUnusedParameters": true, // 报告未使用参数的错误
    "experimentalDecorators": true, // 启用对ES装饰器的实验性支持
    "incremental": true, // 通过从以前的编译中读取/写入信息到磁盘上的文件来启用增量编译
    "noFallthroughCasesInSwitch": true
  },
  "include": [
    "src/**/*" // *** TypeScript文件应该进行类型检查 ***
  ],
  "exclude": ["node_modules", "build"] // *** 不进行类型检查的文件 ***
}
```

## 路由配置

src目录结构

```
├── assets
│   └── css
│   	└── index.css
├── pages
│   ├── Demo1
│   	└── index.tex
│   ├── Demo2
│   	└── index.tex
│   ├── Home
│   	└── index.tex
│   ├── Layout
│   	└── index.tex
│   └── NotExist
│   	└── index.tex
├── router
│   └── IndexRouter.tsx
├── App.tsx
└── index.tsx
```

入口定义路由的格式

```tsx title="src/index.tsx"
import App from './App';
import {
  BrowserRouter,
} from "react-router-dom";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
// https://reactrouter.com/en/v6.3.0/getting-started/tutorial
```

App引用路由组件

```tsx title="src/App.tsx"
import IndexRouter from "router/IndexRouter";
function App() {
  return <IndexRouter />;
}

export default App;
```

路由组件

```tsx title="router/IndexRouter"
import { useRoutes, Navigate, useLocation } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import Layout from "pages/Layout";
import NotExist from "pages/NotExist";
import Home from "pages/Home";
import Demo1 from "pages/Demo1";
import Demo2 from "pages/Demo2";
export default function IndexRouter() {
  let routes: RouteObject[] = [
    {
      path: "/",
      element: <Navigate to="/home" />,
    },
    {
      path: "/",
      element: (<Layout />),
      children: [
        { path: "/home", index: true, element: <Home /> },
        { path: "/demo1", element: <Demo1 /> },
        { path: "/demo2", element: <Demo2 /> },
        { path: "*", element: <NotExist /> },
      ],
    },
  ];
  let element = useRoutes(routes);
  return <>{element}</>;
}
```

布局组件

```tsx title="src/pages/Layout/index.tsx"
import { Outlet,Link } from "react-router-dom";
function Layout() {
  return (
    <div>
        <div>
            <Link to="/home">home</Link> |{" "}
            <Link to="/demo1">demo1</Link> |{" "}
            <Link to="/demo2">demo2</Link>
        </div>
        <Outlet />
    </div>
  );
}

export default Layout;
```

路由基本页面如下

![image-20220905154741563](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202209051547637.png!blog.guiyexing)
