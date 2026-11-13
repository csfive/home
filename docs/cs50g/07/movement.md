---
title: 网格移动与动画
description: 哈佛 CS50G Week 7 · 网格移动与动画
---

# 网格移动与动画

## 两套坐标

实体同时保存 `mapX`、`mapY` 和 `x`、`y`。前者是格子编号，后者是屏幕像素，两者只在移动开始时同步一次。

```lua
self.entity.mapX = toX
self.entity.mapY = toY

Timer.tween(0.5, {
    [self.entity] = {
        x = (toX - 1) * TILE_SIZE,
        y = (toY - 1) * TILE_SIZE - self.entity.height / 2
    }
}):finish(function()
    -- 到位后再决定继续走还是停下
end)
```

网格坐标立刻改成目标值，像素坐标慢慢追。这样即使渲染在 tween 中间，逻辑查询「我站在哪一格」也已经准确，遇敌、碰撞都按格子判断。

纵坐标多减了 `height / 2`：精灵比瓦片高，脚底对齐格子的下沿，视觉上才像站在地面上。

## 到位之后

`finish` 回调是移动状态的核心分支：

```lua
if love.keyboard.isDown('left') then
    self.entity.direction = 'left'
    self.entity:changeState('walk')
elseif love.keyboard.isDown('right') then
    ...
else
    self.entity:changeState('idle')
end
```

按住不放时，每次落地立刻重新进入 `walk`，于是格子一格接一格地走，中间没有停顿。松手后 `isDown` 为假，落到 `idle`。

- 用 `isDown` 而不是 `wasPressed`：后者按住期间只触发一次，走动会变成一步一按
- 状态切换发生在 `finish` 里：`update` 每帧都跑，在那里改状态会在 tween 中途反复重置
- 反复重置的表现是走一步卡一下，不是「走得更快」

## 方向与动画名

`direction` 只取 `left`、`right`、`up`、`down` 四值，动画名由它拼出来：

```lua
self.entity:changeAnimation('walk-' .. self.entity.direction)
```

| 状态   | 动画               | 触发                           |
| ------ | ------------------ | ------------------------------ |
| `idle` | `idle-<direction>` | 松开方向键、撞到边界、遇敌暂停 |
| `walk` | `walk-<direction>` | 按下方向键且目标格可走         |
| 战斗   | `battle` 贴图      | 进入战斗状态                   |

转向也要播动画。只改 `direction` 不换帧，角色会保持上一帧的朝向走，看起来像滑行。

## 边界与卡格

目标格先算出来，越界就直接转回 `idle`，不改 `mapX`、不启动 tween：

```lua
if toX < 1 or toX > 24 or toY < 1 or toY > 13 then
    self.entity:changeState('idle')
    self.entity:changeAnimation('idle-' .. self.entity.direction)
    return
end
```

这里同时切了状态和动画。只切状态的话，`idle` 状态会沿用上一次的 `walk-*` 动画，角色贴墙原地踏步。

移动途中不接受新方向，是网格移动与自由移动最大的区别。代价是快速连按会丢输入：玩家在 0.5 秒的 tween 里按了反方向，得等落地才生效。手感要求高时，缓存一个方向，落地后优先取缓存：

```lua
function EntityWalkState:keypressed(key)
    if key == 'left' or key == 'right'
        or key == 'up' or key == 'down' then
        self.entity.bufferedDirection = key
    end
end
```

`finish` 里先看 `bufferedDirection`，有就朝那个方向再走一格并清空，没有再看 `isDown`。这样连按不会丢，按住也不会漏。

缓冲只在移动中用，`idle` 状态收到方向键应当立即移动，不需要等一个 `finish`。

## 帧动画

精灵图是一张长条，用 `love.graphics.newQuad(x, y, w, h, imageW, imageH)` 切成一帧一帧，存进动画对象：

```lua
local frames = {}
for i = 0, 3 do
    frames[i + 1] = love.graphics.newQuad(i * 16, 0, 16, 16, 64, 16)
end

animation = Animation(frames, 0.15)
```

`update(dt)` 累加计时器，超过间隔就 `currentFrame + 1`，到末尾回绕到 1。所有帧共用同一个间隔，想要不均匀的节奏，就得让动画对象支持每帧独立时长。

tween 与帧动画是两套时间：tween 决定位置，动画计时器决定画面。两者都吃 `dt`，但互不依赖。位置用 tween 而不是 `x = x + speed * dt`，是因为网格移动的终点是确定的，插值比速度积分更不容易累积误差——后者只要有一帧 `dt` 抖动，角色就会停在格子中间，下一次移动的起点也跟着偏。步速就是两个数字的事：

- 0.5 秒一格偏慢，适合大地图慢走
- 0.15 秒左右更接近现代手感
- 改时长要同时调动画帧间隔，否则角色滑动而腿不动

## 多实体与占位

单人地图不需要碰撞，但只要有 NPC，目标格就可能被占住。判断放在 `attemptMove` 里，越界判断之后：

```lua
for _, entity in ipairs(self.state.entities) do
    if entity ~= self.entity
        and entity.mapX == toX and entity.mapY == toY then
        self.entity:changeState('idle')
        return
    end
end
```

`entity ~= self.entity` 不能省，否则实体把自己当成障碍，永远迈不出第一步。两张实体表也要分清：地图上的所有角色放在 `entities` 里统一渲染和更新，玩家是其中之一；`self.entity` 只是当前状态的持有者，两者混用会把自己也挡掉。

- 斜向移动不要加：对角线是 1.41 格，玩家会一直斜着走，美术还要多画四套动画
- `changeAnimation` 收到不存在的名字会直接崩，`gFrames['entities'][name]` 是 `nil`
- 构造动画表时把八个方向名都建好，比上线后排查黑屏快
