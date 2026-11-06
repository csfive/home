---
title: 容易混淆的问题
description: 哈佛 CS50G Week 6 · 容易混淆的问题
---

# 容易混淆的问题

| 容易混淆                             | 区别                                  |
| ------------------------------------ | ------------------------------------- |
| `wasPressed` / `isDown`              | 课程自建边沿检测 vs LÖVE 内建持续状态 |
| `love.update` / `world:update`       | 游戏帧循环 vs 物理单步推进            |
| 重力 `9.8` / `300`                   | 米每秒² vs 像素每秒²，差 30 倍        |
| body / fixture                       | 位置与速度 vs 形状与材质              |
| `static` / `kinematic`               | 永远不动 vs 可主动移动但不受力        |
| `beginContact` / `postSolve`         | 接触开始 vs 求解完成，能拿冲量        |
| body 坐标 / 绘制坐标                 | 质心 vs 纹理左上角                    |
| 世界坐标 / 屏幕坐标                  | 物理真实位置 vs 相机变换后的位置      |
| 速度阈值 20                          | 像素/秒的曼哈顿和，不是米/秒          |
| `body:destroy()` / `joint:destroy()` | 连带 fixture 与关节 vs 只解除约束     |

## 三个容易写错的判断

- **`wasPressed` 不是 LÖVE 的函数。** 课程在 `main.lua` 里把 `mousepressed` 的事件记进表，再定义 `love.mouse.wasPressed`。没有这段代码，调用会直接报 `attempt to call a nil value`。
- **重力单位跟着 meter 走。** `love.physics.newWorld` 接收的是像素单位，LÖVE 内部除以 30 转成米。传 9.8 等于 0.33 m/s²，物体几乎飘着；传 300 才是地球重力。
- **20 不是“20 米每秒”。** 回调里读到的速度已经是像素/秒，`math.abs(vx) + math.abs(vy)` 还是曼哈顿和：斜向 45 度撞击时比真实速度高约 41%。

## 拖得越远飞得越快吗

是，但在有效区间内才是线性的。速度等于锚点减拖动点再乘 10，落点距离与拉弓距离的平方大致成正比。拖动超过 30 像素后钳制生效，再拉也不会更快。

方向永远相反：把鸟往左下拖，它飞向右上。想让它往右飞，必须把鸟拖到锚点左边。

## 两个 update

`love.update(dt)` 每帧调用一次，是游戏循环。`world:update(dt)` 是物理引擎的单步，课程在 `love.update` 里用累加器调用多次。把两者当成一回事，就会用帧率直接驱动物理，掉帧时穿模。

## 鸟为什么会穿墙

三个常见原因：一帧的 `dt` 太大，物理只走了一步；碰撞体比贴图小太多，视觉上已经接触；高速动态物体撞薄动态物体，没开 `setBullet(true)`。静态墙不会穿，因为静态 body 强制使用连续碰撞。

## 回调与销毁

Box2D 在回调期间锁定世界，任何创建、销毁、改结构都会崩。正确流程只有一条：回调里收集，`world:update` 返回后统一处理。

```lua
-- 错误：在回调里直接删
function beginContact(a, b)
    b:getBody():destroy()
end

-- 正确：先排队，update 之后再删
table.insert(self.destroyedBodies, b:getBody())
```

`endContact` 在对象被销毁时也会触发，所以回调里访问到的 body 可能已经标记销毁。用 `isDestroyed()` 判断，不要假设它一定还活着。

## 渲染与物理

物理 body 没有左上角，`getX()`、`getY()` 是质心。画精灵时要把绘制原点设成纹理的一半宽高，否则旋转会绕左上角甩出去。

相机只改绘制，不改世界。给 body 加相机偏移，物理会真的位移；只给绘制加偏移，碰撞仍然发生在原位。两套坐标各管各的，混用就会出现“看到的位置”和“撞到的位置”不一致。
