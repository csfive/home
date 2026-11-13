---
title: Match 3
description: 哈佛 CS50G Week 3 主题清单
---

# Match 3

[Week 3 · Match 3](https://cs50.harvard.edu/games/weeks/3/ '哈佛 CS50G Week 3：视频、讲义、源码和项目')

[课后练习答案](https://github.com/csfive/CS50G/tree/main/03-match3 '非官方，仅供参考')

## [精灵表与 Quad](/cs50g/03/quads)

- 精灵表与 texture atlas 是同一回事
- `love.graphics.newQuad(x, y, w, h, 整图宽高)`
- 最后两个参数是整图尺寸，不是这块的尺寸
- 本作所有 tile 统一 32×32
- `GenerateQuads` 用行列双层循环切图
- `texture:getWidth()` 除以 tile 宽得列数
- 随机 ID 必须缓存进 table，每帧重掷会闪成噪声
- `gFrames['tiles'][color][variety]` 按颜色分表
- 18 种颜色 × 6 种花样 = 108 个 quad
- 图集共 9 行 × 12 列
- 先画偏移 2 像素的深色阴影再画本体
- `setDefaultFilter('nearest', 'nearest')` 保住像素边

## [棋盘与 Tile](/cs50g/03/board)

- `Board:init(x, y)` 记棋盘左上角像素位置
- `self.tiles[y][x]` 是二维数组，行优先，`tiles[1]` 是最上面一行
- `Tile:init(x, y, color, variety)`
- `gridX`/`gridY` 是 1–8 的逻辑坐标，`x`/`y` 是像素坐标
- 像素坐标由 `(gridX - 1) * 32` 推出
- 逻辑判断只读 `gridX`/`gridY`，动画只改 `x`/`y`
- 棋盘 8×8，放在 `VIRTUAL_WIDTH - 272`
- 开局 `while self:calculateMatches() do` 重建，保证没有现成三连
- `Board:render` 遍历 64 格调 `Tile:render`
- 空格用 `nil` 表示

## [计时器与补间](/cs50g/03/timers)

- 手写计时器累加 `dt`，超阈值后取模
- `Timer = require 'lib.knife.timer'`
- `Timer.every(interval, callback)` 周期执行
- `Timer.after(delay, callback)` 只执行一次
- `Timer.tween(duration, definition)` 平滑插值
- `Timer.update(dt)` 每帧必须调用
- 一帧跨过多个间隔时用 `while` 补发
- 补间通式 `base + (dest - base) * t / d`
- 定义表 `[target] = { x = endX }`
- `:finish(fn)` / `:ease(fn)` / `:limit(n)`
- `:remove()` 拆掉单个计时器，`Timer.clear()` 清空默认组
- 标题配色计时器离开前 `:remove()`

## [交换与匹配](/cs50g/03/matching)

- 光标 `boardHighlightX/Y` 从 0 开始
- 选中框用 `line` 矩形画
- `math.max(0, ...)` 与 `math.min(7, ...)` 夹边界
- 第一次 Enter 选中 `highlightedTile`，再按同一格取消
- 曼哈顿距离大于 1 判为不相邻
- 先换 `gridX`/`gridY` 再写回 `tiles`
- 像素位置交给 `Timer.tween(0.1, ...)`
- 补间结束才调 `calculateMatches`
- 只判横竖，不判对角线
- 逐行追踪 `colorToMatch` 与 `matchNum`，换色时回溯收集整组
- `if x >= 7 then break` 剪掉尾两格，行尾单独再查一次
- 再按列扫一遍就是竖向匹配
- 返回 `false` 而不是空表
- 十字形会同时进两组

## [消除与连锁掉落](/cs50g/03/cascade)

- `removeMatches` 把命中格置 `nil`
- `getFallingTiles` 逐列从底往上扫
- `space` 标记是否已遇到空位，`spaceY` 记最下面那个空位
- 上方 tile 下移并改写 `gridY`
- 下移后 `y = spaceY` 回头重扫
- 顶部剩下的空洞生成新 tile，起点 `y = -32`
- 函数返回 `tweens` 表而不是自己动
- 旧块下落与新块入场同一张补间表
- `Timer.tween(0.25, tilesToFall)` 的 `:finish` 里递归 `calculateMatches`
- `canInput` 在动画期间为 `false`

## [计分与关卡](/cs50g/03/scoring)

- 一组得分 `#match * 50`
- 十字形两组各算一次
- `self.score` 在 `enter` 里从 `params` 继承
- `scoreGoal = level * 1.25 * 1000`
- 达标切 `begin-game` 并 `level + 1`
- `timer = 60` 在 `init` 里给，`Timer.every(1, ...)` 每秒减一
- 剩 5 秒起播 `clock` 提示音
- 归零切 `game-over` 并带走 `score`
- 切状态前 `Timer.clear()`
- `params.score or 0` 兜默认值

## [状态机与过渡](/cs50g/03/states)

- 状态钩子 `enter`/`update`/`render`/`exit`
- `states` 表存返回实例的工厂函数
- `change` 依次 `exit`、新建、`enter`
- `assert` 拦住拼错的状态名，`empty` 兜住第一次切换
- 四条主线 `start`、`begin-game`、`play`、`game-over`
- 全屏白矩形铺在最上层，`transitionAlpha` 从 0 补到 1
- `:finish` 里才真正换状态，新状态从 alpha 1 淡回 0
- `BeginGameState` 的关卡字三段位移，`Timer.after(1, ...)` 做中间停顿
- `board` 经 `params` 传给 `play` 复用
- `Timer.clear()` 必须在 `change` 之前

## [像素调色板](/cs50g/03/palette)

- Dawnbringer 32 是 32 色像素调色板
- 抖动 dithering 交替像素造中间色
- 限定调色板保证色彩协调，可选颜色少就少犯错
- NES 主调色板 54 色，每块用 4 色一组
- SNES 用 15 位色，共 32768 色
- 调色板交换能换配色不换贴图
- 本作 18 色 × 6 花样就是变体堆叠
- `setColor` 收 0–1 浮点，代码里写 `217/255` 便于对照十六进制
- `setColor` 是全局状态，画完必须改回来

## [容易混淆的问题](/cs50g/03/pitfalls)

- 网格下标 1 起，像素坐标 0 起
- `gridX`/`gridY` 管逻辑，`x`/`y` 管动画
- 棋盘像素要再加 240 和 16 才是屏幕位置
- Quad 尺寸是裁剪窗口，不是绘制缩放
- 数组先换位，像素后补间
- `Timer.every` 周期触发，`Timer.after` 只触发一次
- `:finish` 跟着本段结束，`Timer.after` 从创建时起算
- `Timer.clear()` 放在 `change` 之前
- `false` 是「没匹配」，空表是「匹配了但长度为零」
