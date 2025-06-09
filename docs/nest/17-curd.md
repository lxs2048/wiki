# curd

创建一个测试模块

```
nest g res pwdLists
```

## DTO

```ts title="create-pwd-list.dto.ts"
export class CreatePwdListDto {
  website: string;
  username: string;
  password: string;
}
```

## entities

```ts title="pwd-list.entity.ts"
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PwdList {
  //自增列
  @PrimaryGeneratedColumn()
  id: number;
  //普通列
  @Column()
  website: string;
  //普通列
  @Column()
  username: string;
  //普通列
  @Column()
  password: string;
}
```

## module

```ts title="pwd-lists.module.ts" {5,6,8}
import { Module } from '@nestjs/common';
import { PwdListsService } from './pwd-lists.service';
import { PwdListsController } from './pwd-lists.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { PwdList } from './entities/pwd-list.entity';
@Module({
  imports: [TypeOrmModule.forFeature([PwdList])],
  controllers: [PwdListsController],
  providers: [PwdListsService],
})
export class PwdListsModule {}
```

## service

```ts title="pwd-lists.service.ts"
import { Injectable } from '@nestjs/common';
import { CreatePwdListDto } from './dto/create-pwd-list.dto';
import { UpdatePwdListDto } from './dto/update-pwd-list.dto';

import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PwdList } from './entities/pwd-list.entity';
@Injectable()
export class PwdListsService {
  constructor(
    @InjectRepository(PwdList) private readonly pwdLists: Repository<PwdList>,
  ) {}

  create(createPwdListDto: CreatePwdListDto) {
    const data = new PwdList();
    data.website = createPwdListDto.website;
    data.username = createPwdListDto.username;
    data.password = createPwdListDto.password;
    return this.pwdLists.save(data);
  }

  async findAll(query: { keyWord: string; page: number; pageSize: number }) {
    const queryData = {};
    if (query.keyWord) {
      queryData['where'] = { website: Like(`%${query.keyWord}%`) };
    }
    if (query.page && query.pageSize) {
      queryData['skip'] = (query.page - 1) * query.pageSize;
      queryData['take'] = query.pageSize;
    }
    const [records, total] = await this.pwdLists.findAndCount({
      order: {
        id: 'DESC',
      },
      ...queryData,
    });
    return {
      records,
      total,
    };
  }

  findOne(id: number) {
    return this.pwdLists.findOneBy({
      id: id,
    });
  }

  update(id: number, updatePwdListDto: UpdatePwdListDto) {
    return this.pwdLists.update(id, updatePwdListDto);
  }

  remove(id: number) {
    return this.pwdLists.delete(id);
  }
}
```

## 前端

**代理配置**

```ts
proxy:{
  // 选项写法
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

**全局类型声明**

```ts
declare namespace PwdLists {
    interface PwdCore {
        readonly id?: string
        website: string;
        username: string;
        password: string;
    }
}
```

**API文件**

```ts title="api.ts"
import axios from 'axios'

export const addPwd = (data:any) => axios.post('/api/pwd-lists', data).then(res => res.data)

export const getPwd = (data:any) => axios.get('/api/pwd-lists', { params: data }).then(res => res.data)

export const getPwdDetail = (id:string) => axios.get(`/api/pwd-lists/${id}`).then(res => res.data)

export const delPwd = (id:string) => axios.delete(`/api/pwd-lists/${id}`).then(res => res.data)

