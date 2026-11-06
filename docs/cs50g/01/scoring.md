---
title: 计分与倒计时
description: 哈佛 CS50G Week 1 · 过管计分与状态交接
---

# 计分与倒计时

分数只在游戏状态里产生，在结算状态里显示。两次状态切换之间靠一张参数表交接，这一节把「谁拥有分数、什么时候加、怎么传」讲清楚。

## 只算一次

管道从右往左飘过屏幕要花好几秒，这期间鸟一直位于它右侧。如果每帧都判断「鸟过了管子」，分数会瞬间涨到几十。所以每对管带一个 `scored` 标记，加过分就锁死。

```lua
for _, pair in ipairs(self.pipePairs) do
    if not pair.scored and pair.x + PIPE_WIDTH < self.bird.x then
        self.score = self.score + 1
        pair.scored = true
        sounds['score']:play()
    end
end
```

判定用的是管道右缘而不是左缘：整对管完全越过鸟才算过管，鸟卡在管道中间时不算。比较对象是 `self.bird.x`，即鸟的左边缘，这也偏保守，但对玩家有利。

| 事件 | 条件                                         | 结果             |
| ---- | -------------------------------------------- | ---------------- |
| 过管 | `pair.x + PIPE_WIDTH < bird.x` 且未标记      | 分数加一、打标记 |
| 撞管 | 任一管的 AABB 命中                           | 切到 `score`     |
| 落地 | `bird.y + bird.height > VIRTUAL_HEIGHT - 16` | 切到 `score`     |
| 重开 | 结算页按 `Enter`                             | 切到 `countdown` |

`scored` 与 `remove` 是两种不同性质的单向标记：前者防止重复计分，后者推迟删除时机。它们都挂在 `PipePair` 上而不是 `PlayState` 的独立表里，因为标记描述的是这对管自身的状态。

## 分数跨状态传递

`PlayState` 死亡时切到结算页，把分数作为第二个参数交出去：

```lua
gStateMachine:change('score', { score = self.score })
```

接收端在 `enter(params)` 里取：

```lua
function ScoreState:enter(params)
    self.score = params.score
end
```

`enter` 每次进入都会调用，所以这里必须能接受 `nil` 参数——从标题页直接切进来时就没有 `params`。稳妥写法是 `params = params or {}`，再取 `params.score or 0`。

显示时套一层 `tostring`：`..` 遇到 `nil` 或布尔值会抛 `attempt to concatenate a nil value`，而 `tostring` 永远返回字符串。分数理论上不会为 `nil`，但状态参数传空的时候会，这层保险比崩溃好。

## 游戏中显示分数

`PlayState` 自己也要把当前分数印在左上角，否则玩家只能等死才知道成绩。做法是每帧用 `print`，位置固定在角上：

```lua
function PlayState:render()
    for _, pair in ipairs(self.pipePairs) do pair:render() end
    self.bird:render()

    love.graphics.setFont(mediumFont)
    love.graphics.print('Score: ' .. tostring(self.score), 8, 8)
end
```

字体在 `love.load` 里创建一次，`setFont` 只是切换引用，不要每帧 `newFont`。HUD 用 `print` 而不是 `printf`：`printf` 需要一个宽度才会自动换行和对齐，单行文字用 `print` 更直接。

## 倒计时

直接从标题跳进游戏，玩家还没准备好鸟就开始下坠。`CountdownState` 用 0.75 秒一个数字倒数 3、2、1，倒数结束才切 `play`。

```lua
local COUNTDOWN_TIME = 0.75

function CountdownState:init()
    self.count = 3
    self.timer = 0
end

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

取模而不是清零，是为了把超出的那部分时间留到下一轮。一帧 16 毫秒的误差累积三次，倒计时就会明显变慢；取模把误差压在一帧以内。

`render` 只干一件事：用大号字体把 `tostring(self.count)` 居中印出来。倒计时期间管道不生成、鸟不更新，因为它们属于 `PlayState`，此刻根本没有实例。

## 重开时什么被重置

因为状态表里存的是构造函数，`change('countdown')` 会得到一个全新的 `CountdownState`，再进 `PlayState` 又是全新的实例。所以重开时自动归零的有：分数、管道数组、生成计时器、`lastY`、鸟的坐标与 `dy`。

| 数据         | 存在哪          | 重开是否归零 |
| ------------ | --------------- | ------------ |
| 当前分数     | `PlayState`     | 是           |
| 管道与计时器 | `PlayState`     | 是           |
| 鸟的位置速度 | `Bird` 实例     | 是           |
| 最高分       | 存档文件        | 否           |
| 背景滚动偏移 | `main.lua` 局部 | 否           |

最后一行常被忽略：背景不归零是好事，世界看起来还在继续，但如果你希望每次开局都从同一帧画面开始，就得在 `PlayState:enter` 里把滚动变量放回 0。

## 延伸：最高分与奖牌

结算页显示「本次得分」很容易，难的是记住历史最高。LÖVE 的存档目录隔离在系统用户目录下，用 `love.filesystem` 读写，不需要关心平台路径。

```lua
local function loadHighScore()
    if love.filesystem.getInfo('highscore.txt') then
        return tonumber(love.filesystem.read('highscore.txt')) or 0
    end
    return 0
end

local function saveHighScore(score)
    love.filesystem.write('highscore.txt', tostring(score))
end
```

几个容易忽略的点：`love.filesystem.read` 返回内容和长度两个值，`tonumber` 只吃第一个；文件不存在时 `read` 返回 `nil`，所以先用 `getInfo` 判断；不设 identity 时存档目录叫 `LOVE`，多个游戏会共用，在 `conf.lua` 里写 `t.identity` 才能隔离。

写入时机放在 `ScoreState:enter` 比每帧比较更省事：进入结算页时算一次 `math.max`，只有破纪录才落盘。同样的入口适合放奖牌判定，3 分铜、6 分银、10 分金这类阈值写在常量表里，别散在 `render` 中。
