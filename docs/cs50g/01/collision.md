---
title: 碰撞检测
description: 哈佛 CS50G Week 1 · AABB 与容错碰撞盒
---

# 碰撞检测

鸟的形状是圆的，管道是锯齿边，但判定只用两个矩形。这套轴对齐包围盒在 Pong 里已经用过，这一讲只多加了一件事：把盒子缩小一点。

## AABB 判定

AABB（Axis-Aligned Bounding Box）要求两个盒子都不旋转，于是「是否重叠」退化成四次比较：X 区间有交集，并且 Y 区间也有交集。

```lua
-- 两个区间 [a1, a2] 与 [b1, b2] 有交集的条件
-- a1 <= b2 and b1 <= a2
```

写成嵌套 `if` 或一行 `and` 都行，关键是四个不等式必须同时成立。任何一条不成立就说明至少在一个轴上是分离的，直接返回 `false`。

| 边       | 表达式                     | 说明            |
| -------- | -------------------------- | --------------- |
| `left`   | `self.x + 2`               | 左边内缩 2 像素 |
| `right`  | `self.x + self.width - 2`  | 右边内缩 2 像素 |
| `top`    | `self.y + 2`               | 上边内缩 2 像素 |
| `bottom` | `self.y + self.height - 2` | 下边内缩 2 像素 |

用 `>=` 而不是 `>`：像素边界刚好贴住也算碰撞。差一个像素在视觉上根本看不出来，判成碰撞对玩家更公平。

## 内缩的碰撞盒

视觉上的鸟比它实际的像素更「胖」，因为羽毛和轮廓有透明边。如果按外接矩形判定，玩家会觉得明明没碰到就死了。课程把四边各缩 2 像素：

```lua
function Bird:collides(pipe)
    local left = self.x + 2
    local right = self.x + self.width - 2
    local top = self.y + 2
    local bottom = self.y + self.height - 2

    return right >= pipe.x and left <= pipe.x + pipe.width
        and bottom >= pipe.y and top <= pipe.y + pipe.height
end
```

注意右边用的是 `width - 2`，等价于讲义里的 `(x + 2) + (width - 4)`：左边加 2、总宽减 4，右边自然内缩 2。把「内缩 2」记成一条规则，比记两个魔数清楚。

内缩多少是手感问题。缩得太多，穿越管道像作弊；缩得太少，玩家会骂判定不公。街机弹幕游戏普遍把判定盒做得比机体小一圈，原因相同。

## 遍历与早退

碰撞要覆盖每一对管的上下两根。外层遍历管道对，内层判断两根，命中就切状态：

```lua
for _, pair in ipairs(self.pipePairs) do
    if self.bird:collides(pair.upper) or self.bird:collides(pair.lower) then
        self:die()
        return
    end
end
```

`return` 不能省。`die()` 会 `gStateMachine:change('score')`，但当前这一帧的 `PlayState:update` 还在跑；没有 `return`，循环会继续命中后面几对管，`die()` 被调用多次，爆炸音效叠成一片。

`pairs` 与 `ipairs` 在这里都能用，因为管道表是连续数组。`ipairs` 语义更明确：按 1、2、3 遍历，遇到 `nil` 停止，顺序稳定。

| 检测对象 | 判定方式                     | 结果             |
| -------- | ---------------------------- | ---------------- |
| 上管     | `collides(pair.upper)`       | 切 `score`       |
| 下管     | `collides(pair.lower)`       | 切 `score`       |
| 地面     | `bird.y + height > 地面顶部` | 切 `score`       |
| 屏幕顶部 | 不判定                       | 鸟飞出去也会落回 |

## 地面与边界

管道之外还有一条水平判定：鸟的底边低于地面顶部就算坠毁。

```lua
if self.bird.y + self.bird.height > VIRTUAL_HEIGHT - 16 then
    self:die()
end
```

`VIRTUAL_HEIGHT - 16` 是地面贴图的上边缘。用 `VIRTUAL_HEIGHT` 会让鸟钻进地面 16 像素才死，视觉上很怪。屏幕顶端不设判定，飞出去也不死，因为重力总会把它带回来——这是原版就有的宽容设计。

## 延伸：为什么不用圆判定

圆判定看着更贴合鸟的造型，实现却更麻烦：要比较圆心距离与半径和，还得处理管道是矩形的情况。鸟的贴图很窄，矩形近似的误差被内缩抵消掉了，换来的是四次比较就出结果。只有弹幕、物理堆叠这类需要精确接触的场景，才值得上圆形或分体碰撞盒。

另一个选择是逐像素判定，用 `ImageData` 读 alpha 通道。它精确，但每次检测都要读几十个像素，管道的锯齿边还会让判定形状难以预测；在 2D 小游戏里几乎不会这么干。

## 延伸：顺序、穿透与调试

- **先判碰撞，再加分。** 这段代码只该出现在 `update` 里，`render` 只读不判。同一帧里管道既可能被越过也可能被撞上。先算碰撞再判分数，鸟贴着管口擦过去时不会出现「先加一分再死」的荒唐结果。
- **穿透是真的会发生。** 管道每帧移动约 1 像素（`60 × 1/60`），而鸟下坠时每帧能有几像素到十几像素；一旦 `dt` 因为卡顿跳到 0.3 秒，位移接近 200 像素，直接越过整根 70 像素宽的管。这也是 `dt = math.min(dt, 1/60)` 的第二个理由。

调试时可以画出碰撞盒。在 `Bird:render` 末尾加一行，就能看见实际判定范围：

```lua
love.graphics.rectangle('line', self.x + 2, self.y + 2, self.width - 4, self.height - 4)
```

记得发布前删掉，或用 `DEBUG` 开关包起来。判定和绘制用两套坐标时，肉眼对不齐的问题往往只有画出盒子才能发现。若物体速度再高一个数量级，就得换成扫掠判定（把本帧的位移当成线段去求交），AABB 逐帧比较会漏。
