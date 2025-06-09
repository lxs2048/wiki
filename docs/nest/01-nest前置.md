# Nest前置

## IOC & DI

Inversion of Control控制反转表示高层模块不应该依赖低层模块，二者都应该依赖其抽象；抽象不应该依赖细节；细节应该依赖抽象

Dependency Injection依赖注入与IOC原本就是一个东西，由于控制反转概念比较含糊（可能只是理解为容器控制对象这一个层面，很难让人想到谁来维护对象关系），所以2004年大师级人物Martin Fowler又给出了一个新的名字：“依赖注入”。 **类A依赖类B的常规表现是在A中使用B的instance**。

```js
//现在有一个A类和B类
class A {
    name: string
    constructor(name: string) {
        this.name = name
    }
}
class B {
    name: string
    constructor(name: string) {
        this.name = name
    }
}
// 想要在C类中使用这两个
class C {
    a:any
    b:any
    name:string
    constructor(name: string) {
        this.name = name
        this.a = new A('zhangsan')
        this.b = new B('lisi')
    }
}
const c = new C('wangwu')
console.log(c)
```

现在A类或者B类又要传递一些其他参数，在C类中的使用就会受影响，也要同步去改，**代码耦合度非常高会增加维护成本**，就出现了**控制反转**和**依赖注入**来解决这种问题

创建一个容器Container来收集引用，类似于发布订阅

```js {14-28,36-37}
//现在有一个A类和B类
class A {
    name: string
    constructor(name: string) {
        this.name = name
    }
}
class B {
    name: string
    constructor(name: string) {
        this.name = name
    }
}
class Container {
    models:any
    constructor(){
        this.models = {}
    }
    provide(key:string,model:any){
        this.models[key] = model
    }
    get(key:string){
        return this.models[key]
    }
}
const mo = new Container()
mo.provide('a',new A('zhangsan'))
mo.provide('b',new B('lisi'))
// 想要在C类中使用这两个
class C {
    a:any
    b:any
    name:string
    constructor(name: string) {
        this.name = name
        this.a = mo.get('a')
        this.b = mo.get('b')
    }
}
const c = new C('wangwu')
console.log(c)
```

这样就实现了**解耦**，减少维护成本

## 装饰器

装饰器是一种特殊的类型声明，可以附加在类，方法，属性，参数上面

```js
const abc:ClassDecorator = (target:any)=>{
    console.log(target) // 构造函数
    target.prototype.__name = 'zhangsan'
    target.prototype.__hobby = ()=>{
        console.log('🏀');
    }
}
const def:PropertyDecorator = (target:any,key:string|symbol)=>{
    console.log(target,key) // 原型对象，属性名称
}
const ghi:MethodDecorator = (target:any,key:string|symbol,decorator:any)=>{
    console.log(target,key,decorator) // 原型对象，方法名称，描述符
}
const jkl:ParameterDecorator = (target:any,key:string|symbol,index:number)=>{
    console.log(target,key,index) // 原型对象，方法名称, 参数索引
}
@abc
class A{
    @def
    name:string
    constructor(){}
    @ghi
    hello(hi:string,@jkl count:number){

    }
}
const a:any = new A()
console.log(a.__name);
a.__hobby()
```

**类装饰器abc**：把class的构造函数传入到装饰器的第一个参数，通过prototype可以自定义添加属性和方法

**属性装饰器def**：接收两个参数，原型对象和属性名称

**方法装饰器ghi**：接收三个参数，原型对象，方法名称，描述符

* configurable:true 可配置enumerable: false 可枚举writable:true 可写

**参数装饰器jkl**：接收三个参数，原型对象，方法名称, 参数索引012...

---

