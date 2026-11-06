---
title: 面向对象
description: 哈佛 CS50G Week 0 · Class 与对象
---

# 面向对象

Pong 只有两个球拍和一个球，变量还能忍；实体一多，就必须把位置、速度和绘制方法收进对象里。

## Class 库

课程用 hump 的 `class.lua`：

```lua
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

## self 与冒号

- `function Paddle:update(dt)` 等价于 `function Paddle.update(self, dt)`
- `player1:update(dt)` 把 `player1` 作为 `self` 传进去
- `player1.update(dt)` 不会传 `self`，除非手动写 `player1.update(player1, dt)`

## 模块

```lua
-- Paddle.lua
Paddle = Class{}
-- ...
```

`main.lua` 里 `require 'Paddle'` 会执行文件并把 `Paddle` 变成全局。也可以显式返回：

```lua
local Paddle = Class{}
return Paddle
```

课程代码用全局写法，简单直接。

## main.lua 只做调度

```lua
require 'Paddle'
require 'Ball'

function love.load()
    player1 = Paddle(10, 30, 5, 20)
    player2 = Paddle(VIRTUAL_WIDTH - 10, VIRTUAL_HEIGHT - 30, 5, 20)
    ball = Ball(VIRTUAL_WIDTH / 2 - 2, VIRTUAL_HEIGHT / 2 - 2, 4, 4)
end

function love.update(dt)
    player1:update(dt)
    player2:update(dt)
    if gameState == 'play' then
        ball:update(dt)
    end
end
```

`main.lua` 保持短，实体逻辑放到各自文件，后面加新实体时不用改一堆全局变量。

## 常见坑

- 忘了 `Class{}` 的空表，`Paddle = Class` 不是类
- `init` 写成 `Paddle.init`，构造时不会绑定 `self`
- 模块文件名和 `require` 的字符串要一致
