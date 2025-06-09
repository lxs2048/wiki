# react与合约交互

## 创建项目

项目地址：https://github.com/lxs2048/web3

使用create-react-app构建项目，使用react18版本

```
create-react-app myapp
```

## 架构整合

每次重新部署合约之后，build目录里重新生成新的json文件，在打通web3与合约程序时，每次部署都要更新abi和address，反反复复会很麻烦，所以**将react和智能合约放到一起进行管理**，让build目录能够放到src里面，因为希望**组件内部可以直接加载json文件**，解析需要的数据

**整合过程：**

一、把原项目里被标注的几个文件或目录复制到react项目的根目录

![image-20230315195128188](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202303151951281.png!blog.guiyexing)

复制后在react项目中安装我们要的依赖`npm i openzeppelin-solidity`，然后就可以直接部署与测试

![image-20230315195613561](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202303151956586.png!blog.guiyexing)

二、配置

我们可以先删除项目根目录下的build目录

在`truffle-config.js`中添加以下配置，指定构建目录

```js
"contracts_build_directory":"./src/build",
```

重新编译并部署

```shell
truffle migrate --reset
```

然后就在src下生成了build目录，我们就可以直接导入了

```js title="App.js"
import obj from './build/DolToken.json';
console.log(obj,'obj');
```

## 合约连接

安装web3，大于1.8.0版本有警告⚠️

```shell
npm i web3@1.8.0
```

使用自定义hook：初始化获取web3，授权，获取合约实例，挂载到window下

```js title="src/hooks/useConnectSol.js"
import { useEffect, useState } from "react"
import Web3 from 'web3'
import tokenJson from '../build/DolToken.json'
import exchangeJson from '../build/Exchange.json'
function useConnectSol() {
    const [init,setInit] = useState({})
    useEffect(() => {
        async function start() {
            const initData = await initWeb()
            window.WEB = initData
            setInit(initData)
        }
        start()
    }, [])
    return [init]
}
export default useConnectSol

// 初始化获取web3，授权，获取合约实例
const initWeb = async () => {
    // 连接
    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545")
    // 授权
    const accounts = await requestAccounts(web3)
    // 货币合约实例
    const tokenInstance = await getInstance(web3, tokenJson)
    const exchangeInstance = await getInstance(web3, exchangeJson)
    return {
        web3: web3,
        Account: accounts[0],
        Instance: {
          tokenInstance,
          exchangeInstance
        }
    }
}

// 授权
const requestAccounts = async (web3) => {
    return web3.eth.requestAccounts()
}

// 获取合约实例
const getInstance = async (web3, json) => {
    // 网络id
    const networkId = await web3.eth.net.getId()
    const abi = json.abi
    const address = json.networks[networkId].address
    const contractObj = await new web3.eth.Contract(abi, address)
    return contractObj
}
```

使用自定义hook

```js title="src/components/Balance/index.js" {2,5-6}
import React from 'react'
import useConnectSol from '../../hooks/useConnectSol'

function Balance() {
  useConnectSol()
  console.log(window.WEB,'数据😎😎😎window.WEB');
  return (
    <div>Balance</div>
  )
}

export default Balance
```

![image-20230319120143927](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202303191201027.png!blog.guiyexing)

## 最新redux用法

安装依赖

```shell
npm i redux react-redux @reduxjs/toolkit
```

目录结构

```
src
├── hooks
│   └── useReduxStore.js // 自定义hook使用redux
├── components
│   └── Demo/index.js // 测试组件
├── redux
│   ├── slices //各种类型数据
│   │   └── demoSlice.js //存放测试相关数据
│   ├── store.js//封装store入口要传入provider
│   └── StoreWrap.js//自定义组件封装Provider注入store
└── App.js//入口，使用StoreWrap组件包裹Content组件
```

一、将数据和改变数据的方法写在一块

异步更新需要使用`createAsyncThunk`，同步更新方法在`reducers`定义

