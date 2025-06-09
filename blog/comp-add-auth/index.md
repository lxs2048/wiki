---
slug: comp-add-auth
title: 加个权限
authors: [dolphin]
tags: [component_templates,鉴权]
date: 2022-09-09T11:15
---

使用高级组件在不使用后端的情况下做一个简单的前端鉴权

<!--truncate-->

当前路由配置如下

```js
import { useRoutes, Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import Layout from "pages/Layout";
import NotExist from "pages/NotExist";
import Home from "pages/Home";
import Demo1 from "pages/Demo1";
import Demo2 from "pages/Demo2";
import {StoreCtx} from 'stores/store.context'
import TestStore from "pages/Demo1/modle/testStore";
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
        { path: "/demo1", element: <StoreCtx.Provider value={{testStore:new TestStore()}}><Demo1 /></StoreCtx.Provider> },
        { path: "/demo2", element: <Demo2/> },
        { path: "*", element: <NotExist /> },
      ],
    },
  ];
  let element = useRoutes(routes);
  return <>{element}</>;
}
```

使用高级组件的方式添加鉴权控制

引入Login组件通过点击为本地存储`auth_token`到`localStorage`，并且跳转到由鉴权组件通过state传递过来的原路径，否则默认首页

```tsx
import { useLocation, useNavigate,type Location } from "react-router-dom";

type LocalState = undefined | {from?:Location}

function Login() {
  let location = useLocation();
  let navigate = useNavigate();
  let state = location.state as LocalState
  let from  = state?.from?.pathname || "/"
  const signIn = () => {
    localStorage.setItem("auth_token", "12345");
    navigate(from, { replace: true });
  };
  return <div onClick={signIn}>
    Login
  </div>;
}

export default Login;
```

路由配置，为demo2添加高阶组件

```js {1,4,23,27,33-40}
import { useRoutes, Navigate, useLocation } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import Layout from "pages/Layout";
import Login from "pages/Login"
import NotExist from "pages/NotExist";
import Home from "pages/Home";
import Demo1 from "pages/Demo1";
import Demo2 from "pages/Demo2";
import {StoreCtx} from 'stores/store.context'
import TestStore from "pages/Demo1/modle/testStore";
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
        { path: "/demo1", element: <StoreCtx.Provider value={{testStore:new TestStore()}}><Demo1 /></StoreCtx.Provider> },
        { path: "/demo2", element: <RequireAuth><Demo2/></RequireAuth> },
        { path: "*", element: <NotExist /> },
      ],
    },
    { path: "/login", element: <Login /> }
  ];
  let element = useRoutes(routes);
  return <>{element}</>;
}

function RequireAuth({ children }: { children: JSX.Element }) {
  let location = useLocation();
  let auth = localStorage.getItem("auth_token");
  if (!auth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
```

此时访问`demo2`，会自动跳转到登录页，点击登录，重新回到`demo2`，访问其他则没有权限任意访问

后续组件庞大时重复会很多，做一个封装

```tsx {12-33,42-56}
import { useRoutes, Navigate, useLocation } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import Layout from "pages/Layout";
import Login from "pages/Login"
import NotExist from "pages/NotExist";
import Home from "pages/Home";
import Demo1 from "pages/Demo1";
import Demo2 from "pages/Demo2";
import { StoreCtx } from 'stores/store.context'
import TestStore from "pages/Demo1/modle/testStore";
export default function IndexRouter() {
  const routeConf = [
    {
      path: "/home",
      element: <Home />,
      auth: true
    },
    {
      path: "/demo1",
      element: <Demo1 />,
      auth: true,
      store: {
        testStore: new TestStore()
      }
    },
    {
      path: "/demo2",
      element: <Demo2 />,
      auth: true
    },
    { path: "*", element: <NotExist /> },
  ]
  // 转换
  let routes: RouteObject[] = [
    {
      path: "/",
      element: <Navigate to="/home" />,
    },
    {
      path: "/",
      element: (<Layout />),
      children: routeConf.map(item => {
        return {
          path: item.path,
          element: item.auth ? <RequireAuth>
            {item.store ? <StoreCtx.Provider value={item.store}>
              {item.element}
            </StoreCtx.Provider> :
              item.element}
          </RequireAuth> :
            item.store ? <StoreCtx.Provider value={item.store}>
              {item.element}
            </StoreCtx.Provider> :
              item.element
        }
      })
    },
    { path: "/login", element: <Login /> }
  ];
  let element = useRoutes(routes);
  return <>{element}</>;
}

function RequireAuth({ children }: { children: JSX.Element }) {
  let location = useLocation();
  let auth = localStorage.getItem("auth_token");
  if (!auth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
```