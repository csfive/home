---
title: 计时器与补间
description: 哈佛 CS50G Week 3 · 计时器与补间
---

# 计时器与补间

这一讲换一种问法：「一秒后做什么」「0.2 秒内挪过去」，答案都是随时间推进的操作，与物理无关。

## 手写计时器

最直接的写法是累加 `dt`，超过阈值就触发，然后取模留住余数。

```lua
function love.update(dt)
    secondTimer = secondTimer + dt

    if secondTimer > 1 then
        currentSecond = currentSecond + 1
        secondTimer = secondTimer % 1
    end
end
```

一个计时器这样写没问题。五个六个就变成五套变量、五个分支，而且每处都得记得取模。直接清零会让每帧的时间抖动累积成可见的漂移，倒计时会越走越慢。

## Timer 的三个入口

`knife` 的 `Timer` 把「累积与判断」抽走，只留下三句声明式的话。

| 调用                         | 语义                     |
| ---------------------------- | ------------------------ |
| `Timer.every(interval, cb)`  | 每 `interval` 秒执行一次 |
| `Timer.after(delay, cb)`     | `delay` 秒后执行一次     |
| `Timer.tween(duration, def)` | 在时长内把字段插值到目标 |
| `Timer.update(dt)`           | 每帧推进所有计时器       |
| `:finish(fn)`                | 结束或到点后再执行 `fn`  |
| `:remove()`                  | 立刻移除这个计时器       |

```lua
Timer = require 'lib.knife.timer'

Timer.every(1, function()
    self.timer = self.timer - 1
end)

function love.update(dt)
    Timer.update(dt)
end
```

回调是匿名函数，被当成数据存进表里，时间到了才调用。`Timer.update` 内部用 `while elapsed >= duration` 逐个扣减，所以一帧跨过多个间隔时不会漏触发；低帧率下倒计时依然准。

## 补间就是插值

补间的通式只有一个：

```text
current = base + (destination - base) * (elapsed / duration)
```

`elapsed` 从 0 长到 `duration`，比例就从 0 长到 1。手写版要自己存 `base`、`duration` 和 `timer`，多个物体同时动时很容易写混。

```lua
Timer.tween(0.25, {
    [tile] = { x = 320, y = 64 },
    [self] = { transitionAlpha = 1 }
})
```

定义表里每个 key 是目标对象，value 是要插值的字段。起点不是写死的，而是 `planTween` 在**创建补间那一刻**读取对象的当前值。正因为如此，同一个对象连跑两段补间时，第二段必须等第一段结束再创建，否则起点会取到中间值。

Lua 允许 table 作 key，这套语法才能成立：`[tile] = {...}` 里 `tile` 是一个引用，不是字符串。

## 链式与清理

`:finish(fn)` 返回计时器本身，所以能一路点下去，写起来像 Web 里的 `.then()`。它描述的是一段线性时间：这段跑完，再跑下一段。

```lua
Timer.tween(1, { [self] = { transitionAlpha = 1 } })
    :finish(function()
        gStateMachine:change('begin-game', { level = 1 })
    end)
```

另外两个修饰符是 `:limit(n)` 与 `:ease(fn)`。前者给 `Timer.every` 限制总次数，后者把默认的线性缓动换成别的曲线，只需传函数。

| 写法                 | 从哪一刻开始算 | 适合什么       |
| -------------------- | -------------- | -------------- |
| `Timer.after(d, fn)` | 创建时         | 独立的延迟动作 |
| `:finish(fn)`        | 该计时器结束时 | 串行编排下一段 |

要「先淡出再换状态」必须用 `:finish`。用 `Timer.after` 写固定延迟，一旦淡出时长改了就会错位。

清理是这套模型唯一需要小心的地方。计时器存在一个全局默认组里，切换游戏状态时旧状态的 `every` 仍在跑，会继续修改已经没人看的字段。所以换状态前必须先 `Timer.clear()`；反过来把它写在 `change` 之后，新状态刚注册的计时器会被一起清掉。

只停某一个长计时器时用 `:remove()`，比如标题页轮换配色的那个；它改的字段随状态一起消失，留着只会空转。

## 自己写缓动

`:ease(fn)` 收的函数签名是固定的四参数：`(elapsed, initial, change, duration)`，`change` 是终点减起点。库自带只有线性，其他曲线得自己给。

```lua
local function easeOutQuad(elapsed, initial, change, duration)
    local t = elapsed / duration
    return initial + change * t * (2 - t)
end

Timer.tween(0.4, { [tile] = { y = 0 } }):ease(easeOutQuad)
```

缓动只改中间过程，不改终点。`t = 1` 时 `t * (2 - t)` 正好等于 1，所以不管用哪条曲线，补间结束时字段一定落在目标值。这一点让缓动可以随便换，不必担心位置漂移。

## 时间从哪里推进

整个系统只有一个时间入口 `Timer.update(dt)`，写在哪、写几次直接决定游戏速度。

| 写法                       | 结果                     |
| -------------------------- | ------------------------ |
| 每帧一次，放 `update` 末尾 | 正常速度                 |
| 每帧两次                   | 所有动画和倒计时双倍速   |
| 暂停时不调                 | 计时器停摆，最省事的暂停 |

掉帧时 `dt` 可能到 0.2 秒，`Timer.update` 用 `while` 把这段摊成多次触发，倒计时不会少减；补间却是一步跨过去，`dt` 超过总时长就直接从起点闪到终点。倒序遍历组尾往前扫，回调里 `:remove()` 不会跳过后面。
