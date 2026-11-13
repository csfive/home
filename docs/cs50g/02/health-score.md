---
title: 生命、得分与粒子
description: 哈佛 CS50G Week 2 · 生命、得分与粒子
---

# 生命、得分与粒子

球掉下去扣一颗心，打碎砖块加分并溅出火花，这三件事撑起整局的反馈。

## 生命

血量初始 3，只有 `play` 状态会改它。球越过底边时先减一，再看是否归零：归零进 `game-over`，否则回 `serve` 重新发球。

```lua
if self.ball.y >= VIRTUAL_HEIGHT then
    self.health = self.health - 1

    if self.health == 0 then
        gStateMachine:change('game-over', { score = self.score })
    else
        gStateMachine:change('serve', {
            paddle = self.paddle,
            bricks = self.bricks,
            health = self.health,
            score = self.score,
            level = self.level,
            highScores = self.highScores
        })
    end
end
```

回 `serve` 时把挡板、砖块、分数、关卡号都传过去，掉一条命不会重置进度。`health` 是普通数字，传参时复制，旧状态里的值不会跟着变。

| 元素          | 起点                           | 尺寸或间距    |
| ------------- | ------------------------------ | ------------- |
| 心            | `VIRTUAL_WIDTH - 100`，`y = 4` | 每颗间隔 11   |
| 文本 `Score:` | `VIRTUAL_WIDTH - 60`，`y = 5`  | 普通字号      |
| 分数          | `VIRTUAL_WIDTH - 50`，`y = 5`  | 宽 40，右对齐 |

心图只有 10×9，从右上角起从左往右排。先画 `health` 颗满心，再补 `3 - health` 颗空心。心图本身只有红灰两帧，血量变化只改画哪一帧。

满心与空心是同一张图集的两个 quad，索引 1 和 2。`renderHealth` 被三个状态调用，所以放在 `main.lua`。

## 得分

每块砖的分数是 `tier * 200 + color * 25`。颜色从蓝到金依次变贵，tier 每升一级再加 200。

```lua
self.score = self.score + (brick.tier * 200 + brick.color * 25)
```

| 砖块            | 计算      | 分值 |
| --------------- | --------- | ---- |
| color 1，tier 0 | 25        | 25   |
| color 5，tier 0 | 125       | 125  |
| color 1，tier 3 | 600 + 25  | 625  |
| color 5，tier 3 | 600 + 125 | 725  |

分数用的是砖块当前的颜色和 tier，在 `hit()` 之前结算：同一块砖第二次被撞时颜色已经降过，得分也随之变低。`renderScore` 用 `printf` 右对齐，宽度 40。

## 回血

`recoverPoints` 是下一颗心的分数门槛，初始 5000。分数越过后回 1 血，并把门槛乘 2，封顶 100000。

```lua
if self.score > self.recoverPoints then
    self.health = math.min(3, self.health + 1)
    self.recoverPoints = math.min(100000, self.recoverPoints * 2)
    gSounds['recover']:play()
end
```

满血时阈值照样翻倍，血越多下一次回血越难，避免前期滚雪球。判定发生在加分和 `hit()` 之后，同一块砖可以同时触发加分、降级、回血和过关。

| 字段            | 初值 | 变化                         |
| --------------- | ---- | ---------------------------- |
| `health`        | 3    | 掉球减一，过门槛加一，上限 3 |
| `recoverPoints` | 5000 | 每次触发乘 2，封顶 100000    |

## 粒子

每块砖在 `init` 时建一个粒子系统，纹理是 8×8 的圆点，缓冲 64 个。粒子系统绑在砖块上，砖块消失时一起被回收。

```lua
self.psystem = love.graphics.newParticleSystem(gTextures['particle'], 64)
self.psystem:setParticleLifetime(0.5, 1)
self.psystem:setLinearAcceleration(-15, 0, 15, 80)
self.psystem:setEmissionArea('normal', 10, 10)
```

寿命在 0.5 到 1 秒之间随机；X 加速度 -15 到 15，向两侧散开；Y 只取 0 到 80，整体向下落。

| 方法                    | 参数               | 效果             |
| ----------------------- | ------------------ | ---------------- |
| `newParticleSystem`     | 纹理、64           | 预分配 64 个粒子 |
| `setParticleLifetime`   | 0.5、1             | 寿命随机         |
| `setLinearAcceleration` | -15、0、15、80     | X 散开、Y 下落   |
| `setEmissionArea`       | `'normal'`、10、10 | 正态分布出生点   |

65 个粒子系统同时存在时，每帧要更新 65 次，但每个只处理自己缓冲里的粒子，开销和砖块总数成正比。

正态分布让出生点集中在砖块中心，比均匀分布自然。`setColors` 接收两段 RGBA，起始 alpha 随 tier 提高，结束为 0。

```lua
local c = paletteColors[self.color]
self.psystem:setColors(
    c.r / 255, c.g / 255, c.b / 255, 55 * (self.tier + 1) / 255,
    c.r / 255, c.g / 255, c.b / 255, 0
)
self.psystem:emit(64)
```

粒子是发射即忘：`emit(64)` 之后只靠 `psystem:update(dt)` 推进。`PlayState` 遍历所有砖块更新，`renderParticles` 再单独画一轮。`serve` 和 `victory` 不调用它，过关瞬间的残粒子会直接消失。

`Brick:update` 不检查 `inPlay`，砖块消失后粒子仍在衰减；渲染必须放在所有砖块之后，否则后面的砖会盖住火花。规模再大就该改成全局共享发射器。
