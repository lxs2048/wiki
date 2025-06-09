# 初识nest

## Nestjs cli

[新建项目](https://www.nestjs.com.cn/first-steps#%E6%96%B0%E5%BB%BA%E9%A1%B9%E7%9B%AE)

```
$ npm i -g @nestjs/cli
$ nest new project-name
```

项目介绍：

* app.module.ts根模块用于处理其他类的引用与共享

* app.controller.ts常见功能是用来处理http请求以及调用service层的处理方法

  `private readonly appService: AppService`这一行代码就是依赖注入，我们不需要实例化appService，它内部会自己实例化，我们只需要放上去就可以直接调用其内部的方法

* app.service.ts封装通用的业务逻辑、与数据层的交互(例如数据库)、 其他额外的一些三方请求

一般使用`--watch`方式启动项目

我们在`@Get()`里写个路由`@Get('hello')`，直接访问3000就404，加`/hello`就可以再次看到结果

**常用命令**：

查看命令`nest --help`

curd模板命令：`nest g resource ${name}`，一般选`REST API`风格

![image-20221114233218582](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211142332676.png!blog.guiyexing)

## RESTful

**RESTful**是一种风格设计，在RESTful中，一切都被认为是资源，每个资源有对应的URL标识，不是标准也不是协议，只是一种风格。

如`http://localhost:8080/user/123`只一个接口就可以完成增删改查，他是**通过不同的请求方式来区分**的

* 查询GET
* 提交POST
* 更新 PUT PATCH
* 删除 DELETE

**RESTful版本控制**：

一般版本将在请求的URI中传递（默认）

开启版本控制

```js title="main.ts" {3,6-8}
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableVersioning({
    type: VersioningType.URI,
  });
  await app.listen(3000);
}
bootstrap();
```

控制某个模块的所有接口版本如：`@Controller('user')`，只需要修改参数为

```ts
@Controller({
  path: 'user',
  version: '1', // 升级版本
})
```

在此基础上也可以给单个去控制升级，通过`@Version('2')`，如：

```ts {2}
@Get(':id')
@Version('2')
findOne(@Param('id') id: string) {
	return this.userService.findOne(+id);
}
```

**Code码规范**：

* 200 OK
* 304 Not Modified 协商缓存
* 400 Bad Request 参数错误
* 401 Unauthorized token错误
* 403 Forbidden referer origin 验证失败
* 404 Not Found 接口不存在
* 500 Internal Server Error 服务端错误
* 502 Bad Gateway 上游接口有问题或者服务器问题
