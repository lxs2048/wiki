---
sidebar_position: 3
---

# React源码架构

## 核心思想

react的核心思想用一个公式表示就是状态经过计算后返回新UI，即`ui=fn(state)`

```js
// 生成一个update对象，这个update对象可能是首次渲染的时候创建的，也可能是对比新老节点差异的时候创建的，交给reconcile函数处理也就是协调器会处理更新，计算出来一个新的状态，新的state交给commit函数去处理，在commit阶段会把副作用或者新的状态应用到真实的dom节点上，就生成了新的UI
const state = reconcile(update);
const UI = commit(state);
```

fn可以分为如下部分：

- Scheduler（调度器）： 排序优先级，让优先级高的任务先进行reconcile
- Reconciler（协调器）： 对比新老节点的差异，将带有副作用的节点打上不同的Flags标识出来，并加入到EffectList里面，把带有副作用的链表交给渲染器
- Renderer（渲染器）： 将Reconciler中打好标签的节点渲染到视图上

![fn(state)](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210091122971.png!blog.guiyexing)

## scheduler

react15没有Scheduler这部分，所有任务没有优先级，也不能中断，只能同步执行

**Scheduler可以调度任务，以优先级来执行回调。**

要实现异步可中断的更新，需要浏览器指定一个时间，如果没有时间剩余了就需要暂停任务，requestIdleCallback存在兼容和触发不稳定的原因，react17中采用MessageChannel来实现。

```js
//ReactFiberWorkLoop.old.js
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {//shouldYield判断是否暂停任务
    workInProgress = performUnitOfWork(workInProgress); 
  }
}
```

在Scheduler中的每个任务的优先级使用`过期时间`来表示，如果一个任务的过期时间离现在很近，说明它马上就要过期了，优先级很高，如果过期时间很长，那它的优先级就低，没有过期的任务存放在timerQueue中，过期的任务存放在taskQueue中，timerQueue和taskQueue都是**小顶堆**，所以peek取出来的都是离现在时间最近也就是优先级最高的那个任务，然后优先执行它。

![expirationTime](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210091213879.png!blog.guiyexing)

## Lane模型

react之前的版本用`expirationTime`属性代表优先级，该优先级和IO不能很好的搭配工作（io的优先级高于cpu的优先级），现在有了更加细粒度的优先级表示方法Lane模型

Lane用二进制位表示优先级，二进制中的1表示位置，同一个二进制数可以有多个相同优先级的位，这就可以表示`批`的概念，而且二进制方便计算。

就像赛车比赛，在比赛开始的时候会分配一个赛道，比赛开始之后大家都会抢内圈的赛道（react中就是抢优先级高的Lane），比赛的尾声，最后一名赛车如果落后了很多，它也会跑到内圈的赛道，最后到达目的地（对应react中就是饥饿问题，低优先级的任务如果被高优先级的任务一直打断，到了它的过期时间，它也会变成高优先级）

Lane的二进制位如下，1的bits越多，优先级越低

```js
//ReactFiberLane.js
export const NoLanes: Lanes = 0b0000000000000000000000000000000;
export const NoLane: Lane = 0b0000000000000000000000000000000;
export const SyncLane: Lane = 0b0000000000000000000000000000001;
export const SyncBatchedLane: Lane = 0b0000000000000000000000000000010;
export const InputDiscreteHydrationLane: Lane = 0b0000000000000000000000000000100;
const InputDiscreteLanes: Lanes = 0b0000000000000000000000000011000;
const InputContinuousHydrationLane: Lane = 0b0000000000000000000000000100000;
const InputContinuousLanes: Lanes = 0b0000000000000000000000011000000;
export const DefaultHydrationLane: Lane = 0b0000000000000000000000100000000;
export const DefaultLanes: Lanes = 0b0000000000000000000111000000000;
const TransitionHydrationLane: Lane = 0b0000000000000000001000000000000;
const TransitionLanes: Lanes = 0b0000000001111111110000000000000;
const RetryLanes: Lanes = 0b0000011110000000000000000000000;
export const SomeRetryLane: Lanes = 0b0000010000000000000000000000000;
export const SelectiveHydrationLane: Lane = 0b0000100000000000000000000000000;
const NonIdleLanes = 0b0000111111111111111111111111111;
export const IdleHydrationLane: Lane = 0b0001000000000000000000000000000;
const IdleLanes: Lanes = 0b0110000000000000000000000000000;
export const OffscreenLane: Lane = 0b1000000000000000000000000000000;
```

