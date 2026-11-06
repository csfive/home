---
title: 角色动画
description: 哈佛 CS50G Week 4 · 角色动画
---

# 角色动画

角色的每一帧都是图集里的一块矩形，动画就是按固定间隔换一块。

## 精灵表与帧号

角色素材是 16×20，比地块高，位置要按自身尺寸对齐地面。切图仍用 `GenerateQuads`，只是宽高换成 16 和 20。切图时不要缩放素材。

```lua
characterSheet = love.graphics.newImage('character.png')
characterQuads = GenerateQuads(characterSheet, 16, 20)
```

| 动作 | 帧号   | `interval` |
| ---- | ------ | ---------- |
| 站立 | 1      | 1          |
| 跳跃 | 3      | 1          |
| 下落 | 3      | 1          |
| 走路 | 10、11 | 0.1        |

单帧动画也走同一套 `Animation`，省掉「有没有动画」的分支。帧号不是语义，只是切图时按从左到右、从上到下编的序号。

换图集后数字会变，稳妥做法是给帧号起名字。每帧的脚底基线还要在同一行，否则换帧时角色会上下跳。帧号从 1 开始，和数组下标一致。

## 计时与循环

`Animation` 只有四个字段：帧数组、间隔、计时器、当前下标。

```lua
function Animation:update(dt)
    if #self.frames > 1 then
        self.timer = self.timer + dt
        if self.timer > self.interval then
            self.timer = self.timer % self.interval
            self.currentFrame = math.max(1,
                (self.currentFrame + 1) % (#self.frames + 1))
        end
    end
end
```

| 字段           | 作用           |
| -------------- | -------------- |
| `frames`       | quad 下标数组  |
| `interval`     | 每帧显示的秒数 |
| `timer`        | 累计时间       |
| `currentFrame` | 当前数组下标   |

`timer % interval` 保留超出的那部分，低帧率下动画不会整体变慢。取模用 `#frames + 1` 而不是 `#frames`，否则最后一帧永远显示不满一个间隔。判断用 `>` 而不是 `>=`，边界会多停一帧。

动画循环常见的错误：取模后下标至少为 1，帧数组按播放顺序排列。

- 取模写成 `% #frames`
- 计时器跨状态复用
- 单帧也跑计时
- 间隔用帧数表示

## 状态驱动动画

动画不属于角色，而属于状态。进入 `walking` 就新建走路动画并赋给 `currentAnimation`；切到 `jump` 换成单帧。进入状态就换动画。

```lua
function PlayerWalkingState:init(player)
    self.player = player
    self.animation = Animation { frames = {10, 11}, interval = 0.1 }
    self.player.currentAnimation = self.animation
end
```

切状态时重建动画对象，`timer` 归零，所以每次起步都从第一帧开始。动画只描述外观，不知道玩家是否在空中；跳跃和下落共用第 3 帧，是因为素材只有一张。切换时只设 `currentAnimation`，不要同时改 `currentFrame`，也不共享计时器。

## 翻转与绘制原点

向右走要镜像精灵。负的 X 缩放绕绘制原点翻转，所以先把原点设到精灵中心，再把绘制坐标加半个宽高。原点不设中心，翻转会绕左上角。

```lua
love.graphics.draw(texture, quad,
    math.floor(self.x) + self.width / 2,
    math.floor(self.y) + self.height / 2,
    0, self.direction == 'right' and 1 or -1, 1,
    self.width / 2, self.height / 2)
```

翻转系数的符号取决于素材默认朝向。绿色外星人素材默认朝右，所以 `right` 取 1、`left` 取 -1；换成朝左的素材就要反过来。

`math.floor` 同样为了像素对齐，小数坐标会让精灵边缘发虚。翻转只影响绘制，碰撞盒和 `x` 不变。缩放系数不要用 0，0 会把精灵压没。

## 循环与单次

走路要循环，受击或落地只播一次。当前的 `Animation` 只会循环，单次动画需要自己加结束标志。两帧动画靠间隔撑时间，不靠补帧。

| 类型 | 结束行为     | 例子             |
| ---- | ------------ | ---------------- |
| 循环 | 回到第一帧   | 走路、飞行、待机 |
| 单次 | 停在最后一帧 | 受击、爆炸、开门 |

做单次动画时，在 `update` 里判断 `currentFrame == #frames` 并置 `finished = true`。状态机读到后再切回 idle，不要在动画类里直接 `changeState`。

`finished` 要在重新进入状态时清空，否则第二次播放会立刻结束。两帧以内的动画不需要结束标志，循环动画也不需要结束标志。

## 帧率与边界

`interval` 小于一帧（约 0.016 秒）时，`timer` 每次都会超过间隔，帧号跳着走，看起来像掉帧。低于两帧的动画没有意义，直接换一张图；帧率变动不影响动画速度。

0.1 秒的间隔在 60 帧下是 6 帧换一次图，30 帧下只有 3 帧。间隔按秒算，动画速度才不会随帧率变，不要把它写成帧数。

| 动作 | 间隔 |
| ---- | ---- |
| 走路 | 0.1  |
| 待机 | 1    |
| 受击 | 0.05 |

想暂停动画而不暂停游戏，在动画的 `update` 里直接 `return`，不要把 `dt` 改成 0。改 `dt` 会连带影响物理和输入计时，恢复时容易跳帧。暂停期间保留 `currentFrame`，恢复后从原帧继续；暂停只跳过动画更新，不跳过物理。

- 帧号是否对应图集
- 间隔是否以秒为单位
- 循环还是单次
- 脚底基线是否一致
