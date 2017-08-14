---
layout: post
title: "ORB-SLAM建图线程中的外点剔除策略"
date: 2017-08-14 
description: "ORB-SLAM，外点剔除"
tag: SLAM 
---   

#### 剔除条件一：能找到该点的帧少于理论上能观测到该点帧的1/4

代码：

```
pMP->GetFoundRatio()<0.25f;
float GetFoundRatio()
{
    return static_cast<float>(mnFound)/mnVisible;
}
```
mnFound:
```
void IncreaseFound(int n)
{
    mnFound+=n;
}
IncreaseFound:
Tracking::TrackLocalMap()
{
    if(!mCurrentFrame.mvbOutlier[i])
        mCurrenFrame.mvpMapPoints[i]->IncreaseFound();
}
```
mnVisible:

```
void IncreaseVisible(int n)
{
    mnVisible+=n;
}
IncreaseVisible:
Tracking::SearchLocalPoints()
{
    for(mCurrentFrame.mvpMapPoints.begin to end)
    {
        if(!MapPoint->isBad())
            MapPoint->IncreaseVisible;
    }
    for(mvpLocalMapPoints.begin to end)
    {
        if(mCurrentFrame.isInFrustum(MapPoint,0.5) && MapPoint don't belong to mCurrentFrame.mvpMapPoints)
            MapPoint->IncreaseVisible();
    }
}
```

以上为记录某一三维点被找到的次数、被观测到的次数两个变量的代码。这两个变量均在跟踪线程处理局部地图时更新（在闭环检测阶段也会更新，不过暂时不予考虑），因为局部地图匹配是两阶段匹配的最后一步，因此此处更新Found为局部地图跟踪后匹配上且优化过程中不为外点的值，更新Visible为一阶段匹配上（与上一帧匹配或者与上一关键帧匹配）且优化过程中不为外点的值和局部地图中可能观测到的值。

#### 剔除条件二：从该点建立开始，系统已产生多于2帧的关键帧，观测到该点的关键帧数小于2帧

代码：

```
const unsigned long int nCurrentKFid=mpCurrentKeyFrame->mnId;
cnThobs=2;
(int)nCurrentKFid-(int)MapPoint->mnFirstKFid>=2 && pMP->Observations()<=cnThobs;
int MapPoint::bservations()
{
    return nObs;
}
```
nObs:

```
void MapPoint::AddObservation(KeyFrame* pKF, size_t idx)
{
    if(mObservations.count(pKF))
        return;
    else
    {
        nObs++;   
        mObservations[pKF]=idx;//idx为三维点在关键帧中的索引号
    }
}
void MapPoint::EraseObservation(KeyFrame* pKF)
{
    bool bBad=false;
    if(mObservations.count(pKF))
    {
        nObs--
        mObservations.erase(pKF);
        if(nObs<=2)
            bBad=ture;
    }
    if(bBad)
        SetBadFlag(); //删除该三维点
}
```




#### 接受条件：从该点建立开始，系统已产生3帧及以上的关键帧，该点已通过了之前的剔除条件测试，接纳三维点。



<br>
*转载请注明原地址，魏鑫燏的博客：[http://slowlythinking.github.io](http://slowlythinking.github.io) 谢谢！*
