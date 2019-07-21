---
layout: post
title: "GitHub中Markdown内的公式渲染"
date: 2019-07-22
description: "Equations-in-Markdown"
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

**Author：魏鑫燏；Time：2019-07-22**

### 参考

* GitHub官方文档[GitHub Flavored Markdown Spec](https://github.github.com/gfm/)
* stack overview上的[回答](https://stackoverflow.com/questions/11256433/how-to-show-math-equations-in-general-githubs-markdownnot-githubs-blog)
* GitHub上markup项目中的相关[issue](https://github.com/github/markup/issues/897)

### Markdown in Github

目前GFM(GitHub Flavored Markdown)官方文档中没有任何与公式(Equation)相关的条目，这表明目前GFM是不支持公式的。

stack overview上的[回答](https://stackoverflow.com/questions/11256433/how-to-show-math-equations-in-general-githubs-markdownnot-githubs-blog)中的解释：

> GitHub中markdown的解析是由SunDown库完成的，这个库的一个设计原则就是：

> "Standards compliant, fast, secure markdown processing library in C"

**注意：GFM是支持部分HTML标签的，比如script, style, pre等**

### 在GFM中插入公式的方法

#### 1.最佳方案-Script+MathJax

[MathJax](https://www.mathjax.org/)是一个用于数学公式展示的JavaScript引擎，它支持几乎全部浏览器。

在GFM中，我们可以在Markdown文档的前部加入以下HTML标签：

```
<script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>
```

MathJax默认行内公式标记为"\\\\"，可以使用以下方法来支持"$"符号(注意将下面的代码加到上面代码之前)：

```
<script type="text/x-mathjax-config">
  MathJax.Hub.Config({
    tex2jax: {
      inlineMath: [ ['$','$'], ["\\(","\\)"] ],
      processEscapes: true
    }
  });
</script>
```

#### 2.使用外部网站来将公式渲染为图片

##### 使用Google Chart的服务器

参考[博客](https://github.com/xiahouzuoxin/notes/blob/master/essays/Markdown%E4%B8%AD%E6%8F%92%E5%85%A5%E6%95%B0%E5%AD%A6%E5%85%AC%E5%BC%8F%E7%9A%84%E6%96%B9%E6%B3%95.md)

使用方法：

```
<img src="http://chart.googleapis.com/chart?cht=tx&chl= 在此插入Latex公式" style="border:none;">
```

一个例子:

```
<img src="http://chart.googleapis.com/chart?cht=tx&chl=\Large x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}" style="border:none;">
```

公式显示结果为：

<img src="http://chart.googleapis.com/chart?cht=tx&chl=\Large x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}" style="border:none;">

Google Chart服务器的响应速度还可以，但据说可能复杂一些的Latex公式可能无法解析。

##### 使用forkosh服务器

参考[博客](https://github.com/xiahouzuoxin/notes/blob/master/essays/Markdown%E4%B8%AD%E6%8F%92%E5%85%A5%E6%95%B0%E5%AD%A6%E5%85%AC%E5%BC%8F%E7%9A%84%E6%96%B9%E6%B3%95.md)

使用方法：

```
<img src="http://www.forkosh.com/mathtex.cgi? 在此处插入Latex公式">
```

一个例子:

```
<img src="http://www.forkosh.com/mathtex.cgi? \Large x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}">
```

公式显示结果为：

<img src="http://www.forkosh.com/mathtex.cgi? \Large x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}">

Google Chart服务器的响应速度还可以，但据说可能复杂一些的Latex公式可能无法解析。

<br>
转载请注明原地址，魏鑫燏的博客： [http://slowlythinking.github.io](http://slowlythinking.github.io) 谢谢！
