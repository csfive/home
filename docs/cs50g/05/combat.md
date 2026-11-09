---
title: 攻击、受击与无敌帧
description: 哈佛 CS50G Week 5 · 攻击、受击与无敌帧
---

# 攻击、受击与无敌帧

同一个 AABB 算法，配上两个语义不同的矩形：敌人身上那块叫 hitbox，被打中才算；剑挥出去那块叫 hurtbox，碰到就该掉血。

## 两种矩形

课程前几周一直把两者当同一个盒子用，到 Zelda 才分开。区别不在形状，在语义和生命周期。

| 概念    | 谁拥有     | 作用             | 存活时间   |
| ------- | ---------- | ---------------- | ---------- |
| hitbox  | 受击方身体 | 表示"这里能被打" | 一直在     |
| hurtbox | 攻击方武器 | 表示"这里在伤害" | 只有攻击帧 |

敌人没有武器，身体同时充当两者，所以玩家撞上去就会掉血。玩家有剑，剑盒只在 `swing-sword` 状态构造出来，状态一结束就随状态对象一起丢弃。

`Hitbox` 自身只有 `x`、`y`、`width`、`height` 四个字段，没有方法。它不是碰撞逻辑，只是一份坐标。

## 剑的判定盒

方向不同，盒子朝向不同：左右挥是一根竖条，上下挥是一根横条。

```lua
local direction = self.player.direction
if direction == 'left' then
    hitboxWidth, hitboxHeight = 8, 16
    hitboxX = self.player.x - hitboxWidth
    hitboxY = self.player.y + 2
elseif direction == 'right' then
    hitboxWidth, hitboxHeight = 8, 16
    hitboxX = self.player.x + self.player.width
    hitboxY = self.player.y + 2
elseif direction == 'up' then
    hitboxWidth, hitboxHeight = 16, 8
    hitboxX = self.player.x
    hitboxY = self.player.y - hitboxHeight
else
    hitboxWidth, hitboxHeight = 16, 8
    hitboxX = self.player.x
    hitboxY = self.player.y + self.player.height
end
self.swordHitbox = Hitbox(hitboxX, hitboxY, hitboxWidth, hitboxHeight)
```

| 方向    | 宽×高 | `x` 起点           | `y` 起点            |
| ------- | ----- | ------------------ | ------------------- |
| `left`  | 8×16  | `player.x - 8`     | `player.y + 2`      |
| `right` | 8×16  | `player.x + width` | `player.y + 2`      |
| `up`    | 16×8  | `player.x`         | `player.y - 8`      |
| `down`  | 16×8  | `player.x`         | `player.y + height` |

判定复用 `entity:collides(target)`，因为 `Hitbox` 也有 `width`、`height`，接口天然兼容，不必为武器另写一套求交。

## 命中与挥完一圈

`swing-sword` 的 `update` 每帧扫一遍房间里的实体，撞上就扣 1 点。

挥剑状态不读移动输入，人物原地挥完这一圈才回 `idle`。

```lua
for k, entity in pairs(self.dungeon.currentRoom.entities) do
    if entity:collides(self.swordHitbox) then
        entity:damage(1)
        gSounds['hit-enemy']:play()
    end
end

if self.player.currentAnimation.timesPlayed > 0 then
    self.player.currentAnimation.timesPlayed = 0
    self.player:changeState('idle')
end
```

`timesPlayed` 是动画播完整圈时自增的计数器，用它收尾比硬编码计时器更贴合贴图。进入状态时先把挥剑音效 `stop()` 再 `play()`，否则连续挥剑第二次会没声音。

`wasPressed('space')` 在挥剑状态里也检查一次，所以连按可以立刻重开一遍挥剑动画。

## 受击与无敌

掉血的入口统一在碰撞处，受击方只做减法。

```lua
if not entity.dead and self.player:collides(entity)
    and not self.player.invulnerable then
    gSounds['hit-player']:play()
    self.player:damage(1)
    self.player:goInvulnerable(1.5)

    if self.player.health == 0 then
        gStateMachine:change('game-over')
    end
end
```

`goInvulnerable(1.5)` 只是打开标志并记下时长，真正的倒计时在 `Entity:update` 里走。倒计时结束后清掉标志和计时器。

无敌期间绘制会闪：每累计 0.06 秒把颜色设成 `alpha = 64/255`，画完再恢复。它不影响逻辑，只是给玩家一个明确的"这段时间打不到你"的信号。

| 血量 | 显示           | 含义           |
| ---- | -------------- | -------------- |
| 6    | 三颗满心       | 满血           |
| 5    | 两颗满心加半心 | 掉半颗         |
| 1    | 半颗心         | 再挨一下结束   |
| 0    | 零颗心         | 切 `game-over` |

一颗心记 2 点，所以半心是 1 点。这个换算让"半颗心"这种 Zelda 标志性的状态可以用整数表示。

## 判定与无敌的时间线

挥剑动画四帧、间隔 0.05 秒，一圈 0.2 秒。剑盒的寿命就是这 0.2 秒。

- 进入状态立刻构造剑盒，不等动画走到某一帧
- 每帧扫一遍房间实体，命中就扣血
- 动画回到第 1 帧时 `timesPlayed` 加一，随即退出状态
- 方向来自上一次走动的朝向，`idle` 不重置它

按 60 FPS 算，0.2 秒里大约有 12 次 `update`。同一次挥剑会对同一个敌人反复判定，所以把血量调成 3 就会看到一刀扣三点。敌人只有 1 点血，这个缺陷才被掩盖住。

`goInvulnerable(1.5)` 只做两件事：置标志、记时长。倒计时在 `Entity:update` 里累加，超过时长才把三个字段一起清零。

| 时刻     | 状态                     |
| -------- | ------------------------ |
| 0 秒     | 掉 1 点血，进入无敌      |
| 0–1.5 秒 | 不受伤，每 0.06 秒闪一次 |
| 1.5 秒后 | 恢复可受伤，闪烁停止     |

闪烁用 `flashTimer > 0.06` 判断并把 alpha 设成 `64/255`，下一帧再恢复。它只在 `render` 里生效，不参与任何判定。

## 延伸：判定盒的帧数据

讲义的剑盒在整个挥剑动画期间都有效，且每帧都能造成伤害。敌人只有 1 点血，所以看不出问题；一旦血量调高，一刀会打出好几段伤害。

正规做法是给攻击分三段相位：

- 起手（windup）：盒子存在但不判定
- 命中（active）：只判定一次，或带 0.1 秒的冷却
- 收招（recovery）：盒子再次失效

调试时把判定盒画出来最快。每个状态的 `render` 末尾都留着这段注释代码，取消注释即可看到玩家碰撞盒与剑盒的紫色边框：

```lua
love.graphics.setColor(255, 0, 255, 255)
love.graphics.rectangle('line', self.player.x, self.player.y,
    self.player.width, self.player.height)
love.graphics.rectangle('line', self.swordHitbox.x, self.swordHitbox.y,
    self.swordHitbox.width, self.swordHitbox.height)
love.graphics.setColor(255, 255, 255, 255)
```

判定盒比贴图小是常态：贴图有挥动的轨迹和特效，判定只覆盖剑身最实的那一段，玩家才不会觉得"明明没碰到却掉血"。判定框的尺寸与存在时长，才是这套系统真正的平衡参数。
