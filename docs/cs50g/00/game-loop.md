---
title: LÖVE 基础
description: 哈佛 CS50G Week 0 · 游戏循环与坐标
---

# LÖVE 基础

LÖVE 自己维护游戏循环，你只需要实现几个回调：初始化、更新、渲染、按键。

## 回调

| 回调                   | 调用时机          | 用途                   |
| ---------------------- | ----------------- | ---------------------- |
| `love.load()`          | 启动时一次        | 初始化窗口、资源、状态 |
| `love.update(dt)`      | 每帧              | 处理输入、移动对象     |
| `love.draw()`          | 每帧，update 之后 | 绘制                   |
| `love.keypressed(key)` | 按键按下时一次    | 菜单、退出、一次性动作 |
| `love.resize(w, h)`    | 窗口尺寸变化      | 转发给 push            |

```lua
function love.load()
    love.window.setMode(1280, 720, { vsync = true })
end

function love.update(dt)
    if love.keyboard.isDown('w') then
        player1Y = player1Y - 200 * dt
    end
end
```

## 输入

| 函数                        | 触发     | 场景                 |
| --------------------------- | -------- | -------------------- |
| `love.keypressed(key)`      | 按下一次 | 发球、退出、状态切换 |
| `love.keyboard.isDown(key)` | 每帧轮询 | 持续移动             |

按键名是字符串：`'w'`、`'up'`、`'escape'`、`'return'`。

按 `escape` 时调 `love.event.quit()` 就能退出，不必点窗口的关闭按钮。

## 坐标系

- 原点在左上角 `(0, 0)`
- X 向右为正，Y 向下为正
- 所有图形按左上角定位，不是中心

```text
(0,0) ──────────→ X
  │
  │
  ↓ Y
```

## 窗口与 vsync

```lua
love.window.setMode(1280, 720, {
    resizable = true,
    fullscreen = false,
    vsync = true
})
```

`vsync` 把帧率同步到显示器刷新率，避免画面撕裂。

`love.window.setTitle('Pong')` 改窗口标题，默认是 `Untitled`。`love.timer.getFPS()` 返回整数帧率，直接 `print` 到左上角就能看性能。

## 绘图

| 调用                                         | 作用              |
| -------------------------------------------- | ----------------- |
| `love.graphics.clear(r, g, b, a)`            | 清屏，RGBA 取 0–1 |
| `love.graphics.rectangle(mode, x, y, w, h)`  | `fill` 或 `line`  |
| `love.graphics.print(text, x, y)`            | 原样输出，不换行  |
| `love.graphics.printf(text, x, y, w, align)` | 按宽度对齐文本    |
| `love.graphics.setColor(r, g, b, a)`         | 之后绘制的颜色    |
| `love.graphics.newFont(path, size)`          | 创建字体          |
| `love.graphics.setFont(font)`                | 切换字体          |

颜色要归一化：`40/255, 45/255, 52/255` 就是 Pong 的深灰背景。

`printf` 需要一个宽度才能对齐，`print` 直接按左上角落下，分数这种单行文字用它更省事。`clear` 决定背景色，`setColor` 只影响之后的矩形和文字；画完带颜色的内容要设回 `1, 1, 1, 1`。

## 锚点

绘制从左上角开始。想放在屏幕右侧 10 像素、宽 5 像素的矩形，X 要写 `VIRTUAL_WIDTH - 15`：

```lua
love.graphics.rectangle('fill', VIRTUAL_WIDTH - 15, 30, 5, 20)
```

忘记减宽度，物体就会贴着边缘被裁掉。