```js title="demoSlice.js"
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

const demoSlice = createSlice({
    name: 'demo',
    initialState: {
        hello: "hello"
    },
    reducers: {
        setHello(state, action) {
            state.hello = action.payload
        }
    }
})
export const { setHello } = demoSlice.actions
export default demoSlice.reducer
export const loadHello = createAsyncThunk(
    "demo/loadHello",
    async (data, { dispatch }) => {
        const { val } = data || {}; // 解构参数
        const ret = await mockSync(val)
        dispatch(setHello(ret))
    }
)

const mockSync = async (val)=>{
    return new Promise((reslove)=>{
        setTimeout(()=>{
            reslove(val)
        },1000)
    })
}
```

二、使用configureStore创建store

```js title="store.js"
import { configureStore } from '@reduxjs/toolkit'
import demoSlice from './slices/demoSlice'
const store = configureStore({
    reducer: {
        // demo
        demo: demoSlice
        // 其他
    },
    // middleware:{}
})
export default store
```

三、封装Provider，注入store

```js title="StoreWrap.js"
import { Provider } from "react-redux"
import store from './store'
function StoreWrap({children}) {
  return (
    <Provider store={store}>{children}</Provider>
  )
}

export default StoreWrap
```

四、使用Wrap组件

```js title="App.js" {2-3,6-7,9}
import Balance from "./components/Balance";
import Demo from "./components/Demo";
import StoreWrap from "./redux/StoreWrap";
function App() {
  return (
    <StoreWrap>
      <Demo/>
      <Balance/>
    </StoreWrap>
  );
}

export default App;
```

五、封装hooks使用redux

```js title="src/hooks/useReduxStore.js"
import { useSelector, useDispatch } from 'react-redux';
const useReduxStore = (selector) => {
    const dispatch = useDispatch()
    const state = useSelector(selector)
    return [state, dispatch];
};

export default useReduxStore;
```

六、测试redux

```js title="src/components/Demo/index.js"
import React from 'react'
import useReduxStore from '../../hooks/useReduxStore'
import { loadHello, setHello } from '../../redux/slices/demoSlice'

function Demo() {
    const [state, dispatch] = useReduxStore(state => state.demo)
    return (<>
        <div>Demo {state.hello}</div>
        <button onClick={()=>{
            dispatch(setHello('hi ~'))
        }}>同步</button>
        <button onClick={()=>{
            dispatch(loadHello({val:'hi hi'}))
        }}>异步</button>
    </>
    )
}

export default Demo
```

## 钱包信息

接下来完成获取钱包信息的逻辑，我们可以把获取的逻辑集中在redux的balanceSlice

```js title="balanceSlice.js"
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';//address(0)默认地址0x后40个0
const balanceSlice = createSlice({
    name: 'balance',
    initialState: {
        TokenWallet: "0",
        TokenExchange: "0",
        EtherWallet: "0",
        EtherExchange: "0",
    },
    reducers: {
        setTokenWallet(state, action) {
            state.TokenWallet = action.payload
        },
        batchUpdateWallet(state, action) {
            const { TokenWallet, TokenExchange, EtherWallet, EtherExchange } = action.payload
            state.TokenWallet = TokenWallet
            state.TokenExchange = TokenExchange
            state.EtherWallet = EtherWallet
            state.EtherExchange = EtherExchange
        }
    }
})
export const { setTokenWallet, batchUpdateWallet } = balanceSlice.actions
export default balanceSlice.reducer
export const loadBalanceData = createAsyncThunk(
    "balance/fetchBalanceData",
    async (data, { dispatch }) => {
        const { web3, Instance, Account } = data || {}; // 解构参数
        const ret = await Promise.all([
            getTokenWallet(Instance.tokenInstance, Account),
            getTokenExchange(Instance.exchangeInstance, Instance.tokenInstance, Account),
            getEtherWallet(web3, Account),
            getEtherExchange(Instance.exchangeInstance, Account)
        ])
        const [TokenWallet, TokenExchange, EtherWallet, EtherExchange] = ret
        dispatch(batchUpdateWallet({
            TokenWallet,
            TokenExchange,
            EtherWallet,
            EtherExchange
        }))
    }
)

// 获取钱包token DOL
const getTokenWallet = async (tokenInstance, Account) => {
    return tokenInstance.methods.balanceOf(Account).call()
}
// 获取交易所token
const getTokenExchange = async (exchangeInstance, tokenInstance, Account) => {
    return exchangeInstance.methods.balanceOf(tokenInstance.options.address, Account).call()
}
// 获取钱包ether
const getEtherWallet = async (web3, Account) => {
    return web3.eth.getBalance(Account)
}
// 获取交易所ether
const getEtherExchange = async (exchangeInstance, Account) => {
    return exchangeInstance.methods.balanceOf(ETHER_ADDRESS, Account).call()
}
```

