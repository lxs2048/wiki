# Nestjs 控制器

Controller Request （获取前端传过来的参数）

**获取get请求**：

可以使用Request装饰器或者Query装饰器

```ts
@Get()
findAll(@Request() req) {
  console.log(req.query);
  return {
    code: 200,
    message: req.query.name,
  };
}
```

```ts
@Get()
findAll(@Query() query) {
  console.log(query);
  return {
    code: 200,
    message: query.name,
  };
}
```

实际请求：`http://127.0.0.1:3000/v1/user?name=hello`

![image-20221115001343847](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211150013883.png!blog.guiyexing)

**获取post请求**：

可以使用Request装饰器或者Body装饰器

```ts
@Post()
create(@Request() req) {
  console.log(req.body);
  return {
    code: 200,
    message: req.body.name,
  };
}
```

```ts
@Post()
create(@Body() body) {
  console.log(body);
  return {
    code: 200,
    message: body.name,
  };
}
```

实际请求：`http://127.0.0.1:3000/v1/user`

```
Body 类型 : application/json
{
    "name":"hello"
}
```

![image-20221115002255335](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211150022387.png!blog.guiyexing)

**动态路由**：

可以使用Request装饰器或者Param装饰器

```ts
@Get(':id')
@Version('2')
findOne(@Request() req) {
  console.log(req.params);
  return {
    code: 200,
    message: req.params.id,
  };
}
```

```ts
@Get(':id')
@Version('2')
findOne(@Param('id') id: string) {
  console.log(id);
  return {
    code: 200,
    message: id,
  };
}
```

实际请求：`http://127.0.0.1:3000/v2/user/112233`

![image-20221115002950581](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211150029637.png!blog.guiyexing)

这里给装饰器传入了id，就会直接拿到id，Query和Body装饰器也可以使用这种方式获取指定的某个属性

**请求头**：

在任意的函数里使用Headers装饰器获取请求头

```ts
@Get()
findAll(@Query() query, @Headers() headers) {
  console.log(headers);
  return {
    code: 200,
    message: query.name,
  };
}
```

![image-20221115003704084](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211150037135.png!blog.guiyexing)

**httpCode装饰器**：

```ts
@Get()
@HttpCode('500')
findAll(@Query() query, @Headers() headers) {
  console.log(headers);
  return {
    code: 200,
    message: query.name,
  };
}
```

数据正常返回但是返回500的状态码，还可以使用`@Redirect`装饰器重定向