使用装饰器工厂封装一个请求，装饰器本身不需要传参，我们使用[柯里化](https://baike.baidu.com/item/%E6%9F%AF%E9%87%8C%E5%8C%96/10350525?fr=aladdin)方式接收自定义参数，返回一个函数去接收默认的参数，把axios的结果返回给当前使用装饰器的函数

```js
import axios from 'axios'
 
const Get = (url: string): MethodDecorator => {
    return (target, key, descriptor: PropertyDescriptor) => {
        const fnc = descriptor.value;
        axios.get(url).then(res => {
            fnc(res, {
                status: 200,
            })
        }).catch(e => {
            fnc(e, {
                status: 500,
            })
        })
    }
}
 
//定义控制器
class Controller {
    constructor() {}
    @Get('https://api.apiopen.top/api/getHaoKanVideo?page=0&size=10')
    getList (res: any, status: any) {
        console.log(res.data.result.list, status)
    }
}
```

## 柯里化

柯里化（Currying）是一种关于函数的高阶技术，它不仅被用于JavaScript，还被用于其他编程语言。

柯里化不会调用函数它只是对函数进行转换，将一个函数从可调用的`f(a, b, c)` 转换为可调用的`f(a)(b)(c)`

先来看一个例子，我们如何实现`sum(1)(2)(3) === 6`？

```js
function sum(a) {
    return function (b) {
        return function (c) {
            return a + b + c
        }
    }
}
console.log(sum(1)(2)(3) === 6) // true
```

利用闭包特性，我们可以针对这个问题给出方案，我们还可以创建一个辅助函数`curry(f)`，该函数将对多个参数的函数`f`执行柯里化。换句话说，对于两个参数的函数`f(a, b)`执行`curry(f)`会将其转换为以`f(a)(b)`形式运行的函数

```js
function sum(a, b, c) {
    return a + b + c
}
function curry(f) {
    return function (a) {
        return function (b) {
            return function (c) {
                return f(a, b, c)
            }
        }
    }
}
const currySum = curry(sum)
console.log(currySum(1)(2)(3) === 6) // true
```

* curry(sum)的结果就是一个包装器function(a)
* 当它被像currySum(1)这样调用时，它的参数会被保存在词法环境中，然后返回一个新的包装器function(b)。
* 继续currySum(1)(2)这样调用时，它的参数又会被保存在词法环境中，然后返回一个新的包装器function(c)。
* 然后这个包装器被以3为参数调用，并且它将该调用传递给原始的sum函数返回结果

柯里化更高级的实现，例如lodash库的`_.curry`，会返回一个包装器，该包装器允许函数被正常调用或者以偏函数（partial）的方式调用:

```js
import { curry } from 'lodash'
function sum(a, b, c) {
    return a + b + c
}
let curriedSum = curry(sum); // 使用来自 lodash 库的 _.curry
console.log(curriedSum(1)(2, 3)) // 6 对第一个参数的柯里化
console.log(curriedSum(1, 2)(3)) // 6 对前两个参数柯里化
console.log(curriedSum(1)(2)(3)) // 6 全柯里化
```

**手写柯里化函数**

``` js
function curry(func) {
  return function curried(...args) {
    if (args.length >= func.length) {
      return func.apply(this, args);
    } else {
      return function(...args2) {
        return curried.apply(this, args.concat(args2));
      }
    }
  };
}
```

用例：

```js
function sum(a, b, c) {
  return a + b + c
}

let curriedSum = curry(sum);
console.log(curriedSum(1)(2, 3)) // 6
console.log(curriedSum(1, 2)(3)) // 6
console.log(curriedSum(1)(2)(3)) // 6
```

当我们运行它时，有两个if执行分支，如果传入的 args 长度与原始函数所定义的（func.length）相同或者更长，那么只需要使用func.apply将调用传递给它即可。
否则，获取一个偏函数，返回另一个包装器，它将重新应用curried，再次调用就将之前传入的参数与新的参数一起传入，然后去判断得到一个新的偏函数（如果没有足够的参数），或者最终的结果。

如果我们传入的是一个带有this指向的函数，很可能拿不到我们想要的结果

```js
class Test {
    a = 1
    b = 2
    c = 3
    getSum(a, b, c) {
        console.log(this);//Window
        return this.a + this.b + this.c + a + b + c
    }
}
const test = new Test()
let curriedSum = curry(test.getSum);
console.log(curriedSum(1)(2, 3)) // NaN
console.log(curriedSum(1, 2)(3)) // NaN
console.log(curriedSum(1)(2)(3)) // NaN
```

最终因为this指向的是Window对象，没有abc，undefined+number为NaN，甚至lodash里的也是如此，因为**this就是函数运行时所处的环境对象,当没有调用函数的时候，this的指向是没有被绑定的，所以this的指向此时是无法判断的**

实际应用：

假设我们有一个用于格式化和输出信息的日志函数

```js
function logging(date, importance, message) {
    console.log(`[${date.getHours()}:${date.getMinutes()}] [${importance}] ${message}`);
}
logging(new Date(),'info','划水')
```

我们将他柯里化也能得到最终结果

```js
const log = curry(logging)
log(new Date())('debug')('500')
```

我们的目的是要**创建便捷函数**，如logNow会是带有固定第一个参数的日志的偏函数

```js
let logNow = log(new Date());
// 使用
logNow("info", "嗨害嗨");
```

现在logNow是具有固定第一个参数的log，换句话说，就是更简短的“偏应用函数（partially applied function）”或“偏函数（partial）”，我们可以更进一步，为当前的调试日志（debug log）提供便捷函数

```js
let debugNow = logNow("DEBUG");
debugNow("404");
```

总结：

柯里化是一种转换，将 f(a,b,c) 转换为可以被以 f(a)(b)(c) 的形式进行调用，如果参数数量不足，则返回偏函数。

## RxJS

在Nestjs已经内置了RxJs无需安装，并且Nestjs也会有一些基于Rxjs提供的API

[RxJS中文文档](https://cn.rx.js.org/manual/overview.html)

![image-20221120104749976](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211201047023.png!blog.guiyexing)

下面看一些示例，更多参加官网

一、类似于迭代器next 发出通知complete通知完成，subscribe订阅observable发出的通知，也就是一个观察者

```ts
import {Observable} from 'rxjs'
const observable = new Observable(subscriber=>{
    subscriber.next(1)
    subscriber.next(2)
    subscriber.next(3)
    setTimeout(()=>{
        subscriber.next(5)
        subscriber.complete()
    },1000)
    subscriber.next(4)
})

observable.subscribe({
    next:(value)=>{
       console.log(value)
    }
})
```

二、`interval`五百毫秒执行一次`pipe`就是管道的意思，使用map和filter去处理和过滤数据， 最后通过观察者subscribe接受回调，里面使用unsubscribe取消观察

```ts
import { interval } from "rxjs";
import { map, filter } from 'rxjs/operators'

const subs = interval(500)
    .pipe(map(v => ({ num: v })), filter(v => (v.num % 2 == 0)))
    .subscribe((e) => {
        console.log(e)
        if (e.num == 10) {
            subs.unsubscribe()
        }
    })
```

三、操作dom，按照官网示例

```ts
useEffect(() => {
  var button = document.querySelector('button');
  const func = (e: MouseEvent) => console.log(e, '数据😎😎😎');
  button?.addEventListener('click', func)
  return () => {
    button?.removeEventListener('click', func)
  }
}, [])
useEffect(() => {
  var button = document.querySelector('button') as HTMLButtonElement;
  const dom = fromEvent(button, 'click')
  const subs = dom.subscribe(e => {
    console.log(e, '数据😎😎😎');
  });
  return () => {
    subs.unsubscribe()
  }
}, [])
```
