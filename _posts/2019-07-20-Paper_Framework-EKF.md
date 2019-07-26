---
layout: post
title: "SLAM基础-扩展卡尔曼滤波"
date: 2019-07-20
description: "KF-and-EKF"
tag: [SLAM, EKF]
excerpt: 文章总结了卡尔曼滤波和扩展卡尔曼滤波的历史、作用和公式推导过程，同时给出了几个较有价值的学习材料。卡尔曼全名Rudolf Emil Kalman，匈牙利数学家，1930年出生于匈牙利首都布达佩斯。1953，1954年于麻省理工学院分别获得电机工程学士及硕士学位。1957年于哥伦比亚大学获得博士学位。我们现在要学习的卡尔曼滤波器，正是源于他的博士论文和1960年发表的论文《A New Approach to Linear Filtering and Prediction Problems》（线性滤波与预测问题的新方法）。
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

**Author：魏鑫燏；Time：2019-07-20**

文中部分公式来自[How a filter works in pictures - blog](https://www.bzarg.com/p/how-a-kalman-filter-works-in-pictures/)

### 学习材料

1. [How a filter works in pictures - blog](https://www.bzarg.com/p/how-a-kalman-filter-works-in-pictures/)
2. [The Extended Kalman Filter: An Interactive Tutorial for Non-Experts - blog](https://simondlevy.academic.wlu.edu/kalman-tutorial/) (Simon D. Levy教授, 华盛顿与李大学, Washington and Lee University, [中文翻译](http://shequ.dimianzhan.com/articles/337/extended-kalman-filter-course-from-shallow-to-deep))
3. [Estimation II 1 Discrete-time Kalman filter - PDF](http://www.robots.ox.ac.uk/~ian/Teaching/Estimation/LectureNotes2.pdf) (牛津大学Ian Reid教授课程, 2001)
4. An Introduction to the Kalman Filter (Greg Welch, 2006)
5. 书籍《STATE ESTIMATION FOR ROBOTICS》3.3.2(KF), 4.2.3(EKF)（2019, [Professor Timothy D. Barfoot](https://ieeexplore.ieee.org/author/37283734000), University of Toronto)
6. 基于上述书籍的[中文博客解读](https://www.cnblogs.com/gaoxiang12/p/5560360.html)
7. [Extended Kalman Filter Tutorial - PDF](https://homes.cs.washington.edu/~todorov/courses/cseP590/readings/tutorialEKF.pdf) (Gabriel A. Terejanu, University at Buffalo, 布法罗大学)

个人学习过程：以上学习材料中[1]和[2]是两个相当通俗易懂的卡尔曼滤波解读（不涉及EKF），便于建立初步概念，我首先阅读了它们。[3]、[4]和[5]是三个包含公式推导的解读文献，其中[4]和[5]包含了KF和EKF，推导的详细程度为：[5]>[3]>[4]，我从[4]看起，如果有一些不甚明了的问题，则参考[3]来理解，完成了[3]、[4]的阅读之后，对KF的理解基本就没问题了（对于EKF还存在疑问），此时参看书籍[5]和中文博客[6]，从最大后验分析的角度来理解KF和EKF，这部分是一个有趣且耗时较长的过程，有很多新的问题冒出然后被解决(吸引我阅读完了第三章和第四章)。

### BackGround


#### 协方差矩阵（Covaraiance Matrix)

通俗来讲，协方差用于衡量两个变量的总体误差。而方差是协方差的一种特殊情况，即当两个变量是相同的情况。它只能处理二维问题，可以度量两个随机变量的关系。协方差矩阵就是把协方差扩展来**判断多维（不止二维）变量之间的相关度**。这个矩阵是个对称矩阵。

随机变量$X=(X_1,X_2,...,X_n)^T$的协方差矩阵$P$为（其中$E$表示期望的计算过程，$cov$表示协方差计算过程）：

$$
P=cov[X_i,X_j]=E[(X_i)-E(X_i)(X_j-E[X_j])]
$$

举例：当一个机器人的状态表示为位姿和速度$X=(position,veloctiry)$ 时，其协方差矩阵为：

$$
P=\begin{bmatrix} \Sigma_{pp} & \Sigma_{pv} \\ \Sigma_{vp} & \Sigma_{vv} \end{bmatrix}
$$

其中 $\Sigma$表示两个变量的协方差，注意协方差矩阵不仅描述了变量之间的相关度，其对角线上的数据即单个随机变量的方差。

#### 多元高斯分布

多元高斯分布的概率密度函数表示为($\mathbf{x} \in \mathbb{R}^N, \mathbf{\mu} \in \mathbb{R}^N, \mathbb{\Sigma} \in  \mathbb{R}^{N \times N}$):

$$
f(\mathbf{x}) = \frac{1}{\sqrt{(2 \pi)^N \det \mathbf{\Sigma}}} \exp({- \frac{1}{2}{ ( \mathbf{x} - \mathbf{\mu})^T \mathbf{\Sigma}^{-1} ( \mathbf{x} - \mathbf{\mu})} })
$$

#### 高斯分布的乘积

参考《Products and Convolutions of Gaussian Probability
Density Functions》（P. A. Bromiley, University of Manchester, [pdf](http://www.tina-vision.net/docs/memos/2003-003.pdf)）

有两个高斯分布，其概率密度函数分别为：

$$
\begin{equation}
\begin{aligned}
f_1(x) &= \frac{1}{\sqrt{2 \pi} \sigma_1} \exp({- \frac{ ( x - \mu_1)^2}{2\sigma_1^2} }) \\
f_2(x) &= \frac{1}{\sqrt{2 \pi} \sigma_2} \exp({- \frac{ ( x - \mu_2)^2}{2\sigma_2^2} })
\end{aligned}
\end{equation}
$$

计算其乘积：

$$
\begin{equation}
\begin{aligned}
f(x) &= f_1(x)f_2(x) \\
&= \frac{1}{2 \pi \sigma_1 \sigma_2} \exp({- [\frac{ ( x - \mu_1)^2}{2\sigma_1^2} + \frac{ ( x - \mu_2)^2}{2\sigma_2^2}  ] })
\end{aligned}
\end{equation}
$$

这个新的高斯分布的期望和方差分别为：

$$
\begin{equation}
\begin{aligned}
\mu’ &= \frac{\mu_1 \sigma_2^2 + \mu_2 \sigma_1^2}{\sigma_1^2 + \sigma_2^2 } = \mu_1 + \frac{\sigma_1^2 (\mu_2 – \mu_1)} {\sigma_1^2 + \sigma_2^2}\\
{\sigma’}^2 &= \sigma_1^2 – \frac{\sigma_1^4} {\sigma_1^2 + \sigma_2^2}
\end{aligned}
\end{equation}
$$

#### 叠加原理（Superposition Principle）

在物理学与系统理论中，叠加原理（superposition principle），也叫叠加性质（superposition property），说对任何线性系统“在给定地点与时间，由两个或多个刺激产生的合成反应是由每个刺激单独产生的反应之代数和。”

如果输入 $A$ 产生反应 $X$ ，输入 $B$ 产生$Y$ ，则输入 $A+B$ 产生反应 $X+Y$ 。

在数学中，这个性质更常被叫做可加性。在绝大多数实际情形中，$F$的可加性表明它是一个线性映射，也叫做一个线性函数或线性算子。

在控制理论中，叠加原理是线性系统的一个重要特征(《自动控制原理》（胡寿松第五版）)。

叠加原理适用于任何线性系统，包括代数方程、线性微分方程、以及这些形式的方程组。输入与反应可以是数、函数、向量、向量场、随时间变化的信号、或任何满足一定公理的其它对象。注意当涉及到向量与向量场时，叠加理解为向量和。

#### 平衡点（Equilibrium point）

在数学中，平衡点是微分方程或差分方程中的概念，对于微分方程：

$$
f(t,x)=dx/dt, x \in R^n
$$

若 $f(t,\hat{x})=0$ 对任意$t$都成立，则称 $\hat{x}$ 为此微分方程的平衡点。

在控制系统中，平衡点是用来描述非线性系统的稳定性的。线性系统的平衡点是全局的，而非线性系统可能有多个平横点，但并不是所有的平横点都是稳定的。

### 卡尔曼滤波（Kalman Filter, KF）

#### History

卡尔曼全名Rudolf Emil Kalman，匈牙利数学家，1930年出生于匈牙利首都布达佩斯。1953，1954年于麻省理工学院分别获得电机工程学士及硕士学位。1957年于哥伦比亚大学获得博士学位。我们现在要学习的卡尔曼滤波器，正是源于他的博士论文和1960年发表的论文《A New Approach to Linear Filtering and Prediction Problems》（线性滤波与预测问题的新方法）。如果对这篇论文有兴趣，可以到这里的[地址](http://www.cs.unc.edu/~welch/kalman/media/pdf/Kalman1960.pdf)下载。

> 上述论文中有一个值得记录的对问题的分类方法：对于一个带有误差$g(t)$ 的时变系统$y(t)=x(t)+g(t)$，我们知道了观测值$y(t_0),...,y(t_n)$，需要分析$t$时刻的$x(t)$，当$t<t_n$时，这是一个数据平滑问题(data smoothing (interpolation) problem)，当$t=t_n$时，这是一个滤波问题(filtering)，当$t>t_n$时，这是一个预测问题(prediction problem)，它们可以笼统的称为一个分析问题(estimation)，这也是后续论文或者书籍对这类问题的描述方法（比如Linear-Gaussian Estimation）。

卡尔曼滤波的一个典型实例是从一组有限的，包含噪声的，对物体位置的观察序列（可能有偏差）预测出物体的位置的坐标及速度。在很多工程应用(如雷达、计算机视觉)中都可以找到它的身影。同时，卡尔曼滤波也是控制理论以及控制系统工程中的一个重要课题。例如,对于雷达来说，人们感兴趣的是其能够跟踪目标。但目标的位置、速度、加速度的测量值往往在任何时候都有噪声。卡尔曼滤波利用目标的动态信息，设法去掉噪声的影响，得到一个关于目标位置的好的估计。这个估计可以是对当前目标位置的估计(滤波)，也可以是对于将来位置的估计(预测)，也可以是对过去位置的估计(插值或平滑)。

斯坦利.施密特(Stanley Schmidt)首次实现了卡尔曼滤波器。卡尔曼在NASA埃姆斯研究中心访问时，发现他的方法对于解决阿波罗计划的轨道预测很有用，后来阿波罗飞船的导航电脑便使用了这种滤波器。 关于这种滤波器的论文由Swerling (1958)、Kalman (1960)与 Kalman and Bucy (1961)发表。

目前,卡尔曼滤波已经有很多不同的实现.卡尔曼最初提出的形式现在一般称为简单卡尔曼滤波器。除此以外，还有施密特扩展滤波器、信息滤波器以及很多Bierman, Thornton 开发的平方根滤波器的变种。也许最常见的卡尔曼滤波器是锁相环，它在收音机、计算机和几乎任何视频或通讯设备中广泛存在。

#### Content

卡尔曼滤波的应用前提是系统需为线性系统，即其系统状态变量的差分方程是线性的，且系统的噪声（过程噪声、测量噪声）均为高斯白噪声。（这也是后续扩展卡尔曼滤波方法的Motivation）

---

卡尔曼滤波器用于估计离散时间过程的状态变量$x\in\mathfrak{R}^n$。这个离散时间过程由以下离散随机差分方程描述：

$$
x_k=Ax_{k-1}+Bu_{k-1}+w_{k-1}
$$

观测变量$z\in\mathfrak{R}^m$，量测方程为：

$$
z_k=Hx_k+v_k
$$

其中$w_k$和$v_k$均表示噪声，假设它们为相互独立、正态分布的白噪声：

$$
P(w) \sim N(0,Q), P(v) \sim N(0,R).
$$

---

在实际应用中，状态变量$x$可以表示多种情形，比如机器人的位姿和速度、汽车发动机的温度、无人机的当前高度等等，为简化问题，假设此处状态$x$表示机器人的位姿和速度，即$x=(p,v)$。由于存在各种误差因素，一个系统的当前状态并不准确，我们将机器人的速度和位姿建模为正态分布的随机变量，那么使用均值和协方差矩阵就可以描述当前状态，即：

$$
\begin{equation} \label{eq:statevars}
\begin{aligned}
\mathbf{\hat{x}}_k &= \begin{bmatrix}
\text{position}\\
\text{velocity}
\end{bmatrix}\\
\mathbf{P}_k &=
\begin{bmatrix}
\Sigma_{pp} & \Sigma_{pv} \\
\Sigma_{vp} & \Sigma_{vv} \\
\end{bmatrix}
\end{aligned}
\end{equation}
$$

采用如下方法来预测下一时刻的状态：

$$
\begin{split}
{p_k} &= {p_{k-1}} + \Delta t &{v_{k-1}} \\
{v_k} &= &{v_{k-1}}
\end{split}
$$

即$k$时刻的预测状态 ${\mathbf{\hat{x}}_k}$ 可以表示为：

$$
\begin{align}
{\mathbf{\hat{x}}_k} &= \begin{bmatrix}
1 & \Delta t \\
0 & 1
\end{bmatrix} {\mathbf{\hat{x}}_{k-1}} \\
&= \mathbf{A}_k {\mathbf{\hat{x}}_{k-1}} \label{statevars}
\end{align}
$$

这个$A_k$就是$k$时刻时运动方程中的参数$A$，那么剩下的就是得到$k$时刻的随机变量的协方差矩阵了，同时根据以上两个时刻的$x$的关系：

$$
\begin{align}
P_{k+1} &= E[(x_{k+1}-\hat{x}_{k+1})(x_{k+1}-\hat{x}_{k+1})^T] \\
&= A_kE[(x_{k}-\hat{x}_{k})(x_{k}-\hat{x}_{k})^T]A_k^T +E[w_kw_k^T] \\
&= A_kP_kA_k^T+Q_k
\end{align}
$$

其中$Q_k$表示$k$时刻控制变量$u_k$的方差。

这样我们就完成了从$k$时刻的状态来推测$k+1$时刻状态的工作，这部分在卡尔曼滤波中称为时间更新/预测，公式可归纳为：

$$
\begin{equation}
\begin{split}
{\mathbf{\hat{x}}_k} &= \mathbf{A}_k {\mathbf{\hat{x}}_{k-1}} + \mathbf{B}_k {\vec{\mathbf{u}_k}} \\
{\mathbf{P}_k} &= \mathbf{A_k} {\mathbf{P}_{k-1}} \mathbf{A}_k^T + {\mathbf{Q}_k}
\end{split}
\label{kalpredictfull}
\end{equation}
$$

下面进入下一部分：在以上预测的基础上，使用测量值来提高状态预测的准确率。测量值是一些可以通过传感器得到的数据，这些数据与当前状态是存在关联的，表示为：

$$
z_k=Hx_k+v_k
$$

测量值同样被当做一个符合正态分布的随机变量，可以得到其均值和方差为：

$$
\begin{equation}
\begin{aligned}
\vec{\mu}_{\text{expected}} &= \mathbf{H}_k {\mathbf{\hat{x}}_k} \\
\mathbf{\Sigma}_{\text{expected}} &= \mathbf{H}_k {\mathbf{P}_k} \mathbf{H}_k^T
\end{aligned}
\end{equation}
$$

**注意：以上公式中协方差不包括 $\mathbf{R}_k$，为什么？因为此处描述的是基于当前状态推测出的测量值的不确定性，仅当我们使用传感器读数来表示测量值时，才存在由观测噪声引起的 $\mathbf{R}_k$**

对于测量值，可以通过两个方式得到：基于当前系统状态来计算测量值；基于传感器读数来估计测量值。所以我们得到了与测量值有关的两个概率分布：

* **测量值与当前系统状态之间的概率关系**；
* **测量值与传感器读数之间的概率关系**。

这两个概率分布可以分别描述为：

$$
\begin{equation}
\begin{aligned}
({\mu_1}, {\Sigma_1}) &= ({\mathbf{H}_k \mathbf{\hat{x}}_k}, {\mathbf{H}_k \mathbf{P}_k \mathbf{H}_k^T}) \\
({\mu_2}, {\Sigma_2}) &= ({\vec{\mathbf{z}_k}}, {\mathbf{R}_k})
\end{aligned}
\end{equation}
$$

如何结合以上两个概率分布来优化当前时刻的系统变量？测量值应该同时满足这两个概率分布关系，使用正态分布的乘法：

由：

$$
\begin{equation}
\begin{aligned}
{\mu’} &= \mu_1 + \frac{\sigma_1^2 (\mu_2 – \mu_1)} {\sigma_1^2 + \sigma_2^2}\\
{\sigma’}^2 &= \sigma_1^2 – \frac{\sigma_1^4} {\sigma_1^2 + \sigma_2^2}
\end{aligned}
\end{equation}
$$

得到：

$$
\begin{equation}
\begin{split}
{\mu’} &= \mu_1 + &{\mathbf{K'}} (\mu_2 – \mu_1)\\
{\sigma’}^2 &= \sigma_1^2 – &{\mathbf{K'}} \sigma_1^2
\end{split} \label{update}
\end{equation}
$$

其中 $\mathbf{K'}$ 为（$\Sigma_1$和 $\Sigma_2$分别表示两个高斯分布中的协方差矩阵）：

$$
\begin{equation} \label{gainformula}
{\mathbf{K'}} = \frac{\sigma_1^2}{\sigma_1^2 + \sigma_2^2} = \Sigma_1 (\Sigma_1 + \Sigma_2)^{-1}
\end{equation}
$$

将以上两个概率分布带入可得：

$$
\begin{equation}
\begin{aligned}
\mathbf{H}_k {\mathbf{\hat{x}}_k’} &= {\mathbf{H}_k \mathbf{\hat{x}}_k} + {\mathbf{K'}} ( {\vec{\mathbf{z}_k}} – {\mathbf{H}_k \mathbf{\hat{x}}_k} ) \\
\mathbf{H}_k {\mathbf{P}_k’} \mathbf{H}_k^T &= {\mathbf{H}_k \mathbf{P}_k \mathbf{H}_k^T} – {\mathbf{K'}} {\mathbf{H}_k \mathbf{P}_k \mathbf{H}_k^T} \\
{\mathbf{K'}} &= {\mathbf{H}_k \mathbf{P}_k \mathbf{H}_k^T} ( {\mathbf{H}_k \mathbf{P}_k \mathbf{H}_k^T} + {\mathbf{R}_k})^{-1}
\end{aligned} \label {kalunsimplified}
\end{equation}
$$

消掉 $\mathbf{H}_k$可得：

$$
\begin{equation}
\begin{split}
{\mathbf{\hat{x}}_k’} &= {\mathbf{\hat{x}}_k} + {\mathbf{K}} ( {\vec{\mathbf{z}_k}} – {\mathbf{H}_k \mathbf{\hat{x}}_k} ) \\
{\mathbf{P}_k’} &= {\mathbf{P}_k} – {\mathbf{K}} {\mathbf{H}_k \mathbf{P}_k} \\
{\mathbf{K}} &= {\mathbf{P}_k \mathbf{H}_k^T} ( {\mathbf{H}_k \mathbf{P}_k \mathbf{H}_k^T} + {\mathbf{R}_k})^{-1}
\end{split}
\label{kalupdatefull}
\end{equation}
$$

由此得到最终的系统状态估计值 $\mathbf{\hat{x}}_k’$，其中 $\vec{\mathbf{z}_k} – \mathbf{H}_k \mathbf{\hat{x}}_k$为测量过程的新息/残差(Measurement Innovation / Residual)， $\mathbf{K}$ 在卡尔曼滤波中表述为卡尔曼增益（Kalman Gain）。

最终可以列出卡尔曼滤波的五个重要公式：

---

时间更新方程（Time Update Equations）：

$$
\begin{equation}
\begin{split}
{\mathbf{\hat{x}}_k} &= \mathbf{A}_k {\mathbf{\hat{x}}_{k-1}} + \mathbf{B}_k {\vec{\mathbf{u}_k}} \\
{\mathbf{P}_k} &= \mathbf{A_k} {\mathbf{P}_{k-1}} \mathbf{A}_k^T + {\mathbf{Q}_k}
\end{split}
\end{equation}
$$

状态更新方程（Measurement Update Equations）：

$$
\begin{equation}
\begin{split}
{\mathbf{\hat{x}}_k’} &= {\mathbf{\hat{x}}_k} + {\mathbf{K}_k} ( {\vec{\mathbf{z}_k}} – {\mathbf{H}_k \mathbf{\hat{x}}_k} ) \\
{\mathbf{P}_k’} &= {\mathbf{P}_k} – {\mathbf{K}_k} {\mathbf{H}_k \mathbf{P}_k} \\
{\mathbf{K}_k} &= {\mathbf{P}_k \mathbf{H}_k^T} ( {\mathbf{H}_k \mathbf{P}_k \mathbf{H}_k^T} + {\mathbf{R}_k})^{-1}
\end{split}
\end{equation}
$$

相关中间变量的名称（From [Wiki](https://en.wikipedia.org/wiki/Extended_Kalman_filter)）：

* **Innovation or measurement residual**：  $\tilde{y}_k = {\vec{\mathbf{z}_k}} – {\mathbf{H}_k \mathbf{\hat{x}}_k}$
* **Innovation (or residual) covariance**：  $S_k =  {\mathbf{H}_k \mathbf{P}_k \mathbf{H}_k^T} + {\mathbf{R}_k}$
* **Near-optimal Kalman gain**：  $\mathbf{K}_k = {\mathbf{P}_k \mathbf{H}_k^T} S_k^{-1}$
* **Updated state estimate**：  ${\mathbf{\hat{x}}_k’} = {\mathbf{\hat{x}}_k} + {\mathbf{K}_k} \tilde{y}_k$
* **Updated covariance estimate**：  ${\mathbf{P}_k’} = {\mathbf{P}_k} – {\mathbf{K}_k} {\mathbf{H}_k \mathbf{P}_k}$

---

对于以上公式，还可以从两个其他角度来理解：

1. 贝叶斯统计的角度：时间更新方程反映的是当前系统状态的先验估计，而状态更新方程反映的是基于当前测量值的系统状态的最大后验估计。其中 $\mathbf{\hat{x}}_k$为当前状态的先验估计（例如：我们假设小车匀速直线行驶、房间内的温度恒定），而当前状态 $\mathbf{\hat{x}}_k'$ 取决于其先验估计的概率分布，$\mathbf{P}_k$为这个概率分布的前二阶矩，而加入测量值之后反映了其后验估计的一阶矩（ $\mathbf{\hat{x}}_k'$ 状态分布的均值）。
2. 直观理解的角度：最终系统状态是权衡基于上一时刻状态的状态估计值、观测值的结果，而卡尔曼增益就描述了这两者在最终状态计算过程中的重要程度，比如当卡尔曼增益为0时，观测值就会被直接丢弃，此时可以认为观测值对于最终状态的计算没有价值。那么卡尔曼增益如何计算？使用两者的可信程度，此处用随机变量的协方差矩阵表示（注意符合某种概率分布的随机变量本身就包含了对数值的噪声估计），注意 $\mathbf{K}$ 在高斯分布相乘过程中的计算公式，实际上只是一个协方差矩阵的比值。

> 这里存在一个容易混淆的点，请注意以下两种公式表示形式：

> $$
\begin{equation}
\begin{split}
{\mathbf{\hat{x}}_k’} &= {\mathbf{\hat{x}}_k} + {\mathbf{K}_k} ( {\vec{\mathbf{z}_k}} – {\mathbf{H}_k \mathbf{\hat{x}}_k} ) \\
{\mathbf{\hat{x}}_k’} &= {\mathbf{\hat{x}}_k} + {\mathbf{K}'_k} ( {\vec{\mathbf{z}_k}} – { \mathbf{\hat{x}}_k} ) \\
\end{split}
\end{equation}
> $$

> 第一个公式为标准公式，第二个常见于通俗阐述EKF的博客，为什么出现第二种公式？可以看到在这个公式中，$\mathbf{K}'_k$为0时最终状态为预测状态，为1时最终状态为观测值，这种形式方便说明卡尔曼增益在预测值和观测值之间的权重角色，但严格来说这个形式是错误的。实际上我们可以这样表示：

> $$
\begin{equation}
\begin{split}
{\mathbf{\hat{x}}_k’} &= {\mathbf{\hat{x}}_k} + {\mathbf{K}'_k} ( {\mathbf{\hat{x}}_k^z} – { \mathbf{\hat{x}}_k} ) \\
\mathbf{\hat{x}}_k^z &= \mathbf{H}_k^{-1} \vec{\mathbf{z}_k} \\
\mathbf{K}'_k &= \mathbf{H}_k^{-1} \mathbf{K}_k
\end{split}
\end{equation}
> $$

> 这里 $\mathbf{\hat{x}}_k^z$ 为基于当前时刻观测值预测出的当前状态，$\mathbf{\hat{x}}_k$为基于上一时刻系统状态预测出的当前状态。这样就可以直观看出卡尔曼滤波中的核心思想了——**折中/Tradeoff**。

### 扩展卡尔曼滤波（Extended Kalman Filter, EKF）

当系统为线性高斯模型时，滤波器能给出最优的估计，但是实际系统总是存在不同程度的非线性，如平方、三角关系、开方等。对于非线性系统，可以采用的一种方法是通过线性化方法将非线性系统转换为近似的线性系统，即为EKF，核心思想是：围绕滤波值将非线性函数展开成泰勒级数并略去二阶及以上项，得到一个近似的线性化模型，然后应用卡尔曼滤波完成状态估计。

#### History

EKF相关的工作大部分由NASA Ames Research Center (NASA Ames)完成(From [Wiki](https://en.wikipedia.org/wiki/Extended_Kalman_filter))。NASA的航天工程师Stanley F. Schmidt将卡尔曼滤波运用到阿波罗计划中的宇宙飞船轨轨迹分析过程中，并在这个过程中对卡尔曼滤波进行扩展，具体包括：

* 将KF扩展到非线性的运动、观测模型；
* 提出了减小非线性影响的线性化方法；
* 将原始的KF重新公式化为目前熟知的标准形式（预测+更新）。

由于Stanley F. Schmidt的突出贡献，EKF曾在一段时间被称作Schmidt-Kalman filter，但随后由于Schmidt提出的新算法而导致的命名冲突，这个EKF的别名被弃用。

(From 《State Estimation for Robotics》)

#### Content

非线性的状态方程和量测方程表示为(其中$w_k$和$v_k$均表示噪声)：

$$
\begin{equation}
\begin{aligned}
x_k &= f(x_{k-1},u_{k},w_{k}) \\
z_k &= h(x_k,v_k)
\end{aligned}
\end{equation}
$$

符合正态分布的噪声数据在经过非线性转换后不再是正态分布的随机变量了，此处我们使用近似处理：假设噪声符合上述正态分布，而且它们为相互独立、正态分布的白噪声（即把噪声从非线性函数中拿出来）。在后续的线性化过程中，这部分因为以上近似而产生的偏差会得到恢复（近似地恢复）：

$$
\begin{equation}
\begin{aligned}
x_k &= f(x_{k-1},u_{k})+w_{k} \\
z_k &= h(x_k)+v_k
\end{aligned}
\end{equation}
$$

$$
\begin{equation}
\begin{aligned}
P(w) &\sim N(0,Q) \\
P(v) &\sim N(0,R)
\end{aligned}
\end{equation}
$$

此时对以上非线性方程(状态方程和量测方程)进行线性化，具体方法为一阶泰勒展开，忽略高阶项，注意此处可以看作非线性函数$f()$ 和$h()$ 的泰勒展开，多出来的噪声相关项会在后面解释：

$$
\begin{equation}
\begin{aligned}
x_k &\approx {\check{x}_k} + A_{k-1}(x_{k-1}-{\hat{x}}_{k-1}) + W_{k}{w_{k}} \\
z_k &\approx {\check{z}_k} + H_k(x_k-\check{x}_k)+V_kv_k
\end{aligned}
\end{equation}
$$

其中：

* $\check{(·)}_k$为$k$时刻的先验估计(Prior Estimates)
* $\hat{(·)}_k$为$k$时刻的后验估计(Posterior Estimates)
* $x_k$和$z_k$为系统状态和观测向量的真值；
* $A_k$为$k$时刻$f$对$x$的雅克比矩阵；
* $H_k$为$k$时刻$h$对$x$的雅克比矩阵;
* $W_k$为$k$时刻$f$对$w$的雅克比矩阵；
* $V_k$为$k$时刻$h$对$v$的雅克比矩阵。

上面提到我们会对噪声近似处理的偏差做近似地恢复，即：使用雅克比矩阵来修正偏差的方差，所以我们在上述方程中包含了对噪声的近似，由于此处已知$w$和$v$的概率分布（见上述公式），有：

$$
\begin{equation}
\begin{aligned}
P(W_{k}w_{k}) &\sim N(0,W_{k}QW_{k}^T) \\
P(V_kv_k) &\sim N(0,V_{k}RV_{k}^T)
\end{aligned}
\end{equation}
$$

上面得到了近似处理后的$k$时刻的线性方程(状态方程和量测方程)，由于方程中存在$x_k$和$z_k$等系统状态和观测向量的真值，难以直观地使用KF的方法来推导，一般会存在两种处理方式：

* 基于以上公式构造一个新的公式，使用KF来估计这个新的公式中的变量（如真值与先验估计之间的差值），最后通过公式变形求解，这部分可参考An Introduction to the Kalman Filter (Greg Welch, 2006)。
* 从贝叶斯滤波的角度来推导出EKF的更新过程的标准公式。（这部分可参考《State Estimation for Robotics》）

##### 构造变量法

定义系统状态和观测值的先验估计误差：

$$
\begin{equation}
\begin{aligned}
e_{x_k} &= x_k - {\check{x}_k} \approx  A_{k-1}(x_{k-1}-{\hat{x}}_{k-1}) + W_{k}{w_{k}}\\
e_{z_k} &= z_k - {\check{z}_k} \approx H_k(x_k-\check{x}_k)+V_kv_k
\end{aligned}
\end{equation}
$$

由以上两式可得两个先验估计误差的关系：

$$
e_{z_k} \approx H_ke_{x_k}+V_kv_k
$$

联立上面得到的两个公式：

$$
\begin{equation}
\begin{aligned}
e_{x_k} &\approx  A_{k-1}(x_{k-1}-{\hat{x}}_{k-1}) + W_{k}{w_{k}} \\
e_{z_k} &\approx H_ke_{x_k}+V_kv_k
\end{aligned}
\end{equation}
$$

对比线性KF中的状态方程和量测方程：

$$
\begin{equation}
\begin{aligned}
x_k &= Ax_{k-1}+Bu_{k-1}+w_{k-1} \\
z_k &= Hx_k+v_k
\end{aligned}
\end{equation}
$$

以上两组方程均为线性方程，且变量符合高斯分布，因此我们对包含先验估计误差的两个方程进行卡尔曼滤波处理，按照之前得到的KF方程，可以得到

$$
\hat{e}_{x_k} = \check{e}_{x_k} + {\mathbf{K}_k^e} ( e_{z_k} – H_k\check{e}_{x_k} )
$$

这里的先验估计误差$e_{x_k}$ 的均值为0，这部分易于理解，即 $\check{e}_{x_k}=0$，所以有：

$$
\hat{e}_{x_k} = {\mathbf{K}_k^e} e_{z_k}
$$

根据$e_{x_k}$ 、$e_{z_k}$ 的定义，有：

$$
\begin{equation}
\begin{aligned}
\hat{x}_k &= \check{x}_k + e_{x_k} \\
&= \check{x}_k + {\mathbf{K}_k^e} e_{z_k} \\
&= \check{x}_k + {\mathbf{K}_k^e}(z_k - {\check{z}_k})
\end{aligned}
\end{equation}
$$

按照线性KF的计算方法，可得：

$$
{\mathbf{K}_k^e} = {\mathbf{\check{P}}_k \mathbf{H}_k^T} ( {\mathbf{H}_k \mathbf{\check{P}}_k \mathbf{H}_k^T} + {\mathbf{V}_k\mathbf{R}_k}\mathbf{V}_k^T)^{-1}
$$

##### 贝叶斯滤波(Beyes filter / Recursive Bayesian estimation)

由于卡尔曼滤波是贝叶斯滤波的一个特例（当贝叶斯滤波中系统状态的置信度分布($belief$)符合高斯分布时，贝叶斯滤波=卡尔曼滤波），为了扩展一下，我们尝试从贝叶斯滤波的角度进行处理。

前置条件（贝叶斯滤波中系统状态的置信度分布符合高斯分布）：

$$
bel(x_k) = p(x_k|\check{x}_0,v_{1:k},y_{0:k}) \approx N(\hat{x}_k,\hat{P}_k)
$$

由于涉及贝叶斯滤波的一些基础知识，以下给出贝叶斯滤波的推导过程，可参考的材料包括：

* 书籍《Probabilistic robotics》2.4.3
* 书籍《State Estimation for Robotics》4.2.2
* [Bayes Filtering-课件-PDF](http://www.cs.cmu.edu/~16831-f14/notes/F14/16831_lecture02_prayana_tdecker_humphreh.pdf)
* [Wiki-Recursive_Bayesian_estimation](https://en.wikipedia.org/wiki/Recursive_Bayesian_estimation)
* [博客-无处不在的小土](http://aandds.com/blog/bayes-filter.html)(非常推荐，部分内容来源于此，有空请查看原文并收藏一波)
* [博客-一位工作于北京的朋友](http://aandds.com/blog/bayes-filter.html)(非常推荐，部分内容来源于此，有空请查看原文并收藏一波)

---

在贝叶斯滤波框架中，下面这些是已知的（可以认为它们是系统参数）：

* 测量值（或称观察值）： $z_{t}$
* 对系统的控制量： $u_{t}$
* 传感器的测量模型 (Measurements Model)： $p(z_t\mid x_t)$
* 系统控制量的运动模型 (Motion Model)： $p(x_t\mid u_t, x_{t-1})$
* 初始时系统状态，即先验概率： $p(x_0)$

**置信度$belief$**

置信度反映了机器人对环境状态的掌握程度。我们根据机器人维护的置信度来识别真实的状态。在一些文献中置信度也称为state of knowledge和information state。概率机器人学通过条件概率分布描述置信度。一个置信度分布根据真实的状态为每一个可能的值赋予一个概率(或者是密度值, density value)。

置信度分布是状态变量在已知数据上的后验概率。我们用$bel(x_t)$ 描述状态变量$x_t$的置信度：

$$
\begin{equation}
bel(x_t) = p(x_t | z_{1:t}, u_{1:t})
\end{equation}
$$

置信度是在进行了测量$z_t$后计算的。有时在执行了控制量$u_t$后，进行测量$z_t$之前，使用上次测量值计算的置信度也是很有用的。这样的后验概率表示为：

$$
\begin{equation}
\overline{bel}(x_t) = p(x_t | z_{1:t-1}, u_{1:t})
\end{equation}
$$

在基于概率的滤波器中，它通常被称为预测值prediction。$\overline{bel}(x_t)$ 是根据之前的数据和最新的控制量来预测$t$时刻的状态。从 $\overline{bel}(x_t)$ 计算得出$bel(x_t)$ 的过程被称为校正correction或者测量更新measurement update。

贝叶斯滤波算法便是按照上述过程而来，共分为以下两个步骤，算法以上一时刻的置信度、该时刻的控制与观测作为输入，输出该时刻的置信度。以迭代的形式对置信度进行求解。

* 通过控制量做出预测 $\overline{bel}(x_t)$
* 结合观测量进行更新 $bel(x_t)$

用公式描述：

$$
\begin{equation}
\begin{aligned}
\overline{bel}(x_t) &= \int{p(x_t | x_{t-1}, u_t) {bel}(x_{t-1})dx_{t-1}} \\
bel(x_t) &= \eta \, p(z_t \mid x_t) \overline{bel}(x_t)
\end{aligned}
\end{equation}
$$

**公式推导**

1.由全概率公式（Law of Total Probability)可得：

$$
\begin{equation}
\begin{aligned}
\overline{bel}(x_t) & = p(x_{t} \mid u_{1:t}, z_{1:t-1}) \\
& \stackrel{\text{Total Prob.}}{=} \int p(x_t \mid x_{t-1}, u_{1:t}, z_{1:t-1}) p(x_{t-1} \mid u_{1:t}, z_{1:t-1}) \, \mathrm{d} x_{t-1} \end{aligned}
\end{equation}
$$

状态完备假设意味着，如果我们知道了$x_{t-1}$，过去的测量和控制量将不携带关于状态$x_t$的信息。因此，有：

$$
\begin{equation}
p(x_t | x_{t-1}, z_{1:t-1}, u_{1:t}) = p(x_t | x_{t-1}, u_t) \end{equation}
$$

这里我们保留了控制量$u_t$，因为它并不用于预测状态$x_{t-1}$。实际上$p(x_t \mid x_{t-1}, u_t)\neq p(x_t \mid x_{t - 1})$。我们注意到通过随机选择控制，就可以把控制量$u_t$从 $p(x_{t-1} \mid z_{1:t-1}, u_{1:t})$ 的条件中移除，得到迭代更新公式：

$$
\begin{equation}
\begin{aligned}
\overline{bel}(x_t) &= \int{p(x_t | x_{t-1}, u_t)p(x_{t-1} | z_{1:t-1}, u_{1:t-1})dx_{t-1}} \\
&= \int{p(x_t | x_{t-1}, u_t) {bel}(x_{t-1})dx_{t-1}}
\end{aligned}
\end{equation}
$$

贝叶斯滤波器算法根据$t$时刻的测量值和控制量来计算状态$x_t$的后验概率。这个推导过程中的假设被称为马尔可夫(Markov)特性，也就是说状态是完备的。

2.使用贝叶斯公式 $p(x \mid y,z) = \frac{p(y \mid x, z)p(x \mid z)}{p(y \mid z)}$ 对 $bel(x_t)$ 进行变换：

$$
\begin{equation}
\begin{aligned}
bel(x_t) & = p(x_{t} \mid u_{1:t}, z_{1:t}) \\
& = \frac{p(z_t \mid x_t, u_{1:t}, z_{1:t-1})p(x_t \mid u_{1:t}, z_{1:t-1})}{p(z_t \mid u_{1:t}, z_{1:t-1})} \\
& = \eta \, p(z_t \mid x_t, u_{1:t}, z_{1:t-1})p(x_t \mid u_{1:t}, z_{1:t-1})
\end{aligned}
\end{equation}
$$

其中， $\eta$ 可看做是归一化常数，它当 $x_t$ 取不同可能状态时是不变的，所以保证 $x_t$ 取所有可能状态时 $bel(x_t)$ 相加为1即可。

由马尔可夫假设，有： $p(z_t\mid x_t, u_{1:t}, z_{1:t-1}) = p(z_t\mid x_t)$ ，可得：

$$
\begin{equation}
\begin{aligned}
bel(x_t) & = \eta \, p(z_t \mid x_t, u_{1:t}, z_{1:t-1})p(x_t \mid u_{1:t}, z_{1:t-1}) \\
& \stackrel{\text{Markov}}{=} \eta \, p(z_t \mid x_t) p(x_t \mid u_{1:t}, z_{1:t-1}) \\
& = \eta \, p(z_t \mid x_t) \overline{bel}(x_t)
\end{aligned}
\end{equation}
$$

**总结**

如前所述，1为预测过程，2为更新过程，我们结合第一步和第二步，得到贝叶斯滤波的递推公式为：

$$
{bel(x_t)} = \eta p(z_t \mid x_t) \int p(x_t \mid x_{t-1}, u_t) {bel(x_{t-1})} \mathrm{d} x_{t-1}
$$

从上面的公式知，贝叶斯滤波需要知道三个概率分布：

* 传感器模型 $p(z_t\mid x_t)$
* 系统控制量模型 $p(x_t\mid u_t, x_{t-1})$
* 系统的初始状态概率分布 $bel(x_0) = p(x_0)$

---

有了以上贝叶斯滤波相关的基础，我们就可以对EKF进行处理了。将以上EKF公式表示为贝叶斯滤波形式：

$$
\begin{equation}
\begin{split}
&p(x_k|\check{x}_0,u_{1:k}, z_{0:k}) = \eta p(z_k|x_k) \\
&\times \int p(x_k|x_{k-1}, u_k) p(x_{k-1}|\hat{x}_0,u_{1:k-1}, z_{0:k-1}) \mathrm{d} x_{k-1}
\end{split}
\end{equation}
$$

由于EKF中 $bel(x)$ 为高斯分布，可计算出其中各项高斯分布的均值和方差：

* Posterior belief:

$$p(x_k \mid \check{x}_0, u_{1:k}, z_{0:k}) \approx N(\hat{x}_k, \hat{P}_k) $$


* Observation correction:

$$p(z_k \mid x_k) \approx N(\check{z}_k + H_k(x_k-\check{x}_k),{\mathbf{V}_k\mathbf{R}_k}\mathbf{V}_k^T)$$

* Motion prediction:

$$p(x_k \mid x_{k-1}, u_k) \approx N(\check{x}_k+\mathbf{A}_{k-1}(x_{k-1}-\hat{x}_{k-1}),{\mathbf{H}_k \mathbf{\check{P}}_k \mathbf{H}_k^T})$$

* Prio belief:

$$p(x_{k-1} \mid \hat{x}_0,u_{1:k-1}, z_{0:k-1}) \approx N(\hat{x}_{k-1}, \hat{P}_{k-1})$$

通过以上高斯分布的运算可以得到(运算细节请参考《State Estimation for Robotics》)：

$$
\begin{equation}
\begin{split}
p(x_k|\check{x}_0,u_{1:k}, z_{0:k}) &\approx N(\hat{x}_k, \hat{P}_k) \\
&\approx N({\mathbf{\check{x}}_k} + {\mathbf{K}_k} ( {\vec{\mathbf{z}_k}} – h(\check{\mathbf{x}}_k) ),{\mathbf{\check{P}}_k} – {\mathbf{K}_k} {\mathbf{H}_k \mathbf{\check{P}}_k})
\end{split}
\end{equation}
$$

其中：

$$
{\mathbf{K}_k} = {\mathbf{\check{P}}_k \mathbf{H}_k^T} ( {\mathbf{H}_k \mathbf{\check{P}}_k \mathbf{H}_k^T} + {\mathbf{V}_k\mathbf{R}_k}\mathbf{V}_k^T)^{-1}
$$

##### EKF标准方程

---

时间更新方程（Time Update Equations）：

$$
\begin{equation}
\begin{split}
{\mathbf{\check{x}}_k} &= f(\hat{\mathbf{x}}_{k-1},u_{k}) \\
{\mathbf{\check{P}}_k} &= \mathbf{A_k} {\mathbf{\hat{P}}_{k-1}} \mathbf{A}_k^T + \mathbf{W}_{k}\mathbf{Q}_{k-1}\mathbf{W}_{k}^T
\end{split}
\end{equation}
$$

状态更新方程（Measurement Update Equations）：

$$
\begin{equation}
\begin{split}
{\mathbf{\hat{\mathbf{x}}}_k} &= {\mathbf{\check{x}}_k} + {\mathbf{K}_k} ( {\vec{\mathbf{z}_k}} – h(\check{\mathbf{x}}_k) ) \\
{\mathbf{\hat{P}}_k} &= {\mathbf{\check{P}}_k} – {\mathbf{K}_k} {\mathbf{H}_k \mathbf{\check{P}}_k} \\
{\mathbf{K}_k} &= {\mathbf{\check{P}}_k \mathbf{H}_k^T} ( {\mathbf{H}_k \mathbf{\check{P}}_k \mathbf{H}_k^T} + {\mathbf{V}_k\mathbf{R}_k}\mathbf{V}_k^T)^{-1}
\end{split}
\end{equation}
$$

---

<br>
转载请注明原地址，魏鑫燏的博客： [http://slowlythinking.github.io](http://slowlythinking.github.io) 谢谢！