合并到store

```js title="store.js" {2,7,9}
import { configureStore } from '@reduxjs/toolkit'
import balanceSlice from './slices/balanceSlice'
import demoSlice from './slices/demoSlice'
const store = configureStore({
    reducer: {
        // demo
        demo: demoSlice,
        // 其他
        balance: balanceSlice
    },
    // middleware:{}
})
export default store
```

在Balance组件测试获取并展示数据

```js title="Balance/index.js"
import React, { useEffect } from 'react'
import useConnectSol from '../../hooks/useConnectSol'
import useReduxStore from '../../hooks/useReduxStore'
import { loadBalanceData } from '../../redux/slices/balanceSlice'
export const convert = (n) => {
  if (!n || !window.WEB) return ''
  return window.WEB.web3.utils.fromWei(n, "ether")
}
function Balance() {
  const [initData] = useConnectSol()
  const [state, dispatch] = useReduxStore(state => state.balance)
  useEffect(() => {
    initData.web3 && dispatch(loadBalanceData(initData))
  }, [initData])
  const { TokenWallet, TokenExchange, EtherWallet, EtherExchange } = state || {}
  return (
    <div>
      <h2>账户：{initData.Account}</h2>
      <h3>钱包中的DOL：{convert(TokenWallet)}</h3>
      <h3>交易所中的DOL：{convert(TokenExchange)}</h3>
      <h3>钱包中的以太币：{convert(EtherWallet)}</h3>
      <h3>交易所中的以太币：{convert(EtherExchange)}</h3>
    </div>
  )
}

export default Balance
```

外部调用`dispatch(loadBalanceData(initData))`

测试方案：按照前面订单的测试脚本执行后，第一二个账户的资产都有变化，插件切换账号获取到的资产不同

![image-20230319132210601](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202303191322670.png!blog.guiyexing)

antd组件展示资产信息

```js title="Balance/index.js" {2,18-73}
import React, { useEffect } from 'react'
import { Card, Col, Row, Statistic, Descriptions } from 'antd';
import useConnectSol from '../../hooks/useConnectSol'
import useReduxStore from '../../hooks/useReduxStore'
import { loadBalanceData } from '../../redux/slices/balanceSlice'
export const convert = (n) => {
  if (!n || !window.WEB) return ''
  return window.WEB.web3.utils.fromWei(n, "ether")
}
function Balance() {
  const [initData] = useConnectSol()
  const [state, dispatch] = useReduxStore(state => state.balance)
  useEffect(() => {
    initData.web3 && dispatch(loadBalanceData(initData))
  }, [initData])
  const { TokenWallet, TokenExchange, EtherWallet, EtherExchange } = state || {}
  return (
    <div style={{ width: '100%', padding: '16px', boxSizing: 'border-box' }}>
      <Descriptions title="User Info">
        <Descriptions.Item label="Address">
          {initData.Account}
        </Descriptions.Item>
      </Descriptions>
      <Row gutter={16}>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="钱包DOL"
              value={convert(TokenWallet)}
              precision={3}
              valueStyle={{
                color: '#3f8600',
              }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="交易所中的DOL"
              value={convert(TokenExchange)}
              precision={3}
              valueStyle={{
                color: '#9254de',
              }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="钱包ETH"
              value={convert(EtherWallet)}
              precision={3}
              valueStyle={{
                color: '#4096ff',
              }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="交易所中的ETH"
              value={convert(EtherExchange)}
              precision={3}
              valueStyle={{
                color: '#ff7a45',
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Balance
```

![image-20230319164846699](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202303191648738.png!blog.guiyexing)

## 订单

设计：左（所有已经完成的订单）中（当前账户创建的订单，可取消）右（其他人创建的订单，可买入）三块区域

需要增加的依赖库

```
npm i dayjs
```

### 测试脚本

