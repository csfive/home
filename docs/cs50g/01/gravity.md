---
title: 重力与跳跃
description: 哈佛 CS50G Week 1 · 速度、重力与一次性输入
---

# 重力与跳跃

鸟只有一个 Y 方向的自由度：重力每帧往下加一点速度，玩家按键时把速度直接改成一个负值，两者的拉扯就是整个操作手感。

## 速度与位置

重力不直接改坐标，它改的是速度 `dy`；速度再改坐标。两步分开写，顺序是「先加速、后位移」，这叫半隐式欧拉积分。

```lua
local GRAVITY = 980

function Bird:update(dt)
    self.dy = self.dy + GRAVITY * dt
    self.y = self.y + self.dy * dt
end
```

`GRAVITY` 的单位是像素每二次方秒：一秒后 `dy` 增加 980，位置却由整个过程累积。想让下坠更沉就加大 `GRAVITY`，想更飘就减小，这是难度调参的第一个旋钮。

## 跳跃是一脚赋值

跳跃不是持续施加向上的力，而是把 `dy` 瞬间设成负数。随后重力每帧往上「还债」，速度几帧内穿过 0 再变正，轨迹自然成了抛物线。

```lua
local FLAP_VELOCITY = -300

if love.keyboard.wasPressed('space') then
    self.dy = FLAP_VELOCITY
    sounds['jump']:play()
end
```

写成 `self.dy = -300` 而不是 `self.dy = self.dy - 300`，是因为长按不该累积推力。以 `-300` 起跳、`980` 下坠，约 0.3 秒到达最高点，上升约 46 像素（`v² / 2g`），不到一个缺口的高度，所以必须连点。

| 参数            | 调大                     | 调小                 |
| --------------- | ------------------------ | -------------------- |
| `GRAVITY`       | 下坠更急，滞空窗口更短   | 飘，像在月球         |
| `FLAP_VELOCITY` | 绝对值更大，跳得更高更久 | 更平缓，需要多拍几下 |

讲义早期的 `GRAVITY = 20`、`dy = -5` 是「每帧」单位的数值，因为它当时把 `self.y = self.y + self.dy` 直接按帧累加。一旦位置项乘上 `dt`，这两个数要一起换算成每秒单位，否则鸟会像在月球上飘。数值本身没有对错，单位必须自洽。

## 自建输入表

`love.keypressed` 这类回调只能定义在 `main.lua`，但判断跳跃的地方在 `Bird` 里。课程的做法是给 `love.keyboard` 挂一张自建表和一个自建函数：

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

关键是最后一行：每帧结束把表换成一个新的空表。这等价于「本帧按下的键」这个集合，`wasPressed` 只在按下那一帧为真。忘了清空，`wasPressed` 就变成「曾经按过」，鸟会每帧都被打上去。

| 需求     | 用哪个                     | 触发时机   |
| -------- | -------------------------- | ---------- |
| 单次动作 | `love.keyboard.wasPressed` | 按下那一帧 |
| 持续输入 | `love.keyboard.isDown`     | 每帧轮询   |
| 鼠标单击 | `love.mouse.wasPressed(1)` | 按下那一帧 |
| 鼠标位置 | `love.mouse.getPosition`   | 每帧轮询   |

表本身是普通 Lua table，键是字符串、值是 `true`。用 `love.keyboard.keysPressed = {}` 直接换表，比逐个置 `nil` 快，也不会留下残留键。

## 鼠标与触屏

`love.mousepressed(x, y, button)` 的参数顺序固定，左键是整数 `1`。点击位置在 Flappy Bird 里完全用不上，但签名必须照抄。判断时把键盘和鼠标并联即可：

```lua
if love.keyboard.wasPressed('space') or love.mouse.wasPressed(1) then
    self.dy = FLAP_VELOCITY
end
```

LÖVE 在移动端把触摸映射成鼠标事件，所以这一行顺手就支持了手机点屏。如果在桌面端把窗口缩放过，`x`、`y` 是窗口坐标而非虚拟坐标，直接拿来定位会偏；Flappy Bird 只用「有没有点」，绕开了这个换算。

`love.mouse.wasPressed` 和键盘版一样是课程自己挂的：`love.load` 里建 `love.mouse.buttonsPressed = {}`，`love.mousepressed` 里写入 `true`，`update` 末尾清空。

别把 `isDown` 和 `wasPressed` 混用：`isDown` 在按住期间每帧为真，鸟会一路飞上天；跳跃这种单次动作只能用 `wasPressed`。另外键名是固定字符串，回车是 `'return'` 不是 `'enter'`，小键盘回车是 `'kpenter'`，判错就永远触发不了。

- `button` 编号：1 左键、2 右键、3 中键
- 触摸与鼠标在 LÖVE 里走同一套回调，判定写法不用改
- `wasPressed` 只认按下，松开要用 `love.mousereleased`

## 延伸：几个容易踩的坑

- **输入判定要在 `update` 阶段读。** `wasPressed` 的数据在 `update` 末尾就被清空，放 `render` 里永远读到空表，回调写了也不生效。
- **位置项漏乘 `dt`。** 直接写 `self.y = self.y + self.dy` 时，跳跃高度与帧率挂钩，60 帧能过的高度在 144 帧上过不去。位置积分必须带 `dt`，且数值单位要相应换算。
- **`dt` 不封顶。** 窗口被拖动、系统卡顿后 `dt` 可能是 0.5 秒，鸟一帧位移几百像素，直接穿过管道。`dt = math.min(dt, 1 / 60)` 一行就能挡住这类穿透。
- **落地判定。** `self.y + self.height > VIRTUAL_HEIGHT - 16` 就撞地，其中 16 是地面高度。少了 `height`，鸟会半截埋进地面才死；用 `VIRTUAL_HEIGHT` 又会让判定晚一截。

想让操作更细腻，可以加「松手截断上升」：按住时正常起飞，提前松手就把 `dy` 减半，跳跃变成可变高度。这需要 `love.keyboard.isDown` 配合，`wasPressed` 做不到。
