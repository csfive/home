---
title: 管道生成
description: 哈佛 CS50G Week 1 · 计时生成与管道对
---

# 管道生成

关卡不是手工摆的，而是用计时器每隔一段时间在屏幕右边缘造一对管，让它以固定速度左移。

## 计时生成

`dt` 是每帧经过的秒数，累加到变量上，超过阈值就生成并清零，与帧率无关。

```lua
function PlayState:update(dt)
    self.timer = self.timer + dt

    if self.timer > 2 then
        table.insert(self.pipePairs, PipePair(self:nextY()))
        self.timer = 0
    end
end
```

`table.insert(t, v)` 追加到 `#t + 1`，不用维护下标。

| 常量          | 讲义取值  | 作用                   |
| ------------- | --------- | ---------------------- |
| `PIPE_SPEED`  | 60        | 每秒钟左移的像素       |
| `PIPE_WIDTH`  | 70        | 碰撞与出屏判定的宽度   |
| `PIPE_HEIGHT` | 430       | 单根管高度，远高于屏幕 |
| `GAP_HEIGHT`  | 90        | 上下管之间的缺口       |
| 生成间隔      | 2 秒      | 决定同屏管道密度       |
| 生成 X        | 屏宽 + 32 | 从屏幕外滑入           |

管距 = 生成间隔 × 速度，2 秒 × 60 就是 120 像素；屏宽 432 除以 120，同屏大约三到四对。想加难度就缩短间隔，比提高管道速度温和得多。

## 一根管与一对管

`Pipe` 只描述一根管的位置和朝向，`PipePair` 组合上下两根并统一推进 X，外部只看 `PipePair`。

```lua [PipePair.lua]
PipePair = Class{}

function PipePair:init(y)
    self.x = VIRTUAL_WIDTH + 32
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

X 存了三份：管道对一份、两根管各一份。看似冗余，但 `Bird:collides(pipe)` 只要一个带 `x`、`y` 的对象，让 `Pipe` 自带坐标比到处传父对象干净，代价是每帧同步一次。

初始 X 是 `VIRTUAL_WIDTH + 32`，多出的 32 像素让管道从屏幕外滑进来。出屏判定写 `self.x > -PIPE_WIDTH`：完全滑出左边才标记删除，早删会让最后一帧突然消失。

## 翻转与抖动

上下管是同一张图，翻转靠 `draw` 的 Y 轴缩放传 `-1`。缩放以绘制点为原点，直接翻会把管子画到屏幕上方，补一个 `PIPE_HEIGHT` 的偏移就变成原地翻转。

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

`and/or` 在这里当三元用。参数位置别记错：第四个是旋转弧度，第五、第六才是 `sx`、`sy`。

每对管的 Y 都独立随机，会出现从顶端直接跳到最底端的断崖，玩家再强也过不去。所以记住上一对的 Y，只在附近抖动：

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

`math.min` 卡住 `y` 的上限，保证缺口底边不沉到地面以下；`math.max` 卡住下限，缺口顶边仍留在屏幕顶部 10 像素内。`lastY` 初值取 `-PIPE_HEIGHT + math.random(80) + 20`。

## 删除的时机

出屏时不要立刻 `table.remove`，先置 `remove = true`，遍历结束再统一清理。

| 操作                         | 结果                             |
| ---------------------------- | -------------------------------- |
| 迭代中删除当前元素           | 后面的元素前移，下一个被跳过     |
| 反向遍历 `for i = #t, 1, -1` | 删除不影响未遍历的下标，可原地删 |
| 先标记、再统一删             | 逻辑最直白                       |

标记到清理之间对象仍在表里，判定与绘制要能容忍离屏的管道。真正会漏的是图片，`PIPE_IMAGE` 放类外才只加载一次。
