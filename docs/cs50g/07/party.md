---
title: 队伍与数据建模
description: 哈佛 CS50G Week 7 · 队伍与数据建模
---

# 队伍与数据建模

一只 Pokémon 由一张定义表和几个会变的数字组成，队伍只是把它们装进数组。

## 定义表

所有种类写在 `POKEMON_DEFS` 里，用 id 作键：

```lua
POKEMON_DEFS = {
    ['aardart'] = {
        name = 'Aardart',
        battleSpriteFront = 'aardart-front',
        battleSpriteBack = 'aardart-back',
        baseHP = 14,
        baseAttack = 9,
        baseDefense = 5,
        baseSpeed = 6,
        HPIV = 3,
        attackIV = 4,
        defenseIV = 2,
        speedIV = 3
    },
}
```

改数值、加种类都不用碰逻辑代码。设计调整平衡时，风险被限制在一张表里。

- `base*` 是种族基准，同种个体完全一样，玩家看不到
- `*IV` 是个体值，决定每级能涨多少，同样不可见
- id 用小写短横线，和贴图名、存档里的字符串一致；存中文名做键，换语言时存档就废了

## 实例化

```lua
function Pokemon:init(def, level)
    self.name = def.name
    self.baseHP = def.baseHP
    -- 其余 base 与 IV 照抄
    self.level = level
    self.currentExp = 0
    self.expToLevel = self.level * self.level * 5 * 0.75

    self:calculateStats()
    self.currentHP = self.HP
end
```

`calculateStats()` 把 base 值与 IV 按等级折算成 `HP`、`attack`、`defense`、`speed`。折算只在构造和升级时发生，战斗过程中不再重算。

构造末尾把 `currentHP` 设成 `HP`，这是唯一一次满血初始化。之后 `HP` 只增不减，`currentHP` 只减不增（除非治疗）。

| 字段              | 含义         | 谁会改                           |
| ----------------- | ------------ | -------------------------------- |
| `baseHP` 等       | 种族基准     | 永不                             |
| `HPIV` 等         | 个体资质     | 永不                             |
| `level`           | 等级         | `levelUp`                        |
| `HP`、`attack` 等 | 折算后的属性 | `calculateStats`、`statsLevelUp` |
| `currentHP`       | 当前血量     | 战斗伤害、治疗                   |
| `currentExp`      | 已积累经验   | 胜利结算                         |

`HP` 与 `currentHP` 混用是最常见的 bug。用 `currentHP` 算血条比例、用 `HP` 算上限，一旦反过来，满血的角色血条只有一格宽，或者残血还能打满伤害。

## 成长

升级不是简单地每项加一。`statsLevelUp` 对每项属性独立掷三次六面骰，点数小于等于该属性的 IV 就加 1：

```lua
for j = 1, 3 do
    if math.random(6) <= self.attackIV then
        self.attack = self.attack + 1
        attackIncrease = attackIncrease + 1
    end
end
```

IV 上限是 5，而骰子最大是 6，所以每次掷骰都有「不涨」的可能——即使满 IV，三次里也可能漏一次。这个设计让同种个体在十级之后拉开差距。

- 每项属性独立掷三次骰，最多一次升级涨 12 点
- 返回值是四项增量，界面可以直接显示「攻击 +2」
- 已满级的成员不要再累加经验，否则下次战斗一进场就连续升级

`expToLevel` 按 `level² × 3.75` 增长，五级需要约 94 点，十级需要 375 点。经验来自对手的 IV 之和乘等级，低级怪给得少，刷级会越来越慢，这是有意为之的节奏控制。

经验加到谁身上，是个容易漏掉的设计点。课程只给出战的第一只加，队伍其他人不涨；想全队分享就在结算时遍历 `party.pokemon`，每只按相同或递减的比例加。

## Party

`Party` 只包一个数组：

```lua
Party {
    pokemon = {
        Pokemon(POKEMON_DEFS['aardart'], 5)
    }
}
```

`Player` 和 `Opponent` 都有 `party` 字段，所以战斗代码可以用同一套写法取双方的首发：

```lua
self.playerPokemon = self.battleState.player.party.pokemon[1]
self.opponentPokemon = self.battleState.opponent.party.pokemon[1]
```

课程把双方都简化成只有一只。真正的队伍系统要处理换人：当前出战的是 `pokemon[1]`，还是单独记一个 `activeIndex`？

用 `activeIndex` 比「把出战的挪到数组第一位」好。挪位置会让队伍顺序随战斗变化，玩家在菜单里看到的顺序也跟着乱；`activeIndex` 只变一个数字，数组顺序稳定。换人时只改指针，血条读 `party.pokemon[activeIndex].currentHP`。

## 六只上限

官方作品队伍上限是 6。加上限只需在收服的地方判断：

```lua
if #player.party.pokemon >= 6 then
    -- 提示队伍已满，转入 PC 存储或直接失败
else
    table.insert(player.party.pokemon, newPokemon)
end
```

判断放在收服流程里，而不是 `Party` 的构造函数里。构造函数不知道调用方是要建队伍还是要建野生对手——对手队伍同样用 `Party`，给它加上限会让野生训练家也被卡住。

`POKEMON_DEFS` 的键和 `name` 字段看起来重复，职责不同：键用于查表和存档，`name` 只用于显示。改显示名时存档仍然有效，翻译成中文也不会把旧档读废。另外，如果队伍可能为空（全部倒下、全部放生），所有 `pokemon[1]` 的写法都会崩，加一个 `hasUsable()` 判断比到处写 `if #party > 0` 好维护。

## 数据驱动的边界

数据表能解决「数值」，解决不了「行为」。如果每种 Pokémon 都要有独立的战斗表现，把函数塞进定义表会让存档、序列化、热重载全部变难。合理的切法是：定义表只放数字和资源名，行为用统一的公式加少量特殊标记（属性、技能表）表达。

延伸一步：收服条件通常是血量比例。用 `currentHP / HP <= 0.25` 判断，别写死具体数值——`HP` 随等级变，写死 10 点在高等级时等于没有门槛。
