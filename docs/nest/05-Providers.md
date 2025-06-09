# Providers

**参考控制反转与依赖注入**

Provider 只是一个用 `@Injectable()` 装饰器修饰的类，module 引入service在providers注入，在Controller 就可以使用注入好的service了 

## 基本使用方式

这是最简单service模型，如项目默认代码：

```ts title="app.service.ts"
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
```

```ts title="app.module.ts"
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

```ts title="app.controller.ts"
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

## 自定义注入的名称

我们可以**自定义注入的名称**，如改变AppService的注入名称

```ts title="app.module.ts" {9-14}
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AppController],
  providers: [
    {
      provide: 'ABC',
      useClass: AppService,
    },
  ],
})
export class AppModule {}
```

```ts title="app.controller.ts" {1,6,10}
import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(@Inject('ABC') private readonly defg: AppService) {}

  @Get()
  getHello(): string {
    return this.defg.getHello();
  }
}
```

两者效果是一样的，只是一个是简写，一个是全称，一般使用简写方式

## 自定义注入的值

我们还可以**自定义注入的值**，如图设置任意的注入名称，使用useValue注入任意类型的值

![image-20221116220928731](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211162209798.png!blog.guiyexing)

然后就可以在控制器中使用了

![image-20221116221145246](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211162211303.png!blog.guiyexing)

## 工厂模式

如果服务之间有相互的依赖或者逻辑处理可以使用useFactory，可以注入其他的已注入的类，如下DemoService

![image-20221116223109950](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211162231007.png!blog.guiyexing)

在函数里面可以做各种判断，返回任意的数据，然后在控制器中使用

![image-20221116223439359](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211162234418.png!blog.guiyexing)

这个工厂模式也支持异步的方式，我们可以使用setTimeout模拟一下，改造useFactory函数

```ts
{
  provide: 'HiHi',
  nject: [DemoService],
  async useFactory(DemoService: DemoService) {
      return await new Promise((r) => {
        setTimeout(() => {
          r(DemoService.getHello());
        }, 2000);
      });
    },
},
```
