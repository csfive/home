---
title: Pokémon
description: 哈佛 CS50G Week 7 主题清单
---

# Pokémon

[Week 7 · Pokémon](https://cs50.harvard.edu/games/weeks/7/ '哈佛 CS50G Week 7：视频、讲义、源码和项目')

[课后练习答案](https://github.com/csfive/CS50G/tree/main/07-pokemon '非官方，仅供参考')

## [界面组件](/cs50g/07/gui)

- `Panel` 是两个圆角矩形的叠加
- 外框白色，内框 `56/255` 深灰，内缩 2px
- `love.graphics.rectangle` 第五个参数是圆角半径
- `Panel:toggle()` 翻转 `visible`
- `Textbox` 在构造时内嵌一个 `Panel`
- `font:getHeight()` 取行高
- `font:getWrap(text, width)` 返回行宽表与分行表
- `maxLines` 由框高、行高、行距算出
- `chunkCounter` 记住下一屏从第几行开始
- `endOfText` 与 `closed` 是两个独立标志
- `Selection` 的每项含 `text` 与 `onSelect`
- `gapHeight = height / #items` 均分行距
- 上下键在 `1` 与 `#items` 之间回绕
- 回车只调用 `items[currentSelection].onSelect()`
- `Menu` 是 `Panel` 与 `Selection` 的组合
- `ProgressBar` 的填充宽度是 `value / max * width`

## [状态栈](/cs50g/07/state-stack)

- 状态机同一时刻只有一个状态
- 状态栈用 `states` 数组保存多层状态
- 栈顶是 `states[#states]`
- `push` 追加到末尾并调用 `state:enter()`
- `pop` 先调 `exit()` 再 `table.remove`
- `update` 只更新栈顶
- `render` 从底到顶全部绘制
- 不更新就不动，因此下层状态自然冻结
- `BaseState` 提供四个空方法做基类
- 状态可以自己检测关闭并 `pop`
- 对话框、菜单、淡入淡出都靠压栈
- 实际操作栈深只有几层

## [地图与瓦片](/cs50g/07/tiles)

- `Tile(x, y, id)` 只存网格坐标与贴图编号
- `TileMap` 用 `tiles[y][x]` 存二维表
- `TILE_IDS` 把地形名映射成编号
- 地图按 50×50 瓦片生成
- `baseLayer` 铺满随机草地
- `grassLayer` 只在高草区放高草
- 高草贴图透明，必须靠底层草打底
- 层数不设上限，装饰与遮挡各占一层
- 渲染顺序决定谁盖住谁
- 地形判定只比较 `id`
- 像素坐标由 `(mapX - 1) * TILE_SIZE` 得到
- 生成式地图用 `math.random` 选草地变体
- 地图数据也可以从文本或 Tiled 导出

## [网格移动与动画](/cs50g/07/movement)

- 实体同时有 `mapX`、`mapY` 与像素坐标
- 网格坐标立刻改，像素坐标用 tween 追
- `Timer.tween(0.5, {[entity] = {x = ..., y = ...}})`
- `:finish` 回调里再判断是否继续走
- 移动途中不接受新方向
- `direction` 取 `left`、`right`、`up`、`down`
- 动画名按 `walk-<direction>` 拼出
- `changeState` 管 `walk` 与 `idle`
- 动画由 quad 表与帧间隔组成
- `love.graphics.newQuad` 切精灵图
- 撞到边界只切动画不位移
- 0.5 秒一格是节奏参数

## [随机遇敌](/cs50g/07/encounters)

- 遇敌判定写在 `PlayerWalkState` 里
- 判定要走进的那一格是否为高草
- `math.random(10) == 1` 即每步一成
- 停下不掷骰，站着不会遇敌
- 触发后先切 `idle` 锁住移动
- 场地音乐 `pause`，战斗音乐 `play`
- 先压 `FadeInState` 再压 `BattleState`
- 淡入淡出本身也是状态
- `FadeOutState` 负责反过来揭开画面
- 战斗状态压在上面，`pop` 后回到原地
- 概率与步长共同决定期望步数

## [回合制战斗](/cs50g/07/battle)

- `BattleState` 持有双方 `party` 与两条血条
- 血条 `value` 用 `currentHP`，`max` 用 `HP`
- `BattleMessageState` 承担所有台词
- 嵌套回调串起「野生的 X 出现了」
- `BattleMenuState` 给出 Fight 与 Run
- 速度高者先手
- `firstPokemon`、`secondPokemon` 指针简化调用
- 伤害 `math.max(1, attack - defense)`
- `Timer.every` 加 `:limit(6)` 做闪烁
- 血条 tween 结束才写回 `currentHP`
- `checkDeaths` 只看 `currentHP <= 0`
- 对手倒下进胜利结算，玩家倒下进复活
- 逃跑退出战斗，回到原地图位置

## [队伍与数据建模](/cs50g/07/party)

- `POKEMON_DEFS` 以 id 为键存定义
- 定义含 `name`、前后战斗贴图
- 定义含 `baseHP`、`baseAttack`、`baseDefense`、`baseSpeed`
- 定义含四项 `IV`
- `Pokemon(def, level)` 按定义与等级实例化
- `HP` 是上限，`currentHP` 是当前值
- `currentExp` 与 `expToLevel` 分开记
- `Party` 只是 `pokemon` 数组的包装
- 队伍上限 6
- `getRandomDef()` 随机取野生种类
- 野生等级 `math.random(2, 6)`
- `Player` 与 `Opponent` 都有 `party` 字段
- 战斗只取 `party.pokemon[1]`
- 数值放数据表，逻辑放类

## [存档](/cs50g/07/save)

- `t.identity` 决定存档目录名
- `conf.lua` 里设 `t.identity = 'pokemon'`
- `love.filesystem.write(name, data)` 写入存档目录
- `love.filesystem.read(name)` 读回字符串
- `love.filesystem.getInfo` 判断文件是否存在
- `love.filesystem.load` 执行存档里的 Lua 块
- 存储的是数据，不是对象
- 只存可变的量：位置、等级、经验、HP
- 读档时用定义表重建 `Pokemon`
- 存档里加版本号方便迁移
- 写入失败返回 `false` 与原因
- 删除存档用 `love.filesystem.remove`

## [容易混淆的问题](/cs50g/07/pitfalls)

- 状态机与状态栈什么时候用哪个
- 栈顶更新、全部渲染，为什么不是全部更新
- `Panel` 的边界与 `Textbox` 的 padding
- `getWrap` 返回的两个表分别是什么
- `value` 与 `max` 谁变谁不变
- `HP` 与 `currentHP` 混用会怎样
- `mapX` 与 `x` 差在哪
- 遇敌概率是每帧还是每步
- 战斗中 `pop` 一次会回到哪
- 为什么存档不能直接存 table
