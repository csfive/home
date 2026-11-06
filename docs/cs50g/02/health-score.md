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

回 `serve` 时把挡板、砖块、分数、关卡号都传过去，所以掉一条命不会重置进度。判定用的是球的左上角 `y`，球刚探出下边缘时还不会触发。

`health` 是普通数字，传参时复制，旧状态里的值不会跟着变。`hurt` 音效在状态切换前触发，音源是全局对象，切状态不会打断已经播放的声音。

| 元素          | 起点                           | 尺寸或间距    |
| ------------- | ------------------------------ | ------------- |
| 心            | `VIRTUAL_WIDTH - 100`，`y = 4` | 每颗间隔 11   |
| 文本 `Score:` | `VIRTUAL_WIDTH - 60`，`y = 5`  | 普通字号      |
| 分数          | `VIRTUAL_WIDTH - 50`，`y = 5`  | 宽 40，右对齐 |

心图只有 10×9，从右上角起从左往右排。先画 `health` 颗满心，再补 `3 - health` 颗空心。心图本身只有红灰两帧，血量变化只改画哪一帧。

满心与空心是同一张图集的两个 quad，索引 1 和 2，换配色只要换 quad。`renderHealth` 被三个状态调用，所以放在 `main.lua`；心的总宽度固定，掉血时只有右侧变灰。

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

分数用的是砖块当前的颜色和 tier，而且在 `hit()` 之前结算。同一块砖第二次被撞时颜色已经降过，得分也随之变低。

分数只增不减。`renderScore` 用 `printf` 右对齐，宽度 40；累加发生在命中回调里，一帧最多命中一块砖。

## 回血

`recoverPoints` 是下一颗心的分数门槛，初始 5000。分数越过后回 1 血，并把门槛乘 2，封顶 100000。

```lua
if self.score > self.recoverPoints then
    self.health = math.min(3, self.health + 1)
    self.recoverPoints = math.min(100000, self.recoverPoints * 2)
    gSounds['recover']:play()
end
```

满血时阈值照样翻倍。血越多，下一次回血越难，这条规则避免前期滚雪球。

判定发生在加分和 `hit()` 之后，同一块砖可以同时触发加分、降级、回血和过关。回血只加血，不改分数也不重建砖块。

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

`Brick:update` 不检查 `inPlay`，砖块消失后粒子仍在衰减；渲染也必须放在所有砖块之后，否则后面的砖会盖住火花。每个砖块一个粒子系统，最多 65 个实例，缓冲 64 个；规模再大就该改成全局共享发射器。

## HUD 排版

HUD 全部用虚拟坐标。432 宽的画面里，右上角从 `VIRTUAL_WIDTH - 100` 开始就够放三颗心；放大到 1280 宽时按比例缩放，不需要第二套坐标。

分数用 `printf` 的宽度参数右对齐，四位数变五位数时不会把 `Score:` 挤走。

- 心固定在右上角，间距 11
- 分数与文字共用一行
- FPS 留在左上角，发布时关掉

心用 10×9 的图，字号用 `small`，HUD 就不会抢主画面的重心。数字建议用等宽字体，分数跳动时不会左右抖。HUD 的绘制都在 `push.start()` 与 `push.finish()` 之间，才和其它元素共用同一套缩放。切换窗口大小时这些数字都不用改。
