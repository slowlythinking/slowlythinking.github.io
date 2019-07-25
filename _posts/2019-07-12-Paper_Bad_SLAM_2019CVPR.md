---
layout: post
title: "论文阅读-BAD-SLAM-2019-CVPR"
date: 2019-07-12
description: "BAD-SLAM"
tag: [PaperReading, SLAM]
excerpt: 这篇论文分析了影响直接法RGBD-SLAM精度的重要因素——深度数据与RGB数据的同步以及RGB数据中像素的同步曝光；提出了一个新的应用于直接法中的快速BA算法，在新的数据集上达到了同类系统最好效果；开源了一个新的数据集，使用了同步全局快门相机（synchronized global shutter cameras）；给出了基于该数据集的在线排行榜，同时开源了提出的BAD SLAM源码。
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

**Author of This Article Analysis：魏鑫燏；Time：2019-07-12**

### 论文

《BAD SLAM: Bundle  Adjusted Direct RGB-D SLAM》(2019CVPR, ETH)

### Open Source

1. [数据集](https://www.eth3d.net/)
2. [BAD SLAM system](https://github.com/ETH3D/badslam)

### Motivation

1. 目前SLAM领域中直接法的位姿精度大都比ORB-SLAM2（特征法）差，作者认为这是由于直接法容易被目前数据集中的几个因素影响：卷帘快门（rolling shutter）、图像和深度信息的同步问题、深度信息中的误差。这些问题从硬件层面更易于解决，所以作者提出了一个新的数据集，概括来说，作者认为ORB-SLAM2并不真的就比直接法好，而是目前的数据集存在一些问题；

2. 目前认为Full BA用到直接法中是不能做到实时的，已有的系统使用了一些近似的手段来处理这一问题（比如基于位姿图的BA优化），作者提出了一个新的用于直接法的full BA，在单个GPU上达到了实时运行。

### Contribution

1. 一个新的应用于直接法中的快速BA算法，在新的数据集上达到了同类系统最好效果；
2. 一个新的数据集，使用了同步全局快门相机（synchronized global shutter cameras）；
3. 给出了基于该数据集的在线排行榜，同时开源了提出的BAD SLAM源码。

### Content

#### 3D环境表示方法

**Surfel**：一个有向的圆（an oriented disc），用于表示环境地图，图像上每4*4个像素点的区域可生成一个surfel。包括：一个三维中心点的坐标$P_s$，一个平面法向量$n_s$，一个半径$r_s$，一个视觉描述子（标量）$d_s$。

相比于mesh(from《Photometric bundle adjustment for dense multi-view 3D modeling》CVPR2014)：Surfel在BA过程中不存在额外的拓扑更新；相比于Voxel(from《KinectFusion： Real-time dense surface mapping and tracking》2011)：surfel能够在任意尺度上表示很小的平面（这部分还并不是很懂）。

#### 特征匹配

surfel与图像中像素点的匹配过程仅使用了surfel的中心点和平面法向量，当以下条件满足时匹配成功：
1. surfel中心点的投影点处的像素点有深度值（深度相机在一些尖角处常常没有深度输出）；
2. 像素点深度与surfel中心点深度足够相似；
3. surfel平面法向量与深度图上得到的法向量（这里使用有限差分来计算以像素点为中心的的法向量），以及像素点与相机中心的方向足够相似。

#### 目标函数

surfel的优化存在病态（ill-conditioned）问题，当视觉描述子和几何信息变化不明显时（比如一面白墙），即输入数据的约束能力不足时，surfel会优化到错误的数值，解决方案是限制优化方向（仅沿平面法向量方向优化），优化的目标函数为：

$$
C(K,S)= \sum_{k\in K}{\sum_{s\in S_k}(\rho_{Tukey}(\sigma_D^{-1}r_{geom}(s,k))+\omega_{photo}\rho_{Huber}(\sigma_p^{-1}r_{photo}(s,k)))}
$$

目标函数中包含两部分：$r_{geom}$ 和$r_{photo}$。分别表示几何误差和光度误差。其中限制优化方向的部分在于几何误差优化部分：

$$
r_{geom}(s,k)=(Tn_s)^T(\pi^{-1}(\hat{\pi}(TP_s))-TPs)
$$

其中的$n_s$为Surfel的平面法向量，即误差是沿着法向量方向计算的。即将Surfel的中心点投影到当前帧，再使用当前帧中深度信息反投影回去，计算这个三维点与原三维点的距离，而且这个误差距离是沿着Surfel法向量方向的那部分距离。

剩下的光度误差计算较为简单，在Surfel边缘选两个点$s_1$和$s_2$，保证$s_1P_s$和$s_2P_s$相互垂直，然后计算这两个点投影到平面之后到$P_S$投影点之间的两个灰度梯度值，这个值将作为光度信息，它与Surfel视觉描述子的距离即为光度误差。

#### 优化过程

优化过程的实时性问题的解决：
当使用一些二阶方法——如高斯牛顿法——来优化以上surfel和帧位姿时，即使采用了舒尔补提升优化速度，优化过程仍然过慢，作者给出了优化策略的算法伪代码：

<img src="/images/posts/BadSLAM/AlgorithmofOpt.png" width="500">

这个优化策略中对降低计算时间起作用的有以下几个点：

1. surfel的法向量没有参与优化，只是对全部对应的观测值生成法向量做了一个平均；
2. 三维中心点和视觉描述子优化过程中限定了优化方向（仅沿法向量方向），提高了收敛速度；
3. 优化过程中相同surfel会做融合，这会减少计算量。

#### 数据集

1. 使用全局快门相机而非卷帘快门相机；
2. 使用一个双目主动红外相机来获取深度，这个相机与RGB相机完全同步，保证深度图和RGB图像的完全同步。

### Experiments

<img src="/images/posts/BadSLAM/Results1.png" width="600">

其中clean表示同步并使用全局快门的数据，async表示全局快门+异步数据，rs表示卷帘快门数据。这里说明了直接法对深度数据和RGB数据是否同步更为敏感。

### Conclusion

个人觉得这份工作对领域内的意义在于分析了影响直接法RGBD-SLAM精度的重要因素——深度数据与RGB数据的同步以及RGB数据中像素的同步曝光。可以回看ORB-SLAM论文中对精度超过LSD-SLAM的分析：直接法SLAM中光度一致的假设导致其特征匹配的基线不可太长（跑太远两帧之间的光度不一致就无法匹配了），这影响了重建的精度。目前看来这一因素可能并不是影响精度的主要因素。这种类型的工作厘清了一些领域内的重要问题，颇有价值，类似的还有CVPR2019的《Pseudo-LiDAR from Visual Depth Estimation: Bridging the Gap in 3D Object Detection for Autonomous Driving》，这篇包含开源代码的工作说明了纯视觉的三维目标检测是可以达到和激光雷达类似精度的，之前的问题是三维点表示方法上存在的问题，而不是视觉重建本身的缺陷。

至于论文中提出的这个“FULL BA”的价值有待商榷，其实验给出的运行时间数据依旧不小（在GPU上），且其这部分的核心贡献是一个包含众多策略的优化算法，鲁棒性存疑。

<br>
转载请注明原地址，魏鑫燏的博客： [http://slowlythinking.github.io](http://slowlythinking.github.io) 谢谢！
