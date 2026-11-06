---
title: 移动与 Delta Time
description: 哈佛 CS50G Week 0 · 帧率无关的运动
---

# 移动与 Delta Time

所有运动都要乘上 `dt`，否则同一份代码在 30 fps 和 144 fps 的机器上速度完全不同。

## dt 是什么

`love.update(dt)` 的 `dt` 是距上一帧的秒数。60 fps 时约为 `0.016`，30 fps 时约为 `0.033`。

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

## 球的初速度

```lua
ballDX = math.random(2) == 1 and 100 or -100
ballDY = math.random(-50, 50)
math.randomseed(os.time())
```

- X 方向随机左右，Y 方向随机上下
- `math.random(2)` 返回 1 或 2
- `and/or` 模拟三元
- 不设种子，每次启动的随机序列相同

## 速度与帧率

| 写法                           | 结果                       |
| ------------------------------ | -------------------------- |
| `x = x + speed`                | 帧率越高越快               |
| `x = x + speed * dt`           | 与帧率无关                 |
| `x = x + speed * (dt / 0.016)` | 以 60 fps 为基准，别这么写 |

## 常见坑

- 忘记乘 `dt`，低帧率机器上物体变慢
- 一帧里更新多次物理时，`dt` 要按次数拆分
- 暂停时仍调用 `update`，需要用状态判断是否更新
