---
sidebar_position: 0

---

# 性能优化模型与工具

## web性能

MDN对Web性能定义: Web性能是网站或应用程序的客观度量和可感知的用户体验。

* 减少整体加载时间:减小文件体积、减少HTTP请求、使用预加载
* 使网站尽快可用:仅加载首屏内容，其它内容根据需要进行懒加载
* 平滑和交互性:使用CSS替代JS动画、减少UI重绘
* 感知表现:你的页面可能不能做得更快，但你可以让用户感觉更快。耗时操作要给用户反馈，比如加载动画、进度条、骨架屏等提示信息
* 性能测定:性能指标、性能测试、性能监控持续优化

## 如何进行Web性能优化

* 首先需要了解性能指标–多快才算快?
* 使用专业的工具可量化地评估出网站或应用的性能表现;
* 然后立足于网站页面响应的生命周期，分析出造成较差性能表现的原因;
* 最后进行技术改造、可行性分析等具体的优化实施。
* 迭代优化

## web性能指标

性能是**相对的**，**精确的、可量化的指标**很重要。

最初，我们使用Time to First Byte、DomContentLoaded和Load这些衡量文档加载进度的指标，但它们不能直接反应用户视觉体验。

为了能衡量用户视觉体验，Web标准中定义了一些性能指标，这些性能指标被各大浏览器标准化实现，例如First Paint和First Contentful Paint。还有一些由 Web孵化器社区组(WICG）提出的性能指标，如Largest Contentful Paint 、Time to Interactive、FirstInput Delay、First CPU ldle。另外还有Google提出的First Meaningful Paint、Speed Index，百度提出的First Screen Paint。

这些指标之间并不是毫无关联，而是在**以用户为中心的目标**中不断演进出来的，有的已经不再建议使用、有的被各种测试工具实现、有的则可以作为通用标准有各大浏览器提供的可用于在生产环境测量的APl。

## PAIL性能模型

https://web.dev/rail/

RAIL是 Response，Animation， Idle和Load的首字母缩写，是一种由Google Chrome团队于2015年提出的性能模型，用于提升浏览器内的用户体验和性能。

RAIL模型的理念是**以用户为中心，最终目标不是让您的网站在任何特定设备上都能运行很快，而是使用户满意**。

* 响应(Response) : 应该尽可能快速的响应用户，应该在100ms 以内响应用户输入(不一定得到最终结果)。
* 动画(Animation)︰在展示动画的时候，每一帧应该以16ms进行渲染，这样可以保持动画效果的一致性，并且避免卡顿。
* 空闲（ldle) : 当使用Javascript主线程的时候，应该把任务划分到执行时间小于50ms的片段中去，这样可以释放线程以进行用户交互。
* 加载(Load)∶应该在小于1s 的时间内加载完成你的网站，并可以进行用户交互。

### 响应

指标: 应该尽可能快速的响应用户，应该在100ms 以内响应用户输入

网站性能对于响应方面的要求是，在用户感知延迟之前接收到操作的反馈。比如用户进行了文本输入、按钮单击、表单切换及启动动画等操作后，必须在100ms内收到反馈，如果超过100ms 的时间窗口，用户就会感知延迟。

看似很基本的用户操作背后，可能会隐藏着复杂的业务逻辑处理及网络请求与数据计算。对此我们应当谨慎，将较大开销的工作放在后台异步执行，而即便后台处理要数百毫秒才能完成的操作，也应当给用户提供**及时的阶段性反馈**。

比如在单击按钮向后台发起某项业务处理请求时，首先反馈给用户开始处理的提示，然后在处理完成的回调后反馈完成的提示。

### 动画

指标: 在展示动画的时候，每一帧应该以10ms进行渲染，这样可以保持动画效果的一致性，并且避免卡顿。

前端所涉及的动画不仅有炫酷的UI特效，还包括滚动和触摸拖动等交互效果，而这一方面的性能要求就是流畅。众所周知，**人眼具有视觉暂留特性**，就是当光对视网膜所产生的视觉在光停止作用后，仍能保留一段时间。

研究表明这是由于视神经存在反应速度造成的，其值是1/24s，即当我们所见的物体移除后，该物体在我们眼中并不会立即消失，而会**延续存在1/24s的时间**。对动画来说，**无论动画帧率有多高，最后我们仅能分辨其中的30帧**，但越高的帧率会带来更好的流畅体验，因此动画要尽力达到60fps的帧率。

