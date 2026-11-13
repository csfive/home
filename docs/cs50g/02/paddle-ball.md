---
title: 挡板与球
description: 哈佛 CS50G Week 2 · 挡板与球
---

# 挡板与球

挡板是玩家唯一能直接操控的对象，球是唯一会自己动的东西，手感全在这两个类里。

## 挡板

挡板只在 X 轴移动，`dx` 每帧由按键状态重新赋值。松开方向键时 `dx` 立刻归零，没有摩擦也没有惯性，指哪走哪。

```lua
function Paddle:update(dt)
    if love.keyboard.isDown('left') then
        self.dx = -PADDLE_SPEED
    elseif love.keyboard.isDown('right') then
        self.dx = PADDLE_SPEED
    else
        self.dx = 0
    end

    if self.dx < 0 then
        self.x = math.max(0, self.x + self.dx * dt)
    else
        self.x = math.min(VIRTUAL_WIDTH - self.width, self.x + self.dx * dt)
    end
end
```

位置更新后立刻夹紧：左边用 `math.max(0, ...)`，右边用 `math.min(VIRTUAL_WIDTH - self.width, ...)`，减宽度是因为坐标记的是左上角。夹紧放在乘法之后，高速低帧时最多损失一帧位移，不会把挡板永久卡在边界外。

| 字段              | 初值                            | 作用         |
| ----------------- | ------------------------------- | ------------ |
| `x`、`y`          | 水平居中、`VIRTUAL_HEIGHT - 32` | 左上角位置   |
| `width`、`height` | 64、16                          | 碰撞盒       |
| `dx`              | 0                               | 本帧水平速度 |
| `skin`            | 1 到 4                          | 颜色         |
| `size`            | 2                               | 宽度档位     |

`skin` 和 `size` 是两个正交属性：前者决定颜色，由玩家开局选择；后者决定宽度档位，初始固定为 2。`PADDLE_SPEED = 200` 是像素每秒，横穿 432 像素的虚拟屏大约两秒。

左右键用 `isDown` 轮询，不是 `keypressed`；同时按住时先判断左键，所以左移优先。

## 球

球只有 8×8，位置和速度分开存。`update` 先按 `dx`、`dy` 移动，再处理左、右、上三面墙。

```lua
function Ball:update(dt)
    self.x = self.x + self.dx * dt
    self.y = self.y + self.dy * dt

    if self.x <= 0 then
        self.x = 0
        self.dx = -self.dx
    end

    if self.x >= VIRTUAL_WIDTH - 8 then
        self.x = VIRTUAL_WIDTH - 8
        self.dx = -self.dx
    end

    if self.y <= 0 then
        self.y = 0
        self.dy = -self.dy
    end
end
```

撞墙时先把坐标贴回边界再反向，不贴回去球会停在墙外一帧，下次判定仍然命中。底边没有分支，球越过 `VIRTUAL_HEIGHT` 后由 `PlayState` 接住。

`Ball:collides(target)` 只回答两个矩形是否重叠，挡板和砖块都有相同的四个字段，所以能直接复用。四个比较都用严格大于，边界正好相等时算作重叠。课程里还留了一个没人调用的 `Ball:reset()`，切关卡要复用同一颗球时可以直接用。

## 发球

`serve` 状态不推进球，只把球摆在挡板上方：`x` 取挡板中心减 4，`y` 取挡板顶部减 8。挡板可以左右移动，球跟着走，按 Enter 才切换到 `play`。

`serve` 用 `love.keyboard.wasPressed('enter')` 判断，这个函数不是 LÖVE 自带。课程在 `main.lua` 里给 `love.keyboard` 挂了 `keysPressed` 表，每帧末清空，所以同一按键不会连续触发。球的皮肤也在这里随机，`ServeState:enter` 新建 `Ball()` 后把 `skin` 设成 1 到 7。

```lua
-- 在 PlayState:enter 里给初速
self.ball.dx = math.random(-200, 200)
self.ball.dy = math.random(-50, -60)
```

每次发球都重新掷，第一落点不会固定。球贴着挡板等待时速度仍是 0，`ServeState:update` 只改坐标，不动 `dx`、`dy`。

`-50` 到 `-60` 的上下界写反了。LuaJIT 会自动交换，标准 Lua 5.1 则抛 `interval is empty`；想跨解释器兼容，写成 `math.random(-60, -50)`。`dx` 还有机会取到 0，球垂直上升仍能玩，需要更稳定的开局可以在循环里重掷。

## 尺寸与碰撞盒

`size` 只影响绘制。`Paddle:init` 把 `width` 固定成 64，之后没有任何代码再改它，所以把 `size` 改成 4 时，画出来是 128 宽，碰撞盒还是 64。

绘制从 `self.x` 开始，宽度却按 quad 走，大号挡板会向右多出 64 像素，右边缘还会超出虚拟屏幕。正常流程里 `size` 始终是 2，问题不会暴露；一旦加道具改尺寸，必须同步 `self.width`。`skin` 只是颜色，不影响任何判定。

## 重置与复用

`Paddle` 和 `Ball` 都没有被自动重置。掉球后 `serve` 新建球，挡板则被一路传下去，位置留在掉球前的地方。

想每局把挡板放回中间，在 `serve` 的 `enter` 里改 `paddle.x` 即可；想复用同一颗球，调 `Ball:reset()` 再清速度。

重开和掉球是两种不同的重置：掉球只换球、挡板原地保留，完全重开走 `start` 让状态机重建所有对象，混用会丢进度。
