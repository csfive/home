---
title: 触发、门与遮罩
description: 哈佛 CS50G Week 5 · 触发、门与遮罩
---

# 触发、门与遮罩

开关负责开门，门负责换房间，遮罩负责让人物看起来真的穿过了拱门。三段逻辑各自独立，靠回调和布尔标志串起来。

## 物件与回调

`GameObject:init` 只从定义表抄字段，碰撞行为由调用方注入。默认回调是空函数，这样忘记赋值也不会崩。

```lua
function Room:generateObjects()
    local switch = GameObject(GAME_OBJECT_DEFS['switch'],
        math.random(...), math.random(...))

    switch.onCollide = function()
        if switch.state == 'unpressed' then
            switch.state = 'pressed'
            for k, doorway in pairs(self.doorways) do
                doorway.open = true
            end
            gSounds['door']:play()
        end
    end

    table.insert(self.objects, switch)
end
```

`if switch.state == 'unpressed'` 这一句保证只触发一次，否则站在开关上每帧都会重播音效。渲染时帧号取自 `states[state].frame`，所以切状态就等于换贴图，不需要额外标志。

| 字段           | 作用                     |
| -------------- | ------------------------ |
| `type`         | 字符串标识，供逻辑分支用 |
| `states`       | 状态名到帧号的映射       |
| `defaultState` | 出生状态                 |
| `solid`        | 是否挡路（需自己实现）   |
| `onCollide`    | 每帧碰撞时调用           |

## 门

门不是实体，只是一块带方向与开关状态的判定区。

```lua
if direction == 'left' then
    self.x = MAP_RENDER_OFFSET_X
    self.y = MAP_RENDER_OFFSET_Y + (MAP_HEIGHT / 2) * TILE_SIZE - TILE_SIZE
    self.width, self.height = 16, 32
end
```

位置全部硬编码，因为所有房间布局一致，门永远开在四边中央。左、右门是 16×32 的竖条，上、下门是 32×16 的横条，正好覆盖两格。

一扇门由四块图块拼成。`open` 为真画一组编号，为假画另一组，两组刚好是通道与闸门的区别。四种门的位置只差一个基准点，尺寸按横竖两套来。

| 方向     | `x`                                   | `y`                                   | 尺寸  |
| -------- | ------------------------------------- | ------------------------------------- | ----- |
| `left`   | `MAP_RENDER_OFFSET_X`                 | 竖直居中，减一格                      | 16×32 |
| `right`  | `MAP_RENDER_OFFSET_X + 地图宽 - 一格` | 同左                                  | 16×32 |
| `top`    | 水平居中，减一格                      | `MAP_RENDER_OFFSET_Y`                 | 32×16 |
| `bottom` | 同 `top`                              | `MAP_RENDER_OFFSET_Y + 地图高 - 一格` | 32×16 |

`(MAP_WIDTH / 2) * TILE_SIZE` 得到的是地图中心，加偏移后正好是屏幕中线。门宽两格共 32 像素，所以要减去一格，让门以中线对称。

## 撞门触发

走路状态平时只做边界钳制，撞墙时才额外检查门。这里有个小技巧：碰撞后人物已经被推出墙外，于是先把坐标临时挪回墙内一帧的距离，再判定。

```lua
if self.bumped then
    if self.entity.direction == 'left' then
        self.entity.x = self.entity.x - PLAYER_WALK_SPEED * dt
        for k, doorway in pairs(self.dungeon.currentRoom.doorways) do
            if self.entity:collides(doorway) and doorway.open then
                self.entity.y = doorway.y + 4
                Event.dispatch('shift-left')
            end
        end
        self.entity.x = self.entity.x + PLAYER_WALK_SPEED * dt
    end
end
```

`y = doorway.y + 4` 是把人吸附到门口正中，避免贴着墙角滑出去。`doorway.open` 为假时什么都不发生，撞的是实心门。

走路状态不认识相机，只广播事件，这是事件系统在这里的唯一用途。谁关心谁监听，切换逻辑全部留在 `Dungeon` 里。

## 遮罩

玩家从门里走出去时会压在墙上。模板缓冲（stencil buffer）先记下"拱门这块像素不许画"，再画玩家，被挡住的像素自动消失。

```lua
love.graphics.stencil(function()
    love.graphics.rectangle('fill', -TILE_SIZE - 6,
        MAP_RENDER_OFFSET_Y + (MAP_HEIGHT / 2) * TILE_SIZE - TILE_SIZE,
        TILE_SIZE * 2 + 6, TILE_SIZE * 2)
    -- 其余三面同理
end, 'replace', 1)

love.graphics.setStencilTest('less', 1)
self.player:render()
love.graphics.setStencilTest()
```

四个矩形分别贴在四扇门上，尺寸是 38×32 或 32×38，比两格门洞各多出 6 像素，并且向外一直伸到地图之外。坐标写死在房间坐标系里，所以相机平移时矩形会跟着房间一起动。

`'replace'` 表示把矩形覆盖到的像素写成 1。测试条件 `'less', 1` 表示只有缓冲值小于 1 的像素才允许通过，也就是门洞内的 1 被挡住，其余 0 照常画。方向可能反直觉：遮的是**门洞**，因为人走进墙里那几像素时应该被拱门盖住。

| 版本    | 写入遮罩                                  | 开启测试                             |
| ------- | ----------------------------------------- | ------------------------------------ |
| LÖVE 11 | `stencil(fn, 'replace', 1)`               | `setStencilTest('less', 1)`          |
| LÖVE 12 | `setStencilState('replace', 'always', 1)` | `setStencilState('keep', 'less', 1)` |

LÖVE 12 取消了传函数的形式，写入前还要 `setColorMask(false, false, false, false)`，否则矩形会同时画到屏幕上。

调试时按 `S` 画出四个遮罩矩形；它们不参与正常渲染，只是把缓冲区的范围可视化。

## 延伸：顺序与坑

遮罩对绘制顺序极其敏感，弄错就变成整屏消失或毫无效果。

- 必须在背景、地砖、实体、门都画完之后再写遮罩，否则遮挡关系反了
- 玩家必须在 `setStencilTest` 与清空之间画，画在测试外则完全无效
- `setStencilTest()` 不带参数等于关闭测试，漏掉这一句后续所有绘制都会被裁
- 遮罩坐标处于 `Dungeon` 的 `translate` 之内，平移房间时矩形会跟着走，不必手动加相机偏移
- 模板缓冲每帧自动清空，不需要手动重置内容

另一条更简单的路是改绘制顺序：先画玩家再画门框。但门框是地图图块的一部分，拆开代价更高，遮罩反而是省事的做法。开门的触发也可以不做开关，改成"房间内敌人清空就开门"，只需在 `Room:update` 里数一遍活着的实体，再统一置 `open`。
