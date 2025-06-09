# nestjs 实体

什么是实体

实体是一个映射到数据库表的类。 你可以通过定义一个新类来创建一个实体，并用`@Entity()`来标记，如：

```ts
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

### 主列

自动递增的主键

```ts
@PrimaryGeneratedColumn()
id:number
```

自动递增uuid

```ts
@PrimaryGeneratedColumn("uuid")
id:number
```

列类型

```ts
@Column({type:"varchar",length:255})
password: string
    
@Column({ type: "int"})
age: number
 
@CreateDateColumn({type:"timestamp"})
create_time:Date
```

## 所有类型

`int`，`tinyint`，`smallint`，`mediumint`，`bigint`，`float`，`double`，`dec`，`decimal`，`numeric`，`date`，`datetime`，`timestamp`，`time`，`year`，`char`，`varchar`，`nvarchar`，`text`，`tinytext`，`mediumtext`，`blob`，`longtext`，`tinyblob`，`mediumblob`，`longblob`，`enum`，`json`，`binary`，`geometry`，`point`，`linestring`，`polygon`，`multipoint`，`multilinestring`，`multipolygon`，`geometrycollection`

## 自动生成列

```ts
@Generated('uuid')//increment,rowid,uuid
uuid:string
```

## 枚举列

```ts
@Column({
  type:"enum",
  enum:['1','2','3','4'],
  default:'1'
})
xx:string
```

## 列选项

```ts
@Column({
    type:"varchar",
    name:"demo", //数据库表中的列名
    nullable:true, //在数据库中使列NULL或NOT NULL。默认情况下，列是nullable：false
    comment:"注释",
    select:true,  //定义在进行查询时是否默认隐藏此列。设置为false时，列数据不会显示标准查询。默认情况下，列是select：true
    default:"xxxx", //加数据库级列的DEFAULT值
    primary:false, //将列标记为主要列。使用方式和@PrimaryColumn相同。
    update:true, //指示"save"操作是否更新列值。如果为false，则只能在第一次插入对象时编写该值。默认值为"true"
    collation:"", //定义列排序规则。
})
xx:string
```

## simple-array列类型

有一种称为simple-array的特殊列类型，它可以将原始数组值存储在单个字符串列中。 所有值都以逗号分隔

```ts
@Column("simple-array")
names: string[];
```

## simple-json列类型

还有一个名为simple-json的特殊列类型，它可以存储任何可以通过 JSON.stringify 存储在数据库中的值。 当你的数据库中没有 json 类型而你又想存储和加载对象，该类型就很有用了。 例如:

```ts
@Column("simple-json")
profile: { name: string; nickname: string };
```

## 更多

https://typeorm.biunav.com/zh/
