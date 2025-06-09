# swagger

用于提供给前端接口文档

## 注册swagger

安装命令如下

```coffeescript
npm install  @nestjs/swagger swagger-ui-express
```

在main.ts注册swagger

```ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
xxxxxx
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const options = new DocumentBuilder().setTitle('接口文档标题').setDescription('描述，。。。').setVersion('1').build()
  const document = SwaggerModule.createDocument(app,options)
  SwaggerModule.setup('/api-docs',app,document)
  await app.listen(3000);
}
bootstrap();
```

访问`http://localhost:3000/api-docs`，

![image-20221126173031727](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211261730756.png!blog.guiyexing)

## 分组

在每个controller中使用ApiTags分组，如user使用

![image-20221126173607465](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211261736495.png!blog.guiyexing)

效果如下

![image-20221126173721899](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211261737927.png!blog.guiyexing)

## 描述

使用`ApiOperation`为单个的接口添加描述

```ts
import { ApiOperation } from '@nestjs/swagger';
xxxxxx
@ApiOperation({ summary: '概要', description: '详细描述' })
```

![image-20221126174051797](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211261740825.png!blog.guiyexing)

## 动态参数

使用`ApiParam`为单个接口添加参数描述

```ts
import { ApiParam } from '@nestjs/swagger';
xxxxxx
@ApiParam({
  name: 'id',
  type: 'string',
  required: true,
  description: '传个id',
})
```

![image-20221126175125373](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211261751406.png!blog.guiyexing)

## Query

使用`ApiQuery`为单个接口添加query参数描述

```ts
import { ApiQuery } from '@nestjs/swagger';
xxxxxx
@ApiQuery({
  name: 'myrole',
  type: 'string',
  required: true,
  description: '传个权限字符',
})
```

![image-20221126175550228](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211261755258.png!blog.guiyexing)

## post

与以上类似除了使用ApiBody外post还可以结合dto，使用ApiProperty来添加

![image-20221126180630003](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211261806031.png!blog.guiyexing)

效果如下

![image-20221126180722625](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211261807656.png!blog.guiyexing)

## 返回信息

使用`ApiResponse`为单个接口添加返回结果描述

```ts
import { ApiResponse } from '@nestjs/swagger';
xxxxxx
@ApiResponse({
  status: 403,
  description: '返回内容描述',
})
```

![image-20221126180110460](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211261801500.png!blog.guiyexing)

## token

```ts title="main.ts" {2}
const options = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('接口文档标题')
    .setDescription('描述，。。。')
    .setVersion('1')
    .build();
```

给controller添加`ApiBearerAuth`

![image-20221126181550348](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211261815394.png!blog.guiyexing)

在访问user的路由时需要填写授权码

![image-20221126181655057](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211261816093.png!blog.guiyexing)

访问时自动带上

![image-20221126181823205](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211261818245.png!blog.guiyexing)

## 更多

https://github.com/nestjs/swagger
