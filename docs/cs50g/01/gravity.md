---
title: 重力与跳跃
description: 哈佛 CS50G Week 1 · 速度、重力与一次性输入
---

# 重力与跳跃

鸟只有一个 Y 方向的自由度：重力每帧往下加一点速度，按键时把速度直接改成负值，两者的拉扯就是手感。

## 速度与位置

重力不改坐标，它改速度 `dy`；速度再改坐标。先加速、后位移，这叫半隐式欧拉积分。

```lua
local GRAVITY = 980

function Bird:update(dt)
    self.dy = self.dy + GRAVITY * dt
    self.y = self.y + self.dy * dt
end
```

`GRAVITY` 的单位是像素每二次方秒：一秒后 `dy` 增加 980，位置由整个过程累积。想更沉就加大，想更飘就减小，这是难度调参的第一个旋钮。

位置项漏乘 `dt` 时，跳跃高度与帧率挂钩，60 帧能过的缺口在 144 帧上过不去。

`dt` 要封顶：窗口被拖动或系统卡顿后 `dt` 可能是 0.5 秒，鸟一帧位移几百像素，直接穿过管道。`dt = math.min(dt, 1 / 60)` 一行就能挡住这类穿透。

## 跳跃是一脚赋值

跳跃不是持续施加向上的力，而是把 `dy` 瞬间设成负数，随后重力每帧往上还债，速度几帧内穿过 0 再变正，轨迹自然成抛物线。

```lua
local FLAP_VELOCITY = -300

if love.keyboard.wasPressed('space') then
    self.dy = FLAP_VELOCITY
    sounds['jump']:play()
end
```

写 `self.dy = -300` 而不是 `self.dy = self.dy - 300`，长按才不会累积推力。以 `-300` 起跳、`980` 下坠，约 0.3 秒到最高点，上升约 46 像素（`v² / 2g`），不到一个缺口的高度，所以必须连点。

| 参数            | 调大                     | 调小         |
| --------------- | ------------------------ | ------------ |
| `GRAVITY`       | 下坠更急，滞空窗口更短   | 飘，像在月球 |
| `FLAP_VELOCITY` | 绝对值更大，跳得更高更久 | 更平缓       |

## 自建输入表

`love.keypressed` 只能定义在 `main.lua`，判断跳跃的地方却在 `Bird` 里。课程给 `love.keyboard` 挂一张自建表：

```lua
function love.load()
    love.keyboard.keysPressed = {}
end

function love.keypressed(key)
    love.keyboard.keysPressed[key] = true
end

function love.keyboard.wasPressed(key)
    return love.keyboard.keysPressed[key]
end

function love.update(dt)
    gStateMachine:update(dt)
    love.keyboard.keysPressed = {}
end
```

关键是最后一行：每帧结束换一张新空表，`wasPressed` 才只在按下那一帧为真。忘了清空就变成「曾经按过」，鸟每帧都被打上去。

| 需求     | 用哪个                     | 触发时机   |
| -------- | -------------------------- | ---------- |
| 单次动作 | `love.keyboard.wasPressed` | 按下那一帧 |
| 持续输入 | `love.keyboard.isDown`     | 每帧轮询   |
| 鼠标单击 | `love.mouse.wasPressed(1)` | 按下那一帧 |

表是普通 Lua table，键是字符串、值是 `true`。直接换表比逐个置 `nil` 快，也不留残留键。

## 鼠标与触屏

`love.mousepressed(x, y, button)` 参数顺序固定，左键是整数 `1`。点击位置在 Flappy Bird 里用不上，但签名必须照抄，判断时和键盘并联：

```lua
if love.keyboard.wasPressed('space') or love.mouse.wasPressed(1) then
    self.dy = FLAP_VELOCITY
end
```

LÖVE 在移动端把触摸映射成鼠标事件，这一行顺手支持了手机点屏。桌面端缩放窗口后 `x`、`y` 是窗口坐标不是虚拟坐标，直接拿来定位会偏，只用「有没有点」就绕开了换算。

`love.mouse.wasPressed` 同样是课程自己挂的：`love.load` 里建 `love.mouse.buttonsPressed = {}`，`love.mousepressed` 里写 `true`，`update` 末尾清空。

键名是固定字符串，回车是 `'return'` 不是 `'enter'`，小键盘回车是 `'kpenter'`，判错就永远触发不了。
