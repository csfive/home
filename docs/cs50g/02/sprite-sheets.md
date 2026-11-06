---
title: 精灵表与 Quad
description: 哈佛 CS50G Week 2 · 精灵表与 Quad
---

# 精灵表与 Quad

Breakout 需要几十种砖块、七种球、十六种挡板，逐个存图片不现实，图集把选择变成算下标。

## 图集与 quad

一张图集就是一张大纹理，里面按格子排好所有小图。`newQuad` 只记下其中一块的左上角和宽高，绘制时把这块的 UV 交给显卡。

这样做的好处是不用换纹理，几十种砖块共享同一次上传。quad 和 image 的区别在于所有权：image 是整张纹理，quad 只是引用它的矩形窗口，同一个 quad 可以画任意多次。

```lua
local quad = love.graphics.newQuad(x, y, width, height, atlas:getDimensions())
love.graphics.draw(atlas, quad, screenX, screenY)
```

| 参数                    | 含义                    |
| ----------------------- | ----------------------- |
| `x`、`y`                | 图集内左上角            |
| `width`、`height`       | 取样区域                |
| `atlas:getDimensions()` | 图集总宽高，用来换算 UV |

总尺寸也可以拆成 `sw, sh` 两个数，两种写法等价。漏掉它，`newQuad` 会直接报参数错误，不会猜一个默认值。

所有 quad 在 `love.load` 里一次生成，之后只读。它们不持有纹理副本，缓存几百个也不会多占显存。

## 均匀切分

`GenerateQuads` 假设所有格子一样大，先算出列数和行数，再双重循环。外层走 Y、内层走 X，编号因此是逐行递增的。

```lua
function GenerateQuads(atlas, tilewidth, tileheight)
    local sheetWidth = atlas:getWidth() / tilewidth
    local sheetHeight = atlas:getHeight() / tileheight
    local quads, counter = {}, 1

    for y = 0, sheetHeight - 1 do
        for x = 0, sheetWidth - 1 do
            quads[counter] = love.graphics.newQuad(
                x * tilewidth, y * tileheight,
                tilewidth, tileheight, atlas:getDimensions())
            counter = counter + 1
        end
    end

    return quads
end
```

计数器从 1 开始，因为 Lua 数组下标从 1 开始；`x`、`y` 从 0 开始，因为像素坐标从 0 开始。第 `r` 行第 `c` 列对应 `r * sheetWidth + c + 1`。

除法结果带不带小数点不影响循环次数。图集边长必须是格子尺寸的整数倍，差一个像素，最后一列切出半格，后面的编号全偏一格。

## 非均匀图集

挡板有 32、64、96、128 四档宽度，没法用统一的格子。`GenerateQuadsPaddles` 从 `(0, 64)` 起手写四块，然后换下一行颜色，重复四次。

```lua
quads[counter] = love.graphics.newQuad(x, y, 32, 16, atlas:getDimensions())
counter = counter + 1
quads[counter] = love.graphics.newQuad(x + 32, y, 64, 16, atlas:getDimensions())
counter = counter + 1
quads[counter] = love.graphics.newQuad(x + 96, y, 96, 16, atlas:getDimensions())
counter = counter + 1
quads[counter] = love.graphics.newQuad(x, y + 16, 128, 16, atlas:getDimensions())
counter = counter + 1
```

前三档在 x 方向排满一行，128 宽的那块放不下，只能换到下一行，所以它的 `y` 是 `y + 16`。每写完一组，`x` 归零、`y` 加 32，四个颜色行依次往下。

| 表                | 来源                     | 数量 |
| ----------------- | ------------------------ | ---- |
| `gFrames.bricks`  | 32×16 均匀切后取前 21 个 | 21   |
| `gFrames.paddles` | `GenerateQuadsPaddles`   | 16   |
| `gFrames.balls`   | `GenerateQuadsBalls`     | 7    |
| `gFrames.hearts`  | 10×9 均匀切              | 2    |
| `gFrames.arrows`  | 24×24 均匀切             | 2    |

| 区域 | 起点   | 尺寸         |
| ---- | ------ | ------------ |
| 砖块 | 0、0   | 32×16        |
| 球   | 96、48 | 8×8          |
| 挡板 | 0、64  | 32 到 128 宽 |

同一张图集里可以混用两种切法，quad 只是数据，来源不重要。也可以在运行时临时换 quad，皮肤和 tier 就是这样切换外观的。

砖块 32×16，球 8×8，心和箭头另有尺寸。砖块表切出 21 个，索引公式只用到前 20 个。不确定图集内容时，用看图工具量出像素范围再写 `newQuad`，比猜下标可靠。

## 索引公式

两个公式都是把二维的「第几种颜色、第几档」压成一维下标。砖块的 tier 变化最快，所以乘 4 之后加 tier；挡板的 skin 变化最慢，所以乘 4 之后加在 skin 一侧。

```lua
local brickIndex = 1 + (color - 1) * 4 + tier
local paddleIndex = size + 4 * (skin - 1)
```

| color | tier | index |
| ----- | ---- | ----- |
| 1     | 0    | 1     |
| 1     | 3    | 4     |
| 5     | 0    | 17    |
| 5     | 3    | 20    |

开头那个 `+1` 是 Lua 的 1 基下标，挡板公式省掉它是因为 `size` 从 1 开始。所有 quad 表都是普通数组，`#` 能拿到数量。

反推也成立：已知下标时，砖块颜色是 `math.floor((index - 1) / 4) + 1`，tier 是 `(index - 1) % 4`。调试时用这两行核对渲染出来的砖块，比盯着图集数格子快。

## 过滤与边缘渗色

`setDefaultFilter('nearest', 'nearest')` 必须在建纹理之前调用。线性过滤在放大时会把相邻精灵的像素混进来，图集边缘出现一圈彩色。

即使设了 `nearest`，浮点坐标仍可能落在两格之间，把绘制坐标取整能避免抖动。更根本的问题是 UV 采样会跨过格子边界，工业图集通常给每格留 1 像素透明边，课程图集靠最近邻和整数坐标硬扛。

## 自制图集

自己排图集时，先按最大格子的宽度对齐，再按行组织，方便手算坐标。所有格子贴边排布省空间，但更容易渗色。

用 `GenerateQuads` 之前先确认图集能被格子整除；不能整除的部分宁可留空，也不要让最后一列挤进别的图案。

- 每格固定宽高
- 同类图连续排
- 需要留边时给每格加透明边

图集越大，加载越慢，但绘制调用不变；按场景拆成多张图集是另一种取舍。超过 2048 像素的纹理在旧显卡上可能直接失败，排图集前先确认目标平台的上限。
