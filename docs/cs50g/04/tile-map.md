---
title: 瓦片地图
description: 哈佛 CS50G Week 4 · 瓦片地图
---

# 瓦片地图

一个平台关卡可以压缩成一张整数表：每个格子记录这个位置画哪块图、能不能站人。

## 数据表示

每个格子只存一个 ID，ID 是图集里 quad 的下标。表按 `tiles[y][x]` 组织，外层是行、内层是列，下标都从 1 开始。

```lua
local tiles = {}

for y = 1, mapHeight do
    tiles[y] = {}
    for x = 1, mapWidth do
        tiles[y][x] = { id = y < 7 and SKY or GROUND }
    end
end
```

| 概念    | 作用                                        |
| ------- | ------------------------------------------- |
| `id`    | 指向 quad 的整数，本讲 `5` 是空、`3` 是地面 |
| quad    | 图集上的一块矩形，`newQuad` 的产物          |
| tile    | 世界里的一个格子，宽高都是 `TILE_SIZE`      |
| tileset | 5×4 个 quad 组成的画风分组                  |

`SKY` 和 `GROUND` 只是数字常量，让代码可读；决定碰撞的是另一个白名单 `COLLIDABLE_TILES`。表里只存 ID 也能跑，但每格再带 `topper` 和 `tileset` 后，绘制时不必回头查全局配置。tile 表没有空洞，ID 越界会画错图。

生成一张地图时检查这几项：

- 每行长度一致，没有空洞
- 行数乘列数等于地图尺寸
- 每个 `id` 都在 quad 范围内
- 地面连续，没有悬空块
- 深渊两侧都有落脚点

## 切图与绘制

图集是一张 PNG，里面按网格排好所有地块。`GenerateQuads` 用双层循环算出每一块的矩形，返回从 1 开始编号的数组。quad 在启动时建好一次。

```lua
local quad = love.graphics.newQuad(
    x * TILE_SIZE, y * TILE_SIZE,
    TILE_SIZE, TILE_SIZE,
    tilesheet:getDimensions())
```

最后一个参数必须是图集的完整尺寸，传成单块尺寸会让 LÖVE 采到错误区域。同一张图集可以切出上百个 quad，显存只占一份；quad 只记录区域，不复制像素。

逐格绘制，坐标是格号减一再乘 `TILE_SIZE`。不减一，整张地图会向右下偏移一格。带 topper 的格子再叠一张同样大小的图，坐标不变，只换图集；绘制前先取整坐标。

```lua
for y = 1, mapHeight do
    for x = 1, mapWidth do
        local tile = tiles[y][x]
        love.graphics.draw(tilesheet, quads[tile.id],
            (x - 1) * TILE_SIZE, (y - 1) * TILE_SIZE)
    end
end
```

## 像素与格子互转

碰撞和生成都用像素，查表要除回 `TILE_SIZE`。`pointToTile` 先做边界检查，出了地图返回 `nil`。

```lua
function TileMap:pointToTile(x, y)
    if x < 0 or x > self.width * TILE_SIZE
        or y < 0 or y > self.height * TILE_SIZE then
        return nil
    end
    return self.tiles[math.floor(y / TILE_SIZE) + 1]
                  [math.floor(x / TILE_SIZE) + 1]
end
```

`math.floor` 不能省：`y / 16` 是小数，直接当下标会报错。加一是因为表从 1 开始，而像素从 0 开始；这一步差一是平台游戏最常见的索引错误，格子号从 1 开始。

调用方必须判空。地图右边缘外没有格子，直接 `tile:collidable()` 会在角色走出关卡时崩溃。地图宽度 100 时，最大有效 `x` 是 1599，1600 已经在表外；世界坐标与屏幕坐标差一个相机偏移。

## 裁剪与批量绘制

主线代码每帧遍历整张地图。100×10 的关卡就是 1000 次 `love.graphics.draw`，桌面端看不出问题，但关卡再大或换成手机就会拖慢帧率。关卡越大差距越明显。

视野只有 16×9 个格子，可以先算可见列范围，只遍历这一段：

```lua
local firstCol = math.max(1, math.floor(camX / TILE_SIZE) + 1)
local lastCol = math.min(mapWidth,
    math.floor((camX + VIRTUAL_WIDTH) / TILE_SIZE) + 1)
```

更彻底的做法是把整张地图烘进 `love.graphics.newSpriteBatch(tilesheet, maxSprites)`，用 `batch:add(quad, x, y)` 累积，最后一次提交。代价是地形变化时要重建批处理，动态关卡不适合。列的起止都要夹在地图范围内，裁剪只减少绘制调用，不影响碰撞。

## 图层与绘制顺序

背景、地块、装饰、对象、实体、UI 按固定顺序画。后画的盖住先画的，顺序错了会出现角色被地面挡住。

| 顺序 | 内容      | 受相机影响   |
| ---- | --------- | ------------ |
| 1    | 背景      | 只按视差偏移 |
| 2    | 地块      | 是           |
| 3    | topper    | 是           |
| 4    | 游戏对象  | 是           |
| 5    | 实体      | 是           |
| 6    | 分数等 UI | 否           |

UI 必须画在 `translate` 之外并使用屏幕坐标，否则会跟着世界滚动。topper 紧跟地块画，而不是统一留到最后，是为了让后面的对象和实体能正常盖住它。`topper` 为假就不要画，否则地下几层会露出装饰。

## ID 与碰撞白名单

碰撞不看图长什么样，只看 ID 是否在 `COLLIDABLE_TILES` 里。同一张图完全可以有两个 ID，一个可站、一个只装饰。

```lua
COLLIDABLE_TILES = { TILE_ID_GROUND }
```

新增地形时，只改图集不改白名单，角色会直接穿过去。反过来，把装饰 ID 加进白名单，会出现看不见的墙。

这也意味着视觉和玩法是两套映射：换皮只换图集和 tileset 编号，ID 与白名单不动，关卡数据完全复用。本讲把 tileset 单独存在 tile 上，就是为了这个。tile 表用整数键，遍历顺序稳定，白名单是唯一判定。