## reconciler(render phase)

Reconciler发生在render阶段，render阶段会分别为节点执行beginWork和completeWork，或者计算state，对比节点的差异，为节点赋值相应的effectFlags（对应dom节点的增删改）

**Reconciler会创建或者更新Fiber节点**。在mount的时候会根据jsx生成Fiber对象，在update的时候会根据最新的state形成的jsx对象和current Fiber树对比构建workInProgress Fiber树，这个对比的过程就是**diff算法**。

diff算法发生在render阶段的reconcileChildFibers函数中，diff算法分为`单节点的diff`和`多节点的diff`（例如一个节点中包含多个子节点就属于多节点的diff），单节点会根据节点的key和type，props等来判断节点是复用还是直接新创建节点，多节点diff会涉及节点的增删和节点位置的变化。

reconcile时会在这些Fiber上打上Flags标签，在commit阶段把这些标签应用到真实dom上，这些标签代表节点的增删改，如

```js
//ReactFiberFlags.js
export const Placement = 0b0000000000010;
export const Update = 0b0000000000100;
export const PlacementAndUpdate = 0b0000000000110;
export const Deletion = 0b0000000001000;
```

render阶段遍历Fiber树类似DFS的过程，`捕获`阶段发生在beginWork函数中，该函数做的主要工作是创建Fiber节点，计算state和diff算法，`冒泡`阶段发生在completeWork中，该函数主要是做一些收尾工作，例如处理节点的props、和形成一条effectList的链表，该链表是被标记了更新的节点形成的链表

深度优先遍历过程如下，图中的数字是顺序，return指向父节点

```js
function App() {
  return (
   	<>
      <h1>
        <p>count</p> hello
      </h1>
    </>
  )
}
```

![workInProgress to current](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202209281213189.png!blog.guiyexing)

看如下代码

```js
function App() {
  const [count, setCount] = useState(0);
  return (
   	 <>
      <h1
        onClick={() => {
          setCount(() => count + 1);
        }}
      >
        <p title={count}>{count}</p> hello
      </h1>
    </>
  )
}
```

点击h1后p标签要被标识带有副作用，同时h1也会被标识，因为click函数是一个匿名函数，每次render时这个匿名函数的地址都是不一样的，所以h1也会被标识上副作用，最后形成effectList如下，从rootFiber->p->h1

![click h1 effectList](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210091249239.png!blog.guiyexing)

注意：fiberRootNode是整个项目的根节点，只存在一个，rootFiber是应用的根节点，可能存在多个，例如多个`ReactDOM.render(<App />, document.getElementById("root"));`可以创建多个应用节点

## renderer(commit phase)

Renderer是在commit阶段工作的，commit阶段会遍历render阶段形成的effectList，并执行真实dom节点的操作和一些生命周期，不同平台对应的Renderer不同，例如浏览器对应的就是react-dom。

commit阶段发生在commitRoot函数中，该函数主要遍历effectList，分别用三个函数来处理effectList上的节点，这三个函数是commitBeforeMutationEffects、commitMutationEffects、commitLayoutEffects。

![commit阶段整体架构图](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210092040091.png!blog.guiyexing)

## concurrent模式

它是一类功能的合集（如fiber、schduler、lane、suspense），其目的是为了提高应用的响应速度，使应用cpu密集型的更新不在那么卡顿，其核心是实现了一套异步可中断、带优先级的更新。

一般浏览器的fps是60Hz，也就是每16.6ms会刷新一次，而js执行线程和GUI也就是浏览器的绘制是互斥的，因为js可以操作dom，影响最后呈现的结果，所以如果js执行的时间过长，会导致浏览器没时间绘制dom，造成卡顿。react17会在每一帧分配一个时间（时间片）给js执行，如果在这个时间内js还没执行完，那就要暂停它的执行，等下一帧继续执行，把执行权交回给浏览器去绘制。

![js16.6ms](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210091308892.png!blog.guiyexing)

concurrent mode开启之后，构建Fiber的任务的执行不会一直处于阻塞状态，而是分成了一个个的task

![concurrent模式](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210091923322.png!blog.guiyexing)

