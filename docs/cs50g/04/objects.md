---
title: 游戏对象
description: 哈佛 CS50G Week 4 · 游戏对象
---

# 游戏对象

不是所有东西都需要状态机。砖块、宝石、灌木的位置固定，只在被碰到时做一件事。

## 与实体的分工

判断标准：需要自己决定下一步做什么的是实体，只对别人做出反应的是游戏对象。实体有状态，对象没有，也不随帧改变位置；对象不参与相机。

| 维度 | 实体 `Entity` | 游戏对象 `GameObject` |
| ---- | ------------- | --------------------- |
| 位置 | 会移动        | 固定                  |
| 行为 | 状态机        | 回调函数              |
| 更新 | 每帧 `update` | 空实现                |
| 典型 | 玩家、蜗牛    | 砖块、宝石、灌木      |

这不是引擎的硬性分类。有的引擎把所有东西都叫 GameObject，也有用组件拼装的 ECS；课程这样分，是为了让有状态的东西和被动的对象各自简单。对象没有行为时保留空实现即可，只保存回调。

## 四个标志位

| 字段         | 作用                         |
| ------------ | ---------------------------- |
| `collidable` | 参与碰撞检测                 |
| `solid`      | 会把玩家挡在外面             |
| `consumable` | 碰到后移除并触发 `onConsume` |
| `hit`        | 一次性开关，防止重复触发     |

`collidable` 与 `solid` 可以分开：可碰撞但不实心，就会触发效果却不挡路。灌木只装饰，`collidable = false`，永远不会进入碰撞循环。标志决定交互方式。

`hit` 不是通用字段，而是砖块这类对象自己用的约定，创建时显式传 `hit = false`。四个标志互相独立，可以组合出不同交互。

## 砖块与宝石

砖块在生成时挂一个 `onCollide`，第一次被顶时按 1/5 概率生成宝石；宝石自己是 `consumable`，挂 `onConsume`。

```lua
onCollide = function(obj)
    if not obj.hit then
        if math.random(5) == 1 then
            local gem = GameObject {
                texture = 'gems',
                x = obj.x, y = obj.y - 4,
                width = 16, height = 16,
                frame = math.random(#GEMS),
                consumable = true,
                solid = false,
                onConsume = function(player)
                    gSounds['pickup']:play()
                    player.score = player.score + 100
                end
            }
            Timer.tween(0.1, { [gem] = { y = obj.y - 20 } })
            gSounds['powerup-reveal']:play()
            table.insert(objects, gem)
        end
        obj.hit = true
    end
    gSounds['empty-block']:play()
end
```

回调接收对象自己，闭包捕获生成时的 `x`、`blockHeight` 等局部变量。`Timer.tween` 在 0.1 秒内把宝石的 `y` 插值到目标位置，做出从砖块里弹出来的效果。回调里的分数改动立即生效。

闭包同时捕获 `objects`，新宝石插入同一数组。宝石上浮结束就停住，不再下落，因为 tween 只改 `y`。

## 回调发生的时机

| 玩家状态  | 交互            | 结果             |
| --------- | --------------- | ---------------- |
| `jump`    | 头顶撞到 solid  | 触发 `onCollide` |
| `falling` | 落到 solid 上   | 停住，不触发回调 |
| 任意      | 碰到 consumable | 触发 `onConsume` |

砖块只在 `jump` 状态被顶时触发 `onCollide`，因为只有那里检查头顶。从侧面撞砖块不会掉宝石，站在砖块上也不会。

同一帧里状态先更新，回调随后触发。回调里直接改 `player.score` 和 `gSounds`，简单，但对全局有依赖。对象多了可以改成事件，回调只做一件事。

回调里不该做的事：

- 直接改状态机
- 遍历中删数组
- 在 `render` 里触发
- 重复播放音效

## 纹理与碰撞盒

`GameObject` 只存 `texture` 和 `frame`，没有 `Animation`，因为大多数静态物件只有一帧。单帧物件不必建动画对象；要动画的物件得自己加一个 `Animation`，并在 `update` 里推进。

`width` 和 `height` 是碰撞盒，贴图可以更大或更小。宝石视觉上 16×16，盒子缩到 10×10，拾取会明显更顺手；砖块要顶得准，盒子就该和贴图一致。两者不一致时以盒子为准。

`GameObject:render` 只做一次 `love.graphics.draw`，不碰 `push`/`pop`。对象没有 `direction` 字段，需要翻转就在 `render` 里自己传负的缩放。绘制坐标也要取整，避免抖动。

## 数组与绘制顺序

游戏对象放在 `level.objects`，实体放在 `level.entities`。拾取后元素被删除，遍历时要小心，不要边删边跳。对象按数组顺序绘制，后插入的盖在上面。

`pairs` 遍历中 `table.remove` 会打乱后续键，常见症状是「有时少删一个」。安全写法是倒序数值循环，或先收集再统一删；倒序循环最稳。

检查 `clear` 的实现：实体循环里如果仍写 `self.objects[i]`，查的是对象表、删的是实体表，索引对不上就会漏删。删除后同一帧不要再访问它，同一帧也不要重复拾取。列表统一清理更可读；对象之间不互相更新，数组只由关卡读写。

- 建一个 `GameObject` 表
- 设位置与尺寸
- 选碰撞盒大小
- 挂需要的回调
- 插进 `level.objects`
- 检查绘制层级
- 不在回调里重建数组
