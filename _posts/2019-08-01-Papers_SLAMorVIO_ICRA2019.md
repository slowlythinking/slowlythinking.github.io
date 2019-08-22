---
layout: post
title: "2019年ICRA会议SLAM、VIO等相关论文"
date: 2019-08-01
description: "2019ICRA-Papers"
tag: [PaperReading, SLAM, ICRA]
excerpt: ICRA2019年部分论文（题目中包含SLAM或Visual-Inertial的），共计61篇，其中有两篇ICRA2018的论文，作为补充材料也列入了文档中，这篇博客将持续更新直至将全部论文阅读完毕。
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

---

[IEEExplore-ICRA2019](https://ieeexplore.ieee.org/xpl/conhome/8780387/proceeding)

[ICRA2019论文列表](https://github.com/PaoPaoRobot/ICRA2019-paper-list)（泡泡机器人）

---

### 1.《RESLAM - A Real-Time Robust Edge-Based SLAM System》

#### OpenSource

[code](https://github.com/fabianschenk/RESLAM)

#### Lab

Graz University of Technology, 奥地利格拉茨技术大学

#### Content

论文提出了一个基于边缘特征的RGBD SLAM系统，实现了局部滑窗的边缘深度优化，系统可以在CPU上实时运行（640*480px图像，30-35Hz，Intel i7-4790）。其主要创新在于实现了完整的基于边缘的SLAM系统（包括闭环检测）并开源了代码。

使用Canny算子来检测图像中的边缘，利用边缘的深度信息进行数据关联，闭环检测部分采用《Real-time rgb-d camera relocalization via randomized ferns for keyframe encoding》（2015TVCG）论文中的方法：对RGB图像下采样（得到40*30的图像），随机选择500个点，计算一个Fern descriptor，使用词袋法完成闭环检测。

系统结构：

![](/images/posts/ICRA2019/RESLAMSystem.png)

实验结果：

![](/images/posts/ICRA2019/RESLAMExpe.png)

---

### 2.《Real-time Scalable Dense Surfel Mapping》

#### OpenSource

[code](https://github.com/HKUST-Aerial-Robotics/DenseSurfelMapping)

#### Lab

香港科技大学

#### Content

提出了一个基于表面（surfel)的dense RGBD SLAM，该系统不需要GPU即可运行（KITTI数据集上约为10Hz）。

系统结构：

![](/images/posts/ICRA2019/HKSurfelSLAMSystem.png)

---

### 3.《SLAMBench 3.0: Systematic Automated Reproducible Evaluation of SLAM Systems for Robot Vision Challenges and Scene Understanding》

#### OpenSource

[PAMELA](http://apt.cs.manchester.ac.uk/projects/PAMELA/index.html)(A Panoramic View of the Many-core Landscape)：由英国工程和自然科学研究委员会（EPSRC）资助的项目，PAMELA参与者包括帝国理工学院、曼切斯特大学和爱丁堡大学，slambench是它们开源的一套SLAM性能分析框架。参考：PAMELA的[GitHub地址](https://github.com/pamela-project)。目前仅开源了slambench1.0和2.0。

#### Lab

University of Manchester（曼切斯特大学），University of Edinburgh（爱丁堡大学，Imperial College London（帝国理工学院）

#### Content

相比于SLAMBenchmark2，3.0有两个主要改进方向：动态场景（非刚体环境），基于深度学习的SLAM系统。新增了6个量化指标、4个数据集和5个SLAM算法。

新增了支持的SLAM算法和数据集（*号表示3.0新增的部分）：

![](/images/posts/ICRA2019/SLAMBenchmark3_SupportSLAMs.png)

![](/images/posts/ICRA2019/SLAMBenchmark3_SupportDatasets.png)

---

### 4.《SLAMBench2: Multi-Objective Head-to-Head Benchmarking for Visual SLAM》

**本文为2018ICRA**

#### OpenSource

[PAMELA](http://apt.cs.manchester.ac.uk/projects/PAMELA/index.html)(A Panoramic View of the Many-core Landscape)项目中的一部分，[开源地址](https://github.com/pamela-project/slambench2)。

#### Lab

University of Manchester（曼切斯特大学），University of Edinburgh（爱丁堡大学，Imperial College London（帝国理工学院），Stanford University (斯坦福大学)

#### Motivation

不同SLAM系统在不同数据集上的测试需要很多设置和环境配置，为了将这一测试工作系统化、减少冗余的分析工作，需要一个统一的基准测试程序，这一程序应该能够处理多种SLAM系统和多种数据集。

#### Content

SLAMBench2是一个SLAM性能测试基准，同时支持开源和闭源的SLAM系统。支持Ubuntu 14/16、 Fedora 24/25/26/27、 OS X 和Android平台；能够得到SLAM运行过程中的以下量化指标：精度、运行时间、内存占用和能耗；目前实现的特定SLAM系统用例（use-cases）：efusion, infinitam, kfusion, lsdslam, monoslam, okvis, ptam, orbslam2, svo；目前支持的数据集：ICL-NUIM, TUM RGB-D和EuRoC MAV。

具体贡献：

1. 用于不同SLAM系统的性能测试的开源框架；
2. 提出的开源框架能够处理已有的9种SLAM算法；
3. 便于集成新的SLAM系统和数据集(dataset-agnostic, plug and play algorithms)。

系统结构：

![](/images/posts/ICRA2019/SLAMBenchmark2_Sys.png)

四个部分：

* I/O: 为统一不同数据集和SLAM系统中的数据格式，定义了一个通用的输入数据格式（包括ground truth、数据时间戳、图像、深度值等）和通用数据格式向其他特定SLAM系统数据格式的转换工具。
* API: 将特定SLAM系统的输入输出与SLAMBenchmark2连接起来的接口。共有6个API。
* Loader: 调用API，完成SLAM系统的运行。
* User Interface: 显示接口，利用Pangolin库实现。

论文价值：

1. 开源的基准程序，可用于对比测试；
2. 设计思路。

问题：

这类通用对比系统难以分析特定SLAM系统的运行细节，比如ORB-SLAM中存在关键帧，其他一些系统中没有，所以SLAMBenchmark中没有对关键帧相关指标的分析。所以在系统对比时可用，但在特定SLAM系统设计过程中使用难度较大。

---

### 5.《A Monocular SLAM System Leveraging Structural Regularity in Manhattan World》

**本文为2018ICRA**

#### OpenSource

[项目主页](http://cvrs.whu.edu.cn/projects/Struct-PL-SLAM/)（包含代码）

#### Lab

武汉大学遥感与信息工程学院

#### Content

文中提出的系统先使用已有的方法来估计出相机位姿和三维地图(《PL-SLAM: Real-time monocular visual SLAM with points and lines》中的方法)，然后使用提出的基于平行、垂直、共面约束的优化策略来对估计出的相机位姿和三维地图进行进一步的优化。具体贡献：

1. 提出了一个新的利用平行垂直约束的旋转矩阵优化策略；
2. 一个新的利用共面约束的平移向量优化策略；
3. 基于平行、垂直、共面约束的高效三维地图优化策略。

---

### 6.《3D Keypoint Repeatability for Heterogeneous Multi-Robot SLAM》

#### OpenSource

无

#### Lab

University of Southern California（南加州大学），NASA支持项目

#### Content

在异构多机协同SLAM（Heterogeneous Multi-Robot SLAM，比如搭载双目摄像头的无人机和搭载激光雷达的无人车）中，三维点云注册具有很大挑战，因为不同设备获取的点云具有较多不同的性质。如下图所示，同样一个场景(a)，激光雷达获取的点云(b)和双目摄像头获取的点云(c)具有很多不同特性：双目获取的点云更稠密、误差更大、视角更小、包含错误的天空上的点。

![](/images/posts/ICRA2019/PointCloudfromMultiSensors.png)

这篇文章分析了常用的五种三维特征点检测算法在以上场景中的性能（作者认为本文是第一篇对比分析SLAM/VO应用中三维特征点检测算法性能的论文），主要分析了以下内容：

1. 五种三维特征点检测算法在不同传感器获取的点云中寻找重复点/匹配点的能力；
2. 在不同姿态下获取的点云中寻找重复点的能力；
3. 对双目获取的点云和激光雷达获取的点云同时处理时的实时性；

分析的五种特征点检测算法：Harris3D, NARF, ISS, KPQ和KPQ-SI。前三种在PCL库中有对应实现，后两种使用C++编码实现。

结论：相对而言，NARF和KPQ-SI算法能够找到最多的重复特征点，这两种算法能够提取足够的重复点以完成不同传感器点云的注册，其中KPQ-SI算法获取了最多数目的重复点，但是它的计算效率最低。

三维特征点数目：

![](/images/posts/ICRA2019/3DKeyPointsDetectedNum.png)

同一姿态下不同传感器获取的三维特征点匹配性能/重复程度（左图为激光雷电点云上检测特征点，然后在双目点云上寻找匹配点的比例，中间图在双目点云上做相同处理，右图为两种点云间匹配点的数目，横坐标为搜索半径）：

![](/images/posts/ICRA2019/3DKeyPointsRepeatability.png)

不同姿态下不同传感器获取的三维特征点匹配性能/重复程度（左右图为不同场景，横轴表示两个姿态间的距离，纵轴表示不同姿态下不同点云间的重复点/匹配点数目）：

![](/images/posts/ICRA2019/3DKeyPointsRepeDifferentPoseSensors.png)

三维特征点检测时间（单位：秒）：

![](/images/posts/ICRA2019/3DKeyPointsDetectedTime.png)

---

### 7.《A Comparison of CNN-Based and Hand-Crafted Keypoint Descriptors》

#### OpenSource

无

#### Lab

University of Alberta（阿尔伯塔大学，加拿大）

#### Content

文章对比了三类二维特征点描述子的性能，主要关注光照变换和视角变化两种应用场景，所分析的三维特征点描述子为：

* 非机器学习方法（hand-crafted solutions）：本文选择了SIFT和ROOT-SIFT；
* 预训练方法（pre-trained CNN）：将AlexNet、VGG16、ResNet101、DenseNet169等CNN网络的不同层作为特征点描述子（由于这些层的长度往往超出了通用描述子长度，在选定层后加上一个最大池化层来得到最终的描述子）；
* 训练方法（trained CNN）：DeepDesc、L2-Net、CS L2-Net和HardNet等专用于特征生成的CNN网络方法。

目前大家并不关注预训练方法与其他两种方法的对比，已有的类似工作使用的数据集也很小，因此本文视图完成这一分析。

所使用的数据集（[HPatches](https://hpatches.github.io/)）：

《Hpatches: A benchmark and evaluation of handcrafted and learned local descrip- tors》（CVPR2017）

实验结果：

1.预训练方法中选择的网络和作为特征点描述子的层：

![](/images/posts/ICRA2019/2DKeyPointDesPreTrainedChoose.png)

不同层的性能（mAP）：

![](/images/posts/ICRA2019/2DKeyPointDesPreTrained.png)

2.三种不同方法的性能：

![](/images/posts/ICRA2019/2DKeyPointDesThreeClassResults.png)

结论：Trained CNN方法在视角变换的场景下效果最好并且总体性能超过非机器学习方法，**Pre-Trained CNN方法在光照变换的场景下效果最好**。

---

### 8.《A-SLAM: Human in-the-loop Augmented SLAM》

#### OpenSource

无

#### Lab

American University of Beirut（贝鲁特美国大学）

#### Content

提出了一个基于Gmapping的、应用于增强现实领域的激光SLAM系统。特色：利用人的反馈交互来提升SLAM性能。

具体方法：通过HoloLens眼镜，用户可以编辑地图，即确定地图中哪些是障碍物区域，哪些可以通行，如下图(a:用户界面；b:操作过程；c和d:人为干预的地图)：

![](/images/posts/ICRA2019/ASLAM-HoloLens.png)

核心：地图由Occupancy Grid Maps(OGM)表示，其中每个单元包含一个占据概率（0~1），表示这个单元是否被障碍物占据，未探索的区域值为-1，因为系统使用了这个地图，用户就可以很方便地参与进地图编辑，从而实现人机交互。

实验：没有量化结果，只有人参与与否的建图情况示例和路径规划结果。

---

### 9.《A Linear-Complexity EKF for Visual-Inertial Navigation with Loop Closures》

#### OpenSource

无

#### Lab

University of Delaware（特拉华大学，美国）

#### Content

想解决的问题：如何在MSCKF框架中加入闭环检测模块。一个简单的解决方法就是将闭环发生时的关键帧作为系统状态 $X$ 的一部分，在更新过程优化这些关键帧的状态，然而这会导致计算复杂度为 $O(n^2)$ ，其中 $n$ 为系统状态的维数 $dim(X)$ 。

针对以上问题，作者使用Schmidt-KF (SKF)来解决这一问题，SKF来自以下论文：

《Application of state-space methods to navigation problems》（1966）

具体而言，在滤波更新过程中，计算卡尔曼增益时，所有与关键帧相关的项首先被变换为一个单独的项，称为Schmidt-Kalman gain，此项在卡尔曼计算公式中直接取0。而主要的系统计算量减小就在此处。

跟踪精度（RMSE）：

![](/images/posts/ICRA2019/LinearMSCKFRMSE.png)

运行时间(上图：文中系统；中图：MSCKF；下图：文中系统的整体执行时间)：

![](/images/posts/ICRA2019/LinearMSCKFTime.png)

---

### 10.《A Unified Framework for Mutual Improvement of SLAM and Semantic Segmentation》

#### OpenSource

无

#### Lab

达闼科技(cloudminds)

#### 背景

问题：SLAM应如何处理动态场景。核心思想是将动态物体探测出来，早期使用光流法等非机器学习方法来判断动态物体，近期基于机器学习的图像分割算法被用到了SLAM领域，相关的工作有以下一些，本文思路与[2]及其相似。

1. 《Mask-SLAM: Robust feature-based monocular SLAM by masking using semantic segmentation》（2018CVPR）
2. 《Detect-SLAM: Making Object Detection and SLAM Mutually Beneficial》（2018WACV）
3. 《MaskFusion: Real-Time Recognition, Tracking and Reconstruction of Multiple Moving Objects》（2018ISMAR [开源代码](https://github.com/martinruenz/maskfusion)）
4. 《Dynaslam: Tracking, mapping, and inpainting in dynamic scenes》（2018 IEEE RAL [开源代码](https://github.com/BertaBescos/DynaSLAM)）

#### Content

结合vSLAM和语义分割，综合提升两个任务的计算性能。核心思想：使用语义分割结果来提升vSLAM位姿分析精度（通过识别和处理移动和潜在移动物体实现），使用vSLAM得到的三维位姿提升语义分割性能（使用三维位姿来优化语义分割结果）。

系统结构：

![](/images/posts/ICRA2019/vSLAMplusSegmentationSys.png)

* 语义分割网络：FCIS（《Fully convolutional instance- aware semantic
* segmentation》2016），在MS COCO数据集上训练。
vSLAM：ORB-SLAM2。

用语义分割结果提升vSLAM性能：这部分较为简单，FCIS输出分割区域、背景区域及分割区域类别，对于人、车等潜在移动类别，不使用这部分区域对应的像素点来计算位姿，这样的操作可以提升SLAM系统的稳定性，个人感觉尤其是在关键帧选择部分，一旦关键帧中动态物体过多，传统ORB-SLAM2肯定会迅速崩溃，而这个方法解决了此问题。

用vSLAM结果提升语义分割结果：这部分更简单，得到前后两帧位姿，文章假设两件事情：1.视频帧率够高，两帧之间动态物体没动；2.前一帧优化过的语义分割结果是准确的。有了这两个假设，就把后一帧的像素点投影到当前帧，对比两帧的分割结果，以后一帧结果为真值。当前帧没分出来的补上，分错的去掉。

#### 实验结果

vSLAM结果（其中DynaSLAM就是参考文献4的开源SLAM）：

![](/images/posts/ICRA2019/vSLAMplusSegmentationExpvSLAM.png)

作者另外自己弄了个数据集对比与FCIS的分割效果，意义不大，不放结果了。

#### 总结

相比于DynaSLAM，SLAM精度提升效果不明显，利用位姿来改进语义分割效果这块，感觉还很粗糙。


<br>
转载请注明原地址，魏鑫燏的博客： [http://slowlythinking.github.io](http://slowlythinking.github.io) 谢谢！
