---
sidebar_position: 4
---

# Promise

[Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise) 对象用于表示一个异步操作的最终完成（或失败）及其结果值。

## 标准函数回调

有callback不是异步的标志，fakeFunction内所有的过程都在cpu中完成的

```js
function fakeFunction(n,callback){
    const result = n*n
    callback && callback(result)
}
function cbHandler(rslt){
    console.log(`rslt is ${rslt}`)
}
function main(){
    console.log('>>> main +++')
    fakeFunction(6,cbHandler)
    console.log('>>> main ---')
}
main()
```

## 并发执行

异步非阻塞会让js执行效率特别高，可以并发的执行

```js
function fakeFunction(n,callback){
    setTimeout(()=>{
        const dt = new Date()
        const rt = `${n} ${dt.toLocaleString()}`
        callback && callback(rt)
    },n*100)
}
function cbHandler(rslt){
    console.log(`rslt is ${rslt}`)
}
function main(){
    console.log('>>> main +++')
    fakeFunction(6,cbHandler)
    fakeFunction(9,cbHandler)
    fakeFunction(8,cbHandler)
    console.log('>>> main ---')
}
main()
```

## 依次执行

如果想一个一个的执行，那该怎么办呢

```js
function main(){
    console.log('>>> main +++')
    fakeFunction(6,r1=>{
        console.log(`r1 is ${r1}`)
        fakeFunction(9,r2=>{
            console.log(`r2 is ${r2}`)
            fakeFunction(8,r3=>{
                console.log(`r3 is ${r3}`)
            })
        })
    })
    console.log('>>> main ---')
}
```

形成回调的嵌套，也就是回调地狱，对于简单逻辑还好，如果复杂且层数多时，命名都是问题

## 异常捕获

错误捕获很多代码都是重复的

```js
function fakeFunction(n,callback){
    if(n<0){
        callback(new Error('min is 0'))
        return
    }
    setTimeout(()=>{
        const dt = new Date()
        const rt = `${n} ${dt.toLocaleString()}`
        callback && callback(rt)
    },n*100)
}
function cbHandler(rslt){
    console.log(`rslt is ${rslt}`)
}
function main(){
    console.log('>>> main +++')
    fakeFunction(6,r1=>{
        if(r1 instanceof Error){
            console.error(r1)
            return
        }
        console.log(`r1 is ${r1}`)
        fakeFunction(-9,r2=>{
            if(r2 instanceof Error){
                console.error(r2)
                return
            }
            console.log(`r2 is ${r2}`)
            fakeFunction(8,r3=>{
                if(r3 instanceof Error){
                    console.error(r3)
                    return
                }
                console.log(`r3 is ${r3}`)
            })
        })
    })
    console.log('>>> main ---')
}
main()
```

那么就需依赖promise去解决这个问题

## promise链式调用

promise封装，通过链式调用，假设fakeFunction是第三方提供的，当做一个黑盒去处理

```js
function fakeFunction(n,callback){
    if(n<0){
        callback(new Error('min is 0'))
        return
    }
    setTimeout(()=>{
        const dt = new Date()
        const rt = `${n} ${dt.toLocaleString()}`
        callback && callback(rt)
    },n*100)
}
function proFake(n){
    return new Promise((reslove,reject)=>{
        fakeFunction(n,(r)=>{
            if(r instanceof Error){
                reject(r)
            }else{
                reslove(r)
            }
        })
    })
}
function main(){
    console.log('>>> main +++')
    proFake(6).then(res=>{
        console.log(`r1 is ${res}`)
        return proFake(-9)
    }).then(res=>{
        console.log(`r2 is ${res}`)
        return proFake(8)
    }).then(res=>{
        console.log(`r3 is ${res}`)
    }).catch(err=>{
        console.error(err)
    })
    console.log('>>> main ---')
}
main()
```

## 语法糖async/await

语法糖`async/await`，异常处理使用`try{}catch{}`

注意：最后一个await后的所有代码都包含在这个链里面，所以以下代码中main---最后执行

```js
async function main (){
    console.log('>>> main +++')
    try{
        const r1 = await proFake(6)
        console.log(`r1 is ${r1}`)
        const r2 = await proFake(9)
        console.log(`r2 is ${r2}`)
        const r3 = await proFake(8)
        console.log(`r3 is ${r3}`)
    }catch(err){
        console.error(err)
    }
    console.log('>>> main ---')
}
```

如果不想让main去等可以在次封装

```js
async function stepAsync (){
    try{
        const r1 = await proFake(6)
        console.log(`r1 is ${r1}`)
        const r2 = await proFake(9)
        console.log(`r2 is ${r2}`)
        const r3 = await proFake(8)
        console.log(`r3 is ${r3}`)
    }catch(err){
        console.error(err)
    }
}
function main(){
    console.log('>>> main +++')
    stepAsync()
    console.log('>>> main ---')
}
```

async/await甚至可以在循环中使用来简化代码

```js
function stepAsync (){
    try{
        [6,9,8,10,2].forEach(async v=>{
            const r = await proFake(v)
            console.log(r)
        })
    }catch(err){
        console.error(err)
    }
}
```

async/await封装并发执行任务

