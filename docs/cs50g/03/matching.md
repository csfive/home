---
title: 交换与匹配
description: 哈佛 CS50G Week 3 · 交换与匹配
---

# 交换与匹配

一次操作其实是两件事：把两块方块在数据里换位，再让它们在画面上滑过去；滑完才开始判分。

## 光标与选中

棋盘光标用两个从 0 起的整数 `boardHighlightX/Y` 表示，和 `gridX - 1` 对齐。移动时用 `math.max(0, ...)`、`math.min(7, ...)` 夹住，走到边缘不会越界。

第一次按 Enter 把当前格记进 `highlightedTile`；再按同一格是取消选中；按到别的格则先检查相邻性。

```lua
local x, y = self.boardHighlightX + 1, self.boardHighlightY + 1

local distance = math.abs(self.highlightedTile.gridX - x)
               + math.abs(self.highlightedTile.gridY - y)

if distance > 1 then
    gSounds['error']:play()
    self.highlightedTile = nil
end
```

曼哈顿距离为 1 才是上下左右相邻。等于 2 的可能是斜对角，也可能是隔一格，两者都不合法——一个判据把两种错误一起挡掉了。不合法时清空选中而不是保留，玩家要重新点一次。

## 换位分两步

数据立刻改，像素慢慢挪。顺序固定为三步：交换两个 `Tile` 的 `gridX`/`gridY`，按新坐标写回 `tiles[y][x]`，最后补间 `x`/`y`。

```lua
local tempX, tempY = self.highlightedTile.gridX, self.highlightedTile.gridY
local newTile = self.board.tiles[y][x]

self.highlightedTile.gridX, self.highlightedTile.gridY = newTile.gridX, newTile.gridY
newTile.gridX, newTile.gridY = tempX, tempY

self.board.tiles[newTile.gridY][newTile.gridX] = newTile
self.board.tiles[self.highlightedTile.gridY][self.highlightedTile.gridX] = self.highlightedTile

Timer.tween(0.1, {
    [newTile] = { x = self.highlightedTile.x, y = self.highlightedTile.y },
    [self.highlightedTile] = { x = newTile.x, y = newTile.y }
}):finish(function() self:calculateMatches() end)
```

顺序不能反：先写数组再改 `gridX`，写回时用的还是旧下标，两块会写进同一格。补间目标是对方的**旧像素值**，取值必须在改坐标之前完成。此刻 `gridX` 变了、`x` 没变，两者不一致，这正是动画存在的空间。

交换合法与否，这一版**不做校验**。玩家可以把任意两块相邻方块换来换去，没有匹配就白滑一次，方块留在新位置。

| 做法   | 玩家体验                 | 实现代价         |
| ------ | ------------------------ | ---------------- |
| 不校验 | 可以随便换，换错就是白滑 | 无               |
| 校验   | 换错会滑回原位，手感更紧 | 要补一段反向补间 |

商业三消几乎都走第二条。实现方式是让 swap 返回「是否成三连」，由调用方决定要不要往回补间。

## 扫描匹配

判定分两轮：先按行扫横向，再按列扫竖向。每一轮只做一件事——维护 `colorToMatch` 和连续计数 `matchNum`，换色时结算。

| 规则     | 本作的做法                   |
| -------- | ---------------------------- |
| 方向     | 横、竖各扫一遍               |
| 最短长度 | 3                            |
| 对角线   | 不算匹配                     |
| 十字交叉 | 拆成两组分别计分             |
| 比较字段 | 只比 `color`，不比 `variety` |
| 返回值   | 有匹配返回数组，否则 `false` |

```lua
for x = 2, 8 do
    if self.tiles[y][x].color == colorToMatch then
        matchNum = matchNum + 1
    else
        colorToMatch = self.tiles[y][x].color

        if matchNum >= 3 then
            local match = {}
            for x2 = x - 1, x - matchNum, -1 do
                table.insert(match, self.tiles[y][x2])
            end
            table.insert(matches, match)
        end

        matchNum = 1
        if x >= 7 then break end
    end
end
```

两个细节值得记住。换色时是从 `x - 1` **往回**取 `matchNum` 格，因为扫描已经走过了这段；行尾要单独再查一次，否则贴着右边的三连会被漏掉。剪枝 `if x >= 7 then break` 只在换色分支里成立：此时 `x` 到行末最多还剩两格，凑不出三连。

`matches` 的结构是「组的数组」，一组长度可变，3 连、4 连、5 连都占一个元素。返回 `false` 而不是空表，是为了让调用方写 `if matches then` 就够，不必再判 `#matches > 0`。

## 扫描的边界情况

算法只有二十来行，但边界都藏在「什么时候结算」里。把几种排布代进去跑一遍，比读代码快。

| 排布               | 结果                  |
| ------------------ | --------------------- |
| 行首三个同色       | 换色时回溯，收集 3 格 |
| 行尾三个同色       | 循环结束后单独补查    |
| 整行八个同色       | 收成一组 8 格         |
| 两段三连中间夹异色 | 两个独立组            |
| 十字交叉           | 横向一组、竖向一组    |
| 斜向三个同色       | 不算匹配              |

行尾补查的那段用的是 `for x = 8, 8 - matchNum + 1, -1`，倒着数 `matchNum` 格。整行同色时 `matchNum` 是 8，范围正好是 8 到 1。如果把它写成正序，组的顺序会反过来，虽然不影响计分，但调试时看着别扭。

`calculateMatches` 有个隐式副作用：它把结果同时写进 `self.matches`。`removeMatches` 依赖这个字段，所以两个方法必须按顺序调用；先 `removeMatches` 再算匹配，删的是上一轮的结果。想要更干净的接口，可以让 `calculateMatches` 只返回值，把数组当参数传给 `removeMatches`。

## 补间的时序

判分不在按键那一帧发生，而是挂在交换补间的 `:finish` 上：

```lua
Timer.tween(0.1, { ... }):finish(function() self:calculateMatches() end)
```

于是玩家看到的是「滑过去、停一下、才开始消」，节奏清楚。如果把判分写在按键分支里，方块会在屏幕上还没换位时就已经消失，观感像穿帮。

这 0.1 秒也本该是输入锁。`canInput` 在 `init` 里置 `true`，在「没有匹配」分支里再置一次 `true`，但**没有任何地方置 `false`**——这道锁在发行版里是空转的。连锁动画期间玩家仍能按 Enter 启动第二次交换，两个补间会同时改同一批 `Tile` 的像素坐标。补上一句 `self.canInput = false` 放在交换之前，行为才和变量名相符。
