---
title: 实体定义与动画数据
description: 哈佛 CS50G Week 5 · 实体定义与动画数据
---

# 实体定义与动画数据

实体不是一个个写死的类，而是一张数据表加一个通用构造函数。换贴图、调速度、加怪物都发生在表里，不碰逻辑。

## 定义表的结构

`ENTITY_DEFS` 是一个全局常量表，键是实体类型名，值是它的全部属性。全局 + 全大写只是命名约定，Lua 不阻止你改它。

```lua
ENTITY_DEFS = {
    ['player'] = {
        walkSpeed = PLAYER_WALK_SPEED,
        animations = {
            ['walk-left'] = {
                frames = {13, 14, 15, 16},
                interval = 0.155,
                texture = 'character-walk'
            },
            ['idle-left'] = { frames = {13}, texture = 'character-walk' }
        }
    },
    ['skeleton'] = {
        texture = 'entities',
        animations = {
            ['walk-left'] = { frames = {22, 23, 24, 23}, interval = 0.2 }
        }
    }
}
```

`frames` 是图集里的格子编号，不是坐标；`interval` 是两帧之间的秒数；`texture` 是 `gTextures` 的键。整张表在 `Dependencies.lua` 里被 `require` 一次，之后所有实体共享同一份数据。

`frames` 可以重复写同一个编号，骷髅的 `{22, 23, 24, 23}` 就是左右摆动的走法。单帧动画把 `frames` 写成 `{13}`，`Animation:update` 发现长度是 1 就完全跳过计时。

## 从数据造动画

`Entity:createAnimations` 遍历定义表，为每个键生成一个 `Animation` 对象。

```lua
function Entity:createAnimations(animations)
    local animationsReturned = {}
    for k, animationDef in pairs(animations) do
        animationsReturned[k] = Animation {
            texture = animationDef.texture or 'entities',
            frames = animationDef.frames,
            interval = animationDef.interval
        }
    end
    return animationsReturned
end
```

| 字段       | 含义             | 缺省       |
| ---------- | ---------------- | ---------- |
| `frames`   | 图集格子编号数组 | 必填       |
| `interval` | 帧间隔秒数       | 必填       |
| `texture`  | 纹理名           | `entities` |
| `looping`  | 是否循环         | `true`     |

`Animation` 还维护三个内部字段，它们决定动画怎么推进：

- `currentFrame` 指向 `frames` 数组里的第几项
- `timer` 每帧加 `dt`，用取模保留余数，不因截断而变慢
- `timesPlayed` 在回到第 1 帧时加一，挥剑状态靠它判断一圈播完
- `refresh()` 把三者一起清零，连按空格重开挥剑就是调它

`Animation:init` 写的是 `def.looping or true`，传 `false` 也会变回 `true`，所以只播一次要靠状态在 `timesPlayed` 之后切走，而不是指望这个字段。

`entities.png` 是 192×128，切成 12 列 8 行共 96 格；`tilesheet.png` 是 304×208，19 列 13 行共 247 格。定义表里的 `frames` 编号都落在这个范围内，一处越界就会画出空图。

## 实体字段

`Entity:init(def)` 把定义摊平成字段，缺省值在构造时补。

| 字段           | 用途                 | 来源                 |
| -------------- | -------------------- | -------------------- |
| `x`、`y`       | 碰撞盒左上角         | 调用方传入           |
| `width`        | 碰撞盒宽             | 调用方传入           |
| `height`       | 碰撞盒高             | 调用方传入           |
| `walkSpeed`    | 每秒像素             | 定义表，敌人缺省 20  |
| `health`       | 血量                 | 调用方传入，敌人给 1 |
| `offsetX`      | 绘制偏移             | 定义表或状态里改     |
| `dead`         | 是否已死，供渲染跳过 | 构造时 `false`       |
| `invulnerable` | 无敌标志             | 构造时 `false`       |

