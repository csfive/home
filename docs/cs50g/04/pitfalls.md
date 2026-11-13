---
title: 容易混淆的问题
description: 哈佛 CS50G Week 4 · 常见误解
---

# 容易混淆的问题

同一个像素坐标，在渲染、碰撞和生成里含义不同；下面这些点最容易在调试时绕圈。

| 容易混淆                | 结论                        |
| ----------------------- | --------------------------- |
| `wasPressed` / `isDown` | 跳跃用前者，走路用后者      |
| `translate` 的正负      | 传负值才是相机右移          |
| 相机取整                | 不取整会出现接缝和抖动      |
| `pointToTile` 越界      | 返回 `nil`，调用前判空      |
| 脚下采样                | 用 `x + 1`、`x + width - 1` |
| 落地修正                | 先减一乘 16，再减 `height`  |
| `tile.x` / 像素         | 格子号从 1 开始             |
| 状态表内容              | 存工厂函数，不是实例        |
| `solid` / `collidable`  | 挡路 / 参与检测             |
| `pairs` 中删除          | 会跳过元素，倒序遍历        |
| 动画归属                | 挂在状态里，随状态重建      |
| `clear` 清哪个表        | 实体和对象分别检查          |
| 相机增量累加            | 会漂，每帧重算              |
| 碰撞修正轴              | 撞墙只改 `x`                |
| `dy` 判断落地           | 不可靠，用状态              |
| 清空按键表              | 必须在 update 之后          |

## 坐标与取整

`camX` 是浮点数，`translate` 接受浮点数也能画。但最近邻放大后，同一行像素的取整结果不同，地面接缝会闪。

```lua
love.graphics.translate(-math.floor(self.camX), -math.floor(self.camY))
```

只取整相机、不取整角色，角色仍会在放大后抖动。绘制精灵前也要 `math.floor(x)`，先确认手里是世界坐标还是屏幕坐标。

背景要在世界坐标之外单独画，UI 要在 `pop` 之后画。把分数放进 `translate` 里，相机会带着分数一起跑。只有世界层才需要 translate。

## 碰撞采样

脚下采样用 `x + 1` 与 `x + width - 1`，不用 `x` 与 `x + width`。后者正好落在精灵右边界外，`pointToTile` 会取到隔壁格，贴墙时误判。采样点用内缩一像素。

```lua
local left  = map:pointToTile(x + 1, y + height)
local right = map:pointToTile(x + width - 1, y + height)
```

头顶检查留 3 像素余量（`x + 3`、`x + width - 3`），否则角色卡在两格之间时会被判撞头，跳不进一格宽的缝。

落地位移减的是 `height`：`tile.y` 是行号，先减一再乘 `TILE_SIZE` 得到格子上边缘，减去角色高度才是左上角坐标。采样点都落在精灵内部，头顶只查一个点，另一侧会穿进砖块。

## 输入

`isDown` 每帧轮询，适合走路；`wasPressed` 是课程自己加的：在 `love.keypressed` 里写表，在 `love.update` 末尾清空。轮询每帧都读。

```lua
function love.update(dt)
    gStateMachine:update(dt)
    love.keyboard.keysPressed = {}
end
```

清空必须放在状态更新之后。放到前面，所有 `wasPressed` 都读到空表，跳跃完全失效；这张表每帧清空，不能跨帧保存，本身只是普通 table。

`love.keypressed` 里只记录按键，不直接切场景。在事件回调里改游戏状态，容易在状态机切换途中重入，打乱当前状态。

## 状态与动画

状态名是字符串，`StateMachine:change` 里先断言，拼错会立刻报错。

```lua
assert(self.states[stateName]) -- state must exist
```

动画对象属于状态，切状态就换 `currentAnimation`。手动改帧号会和状态的 `timer` 脱节，下一帧又被覆盖。字符串没有类型检查，状态表存函数才能绑定实体。

用 `dy == 0` 判断落地并不可靠：跳到最高点时 `dy` 也接近 0，站在移动平台上时也可能不为零。改用状态判断，只有 `idle` 和 `walking` 才接受空格；状态判断比数值判断稳。

## 数组与遍历

`pairs` 遍历时 `table.remove` 会跳过后续元素，症状是「有时候少删一个」。倒序循环不会打乱下标。

```lua
for i = #objects, 1, -1 do
    if objects[i].consumable then
        table.remove(objects, i)
    end
end
```

`#t` 对含 `nil` 的表不可靠，删元素优先用 `table.remove`。实现 `clear` 时两个数组分别检查，把 `entities` 写成 `objects` 会漏删实体。倒序遍历最安全，也可以先收集下标，循环结束再统一删。
