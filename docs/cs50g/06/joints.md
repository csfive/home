---
title: 关节
description: 哈佛 CS50G Week 6 · 关节
---

# 关节

关节把两个 body 绑在一起，让它们按约束运动。这是从“一堆独立方块”走到吊桥、摆锤、杠杆的入口。

## 关节基础

所有关节都在两个 body 之间建立约束，两个 body 必须属于同一个 world。构造函数通常以 `collideConnected` 结尾，锚点则按类型放在中间。

| 概念               | 说明                                   |
| ------------------ | -------------------------------------- |
| 锚点               | 多数关节用世界坐标，不是 body 本地坐标 |
| `collideConnected` | 两端是否还参与彼此的碰撞               |
| `joint:destroy()`  | 解除约束，body 保留                    |
| 反作用力           | `getReactionForce(invdt)` 可读两端受力 |

`collideConnected` 默认是 `false`。两个 body 被关节连住后通常不希望它们互相碰撞，否则紧挨着的零件会持续抖动。

锚点必须和 body 当前的位置对得上。先建 body、设好初始位置，再建关节；顺序反了，约束一开始就把物体拉向错误的位置。

- 约束求解会把力施加到两端，重的物体会拖动轻的物体
- 吊桥的链节质量要接近，否则一端会被拉得笔直

## 常用类型

| 类型 | 构造                                               | 约束               |
| ---- | -------------------------------------------------- | ------------------ |
| 焊接 | `newWeldJoint(a, b, x, y, collide)`                | 完全固定           |
| 铰链 | `newRevoluteJoint(a, b, x, y, collide)`            | 绕锚点旋转         |
| 绳索 | `newRopeJoint(a, b, x1, y1, x2, y2, len, collide)` | 限制最大距离       |
| 距离 | `newDistanceJoint(a, b, x1, y1, x2, y2, collide)`  | 固定距离           |
| 滑轮 | `newPulleyJoint(a, b, ...)`                        | 两端此消彼长       |
| 滑动 | `newPrismaticJoint(a, b, x, y, ax, ay, collide)`   | 只能沿一条轴移动   |
| 鼠标 | `newMouseJoint(body, x, y)`                        | 把 body 拉向目标点 |

绳索与距离的区别在松弛：距离关节保持固定长度，绳索只限制上限，可以变短。摆锤用铰链，吊灯用绳索，滑块用滑动关节。绳索的 `maxLength` 量的是两个锚点之间的距离；滑轮的最后还有一个 `ratio`，控制两端位移比例，`1` 表示一比一。

## 焊接与铰链

焊接把两个 body 变成一个刚体，适合做复合装饰或可拆装的零件：

```lua
local head = love.physics.newBody(world, x, y, 'dynamic')
love.physics.newFixture(head, love.physics.newRectangleShape(50, 50), 2)

local handle = love.physics.newBody(world, x, y + 50, 'dynamic')
love.physics.newFixture(handle, love.physics.newRectangleShape(15, 80), 1)

local weld = love.physics.newWeldJoint(head, handle, x, y + 25, false)
```

前两个参数之后是锚点，最后一个是 `collideConnected`。调用 `weld:destroy()`，两块立刻分开，各自保留速度。

铰链让物体绕一个点旋转。加马达就能自己转，做风车或摆锤：

```lua
local hinge = love.physics.newRevoluteJoint(anchor, arm, ax, ay, false)

hinge:enableMotor(true)
hinge:setMotorSpeed(2)
hinge:setMaxMotorTorque(100)
```

马达速度单位是弧度每秒，力矩上限决定它能带动多重的物体。没有力矩上限，马达力量视为无限。

铰链还能限位：`enableLimit(true)` 加 `setLimits(lower, upper)`，单位是弧度。门只开 90 度、摆臂只在两个角度之间摆动，都靠它。

## 关卡里的用法

作业要求至少一个与玩法相关的关节，可选方向很多：

- 吊桥：静态锚点加一串木板，用铰链首尾相连
- 摆锤：静态锚点加长杆，摆动后砸向敌人
- 活动平台：滑动关节限制在一条轴上
- 滑轮：两块重物通过天花板上的锚点联动
- 可拆除的支撑：焊接结构被撞后 `destroy` 关节

关节链越长越难稳定。每节都参与约束求解，迭代次数不够时会拉伸、抖动。把链条控制在十节以内，或提高 `world:update` 的迭代次数。

## 稳定性

关节的误差会累积。两端质量差太大、锚点距离太远、每帧施加过大的冲量，都会让约束“拉不住”。

几个实用做法：

- 静态锚点的 body 用 `static`，不要用质量巨大的 dynamic
- 链节尺寸接近，质量不要相差十倍以上
- 需要断开时销毁关节，不要直接销毁还连着的 body
- 高频抖动时先降速度、再调迭代次数

销毁 body 会连带销毁挂在它上面的关节。如果只想拆结构，先 `joint:destroy()`，再决定要不要删 body。

## 常见坑

- 把本地坐标当锚点，关节把物体拉到别处
- 两个 body 分属不同 world，构造时直接报错
- 两端都没有 `dynamic` body，关节不会产生运动
- 忘了 `collideConnected`，连着的零件互相顶开
- 每帧重建关节，约束永远在重置
- 关节链太长又不开迭代，桥面像橡皮筋
- 先销毁 body 再访问 joint，拿到失效对象
