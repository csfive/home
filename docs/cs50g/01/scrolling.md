---
title: 无限滚动与视差
description: 哈佛 CS50G Week 1 · 背景滚动与无缝回绕
---

# 无限滚动与视差

鸟的 `x` 从头到尾不变，前进感全来自背景和管道左移：两层图各按固定速度累加偏移，到点回绕。

## 视差

移动慢的被当成远处的山，移动快的被当成脚下的地面。课程给背景 30 像素/秒、地面 60 像素/秒，速度差就撑出纵深。

| 图层 | 速度（px/s） | 回绕点          | 绘制位置                               |
| ---- | ------------ | --------------- | -------------------------------------- |
| 背景 | 30           | 413             | `(-backgroundScroll, 0)`               |
| 地面 | 60           | `VIRTUAL_WIDTH` | `(-groundScroll, VIRTUAL_HEIGHT - 16)` |

速度只是常量，改它只改变观感与节奏。地面比背景快一倍是横版游戏最省事的默认比例；要做三层，再插一层 15 像素/秒的远山。

## 滚动量与取模

偏移量每帧加上 `速度 * dt`，再对回绕点取模，数值不会无限增长，浮点精度永远够用。

```lua
local BACKGROUND_LOOPING_POINT = 413
local BACKGROUND_SCROLL_SPEED = 30
local GROUND_SCROLL_SPEED = 60

function love.update(dt)
    backgroundScroll = (backgroundScroll + BACKGROUND_SCROLL_SPEED * dt)
        % BACKGROUND_LOOPING_POINT
    groundScroll = (groundScroll + GROUND_SCROLL_SPEED * dt) % VIRTUAL_WIDTH
end
```

`413 % 413` 得 0，因为整除没有余数，画面从回绕点弹回原点。`dt` 让位移与帧率无关：144 帧的机器每帧走得少，一秒走的总量相同。

Lua 的 `%` 结果符号跟随除数，正数取模永远落在 `[0, 除数)`；`math.fmod` 保留被除数符号，两者在偏移为负时结果不同。

## 回绕点与负偏移

回绕点必须是图片内部图案重复的周期，取错就在回绕瞬间看到一条接缝。背景用 413 是因为山脊正好每 413 像素重复一次，地面按屏宽平铺，所以用 `VIRTUAL_WIDTH`。

```lua
function love.draw()
    push.start()

    love.graphics.draw(background, -backgroundScroll, 0)
    gStateMachine:render()
    love.graphics.draw(ground, -groundScroll, VIRTUAL_HEIGHT - 16)

    push.finish()
end
```

偏移量本身非负，画的时候取负图才向左移动。地面画在状态机之后，鸟和管道下半截就被挡住，像插进地里；顺序颠倒会看到管道压在地面上。

滚动不属于任何一个状态：标题页、游戏页、结算页通常都要滚，所以这两个变量和更新代码留在 `main.lua`，放在 `gStateMachine:update(dt)` 外面。

## 图片要够宽

只画一张图时可见范围是 `[0, 图片宽 - 偏移]`，偏移最大接近回绕点，所以必须满足 `图片宽 ≥ 屏宽 + 回绕点`，否则右侧露白。课程素材背景 1157 像素宽、周期 413，余量 744 像素，远大于一屏。

更稳妥的写法是画两遍：

```lua
love.graphics.draw(background, -backgroundScroll, 0)
love.graphics.draw(background, background:getWidth() - backgroundScroll, 0)
```

这样只要 `图片宽 ≥ 屏宽` 就无缝，回绕点可以等于图片宽，代价是每帧多一次 `draw`。

浮点偏移还有个副作用：绘制坐标带小数时，`nearest` 过滤会让像素逐帧抖一下。`math.floor` 取整再取负，像素画就稳了，代价是滚动变成整像素跳格，60 像素/秒下每秒跳 60 次，肉眼看不出来。

## 滚动逻辑放哪

结算页要停滚，就跳过整段累加，别把速度设 0——速度是常量，改它会连带改掉手感。

相机按系数取偏移：`layerOffset = cameraX * 0.5`，新增图层只改系数，不必再算一遍回绕。
