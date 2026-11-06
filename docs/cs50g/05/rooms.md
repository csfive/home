---
title: 房间与图块生成
description: 哈佛 CS50G Week 5 · 房间与图块生成
---

# 房间与图块生成

一间房就是一块 22×11 的图块网格，用两条循环按行列填满。填什么由坐标决定：角、边、内部各用一组编号。

## 尺寸与偏移

虚拟分辨率 384×216，格子 16 像素。地图四周各留一格墙，于是宽 22 格、高 11 格。

```lua
TILE_SIZE = 16
MAP_WIDTH = VIRTUAL_WIDTH / TILE_SIZE - 2      -- 22
MAP_HEIGHT = math.floor(VIRTUAL_HEIGHT / TILE_SIZE) - 2  -- 11
MAP_RENDER_OFFSET_X = (VIRTUAL_WIDTH - (MAP_WIDTH * TILE_SIZE)) / 2   -- 16
MAP_RENDER_OFFSET_Y = (VIRTUAL_HEIGHT - (MAP_HEIGHT * TILE_SIZE)) / 2 -- 20
```

地图只有 352×176，屏幕是 384×216，差值就是上下左右的黑边。所有坐标判断都带 `MAP_RENDER_OFFSET_*`，这样换分辨率时地图仍然居中。

| 量       | 值      | 来源               |
| -------- | ------- | ------------------ |
| 房间格数 | 22×11   | 屏幕减两格后除格子 |
| 地图像素 | 352×176 | 格数乘 16          |
| 水平黑边 | 16      | 剩余宽度的一半     |
| 垂直黑边 | 20      | 剩余高度的一半     |

## 逐格铺满

`generateWallsAndFloors` 先按行建空表，再按列塞图块。判定顺序从四个角开始，然后是四条边，最后才是地板。

```lua
for y = 1, self.height do
    table.insert(self.tiles, {})
    for x = 1, self.width do
        local id = TILE_EMPTY
        if x == 1 and y == 1 then
            id = TILE_TOP_LEFT_CORNER
        elseif x == 1 and y == self.height then
            id = TILE_BOTTOM_LEFT_CORNER
        elseif x == 1 then
            id = TILE_LEFT_WALLS[math.random(#TILE_LEFT_WALLS)]
        elseif y == 1 then
            id = TILE_TOP_WALLS[math.random(#TILE_TOP_WALLS)]
        else
            id = TILE_FLOORS[math.random(#TILE_FLOORS)]
        end
        table.insert(self.tiles[y], { id = id })
    end
end
```

角必须最先判断，否则 `x == 1` 这一支会先命中，把角画成普通墙。`tiles[y][x]` 的下标顺序是先行后列，与 `GenerateQuads` 的编号顺序一致。

`Room:init` 用 `self.width`、`self.height` 而不是直接读全局常量，循环里也只用这两个字段。这样改房间尺寸只动一处，将来做大小不一的房间也不必重写生成函数。

## 随机变体

每种地形都有多个候选编号，取 `math.random(#表)` 随机挑一个。作用纯粹是视觉：地牢地面不再是同一块砖无限平铺。

| 组     | 编号示例              | 数量 |
| ------ | --------------------- | ---- |
| 左上角 | 4                     | 1    |
| 右下角 | 24                    | 1    |
| 顶部墙 | 58、59、60            | 3    |
| 底部墙 | 79、80、81            | 3    |
| 左墙   | 77、96、115           | 3    |
| 右墙   | 78、97、116           | 3    |
| 地板   | 7–13、26–32、45–51 等 | 32   |
| 空白   | 19                    | 1    |

`TILE_EMPTY = 19` 是循环的初值，正常路径几乎走不到它，留着是为了让 `id` 永远有值。它没有任何特殊绘制逻辑，真取到时画的就是图集第 19 格。

## 图块编号

编号从 1 开始，按左到右、上到下的顺序线性增长，这是 `GenerateQuads` 切图的结果。

```lua
local sheetWidth = atlas:getWidth() / tilewidth
local sheetHeight = atlas:getHeight() / tileheight
local sheetCounter = 1
for y = 0, sheetHeight - 1 do
    for x = 0, sheetWidth - 1 do
        spritesheet[sheetCounter] = love.graphics.newQuad(
            x * tilewidth, y * tileheight, tilewidth, tileheight,
            atlas:getDimensions())
        sheetCounter = sheetCounter + 1
    end
end
```

想确认某块砖是几号，用 Pillow 写个脚本把编号画在每格上再拼回大图，比手数快得多。切图时行列是整数，图集尺寸必须是格子尺寸的整数倍，否则最后一行会被截掉。

`tilesheet.png` 是 304×208，按 16 像素切出 19 列 13 行，编号 1 到 247，这也是为什么墙的编号能到 116。

- `math.random(#表)` 没有权重，每种变体被选中的概率相同
- 想让某块砖更常见，把它的编号在表里重复写几次

索引从 1 开始、像素从 0 开始，绘制与反查的方向正好相反。

```lua
-- 绘制：先减索引，再乘格子
love.graphics.draw(gTextures['tiles'], gFrames['tiles'][tile.id],
    (x - 1) * TILE_SIZE + MAP_RENDER_OFFSET_X,
    (y - 1) * TILE_SIZE + MAP_RENDER_OFFSET_Y)

-- 反查：先减偏移，再除格子，最后加一
local tx = math.floor((px - MAP_RENDER_OFFSET_X) / TILE_SIZE) + 1
```

漏掉 `floor` 会让边界上的像素落进下一格，表现为"贴着墙却检测到地板"。Lua 的 `math.floor` 对负数向下取整，所以地图外会得到 0 或负索引，取表前要判空。

## 绘制顺序

`Room:render` 的次序是地砖、门、物件、实体，最后才是玩家。

- 地砖铺底，覆盖整块屏幕
- 门骑在墙线上，必须画在地砖之后才盖得住
- 物件（开关）与实体互相独立，先物件后实体
- 实体之间不按 `y` 排序，所以前后遮挡是错的，走到怪物身后仍会盖住它
- 玩家最后画，并且被包在模板测试里

排序缺失是这类俯视 demo 的通病。同一行内的先后固定，跨行的遮挡则完全取决于列表顺序。真要做到正确遮挡，需要把所有可绘制对象按碰撞盒底边 `y + height` 排序后统一绘制，代价是玩家也要混进同一个列表。

## 延伸：为什么不做图块碰撞

讲义里所有房间结构完全一致，墙永远在同样的格子，于是直接钳制坐标就够了，省掉逐格查询。

但一旦要放不规则墙体或可破坏的砖，就得改成基于位置的查询：

```lua
function Room:tileAt(px, py)
    local tx = math.floor((px - self.renderOffsetX) / TILE_SIZE) + 1
    local ty = math.floor((py - self.renderOffsetY) / TILE_SIZE) + 1
    return self.tiles[ty] and self.tiles[ty][tx]
end
```

这样每次移动要查四个角，成本仍然很低，代价是地图数据从常量变成需要维护的状态。讲义选择边界，是为了把注意力留给房间切换和战斗；真要做大小不一的房间，第一件事就是换掉这套边界判断。
