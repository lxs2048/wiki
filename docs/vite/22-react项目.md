创建react项目

```
yarn create vite
```

安装Antd与less

```
yarn add antd
yarn add -D less
```

按需加载

```
yarn add vite-plugin-imp
```

配置

```ts title="vite.config.ts"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vitePluginImp from 'vite-plugin-imp'

export default defineConfig({
  plugins: [
    react(),
    vitePluginImp({
      libList: [
        {
          libName: "antd",
          style: (name) => `antd/es/${name}/style`,
        },
      ],
    })
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          '@primary-color': 'coral',//设置antd主题色
        },
      },
    }
  },
})

```

顺便配置下代理

```ts
server:{
  proxy:{
    // 选项写法
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

使用Antd，直接使用无需额外使用样式

```tsx
import {Button} from 'antd'
function Demo() {
  return (
    <Button>Demo</Button>
  )
}
export default Demo
```

使用样式

安装axios

```
yarn add axios
```