创建订单测试脚本，需要分别为两个账户创建一些订单，切换账户以后在自己的和其他人的订单间进行不同的交互

1. 首先把DOL币分账户2一半方便交易
2. 默认都有1000ETH，分别存500ETH到交易所
3. 分别存一半DOL到交易所，需要提前授权
4. 分别创建DOL->ETH和ETH->DOL兑换的订单

```js title="scripts/createOrders.js"
const DolToken = artifacts.require("DolToken.sol")
const Exchange = artifacts.require("Exchange.sol")

const fromWei = (bn) => {
    return web3.utils.fromWei(bn, "ether");
}
const toWei = (number) => {
    return web3.utils.toWei(number.toString(), "ether");
}
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';//address(0)默认地址0x后40个0
module.exports = async function (callback) {
    const token = await DolToken.deployed()
    const exchange = await Exchange.deployed()
    const accounts = await web3.eth.getAccounts()
    const [one, two] = accounts
    try {
        // 1.平分DOL
        await token.transfer(two, toWei(500000), {
            from: one
        })
        // 2.各自存500ETH
        await exchange.depositEther({
            from: one,
            value: toWei(500)
        })
        await exchange.depositEther({
            from: two,
            value: toWei(500)
        })
        // 3.各自存DOL
        await token.approve(exchange.address, toWei(250000), {
            from: one
        })//授权
        await exchange.depositToken(token.address, toWei(250000), {
            from: one,
        })//转账
        await token.approve(exchange.address, toWei(250000), {
            from: two
        })//授权
        await exchange.depositToken(token.address, toWei(250000), {
            from: two,
        })//转账
        // 4. 双方都创建订单
        for (let i = 1; i < 6; i++) {
            await exchange.makeOrder(ETHER_ADDRESS, toWei(10*i), token.address, toWei(100*i), {
                from: one
            })
            await exchange.makeOrder(token.address, toWei(100*i),ETHER_ADDRESS, toWei(10*i), {
                from: one
            })
            await exchange.makeOrder(ETHER_ADDRESS, toWei(10*i), token.address, toWei(100*i), {
                from: two
            })
            await exchange.makeOrder(token.address, toWei(100*i),ETHER_ADDRESS, toWei(10*i), {
                from: two
            })
        }
    } catch (error) {
        console.log(error, '数据😎😎😎error');
    }
    callback()
}
```

### 订单组件

首先在App入口使用该组件`import Order from "./components/Order";`，与Balance同级

定义组件如下：

