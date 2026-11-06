---
title: 关卡推进与存档
description: 哈佛 CS50G Week 2 · 关卡推进与存档
---

# 关卡推进与存档

清空最后一块砖之后，游戏要把分数、血量、挡板带到下一关，还要在关机后记得最高分。

## 胜利判定

每命中一块砖，`PlayState` 都会遍历整张 `bricks` 表，确认是否还有 `inPlay`。只要找到一块就立刻返回，最坏情况是遍历全部。

```lua
function PlayState:checkVictory()
    for k, brick in pairs(self.bricks) do
        if brick.inPlay then
            return false
        end
    end

    return true
end
```

判定放在 `hit()` 之后。砖块刚被置为 false，这一次遍历就能看到清空，不会多等一帧。返回 true 之后，调用方还要自己播音效和切状态，函数本身只回答清空与否。

`pairs` 的顺序无关紧要，因为只要存在一块 `inPlay` 就会提前返回。没有 `inPlay` 的砖块仍占数组位置，`#bricks` 不会变小，所以不能靠长度判断清空。

## 下一关

`victory` 状态只做两件事：让球继续跟着挡板，按 Enter 开下一关。真正的新布局由 `LevelMaker.createMap(level + 1)` 生成。

```lua
gStateMachine:change('serve', {
    level = self.level + 1,
    bricks = LevelMaker.createMap(self.level + 1),
    paddle = self.paddle,
    health = self.health,
    score = self.score,
    recoverPoints = self.recoverPoints
})
```

关卡号加一后同时用于显示和生成，两边不会不一致。挡板、血量、分数、回血阈值原样带过去，`victory` 的 `render` 也照样画血量和分数。

球不复用，`serve` 的 `enter` 会新建 `Ball()` 并随机皮肤。`createMap` 在 `change` 之前求值，生成报错会停在这一帧。关卡数据不落盘，砖块每次都从关卡号重新生成。

| 数据            | 产生位置        | 去向                       |
| --------------- | --------------- | -------------------------- |
| `paddle`        | `paddle-select` | 一路传到结束               |
| `bricks`        | `createMap`     | `serve`、`play`、`victory` |
| `health`        | `play`          | `serve`、`victory`         |
| `score`         | `play`          | 所有状态                   |
| `highScores`    | `main.lua`      | 所有状态                   |
| `recoverPoints` | `play`          | `serve`、`victory`         |

| 行号 | 内容             |
| ---- | ---------------- |
| 1    | 三字母名字       |
| 2    | 分数             |
| 3、4 | 第二组名字与分数 |

## 最高分文件

存档目录由 `setIdentity('breakout')` 决定，之后的读写都相对它。macOS 在 `~/Library/Application Support/LOVE/breakout`，Windows 在 `%APPDATA%/LOVE/breakout`，Linux 在 `~/.local/share/love/breakout`。

```lua
love.filesystem.setIdentity('breakout')

if not love.filesystem.getInfo('breakout.lst') then
    love.filesystem.write('breakout.lst', defaultScores)
end

for line in love.filesystem.lines('breakout.lst') do
    -- 交替解析名字与分数
end
```

第一次运行 `getInfo` 返回 nil，代码写入 10 条默认记录，名字是 `CTO`，分数从 1000 到 10000。`setIdentity` 只需调用一次，之后读写都落在同一个目录，卸载重装也不会清掉。

文件里名字和分数各占一行，共 20 行，读取时用一个布尔量交替判断。`lines` 是惰性迭代器，缺一行会让后面的名字和分数整体错位，所以行数校验不能省。名字只存三个字符，`string.sub(line, 1, 3)` 兜底截断。后 9 组同理，文件始终保持 20 行。

## 输入三字母

输入界面把三个 ASCII 码放在 `chars` 表里，65 是 A，90 是 Z。上下键加减，越过边界就绕回另一端。

```lua
chars[highlightedChar] = chars[highlightedChar] + 1
if chars[highlightedChar] > 90 then
    chars[highlightedChar] = 65
end

local name = string.char(chars[1]) .. string.char(chars[2]) .. string.char(chars[3])
```

左右键切换当前编辑的字符位，`string.char` 把码转成字符再拼成名字。用数字而不是字符串存字母，是因为加减比查表简单。加到 Z 之后绕回 A，减到 A 之下绕回 Z，用的是两段 `if` 而不是取模。

确认后从表尾向前移动：把插入点之后的每条记录复制到下一格，再写入新名字和分数。倒着走才不会覆盖还没读到的数据。

## 写回与风险

保存时把整张 10 条记录重新拼成 20 行，一次性覆盖文件。整表重写的代价是 O(n)，但 n 只有 10，比维护增量格式简单得多。写入不是原子操作，进程中途被杀会留下半截文件。

读回来时如果行数不足 20，就当作没有存档，重新写入默认值。更稳妥的是先写临时文件并校验行数，成功后再替换；`love.filesystem` 没有 rename，只能先写 `.tmp` 再重写正式文件。`GameOverState` 里记录名次的变量少了一个 `local`，落到了全局表。

## 每关保留什么

| 数据     | 下一关   | 重开游戏 |
| -------- | -------- | -------- |
| 分数     | 保留     | 归零     |
| 血量     | 保留     | 3        |
| 挡板颜色 | 保留     | 重选     |
| 砖块     | 重新生成 | 重新生成 |

只有最高分需要落盘，其余状态都在内存里。切关卡不用读写文件，即使生成关卡失败也不会污染存档。

分数、血量、挡板都在状态之间传递，只要有一个状态漏接，下一关就会拿到 nil。给 `enter` 的每个字段都写默认值，能让漏传变成可见的 0 而不是崩溃。最高分只在 `game-over` 时检查一次，中途退出不会记录。漏传字段是这类游戏最常见的崩溃来源。
