# Nestjs Session

## 配置session

**session**是服务器为每个用户的浏览器创建的一个会话对象，**这个session会记录到浏览器的cookie用来区分用户**

nestjs默认使用express框架，支持express的插件，所以我们就可以安装express的session库

```
npm i express-session
npm i @types/express-session -D
```

然后在main.ts引入，通过app.use注册session

```js title="main.ts" {4,10}
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import * as session from 'express-session';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.use(session());
  await app.listen(3000);
}
bootstrap();
```

参数配置详解

* secret：生成服务端session签名，可以理解为[加盐](https://zh.m.wikipedia.org/zh-hans/%E7%9B%90_(%E5%AF%86%E7%A0%81%E5%AD%A6))
* name： 生成客户端cookie的名字，默认connect.sid
* cookie：设置返回到前端key的属性，默认值为`{ path: ‘/’, httpOnly: true, secure: false, maxAge: null }`。
* rolling：在每次请求时强行设置cookie，这将重置cookie过期时间(默认:false)

配置参考：

每次请求时强行设置cookie，最后一次设置后一天过期

```ts
session({
  secret: 'zhangsan',
  name: 'zhangsan.sid',
  rolling: true,
  cookie: { maxAge: 1 * 24 * 60 * 60 * 1000 },
}),
```

## 使用session校验验证码

后端生成验证码图片的库：`svg-captcha`

后端代码：

```ts
@Get('code')
createCaptcha(@Req() req, @Res() res) {
  const captcha = svgCaptcha.create({
    size: 4, //生成几个验证码
    fontSize: 50, //文字大小
    width: 100, //宽度
    height: 34, //高度
    background: '#cc9966', //背景颜色
  });
  req.session.code = captcha.text; //存储验证码记录到session
  console.log(req.session.code);
  res.type('image/svg+xml');
  res.send(captcha.data);
}
@Post('create')
createUser(@Session() session, @Body() body) {
  console.log(session, body);
  if (
    session.code &&
    session.code.toLocaleLowerCase() === body?.code?.toLocaleLowerCase()
  ) {
    return {
      message: '验证码正确',
    };
  } else {
    return {
      message: '验证码错误',
    };
  }
}
```

前端代码：

```tsx
import { Button, Form, Input,message } from 'antd';
import React, { useCallback, useState } from 'react';
const codeApi = '/api/v1/user/code'
const Register: React.FC = () => {
    const [codeUrl, setCodeUrl] = useState(codeApi)
    const resetCode = useCallback(() => {
        setCodeUrl(codeApi + '?' + Math.random());//加后缀刷新请求
    }, [])

    const onFinish = (values: any) => {
        fetch('/api/v1/user/create', {
            method: "POST",
            body: JSON.stringify(values),
            headers: {
                'content-type': 'application/json'
            }
        }).then(res => res.json()).then(res => {
            message.info(res?.message || '??')
        })
    };

    return (
        <Form
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{}}
            onFinish={onFinish}
            onFinishFailed={(error) => { console.log(error) }}
            autoComplete="off"
        >
            <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please input your username!' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="code"
                name="code"
                rules={[{ required: true, message: 'Please input code!' }]}
            >
                <div style={{ display: 'flex' }}>
                    <Input /><img onClick={resetCode} src={codeUrl} alt="code"></img>
                </div>
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
            </Form.Item>
        </Form>
    );
};

export default Register;
```

![image-20221119113138585](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211191131634.png!blog.guiyexing)