```js title="src/components/Order/index.js"
import { Card, Col, Row, Badge, Table, Tag, Button } from 'antd';
import dayjs from 'dayjs'
import useReduxStore from '../../hooks/useReduxStore'
import { ETHER_ADDRESS } from '../../redux/slices/balanceSlice';
export const convert = (n) => {
    if (!n || !window.WEB) return ''
    return window.WEB.web3.utils.fromWei(n, "ether")
}
const timestampFormat = (timestamp) => {
    return dayjs(timestamp * 1000).format('YYYY/MM/DD')
}
export const balanceType = (address) => {
    if (address === ETHER_ADDRESS) {
        return 'ETH'
    }
    return 'DOL'
}
const getPendingOrder = (order = {}) => {
    if (!window.WEB) return {
        my: [],
        other: []
    }
    const { AllOrders = [], CancelOrders = [], FillOrders = [] } = order;
    const filterIds = [...CancelOrders, ...FillOrders].map(item => item.id);
    const pendingOrders = AllOrders.filter(item => !filterIds.includes(item.id));
    return {
        my: pendingOrders.filter(item => item.createUser === window.WEB.Account),
        other: pendingOrders.filter(item => item.createUser !== window.WEB.Account),
    }
}
function Order() {
    const [order, dispatch] = useReduxStore(state => state.order)
    console.log(order, '数据😎😎😎state');
    const columns = [
        {
            title: '时间',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (timestamp) => {
                return <span>{timestampFormat(timestamp)}</span>
            }
        },
        {
            title: '原始',
            dataIndex: 'tokenFrom',
            key: 'tokenFrom',
            render: (tokenFrom, item) => {
                return <>
                    <Tag color="green">{balanceType(tokenFrom)}</Tag>
                    <b>{convert(item.amountFrom)}</b>
                </>
            }
        },
        {
            title: '目标',
            dataIndex: 'tokenTo',
            key: 'tokenTo',
            render: (tokenTo, item) => {
                return <>
                    <Tag color="cyan">{balanceType(tokenTo)}</Tag>
                    <b>{convert(item.amountTo)}</b>
                </>
            }
        },
    ];

    const columnsMy = [
        ...columns,
        {
            title: '操作',
            dataIndex: 'id',
            key: 'id',
            render: (id) => {
                return <Button danger onClick={() => {
                    const { Instance: { exchangeInstance }, Account } = window.WEB || {}
                    exchangeInstance && exchangeInstance.methods.cancelOrder(id).send({
                        from: Account
                    })
                }}>取消</Button>
            }
        }
    ]
    const columnsOther = [
        ...columns,
        {
            title: '操作',
            dataIndex: 'id',
            key: 'id',
            render: (id) => {
                return <Button danger onClick={() => {
                    const { Instance: { exchangeInstance }, Account } = window.WEB || {}
                    exchangeInstance && exchangeInstance.methods.fillOrder(id).send({
                        from: Account
                    })
                }}>买入</Button>
            }
        }
    ]

    return (
        <div style={{ width: '100%', padding: '16px', boxSizing: 'border-box' }}>
            <Row gutter={16}>
                <Col span={8}>
                    <Badge.Ribbon text="已完成" color="#597ef7">
                        <Card title="全部订单" bordered={false}>
                            <Table dataSource={order.FillOrders} columns={columns} rowKey="id" />
                        </Card>
                    </Badge.Ribbon>
                </Col>
                <Col span={8}>
                    <Badge.Ribbon text="进行中" color="#95de64">
                        <Card title="我的订单" bordered={false}>
                            <Table dataSource={getPendingOrder(order)['my']} columns={columnsMy} rowKey="id" />
                        </Card>
                    </Badge.Ribbon>
                </Col>
                <Col span={8}>
                    <Badge.Ribbon text="进行中" color="#95de64">
                        <Card title="其他订单" bordered={false}>
                            <Table dataSource={getPendingOrder(order)['other']} columns={columnsOther} rowKey="id" />
                        </Card>
                    </Badge.Ribbon>
                </Col>
            </Row>
        </div>
    )
}

export default Order
```

完成订单的slice

```js title="src/redux/slices/orderSlice.js"
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

const orderSlice = createSlice({
    name: 'order',
    initialState: {
        AllOrders: [],
        CancelOrders: [],
        FillOrders: []
    },
    reducers: {
        setOrder(state, action) {
            const { AllOrders, CancelOrders, FillOrders } = action.payload
            state.AllOrders = AllOrders
            state.CancelOrders = CancelOrders
            state.FillOrders = FillOrders
        }
    }
})
export const { setOrder } = orderSlice.actions
export default orderSlice.reducer
export const loadOrderLists = createAsyncThunk(
    "order/loadOrderLists",
    async (data, { dispatch }) => {
        const { web3, Instance, Account } = data || {};
        const ret = await Promise.all([
            getExchangeHistoryEvent(Instance.exchangeInstance, 'Order'),
            getExchangeHistoryEvent(Instance.exchangeInstance, 'Cancel'),
            getExchangeHistoryEvent(Instance.exchangeInstance, 'Trade')
        ])
        const [AllOrders, CancelOrders, FillOrders] = ret
        dispatch(setOrder({ AllOrders, CancelOrders, FillOrders }))
    }
)

export const getExchangeHistoryEvent = async (exchangeInstance, type) => {
    const ret = await exchangeInstance.getPastEvents(type, {
        fromBlock: 0,
        toBlock: "latest"
    })
    return ret.map(item => item.returnValues)
}
```

订单需要一个调用时机，这里把他放到balance中

![image-20230323160307029](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202303231603152.png!blog.guiyexing)

合并到store，设置middleware关闭序列化的检查，合约数据存到redux会报错

