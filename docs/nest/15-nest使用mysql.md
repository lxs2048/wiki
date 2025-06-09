# nest使用mysql

## docker-compose编排mysql

```yml
version: '3'
services:
    test-mysql-db:
      image: mysql:8.0
      container_name: test-mysql-db
      restart: always
      command: --default-authentication-plugin=mysql_native_password
      ports:
          - "3306:3306"
      volumes:
        - $PWD/mysql/data/:/var/lib/mysql/
      environment:
        MYSQL_ROOT_PASSWORD: 123456
        MYSQL_DATABASE: nestdb
        MYSQL_USER: dbuser
        MYSQL_PASSWORD: dbpwd
```

## 插件连接mysql

vscode插件database client

![image-20221127114905686](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211271149728.png!blog.guiyexing)

默认创建nestdb数据库，使用对应的账号密码连接，创建数据库需使用超级用户

![image-20221127185216388](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211271852421.png!blog.guiyexing)

连接以后刷新就可以看到创建的nestdb数据库

![image-20221127185344860](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211271853888.png!blog.guiyexing)

## nest连接数据库

typeOrm 是 `TypeScript` 中最成熟的对象关系映射器( `ORM` )。因为它是用 `TypeScript` 编写的，所以可以很好地与 `Nest` 框架集成

安装依赖

```
npm install --save @nestjs/typeorm typeorm mysql2
```

在app.module.ts 注册

```ts
TypeOrmModule.forRoot({
  type: 'mysql', //数据库类型
  username: 'dbuser', //账号
  password: 'dbpwd', //密码
  host: 'localhost', //host
  port: 3306, //端口
  database: 'nestdb', //库名
  // entities: [__dirname + '/**/*.entity{.ts,.js}'], //实体文件
  synchronize: true, //synchronize字段代表是否自动将实体类同步到数据库【不要在生产环境使用】
  retryDelay: 500, //重试连接数据库间隔
  retryAttempts: 10, //重试连接数据库的次数
  autoLoadEntities: true, //如果为true,将自动加载实体 forFeature()方法注册的每个实体都将自动添加到配置对象的实体数组中
}),
```

![image-20221127185459437](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211271854475.png!blog.guiyexing)

引入实体的三种方式

1. 手动import引入，如果有很多的话，引入要写特别多

2. 自动匹配：`entities: [__dirname + '/**/*.entity{.ts,.js}'],`也是不推荐

3. 自动加载实体`autoLoadEntities: true`

**定义实体**

```ts title="list.entity.ts"
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class List {
  //自增列
  @PrimaryGeneratedColumn()
  id: number;
  //普通列
  @Column()
  title: string;
}
```

**关联实体**

```ts title="list.module.ts" {4,5,8}
import { Module } from '@nestjs/common';
import { ListService } from './list.service';
import { ListController } from './list.controller';
import { List } from './entities/list.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([List])],
  controllers: [ListController],
  providers: [ListService],
})
export class ListModule {}
```

保存完之后就会自动帮我们创建一个list的数据表

![image-20221127185644624](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211271856658.png!blog.guiyexing)
