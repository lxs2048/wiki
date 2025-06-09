# web3js与合约程序

## 连接智能合约程序

真正实现DApp还需要前端调用智能合约程序最终形成交互，这才是完整的去中心化的App

> ABI非常类似于API (应用程序接口)，一种人类可读的代码接口表示。ABI定义了用于与二进制合约交互的方法和结构，就像API所做的那样，只是在较低的级别上。

参考文档：https://learnblockchain.cn/docs/web3.js/web3-eth-contract.html#eth-contract

```
new web3.eth.Contract(jsonInterface[, address][, options])
```

连接智能合约程序：

现在可以先手动复制合约程序打包后的文件里的`abi`和networks下的`address`，需要一个当前的account，所以提前获取授权

```js
// 连接智能合约程序
const contractObj = new web3.eth.Contract([
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "UserList",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint8",
        "name": "age",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  ...
], '0x31BB7F5ca894F2c3A5be0027D5242cF9C8a2924D', {
  from: account
})
```

我们可以从智能合约对象里的method下获取交互方法，新增数据(消耗account用户的gas)：

```js
const ret = await contractObj.methods.addList('aaa', 1).send({
  from: account
})
console.log(ret)
```

查询数据(不消耗):

```js
const userList = await contractObj.methods.getList().call()
console.log(userList)
```

## 优化合约程序

我们现在实现的增查没能知道时哪个用户增加的数据，所以优化合约程序

```
// 结构体
struct User {
  uint id;
  string name;
  uint8 age;
  address account;//增加address类型
}
```

这个account不需要单独使用参数传递，我们使用全局变量`msg.sender`得到当前请求者的信息，因为已经在from里传递了

```
UserList.push(User(index,_name,_age,msg.sender));
```

更新后需要重新打包部署，连接合约程序那里重新**替换abi和address**

![image-20230310113946500](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202303101139539.png!blog.guiyexing)