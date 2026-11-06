---
title: 计分与关卡
description: 哈佛 CS50G Week 3 · 计分与关卡
---

# 计分与关卡

分数只在一个地方增加，关卡目标只有一个公式，倒计时只有一个来源——三件事都很短，但决定了整局的节奏。

## 单组得分

每找到一组匹配，就按长度加分：

```lua
for k, match in pairs(matches) do
    self.score = self.score + #match * 50
end
```

| 匹配长度 | 得分 | 平均每格 |
| -------- | ---- | -------- |
| 3        | 150  | 50       |
| 4        | 200  | 50       |
| 5        | 250  | 50       |

平均每格恒为 50，长的匹配没有任何额外奖励。所以这一版的最优策略是「多凑组」，不是「憋大组」——四连和「三连 + 一格闲置」收益完全一样。

计分循环在外面包了 `pairs(matches)`，十字交叉会进两组，两块共享的中心格被算两次。这不是 bug，而是这个算法的自然结果：横向一组、竖向一组，各按自己长度结算。

## 关卡目标

```lua
self.scoreGoal = self.level * 1.25 * 1000
```

第 1 关 1250 分，之后每关加 1250。目标线性增长，时间却固定 60 秒，难度曲线完全由这个差值提供。

| 关卡 | 目标分 | 全按 3 连估算的组数 |
| ---- | ------ | ------------------- |
| 1    | 1250   | 9                   |
| 2    | 2500   | 17                  |
| 3    | 3750   | 25                  |
| 4    | 5000   | 34                  |

第 1 关 60 秒内要凑 9 组，还有余力；到第 4 关就是每分钟 34 组，几乎只剩连锁能救。这也是为什么连锁必须做对——它是后期唯一的产能。

## 60 秒倒计时

`timer` 在 `init` 里赋 60，用 `Timer.every(1, ...)` 每秒减一，低于 5 秒时每秒播一次 `clock`：

```lua
Timer.every(1, function()
    self.timer = self.timer - 1
    if self.timer <= 5 then
        gSounds['clock']:play()
    end
end)
```

`init` 在每次 `change('play', ...)` 时都会跑，因为状态机每次都新建实例，所以每关都是满 60 秒。倒计时不受暂停影响，也没有暂停功能——补间和计时器共用一个 `Timer.update`。

分数在 `calculateMatches` 里跳，HUD 在 `render` 里每帧重画，两者之间没有中间状态：方块消失的那一帧数字就已经变了。反过来做逐位滚动，就要再写一套只在表现层的补间。

时间到与达标是两个独立的 `if`，都写在 `update` 开头，且都在改状态前调用 `Timer.clear()`：

```lua
if self.timer <= 0 then
    Timer.clear()
    gStateMachine:change('game-over', { score = self.score })
end

if self.score >= self.scoreGoal then
    Timer.clear()
    gStateMachine:change('begin-game', {
        level = self.level + 1,
        score = self.score
    })
end
```

两个条件不是 `elseif`。如果分数刚好在最后一秒达标，两条都会成立，后一次 `change` 会盖掉前一次——写成一前一后就等于给「达标」更高的优先级。想让超时优先，把顺序反过来。

## 分数怎么跨关

分数不在状态之间共享变量，而是当参数传下去：`enter(params)` 里 `self.score = params.score or 0`。`or 0` 兜住第一次进入时没有传值的情况，Lua 里 `nil or 0` 得 0。

`Timer.clear()` 的位置很容易写错。它清空的是全局默认组，如果放在 `change` 之后，新状态在 `init` 里注册的倒计时和光标闪烁会被立刻抹掉，表现为「进了关但没有计时器」。代码注释里专门写了这一句，值得抄下来。

```lua
gStateMachine:change('begin-game', {
    level = self.level + 1,
    score = self.score
})
```

一个常见的改动是加连击倍率：把第 n 波连锁的得分乘 `n`。这会让后期目标立刻变得可达，需要同时调高 `scoreGoal` 的系数，否则第 1 关就可能被一次五连直接打穿。改数值之前先想清楚它乘在哪一层。

## HUD 怎么摆

四行数字全画在 `PlayState:render` 里，没有单独的 HUD 类：

```lua
love.graphics.setColor(56/255, 56/255, 56/255, 234/255)
love.graphics.rectangle('fill', 16, 16, 186, 116, 4)

love.graphics.printf('Score: ' .. tostring(self.score), 20, 52, 182, 'center')
```

面板宽 186，文字宽度给 182 并居中，左右各留 2 像素余量。四行间隔 28 像素，正好容下 16 号字。`tostring` 不能省：`..` 只对字符串和数字生效，字段意外变成 `nil` 时直接报错，而 `tostring` 会把 `nil` 显示出来，调试时更容易看出问题。

HUD 每个状态自己画，是这个项目的取舍。好处是状态之间零耦合，坏处是四个状态各写一份相似的绘制代码。要抽公共 HUD，把 `renderHUD(level, score, goal, timer)` 放进 `Util.lua` 就够。

## 难度旋钮

| 旋钮     | 当前值 | 调大之后                     |
| -------- | ------ | ---------------------------- |
| 起始时间 | 60 秒  | 每关都更宽松                 |
| 目标系数 | 1.25   | 关卡间涨幅更陡               |
| 单格分值 | 50     | 全局等比放大，不改变相对难度 |
| 连锁倍率 | 无     | 后期爆发力变强               |

面板上四行数字之外还有关卡号，它不进公式，只用来显示当前进度。

前两个旋钮改变曲线形状，第三个只是整体缩放——把 50 改成 100、系数改成 0.625，玩起来一模一样。真正能改变手感的只有时间、目标系数和连锁奖励三处。调数值时先确认自己动的是形状还是刻度，否则会陷入「怎么改都差不多」的循环。
