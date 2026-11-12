---
title: 面向对象
description: 哈佛 CS50G Week 0 · Class 与对象
---

# 面向对象

## Class 库

课程用 hump 的 `class.lua`：

```lua [Paddle.lua]
Class = require 'class'
Paddle = Class{}

function Paddle:init(x, y, width, height)
    self.x = x
    self.y = y
    self.width = width
    self.height = height
    self.dy = 0
end

function Paddle:update(dt)
    self.y = math.max(0, self.y + self.dy * dt)
end

function Paddle:render()
    love.graphics.rectangle('fill', self.x, self.y, self.width, self.height)
end
```

| 概念     | 对应                             |
| -------- | -------------------------------- |
| 类       | `Paddle = Class{}`               |
| 构造函数 | `Paddle:init(...)`               |
| 实例     | `Paddle(10, 30, 5, 20)`          |
| 字段     | `self.x`、`self.y`               |
| 方法     | `Paddle:update`、`Paddle:render` |

## 冒号语法糖

- `function Paddle:update(dt)` 等价于 `function Paddle.update(self, dt)`
- `player1:update(dt)` 把 `player1` 作为 `self` 传进去
- `player1.update(dt)` 不会传 `self`，除非手动写 `player1.update(player1, dt)`
