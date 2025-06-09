# vite性能优化概述

我们平时说性能优化是在说什么东西?

**开发时态的构建速度优化**： yarn dev | yarn start敲下的一瞬间到呈现结果要占用多少时长

- webpack在这方面下的功夫是很重：webpack4【cache-loader】，webpack5【cache选项，缓存loader的结果】 ( 如果两次构建源代码没有产生变化，则直接使用缓存不调用loader )，thread-loader开启多线程去构建....
- vite是按需加载，所以我们不需要太注意这方面

**页面性能指标**：和我们怎么去写代码有关

* 首屏渲染时： fcp(first content paint)， (first content paint ->页面中第一个元素的渲染时长)
  * 懒加载：需要我们去写代码实现的
  * http优化：协商缓存和强缓存
    * 强缓存：服务端给响应头追加一些字段(expires)，客户端会记住这些字段，在expires (截止失效时间)没有到达之前，无论你怎么刷新页面，浏览器都不会重 新请求页面，而是从缓存里取
    * 协商缓存：是否使用缓存要跟后端商量一下，当服务端给我们打上协商缓存的标记以后，客户端在下次刷新页面需要重新请求资源时会发送一个协商请求给到服务端,服务端如果说需要变化则会响应具体的内容，如果服务端觉得没变化则会响应304

* 页面中最大元素的一个时长： lcp(largest content paint)
* ...

**js逻辑**：

* 我们要注意副作用的清除：组件是会频紧的挂载和卸载，如果我们在某一个组件中有计时器( setT imeout),如果我们在卸载的时候不去清除这个计时器，下次再次挂载的时候计时器等于开了两个线程
  ```js
  const [timer, setTimer] = useState(null);
  useEffect(() => {
    setTimer(setTimeout(() => {}));
    return () => clearTimeout (timer);
  })
  ```

* 我们在写法上注意事项： requestAnimationFrame, requestIdleCallback 卡浏览器帧率，对浏览器渲染原理要有一定的认识 然后再这方面做优化

  * 浏览器的帧率： 16. 6ms去更新一次(执行js逻辑 以及重排重绘...)，假设我的js执行逻辑超过了16.6掉帧了
  * requestIdleCallback： 传一个函数进去，在空闲的时候执行
  * concurrent mode - -> concurrency 异步可中断渲染react

* 防抖节流，自己写有性能优化问题，lodashJS工具

  * 如有比较多的数据需要遍历时不要Array.prototype.forEach，使用lodash提供的forEach内部做了算法优化

* 对作用域的控制
  ```js
  const arr = [1,2,3]
  for(let i=0,len = arr.length;i<len;i++){
    //就不用每次都去父级作用域去查
  }
  ```

**css**：

* 关注继承属性：能继承的就不要重复写
* 尽量避免太过于深的css嵌套

**构建优化**： vite( rollup) webpack

* 优化体积：压缩，treeshaking， 图片资源压缩，cdn加载，分包...