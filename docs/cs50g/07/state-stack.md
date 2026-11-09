---
title: 状态栈
description: 哈佛 CS50G Week 7 · 状态栈
---

# 状态栈

状态机一次只能待在一个状态里，状态栈可以同时握着好几个，只让最上面那个动。

## 从状态机到栈

前面的游戏用一张状态转移表：`play` 转 `done`，`done` 转 `serve`，同时只有一个当前状态。这在「暂停」面前失效：暂停菜单要显示，被暂停的游戏画面也要留在屏幕上。

栈的思路很直接：把暂停状态压到游戏状态上面。更新只发给栈顶，渲染从底往上一层不落。下层没有收到 `dt`，什么都不会变，自然就是暂停。

```lua
function StateStack:update(dt)
    if #self.states == 0 then return end
    self.states[#self.states]:update(dt)
end

function StateStack:render()
    for _, state in ipairs(self.states) do
        state:render()
    end
end

function StateStack:push(state)
    table.insert(self.states, state)
    state:enter()
end

function StateStack:pop()
    if #self.states == 0 then return end
    self.states[#self.states]:exit()
    table.remove(self.states)
end
```

`table.insert` 追加到末尾，`table.remove` 从末尾删除，正好是后进先出。`push` 后立刻调用 `enter`，`pop` 前调用 `exit`，两个钩子用来准备和清理：进入时播音乐、重置计时器，退出时恢复上一层的音乐。

## 更新与渲染的不对称

| 操作     | 遍历范围       | 原因                     |
| -------- | -------------- | ------------------------ |
| `update` | 只有栈顶       | 下层冻结，画面才像被暂停 |
| `render` | 全部，从底到顶 | 下层要作为背景可见       |
| `push`   | 栈顶新增       | 新状态接管输入           |
| `pop`    | 移除栈顶       | 回到上一层的控制         |

这条不对称是整页的核心。若照抄状态机的习惯把 `update` 也写成全遍历，暂停菜单下面的角色会继续走路，玩家一回头已经撞进草丛。

代价是输入处理也随之下沉：只要栈顶状态吃掉了回车，下层就收不到。菜单状态因此在 `update` 里处理按键，不需要再问「我是不是最上层」。如果两个状态都监听同一个键，就会出现一次按键触发两次动作——比如回车同时确认菜单和关闭对话框。

## BaseState

每个状态都要实现 `enter` / `exit` / `update` / `render` 四个方法，写四遍空函数很烦。用一个基类兜底：

```lua
BaseState = Class{}

function BaseState:init() end
function BaseState:enter() end
function BaseState:exit() end
function BaseState:update(dt) end
function BaseState:render() end

FadeInState = Class{__includes = BaseState}
```

`Class{__includes = BaseState}` 让子类在没定义某个方法时回落到基类。状态自身仍可以覆写任一方法。没有这层兜底，`pop` 时调用一个不存在的 `exit` 会直接报错，而错误点在 `StateStack` 里，不在状态里。

## 谁负责弹出

两种写法都对：由父状态记住子状态并在合适时机 `pop`，或者让状态自己判断。

- `NewPopupState` 用后者：每帧检查 `self.textbox:isClosed()`，为真就 `gStateStack:pop()`
- 战斗流程用前者：淡入状态在 tween 结束时压入战斗状态，结束时弹出自己
- 谁压的谁不管，各层只管自己的进出，调用方不用记着回收

淡入淡出是最能说明问题的一类状态。它没有实体、不吃输入，只在固定时长内把一块颜色从透明画到不透明。下面这个最小实现省略了绘制，只保留结构：

```lua
FadeInState = Class{__includes = BaseState}

function FadeInState:init(color, duration, onFadeComplete)
    self.color = color
    self.duration = duration
    self.onFadeComplete = onFadeComplete
    self.alpha = 0
    Timer.tween(duration, {[self] = {alpha = 1}}):finish(function()
        gStateStack:pop()
        onFadeComplete()
    end)
end
```

`pop` 发生在回调里，意味着这块遮罩会自己消失，调用方只需要关心「淡完之后做什么」。转场逻辑因此可以读成一串：压入淡入、在回调里换场景、再压入淡出。

## 栈深与资源

栈没有硬上限，压一百层也能跑，每层只是一个 Lua 表加几个字段。实践里很少超过十层：场地、战斗、台词、菜单、确认框，再往下就是设计问题。

栈里的状态不会被销毁，`pop` 只是从数组移除，之后交给 GC。想保留玩家的选择（比如菜单光标位置），就不能在 `pop` 之后重建状态，得把数据放在更长寿的对象里。

- 空栈要能安全地 `update` 和 `pop`，否则 `states[0]` 是 `nil`
- 这个错误通常发生在所有状态都弹出、游戏循环还在跑的瞬间
- `Timer.update(dt)` 是全局的，不认状态栈，下层启动过的 tween 仍会跑

最后一条最容易被忽略：状态冻结了，动画没有。要让过渡随状态一起停，就得自己在 `exit` 里停掉，或者把过渡改成按状态推进的计时器。

调试时看症状就能判断栈深度：全黑屏通常是 `pop` 多了，把场地状态也弹掉；画面还在但按键没反应，通常是 `pop` 少了，输入还压在旧状态上。

层与层之间的数据靠构造参数传，不靠全局变量。战斗状态需要玩家对象，就在 `BattleState(player)` 里传进去；淡入状态需要回调，就在构造时传入。全局变量一多，栈里哪一层在读它就说不清，改起来也找不到边界。
