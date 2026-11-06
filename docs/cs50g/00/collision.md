---
title: 碰撞检测
description: 哈佛 CS50G Week 0 · AABB 与反弹
---

# 碰撞检测

2D 游戏最常用的是 AABB：两个不旋转的矩形是否重叠。判定简单，代价是只适合矩形。

## AABB

```lua
function Ball:collides(paddle)
    if self.x > paddle.x + paddle.width or paddle.x > self.x + self.width then
        return false
    end
    if self.y > paddle.y + paddle.height or paddle.y > self.y + self.height then
        return false
    end
    return true
end
```

思路是找“间隙”：

| 条件                               | 含义                   |
| ---------------------------------- | ---------------------- |
| `self.x > paddle.x + paddle.width` | 球的左边在球拍右边之外 |
| `paddle.x > self.x + self.width`   | 球拍的左边在球右边之外 |
| Y 轴同理                           | 上下有间隙             |

两个轴都没有间隙，才算碰撞。

## 碰撞响应

```lua
if ball:collides(player1) then
    ball.dx = -ball.dx * 1.03
    ball.x = player1.x + player1.width

    if ball.dy < 0 then
        ball.dy = -math.random(10, 150)
    else
        ball.dy = math.random(10, 150)
    end
end
```

| 步骤        | 作用                         |
| ----------- | ---------------------------- |
| 反向 `dx`   | 弹回去                       |
| 乘 `1.03`   | 每次碰撞加速，避免无限对拉   |
| 推出球拍    | 防止下一帧仍在矩形内重复碰撞 |
| 随机化 `dy` | 反弹角度不固定               |

推出这一步最容易漏。球每帧移动几个像素，碰撞时已经陷进球拍，不挪出去就会连续触发。

## 墙壁

```lua
if ball.y <= 0 then
    ball.y = 0
    ball.dy = -ball.dy
end

if ball.y >= VIRTUAL_HEIGHT - 4 then
    ball.y = VIRTUAL_HEIGHT - 4
    ball.dy = -ball.dy
end
```

除了反向，还要把位置贴回边界，否则球会短暂穿出屏幕。

## 调试

```lua
love.graphics.rectangle('line', paddle.x, paddle.y, paddle.width, paddle.height)
```

用 `line` 模式画碰撞盒，和 `fill` 的图形叠在一起，能直接看到判定范围。

## 常见坑

- 先移动再判定，还是先判定再移动，顺序要一致
- 高速物体一帧跨过整个球拍，AABB 会漏判
- 只反向不推出，球会卡在矩形里抖动
