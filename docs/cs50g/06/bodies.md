---
title: 刚体
description: 哈佛 CS50G Week 6 · 刚体
---

# 刚体

body 是 Box2D 里唯一有位置和速度的东西。它本身没有形状，也画不出来；碰撞边界靠 fixture 挂上去。

## 创建

```lua
local body = love.physics.newBody(world, 320, 180, 'dynamic')
```

四个参数依次是世界、X、Y 和类型。坐标指向 body 的质心，不是左上角；用矩形 shape 时，局部原点也在矩形中心。

body 创建后立即进入世界，参与重力和碰撞。单独一个 body 不会与任何东西相撞，因为还没有 fixture 提供边界。

| 属性             | 来源                             |
| ---------------- | -------------------------------- |
| 位置、角度       | `newBody` 的坐标与 `setPosition` |
| 线速度、角速度   | 物理求解或 `setLinearVelocity`   |
| 质量、转动惯量   | 所挂 fixture 的密度与面积        |
| 形状、摩擦、弹性 | 挂在它上面的 fixture             |

## 三种类型

| 类型        | 受重力 | 被碰撞推动 | 典型用途            |
| ----------- | ------ | ---------- | ------------------- |
| `static`    | 否     | 否         | 地面、墙、锚点      |
| `dynamic`   | 是     | 是         | 鸟、木块、敌人      |
| `kinematic` | 否     | 否         | 移动平台、Pong 球拍 |

`static` 可以挡住别人，但自己不动。它的质量视为无穷大，高速物体也不会穿过它。

`kinematic` 通过设置速度移动，会推开 dynamic body，但自己不受重力和碰撞影响。Pong 的球拍就是这种：位置由玩家控制，球撞上去会被弹开，球拍不会被球推走。

```lua
-- 每秒转一整圈，参数是弧度每秒
body:setAngularVelocity(360 * DEGREES_TO_RADIANS)
```

LÖVE 的角度单位是弧度。课程里的 `DEGREES_TO_RADIANS` 约等于 `0.01745`，乘上角度就得到弧度。

## 读取与修改

| 方法                              | 说明                     |
| --------------------------------- | ------------------------ |
| `body:getX()` / `getY()`          | 质心坐标                 |
| `body:getPosition()`              | 一次返回 X、Y            |
| `body:getAngle()`                 | 当前角度，弧度           |
| `body:setLinearVelocity(vx, vy)`  | 直接设置速度，像素/秒    |
| `body:getLinearVelocity()`        | 碰撞回调里判断冲击强度   |
| `body:applyLinearImpulse(ix, iy)` | 瞬时冲量，立刻改变动量   |
| `body:applyForce(fx, fy)`         | 持续力，每帧都要重新施加 |
| `body:setFixedRotation(true)`     | 锁死旋转，角色不会翻倒   |
| `body:setAwake(true)`             | 唤醒休眠的 body          |
| `body:isDestroyed()`              | 判断是否已从世界移除     |
| `body:destroy()`                  | 从世界移除               |

冲量与力的区别在时间尺度：冲量一次性改变速度，适合发射和爆炸；力按秒累积，适合推进器和风。

冲量的大小等于质量乘速度变化。质量 2 的鸟想获得 100 像素/秒，冲量就是 200；换用 `setLinearVelocity` 则与质量无关，轻的重的都一样快。

## 阻尼与质量

`setLinearDamping(d)` 让线速度按比例衰减，`setAngularDamping(d)` 同理作用于旋转。它们模拟空气阻力，不是接触摩擦；摩擦属于 fixture。

鸟发射后调用 `setAngularDamping(1)`，旋转很快停下来，画面不会一直打转。数值越大衰减越快，`0` 表示不衰减。

- 质量 = 各 fixture 的密度乘面积之和
- `getMass()` 要在 fixture 创建后读，否则得到 0
- 密度差太大时，碰撞会显得“重”，轻的物体被弹飞

## 渲染

物理 body 不负责画图。每帧读取位置和角度，把精灵画在同一个中心：

```lua
love.graphics.draw(
    texture,
    body:getX(), body:getY(),
    body:getAngle(),
    1, 1,
    texture:getWidth() / 2, texture:getHeight() / 2
)
```

最后两个参数是绘制原点，传纹理一半宽高，旋转才会绕中心。直接用 `body:setPosition` 是瞬移，会跳过路径上的碰撞；想让物体移动，改速度或施加冲量。

## 常见坑

- 把左上角坐标传给 `newBody`，物体整体偏移半个尺寸
- 用 `static` 做会动的平台，怎么设速度都不动
- 给 `kinematic` 期待重力，它永远不会下落
- 每帧 `setPosition` 做移动，碰撞被完全绕过
- 忘记 `setFixedRotation`，角色撞一下就倒地
- 在回调里销毁 body，触发世界锁定错误