```js title="src/redux/store.js" {4,10-15}
import { configureStore } from '@reduxjs/toolkit'
import balanceSlice from './slices/balanceSlice'
import demoSlice from './slices/demoSlice'
import orderSlice from './slices/orderSlice'
const store = configureStore({
    reducer: {
        // demo
        demo: demoSlice,
        // 其他
        balance: balanceSlice,
        order:orderSlice
    },
    middleware:getDefaultMiddleware => getDefaultMiddleware({
        serializableCheck:false,//关闭序列化的检查
    })
})
export default store
```

## 事件订阅

在初始化时利用合约的events注册监听事件

```js
if(initData.Instance){
  const exchange = initData.Instance.exchangeInstance
  exchange.events.Order({},(error,event)=>{
    dispatch(loadOrderLists(initData))
  })
  exchange.events.Cancel({},(error,event)=>{
    dispatch(loadOrderLists(initData))
  })
  exchange.events.Trade({},(error,event)=>{
    dispatch(loadOrderLists(initData))
    dispatch(loadBalanceData(initData))
  })
}
```

![image-20230323162645545](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202303231626609.png!blog.guiyexing)

最终实现如下：

![web3-demo](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202303231628998.png!blog.guiyexing)

## 拓展-context模拟redux

目录结构

```
src
├── components
│   ├── Content
│   │		└── index.js  //测试组件
├── Store
│   ├── context.js    //Context对象
│   ├── hooks.js      //封装useContext获取数据方法
│   ├── StoreWrap.js  //封装Context对象的Provider
│   └── index.js      //自定义hook【useReducerStore】管理数据
└── App.js            //入口，使用StoreWrap组件包裹Content组件
```

一、创建一个 Context 对象

```js title="src/Store/context.js"
import { createContext } from 'react';

export const StoreCtx = createContext({});
```

二、useContext接收一个 context 对象（`React.createContext` 的返回值）并返回该 context 的当前值，我们把他封装到hook里

```js title="src/Store/hooks.js"
import { StoreCtx } from './context';
import { useContext } from 'react';

/**
 * 获取全局store/state
 */
export const useStore = () => {
  return useContext(StoreCtx);
};
```

三、自定义hook【useReducerStore】

```js title="src/Store/index.js"
import { useReducer } from 'react';
export const initialState = {
    num: 0,
};

const ACTION_HANDLERS = {
    increase: (state, action) => {
        return Object.assign({}, state, {
            num: action.payload + state.num
        });
    },
    decrease: (state, action) => {
        return Object.assign({}, state, {
            num: state.num - action.payload
        });
    }
};

const reducer = (state, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
};

const useReducerStore = () => {
    const [state, _Dispatch] = useReducer(reducer, initialState);

    return [state, _Dispatch];
};

export default useReducerStore;
```

四、封装Wrap

```js title="src/Store/StoreWrap.js"
import { StoreCtx } from './context';
import useReducerStore from './index';
function StoreWrap({ children }) {
  const [state, Dispatch] = useReducerStore();
  const store = {
    ...state,
    Dispatch,
  };
  return (
    <StoreCtx.Provider value={store}>
      {children}
    </StoreCtx.Provider>
  );
}

export default StoreWrap;
```

每个 Context 对象都会返回一个 Provider React 组件，它允许消费组件订阅 context 的变化，Provider 接收一个 `value` 属性，传递给消费组件

store的数据是使用useReducer管理的数据和更新的Dispatch方法，也可以在这里自定义一些属性，组件挂载后获取必要数据更新state，useReducerStore是一个自定义hook，封装了useReducer帮助处理数据

五、使用Context

`Context.Provider`包裹消费组件，在更新数据时消费组件才会重新渲染

目前没有router就先直接在App.js中使用

```js title="App.js"
import Content from './components/Content'
import StoreWrap from './Store/StoreWrap'
import './App.css'
function App() {
  return (
    <StoreWrap>
      <Content />
    </StoreWrap>
  );
}
export default App;
```

六、获取数据

现在尝试在Content组件中获取数据

```js title="src/components/Content/index.js"
import React from 'react'
import { useStore } from '../../Store/hooks'
function Content() {
  const {num,Dispatch} = useStore()
  return (
    <div>
        <div>{num}</div>
        <button onClick={()=>{Dispatch({type:'increase',payload:2})}}>+</button>
        <button onClick={()=>{Dispatch({type:'decrease',payload:1})}}>-</button>
    </div>
  )
}

export default Content
```
