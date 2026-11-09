---
title: 关卡与计分
description: 哈佛 CS50G Week 6 · 关卡与计分
---

# 关卡与计分

关卡是一组数据的组合：一个 world、几只敌人、几块障碍、一只待发射的鸟。把布局写成表，换关卡就是换表。

## Level 的组成

课程把物理世界、实体列表和渲染都收进 `Level` 类，`PlayState` 只负责相机和状态切换。

| 成员              | 作用           |
| ----------------- | -------------- |
| `world`           | 物理模拟       |
| `launchMarker`    | 拖拽与轨迹预览 |
| `aliens`          | 敌人列表       |
| `obstacles`       | 可破坏障碍     |
| `destroyedBodies` | 延迟销毁队列   |
| `background`      | 视差背景       |

`Level:update` 的顺序固定：先更新发射器，再用固定步长推进 world，然后销毁队列，接着清理数组，最后判断是否重置发射器。固定步长的累加器也放在这里，物理速度不受渲染帧率影响。

顺序错了会出问题。发射器在 world 更新前创建新 body，才能在同一帧参与碰撞；数组清理必须在销毁之后，否则留下悬空引用。

## 摆放关卡

障碍的尺寸只有两种：横向 110×35，纵向 35×110。坐标是中心点，所以 y 要减去半个高度，才能刚好落在地面上。

```lua
local layout = {
    { shape = 'vertical',   x = VIRTUAL_WIDTH - 120, y = VIRTUAL_HEIGHT - 90 },
    { shape = 'vertical',   x = VIRTUAL_WIDTH - 35,  y = VIRTUAL_HEIGHT - 90 },
    { shape = 'horizontal', x = VIRTUAL_WIDTH - 80,  y = VIRTUAL_HEIGHT - 162.5 },
}
```

地面是静态 body 加一条 `EdgeShape`，用 `love.physics.newEdgeShape(...)` 创建，长度是三个屏幕宽，从 `-VIRTUAL_WIDTH` 一直铺到 `2 * VIRTUAL_WIDTH`。相机左右各滚一屏，底下始终有地。

敌人放在障碍后面，鸟从左边发射。想加难度就加一层障碍或把敌人埋得更深，不需要改代码逻辑。

## 材质与生命值

课程 demo 只有木头，一击就碎。作业要求三种材质，用命中次数区分：

| 材质 | 命中次数 | 表现           |
| ---- | -------- | -------------- |
| 玻璃 | 1        | 直接碎裂       |
| 木头 | 2        | 第二击出现裂纹 |
| 金属 | 3        | 两段裂纹       |

生命值存在实体上，碰撞回调只负责扣血，不直接销毁：

```lua
function Obstacle:hit()
    self.hp = self.hp - 1

    if self.hp <= 0 then
        table.insert(self.level.destroyedBodies, self.body)
    else
        self.frame = self.frames[self.hp]
    end
end
```

`frames` 是按剩余血量索引的贴图表，`hp` 为 2 显示浅裂纹，为 1 显示深裂纹。这样贴图切换与物理状态解耦，改美术不用碰碰撞代码。

实体需要持有 `level` 或 `destroyedBodies` 的引用，回调本身拿不到关卡对象。

`userData` 只能告诉你“这是障碍”，分不出材质。要么把实体表设为 `userData`，要么维护 `fixture → entity` 的映射。

## 胜利与重开

课程的胜利条件很简单：`aliens` 清空。它没有失败判定，鸟可以无限发射，只有敌人全灭才会回到标题。

敌人不只能被鸟直接命中：障碍倒下砸中它，只要接触速度过阈值，同样算消灭。

```lua
if self.launchMarker.launched then
    local x, y = self.launchMarker.alien.body:getPosition()
    local vx, vy = self.launchMarker.alien.body:getLinearVelocity()

    if x < 0 or math.abs(vx) + math.abs(vy) < 1.5 then
        self.launchMarker.alien.body:destroy()
        self.launchMarker = AlienLaunchMarker(self.world)

        if #self.aliens == 0 then
            gStateMachine:change('start')
        end
    end
end
```

`speed < 1.5` 是“鸟基本停下”的判定。阈值太小，鸟会一直滚，永远不换下一只；太大，鸟还在飞就被回收。

课程没有鸟数上限，作业要求按空格一次放出三只。加一个 `birdsLeft` 字段，发射时减一，减到 0 且场上还有敌人就判负；三只鸟属于同一次发射，只扣一次。

- 标题页也是物理场景：`StartState` 建了一个世界，让 100 只随机敌人落在地面上
- 状态机只有 `start` 与 `play`，点击标题页进入 `play`，胜利后回到 `start`
- 重开关卡要重建 `Level`，也就是重建 world；只清数组不够，旧 body 还挂在旧世界里

## 计分

课程 demo 不记分，通关只画一行 `VICTORY`。作业的星级评价需要自己维护分数，常见来源是摧毁物、剩余鸟和剩余时间。

```lua
local POINTS = { glass = 100, wood = 200, metal = 300, alien = 1000 }

function PlayState:addScore(kind)
    self.score = self.score + POINTS[kind]
end
```

| 事件     | 参考分值 |
| -------- | -------- |
| 击碎玻璃 | 100      |
| 击碎木头 | 200      |
| 击碎金属 | 300      |
| 消灭敌人 | 1000     |
| 剩余鸟   | 5000     |

分值表只是设计选择，不是课程规定。关键是加分只能发生一次：一个 body 可能触发多次接触，用 `isDestroyed` 或实体上的 `scored` 标记去重。

剩余鸟的奖励在结算时一次性加上，不要在发射时就算进总分。星级可以按总分分档，也可以按“用了几只鸟”单独计算。

## 常见坑

- 在碰撞回调里改数组，遍历到一半崩溃
- 忘记清空 `destroyedBodies`，同一个 body 被销毁多次
- 重开关卡只清数组，没重建 world
- 障碍坐标按左上角算，整体陷进地面
- 鸟停下阈值太小，卡在场上不换鸟
- 分数在每次接触时加，一块木头加了几百分
- 敌人在胜利判定前就被移出数组，永远赢不了
