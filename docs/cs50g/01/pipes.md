---
title: 管道生成
description: 哈佛 CS50G Week 1 · 计时生成与管道对
---

# 管道生成

关卡不是手工摆的，而是用计时器每隔一段时间在屏幕右边缘造一对管、让它以固定速度左移。这一讲把「程序化生成」压缩成了十几行。

## 计时生成

`dt` 是每帧经过的秒数，累加到一个变量上，超过阈值就生成并清零。这样与帧率无关：60 帧和 144 帧都是一秒生成一次。

```lua
function PlayState:update(dt)
    self.timer = self.timer + dt

    if self.timer > 2 then
        table.insert(self.pipePairs, PipePair(self:nextY()))
        self.timer = 0
    end
end
```

`table.insert(t, v)` 会追加到 `#t + 1`，不需要手动维护下标，Lua 表本身就从 1 开始。生成间隔 2 秒、管道速度 60 像素/秒、屏宽 432，同屏大约同时存在三四对管。

| 常量          | 讲义取值  | 作用                   |
| ------------- | --------- | ---------------------- |
| `PIPE_SPEED`  | 60        | 每秒钟左移的像素       |
| `PIPE_WIDTH`  | 70        | 碰撞与出屏判定的宽度   |
| `PIPE_HEIGHT` | 430       | 单根管高度，远高于屏幕 |
| `GAP_HEIGHT`  | 90        | 上下管之间的缺口       |
| 生成间隔      | 2 秒      | 决定同屏管道密度       |
| 生成 X        | 屏宽 + 32 | 从屏幕外滑入           |

- 生成时定死 X，之后只减不增
- 管距 = 生成间隔 × 速度，2 秒 × 60 就是 120 像素
- 屏宽 432 除以 120，同屏大约三到四对，密度由此固定
- 想加难度就缩短间隔，比提高管道速度温和得多

## 一根管与一对管

`Pipe` 只描述一根管的位置和朝向，`PipePair` 组合上下两根并统一推进 X。外部只看 `PipePair`，不用关心内部有几张图——这是组合优于平铺的典型场景。

```lua
PipePair = Class{}

local GAP_HEIGHT = 90

function PipePair:init(y)
    self.x = VIRTUAL_WIDTH + 32
    self.y = y
    self.pipes = {
        ['upper'] = Pipe('top', y),
        ['lower'] = Pipe('bottom', y + PIPE_HEIGHT + GAP_HEIGHT)
    }
    self.remove = false
end

function PipePair:update(dt)
    if self.x > -PIPE_WIDTH then
        self.x = self.x - PIPE_SPEED * dt
        self.pipes['upper'].x = self.x
        self.pipes['lower'].x = self.x
    else
        self.remove = true
    end
end
```

X 存了三份：管道对一份、两根管各一份。看似冗余，但 `Bird:collides(pipe)` 只需要一个带 `x`、`y` 的对象，让 `Pipe` 自带坐标比到处传父对象干净。代价是每帧要同步一次，别漏。

初始 X 是 `VIRTUAL_WIDTH + 32`，多出的 32 像素让管道从屏幕外滑进来，不会在第一帧突然贴边。出屏判定写 `self.x > -PIPE_WIDTH` 而不是 `>= 0`：完全滑出左边才标记删除，早删会让最后一帧突然消失。

## 负缩放翻转上管

上管和下管是同一张图。翻转靠 `love.graphics.draw` 的 Y 轴缩放传 `-1`，但缩放以绘制点为原点，直接翻转会把管子画到屏幕上方去。补一个 `PIPE_HEIGHT` 的偏移，就变成原地翻转。

```lua
function Pipe:render()
    love.graphics.draw(
        PIPE_IMAGE,
        self.x,
        self.orientation == 'top' and self.y + PIPE_HEIGHT or self.y,
        0,
        1,
        self.orientation == 'top' and -1 or 1
    )
end
```

`and/or` 在这里当三元用：条件真取 `and` 后面的值，假取 `or` 后面的值。参数位置别记错，第四个是旋转弧度，第五、第六才是 `sx`、`sy`。

## 让相邻管道连得上

如果每对管的 Y 都独立随机，会出现从屏幕顶端直接跳到最底端的断崖，玩家再强也过不去。做法是记住上一对的 Y，只在它附近抖动：

```lua
function PlayState:nextY()
    local y = math.max(
        -PIPE_HEIGHT + 10,
        math.min(self.lastY + math.random(-20, 20), VIRTUAL_HEIGHT - 90 - PIPE_HEIGHT)
    )
    self.lastY = y
    return y
end
```

`math.min` 限制 `y` 的最大值：`y` 越大缺口越低，卡在 `VIRTUAL_HEIGHT - 90 - PIPE_HEIGHT` 就保证缺口底边不会沉到地面以下。`math.max` 限制 `y` 的最小值：`y` 最小到 `-PIPE_HEIGHT + 10`，缺口顶边仍留在屏幕顶部 10 像素内。`lastY` 的初值取 `-PIPE_HEIGHT + math.random(80) + 20`，让第一对管从偏上的位置开始。

难度还可以再拆成两条曲线：生成间隔控制「来得多快」，缺口高度控制「过多难」。课程把两者写死，练习里常见的做法是给 `PipePair(y, gapHeight)` 再加一个参数，随机在 80 到 110 像素之间取值。

```lua
local gapHeight = math.random(80, 110)
table.insert(self.pipePairs, PipePair(y, gapHeight))
```

缺口变小时，下管位置要改成 `y + PIPE_HEIGHT + gapHeight`，否则视觉缺口和判定缺口会对不上。

## 延伸：删除的时机

出屏时不要立刻 `table.remove`，先置 `remove = true`，等遍历结束再统一清理。原因在 `pairs` 的工作方式：

| 操作                         | 结果                             |
| ---------------------------- | -------------------------------- |
| 迭代中删除当前元素           | 后面的元素前移，下一个被跳过     |
| 反向遍历 `for i = #t, 1, -1` | 删除不影响未遍历的下标，可原地删 |
| 先标记、再统一删             | 逻辑最直白，推荐                 |

课程用标记法；等价的写法是倒序删除：

```lua
for i = #self.pipePairs, 1, -1 do
    if self.pipePairs[i].remove then
        table.remove(self.pipePairs, i)
    end
end
```

- 标记到清理之间对象仍在表里，判定与绘制要能容忍离屏的管道
- 等 GC 回收，不必手动释放；真正会漏的是图片，`PIPE_IMAGE` 放类外才只加载一次

生成也能做得更有节奏。课程用 `math.random(-20, 20)` 抖动，另一种做法是按固定步长做正弦起伏，`y = base + amplitude * math.sin(index * 0.6)`，管道高度会形成可预期的波浪，难度曲线比纯随机平滑。
