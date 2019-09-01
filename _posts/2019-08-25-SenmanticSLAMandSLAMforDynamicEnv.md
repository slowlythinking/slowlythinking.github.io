---
layout: post
title: "动态场景和语义地图SLAM相关论文"
date: 2019-08-25
description: "SenmanticSLAMandSLAMforDynamicEnv"
tag: [PaperReading, SLAM, SenmanticMapping, DynamicEnvironment]
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

* content
{:toc}

<!-- TOC depthFrom:3 depthTo:3 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Dynaslam: Tracking, mapping, and inpainting in dynamic scenes（2018 IEEE RAL）](#dynaslam-tracking-mapping-and-inpainting-in-dynamic-scenes2018-ieee-ral)
- [Mask-SLAM: Robust feature-based monocular SLAM by masking using semantic segmentation（2018CVPR）](#mask-slam-robust-feature-based-monocular-slam-by-masking-using-semantic-segmentation2018cvpr)
- [MaskFusion: Real-Time Recognition, Tracking and Reconstruction of Multiple Moving Objects（2018ISMAR）](#maskfusion-real-time-recognition-tracking-and-reconstruction-of-multiple-moving-objects2018ismar)
- [Slam++: Simultaneous localisation and mapping at the level of objects（CVPR2013）](#slam-simultaneous-localisation-and-mapping-at-the-level-of-objectscvpr2013)
- [DS-SLAM: A Semantic Visual SLAM towards Dynamic Environments》（IROS2018）](#ds-slam-a-semantic-visual-slam-towards-dynamic-environmentsiros2018)
- [Probabilistic Data Association for Semantic SLAM (ICRA2017)](#probabilistic-data-association-for-semantic-slam-icra2017)
- [Stereo Vision-based Semantic 3D Object and Ego-motion Tracking for Autonomous Driving (ECCV2018 港科大)](#stereo-vision-based-semantic-3d-object-and-ego-motion-tracking-for-autonomous-driving-eccv2018-港科大)
- [Long-term Visual Localization using Semantically Segmented Images (ICRA2018)](#long-term-visual-localization-using-semantically-segmented-images-icra2018)
- [A variational feature encoding method of 3d object for probabilistic semantic slam（IROS2018）](#a-variational-feature-encoding-method-of-3d-object-for-probabilistic-semantic-slamiros2018)
- [Detect-SLAM: Making Object Detection and SLAM Mutually Beneficial (2018WACV)](#detect-slam-making-object-detection-and-slam-mutually-beneficial-2018wacv)
- [SIVO : Semantically Informed Visual Odometry and Mapping》（硕士论文, 2018, University of Waterloo, Canada,Pranav Ganti）](#sivo-semantically-informed-visual-odometry-and-mapping硕士论文-2018-university-of-waterloo-canadapranav-ganti)

<!-- /TOC -->


### 相关论文

1. 《Mask-SLAM: Robust feature-based monocular SLAM by masking using semantic segmentation》（2018CVPR）
2. 《Detect-SLAM: Making Object Detection and SLAM Mutually Beneficial》（2018WACV）
3. 《MaskFusion: Real-Time Recognition, Tracking and Reconstruction of Multiple Moving Objects》（2018ISMAR [开源代码](https://github.com/martinruenz/maskfusion)）
4. 《Dynaslam: Tracking, mapping, and inpainting in dynamic scenes》（2018 IEEE RAL [开源代码](https://github.com/BertaBescos/DynaSLAM)）
5. 《Slam++: Simultaneous localisation and mapping at the level of objects》（CVPR2013）
6. 《DS-SLAM: A Semantic Visual SLAM towards Dynamic Environments》（IROS2018 [代码](https://github.com/ivipsourcecode/DS-SLAM)）
7. 《Probabilistic Data Association for Semantic SLAM》(ICRA2017)
8. 《Stereo Vision-based Semantic 3D Object and Ego-motion Tracking for Autonomous Driving》(ECCV2018 港科大)
9. 《Long-term Visual Localization using Semantically Segmented Images》(ICRA2018)
10. 《SIVO : Semantically Informed Visual Odometry and Mapping》（硕士论文, 2018, University of Waterloo, Canada,Pranav Ganti, [代码](https://github.com/navganti/SIVO)）
11. 《A variational feature encoding method of 3d object for probabilistic semantic slam》（IROS2018）

---

### Dynaslam: Tracking, mapping, and inpainting in dynamic scenes（2018 IEEE RAL）

#### OpenSource

[开源代码](https://github.com/BertaBescos/DynaSLAM)

#### Lab

Universidad de Zaragoza(萨拉戈萨大学，西班牙)

#### Content

结合Mask-RCNN和ORN-SLAM2建立了一套动态场景SLAM系统，包含单目、双目和RGB-D三种输入。

---

### Mask-SLAM: Robust feature-based monocular SLAM by masking using semantic segmentation（2018CVPR）

#### OpenSource

[code]()

#### Lab


#### Content

---

### MaskFusion: Real-Time Recognition, Tracking and Reconstruction of Multiple Moving Objects（2018ISMAR）

#### OpenSource

[开源代码](https://github.com/martinruenz/maskfusion)

#### Lab


#### Content

---

### Slam++: Simultaneous localisation and mapping at the level of objects（CVPR2013）

#### OpenSource


#### Lab


#### Content

---

### DS-SLAM: A Semantic Visual SLAM towards Dynamic Environments》（IROS2018）

#### OpenSource

[代码](https://github.com/ivipsourcecode/DS-SLAM)

#### Lab


#### Content

---

### Probabilistic Data Association for Semantic SLAM (ICRA2017)

#### OpenSource

[code]()

#### Lab


#### Content

---

### Stereo Vision-based Semantic 3D Object and Ego-motion Tracking for Autonomous Driving (ECCV2018 港科大)

#### OpenSource

[code]()

#### Lab


#### Content

---

### Long-term Visual Localization using Semantically Segmented Images (ICRA2018)

#### OpenSource

[code]()

#### Lab


#### Content

---

### A variational feature encoding method of 3d object for probabilistic semantic slam（IROS2018）

#### OpenSource

[code]()

#### Lab


#### Content


---

### Detect-SLAM: Making Object Detection and SLAM Mutually Beneficial (2018WACV)

#### OpenSource

[code]()

#### Lab


#### Content



---

### SIVO : Semantically Informed Visual Odometry and Mapping》（硕士论文, 2018, University of Waterloo, Canada,Pranav Ganti）

#### OpenSource

[代码](https://github.com/navganti/SIVO)

#### Lab


#### Content

<br>
转载请注明原地址，魏鑫燏的博客： [http://slowlythinking.github.io](http://slowlythinking.github.io) 谢谢！
