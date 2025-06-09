---
sidebar_position: 6
---

# Docker部署静态文件

以本项目为例，首先执行本地执行`npm run build`打包生成静态文件于`/build`目录

## 基本配置

根目录创建nginx配置

```
nginx
├── conf
|   └── log_format.conf
├── conf.d
|   └── notes.conf
└── logs # logs目录存放日志
```

log_format.conf

```
if ($time_iso8601 ~ "^(d{4})-(d{2})-(d{2})T(d{2}):(d{2}):(d{2})") {
    set $year $1;
    set $month $2;
    set $day $3;
    set $hour $4;
}
access_log /var/log/nginx/${server_name}_${year}-${month}-${day}-${hour}_access.log main;
```

配置默认的nginx配置notes.conf

```
server {
    listen       80;
    server_name  localhost;
    location / {
        root   /var/www/html;
        index  index.html;
        try_files $uri $uri/ /index.html;
    }
    # location /api/ {
    #     proxy_pass  http://backendContainer:8888/;
    # }
}
```

配置docker-compose.yml

```
version: '3.8'
services:
  notes:
    image: nginx:1.21.6-alpine
    container_name: notesContainer
    restart: always
    ports:
      - 8001:80
    volumes:
      - ./build/:/var/www/html/
      - ./nginx/conf.d/:/etc/nginx/conf.d
      - ./nginx/conf/log_format.conf:/etc/nginx/log_format.conf
      - ./nginx/logs/:/var/log/nginx
#     networks:
#       - node-server_backend_net
# networks:
#   node-server_backend_net:
#     external: true # 来自外部
```

:::tip
notes.conf中注释的部分表示如果请求接口以api开头就会删除api并代理到某个地址，这里指向的是另外一个容器用来启动后端服务，指定端口为8888，且自定义了docker网络名称为node-server_backend_net，通过docker-compose中注释的配置可以使nginx成功代理到服务端容器。
:::

## 推送静态文件与配置

本地配置完成后只需要将关键文件推送到服务器启动容器

推送方法参考[VSCode同步文件到服务器](/docs/deploy/VSCode同步文件到服务器)

这里配置如下

```json title=".vscode/settings.json"
{
    "deploy": {
        "packages": [{
            "files": [
                "**/*",
            ],
            "exclude": [
                "node_modules/**",
                ".git/**",
                ".vscode/**",
                "**/node_modules/**",
            ],
            "deployOnSave": false,
            "button": {
                "text": "Notes发布",
                "tooltip": "点击发布到生产环境...",
                "targets": [ "Notes" ]
            }
        }],
        "targets": [{
            "type": "sftp",
            "name": "Notes",
            "dir": "/home/ubuntu/service/notes",
            "host": "101.43.181.81",
            "port": 22,
            "user": "ubuntu",
            "privateKey": "D:\\server\\CI"
        }],
    },
}
```

直接使用`Notes发布`按钮会将除了排除掉的文件都deploy到服务器，当前的方式可以仅将`nginx`,`build`,`docker-compose.yml`这3种文件推送到服务器

## 创建容器

在`/home/ubuntu/service/notes`中使用docker-compose的名称创建容器

```
docker-compose up --build -d
```

创建容器后就可以通过`curl http://0.0.0.0:8001`查看部署好的项目入口代码，网页访问需防火墙开放端口

## 宿主机配置

通过上面创建容器就可以实现访问博客页面了，接下来使用宿主机的nginx配置https

```
server {
  listen 80;
  server_name guiyexing.site;
  # 将请求转成https
  rewrite ^(.*)$ https://$host$1 permanent;
}
server{
  listen 443 ssl;
  server_name guiyexing.site;
  ssl_certificate      cert/guiyexing.site_nginx/guiyexing.site_bundle.pem;
  ssl_certificate_key  cert/guiyexing.site_nginx/guiyexing.site.key;
  ssl_session_timeout 5m;
  ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
  ssl_prefer_server_ciphers on;
  location / {
    proxy_pass http://localhost:8001;
    proxy_redirect off;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

首先需要有自己的域名，并且申请了SSL，下载SSL证书上传到服务器，`ssl_certificate`与`ssl_certificate_key`指向对应文件的位置，参考

```
/etc/nginx/cert/guiyexing.site_nginx
```

目前除了vercel有自动部署外还可以手动将项目打包成静态资源通过docker部署

![image-20220912144217549](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202209121442723.png!blog.guiyexing)
