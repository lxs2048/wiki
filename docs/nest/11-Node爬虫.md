# Node爬虫

创建一个spider模块

```
nest g res spider
```

安装依赖

```
npm i axios cheerio
```

[cheerio](https://github.com/cheeriojs/cheerio/wiki/Chinese-README)为服务器特别定制的，快速、灵活、实施的jQuery核心实现

需求与方案：

lodash这个库比较常用一些基本的，想一览所有都有哪些功能，需要去跳路由，没有一览表，所以想弄一个表格出来

axios请求得到当页的html，使用cheerio解析，保存名称和描述，然后获取到上一页的地址继续去解析

注意**不要滥发请求**

```ts
import { Controller, Get } from '@nestjs/common';
import { SpiderService } from './spider.service';
import axios from 'axios';
import * as cheerio from 'cheerio';
@Controller('spider')
export class SpiderController {
  constructor(private readonly spiderService: SpiderService) {}

  @Get()
  async findAll() {
    const baseUrl = 'https://www.lodashjs.com';
    let dynamic = '/docs/lodash.uniqueId'; //从uniqueId向前遍历数据
    const data = {};
    const getAll = async () => {
      await axios.get(baseUrl + dynamic).then(async (res: any) => {
        const $ = cheerio.load(res.data);
        /* 解析dynamic */
        const splitDynamic = dynamic?.split('.');
        const title = splitDynamic[splitDynamic.length - 1];
        /* 获取上一页标识 */
        const lastPage = $(
          '#docusaurus_skipToContent_fallback > div > main > div > div > div.col.docItemCol_z5aJ > div > nav > a.pagination-nav__link.pagination-nav__link--prev',
        )
          .map(function () {
            return $(this).attr('href');
          })
          .toArray();
        // Object.keys(data).length<5获取全部关闭此项
        if (Object.keys(data).length < 5 && lastPage[0]) {
          dynamic = lastPage[0]; //设置动态路由
          /* 设置当前页的值 */
          const currentValue = $(
            '#docusaurus_skipToContent_fallback > div > main > div > div > div.col.docItemCol_z5aJ > div > article > div.theme-doc-markdown.markdown > div.doc-container > div > div > p:nth-child(2)',
          )
            .map(function () {
              return $(this).text();
            })
            .toArray();
          if (currentValue[0] && title) {
            data[title] = currentValue[0]; //设置值
          }
          await getAll();
        }
      });
    };
    await getAll();
    return data;
  }
}
```

注意：

使用`import axios from 'axios';`会报错找不到get方法，需要**在`tsconfig.json`中增加配置 `"esModuleInterop":true,`支持使用 import 方式引入`commonjs`包**

随后更新session与cors的导入方式

```ts
import session from 'express-session';
import cors from 'cors';
```

然后我们去查询就得到了想要的数据结构

![image-20221121220136016](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202211212201061.png!blog.guiyexing)

页面获取到图片资源的保存方式如下

```ts
import { Controller, Get } from '@nestjs/common';
import { SpiderService } from './spider.service';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
@Controller('spider')
export class SpiderController {
  constructor(private readonly spiderService: SpiderService) {}

  @Get()
  async findAll() {
    const urls = ['https://*.com/Uploadfile/pic/5597.jpg'];
    await this.writeFile(urls);
    return this.spiderService.findAll();
  }
  async writeFile(urls: string[]) {
    urls.forEach(async (url) => {
      const buffer = await axios
        .get(url, { responseType: 'arraybuffer' })
        .then((res) => res.data);
      const ws = fs.createWriteStream(
        path.join(__dirname, '../images/' + new Date().getTime() + '.jpg'),
      );
      ws.write(buffer);
    });
  }
}
```
