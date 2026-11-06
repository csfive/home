---
title: 无限滚动与视差
description: 哈佛 CS50G Week 1 · 背景滚动与无缝回绕
---

# 无限滚动与视差

Flappy Bird 的世界只有一屏宽，却要一直往前飞。做法是让两层图以不同速度左移、到点回绕，靠取模维持一个永远落在 `[0, 周期)` 里的偏移量。

## 视差

视差是速度差造成的距离错觉：移动慢的东西被当成远处的山，移动快的被当成脚下的地面。课程给背景 30 像素/秒、地面 60 像素/秒，两层不同速，画面立刻有了纵深。

| 图层 | 速度（px/s） | 回绕点          | 绘制位置                               |
| ---- | ------------ | --------------- | -------------------------------------- |
| 背景 | 30           | 413             | `(-backgroundScroll, 0)`               |
| 地面 | 60           | `VIRTUAL_WIDTH` | `(-groundScroll, VIRTUAL_HEIGHT - 16)` |

速度只是常量，改它不会破坏逻辑，只会改变观感与节奏。地面比背景快一倍，是横版游戏最省事的默认比例；想做三层，可以再插一层 15 像素/秒的远山。

浮点偏移还有一个副作用：绘制坐标带小数时，nearest 过滤会让像素图案逐帧抖一下。偏移量用 `math.floor` 取整再取负，像素画就稳了；代价是滚动变成整像素跳格，60 像素/秒下每秒跳 60 次，肉眼看不出来。

## 滚动量与取模

偏移量每帧加上 `速度 * dt`，再对回绕点取模。取模保证数值不会无限增长，浮点数精度永远够用。

```lua
local BACKGROUND_SCROLL_SPEED = 30
local GROUND_SCROLL_SPEED = 60
local BACKGROUND_LOOPING_POINT = 413

function love.update(dt)
    backgroundScroll = (backgroundScroll + BACKGROUND_SCROLL_SPEED * dt)
        % BACKGROUND_LOOPING_POINT
    groundScroll = (groundScroll + GROUND_SCROLL_SPEED * dt) % VIRTUAL_WIDTH

    gStateMachine:update(dt)
end
```

`413 % 413` 得 0，因为整除没有余数，画面正好从回绕点弹回原点。乘法项里的 `dt` 让位移与帧率无关：144 帧的机器每帧走得少，一秒走的总量相同。

Lua 的 `%` 结果符号跟随除数，正数取模永远落在 `[0, 除数)`；`math.fmod` 保留被除数符号，两者混用会在偏移为负时得到不同结果。

## 回绕点怎么选

回绕点不能随便取。它必须是图片内部图案重复的周期，比如一段山脊正好重复 413 像素；取错就会在回绕瞬间看到一条明显接缝。背景用 413，地面用整屏宽度，因为地面纹理本来就按屏宽平铺。

## 绘制时的负偏移

偏移量本身非负，画的时候取负，图才向左移动。地面贴在虚拟高度的底部，上移 16 像素留给地面厚度。管道不参与回绕，它们从右边生成、从左边删除，是真正的「一次性」对象。

```lua
function love.draw()
    push.start()

    love.graphics.draw(background, -backgroundScroll, 0)
    gStateMachine:render()
    love.graphics.draw(ground, -groundScroll, VIRTUAL_HEIGHT - 16)

    push.finish()
end
```

地面画在 `gStateMachine:render()` 之后，鸟和管道就被地面挡住下半截，视觉上像插进地里，这正是想要的层次。顺序颠倒会看到地面被管道压在下面，穿帮得很明显。

## 滚动逻辑放在哪

滚动不属于任何一个状态：标题页要滚，游戏页要滚，结算页通常也继续滚以保持世界活着。所以这两个变量和更新代码留在 `main.lua`，放在 `gStateMachine:update(dt)` 外面。

```lua
-- 结算页停滚，其余状态继续
if gStateMachine.currentName ~= 'score' then
    groundScroll = (groundScroll + GROUND_SCROLL_SPEED * dt) % VIRTUAL_WIDTH
end
```

`currentName` 需要在 `StateMachine:change` 里补一行 `self.currentName = stateName`，因为课程原版只记录当前实例 `self.current`，不记名字。这类「全局持续现象」的原则是：状态差异用 `if` 表达，共性逻辑留在外层，不要复制进四个状态文件。

更通用的做法是维护一个「相机」位置，各层按系数取偏移：远景乘 0.5、地面乘 1.0，新增图层只改系数，不用再复制一套 `xxxScroll` 变量和 `%` 表达式。课程的两层写法直观，但层数一多就会变成一堆平行代码。

## 延伸：图片要够宽

只画一张图时，可见范围是 `[0, 图片宽 - 偏移]`。偏移最大接近回绕点，所以必须满足 `图片宽 ≥ 屏宽 + 回绕点`，否则右侧会露出空白。这套素材的背景图是 1157 像素宽、回绕周期 413，余量 744 像素，远大于一屏，所以单张图就看不出边界。

更稳妥的写法是画两遍，第二张接在第一张后面：

```lua
love.graphics.draw(background, -backgroundScroll, 0)
love.graphics.draw(background, background:getWidth() - backgroundScroll, 0)
```

这样只要 `图片宽 ≥ 屏宽` 就无缝，回绕点可以等于图片宽，代价是每帧多一次 `draw`。两层背景完全付得起。

还要注意 `dt` 封顶。窗口被拖动或系统卡顿后，`dt` 可能是 0.5 秒，背景一帧跳 15 像素，回绕的接缝会闪一下；`dt = math.min(dt, 1 / 60)` 能顺带压住这种抖动。
