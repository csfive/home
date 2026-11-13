---
title: 道具、库存与存档
description: 哈佛 CS50G Week 5 · 道具、库存与存档
---

# 道具、库存与存档

## 罐子：从障碍到武器

罐子是一张定义表加一个坐标，关键是把"能挡住人"和"能被举起来"两件事分开做。

```lua
['pot'] = {
    type = 'pot',
    texture = 'tiles',
    width = 16, height = 16,
    solid = true,
    defaultState = 'idle',
    states = { ['idle'] = { frame = POT_FRAME } }  -- 按图集编号填
}
```

`solid` 在讲义代码里只是一个数据标记，`Room:update` 并没有读它。作业要自己把它接进碰撞判断，否则玩家会直接穿过罐子。

| 阶段    | 触发                  | 表现                   |
| ------- | --------------------- | ---------------------- |
| `lift`  | 站在罐子旁按 Enter    | 播放举起动画，罐子离地 |
| `carry` | 举起动画结束          | 罐子悬在头顶，可走动   |
| `throw` | 在 `carry` 中按投掷键 | 罐子变投射物，恢复挥剑 |

举着罐子时禁止挥剑，最省事的做法是在 `PlayerIdleState` 与 `PlayerWalkState` 里判断一个 `self.player.carrying`，为真就跳过空格分支。

罐子跟随不存自己的坐标，而是每帧取 `player.x`、`player.y - 8` 再画。这样转身、走位都不用同步，销毁时也只需把引用置空。

## 举起的按键流程

按 Enter 时不能假设手边一定有罐子，得先找。

```lua
if love.keyboard.wasPressed('enter') or love.keyboard.wasPressed('return') then
    for _, object in pairs(room.objects) do
        if object.type == 'pot' and self.entity:collides(object) then
            self.entity.carriedPot = object
            self.entity:changeState('lift')
            break
        end
    end
end
```

用碰撞判断代替"正前方一格"，省掉按朝向算坐标的边界情况。被举起的罐子要从 `room.objects` 里移走，否则它还会继续参与碰撞和绘制，出现一个跟着人走的实体罐外加一个隐形罐。

移走之后 `GameObject:update` 就不再被调用，所以携带与飞行阶段要由玩家状态自己更新它。把罐子挂到 `player.carriedPot` 上，是让生命周期跟着人走的最简单办法。

## 投掷物

松开手，罐子从"被携带"变成"自己飞"，需要方向与速度。

```lua
function GameObject:fire(dx, dy)
    self.projectile = true
    self.dx, self.dy = dx, dy
    self.traveled = 0
    self.startX, self.startY = self.x, self.y
end

function GameObject:update(dt)
    if not self.projectile then return end
    self.x = self.x + self.dx * dt
    self.y = self.y + self.dy * dt
    self.traveled = self.traveled + math.abs(self.dx * dt) + math.abs(self.dy * dt)
    if self.traveled > 64 then self.dead = true end
end
```

四格就是 64 像素。用累加距离而不是比较起点终点，是因为撞墙折返或斜飞时直线距离会失真。速度取 160 像素每秒时，整段飞行约 0.4 秒，正好够看清一条直线，而投掷方向直接由 `player.direction` 映射到 `dx`、`dy`，不做角度计算。

销毁条件有三个：

- 碰到墙：直接销毁
- 碰到敌人：先 `damage(1)` 再销毁
- 飞满四格：超过 64 像素就销毁

撞墙与撞敌人可以共用一声碎裂音效。`Projectile.lua` 在分发代码里是空壳，作业可以直接扩展 `GameObject`，不必继承一个新类。

## 掉落与回血

敌人死亡时按概率生成一颗心，落地后碰到就补血。

```lua
-- 敌人 health 归零处
if math.random() < 0.5 then
    table.insert(room.objects, GameObject(GAME_OBJECT_DEFS['heart'], x, y))
end
```

`onConsume` 与 `onCollide` 分开是有意义的：开关可以反复踩，心只能吃一次。

```lua
heart.onConsume = function()
    player.health = math.min(player.health + 2, 6)
end
```

上限必须卡 6，否则血量超过三颗心，界面画不下第四颗，看起来像 bug。半心的表示靠整数：1 点等于半颗。

## 库存与回旋镖

库存起步不需要复杂结构，一个布尔字段就够。

| 字段                  | 类型    | 用途             |
| --------------------- | ------- | ---------------- |
| `player.hasBoomerang` | boolean | 是否拿过宝箱     |
| `player.boomerang`    | object  | 当前飞行中的实例 |
| `player.canThrow`     | boolean | 冷却与在飞判断   |

宝箱在生成地牢时随机挑一间房放下，`onCollide` 里把 `hasBoomerang` 置真并打开箱盖帧。之后按 `E` 发射，条件是"有回旋镖且当前没有在飞的那一只"。

回旋镖与罐子共享飞行逻辑，区别在到达四格后不销毁，而是把 `returning` 置真，然后每帧朝玩家当前位置移动。撞墙时去程提前结束，立刻转入折返。

```lua
if self.returning then
    local dx, dy = player.x - self.x, player.y - self.y
    local len = math.sqrt(dx * dx + dy * dy)
    if len < 8 then self.dead = true end
    self.x = self.x + dx / len * speed * dt
    self.y = self.y + dy / len * speed * dt
end
```

追踪要现算，不能记住出发时的坐标，否则玩家一移动就接不到。旋转用 `love.graphics.draw` 的角度参数，每帧累加即可。

讲义没有存档，但状态已经是纯数据，序列化很直接：房间坐标、血量、库存，外加随机种子。

```lua
local data = string.format(
    'return { roomX = %d, roomY = %d, health = %d, seed = %d }',
    dungeon.currentRoom.x, dungeon.currentRoom.y, player.health, seed)
love.filesystem.write('save.lua', data)
local saved = love.filesystem.load('save.lua')()
```

只存房间坐标不够：地牢每次重新随机生成，读档后那间房可能根本不存在。所以要把 `math.randomseed` 用的种子一起存，启动时先设种子再生成，布局才能复现。
