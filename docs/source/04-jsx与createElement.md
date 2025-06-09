---
sidebar_position: 4
---

# JSX&核心API

## 浏览器绘制过程

![202209261152230](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202209261152230.png!blog.guiyexing)

**查看DOM上的属性**

```js
const div = document.createElement('div');
let lists = []
for (let k in div) {
    lists.push(k)
}
console.log(lists.join(','))
```

![image-20220926114422897](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202209261144933.png!blog.guiyexing)

## virtual DOM是什么

用js对象表示DOM的信息，更新时重新渲染更新后的对象对应的DOM，这个对象就是React.createElement()的返回结果

virtual DOM是一种编程方式，它以对象的形式保存在内存中，它描述了真实DOM的必要信息，并且用类似react-dom等模块与真实DOM同步，这一过程也叫协调(reconciler)，这种方式可以声明式的渲染相应的ui状态，让我们从DOM操作中解放出来，在react中是以fiber树的形式存放组件树的相关信息，在更新时可以增量渲染相关DOM，所以fiber也是virtual DOM实现的一部分

**为什么要用virtual DOM**

* 大量的DOM操作慢，很小的更新都有可能引起页面的重新排列，js对象优于在内存中，处理起来更快，可以通过diff算法比较新老virtual DOM的差异，并且批量、异步、最小化的执行DOM的变更，以提高性能

* Virtual DOM可以跨平台，jsx --> ReactElement对象 --> 真实节点，有中间层的存在，就可以在操作真实节点之前进行对应的处理，处理的结果反映到真实节点上，这个真实节点可以是浏览器环境，也可以是Native环境

**virtual DOM真的快吗？**

*其实virtual DOM只是在更新的时候快，在应用初始的时候不一定快*

## jsx&createElement

jsx是js语法的扩展，可以声明式的描述视图，也就是ClassComponent的render函数或者FunctionComponent的返回值，用来表示组件的内容，在JS里面定义或者是更新状态，减少命令式的一些DOM操作，可以提升我们的开发效率。

在经过babel编译之后，最后会被编译成`React.createElement`，也就是`jsx是createElement的语法糖`，在[babel编译jsx站点](https://www.babeljs.cn/)查看jsx被编译后的结果

![image-20220926113822670](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202209261138723.png!blog.guiyexing)

注意：jsx文件要声明`import React from 'react'`的原因是jsx经过编译之后变成React.createElement，不引入React就会报错，react17开始改变了编译方式，并向下兼容，变成了jsx.createElement，react官网[介绍全新的 JSX 转换](https://zh-hans.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)

![image-20220926173153647](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202209261731709.png!blog.guiyexing)

测试方法：将React Runtime更改为Automatic

![image-20220926173923964](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202209261739004.png!blog.guiyexing)

##  React.createElement

`React.createElement`的源码中做了如下几件事

- 处理config，把除了保留属性外的其他config赋值给props
- 把children处理后赋值给props.children
- 处理defaultProps
- 调用ReactElement返回一个jsx对象(virtual-DOM)

```js
//ReactElement.js
export function createElement(type, config, children) {
  let propName;

  const props = {};

  let key = null;
  let ref = null;
  let self = null;
  let source = null;

  if (config != null) {
    //处理config，把除了保留属性外的其他config赋值给props
    //...
  }

  const childrenLength = arguments.length - 2;
  //把children处理后赋值给props.children
  //...

  //处理defaultProps
  //...

  return ReactElement(
    type,
    key,
    ref,
    self,
    source,
    ReactCurrentOwner.current,
    props,
  );
}

const ReactElement = function(type, key, ref, self, source, owner, props) {
  const element = {
    $$typeof: REACT_ELEMENT_TYPE,//表示是ReactElement类型

    type: type,//class或function
    key: key,//key
    ref: ref,//ref属性
    props: props,//props
    _owner: owner,
  };

  return element;
};
```

$$typeof表示的是组件的类型，例如在源码中有一个检查是否是合法Element的函数，就是根object.$$typeof === REACT_ELEMENT_TYPE来判断的

```js
//ReactElement.js
export function isValidElement(object) {
  return (
    typeof object === 'object' &&
    object !== null &&
    object.$$typeof === REACT_ELEMENT_TYPE
  );
}
```

如果组件是ClassComponent则type是class本身，如果组件是FunctionComponent创建的，则type是这个function，源码中用ClassComponent.prototype.isReactComponent来区别二者。注意class或者function创建的组件一定要首字母大写，不然后被当成普通节点，type就是字符串。

jsx对象上没有优先级、状态、effectTag等标记，这些标记在Fiber对象上，在mount时Fiber根据jsx对象来构建，在update时根据最新状态的jsx和current Fiber对比，形成新的workInProgress Fiber，最后workInProgress Fiber切换成current Fiber。

## render

```js
//ReactDOMLegacy.js
export function render(
  element: React$Element<any>,//jsx对象
  container: Container,//挂载DOM
  callback: ?Function,//回调
) {

  return legacyRenderSubtreeIntoContainer(
    null,
    element,
    container,
    false,
    callback,
  );
}
```

可以看到render所做的事也就是调用legacyRenderSubtreeIntoContainer，这里重点关注ReactDOM.render()使用时候的三个参数。

## component

```js
//ReactBaseClasses.js
function Component(props, context, updater) {
  this.props = props;//props属性
  this.context = context;//当前的context
  this.refs = emptyObject;//ref挂载的对象
  this.updater = updater || ReactNoopUpdateQueue;//更新的对像
}

Component.prototype.isReactComponent = {};//表示是classComponent
```

component函数中主要在当前实例上挂载了props、context、refs、updater等，所以在组件的实例上能拿到这些，而更新主要的承载结构就是updater， 主要关注isReactComponent，它用来表示这个组件是类组件

---

总结：jsx是React.createElement的语法糖，jsx通过babel转化成React.createElement函数，React.createElement执行之后返回jsx对象，也叫virtual-DOM，Fiber会根据jsx对象和current Fiber进行对比形成workInProgress Fiber

pureComponent会进行原型继承，然后赋值isPureReactComponent

```js
function PureComponent(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}

const pureComponentPrototype = (PureComponent.prototype = new ComponentDummy());
pureComponentPrototype.constructor = PureComponent;
Object.assign(pureComponentPrototype, Component.prototype);
pureComponentPrototype.isPureReactComponent = true;

export {Component, PureComponent};
```
