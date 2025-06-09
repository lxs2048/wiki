---
slug: deploy-comp
title: docker部署comp
authors: [dolphin]
tags: [component_templates,docker,deploy]
date: 2022-09-21T18:57
---

参照[整合全栈持续集成](/docs/deploy/整合全栈Docker部署),完成前后端分离且不在同一项目目录的component_templates前台独立部署

<!--truncate-->

基于在react中使用axios获取后端数据进行扩展容器化部署

首先在根目录配置`docker-compose.yml`

```yaml title="docker-compose.yml"
version: '3.8'
services:
  component_templates:
    image: nginx:1.21.6-alpine
    container_name: component_templatesContainer
    restart: always
    ports:
      - 7001:80
    volumes:
      - ./build/:/var/www/html/
      - ./nginx/conf.d/:/etc/nginx/conf.d
      - ./nginx/conf/log_format.conf:/etc/nginx/log_format.conf
      - ./nginx/logs/:/var/log/nginx
    networks:
      - node-server_backend_net
networks:
  node-server_backend_net:
    external: true # 来自外部
```

component_templates服务创建nginx容器，容器目录和数据卷静态文件目录绑定，更新静态资源达到部署效果

nginx配置如下：

```
nginx
├── conf
|   └── log_format.conf
├── conf.d
|   └── compose_templates.conf
└── logs # logs目录存放日志
```

compose_templates.conf

```
server {
    listen       80;
    server_name  localhost;
    location / {
        root   /var/www/html;
        index  index.html;
        try_files $uri $uri/ /index.html;
    }
    location /api/ {
        proxy_pass  http://backendContainer:8888/;
    }
}
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

nginx配置代理，当请求路径以`/api/`开头时，去掉`/api`，并转发到后端容器，而要想成功转发就必须在同一个网络下，通过配置`external`,指定已在Compose之外创建网络，docker-compose up不会尝试创建它

推送静态文件与配置，推送方法参考VSCode同步文件到服务器

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
                "text": "客户端发布测试环境",
                "tooltip": "点击发布到测试环境...",
                "targets": [ "comp" ]
            }
        }],
        "targets": [{
            "type": "sftp",
            "name": "comp",
            "dir": "/home/ubuntu/service/component_templates/",
            "host": "101.43.181.81",
            "port": 22,
            "user": "ubuntu",
            "privateKey": "/Users/dolphin/source/CI"
        }],
    },
}
```

最后配置组宿主机nginx，这里配置前端二级域名`admin.guiyexing.site`，组合本站点的配置

```
server {
  listen 80;
  server_name guiyexing.site,admin.guiyexing.site;
  # 将请求转成https
  rewrite ^(.*)$ https://$host$1 permanent;
}
server{
  listen 443 ssl;
  server_name admin.guiyexing.site;
  ssl_certificate      cert/admin.guiyexing.site_nginx/admin.guiyexing.site_bundle.pem;
  ssl_certificate_key  cert/admin.guiyexing.site_nginx/admin.guiyexing.site.key;
  ssl_session_timeout 5m;
  ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
  ssl_prefer_server_ciphers on;
  location / {
    proxy_pass http://localhost:7001;
    proxy_redirect off;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
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

后续可以参考[整合全栈Docker部署](/docs/deploy/整合全栈Docker部署#10自动打包)不使用本地打包的方式，目前开发阶段不使用该方式更方便些

最后附上截图

![image-20220921152250906](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202209211522067.png!blog.guiyexing)
