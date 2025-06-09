---
slug: react-axios
title: 在react中使用axios
authors: [dolphin]
tags: [component_templates,mobx,axios]
date: 2022-09-17T20:49
---

## 全局axios配置

进行前后端分离开发，前后端的请求与跨域无可避免

<!--truncate-->

```ts title="src/utils/http.ts"
import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
const timeout = process.env.REACT_APP_API_TIMEOUT || 5000;
const tokenKey = process.env.REACT_APP_TOKEN || "_TOKEN_";

type Result<T> = {
  code: number;
  msg: string;
  data: T;
};

class Request {
  // axios 实例
  instance: AxiosInstance;
  // 基础配置，url和超时时间
  baseConfig: AxiosRequestConfig = {timeout: Number(timeout) };

  constructor(config: AxiosRequestConfig) {
    // 使用axios.create创建axios实例
    this.instance = axios.create(Object.assign(this.baseConfig, config));

    this.instance.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        // 请求拦截里面加token
        if (config && config["headers"]) {
          const token = localStorage.getItem(tokenKey);
          config.headers["Authorization"] = token ? `Bearer ${token}` : "";
        }
        return config;
      },
      (err: any) => {
        return Promise.reject(err);
      }
    );

    this.instance.interceptors.response.use(
      (res: AxiosResponse) => {
        return Promise.resolve(res);
      },
      (err: any) => {
        // 错误消息可以使用全局弹框展示出来
        let errMessage = err.response?.data?.message;
        if (errMessage) {
          // 后端返回的错误信息
          alert(errMessage);
        } else {
          // 默认全局提示
          alert('系统错误，请刷新重试');
        }
        return Promise.reject(err.response);
      }
    );
  }

  // 定义请求方法
  public request(config: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.instance.request(config);
  }

  public get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<Result<T>>> {
    return this.instance.get(url, config);
  }

  public post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<Result<T>>> {
    return this.instance.post(url, data, config);
  }

  public put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<Result<T>>> {
    return this.instance.put(url, data, config);
  }

  public patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<Result<T>>> {
    return this.instance.patch(url, data, config);
  }

  public delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<Result<T>>> {
    return this.instance.delete(url, config);
  }
}

export default Request;
```

全局配置请求API方式如下:

自定义初始化个性配置

```ts title="src/services/config.ts"
import Request from "utils/http";
// baseURL, timeout在Request作为基本配置，实例化可以传入进行覆盖
export const ApiServer = new Request({
  // ...
});
```

定义一个关于auth的请求API文件

```ts title="src/serveces/auth.ts"
import { ApiServer } from "./config";
const tokenKey = process.env.REACT_APP_TOKEN || "auth_token";
// 获取本地token
export const getToken = () => window.localStorage.getItem(tokenKey);
// 设置token
export const setToken = (val: string) =>
  window.localStorage.setItem(tokenKey, val);
// 登出
export const logout = async () => window.localStorage.removeItem(tokenKey);

export interface Pagination {
  tolal:number,
  pageSize:number,
  current:number,
  page:number
}

export interface UserInfo {
  username: string,
  address: string,
  created: number,
  updated: number,
  id: string
}

interface UserAPI{
  pagination:Pagination,
  records:UserInfo[]
}

// 测试接口
export const getUserList = () =>
  ApiServer.get<UserAPI>("/api/account");
```

入口统一导出所有API

```ts title="src/services/index.ts"
import * as auth from "./auth";

export { auth };
```

使用方式一：

```tsx
import { useEffect } from 'react'
import { auth } from 'services'
useEffect(()=>{
    auth.getUserList().then(res=>{
      console.log(res,'数据😎😎😎');
    })
},[])
```

使用方式二：结合mbox

```ts title="src/pages/Demo1/modle/testStore.ts" {2-3,6,15-19}
import { makeAutoObservable } from "mobx";
import {UserInfo} from 'services/auth';
import { auth } from 'services'
export default class TestStore {
    count: number = 0; // 这些属性会被自动标记为observable
    userLists: UserInfo[] = []
    constructor() {
        makeAutoObservable(this);
    }

    // 改变observable的方法，会被自动标记为action
    add() {
        this.count += 1;
    }
    getUserLists(){
        auth.getUserList().then(res=>{
            this.userLists = res.data?.data?.records || []
        })
    }
}
```

组件中使用

```tsx {1-2,11-15,18-22}
import { useContext,useEffect } from 'react'
import { toJS } from "mobx";
import { observer } from 'mobx-react'
import { StoreCtx } from 'stores/store.context'
import useStore from 'stores/useStore'
import { Button } from '@mui/material'
const Demo1 = () => {
  const { testStore } = useContext(StoreCtx)
  const globalTestStore = useStore("globalTestStore");
  const {price,amount,total} = globalTestStore
  const { userLists } = testStore
  useEffect(()=>{
    testStore.getUserLists()
  },[])
  console.log(toJS(userLists),'数据😎😎😎');
  return (
    <>
      {
        userLists?.length && userLists.map(item=>{
          return <p>{item.username}-{item.address}</p>
        })
      }
    </>
  )
}

export default observer(Demo1)
```

## 跨域

```
npm i http-proxy-middleware -D
```

```js title="src/setupProxy.js"
const {createProxyMiddleware } = require('http-proxy-middleware')
const baseURL = process.env.REACT_APP_API_URL;
module.exports = function(app) {
 app.use(createProxyMiddleware('/api', {
     target: baseURL,
     pathRewrite: {
       '^/api': '',
     },
     changeOrigin: true,
     secure: false
   }));
}
```

