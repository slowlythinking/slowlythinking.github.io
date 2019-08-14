---
layout: post
title: "使用Jekyll实现站点双语切换"
date: 2019-07-26
description: "Bilingual_Site_with_jekyll"
excerpt: 目前Jekyll并不支持多语言特性，已有的一些Jekyll的双语插件包不能在github托管的网站上实现（安全考虑），尝试更改小部分Jekyll框架来实现符合使用逻辑的双语切换规则。
tag: 博客
---

<script type="text/x-mathjax-config">
  MathJax.Hub.Config({
    tex2jax: {
      inlineMath: [ ['$','$'], ["\\(","\\)"] ],
      processEscapes: true
    }
  });
</script>
<script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>

### 参考

1. stack overflow上关于Jekyll双语切换问题的[回答](https://stackoverflow.com/questions/6392677/include-different-file-in-jekyll-depending-on-the-locale);
2. sylvain durand关于实现Jekyll站点英语/法语切换的[博客](https://www.sylvaindurand.org/making-jekyll-multilingual/);
3. xulihang的博客：[用jekyll构建多语言网站](https://blog.xulihang.me/jekyll-multilingual/)
4. forestry的博客：[Creating a Multilingual Blog With Jekyll](https://forestry.io/blog/creating-a-multilingual-blog-with-jekyll/)
5. longqian的博客：[Jekyll博客的中文支持](http://longqian.me/2017/02/12/jekyll-support-chinese/)
6. Jekyll插件：[Jekyll Multiple Languages Plugin](https://github.com/kurtsson/jekyll-multiple-languages-plugin)（kurtsson，Start：578）
7. Jekyll插件：[jekyll-multiple-languages](https://github.com/liaohuqiu/jekyll-multiple-languages)（liaohuqiu，Start：48，有详细[example](http://jekyll-langs.liaohuqiu.net/)页面）

### 相关背景

[Jekyll](https://jekyllrb.com/)是一个静态网站生成器，它有一个模版目录，其中包含原始文本格式的文档，通过一个转换器（如 Markdown）和[Liquid](https://github.com/Shopify/liquid/wiki)渲染器转化成一个完整的可发布的静态网站，可以发布在任何服务器上。Jekyll 也可以运行在[GitHub Page](http://pages.github.com/)上，也就是说，可以使用GitHub的服务来搭建项目页面、博客或者网站，而且是完全免费的。

目前这个网站中的页面（default.html）大致包含三个部分：头部、正文、评论（另外还包含打赏页面）。其中：

* 头部：包含姓名、头像和导航栏
* 正文：这部分随着页面不同有些区别，主要有index（初始页面）、archive（文章归档目录）、about（个人信息）、post（具体文章列表）四类
* 评论：在包含post、about正文中存在

### 已有的实现方案

可以分为两种：

1. 使用Jekyll插件实现，首先有很多人有这个需求，所以他们开发了一些这些插件，比如[6]、[7]，这些插件遵照Jekyll官方提供的定制化的特性来开发。但是遗憾的是github托管的页面出于安全的考虑不准使用这些插件。有人提出了一些解决方案，基本思路是将编译好的内容放入github托管页面项目，最终使github呈现出编译好的内容，相关处理脚本为：

```
#!/bin/bash
function exe_cmd() {
    echo $1
    eval $1}
if [ $# -lt 1 ]; then
    echo "Usage: sh $0 [ gh-pages | master ]"
    exitfi
branch=$1if [ -z "$branch" ] || [ "$branch" != "master" ]; then
    branch='gh-pages'fi
exe_cmd "jekyll build"if [ ! -d '_site' ];then
    echo "not content to be published"
    exitfi
exe_cmd "git checkout $branch"error_code=$?if [ $error_code != 0 ];then
    echo 'Switch branch fail.'
    exitelse
    ls | grep -v _site|xargs rm -rf
    exe_cmd "cp -r _site/* ."
    exe_cmd "rm -rf _site/"
    exe_cmd "touch .nojekyll"fi
```

2. 以上方式较为笨重，另外一种方式是更改Jekyll框架的部分来实现，参考以上[1-4]。本文也将采用类似的方式来实现。

### 符合使用逻辑的双语切换规则

双语切换规则应包含一些功能：

1. 所有页面可见的切换按钮，可将这些按钮放到页面头部导航栏中；
2. 切换后的页面中全部内容均为同一语言，这就包含四类正文的语言切换、头部语言切换；
3. post页面内的切换是较为复杂的地方，这部分应包含以下特性：当前文章有对应另外语种的文章时，切换后应直接显示另一语种的文章；当前文章没有对应另外语种的文章时，切换后直接显示博客主页。
4. 博客写作方面，应将不同语种的文章存储在不同文件夹下，它们应该包含独立的标签系统。
5. 应该易于扩展到多语种。

### 基于Jekyll的双语站点建设方法

在我们打算使用的第二类双语实现方案中，已知的几种实现方式有：

1. 将Jekyll中的配置变量进行分类，参考[1]，即所有变量如post、nav等均有两套，分别存储在不同名称的双语变量组中，例如在_config.html中可以实现以下的代码设置，同时将不同语种的具体内容存储在不同文件夹中，在需要显式不同语种内容时，利用url中的文件夹标签来识别显式的语种类型。

```
# _config.yml
...
locales:
  en:
    nav:
    - text: Welcome
      url: /en/welcome
    - text: Blog
      url: /en/blog
      layout: post
    ...
  es:
    nav:
    - text: Bienvenido
      url: /es/bienvenido
    - text: Blog
      url: /es/blog
      layout: post
    ...
```

2. 新增一个语言变量，在不同page中增加这个变量并依靠这个变量来选择性显式，同时在config文件中按照上面类似的方式来处理，依靠page中的变量来选择性显式，这个方式没有将文章分类到不同文件夹。

以上新增变量的方法是一个较为常用的方法，但是并不符合逻辑，我们将不同语言的内容视为两个独立的空间，当内容分文件夹存放时，为何需要额外的变量来指导当前的显示策略？所以较好的方式应该将不同语言的内容储存到不同文件夹，然后通过路径中文件夹字符串来判断当前的显示策略，这样也存在一个问题：显示方式一般是统一的，但是也有可能存在比较少的不同点，我们不想建两套独立的显示控制（css），这里也可以使用路径中的文件夹字符串来实现。



<br>
转载请注明原地址，魏鑫燏的博客： [http://slowlythinking.github.io](http://slowlythinking.github.io) 谢谢！
