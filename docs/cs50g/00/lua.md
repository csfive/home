---
title: Lua
description: 哈佛 CS50G Week 0 · Lua 速成
---

# Lua

Lua 很小，语法接近 JavaScript，但只有一种复合类型：table。游戏里的对象、数组、字典最后都是 table。

## 变量

| 写法                | 作用域 |
| ------------------- | ------ |
| `x = 1`             | 全局   |
| `local x = 1`       | 当前块 |
| `local a, b = 1, 2` | 多赋值 |

```lua
hello = 'hello'          -- 全局
local world = ' world'   -- 局部
print(hello .. world)    -- 字符串拼接用 ..
```

## 值与真假

- 只有 `nil` 和 `false` 为假，`0` 和空字符串都为真
- 字符串可以用单引号或双引号
- 注释是 `--`，多行是 `--[[ ]]`
- 类型：`nil`、`boolean`、`number`、`string`、`table`、`function`

## table

| 用法     | 写法                    |
| -------- | ----------------------- |
| 数组     | `{1, 2, 3}`             |
| 字典     | `{x = 10, y = 20}`      |
| 混合     | `{1, 2, name = 'ball'}` |
| 下标     | 从 1 开始               |
| 长度     | `#t`                    |
| 遍历数组 | `ipairs(t)`             |
| 遍历键值 | `pairs(t)`              |

```lua
local ball = { x = 0, y = 0 }
print(ball.x)
for i, v in ipairs({10, 20, 30}) do print(i, v) end
```

`ipairs` 只遍历连续整数下标，遇到 `nil` 停止；`pairs` 遍历所有键，顺序不保证。

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

每个块都以 `end` 结束。

## and / or 模拟三元

```lua
ballDX = math.random(2) == 1 and 100 or -100
```

条件为真取 `and` 后面，否则取 `or` 后面。

## 模块

```lua
-- Ball.lua
Ball = {}
Ball.__index = Ball
return Ball
```

课程里更常用 hump 的 `Class` 库，见「面向对象」一页。