房间生成敌人时只从定义表取 `animations` 与 `walkSpeed`，坐标、尺寸、血量在 `Room:generateEntities` 里现给。这样同一份定义既能给玩家用，也能给随机刷出的怪用。

`Entity:init` 里只有绘制偏移用 `or 0` 兜底；`walkSpeed` 不在这里处理，缺省值由调用方决定，敌人就是靠 `ENTITY_DEFS[type].walkSpeed or 20` 拿到 20。

## 物件定义

`GAME_OBJECT_DEFS` 用同一套思路描述非生物：开关、罐子、宝箱。区别是多了 `states` 表，状态名映射到帧号。

```lua
['switch'] = {
    type = 'switch',
    texture = 'switches',
    width = 16, height = 16,
    solid = false,
    defaultState = 'unpressed',
    states = {
        ['unpressed'] = { frame = 2 },
        ['pressed']   = { frame = 1 }
    }
}
```

`solid` 标注它是否挡路，但讲义代码里没有任何地方读这个字段；`defaultState` 决定出生时用哪一帧，渲染时再用 `states[state].frame` 取当前该画哪一格。`GameObject:init` 还会把 `onCollide` 预置成空函数，所以忘记绑回调用不会报错，只是物件变成纯装饰。讲义分发包里罐子的那条定义是空的，这正是作业要填的位置。

## 敌人怎么被造出来

房间不关心具体怪物长什么样，从名字数组里随机抽一个，再去定义表取动画。

```lua
local types = {'skeleton', 'slime', 'bat', 'ghost', 'spider'}

for i = 1, 10 do
    local type = types[math.random(#types)]
    table.insert(self.entities, Entity {
        animations = ENTITY_DEFS[type].animations,
        walkSpeed  = ENTITY_DEFS[type].walkSpeed or 20,
        width = 16, height = 16, health = 1,
        x = math.random(...), y = math.random(...)
    })

    self.entities[i].stateMachine = StateMachine {
        ['walk'] = function() return EntityWalkState(self.entities[i]) end,
        ['idle'] = function() return EntityIdleState(self.entities[i]) end
    }
    self.entities[i]:changeState('walk')
end
```

状态机在实体构造完之后才挂上去，因为状态工厂每次都要拿实体自身的引用。这也意味着 `changeState` 不能写在 `Entity:init` 里，那时 `stateMachine` 还是 `nil`。

`walkSpeed` 只有 `player` 在定义表里写了，敌人一律落到 `or 20`。想让某种怪更快，在它的定义里加一行即可，代码不用动。

| 类型     | 走速来源 | 血量 | 尺寸  |
| -------- | -------- | ---- | ----- |
| `player` | 60       | 6    | 16×22 |
| 其余五种 | 缺省 20  | 1    | 16×16 |

十个怪物的坐标各自独立随机，没有任何防重叠检查，所以小概率会有两只叠在同一处。它能跑，只是看起来像一只。

## 延伸：数据出错怎么查

数据驱动把错误从编译期推到了运行期，键名写错不会报错，只会 `nil`。

- `StateMachine:change` 里有 `assert(self.states[stateName])`，状态名写错会立刻炸
- 动画名没有断言，`changeAnimation('walk-dwon')` 只会让 `currentAnimation` 变 `nil`
- 图集编号差一位不会报错，只会画出隔壁那格，用编号脚本核对最省事
- `print_r(ENTITY_DEFS['player'])` 能把嵌套表整棵打出来，比逐层 `print` 快

```lua
-- 在 init 里加一道自检，缺资源时早点失败
for name, anim in pairs(self.animations) do
    assert(anim.frames and #anim.frames > 0, 'empty frames: ' .. name)
end
```

代价是启动变慢一点，收益是错误信息带上了动画名，排查时间从几分钟降到几秒。自检要放在构造函数之后、第一次 `changeState` 之前，否则报错会晚一步。
