---
title: 得分与状态机
description: 哈佛 CS50G Week 0 · gameState 与回合
---

# 得分与状态机

Pong 的流程不是一条直线：开始、发球、对打、结束。用一个字符串状态就能把它们分开。

## 状态

| 状态    | 行为                   |
| ------- | ---------------------- |
| `start` | 显示提示，等待开始     |
| `serve` | 球停在中间，等待发球   |
| `play`  | 正常对打               |
| `done`  | 有人到 10 分，显示结果 |

```lua
gameState = 'start'
```

## 状态控制 update 与 draw

```lua
function love.update(dt)
    if gameState == 'play' then
        ball:update(dt)
    end
    player1:update(dt)
    player2:update(dt)
end
```

绘制同理：`start` 和 `done` 只画文字，`serve` 和 `play` 画球场。

## 得分

球越过左右边界就得分：

```lua
if ball.x < 0 then
    score2 = score2 + 1
    servingPlayer = 1
    gameState = 'serve'
    ball:reset()
end
```

| 事件       | 处理                 |
| ---------- | -------------------- |
| 球出左界   | 右方得分，左方发球   |
| 球出右界   | 左方得分，右方发球   |
| 到达 10 分 | `gameState = 'done'` |

输的一方发球是课程里的约定，让刚失分的人先碰球。

## 发球

```lua
function love.keypressed(key)
    if key == 'return' then
        if gameState == 'start' then
            gameState = 'serve'
        elseif gameState == 'serve' then
            gameState = 'play'
            ball.dx = math.random(2) == 1 and 100 or -100
        elseif gameState == 'done' then
            score1, score2 = 0, 0
            gameState = 'serve'
        end
    end
end
```

## 重置

```lua
function Ball:reset()
    self.x = VIRTUAL_WIDTH / 2 - 2
    self.y = VIRTUAL_HEIGHT / 2 - 2
    self.dx = 0
    self.dy = 0
end
```

发球前速度归零，按键后再给方向。

## 为什么用状态机

- 避免 `if playing and not paused and not gameOver` 这种布尔组合
- 每个状态的行为集中，新增暂停、菜单只需加一个状态
- 下一讲会用更正式的状态机抽象替换字符串

## 常见坑

- 状态字符串拼错，逻辑静默失效
- 得分后忘了重置球，球会继续飞
- `done` 后没有重置比分，下一局直接结束