目前大多数设备的屏幕刷新率为60次/秒，那么浏览器渲染动画或页面的每一帧的速率也需要跟设备屏幕的刷新率保持一致。所以根据60fps帧率的计算，每一帧画面的生成都需要经过若干步骤，**一帧图像的生成预算为16ms** (1000ms / 60 = 16.66ms)，**除去浏览器绘制新帧的时间，留给执行代码的时间仅10ms** 左右。如果无法符合此预算，帧率将下降，并且内容会在屏幕上抖动。此现象通常称为卡顿，会对用户体验产生负面影响。

### 空闲

指标: 当使用Javascript主线程的时候，应该把任务划分到执行时间小于50ms 的片段中去，这样可以释放线程以进行用户交互。

要使网站响应迅速、动画流畅，通常都需要较长的处理时间，但以用户为中心来看待性能问题，就会发现并非所有工作都需要在响应和加载阶段完成，我们完全可以利用浏览器的空闲时间处理可延迟的任务，只要让用户感受不到延迟即可。利用空闲时间处理延迟，可减少预加载的数据大小，以保证网站或应用快速完成加载。

为了更加合理地利用浏览器的空闲时间，最好将处理任务按50ms为单位分组。这么做就是保证用户在发生操作后的100ms内给出响应。

### 加载

指标: 首次加载应该在小于5s的时间内加载完成，并可以进行用户交互。对于后续加载，则是建议在2秒内完成。

用户感知要求我们尽量在5s内完成页面加载，如果没有完成，用户的注意力就会分散到其他事情上，并对当前处理的任务产生中断感。需要注意的是，这里在5s内完成加载并渲染出页面的要求，并非要完成所有页面资源的加载，从用户感知体验的角度来说，只要关键渲染路径完成，用户就会认为全部加载已完成。

对于其他非关键资源的加载，延迟到浏览器空闲时段再进行，是比较常见的渐进式优化策略。比如图片懒加载、代码拆分等优化手段。

## 基于用户体验的性能指标

https://web.dev/metrics/

Important metrics to measure 

