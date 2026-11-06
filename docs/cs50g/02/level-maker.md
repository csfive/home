---
title: 关卡生成
description: 哈佛 CS50G Week 2 · 关卡生成
---

# 关卡生成

每关的砖块布局都由 `LevelMaker.createMap(level)` 现算，关卡号越高，砖块越硬、颜色越贵。

## 布局参数

行数和列数都随机，但列数会被强制成奇数。奇数让金字塔有正中一列，也让左右对称的图案不会错位。

```lua
local numRows = math.random(1, 5)

local numCols = math.random(7, 13)
numCols = numCols % 2 == 0 and (numCols + 1) or numCols

local highestTier = math.min(3, math.floor(level / 5))
local highestColor = math.min(5, level % 5 + 3)
```

难度由两个上限控制。`highestTier` 每五关涨一级，封顶 3；`highestColor` 随关卡在 3 到 5 之间摆动，封顶 5。

| 变量           | 范围           | 作用      |
| -------------- | -------------- | --------- |
| `numRows`      | 1 到 5         | 行数      |
| `numCols`      | 7 到 13 的奇数 | 列数      |
| `highestTier`  | 0 到 3         | tier 上限 |
| `highestColor` | 3 到 5         | 颜色上限  |

上限只是随机范围，不保证每块砖都取到最高值。关卡号从 1 开始，第 1 关的 tier 上限是 0，到第 5 关才出现 tier 1，第 10 关出现 tier 2。

| 关卡 | tier 上限 | 颜色上限 |
| ---- | --------- | -------- |
| 1    | 0         | 4        |
| 3    | 0         | 5        |
| 5    | 1         | 3        |
| 10   | 2         | 3        |

颜色上限会回落，所以第 5 关不一定比第 4 关更花，变难的只是 tier。

`numCols` 强制成奇数后，实际只能取 7、9、11、13 四种，偶数会加一。行数只有 1 时也算一关，画面只剩一条横线。所有随机都走全局 RNG，种子只在 `love.load` 里播一次；把 `randomseed` 放进循环，同一秒内重开游戏会得到相同布局。

## 坐标计算

砖块 32×16，13 列正好 416 像素，加上左右各 8 像素边距就是 432，铺满整个虚拟宽度。

```lua
local x = (x - 1) * 32 + 8 + (13 - numCols) * 16
local y = y * 16
```

Lua 表从 1 开始，坐标从 0 开始，所以列号先减 1。少列时补 `(13 - numCols) * 16`，每少一列整体右移 16 像素，左右留白相等。Y 直接用 `y * 16`，第 1 行贴着顶部，分数和心画在右上角不会冲突。

以 13 列为例，第一块 `x = 8`，最后一块 `x = 392`，两边各留 8 像素。砖块按行优先 `table.insert` 进表，碰撞遍历用 `pairs`；因为一帧只处理一块砖，顺序会决定角落同时压两块时谁先响应。

## 行内图案

每一行独立掷两次：是否隔块、是否交替颜色。两个开关互不影响，组合出四类行。

| 开关组合                | 效果               |
| ----------------------- | ------------------ |
| 都不开                  | 整行同色同 tier    |
| 只开 `alternatePattern` | 两种颜色交替       |
| 只开 `skipPattern`      | 隔一块生成         |
| 两个都开                | 隔块，剩下的砖交替 |

交替时先选两组 color/tier，再用 `alternateFlag` 逐块翻转。`skipFlag` 同理，每块翻转一次，所以跳过的位置严格间隔，不会出现连续两个空位。

两个开关都是按行掷的，不同行可以完全不同。这就是为什么同一关里既有实心块、也有棋盘状的空隙。生成一块砖的顺序固定：算坐标、建 `Brick`、按行模式填 color 与 tier、插入表。

```lua
if skipPattern and skipFlag then
    skipFlag = not skipFlag
    goto continue
end
skipFlag = not skipFlag
```

## goto 模拟 continue

Lua 没有 `continue`。命中跳过条件时用 `goto` 跳到循环末尾的标签，标签写成 `::continue::`，必须和 `goto` 在同一个函数内。执行到标签后，本次循环剩下的语句全部略过。

`goto` 之前先把 `skipFlag` 翻了一次，保证下一块不被跳过，忘了这一步整行都会被跳空。`goto` 是 Lua 5.2 才加入的关键字，LuaJIT 支持它；标签作用域是整个函数，但不能跳进局部变量的作用域。

## 砖块与降级

`Brick` 只有 `tier`、`color`、`inPlay` 三个状态字段。`inPlay` 为 false 时既不渲染也不参与碰撞，但对象仍留在 `bricks` 表里，胜利判定要遍历整张表才能确认清空。

```lua
function Brick:hit()
    if self.tier > 0 then
        if self.color == 1 then
            self.tier = self.tier - 1
            self.color = 5
        else
            self.color = self.color - 1
        end
    elseif self.color == 1 then
        self.inPlay = false
    else
        self.color = self.color - 1
    end
end
```

命中先降 color，color 到 1 再降 tier 并把 color 重置成 5。tier 0 且 color 1 时移除，所以一块砖最多被打 20 次。

分数按 `tier * 200 + color * 25` 计算，同一颜色下高 tier 更值钱。全图无砖时函数递归重掷，但每行至少留一半砖，这个分支基本走不到。

## 固定关卡

把 `createMap` 换成手写表也能用，状态机只要求返回一个 `Brick` 数组。设计固定关卡时按坐标手写砖块，比反复调随机参数更可控。

课程还定义了 `SINGLE_PYRAMID`、`MULTI_PYRAMID` 两个全局图案常量，当前实现没有使用，想加金字塔布局可以从这里扩展。

- 先写 5 行坐标
- 再填 color 与 tier
- 最后检查边界

固定关卡适合教学和 Boss 关，随机关卡适合无尽模式，两种可以按关卡号混用。手写布局时把砖块按行写，坐标算错也容易对照。关卡号只影响生成参数，不会限制砖块总数。手写表同样要遵守 32×16 的格子，否则碰撞盒和贴图会错位。
