---
title: Lua
description: 哈佛 CS50G Week 0 · Lua 速成
---

# Lua

## 变量

| 写法                | 作用域 |
| ------------------- | ------ |
| `x = 1`             | 全局   |
| `local x = 1`       | 当前块 |
| `local a, b = 1, 2` | 多赋值 |

```lua
hello = 'hello'          -- 全局
local world = ' world'   -- 局部
print(hello .. world)    -- 字符串拼接
```

## 值与真假

- 注释是 `--`，多行是 `--[[ ]]`
- 只有 `nil` 和 `false` 为假，`0` 和空字符串都为真
- 字符串可以用单引号或双引号
- 类型：`nil`、`boolean`、`number`、`string`、`table`、`function`

## table

| 用法 | 写法                    |
| ---- | ----------------------- |
| 数组 | `{1, 2, 3}`             |
| 字典 | `{x = 10, y = 20}`      |
| 混合 | `{1, 2, name = 'ball'}` |
| 下标 | 从 1 开始               |
| 长度 | `#t`                    |

`{10, 20, 30}` 只是 `{[1] = 10, [2] = 20, [3] = 30}` 的简写。表里存的全是键值对，键从 1 开始连续排下去，看上去就像数组。

```lua
local t = { 10, 20, 30 }
t.name = 'score' -- 键不一定是数字

for i, v in ipairs(t) do print(i, v) end -- 1 10 / 2 20 / 3 30
for k, v in pairs(t) do print(k, v) end  -- 多打一行 name score，位置不定
```

`ipairs` 从 `t[1]` 开始往下读：`t[1]` 是 10，`t[2]` 是 20，`t[3]` 是 30，`t[4]` 是 `nil`，就停在这儿，所以 `t.name` 轮不到。

`pairs` 不按序号走，表里存了哪些键就取哪些，`name` 也会出来，顺序由哈希决定，不保证。

|          | `ipairs(t)`               | `pairs(t)` |
| -------- | ------------------------- | ---------- |
| 从哪开始 | `t[1]`                    | 任意一个键 |
| 读哪些键 | 连续的整数键，遇 `nil` 停 | 所有键     |
| 顺序     | 1、2、3                   | 不保证     |
| 适合     | 数组                      | 字典       |

## 函数与控制流

```lua
function add(x, y)
    return x + y
end

local double = function(x) return x * 2 end
```

| 结构     | 写法                                      |
| -------- | ----------------------------------------- |
| 条件     | `if ... then ... elseif ... else ... end` |
| while    | `while cond do ... end`                   |
| 数值 for | `for i = 1, 10 do ... end`                |
| 泛型 for | `for k, v in pairs(t) do ... end`         |
| repeat   | `repeat ... until cond`                   |

## and / or 模拟三元

Lua 没有 `cond ? a : b`，习惯用 `and` / `or` 模拟：

```lua
-- 1 号发球往右，2 号发球往左
local dx = servingPlayer == 1 and 100 or -100
```

坑在于 `and` 后面那个值不能是 `nil` 或 `false`，否则会直接漏到 `or` 那边。

## 模块

一个 `.lua` 文件就是一个模块。

课程里 `Paddle.lua` 是这样写的：

```lua [Paddle.lua]
Paddle = Class{}

function Paddle:init(x, y, width, height)
    self.x, self.y = x, y
    self.width, self.height = width, height
end
```

```lua [main.lua]
require 'Paddle'

player1 = Paddle(10, 30, 5, 20)
```

`require 'Paddle'` 找到并执行 `Paddle.lua`。

`Paddle` 就是个全局变量，所以下一行能直接用。

另一种写法是文件末尾 `return` 一个局部表：

```lua [Ball.lua]
local Ball = {}

function Ball.new(x, y)
    return { x = x, y = y }
end

return Ball
```

```lua [main.lua]
local Ball = require 'Ball'
local ball = Ball.new(100, 50)
```

好处是表留在模块里，不往全局塞。
