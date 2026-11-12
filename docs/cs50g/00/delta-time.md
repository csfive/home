---
title: 移动与 Delta Time
description: 哈佛 CS50G Week 0 · 帧率无关的运动
---

# 移动与 Delta Time

所有运动都要乘上 `dt`，否则同一份代码在 30 fps 和 144 fps 的机器上速度完全不同。

## dt 是什么

`love.update(dt)` 的 `dt` 是距上一帧的秒数。

60 fps 时约为 `0.016`，30 fps 时约为 `0.033`。

```lua
PADDLE_SPEED = 200

function love.update(dt)
    if love.keyboard.isDown('w') then
        player1Y = player1Y - PADDLE_SPEED * dt
    elseif love.keyboard.isDown('s') then
        player1Y = player1Y + PADDLE_SPEED * dt
    end
end
```

一秒内所有帧的 `dt` 加起来是 1，所以总位移正好是 200 像素。

## 边界钳制

```lua
player1Y = math.max(0, player1Y - PADDLE_SPEED * dt)
player1Y = math.min(VIRTUAL_HEIGHT - 20, player1Y + PADDLE_SPEED * dt)
```

| 函数                 | 作用       |
| -------------------- | ---------- |
| `math.max(0, y)`     | 不高于顶部 |
| `math.min(H - h, y)` | 不低于底部 |

减的是球拍高度，因为坐标按左上角算。

## 随机数

`math.random` 是伪随机：种子一定，后面取到的每个数就都定死了。

```lua
math.randomseed(42)
print(math.random(100))
math.randomseed(42)
print(math.random(100)) -- 还是那个数
```

不播种时用的是默认种子，LuaJIT 每次启动拿到的序列完全相同，Pong 里就是球每次都朝同一边发。

课程那句 `math.randomseed(os.time())` 就是换一个每秒变一次的开头。

`os.time()` 只到秒，同一秒内启动两次，序列还是一样。

`love.math.random` 不用写这行：`love.math` 模块加载时已经用 `time(nullptr)` 播过种。要手动换种子用 `love.math.setRandomSeed(x)`。

两边的调用形式一致：`random(2)` 给 1 或 2，`random(-50, 50)` 给闭区间整数，不传参给 `[0, 1)` 的浮点。
