---
title: 随机遇敌
description: 哈佛 CS50G Week 7 · 随机遇敌
---

# 随机遇敌

## 判定位置

判定写在 `PlayerWalkState` 的移动逻辑里，而不是 `Level` 或 `Entity` 里。理由很直接：只有玩家走到新格子时才需要判定，NPC 走动不该触发战斗。

```lua
function PlayerWalkState:checkForEncounter()
    local x, y = self.entity.mapX, self.entity.mapY

    if self.level.grassLayer.tiles[y][x].id == TILE_IDS['tall-grass']
        and math.random(10) == 1 then
        self.entity:changeState('idle')

        gSounds['field-music']:pause()
        gSounds['battle-music']:play()
        ...
    end
end
```

注意 `mapX`、`mapY` 在移动开始时就已经指向目标格，所以这一步判定的是「要走进的那一格」，不是脚下这一格。想改成踩进草地后才判定，就得把调用挪到 tween 的 `finish` 里。调用点在 `attemptMove` 更新完坐标之后、启动 tween 之前，只跑一次。

| 条件 | 判定方式                      | 说明                 |
| ---- | ----------------------------- | -------------------- |
| 地形 | 高草层 `id` 等于 `tall-grass` | 普通草地与空地不触发 |
| 概率 | `math.random(10) == 1`        | 每步 10%             |
| 时机 | 每完成一格                    | 站着不动不掷骰       |

## 10% 意味着什么

`math.random(10)` 均匀返回 1 到 10，取 1 就是十分之一。连续走 `n` 步一次都没遇到高草的概率是 `0.9^n`，期望步数是 10 步。走 20 步仍未遇敌的概率约 12%，玩家会觉得「这地图是不是坏了」，所以实际作品常把草丛入口做得短，或者用递增概率补偿。调参时先算期望步数，再量一下草丛有多宽，比凭感觉改数字稳。

概率写死在一个表达式里，调参就得改代码。更稳的写法是放进数据：

```lua
local ENCOUNTER_RATE = 0.1

if isTallGrass then
    if love.math.random() < ENCOUNTER_RATE then
        -- 进入战斗
    end
end
```

`love.math.random()` 返回 `[0, 1)` 的浮点数，做概率判断比取整更直观，也不会因为 `math.random(10)` 的边界含义记错而变成 11%。

## 用状态做转场

触发之后不是直接 `push(BattleState)`，而是先压一个淡入状态：

```lua
gStateStack:push(FadeInState({r = 1, g = 1, b = 1}, 1, function()
    gStateStack:push(BattleState(self.entity))
    gStateStack:push(FadeOutState({r = 1, g = 1, b = 1}, 1, function() end))
end))
```

白屏 1 秒后，战斗状态压进来，紧接着再压一个淡出状态把白色揭开。三层状态叠在一起，正好对应三件事：遮住、换场景、露出。

用状态而不是回调链做转场，好处是任何一层都能被统一渲染，弹栈顺序也天然正确。代价是调试时栈里层数多，打印 `#gStateStack.states` 比断点更快看清现状。

- 音乐：`pause` 场地曲、`play` 战斗曲，退出时 `resume` 能从原位置接着放
- 触发瞬间把实体切到 `idle`，否则 `finish` 回调会让玩家在淡入期间继续走
- 不切状态的话，战斗结束时人物会站在两格之外的草丛里

## 按区域配置遭遇

单一概率只能表达「这里有怪」，表达不了「这里有什么怪」。把区域与种类分开，加新地图时不用改判定逻辑：

```lua
local encounters = {
    route1 = {
        { id = 'aardart', weight = 40, minLevel = 2, maxLevel = 4 },
        { id = 'pikachu', weight = 20, minLevel = 3, maxLevel = 5 },
    },
}
```

按权重累加后取随机数，命中哪段就取哪个种类。等级在区间内再随机一次，玩家才会遇到强弱不一的目标，而不是每次都一样。

权重是相对值，不必凑成 100。想临时提高某只的出现率，改它一个数字即可，其他种类自动按比例调整。等级区间的两个参数顺序不能反，`math.random(min, max)` 在 `min > max` 时会直接报错，而不是返回反向区间。

## 回到场地

战斗结束弹出战斗状态，露出下面的场地状态。角色还站在触发遇敌的那一格，位置、朝向、地图都没变——这正是状态栈带来的好处，场地状态从未被销毁，只是被盖住且停止更新。恢复音乐用 `field-music:resume()` 写在战斗状态的 `exit` 里：逃跑、胜利、复活三条路径最终都会走到 `pop`，写在各个结束分支里会漏。

两个边界情况：

- 返回后玩家一直按着方向键，下一格会立刻再掷骰，加两秒冷却或要求松手
- 要走进的格子上站着 NPC 时，先判挡住，不该触发遇敌

期望值只是平均值。玩家在草丛里来回走，每一步都重新掷骰，没有保底，连走二十步不遇敌是正常现象。想压掉这种极端体验，就记一个连续未遇敌的步数，每步把概率提高一点，遇到后清零——这是常见的保底做法，参数仍然可以放在数据表里。
