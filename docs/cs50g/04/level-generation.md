---
title: 关卡生成
description: 哈佛 CS50G Week 4 · 关卡生成
---

# 关卡生成

关卡不是手工摆的，而是按列跑一段随机规则，把地形写进 tile 表。

## 按列生成

先建一张空表，再逐列决定这一列有没有地面。按列写比按行写更贴近「这一列是不是深渊」的判断；每列独立生成。

```lua
for x = 1, width do
    for y = 1, 6 do
        tiles[y][x] = Tile(x, y, TILE_ID_EMPTY, nil, tileset, topperset)
    end

    if math.random(7) == 1 then
        goto continue          -- 整列留空，形成深渊
    end

    for y = 7, height do
        tiles[y][x] = Tile(x, y, TILE_ID_GROUND,
            y == 7 and topper or nil, tileset, topperset)
    end

    ::continue::
end
```

`goto continue` 是 Lua 的 continue 写法。跳过的列保持天空，深渊就自然出现，不需要额外的删除逻辑。

外层循环是列，内层是行，和渲染的遍历顺序相反。地图宽高都用格数，不是像素。每列的随机调用次数固定，结果才可复现。

## 地形规则

| 地形 | 概率 | 写法              |
| ---- | ---- | ----------------- |
| 深渊 | 1/7  | 整列跳过          |
| 柱子 | 1/8  | 第 5、6 行填地面  |
| 砖块 | 1/10 | 生成 `GameObject` |
| 灌木 | 1/8  | 仅装饰，不碰撞    |

概率都用 `math.random(n) == 1`，每列独立判定。独立判定会偶发连续深坑，玩家可能遇到无解段落；正式项目要加「两个坑之间至少留几列」的约束。

地形只由列号和随机数决定，同一列不会出现两种地面高度。几种元素的效果：

- 深渊列没有地面
- 柱子顶行带 topper
- 砖块只顶一次
- 灌木不进入碰撞

连续两个坑的概率约 1/49，看起来低，一百列里仍会出现。柱子生成时会把第 5、6 行改成地面，并把第 7 行的 `topper` 置空，否则柱子和地面之间会多出一条装饰线。

## 图集与 topper

地块图集被切成 5×4 的组，每组是一套画风；topper 图集同样切组，绘制时叠在同一格上。每组固定 5 列 4 行。

```lua
tilesets = GenerateTileSets(quads, TILE_SETS_WIDE, TILE_SETS_TALL, 5, 4)
```

整关共用一组 `tileset` 和 `topperset`，生成时各随机一次。组号存在每个 `Tile` 上，渲染时查 `tilesets[tileset][id]`。

topper 只影响外观，不参与 `collidable` 判断。它让同一份地形看起来像草地、雪地或糖果世界，换主题只换图集，不动关卡数据。topper 图案必须和地块对齐。

## 打包成关卡

生成函数同时产出 tile 表、实体数组和游戏对象数组，最后装进 `GameLevel`。生成结果包含三个部分。

```lua
function LevelMaker.generate(width, height)
    -- ... 逐列生成 ...
    local map = TileMap(width, height)
    map.tiles = tiles

    return GameLevel(entities, objects, map)
end
```

`PlayState` 调用 `LevelMaker.generate(100, 10)`，拿到关卡后把 `map` 和 `level` 回填给玩家，实体才能查地形和拾取道具。地图一次性生成，换关卡就重跑一次。

这个分界让关卡数据可以单独测试：换一个生成器，敌人逻辑不用动。`GameLevel` 同时是容器和更新入口。生成器不读取玩家状态。

## 实体落位

敌人不在 `LevelMaker` 里生成，而是在 `PlayState` 拿到地图后按列扫描：找到该列第一个地面格，再掷一次 1/20 的骰子。扫描从上往下，遇到地面就停。

```lua
for y = 1, mapHeight do
    if tiles[y][x].id == TILE_ID_GROUND then
        if math.random(20) == 1 then
            -- 在 x、(y - 2) * TILE_SIZE 处生成蜗牛
        end
        break
    end
end
```

`y - 2` 不是因为敌人有两格高，而是行号从 1 开始：地面格在第 `y` 行，它的上边缘是 `(y - 1) * TILE_SIZE`，敌人高 16，所以左上角在 `(y - 2) * TILE_SIZE`。

地形先生成，敌人才有地面可站。某列如果是深渊，扫描不会命中地面格，这一列自然没有敌人；敌人尺寸与地块一致，落位才不会半格悬空。生成时没有再检查该格是否被占用。

## 可通关性与调试

按 60 像素/秒的水平速度和 0.67 秒滞空计算，一次跳跃约前进 40 像素，也就是 2.5 格。单列宽（16 像素）的坑稳过，两列宽（32 像素）要贴边起跳，三列宽必掉。关卡长度 100 列。

随机生成容易越过这个上限。连续坑是主要风险，补法是记录上一列是否为坑，强制间隔；或生成后从起点向右扫一遍，遇到超过阈值的坑就填一格。

生成结果是纯数据，可以先用 ASCII 打印出来检查：地面写 `#`，天空写 `.`，直接看连通性，不用启动游戏。随机调用的顺序也要留意，每多一次 `math.random`，后面所有列的地形都会变。高度 10 格比一屏多一行。

- 先跑固定种子
- 打印整张地图
- 量最宽的坑
- 再放敌人
- 最后调概率
