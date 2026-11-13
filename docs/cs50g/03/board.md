---
title: 棋盘与 Tile
description: 哈佛 CS50G Week 3 · 棋盘与 Tile
---

# 棋盘与 Tile

棋盘是 64 个 `Tile` 的二维表，每个 `Tile` 同时持有两套坐标：一套给逻辑，一套给画面。

## 两层坐标

匹配、相邻判断、掉落后的落位全用网格坐标；补间与绘制全用像素坐标。两者只在创建 `Tile` 时同步一次。

| 字段            | 取值              | 谁在读           | 谁在写        |
| --------------- | ----------------- | ---------------- | ------------- |
| `gridX` `gridY` | 1–8 的整数        | 匹配、相邻、掉落 | 交换、掉落    |
| `x` `y`         | 0、32、64… 的像素 | `draw`、补间目标 | `Timer.tween` |

```lua
function Tile:init(x, y, color, variety)
    self.gridX = x
    self.gridY = y

    self.x = (self.gridX - 1) * 32
    self.y = (self.gridY - 1) * 32

    self.color = color
    self.variety = variety
end
```

交换时只改 `gridX`/`gridY`，`x`/`y` 由补间慢慢挪过去。因此 `render` 里**不能**用 `(gridX - 1) * 32` 重算位置——那样补间结果每帧都被覆盖，方块会瞬移。

`Tile:init(x, y, color, variety)` 的参数名很含糊，前两个其实是网格坐标。传反两个数不会报错，只会让整盘沿对角线翻面，看着「有点歪」却说不上哪里错。

## 数据结构

`Board:init(x, y)` 的 `x`、`y` 是棋盘左上角的屏幕位置，正式版是 `VIRTUAL_WIDTH - 272` 和 `16`，即 240 与 16。

`self.tiles[y][x]` 行优先：`tiles[1]` 是最上面一行。Lua 从 1 起算，像素从 0 起算，两层差一位的换算集中在 `(gridY - 1) * 32` 这一处，别在别处再写一遍。

```lua
for tileY = 1, 8 do
    table.insert(self.tiles, {})
    for tileX = 1, 8 do
        table.insert(self.tiles[tileY],
            Tile(tileX, tileY, math.random(18), math.random(6)))
    end
end
```

每格独立掷两次随机数，颜色 `math.random(18)`、花样 `math.random(6)`，同色方块才不会长得完全一样。

`Tile` 里六个字段，只有 `color` 与 `variety` 是内容，其余四个都是位置。想加炸弹、重力块这类特殊方块，正确做法是加一个 `type` 字段并在掉落时分支，而不是往 `Tile` 里塞一堆 `if`。`Board:render` 按行遍历，下面的行后画，于是下方方块盖住上方，正好符合「低处在前」的直觉。

## 开局先洗掉三连

随机铺满后很可能已经存在三连。`initializeTiles` 末尾直接查一遍，命中就整盘重建：

```lua
while self:calculateMatches() do
    self:initializeTiles()
end
```

每次重建都会重新分配 `self.tiles`，旧表交给 GC。8×8 里出现三连的概率不低，但每次都把整盘打散，所以循环几乎不会跑超过两三次。

这是「先修数据，再谈画面」的典型做法：开局时棋盘必须无可消除项，否则玩家一进来就白拿分，还会触发一轮他不知情的连锁。

## 空格与遍历

消除后格子被置为 `nil`，`nil` 就是空位标记，没有额外的 `empty` 字段。代价是不能再用 `#self.tiles[1]` 数行宽——带空洞的表的长度没有定义，Lua 可能返回 8，也可能返回更小的值。

```lua
-- 危险：棋盘刚被消除过时结果不确定
for x = 1, #self.tiles[1] do

-- 稳定：尺寸是常量
for x = 1, 8 do
```

同理，`ipairs` 遇到第一个 `nil` 就停，扫不到后面的格子；`pairs` 能遍历全部，但顺序不保证，取不到「左边那块」。`Board:render` 里那句 `#self.tiles[1]` 只在棋盘填满时才对，消除后立刻渲染会少画几列；掉落逻辑用 `while y >= 1` 手动倒序，绕开了这两个坑。

## 三层坐标

`Tile` 只存相对棋盘的坐标，`Board:render` 再把偏移加上去：

```lua
function Board:render()
    for y = 1, #self.tiles do
        for x = 1, #self.tiles[1] do
            self.tiles[y][x]:render(self.x, self.y)
        end
    end
end
```

由此多出一条约定：凡是和屏幕位置有关的判断，都要手动加偏移。`PlayState` 画高亮框时写的是 `(gridX - 1) * 32 + (VIRTUAL_WIDTH - 272)`，就是这个偏移的展开形式。

同一块方块身上其实挂着三层数字，混用是这类项目最常见的 bug 来源。

| 层       | 取值范围        | 谁在用               |
| -------- | --------------- | -------------------- |
| 网格     | 1–8             | 匹配、相邻、数组下标 |
| 棋盘像素 | 0–224           | 补间、`Tile:render`  |
| 屏幕像素 | 240–496，16–272 | 鼠标命中、调试打印   |

再往上一层还有虚拟分辨率：游戏画在 512×288 上，`push` 把它放大到窗口。所以屏幕像素也不是终点，鼠标事件要先用 `push.toGame(x, y)` 换回虚拟坐标。这一版全靠键盘，省掉了这层换算；一旦加上点击选块，漏掉换算就会表现为「点到的格子偏左上」。
