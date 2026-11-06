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

## 最近邻滤镜

```lua
love.graphics.setDefaultFilter('nearest', 'nearest')
```

- 默认是 `linear`（双线性），放大后模糊
- `nearest` 保留硬边，做像素风必须
- 必须在创建字体、图片之前设置，否则资源已经按旧滤镜生成
- 单个图片也可以 `image:setFilter('nearest', 'nearest')`

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

## 常见坑

- 滤镜在资源创建之后才设，等于没设
- 非整数倍缩放会让像素宽度不一致，看起来有的粗有的细
- 忘了 `push.finish()`，后面的 UI 也会被缩放
