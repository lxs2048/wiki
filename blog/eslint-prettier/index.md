---
slug: eslint-prettier
title: ESlint与Prettier
authors: [dolphin]
tags: [eslint,prettier]
date: 2022-10-20T18:57
---

## ESLint 是什么

http://eslint.cn/docs/about/

ESLint 是一个开源的 JavaScript 代码检查工具，使用 [espree](https://github.com/eslint/espree) 将 JavaScript 代码解析成抽象语法树 (AST)，然后通过AST 来分析我们代码，从而给予我们两种提示：

1. 代码质量问题：使用方式有可能有问题
2. 代码风格问题：风格不符合一定规则

<!--truncate-->

## 初始化环境

使用以下命令初始化环境并安装`eslint`

```
mkdir eslint-pro
cd eslint-pro
npm init -y
npm i eslint -D
```

我们再新增一个index.js文件，写入如下内容

```js title="eslint-pro/index.js"
let hello = 'hello';
      let hi = "hi"
   console.log(`${hello}`);
```

使用`npx eslint --init`初始化eslint，接着会出现一些选项，根据需要选择

![image-20221018101510805](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210181015929.png!blog.guiyexing)

选完之后会自动下载eslint包，并在项目的根目录自动创建`.eslintrc.js`文件

## eslint检测与修复

接下来执行`npx eslint index.js`开始测试

![image-20221018101910646](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210181019748.png!blog.guiyexing)

终端报错，定义了变量，但没有使用，这就是最基本的用法。

但eslint并没有检测出上面书写的格式风格的不同，所以我们要去补充配置`.eslintrc.js`文件

```json
//0是忽略，1是警告，2是报错
"rules": {
    "quotes":2,
    "semi": [2,"never"],// 不需要分号
    "no-console": 1,
}
```

这时再执行`npx eslint index.js`

![image-20221018151544845](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210181515929.png!blog.guiyexing)

格式的问题也被检测出来了，提示可以使用`--fix` option修复，即`npx eslint index.js --fix`这样js文件里面的内容的格式就可以修复，比如结尾要不要分号，用单引号还是双引号。

![image-20221018152211276](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210181522380.png!blog.guiyexing)

## Eslint插件

以上查看错误和修复的过程，可以发现错误问题只有在你执行了指令之后才能看到。

**如果想在写代码的时候就能直接看到错误，然后直接改正错误，要怎么做呢？**

这时就可以使用vscode的eslint插件

![image-20221018104320232](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210181043356.png!blog.guiyexing)

安装完后，就能看到带波浪线的报错效果了，鼠标移上去显示提示

![image-20221018152438922](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210181524999.png!blog.guiyexing)

**有vscode插件，还需要eslint的npm包吗？**

需要。虽然vscode插件也可以单独配置格式，但是如果项目中有`.eslintrc.js`文件，那么eslint插件会优先执行`.eslintrc.js`文件的配置。

并不是每个人都会装eslint的vscode插件。此时eslint的npm包就作为一个保障，并且里面的`.eslintrc.js`配置就作为标准配置。**vscode插件只是为了方便开发而已。**

## 忽略特定的文件和目录

在项目**根目录**创建一个 `.eslintignore` 文件，这个文件告诉 ESLint 去忽略特定的文件和目录。`.eslintignore` 文件是一个纯文本文件，其中的每一行都是一个 glob 模式，表明哪些路径应该被忽略检测。例如，以下将忽略所有的 JavaScript 文件：

```bash
**/*.js
```

当 ESLint 运行时，在确定哪些文件要检测之前，它会在**当前工作目录**中查找一个 `.eslintignore` 文件。如果发现了这个文件，当遍历目录时，将会应用这些偏好设置。一次只有一个 `.eslintignore` 文件会被使用，所以，不是当前工作目录下的 `.eslintignore` 文件将不会被用到。

## prettier的npm包

**既然eslint能做格式化，那为什么还要prettier呢？**

在执行了`npx eslint index.js --fix`之后，js文件只是去掉了分号，改单为双引号，代码的格式依然混乱。并且eslint只能作用于js文件，像html，css，json文件，eslint无法处理代码格式问题，于是处理代码格式的prettier诞生了。

`npm i prettier -D`安装依赖，然后执行`npx prettier --write index.js`代码就变工整了，但是会自动加上我们不需要的分号

![image-20221018152748462](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210181527525.png!blog.guiyexing)

并且我们新建一个`index.css`文件

![image-20221018145945324](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210181459583.png!blog.guiyexing)

执行`npx prettier --write index.css`格式化css文件

![image-20221018152934895](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210181529964.png!blog.guiyexing)

接着可以自定义代码格式配置，在项目的根目录创建`.prettierrc.js`文件

```js
module.exports = {
    semi: false,
    singleQuote: true,
}
```

然后在执行一次`npx prettier --write index.js`,格式化js，以上配置会清空分号并且把双引号改为单引号，和eslint想要的效果冲突，所以二者的配置应该保持一致。

## 解决冲突

当前的现象：

`npx eslint index.js --fix`会将代码修复为双引号

`npx prettier --write index.js`会将代码格式化为单引号

为了能 **配合使用 ESLint 和 Prettier**，应该 **关闭所有可能和 Prettier 冲突的 ESLint 规则** (也就是 `代码格式化` 那些)，`eslint-config-prettier` 包可以解决了这个问题。

```javascript
npm install eslint-config-prettier --save-dev
```

先在 `.eslintrc.js` 中，将 `prettier` 加到 `extends` 数组的最后，并移除任何 `代码格式化` 相关的规则：

```javascript
module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "prettier"
    ],
    "overrides": [],
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    "rules": {}
}
```

如此一来, Prettier的配置将覆盖 `extends` 数组中先前任何 `代码格式化` 相关的 ESLint 配置，二者就能并行不悖地工作了。

## **将 Prettier 整合进 ESLint**

分别运行两条命令以检查语法和格式化代码可不太方便，我们可以通过安装 `eslint-plugin-prettier` 包来解决这个问题。

```javascript
npm install eslint-plugin-prettier --save-dev
```

在 `.eslintrc.js` 的 `plugins` 数组中加入 `prettier` 插件，并建立一条指定为  `error`  的 Prettier 新规则，这样任何格式化错误就也被认为是 ESLint 错误了。

```json
{
	//...
    "rules": {
        "prettier/prettier": "error"
    },
    "plugins": [
        "prettier"
    ]
}
```

重新执行`npx eslint index.js`测试

![image-20221020150822495](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210201508714.png!blog.guiyexing)

如下执行修复命令会连同prettier检测到的格式问题一同修复

![image-20221020150917907](https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/blogImg/202210201509098.png!blog.guiyexing)

## Lint 和 Prettier区别

ESLint（包括其他一些 lint 工具）的主要功能包含代码格式和代码质量的校验，而 Prettier 只是代码格式的校验，不会对代码质量进行校验。代码格式问题通常指的是：单行代码长度、tab 长度、空格、逗号表达式等问题。代码质量问题指的是：未使用变量、三等号、全局变量声明等问题。

## VScode保存自动修复

最佳方案是在当前的工作空间配置

可以直接在项目根目录新增`.vscode/settings.json`

```json
{
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    }
}
```

## NPX

[NPM的新特性NPX全解](https://zhuanlan.zhihu.com/p/346998633)