- [Time to First Byte (TTFB)](https://web.dev/ttfb/)

- [First Contentful Paint (FCP)](https://web.dev/fcp/)

  ![image-20220718224052362](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181906395.png!blog.guiyexing)

- [Largest Contentful Paint (LCP)](https://web.dev/lcp/)
  ![image-20220718224401723](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181906396.png!blog.guiyexing)

- [First Input Delay (FID)](https://web.dev/fid/)
  ![image-20220718225408837](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181906402.png!blog.guiyexing)

- [Time to Interactive (TTI)](https://web.dev/tti/)
  ![image-20220718225805746](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181906403.png!blog.guiyexing)

- [Total Blocking Time (TBT)](https://web.dev/tbt/)

  ![Total Blocking Time](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181906405.png!blog.guiyexing)

- [Cumulative Layout Shift (CLS)](https://web.dev/cls/)
  ![image-20220718231010570](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181906412.png!blog.guiyexing)

- [Interaction to Next Paint (INP)](https://web.dev/inp/)

## web Vitals

https://web.dev/vitals/

Google开发了许多实用指标和工具，帮助衡量用户体验和质量，从而发掘优化点。一项名为Web Vitals的计划降低了学习成本，为网站体验提供了一组统一的质量衡量指标 —Core Web Vitals，其中包括加载体验、交互性和页面内容的视觉稳定性。

Core Web Vitals是应用于所有Web页面的 Web Vitals的子集，是其最重要的核心。

* 加载性能(LCP)一显示最大内容元素所需时间
* 视觉稳定性(CLS)一累积布局配置偏移
* 交互性(FID)一首次输入延迟时间

测量Web Vitals方案：

* 性能测试工具，比如Lighthouse
* 使用[web-vitals](https://github.com/GoogleChrome/web-vitals)库
* 使用谷歌浏览器插件Web Vitals

性能检测的认知：

* 不应通过单一指标就能衡量网站的性能体验
* 不应一次检测就能得到网站性能表现的客观结果
* 不应仅在开发环境中模拟进行性能检测

## 常见检测工具

* Lighthouse
* WebPageTest
* 浏览器DevTools
  * 浏览器任务管理器
  * Network面板
  * Coverage面板
  * Memory面板
  * Performance面板
  * Performance monitor面板
* 性能监控API
* 持续的性能监控方案

## Lighthouse

[Lighthouse](https://github.com/GoogleChrome/lighthouse)是一个由Google开发并开源的 Web性能测试工具，用于改进网络应用的质量。可以将其作为一个Chrome扩展程序运行，或从命令行运行，为Lighthouse提供一个要审查的网址，它将针对此页面运行一连串的测试，然后生成一个有关页面性能的报告。

通过案例查看性能报告

* 通过网址https://developer.chrome.com/docs/devtools/speed/get-started/
* 进入https://glitch.com/edit/#!/tony
* 克隆项目https://e331a843-ce42-4892-8819-a5b2f4879220@api.glitch.com/git/befitting-mixolydian-plutonium

对项目优化并比对结果：

* webpack配置mode: "production",

* App执行了1.5s的js this.mineBitcoin(1500);

* 图片压缩model引用压缩后的图片const dir = 'small';

* template.html中有多引用的js

* 压缩文件资源server.js

  ```js
  const compression = require('compression')
  app.use(compression())
  ```

最终优化如下

![image-20220515121448313](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181906037.png!blog.guiyexing)

## webpagetest

https://webpagetest.org/测试发布后的网站

测试淘宝网站

![image-20220515122924742](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181906048.png!blog.guiyexing)

测试结果

![image-20220515191429218](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181906053.png!blog.guiyexing)

## DevTools网络分析

### 浏览器任务管理器

通过Chrome任务管理器我们可以查看当前Chrome 浏览器中，所有进程关于GPU、网给和内存空间的使用情况，这些进程包括当前打开的各个页签，安装的各种扩展插件，以及GPU、网络、渲染等浏览器的默认进程，通过监控这些数据，我们可以在有异于其他进程的大幅开销出现时，去定位到可能存在内存泄漏或网络资源加载异常的问题进程。

![image-20220515123539923](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181906054.png!blog.guiyexing)

### Network 网络分析

**面板设置**

可设置使用大量请求行概述查看更详细的网络信息，甚至屏幕截图

左下角还有请求的统计的信息

![image-20220515164727676](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181906061.png!blog.guiyexing)

**缓存停用**

停用缓存后刷新当前页面，就不会使用任何缓存，查看是否缓存

![image-20220515165223842](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181906064.png!blog.guiyexing)

**网络吞吐**

模拟低速网络与离线状态offline

![image-20220515165531554](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181906682.png!blog.guiyexing)

**阻止单个的网络请求**

* 打开方式: Ctrl+ Shift + P -> Show Network Request Blocking
* 启用网络请求阻止
* 添加阻止规则（默认模糊匹配）

这里仅阻止了请求logo的图片请求，页面就不会展示logo

![image-20220515170154355](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181906238.png!blog.guiyexing)

### coverage面板

通过Coverage面板**监控并统计出网站应用运行过程中代码执行的覆盖率**，该面板统计的对象是JavaScript脚本文件与CSS样式表文件，统计结果主要包扩文件的字节大小、执行过程中已覆盖的代码字节数，以及可视化的覆盖率条形图。

打开方式: Ctrl+ Shift + P ->Start instrumenting **coverage** and reload page

![image-20220515185630964](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181906249.png!blog.guiyexing)

考虑代码为什么没有执行到，可以做拆包，如路由懒加载

## Memory面板

打开方式: Ctrl+ Shift + P ->memory

Memory面板可以快速生成当前的堆内存快照，或者查看内存随时间的变换情况，据此我们可以查看并发现可能出现内存泄漏的环节

![image-20220515191146655](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181906253.png!blog.guiyexing)

## Performance面板

使用Performance面板主要对网站应用的运行时性能表现进行检测与分析，其可检测的内容不仅包括页面的每秒帧数(FPS)、CPU的消耗情况和各种请求的时间花费，还能查看页面在前1ms 与后1ms 之间网络任务的执行情况等内容。

goolechrome提供的测试网页：https://googlechrome.github.io/devtools-samples/jank/

建议在Chrome浏览器的匿名模式下使用该工具，因为在匿名模式下不会受到既有缓存或其他插件程序等因素的影响，能够给性能检测提供一个相对干净的运行环境。

![image-20220515193020823](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181906258.png!blog.guiyexing)

页面分析图

![image-20220515193549475](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181906260.png!blog.guiyexing)

## 实时性能分析

### FPS计数器

打开方式: Ctrl+ Shift + P ->fps，显示如下图标

在额为增加许多icon后页面会变得非常卡顿，然后使用Optimize优化，在数量不变的情况下帧率会在一定程度上提高，甚至到最佳

![image-20220515194324777](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181906372.png!blog.guiyexing)

### performance monitor

打开方式: Ctrl+ Shift + P ->performance monitor，显示如下图标

![image-20220515195152124](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202208181906374.png!blog.guiyexing)
