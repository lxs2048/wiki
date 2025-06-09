---
slug: formily1
title: formily1.0基本使用方式
authors: [dolphin]
tags: [formily]
date: 2022-08-27T20:20
---

公司使用formily1.0版本，记录下基本的使用方式，包括扩展字段，自定义校验，字段联动，获取提交事件等

<!--truncate-->

```tsx
import React, { useEffect, useMemo } from 'react';
import { Input, Switch } from '@**/ui';
import { formily } from '@**/ui/formily';
const {
  SchemaForm,
  FormEffectHooks,
  createAsyncFormActions,
  connect,
  mapStyledProps,
  registerValidationRules,
  createFormActions,
} = formily;

const {
  onFieldMount$,
  onFormInit$, // 表单初始化触发
  onFieldInputChange$, // 字段事件触发时触发，用于只监控人工操作
  onFormValidateEnd$,
  onFieldValueChange$,
} = FormEffectHooks;
const getValidateRules = (actions: any) => {
  return {
    // 校验邮箱
    r_email: (value: any, rule: any, context: any) => {
      /* value值
         rule当前规则
         context所有规则
         */
      if (!value) return '';
      const reg = new RegExp(
        /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/
      );
      return reg.test(value) ? '' : '邮箱格式不正确';
    },
  };
};
const IInput = (props: {
  value: any;
  onChange: Function;
  readOnly: boolean;
}) => {
  const { value, onChange, readOnly } = props;
  console.log(props, '数据😎😎😎');
  return <Input value={value} disabled={readOnly} onChange={onChange} />;
};
const ISwitch = (props: { value: any; onChange: Function }) => {
  const { value, onChange } = props;
  return <Switch checked={value} onChange={onChange} />;
};
// 统一处理，传递工具函数
const getEnumField = (connect: any, mapStyledProps: any, getUtil: Function) => {
  const _connect = (field: any) =>
    connect({
      getProps: mapStyledProps,
      defaultProps: {
        t: getUtil && getUtil(),
      },
    })(field);
  return {
    CInput: _connect(IInput),
    CSwitch: _connect(ISwitch),
  };
};
//联动
const useOneToManyEffects = () => {
  const { setFieldState } = createFormActions();
  onFieldValueChange$('bbb').subscribe(({ value }: any) => {
    console.log(value, '数据😎😎😎');
    setFieldState('aaa', (state: any) => {
      state.editable = value;
    });
  });
};
function Demo() {
  const actions = useMemo(() => createAsyncFormActions(), []); // 表单行为对象
  const getFormValues = async () => {
    const ret = await actions.submit();
    console.log(ret, '数据😎😎😎');
  };
  const getUtil = () => {
    return {
      hello: () => {
        console.log('hello');
      },
    };
  };
  useEffect(() => {
    registerValidationRules(getValidateRules(actions));
  }, []);
  return (
    <>
      <SchemaForm
        components={{ ...getEnumField(connect, mapStyledProps, getUtil) }}
        defaultValue={{
          aaa: 'hello',
          bbb: true,
        }}
        actions={actions}
        labelCol={7}
        wrapperCol={12}
        schema={{
          type: 'object',
          properties: {
            aaa: {
              type: 'string',
              title: '姓名',
              'x-component': 'CInput',
              required: true,
              ['x-rules']: [
                {
                  r_email: true,
                },
              ],
            },
            bbb: {
              type: 'boolean',
              title: '开启',
              'x-component': 'CSwitch',
            },
          },
        }}
        effects={() => {
          /* 表单初始化的时候 */
          onFormInit$().subscribe((fieldState: any) => {
            // console.log(fieldState, '数据😎😎😎初始化');
          });
          /* 表单值改变的时候 */
          onFieldInputChange$().subscribe((fieldState: any, ...rest: any) => {
            // console.log(fieldState, rest, '数据😎😎😎改变');
          });
          onFormValidateEnd$().subscribe((fieldState: any) => {
            console.log(fieldState, '数据😎😎😎校验');
          });
          onFieldMount$().subscribe(() => {
            // console.log('数据😎😎😎挂载');
          });
          useOneToManyEffects();
        }}
      ></SchemaForm>
      <button onClick={getFormValues}>提交</button>
    </>
  );
}

export default Demo;
```