```js
async function stepAsync (){
    try{
        let p1 = proFake(6)
        let p2 = proFake(9)
        let p3 = proFake(8)
        const [r1,r2,r3] = await Promise.all([p1,p2,p3])
        console.log(r1)
        console.log(r2)
        console.log(r3)
    }catch(err){
        console.error(err)
    }
}
```

## 异步网络请求

### node接口

```js
app.get('/hello', (req, res) => {
    res.send('hi')
})
app.get('/hi', (req, res) => {
    res.send('cheer')
})
app.get('/cheer', (req, res) => {
    res.send('cheer up')
})
```

### 原生ajax请求

```js
let xhr = new XMLHttpRequest();
xhr.open('get','http://localhost:3000/hello');
xhr.send(null);
xhr.onreadystatechange = function() {
    if(xhr.readyState == 4 && xhr.status == 200) {
        let ret = xhr.responseText;
        console.log(ret)
    }
}
```

### 封装ajax请求

```js
function queryData(path, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('get','http://localhost:3000/' + path);
    xhr.send(null);
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4 && xhr.status == 200) {
            let ret = xhr.responseText;
            callback && callback(ret);
        }
    }
}
queryData('hello',function(ret){
    console.log(ret)
})
```

### 回调地狱

按顺序获取数据就会产生**回调地狱**问题

```js
queryData('hello',function(ret){
    console.log(ret);
    queryData(ret,function(ret){
        console.log(ret);
        queryData(ret,function(ret){
            console.log(ret)
        })
    })
})
```

为了改造上面的回调地狱问题，诞生了promise。

### promise封装ajax

```js
function queryData(path) {
    return new Promise((reslove,reject)=>{
        let xhr = new XMLHttpRequest();
        xhr.open('get','http://localhost:3000/' + path);
        xhr.send(null);
        xhr.onreadystatechange = function() {
            if(xhr.readyState != 4) return;
            if(xhr.readyState == 4 && xhr.status == 200) {
                let ret = xhr.responseText;
                reslove(ret);
            }else{
                reject('Server Error')
            }
        }
    })
}
queryData('hello').then(
    res=>{
        console.log(res)//hi
    }
).then(res=>{
    console.log(res)//没有返回值undefined
})
// promise链式调用
queryData('hello').then(res=>{
    console.log(res)
    return queryData(res) 
}).then(res=>{
    console.log(res)
    return queryData(res)
}).then(res=>{
    console.log(res)
    return 'what';//.then内返回的内容不是promise自动转换为promise
}).then(res=>{
    console.log(res);//what
})
```

Promise 确实解决了回调地狱问题，但是 Promise 本身还是存在 then 的链式调用问题，所以可以使用语法糖 async...await，用同步的方式来书写异步代码

### async/await

async/await本质上还是基于Promise的一些封装，所以在使用await关键字与Promise.then效果类似

```js
const getData = async ()=>{
    let res1 = await queryData('hello');
    console.log(res1)
    let res2 = await queryData(res1);
    console.log(res2)
    let res3 = await queryData(res2);
    console.log(res3)
    return 'what'
}
const what = getData()
console.log(what)//最新打印
what.then(res=>{
    console.log(res)//res123的后面执行
})
```

`await` 以前的代码，相当于与 `new Promise` 的同步代码，`await` 以后的代码相当于 `Promise.then`的异步

注意：**async函数的返回值也是Promise实例对象**

### 失败重试

自定义重试函数

```js
const retry = async (fn,times,...arg)=>{
    while(times--){
        try{
            const res = await fn(...arg)
            return res
        }catch(error){
            console.log('执行一次失败：',error)
        }
    }
    return Promise.reject('最终执行失败')
}
```

重试测试

```js
const getData = async ()=>{
    let res1 = await retry(queryData,5,'hello');
    console.log(res1)
    let res2 = await queryData(res1);
    console.log(res2)
    let res3 = await queryData(res2);
    console.log(res3)
    return 'what'
}
getData()
```

后端配合报错

```js
app.get('/hello', (req, res) => {
    if(Math.random()<0.8){
        res.status(500).send('server error')
        return
    }
    res.send('hi')
})
```

### 其他方法

* `Promise.finally()`方法用于指定不管 Promise 对象最后状态如何，都会执行的操作。该方法是 ES2018 引入标准的。
* `Promise.catch()`方法是`.then(null, rejection)`或`.then(undefined, rejection)`的别名，用于指定发生错误时的回调函数（如果 Promise 状态已经变成`resolved`，再抛出错误是无效的）。
* `Promise.all()`方法用于将多个 Promise 实例，包装成一个新的 Promise 实例。

### 思考

使用第三方回调 API 的时候，可能会遇到如下问题

1. 回调函数执行多次
2. 回调函数没有执行
3. 回调函数有时同步执行有时异步执行

对于第一个问题，Promise 只能 resolve 一次，剩下的调用都会被忽略。

对于第二个问题，可以使用 Promise.race 函数来解决

对于第三个问题，同步和异步混用的代码作为内部实现，只暴露接口给外部调用，调用方由于无法判断是到底是异步还是同步状态

PromiseA+ 规范也有明确的规定：

> 实践中要确保 onFulfilled 和 onRejected 方法异步执行，且应该在 then 方法被调用的那一轮事件循环之后的新执行栈中执行。

