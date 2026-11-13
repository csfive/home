---
title: 计分与倒计时
description: 哈佛 CS50G Week 1 · 过管计分与状态交接
---

# 计分与倒计时

分数只在游戏状态里产生，在结算状态里显示，两次切换之间靠一张参数表交接。

## 只算一次

管道从右飘到左要好几秒，这期间鸟一直在它右侧，每帧都判「鸟过了管子」分数会瞬间涨到几十。每对管带一个 `scored` 标记，加过分就锁死。

```lua
for _, pair in ipairs(self.pipePairs) do
    if not pair.scored and pair.x + PIPE_WIDTH < self.bird.x then
        self.score = self.score + 1
        pair.scored = true
        sounds['score']:play()
    end
end
```

判定用管道右缘，整对管完全越过鸟才算过管；比较对象是 `self.bird.x`，即鸟的左边缘，也偏保守。

| 事件 | 条件                                         | 结果             |
| ---- | -------------------------------------------- | ---------------- |
| 过管 | `pair.x + PIPE_WIDTH < bird.x` 且未标记      | 分数加一、打标记 |
| 撞管 | 任一管的 AABB 命中                           | 切到 `score`     |
| 落地 | `bird.y + bird.height > VIRTUAL_HEIGHT - 16` | 切到 `score`     |
| 重开 | 结算页按 `Enter`                             | 切到 `countdown` |

`scored` 与 `remove` 是两种单向标记：前者防重复计分，后者推迟删除时机。它们挂在 `PipePair` 上而不是 `PlayState` 的独立表里，因为标记描述的是这对管自身的状态。

## 分数跨状态传递

`PlayState` 死亡时把分数作为第二个参数交出去，接收端在 `enter(params)` 里取：

```lua
gStateMachine:change('score', { score = self.score })

function ScoreState:enter(params)
    self.score = params.score
end
```

从标题页直接切进来时没有 `params`，所以稳妥写法是 `params = params or {}`，再取 `params.score or 0`。显示时套一层 `tostring`：`..` 遇到 `nil` 会抛 `attempt to concatenate a nil value`。

## 游戏中显示分数

`PlayState` 自己也要把分数印在左上角：

```lua
function PlayState:render()
    for _, pair in ipairs(self.pipePairs) do pair:render() end
    self.bird:render()

    love.graphics.setFont(mediumFont)
    love.graphics.print('Score: ' .. tostring(self.score), 8, 8)
end
```

字体在 `love.load` 里建一次，`setFont` 只切换引用。HUD 用 `print` 而不是 `printf`：`printf` 要一个宽度才会换行和对齐。

## 倒计时

从标题直接进游戏，玩家还没准备好鸟就开始下坠。`CountdownState` 用 0.75 秒一个数字倒数 3、2、1。

```lua [CountdownState.lua]
local COUNTDOWN_TIME = 0.75

function CountdownState:update(dt)
    self.timer = self.timer + dt
    if self.timer > COUNTDOWN_TIME then
        self.timer = self.timer % COUNTDOWN_TIME
        self.count = self.count - 1
        if self.count == 0 then
            gStateMachine:change('play')
        end
    end
end
```

取模而不是清零，是为了把超出的那部分时间留到下一轮；一帧 16 毫秒的误差累积三次，倒计时就明显变慢。倒计时期间管道不生成、鸟不更新，因为它们属于 `PlayState`，此刻根本没有实例。

## 重开时什么被重置

状态表里存的是构造函数，`change('countdown')` 得到全新的 `CountdownState`，再进 `PlayState` 又是全新实例。

| 数据         | 存在哪          | 重开是否归零 |
| ------------ | --------------- | ------------ |
| 当前分数     | `PlayState`     | 是           |
| 管道与计时器 | `PlayState`     | 是           |
| 鸟的位置速度 | `Bird` 实例     | 是           |
| 最高分       | 存档文件        | 否           |
| 背景滚动偏移 | `main.lua` 局部 | 否           |

背景不归零是好事，世界看起来还在继续；要让每次开局都从同一帧画面开始，就在 `PlayState:enter` 里把滚动变量放回 0。

最高分用 `love.filesystem` 读写：`getInfo` 判存在，`read` 返回内容和长度两个值（`tonumber` 只吃第一个），写入放在 `ScoreState:enter`，只有破纪录才落盘。不设 identity 时存档目录叫 `LOVE`，多个游戏共用，`conf.lua` 里写 `t.identity` 才能隔离。
