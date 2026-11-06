---
title: 精灵表与 Quad
description: 哈佛 CS50G Week 3 · 精灵表与 Quad
---

# 精灵表与 Quad

三消的每个方块都来自同一张 `match3.png`，Quad 决定这一帧画其中的哪一块。

## 图集与 Quad 窗口

精灵表（sprite sheet，也叫 texture atlas）把几十张小图拼进一张 PNG。显卡一次绑定纹理就能画完整个棋盘，省掉上百次贴图切换。`love.graphics.newImage` 负责把整张图读进显存，只读一次。

Quad 描述「从原图的哪个矩形里取像素」，本身不含像素数据。它记住起点、宽高和原图尺寸，绘制时按这张窗口裁剪。

```lua
local texture = love.graphics.newImage('match3.png')
local quad = love.graphics.newQuad(0, 0, 32, 32, texture:getDimensions())

love.graphics.draw(texture, quad, 100, 50)
```

`newQuad` 最后两个参数是整张精灵表的宽高，不是这块区域的尺寸。`getDimensions()` 一次返回宽高两个值，正好填满这两位；传错不报错，只会把一片错误的像素拉伸出来。

| 参数     | 含义                   |
| -------- | ---------------------- |
| `x` `y`  | 窗口左上角在原图的位置 |
| `width`  | 窗口宽，本作固定 32    |
| `height` | 窗口高，本作固定 32    |
| 图尺寸   | 整张精灵表的宽高       |

## 批量切图

手写 108 个 `newQuad` 不现实。图集里所有格子等大时，双层循环就能切完，编号按行优先递增。

```lua
function GenerateQuads(texture, width, height)
    local quads = {}
    local counter = 1

    for y = 0, texture:getHeight() / height - 1 do
        for x = 0, texture:getWidth() / width - 1 do
            quads[counter] = love.graphics.newQuad(x * width, y * height,
                width, height, texture:getDimensions())
            counter = counter + 1
        end
    end

    return quads
end
```

下标即 ID：左上角是 1，从左到右、从上到下递增。这个约定让「颜色」变成可以比较的整数，后面的匹配判定全靠它。`#quads` 给出总数，`math.random(#quads)` 就能随机取一块。

## 缓存 tile ID

最初几版 demo 在 `love.draw` 里直接 `math.random(#quads)`。每帧重掷一次，屏幕就是一片噪点：画面没有可延续的状态，也无法判断「这一格上一帧是什么」。

要做出棋盘，就得把随机结果存下来。一维数组换成二维表，`tiles[y][x]` 存的是 ID 而不是 Quad 引用。

```lua
function refreshTiles()
    tiles = {}

    for y = 1, VIRTUAL_HEIGHT / 32 do
        tiles[y] = {}
        for x = 1, VIRTUAL_WIDTH / 32 do
            tiles[y][x] = math.random(#quads)
        end
    end
end
```

绘制时再用 ID 反查 Quad：`love.graphics.draw(texture, quads[tiles[y][x]], ...)`。渲染循环里没有随机数，画面才稳定。存 ID 而不是存 Quad，还顺带让棋盘可以用 `print_r` 打印、存档、比较。

## 本作的图集布局

正式版图集不是单一色块，而是 18 种颜色、每种 6 个花样。切图函数因此多了一层：每行放两组、每组 6 个，`counter` 每行加 2。

```lua
gFrames = {
    ['tiles'] = GenerateTileQuads(gTextures['main'])
}

-- 取第 7 色第 3 个花样
gFrames['tiles'][7][3]
```

9 行 × 2 组 = 18 个颜色表，每个表里 6 个 Quad。`Tile` 同时存 `color` 与 `variety`，渲染时两级索引。匹配只看 `color`：同色不同花样算一次命中，画面因此比纯色块耐看。

`Tile:render` 画两遍同一块 Quad。第一遍 `setColor` 成深靛色并偏移 2 像素，得到投影；第二遍恢复白色叠在上面。这个假阴影不需要额外美术资源，代价是绘制调用翻倍——64 格变成 128 次。

| 造阴影的方式  | 做法                | 代价           |
| ------------- | ------------------- | -------------- |
| 运行时画两遍  | 同 Quad 偏移后重绘  | 绘制调用翻倍   |
| 烘焙进图集    | 每格留 2 像素透明边 | 格子不再等大   |
| 灰度图 + tint | 一份贴图换 18 种色  | 只能得到单色相 |

灰度加 tint 最省资源，但方块内部做不出高光和描边的多色细节，像素画一般不接受这种妥协。烘焙进图集也能省一半绘制，代价是每格留出透明边，切图循环得跟着改，本作棋盘只有 64 格，没这个必要。

全局滤镜在加载任何图片之前设成 `nearest`，否则默认的线性插值会把 32×32 的像素边糊成灰色。`setDefaultFilter` 只影响之后创建的图片，顺序错了就得重启游戏才看得到效果。

## 切图的常见错误

- 最后两个参数填成 `32, 32`：Quad 照建，画出来是一块被拉伸的错位区域
- 图集里格子不等大：批量循环失效，只能手工写每格的 `newQuad`
- 循环上限用 `sheetHeight` 而不是 `sheetHeight - 1`，多切出一圈越界窗口
- 图集改了行列数，`GenerateTileQuads` 里的 `9` 和 `2` 没跟着改
- 图片路径大小写与文件名不一致，在 macOS 上正常，到 Linux 上直接报错
- 以为 Quad 占显存：它只是一张坐标表，随便建几百个也不心疼

图集比一堆散图快，是因为绘制可以合批：同一张纹理、同一个混合模式、连续调用的 `draw` 会被引擎攒成一次提交。一旦中间插进另一张图，批次就断了。棋盘和背景分属两张纹理，所以每帧的绘制至少会断一次。
