---
title: 虚拟分辨率与滤镜
description: 哈佛 CS50G Week 0 · push 与像素风
---

# 虚拟分辨率与滤镜

复古游戏按 300×200 左右的像素设计，今天却要铺满 1080p。虚拟分辨率负责“按小尺寸算”，滤镜负责“放大后不糊”。

## 为什么不用原生分辨率

| 做法                 | 结果                   |
| -------------------- | ---------------------- |
| 直接在 1280×720 上画 | 字符和形状太小         |
| 放大位图             | 双线性滤镜把像素糊成团 |
| 虚拟分辨率 + 最近邻  | 像素块清晰，有 CRT 感  |

## linear 与 nearest

放大一张图时，GPU 不是把像素拉长，而是给屏幕上的每个像素去原图里取样。取样点经常落在几个像素中间，取谁、怎么混，就是 filter 决定的。

- `nearest`：取最近的那个像素，不做混合。放大后每个原像素变成一个方块，边缘是硬的。
- `linear`：取周围四个像素按距离加权平均（双线性插值）。像素之间多出过渡色，放大后发糊。

|           | `nearest`        | `linear`             |
| --------- | ---------------- | -------------------- |
| 放大后    | 硬边方块         | 渐变、模糊           |
| 适合      | 像素画、复古风格 | 照片、需要平滑的场合 |
| LÖVE 默认 | 否               | 是                   |

`setDefaultFilter(min, mag)` 的两个参数分别是缩小和放大时用的过滤器，Pong 里基本都是放大，两个都写 `nearest`：

```lua
love.graphics.setDefaultFilter('nearest', 'nearest')
```

这行要在创建字体、图片之前执行，因为资源创建时就按当时的过滤器定了。

单张图也能用 `image:setFilter('nearest', 'nearest')` 覆盖。

## push

```lua
push = require 'push'

VIRTUAL_WIDTH = 432
VIRTUAL_HEIGHT = 243

function love.load()
    love.graphics.setDefaultFilter('nearest', 'nearest')
    love.window.setMode(1280, 720, { vsync = true })
    push.setupScreen(VIRTUAL_WIDTH, VIRTUAL_HEIGHT, { upscale = 'normal' })
end

function love.draw()
    push.start()
    -- 这里用虚拟坐标绘制
    push.finish()
end
```

| 调用                           | 作用                         |
| ------------------------------ | ---------------------------- |
| `push.setupScreen(w, h, opts)` | 设定虚拟画布                 |
| `push.start()`                 | 之后的绘制进入虚拟坐标       |
| `push.finish()`                | 退出虚拟坐标，恢复原生分辨率 |

## upscale 模式

| 模式            | 行为                   |
| --------------- | ---------------------- |
| `normal`        | 等比缩放，可能留黑边   |
| `pixel-perfect` | 整数倍缩放，像素不歪   |
| `stretched`     | 拉伸填满，比例可能失真 |

## 窗口缩放

```lua
function love.resize(w, h)
    push.resize(w, h)
end
```

不转发的话，调整窗口后画面比例会错。

## 鼠标坐标

鼠标事件给的是窗口坐标，虚拟坐标要转换：

```lua
function love.mousepressed(x, y, button)
    local gx, gy = push.toGame(x, y)
end
```
