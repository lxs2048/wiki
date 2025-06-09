---
slug: online-Judge
title: ACM模式使用JS
authors: [dolphin]
tags: [OJ,Online Judge]
date: 2022-10-18T20:49
---

## ACM模式输入输出

[OJ说明文档](https://labfiles.acmcoder.com/ojhtml/index.html#/?id=%e6%80%bb%e4%bd%93%e8%af%b4%e6%98%8e)

在机试时往往都需要用ACM模式，也就是需要自己处理输入和输出（注意：力扣为核心模式）。Javascript主要有`Javascript(V8)`和`Javascript(Node)`两种

[OJ在线编程常见输入输出练习场](https://ac.nowcoder.com/acm/contest/5657)

<!--truncate-->

## v8输入输出

第四题为例[A+B(4)](https://ac.nowcoder.com/acm/contest/5657/D)

对于针对单行输入，我们直接用`let line = readline();`即可。

在`Javascript(V8)`下可以直接使用`readline`，并且通过`print`来输出结果

```js
while(line = readline()){
    if(line === '0') break
    const lines = line.split(' ').map(Number)
    let ret = 0
    for(let i=1;i<lines.length;i++){
        ret += lines[i]
    }
    print(ret)
}
```

## node输入输出

还是以第四题为例[A+B(4)](https://ac.nowcoder.com/acm/contest/5657/D)

在`Javascript(node)`下可以需要导入`readline`包，通过固定的方法编写代码，通过`console.log`来输出结果

```js
const readline = require('readline')
const rl = readline.createInterface({
    input:process.stdin,
    output:process.stdout
})
rl.on('line',(line)=>{
    if(line === '0'){
        rl.close()
    }else{
        const lines = line.split(' ').map(Number)
        let res = 0
        for(let i=1;i<lines.length;i++){
            res += lines[i]
        }
        console.log(res)
    }
})
```

通用模板

```js
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const inputArr = [];//存放输入的数据
rl.on('line', function(line){
  //line是输入的每一行，为字符串格式
    inputArr.push(line.split(' '));//将输入流保存到inputArr中（注意为字符串数组）
}).on('close', function(){
    console.log(fun(inputArr))//调用函数并输出
})

//解决函数
function fun() {
	xxxxxxxx
	return xx
}
```

## 练习

- [ A+B(1)](https://ac.nowcoder.com/acm/contest/5657/A)

  ```js
  while (line = readline()) {
      const [x,y]=line.split(" ").map(Number)
      print(x+y)
  }
  ```

- [A+B(2)](https://ac.nowcoder.com/acm/contest/5657/B)

  ```js
  let num = 0
  while(line = readline()){
      if(num === 0){
          num = line
      }else{
          const [x,y]=line.split(" ").map(Number)
          print(x+y)
      }
  }
  ```

- [A+B(3)](https://ac.nowcoder.com/acm/contest/5657/C)

  ```js
  while(line = readline()){
      if(line === '0 0'){
          break
      }else{
          const [x,y]=line.split(" ").map(Number)
          print(x+y)
      }
  }
  ```

- [A+B(4)](https://ac.nowcoder.com/acm/contest/5657/D)

  ```js
  while(line = readline()){
      if(line === '0') break
      const lines = line.split(' ').map(Number)
      let ret = 0
      for(let i=1;i<lines.length;i++){
          ret += lines[i]
      }
      print(ret)
  }
  ```

- [A+B(5)](https://ac.nowcoder.com/acm/contest/5657/E)

  ```js
  let row = 0
  while(line=readline()){
      const rowData = line.split(' ').map(Number)
      if(rowData.length === 1){
          row = rowData[0]
      }else{
          let ret = 0
          for(let i=1;i<rowData.length;i++){
              ret += rowData[i]
          }
          print(ret)
      }
  }
  ```

- [A+B(6)](https://ac.nowcoder.com/acm/contest/5657/F)

  ```js
  while(line=readline()){
      const rowData = line.split(' ').map(Number)
      let ret = 0
      for(let i=1;i<rowData.length;i++){
          ret += rowData[i]
      }
      print(ret)
  }
  ```

- [A+B(7)](https://ac.nowcoder.com/acm/contest/5657/G)

  ```js
  while(line=readline()){
      const lines = line.split(' ').map(Number)
      let ret = lines.reduce((pre,cur)=>{
         return pre+cur
      },0)
      print(ret)
  }
  ```

- [字符串排序(1)](https://ac.nowcoder.com/acm/contest/5657/H)

  ```js
  const readline = require('readline')
  const rl = readline.createInterface({
    input:process.stdin,
    output:process.stdout
  })
  let num = 0
  rl.on('line',(line)=>{
    if(num === 0){
      num = line
    }else{
      const lines = line.split(' ')
      const ret = lines.sort((a,b)=>{
        return a.localeCompare(b)
      })
      console.log(ret.join(' '))
    }
  })
  ```

- [字符串排序(2)](https://ac.nowcoder.com/acm/contest/5657/I)

  ```js
  const readline = require('readline')
  const rl = readline.createInterface({
    input:process.stdin,
    output:process.stdout
  })
  rl.on('line',(line)=>{
    const lines = line.split(' ')
    const ret = lines.sort((a,b)=>{
      return a.localeCompare(b)
    })
    console.log(ret.join(' '))
  })
  ```

- [字符串排序(3)](https://ac.nowcoder.com/acm/contest/5657/J)

  ```js
  const readline = require('readline')
  const rl = readline.createInterface({
    input:process.stdin,
    output:process.stdout
  })
  rl.on('line',(line)=>{
    const lines = line.split(',')
    const ret = lines.sort((a,b)=>{
      return a.localeCompare(b)
    })
    console.log(ret.join(','))
  })
  ```

- [自测本地通过提交为0](https://ac.nowcoder.com/acm/contest/5657/K)

  ```js
  const readline = require('readline')
  const rl = readline.createInterface({
    input:process.stdin,
    output:process.stdout
  })
  rl.on('line',(line)=>{
    const [a,b] = line.split(' ').map(Number)
    console.log(a+b)
  })
  ```

![image-20221019122257048](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210191223967.png!blog.guiyexing)

## 新手上路

[【新手上路】语法入门&算法入门题单](https://ac.nowcoder.com/discuss/817596?f=b)

### 顺序结构程序设计

**取整运算**

```js
let num = 7873244 / 773
console.log(num);//10185.309184993532
// 直接取整（丢弃小数部分）
console.log(Number.parseInt(num))// 10185
// 四舍五入取整
console.log(Math.round(num))// 10185
// 向上取整
console.log(Math.ceil(num))// 10186
// 向下取整
console.log(Math.floor(num))// 10185
```

**字符串转整型与浮点型**

```js
console.log(Number.parseInt('1.359578'));//字符串转整型：1
console.log(Number.parseFloat('1.359578'));//字符串转浮点型：1.359578
```

**保留指定位数小数**

“银行家舍入”是IEEE754标准的推荐舍入标准,toFixed就是使用该标准：“四舍六入五成双”

注意：toFixed(num)返回值为string

```js
console.log((3.651).toFixed(1)) //3.7
console.log((3.65).toFixed(1)) //3.6  51成双，5后面没有就不进位了
```

**取余和取模**

取余是数学中的概念，取模是计算机中的概念，两者都是求两数相除的余数

1. 在 JavaScript 中，模运算（没有专用的运算符）可以使用 ((n % d) + d) % d。
2. 对于同号的两个操作数，两者是等价的，但在操作数具有不同的符号时，取模运算的结果总是与除数同号，而取余运算则是余数与被除数同号

```js
console.log(7%3);//1
console.log(7%-3);//1
console.log(-7%3);//-1
console.log(-7%-3);//-1
function mod(n, m) {  return ((n % m) + m) % m; }
console.log(mod(7,3));//1
console.log(mod(7,-3));//-2
console.log(mod(-7,3));//2
console.log(mod(-7,-3));//-1
```

* (-7) % 3取余运算(-2.333)，向0方向舍入，取 -2。因此 (-7) % 3 商 -2 余数为 -1
* (-7) Mod 3取模运算(-2.333)，向无穷小方向舍入，取 -3。因此 (-7) Mod 4 商 -3 余数为 2

举个🌰：

输入一个n，输出其个位数：`print(n%10)`

**js字符与ASCII码互转的方法**

```js
('A').charCodeAt();  // 65
String.fromCharCode(65);  // 'A'
```

**进制转换**

一、Number.parseInt(string , radix)

解析一个字符串并返回指定基数的十进制整数，如果字符串中最大的一个值超过基数就返回NaN

```js
Number.parseInt('010',8)//8
Number.parseInt('20',2)//NaN
```

二、Number.toString(radix)

将十进制数字转换为任意进制的字符串形式，同样，radix表示进制，取值2~36。

```js
(10).toString(2)//"1010"转2进制
(10).toString(16)//"a" 转16进制
(1000).toString(36)//"rs" 转36进制
```

**数学计算**

`sqrt()`方法可返回一个数的平方根，如果参数小于0，则返回NaN。

```js
console.log(Math.sqrt(4));// 2
```

`pow(x,y)`可返回x的y次幂,当参数为分数（大于0，小于1），即pow(x,1/y)可以开x的y次方根

```js
console.log(Math.pow(2,3));// 8
console.log(Math.pow(8,1/3));// 2
```

举个🌰：

知道三角形的3边求面积

```js
while(line = readline()){
    const [a,b,c] = line.split(' ').map(Number)
    const circ = a+b+c
    const p = circ/2
    const area = Math.sqrt(p*(p-a)*(p-b)*(p-c))
    const ret = `circumference=${circ.toFixed(2)} area=${area.toFixed(2)}`
    print(ret)
}
```

**环境问题**：`nodejs 15.X开始支持replaceAll方法`

试计算在区间1 到n 的所有整数中，数字x（0 ≤ x ≤ 9）共出现了多少次？  

例如，在1到11 中，即在1、2、3、4、5、6、7、8、9、10、11 中，数字1 出现了4 次。

```js
while(line = readline()){
    const [n,x] = line.split(' ').map(Number)
    let ret = 0
    for(let i=1;i<=n;i++){
        let str = i.toFixed()
       // nodejs 15.X开始支持replaceAll方法
        // let add = str.length - str.replaceAll(x,'').length
        let pattern = new RegExp(x,"g")
        let add = str.length - str.replace(pattern,'').length
        ret += add
    }
    print(ret)
}
```
