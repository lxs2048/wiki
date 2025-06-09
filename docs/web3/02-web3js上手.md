# web3js上手

## web3.js文档

git：https://github.com/web3/web3.js

官方文档：https://web3js.readthedocs.io/en/v1.8.0/#

社区中文文档：https://learnblockchain.cn/docs/web3.js/

## 获取余额

```html
<script>
  var web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
  // 返回地址在指定区块的余额
  web3.eth.getBalance("0x01F6EC963DaddE2f50d273D75318aae28bdC8851").then(console.log);
</script>
```

直接打印会有很长的字符串：`899999950125000000000`，我们可以使用其内部提供的工具函数转换

```js
// 将任意数量的 wei 默认转换为 ether.
console.log(web3.utils.fromWei(res,'ether'))//899.999950125
```

| 单位       | wei值    | Wei                       |
| ---------- | -------- | ------------------------- |
| wei        | 1        | 1wei                      |
| Kwei       | 1e3 wei  | 1,000                     |
| Mwei       | 1e6 wei  | 1,000,000                 |
| Gwei       | 1e9 wei  | 1,000,000,000             |
| microether | 1e12 wei | 1,000,000,000,000         |
| milliether | 1e15 wei | 1,000,000,000,000,000     |
| ether      | 1e18 wei | 1,000,000,000,000,000,000 |

web3.js依赖BigNumber Library，且会自动进行引入，推荐交易使用wei作为单位，展示使用其他单位

## 获取账号

getAccounts：返回节点所控制的账户列表

首先需要授权，即在当前页面的插件里连接授权

![image-20230309112859383](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202303091128431.png!blog.guiyexing)

获取信息的方式

```js
web3.eth.getAccounts().then(console.log);
```

如果当前账户没有连接解返回一个空数据，如果连接了，就是当前账户

授权除了用户自己主动去点击连接，还可以使用程序来触发去连接的动作

```js
web3.eth.requestAccounts().then(console.log);
```

## 转账

sendTransaction：将交易发送到网络

只有连接授权才可以进行转账，手动或代码触发成为已连接状态的账户就可以给其他人转账，**from要和当前账户对应**

```js
// 转账，使用工具函数转成wei
web3.eth.sendTransaction({
  from: '0x01F6EC963DaddE2f50d273D75318aae28bdC8851',
  to: '0x75d2005983ee0AFeDF87AD7342caeA87D571C92E',
  value: web3.utils.toWei('10','ether')
})
.then(function(receipt){
  console.log(receipt)
});
```

