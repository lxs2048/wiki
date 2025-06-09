---
slug: mobx-react
title: React18结合MobX实践
authors: [dolphin]
tags: [component_templates,React18结合MobX实践,mobx-react]
date: 2022-09-04T20:49
---

## 官方介绍

[mobx中文文档](https://zh.mobx.js.org/README.html)

官方示例理解 MobX

<!--truncate-->

```javascript
import React from "react"
import ReactDOM from "react-dom"
import { makeAutoObservable } from "mobx"
import { observer } from "mobx-react"

// 对应用状态进行建模。
class Timer {
    secondsPassed = 0

    constructor() {
        //makeAutoObservable 就像是加强版的 makeObservable，在默认情况下它将推断所有的属性
        makeAutoObservable(this)
    }

    increase() {
        this.secondsPassed += 1
    }

    reset() {
        this.secondsPassed = 0
    }
}

const myTimer = new Timer()

// 构建一个使用 observable 状态的“用户界面”。
const TimerView = observer(({ timer }) => (
    <button onClick={() => timer.reset()}>已过秒数：{timer.secondsPassed}</button>
))

ReactDOM.render(<TimerView timer={myTimer} />, document.body)

// 每秒更新一次‘已过秒数：X’中的文本。
setInterval(() => {
    myTimer.increase()
}, 1000)
```

围绕 React 组件 `TimerView` 的 `observer` 包装会自动侦测到依赖于 observable `timer.secondsPassed` 的渲染——即使这种依赖关系没有被明确定义出来。 响应性系统会负责在未来*恰好那个*字段被更新的时候将组件重新渲染。

每个事件（`onClick` 或 `setInterval`）都会调用一个用来更新 *observable 状态* `myTimer.secondsPassed` 的 *action*（`myTimer.increase` 或 `myTimer.reset`）。Observable 状态的变更会被精确地传送到 `TimerView` 中所有依赖于它们的*计算*和*副作用*里。

![zh.flow](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202209051414546.png!blog.guiyexing)

## 全局Store

实践版本

```
"mobx": "^6.6.1",
"mobx-react": "^7.5.2",
"react": "^18.2.0",
"react-dom": "^18.2.0",
```

创建几个全局store案例

```ts title="src/stores/auth.store.ts"
import { makeAutoObservable } from 'mobx';

export default class AuthStore {
    isAuthenticated: boolean = false;

    constructor() {
        makeAutoObservable(this);
    }

    setAuthenticated(authenticated:boolean){
        this.isAuthenticated = authenticated
    }
}
```

```ts title="src/stores/globalTest.store.ts"
import { makeAutoObservable, runInAction } from "mobx";

export default class GlobalTestStore {
    price: number = 0;
    amount: number = 1;

    constructor() {
        makeAutoObservable(this);
    }

    // 改变observable的方法，会被自动标记为action
    increase() {
        this.amount += 1;
    }
    async decrease() {
        const res = await new Promise<number>((r)=>{
            setTimeout(()=>{
                r(1)
            },100)
        })
        runInAction(()=>{
            // 异步使用runInAction设置值
            this.amount -= res;
        })
    }

    // 使用get set的方法，会被自动标记为computed
    get total() {
        return this.price * this.amount;
    }

    set total(value: number) {
        this.price +=value
    }

    // 以上混乱
    setPrice(value:number){
        this.price += value
    }
}
```

```ts title="src/stores/sideMenu.store.ts"
import { makeAutoObservable, runInAction } from 'mobx';
interface ILoadMenu{
  title:string
}
export default class SideMenuStore {
  loadMenu:ILoadMenu[] = []

  constructor() {
      makeAutoObservable(this);
  }

  async loadMenuData(){
    const res = await new Promise<ILoadMenu[]>((r)=>{
      setTimeout(()=>{
          r([{title:'hello'}])
      },100)
    })
    runInAction(()=>{
        // 异步使用runInAction设置值
        this.loadMenu = res;
      console.log(this.loadMenu)
    })
  }
}
```

在stores入口统一管理

```ts title="src/stores/store.context.ts"
import GlobalTestStore from 'stores/globalTest.store'
import SideMenuStore from 'stores/sideMenu.store'
import AuthStore from 'stores/auth.store'

/** 将每个Store实例化 */
export const RootStore = {
    globalTestStore: new GlobalTestStore(),
    sideMenu: new SideMenuStore(),
    authStore: new AuthStore()
}
```

获取Store的公用Hooks

```tsx title="src/stores/useStore.tsx"
import { MobXProviderContext } from 'mobx-react';
import { useContext } from 'react'
import { RootStore } from 'stores/store.context'

// 根据RootStore来实现参数的自动获取和返回值的自动推导
function useStore<T extends typeof RootStore, V extends keyof T>(name: V): T[V] {
    const store = useContext(MobXProviderContext) as T;
    return store[name]
}

export default useStore;
```

项目入口使用Context共享全局的Store对象

```tsx title="src/App.tsx" {5-6,16,18}
import IndexRouter from "router/IndexRouter";
import { createTheme, ThemeProvider } from '@mui/material';
import {orange} from "@mui/material/colors"
import "assets/css/index.css";
import { Provider as MobxProvider } from "mobx-react";
import { RootStore } from 'stores/store.context';
function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: orange[500],
      }
    }
  });
  return <ThemeProvider theme={theme}>
    <MobxProvider {...RootStore}>
      <IndexRouter />
    </MobxProvider>
  </ThemeProvider>;
}

export default App;
```

这里同时使用了react-router-dom v6和material，使用Provider包裹项目入口就可以使用全局store了 ！

在任意组件中使用

```tsx title="src/pages/Demo2/index.tsx" {2-4,6-7,12-16,22}
import { useContext } from 'react'
import { observer } from 'mobx-react'
import { Button } from '@mui/material'
import useStore from 'stores/useStore'
const Demo2 = () => {
  const globalTestStore = useStore("globalTestStore");
  const { price, amount, total } = globalTestStore
  return (
    <>
      <div>Demo2</div>
      <div>
        <p>{price}*{amount}={total}</p>
        <Button onClick={() => globalTestStore.increase()}>+</Button>
        <Button onClick={() => globalTestStore.decrease()}>-</Button>
        <Button onClick={() => globalTestStore.setPrice(3)}>1.价格+3</Button>
        <Button onClick={() => globalTestStore.total = 3}>2.价格+3</Button>
      </div>
    </>
  )
}

export default observer(Demo2)
```

## 局部Store

stores创建StoreCtx用于存储局部store的Context

```ts title="src/stores/store.context.ts" {1-2,6-11}
import React from "react";
import TestStore from 'pages/Demo1/modle/testStore'
import GlobalTestStore from 'stores/globalTest.store'
import SideMenuStore from 'stores/sideMenu.store'
import AuthStore from 'stores/auth.store'
interface IStoreCtx{
    testStore?:TestStore
}

const defaultCtx:IStoreCtx = {}
export const StoreCtx = React.createContext(defaultCtx)


/** 将每个Store实例化 */
export const RootStore = {
    globalTestStore: new GlobalTestStore(),
    sideMenu: new SideMenuStore(),
    authStore: new AuthStore()
}
```

为某个路由的组件通过`Provider`来修改`context`数据注入store

```tsx title="src/router/IndexRouter.tsx" {8-9,21-22}
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

```ts title="src/pages/Demo1/modle/testStore.ts"
import { makeAutoObservable } from "mobx";

export default class TestStore {
    count: number = 0; // 这些属性会被自动标记为observable
    constructor() {
        makeAutoObservable(this);
    }

    // 改变observable的方法，会被自动标记为action
    add() {
        this.count += 1;
    }
}
```

使用该store

```tsx title="src/pages/Demo1/index.tsx" {1,3,7,10,13}
import { useContext } from 'react'
import { observer } from 'mobx-react'
import { StoreCtx } from 'stores/store.context'
import useStore from 'stores/useStore'
import { Button } from '@mui/material'
const Demo1 = () => {
  const { testStore } = useContext(StoreCtx)
  const globalTestStore = useStore("globalTestStore");
  const {price,amount,total} = globalTestStore
  console.log(testStore,globalTestStore, '数据😎😎😎');
  return (
    <>
      <div onClick={() => testStore.add()}>Demo1{testStore.count}</div>
      <div>
        <p>{price}*{amount}={total}</p>
        <Button onClick={()=>globalTestStore.increase()}>+</Button>
        <Button onClick={()=>globalTestStore.decrease()}>-</Button>
        <Button onClick={()=>globalTestStore.setPrice(3)}>1.价格+3</Button>
        <Button onClick={()=>globalTestStore.total = 3}>2.价格+3</Button>
      </div>
    </>
  )
}

export default observer(Demo1)
```

在Demo2中未注入testStore，所以得到的是undefined，这样就实现了局部的隔离
