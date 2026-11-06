---
title: 地图与瓦片
description: 哈佛 CS50G Week 7 · 地图与瓦片
---

# 地图与瓦片

地图不是一张大图，而是一堆 16×16 的小图按网格拼起来，每一格只记一个编号。

## Tile 与 TileMap

`Tile(x, y, id)` 保存三个数：网格坐标和贴图编号。它不存像素坐标，也不存纹理对象，渲染时才换算：

```lua
function Tile:render()
    if self.id ~= TILE_IDS['empty'] then
        love.graphics.draw(gTextures['tiles'], gFrames['tiles'][self.id],
            (self.x - 1) * TILE_SIZE, (self.y - 1) * TILE_SIZE)
    end
end
```

减 1 是因为网格坐标从 1 开始，像素坐标从 0 开始。乘法把格数换成像素，`TILE_SIZE` 一处定义、处处使用。

`TileMap(tileWidth, tileHeight)` 建一张 `tiles[y][x]` 的二维表。注意下标顺序是先行后列，越界时 `tiles[y]` 先返回 `nil`，报错信息会指向 `[x]`，容易看错行。

```lua
for y = 1, self.tileHeight do
    table.insert(self.tiles, {})
    for x = 1, self.tileWidth do
        table.insert(self.tiles[y], Tile(x, y, id))
    end
end
```

`id` 是瓦片在贴图集里的序号，不是坐标。贴图集改动后序号会整体错位，所以永远通过 `TILE_IDS` 查名字，别在逻辑里写数字。

## 分层

课程的地图有两层：`baseLayer` 铺满草地，`grassLayer` 只在高草区放高草，其余位置放 `empty`。

| 层           | 内容             | 渲染顺序 | 作用                 |
| ------------ | ---------------- | -------- | -------------------- |
| `baseLayer`  | 草地变体，随机取 | 先       | 保证任何位置都有底色 |
| `grassLayer` | 高草或空         | 后       | 标记遇敌区，叠加细节 |
| 未来加层     | 树木、屋檐       | 最后     | 遮挡角色，做纵深     |

高草贴图中间是透明的，只有边缘有叶片。如果只画高草、底下没有草地，透出来的就是背景色，看着像破洞。

层数不受限。想让角色从拱门下穿过，就把拱门单独放一层并画在角色之后；想让它踩在桥面上，就画在角色之前。渲染顺序就是深度，生成高草时用的也是行号判断：

```lua
local id = y > 10 and TILE_IDS['tall-grass'] or TILE_IDS['empty']
```

`and/or` 在这里是安全的，因为两个分支都是数字，不会是 `nil` 或 `false`。

## 渲染循环

每帧遍历整张地图是大头开销。50×50 就是 2500 次查表加 2500 次 `draw`，虚拟分辨率只有 432×243，绝大多数根本看不见。

```lua
function Level:render()
    for y = 1, self.tileHeight do
        for x = 1, self.tileWidth do
            self.baseLayer.tiles[y][x]:render()
        end
    end

    for y = 1, self.tileHeight do
        for x = 1, self.tileWidth do
            self.grassLayer.tiles[y][x]:render()
        end
    end
end
```

按层遍历，而不是按格把两层一起画：一层画完再画下一层，整张地图的深度关系才一致。想让角色站在草里时被草叶挡住，就把角色绘制插在两个循环之间，而不是简单画在最上面。

工程量变大后可以按视口裁剪：只遍历屏幕覆盖的那几列。课程版本是 50×50 全量遍历，性能足够，但它是最容易先优化的地方。

## 用编号做地形判断

游戏逻辑不比对贴图、不比对颜色，只比 `id`：

```lua
if self.level.grassLayer.tiles[y][x].id == TILE_IDS['tall-grass'] then
    -- 这一步踩进了高草
end
```

这样换美术资源时逻辑不用改。反过来，判断写在地形层还是实体层要统一：如果碰撞、遇敌、传送各查一层，改地图就得改三处。

`TILE_IDS` 里每个地形的值类型并不一致：`grass` 存的是一个编号数组，随机取一个当变体；`tall-grass` 和 `empty` 直接是单个数字。取变体时写 `math.random(#TILE_IDS['grass'])`，取高草时直接比较，两种写法不能互换。如果要做碰撞，加一个判断函数比在每处比较 `id` 更稳：

```lua
function Level:isPassable(x, y)
    return x >= 1 and x <= 24 and y >= 1 and y <= 13
        and self.grassLayer.tiles[y][x].id ~= TILE_IDS['wall']
end
```

边界与地形写在同一个地方，移动、NPC 巡逻、传送都能复用，也不会出现某处漏判。

## 数据来源

课程用循环随机生成，好处是不需要素材。真实项目通常把地图存成文本，一个字符一格：

```lua
local rows = {
    '################',
    '#..............#',
    '#....gggg......#',
    '################',
}

for y, row in ipairs(rows) do
    for x = 1, #row do
        local ch = row:sub(x, x)
        local id = ch == '#' and TILE_IDS['wall']
            or ch == 'g' and TILE_IDS['tall-grass']
            or TILE_IDS['grass'][1]
        table.insert(self.tiles[y], Tile(x, y, id))
    end
end
```

字符地图能用编辑器改，也能 diff，比随机生成更适合关卡设计。规模大到几百格以上再考虑 Tiled 这类工具导出。瓦片的另一个好处是显存：一张 50×50 格、每格 16 像素的地图如果画成整图，是 800×800 的纹理；拆成瓦片集后只需要一张小图，无论地图多大都只有这一份。代价是每帧要发几千次 `draw`，所以大项目最后都会用批量绘制或把区块预渲染成纹理。

最后是一个维护上的坑：地图尺寸和移动边界写在两个地方。`Level` 按 50×50 生成，而 `EntityWalkState` 的边界判断写死了 `toX > 24` 与 `toY > 13`。改地图大小时忘了同步，角色会提前撞上空气墙，或者走进没画瓦片的空白区。坐标换算也只在一个地方减 1，忘了减会让整张地图偏移一格，现象像贴图错位而不是坐标错误。
