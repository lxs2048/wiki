# 中间件

## 创建中间件

中间件是在**路由处理程序之前调用的函数**，可以访问请求和响应对象

中间件函数可以执行以下任务:

* 执行任何代码。
* 对请求和响应对象进行更改。
* 结束请求
* 调用堆栈中的下一个中间件函数。
* 如果当前的中间件函数没有结束请求, 那么它必须调用 next() 将控制传递给下一个中间件函数。否则, 请求将被挂起。

我们可以使用快捷方式创建一个中间件

```
nest g mi logger
```

![image-20221117213726673](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211172137741.png!blog.guiyexing)

我们处理下这个中间件

```ts title="logger.middleware.ts" {2,5-6}
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('路过');
    next();
  }
}
```

## 使用中间件

在模块里面实现configure，返回一个消费者consumer通过apply 注册中间件，然后通过forRoutes 指定Controller路由

```ts title="user.module.ts" {1,4,10-14}
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { LoggerMiddleware } from 'src/logger/logger.middleware';
@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('user');
  }
}
```

注意版本，这里能拦截是因为暂且把里面的v1版本注释了

![image-20221117215500865](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211172155926.png!blog.guiyexing)

如果不想使用`next()`，也可以直接返回内容,如

![image-20221117215712487](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211172157549.png!blog.guiyexing)

注意`res.send()`与`next()`不能再同一个判断分支。

我们在回到配置拦截指定的路由，前面说到`forRoutes('user')`，拦截了`/user`的所有类型的域名，我们还可以进行一些其他的配置，如：

```ts title="user.module.ts" {2-3}
consumer.apply(LoggerMiddleware).forRoutes({
  path: 'user',
  method: RequestMethod.GET,
})
```

我们还可以把整个UserController塞进去，这里不能控制版本[参考](https://www.nestjs.com.cn/middlewares)

```ts title="user.module.ts" {2-3}
consumer.apply(LoggerMiddleware).forRoutes(UserController);
```

## 全局中间件

全局中间件只能使用函数模式，在`main.ts`实现，我们可以加一些条件判断，白名单或者token鉴权等。

```ts title="main.ts" {5-14,20}
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import * as session from 'express-session';
import { Request, Response, NextFunction } from 'express';
const prisonLists = ['/list'];
function middlewareAll(req: Request, res: Response, next: NextFunction) {
  console.log(req.url);
  if (prisonLists.includes(req.url)) {
    res.send({ message: '这小子进小黑屋了' });
  } else {
    next();
  }
}
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.use(middlewareAll);
  app.use(
    session({
      secret: 'zhangsan',
      name: 'zhangsan.sid',
      rolling: true,
      cookie: { maxAge: 1 * 24 * 60 * 60 * 1000 },
    }),
  );
  await app.listen(3000);
}
bootstrap();
```

![image-20221117222637371](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211172226414.png!blog.guiyexing)

## 第三方中间件

我们在`baidu.com`访问我们的地址，跨域被浏览器拦截了

![image-20221117222206611](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211172222684.png!blog.guiyexing)

在服务端使用cors解决

```
npm i cors
npm i @types/cors -D
```

```ts title="main.ts"
// main.ts
import * as cors from 'cors';
app.use(cors()); // 默认允许所有跨域=>放在最前面
```

我们可以针对我们自己的前端域名或者百度进行配置

```ts title="main.ts" {16-27,33-34}
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import * as session from 'express-session';
import * as cors from 'cors';
import { Request, Response, NextFunction } from 'express';
const prisonLists = ['/list'];
function middlewareAll(req: Request, res: Response, next: NextFunction) {
  console.log(req.url);
  if (prisonLists.includes(req.url)) {
    res.send({ message: '这小子进小黑屋了' });
  } else {
    next();
  }
}
const whitelists = ['https://www.baidu.com'];
const corsOptions = {
  origin: function (origin, callback) {
    console.log(origin, whitelists.indexOf(origin));
    if (whitelists.indexOf(origin) !== -1) {
      console.log('通过');
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
};
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableVersioning({
    type: VersioningType.URI,
  });
  // app.use(cors()); // 允许所有跨域
  app.use(cors(corsOptions));
  app.use(middlewareAll);
  app.use(
    session({
      secret: 'zhangsan',
      name: 'zhangsan.sid',
      rolling: true,
      cookie: { maxAge: 1 * 24 * 60 * 60 * 1000 },
    }),
  );
  await app.listen(3000);
}
bootstrap();
```

然后，在百度访问就不会有跨域拦截了

![image-20221117225212481](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211172252557.png!blog.guiyexing)
