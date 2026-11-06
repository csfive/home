---
title: 容易混淆的问题
description: 哈佛 CS50G Week 2 · 容易混淆的问题
---

# 容易混淆的问题

| 容易混淆                    | 区别                                        |
| --------------------------- | ------------------------------------------- |
| 状态表存类还是实例          | 存的是工厂函数，每次 `change` 新建实例      |
| `init` 与 `enter`           | `init` 只在建对象时跑，`enter` 每次切换都跑 |
| 旧状态的数据                | 传出去的是引用，没传的随实例丢弃            |
| `exit` 与垃圾回收           | 课程不重写 `exit`，清理靠 GC                |
| `isDown` 与 `wasPressed`    | 持续移动用前者，一次性确认用后者            |
| `quad` 与 `image`           | image 是整张纹理，quad 只是矩形窗口         |
| `size` 与 `width`           | `size` 只改绘制，`width` 才是碰撞盒         |
| `px` 与 `py`                | 两轴穿透深度，小的那个才是反弹轴            |
| 砖块碰撞要不要 `break`      | 不 break 会双轴反转，球原路返回             |
| `dy` 封不封顶               | 不封顶时高速会穿过砖块                      |
| `recoverPoints` 与 `health` | 前者是分数门槛，后者是心数                  |
| 满血时回血                  | 阈值照样翻倍，心数不变                      |
| 砖块 `inPlay`               | false 后仍在表里，不能靠长度判空            |
| 存档写入方式                | 整表覆盖，不是增量追加                      |

## 三个补充

**`wasPressed` 不是 LÖVE 原生函数。** 课程在 `main.lua` 里给 `love.keyboard` 挂了 `keysPressed` 表，`keypressed` 时置位，`update` 末尾清空；只复制状态文件到别的项目，`wasPressed` 会直接报 nil。**`math.random(-50, -60)` 的上下界也是反的。** LuaJIT 会自动交换，标准 Lua 5.1 抛 `interval is empty`，可移植写法是 `math.random(-60, -50)`。

**`highScoreIndex` 少了一个 `local`。** `GameOverState` 里它落到了全局表，功能能跑但会留下上一局的值。同一个函数里的 `local scoreIndex = 11` 反而从没被用到。

## 一条判断原则

遇到「画的和碰的不一致」，先看状态字段和绘制参数是不是同一套。`Paddle` 的 `size` 改了绘制宽度，`width` 没动，两者就会分叉；`Brick` 的 `color` 同时决定外观和分值，所以从来不会不同步。

排查顺序：

- 先确认碰撞盒和绘制用的是同一组字段
- 再看碰撞循环里有没有提前 `break`
- 最后检查移动量有没有乘 `dt`

## 先查数据还是先查绘制

先在 `render` 里打印关键字段，确认数据和预期一致，再去看 `draw` 的坐标。数据已经错了的时候调坐标，只会把问题挪到下一帧。

这条顺序能省掉一半的猜测：状态传参、`inPlay`、`size` 都属于数据层，quad 下标和坐标属于绘制层。
