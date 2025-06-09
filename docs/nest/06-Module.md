# Module

创建user模块：`nest g res user`

创建list模块：`nest g res list`

创建完模块后nest会帮我们自动通过imports方式引入这两个模块

![image-20221117001341965](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211170013026.png!blog.guiyexing)

## 共享模块

我们在app.controller里使用创建的其他某个模块的service

```ts title="app.controller" {3,8,13}
import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { UserService } from './user/user.service';
@Controller()
export class AppController {
  constructor(
    @Inject('ABC') private readonly appService: AppService,
    private readonly userService: UserService,
  ) {}

  @Get()
  getHello(): string {
    return this.userService.findAll();
  }
}
```

因为user现在还不是一个共享模块，所以服务端会报错找不到该模块，这个服务只能在自己的模块使用，如果想把这个服务共享，就需要在user.module使用exports导出

![image-20221117002255197](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211170022258.png!blog.guiyexing)

由于App.modules 已经import该模块app.controller就可以直接使用user模块的 Service 

![image-20221117010002500](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211170100555.png!blog.guiyexing)

## 全局模块

创建一个config文件夹，当作以后的全局模块

给模块前添加`@Global()`装饰器使他注册为全局模块

![image-20221117013140575](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211170131660.png!blog.guiyexing)

我们需要在入口的app.module中注册ConfigModule,这样UserModule和ListModule就可以使用ConfigModule的service

![image-20221117013243100](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211170132172.png!blog.guiyexing)

在list模块无须在module import 导入，就可以使用Config注入的数据

![image-20221117013343998](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211170133036.png!blog.guiyexing)

## 动态模块

> 动态模块能够轻松创建可自定义的模块，这些模块可以动态注册和配置提供程序

换句话说就是可以给模块传入参数

我们给module提供一个静态方法去传参，如

```ts title="config.module.ts"
import { DynamicModule, Global, Module } from '@nestjs/common';
@Global()
@Module({})
export class ConfigModule {
  static AAA(): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: 'Config',
          useValue: {
            salt: 'hello',
          },
        },
      ],
      exports: [
        {
          provide: 'Config',
          useValue: {
            salt: 'hello',
          },
        },
      ],
    };
  }
}
```

providers既可以在`@Module({})`里配置，也可以写在静态方法里，只是需要在导入的地方执行函数

```ts title="app.module.ts"
imports: [UserModule, ListModule, ConfigModule.AAA()],
```

这样我们就可以传参了，如

```ts title="app.module.ts"
imports: [
  UserModule,
  ListModule,
  ConfigModule.AAA({
    prefix: 'hihihi',
  }),
],
```

我们在静态方法里接收使用

```ts title="config.module.ts" {8,15,23}
import { DynamicModule, Global, Module } from '@nestjs/common';
interface Options {
  prefix: string;
}
@Global()
@Module({})
export class ConfigModule {
  static AAA(options: Options): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: 'Config',
          useValue: {
            salt: options.prefix + 'hello',
          },
        },
      ],
      exports: [
        {
          provide: 'Config',
          useValue: {
            salt: options.prefix + 'hello',
          },
        },
      ],
    };
  }
}
```
