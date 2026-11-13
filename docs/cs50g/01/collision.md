---
title: 碰撞检测
description: 哈佛 CS50G Week 1 · AABB 与容错碰撞盒
---

# 碰撞检测

鸟是圆的、管道是锯齿边，判定只用两个矩形。这套 AABB 在 Pong 里已经用过，这一讲只多加一件事：把盒子缩小一点。

## AABB 判定

两个盒子都不旋转，「是否重叠」就退化成四次比较：X 区间有交集，并且 Y 区间也有交集。

```lua
-- 两个区间 [a1, a2] 与 [b1, b2] 有交集的条件
-- a1 <= b2 and b1 <= a2
```

写成一串 `and` 或者拆成两个 `if` 都行，关键是四个不等式同时成立；任何一条不成立就说明至少在一个轴上分离。

用 `>=` 而不是 `>`：像素边界刚好贴住也算碰撞，差一个像素看不出来，判成碰撞对玩家更公平。

## 内缩的碰撞盒

视觉上的鸟比它的像素更胖，因为羽毛和轮廓有透明边。按外接矩形判定，玩家会觉得明明没碰到就死了，所以四边各缩 2 像素：

| 边       | 表达式                     | 说明            |
| -------- | -------------------------- | --------------- |
| `left`   | `self.x + 2`               | 左边内缩 2 像素 |
| `right`  | `self.x + self.width - 2`  | 右边内缩 2 像素 |
| `top`    | `self.y + 2`               | 上边内缩 2 像素 |
| `bottom` | `self.y + self.height - 2` | 下边内缩 2 像素 |

```lua [Bird.lua]
function Bird:collides(pipe)
    local left = self.x + 2
    local right = self.x + self.width - 2
    local top = self.y + 2
    local bottom = self.y + self.height - 2

    return right >= pipe.x and left <= pipe.x + pipe.width
        and bottom >= pipe.y and top <= pipe.y + pipe.height
end
```

右边用 `width - 2`，等价于讲义里的 `(x + 2) + (width - 4)`：左边加 2、总宽减 4，右边自然内缩 2。把「内缩 2」记成一条规则，比记两个魔数清楚。

缩得太多，穿越管道像作弊；缩得太少，玩家会骂判定不公。街机弹幕把判定盒做得比机体小一圈，原因相同。

## 遍历与早退

碰撞要覆盖每一对管的上下两根。外层遍历管道对，内层判两根，命中就切状态：

```lua
for _, pair in ipairs(self.pipePairs) do
    if self.bird:collides(pair.upper) or self.bird:collides(pair.lower) then
        self:die()
        return
    end
end
```

`return` 不能省。`die()` 会 `change('score')`，但当前这一帧的 `PlayState:update` 还在跑，没有 `return` 就会继续命中后面几对管，`die()` 被调用多次，爆炸音效叠成一片。

## 地面与边界

管道之外还有一条水平判定：鸟的底边低于地面顶部就算坠毁。

```lua
if self.bird.y + self.bird.height > VIRTUAL_HEIGHT - 16 then
    self:die()
end
```

`VIRTUAL_HEIGHT - 16` 是地面贴图的上边缘。用 `VIRTUAL_HEIGHT` 会让鸟钻进地面 16 像素才死。屏幕顶端不设判定，飞出去也不死，重力总会把它带回来。

## 穿透与调试

先判碰撞、再加分。这段代码只该出现在 `update` 里，`render` 只读不判。先算碰撞再判分数，鸟贴着管口擦过去时不会出现「先加一分再死」。

穿透是真会发生的：管道每帧移动约 1 像素，鸟下坠时每帧有几到十几像素，一旦 `dt` 因为卡顿跳到 0.3 秒，位移接近 200 像素，直接越过整根 70 像素宽的管。`dt = math.min(dt, 1 / 60)` 就是为这个。

调试时画出碰撞盒，一眼就能看出判定和绘制对不对齐：

```lua
love.graphics.rectangle('line', self.x + 2, self.y + 2, self.width - 4, self.height - 4)
```

发布前删掉，或者用 `DEBUG` 开关包起来。

圆判定看着更贴合鸟，实现却要算圆心距离和半径和，还得处理管道是矩形的情况；鸟的贴图很窄，矩形近似的误差已经被内缩抵消。逐像素读 alpha 通道更精确，但每次检测几十个像素，管道的锯齿边还会让判定形状难以预测，2D 小游戏里几乎不这么干。