export const updatePwd = (data:any) => axios.patch(`/api/pwd-lists/${data.id}`, data).then(res => res.data)
```

列表入口文件

```ts title="index.ts"
import { useCallback, useMemo, useRef } from 'react'
import { Button, Table, Modal } from 'antd';
import usePwdList from './usePwdList'
import type { ColumnsType } from 'antd/es/table';
import { useSize, useBoolean } from 'ahooks';
import PwdForm from './PwdForm';
function PwdLists() {
    const { lists, handleAddPwd, handleDelPwd, fetchLists } = usePwdList()
    const [state, { toggle }] = useBoolean(false);
    const tableWrapRef = useRef<HTMLDivElement | null>(null);
    const size = useSize(tableWrapRef?.current?.parentNode as Element);
    const editIdRef = useRef<string | null>(null)
    const handleEdit = useCallback((id:string)=>{
        editIdRef.current = id
        toggle()
    },[])
    const handleAdd = useCallback(()=>{
        editIdRef.current = null
        toggle()
    },[])
    const columns: ColumnsType<PwdLists.PwdCore> = useMemo(()=>{
        return [
            {
                title: 'ID',
                dataIndex: 'id',
            },
            {
                title: 'website',
                dataIndex: 'website',
            },
            {
                title: 'username',
                dataIndex: 'username',
            },
            {
                title: 'password',
                dataIndex: 'password',
            },
            {
                title: '操作',
                dataIndex: 'id',
                render: (id, item) => {
                    return <>
                        <Button type="link" onClick={() => { handleDelPwd(id) }}>删除</Button>
                        <Button type="link" onClick={() => { handleEdit(id) }}>编辑</Button>
                    </>
                }
            }
        ];
    },[])
    return (
        <div style={{ width: '800px', height: '600px' }}>
            <div style={{ height: '50px', display: 'flex', justifyContent: "flex-end", alignItems: 'center' }}>
                <Button onClick={handleAdd}>新增</Button>
            </div>
            <Modal title={editIdRef.current === null ? '新增' : '编辑'} destroyOnClose open={state} onOk={toggle} onCancel={toggle} footer={null}>
                <PwdForm handleAddPwd={handleAddPwd} editId={editIdRef.current} fetchLists={fetchLists} toggle={toggle} />
            </Modal>
            <div style={{ height: `calc(100% - 50px)`, width: '100%', overflow: "hidden" }} ref={tableWrapRef}>

                <Table pagination={false}
                    scroll={{ y: `${size && size?.height - 50 - 55}px` }}
                    rowKey="id" columns={columns} dataSource={lists} />
            </div>
        </div>
    )
}

export default PwdLists
```

表单组件

```ts title="PwdForm.tsx"
import { useEffect, useRef } from 'react'
import { Button, Form, Input } from 'antd';
import { updatePwd, getPwdDetail } from './api'
interface PwdFormProps {
    handleAddPwd: (params: PwdLists.PwdCore) => Promise<void>;
    editId: null | string;
    fetchLists: () => void
    toggle: () => void
}

function PwdForm({ handleAddPwd, editId, fetchLists, toggle }: PwdFormProps) {
    const [form] = Form.useForm()
    const detailsRef = useRef({})
    useEffect(() => {
        if (editId) {
            // 去查详情，如果可以使用从编辑时拿到list的详情传
            getDetails(editId)
        }
    }, [])
    const getDetails = (id: string) => {
        getPwdDetail(id).then((res) => {
            const formData = res?.data
            detailsRef.current = formData
            form.setFieldsValue(formData)
        })
    }
    const onFinish = (value: any) => {
        const params = { ...detailsRef.current, ...value } as PwdLists.PwdCore
        if (editId) {
            updatePwd(params).then((res) => {
                toggle()
                fetchLists()
            })
        } else {
            handleAddPwd(params).then(() => {
                toggle()
            })
        }
    }
    return (
        <div>
            <Form
                form={form}
                name="abcd"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                onFinish={onFinish}
                onFinishFailed={(error) => { console.log(error) }}
            >
                <Form.Item
                    label="Website"
                    name="website"
                    rules={[{ required: true, message: 'Please input your website!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default PwdForm
```

**自定义Hook**

```ts title="usePwdList"
import { useEffect, useState } from 'react'
import { getPwd,addPwd,delPwd } from './api'
function usePwdList() {
    const [lists, setList] = useState<PwdLists.PwdCore[]>([])
    const fetchLists = () => {
        getPwd({}).then((res) => {
            const records = (res?.data?.records || []) as PwdLists.PwdCore[]
            setList(records)
        })
    }
    const handleDelPwd = async (id:string)=>{
        await delPwd(id)
        fetchLists();
    }
    const handleAddPwd = async ({ website, username, password }: PwdLists.PwdCore) => {
        await addPwd({
            website,
            username,
            password,
        })
        fetchLists();
    }

    useEffect(() => {
        fetchLists()
    }, [])
    return {
        lists,
        handleAddPwd,
        handleDelPwd,
        fetchLists
    }
}

export default usePwdList
```

![image-20221203114305642](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202212031143742.png!blog.guiyexing)
