---
title: 容易混淆的问题
description: 哈佛 CS50G Week 5 · 容易混淆的问题
---

# 容易混淆的问题

## 判定：谁能打谁

| 概念    | 语义         | 生命周期     | 常见误用             |
| ------- | ------------ | ------------ | -------------------- |
| hitbox  | 受击方的身体 | 常驻         | 拿它当武器判定       |
| hurtbox | 攻击方的武器 | 只在攻击状态 | 状态退出后还在算伤害 |
| AABB    | 求交算法     | 每次调用     | 以为盒子自带碰撞逻辑 |

剑盒是 hurtbox，敌人身体是 hitbox，判定写成 `entity:collides(swordHitbox)`。方向反过来写也能跑，但语义就乱了：尸体不会还手，武器不该受伤。

`Hitbox` 类只有四个字段，没有任何方法。它不参与更新，也不进房间列表，状态一退出就随状态对象一起被丢弃。

- 扫房间实体是攻击方的活，受击方只负责 `damage`
- 无敌 1.5 秒挂在玩家身上，与挥剑动画的长度无关
- 剑盒每帧都能命中，敌人血量大于 1 时会出现多段伤害

## 坐标：四层偏移

| 名称                | 归属 | 作用                      |
| ------------------- | ---- | ------------------------- |
| 实体 `x`、`y`       | 实体 | 房间内像素坐标，碰撞用它  |
| `renderOffsetX/Y`   | 房间 | 让 22×11 地图在屏幕居中   |
| `adjacentOffsetX/Y` | 房间 | 把下一间房画到屏幕外一屏  |
| `cameraX/Y`         | 地牢 | 交给 `translate` 平移画布 |

`cameraX` 与 `adjacentOffsetX` 经常被当成一回事。相机挪的是整张画布，房间偏移只作用于那一间房，切换时两者同时朝反方向走，屏幕里才出现"旧房左移、新房滑入"。按 384×216 算，地图 352×176，水平偏移 16、垂直偏移 20，这段差值不进任何判定，只影响绘制。

```lua
local tx = math.floor((px - MAP_RENDER_OFFSET_X) / TILE_SIZE) + 1
local ty = math.floor((py - MAP_RENDER_OFFSET_Y) / TILE_SIZE) + 1
```

反查时先减偏移、再除格子、最后加一；绘制时先减索引、再乘格子、最后加偏移。两头都差一个 1，顺序反了就整体错一格。

## 时间：谁在第几秒变

| 机制                  | 改的是什么 | 何时生效         |
| --------------------- | ---------- | ---------------- |
| `Timer.tween(1, …)`   | 字段数值   | 时长走完后回调   |
| `stateMachine:change` | 行为对象   | 立刻             |
| `coroutine.yield`     | 执行位置   | 调用方再次调用时 |
| `shifting` 标志       | 更新开关   | `finishShifting` |

撞门那一刻只是把 `shifting` 置真、启动补间，`currentRoom` 要等 1 秒后 `finishShifting` 才换。所以"第几秒进新房间"的答案永远是补间结束时，而不是碰撞那一帧。

```lua
local gen = coroutine.wrap(function()
    coroutine.yield { phase = 'visit' }
    coroutine.yield { phase = 'done' }
end)
local step = gen()      -- visit
```

`yield` 把值交回调用方并挂起，调用栈原样保留；`return` 直接结束函数，第二次调用只会从头再来。这是生成器能单步调试、而普通循环不能的原因。

- 补间被打断，`finishShifting` 不执行，`shifting` 会永久为真
- `currentRoom` 换掉之后才关旧门，否则门会留在新房间里
- 协程只能往前走，没有回退，重新生成要新建一个句柄

## 数据：写的和跑的不一样

| 数据                | 运行期实际行为    | 说明                    |
| ------------------- | ----------------- | ----------------------- |
| `ENTITY_DEFS[key]`  | 全局共享，只读    | 改它就是改所有同类实体  |
| `Entity.animations` | 每个实体新建一套  | `createAnimations` 造的 |
| `solid`             | 没有任何地方读取  | 挡路要自己写            |
| `defaultState`      | 只决定出生帧      | 之后看 `state`          |
| `looping = false`   | 被 `or true` 吃掉 | 单次播放靠状态退出      |
| `TILE_EMPTY`        | 合法编号 19       | 越界索引才会得到 `nil`  |
| `onCollide`         | 每帧都调          | 站在开关上会重复触发    |
| `onConsume`         | 只该调一次        | 拾取逻辑要自己移除对象  |

出现"动画不停""罐子挡不住人""只播一次却循环"这类现象，先怀疑数据没被读取，而不是逻辑写错。`onCollide` 与 `onConsume` 混用也是同一类问题：前者每帧都来，后者本意只有一次。逐个核对引用点最快：

- 用 `print_r(ENTITY_DEFS['player'])` 确认表结构
- 在 `Entity:init` 打印 `#self.animations`，确认动画真的建出来
- 搜 `solid` 和 `looping` 的所有出现位置，看有没有读取方
- 把 `love.graphics.rectangle('line', …)` 加回 `render`，看盒子画在哪
- 改共享定义表会让所有同类实体一起变，改实例字段只影响一个
- 数据里出现的每个字段都要能找到读取它的代码，找不到就是死数据，删掉比留着安全
