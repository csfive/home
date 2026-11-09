---
title: Legend of Zelda
description: 哈佛 CS50G Week 5 主题清单
---

# Legend of Zelda

[Week 5 · Legend of Zelda](https://cs50.harvard.edu/games/weeks/5/ '哈佛 CS50G Week 5：视频、讲义、源码和项目')

[课后练习答案](https://github.com/csfive/CS50G/tree/main/05-zelda '非官方，仅供参考')

## [俯视视角与四向移动](/cs50g/05/top-down)

- 俯视视角取代横版卷轴
- 正交投影与等距投影的差别
- 同时改变 X 和 Y，而不是只靠重力
- `direction` 只有 `up`、`down`、`left`、`right`
- 动画键名拼接：`walk-left`、`sword-up`
- 走路图集每格 16×32，持剑 32×32
- `offsetX`、`offsetY` 补偿图集留白
- 玩家碰撞盒 16×22，比格子矮
- `PLAYER_WALK_SPEED = 60`
- `EntityWalkState` 的 `bumped` 标志
- 边界钳制代替图块碰撞
- 四向分支用 `elseif` 固定优先级
- 同时按两个方向只走一个轴
- 状态机：`walk`、`idle`、`swing-sword`
- 子类先调父类 `EntityWalkState.update`
- 敌人只有 `walk` 与 `idle`
- 撞墙后随机换向或待机

## [实体定义与动画数据](/cs50g/05/entity-defs)

- `ENTITY_DEFS` 是全局常量表
- 全大写命名表示只读数据
- 键：`player`、`skeleton`、`slime`、`bat`、`ghost`、`spider`
- 每个动画含 `frames`、`interval`、`texture`
- `texture` 缺省回落到 `entities`
- `Entity:createAnimations` 批量造 `Animation`
- `Animation` 的 `timesPlayed` 记录播了几圈
- `refresh()` 让单次动画从头再来
- 实体字段：`x`、`y`、`width`、`height`、`health`
- `offsetX`、`offsetY` 只影响绘制
- `GAME_OBJECT_DEFS` 用同样的思路描述物件
- `states` 表按名字取帧号
- `solid` 决定物件是否挡路
- `defaultState` 决定初始状态
- 数据与代码分离，改动不进逻辑层

## [房间与图块生成](/cs50g/05/rooms)

- 房间固定 22×11 格
- `TILE_SIZE = 16`
- `MAP_RENDER_OFFSET_X` 让地图居中留边
- 双层循环按行填 `tiles[y][x]`
- 四个角单独判定
- 四条边从 `TILE_*_WALLS` 随机取
- 内部从 `TILE_FLOORS` 随机取
- `TILE_EMPTY = 19`
- 图块编号从 1 起，左到右、上到下
- Python + Pillow 脚本标注图集编号
- `GenerateQuads` 把图集切成 `gFrames`
- 房间不做图块碰撞，只做边界
- `Room:render` 先地砖、再门、再物件、再实体
- `renderOffset` 与 `adjacentOffset` 叠加

## [地牢生成与协程](/cs50g/05/dungeon-gen)

- 10×10 房间网格，起点 `(5, 10)`
- 队列加 `head` 下标做 BFS
- `visited` 用 `"x,y"` 字符串当键
- 方向数组先洗牌再遍历
- 每个方向 40% 概率跳过
- 越界与已访问双重检查
- 生成完毕再统一 `generateDoorways`
- 队列铺得宽，栈容易生成蛇形
- `coroutine.wrap` 返回可反复调用的函数
- `coroutine.yield` 吐出 `phase`、`rooms`、`visited`
- `phase`：`visit`、`push`、`doorways`、`done`
- 按 Enter 单步推进生成过程
- `math.randomseed(os.time())` 换种子
- 死胡同软锁是已知问题，不算 bug
- 房间太少时再扫一遍补足

## [相机与房间切换](/cs50g/05/camera)

- `cameraX`、`cameraY` 是 `translate` 的偏移
- `shifting` 标志锁住整间房的更新
- 撞门时 `Event.dispatch('shift-left')`
- `Event.on` 给四个方向各绑一次
- 位移量是整屏：`VIRTUAL_WIDTH`、`VIRTUAL_HEIGHT`
- `nextRoom` 由 `currentRoom` 坐标加减得出
- `adjacentOffsetX` 把下一间画在屏幕外
- `Timer.tween(1, ...)` 同时补相机与玩家
- `finishShifting` 归零并把 `nextRoom` 换成当前房
- 收尾时重置玩家 `direction` 与坐标
- 切换期间只更新玩家动画
- `love.graphics.push` / `pop` 包住平移
- 进新房间前先把它的门置为打开
- 到达后关闭旧房间的门并复位开关

## [攻击、受击与无敌帧](/cs50g/05/combat)

- `Hitbox` 只是带尺寸的矩形对象
- hitbox 是能被打中的身体
- hurtbox 是能造成伤害的判定
- 敌人身体兼作两者
- 剑的 hurtbox 只在 `swing-sword` 状态存在
- 左右挥剑 8×16，上下挥剑 16×8
- 剑盒贴在 `player.x ± width`
- `entity:collides(hitbox)` 复用 AABB
- 命中一次 `damage(1)`
- 挥满一圈靠 `timesPlayed > 0` 回 `idle`
- 挨打 `damage(1)` 后 `goInvulnerable(1.5)`
- 无敌期间每 0.06 秒切一次半透明
- `health == 0` 切 `game-over`
- 血量上限 6，一颗心 2 点
- 挥剑期间锁住移动
- 挥剑没有冷却，可以连挥

## [道具、库存与存档](/cs50g/05/items)

- 罐子做成 `GameObject`，`solid = true`
- 新增状态：`lift`、`carry`、`throw`
- 举着罐子时禁掉 `swing-sword`
- 罐子每帧跟随玩家坐标绘制
- 抛出后带 `dx`、`dy` 变成投射物
- 撞墙、撞敌人、飞满四格都碎
- 掉落物用 `onConsume` 回调
- 一颗心补 2 点，上限 6
- 宝箱开出回旋镖，写进库存
- 库存起步就是几个布尔字段
- 按 `E` 发射回旋镖
- 回旋镖飞满四格后折返并追踪玩家
- 飞行中按时间旋转贴图
- 存档要序列化房间坐标、血量、库存
- `love.filesystem.write` 落盘
- `love.filesystem.getInfo` 判断存档是否存在

## [触发、门与遮罩](/cs50g/05/triggers)

- `GameObject` 由定义表构造
- `onCollide` 默认是空函数
- 开关两态：`unpressed`、`pressed`
- 帧号取自 `states[state].frame`
- 踩下开关打开房间所有门
- `Doorway` 位置按方向硬编码
- 一扇门由四块图块拼成
- `open` 布尔决定用哪组图块编号
- 碰墙时把玩家临时推进墙内再判定
- 撞到门后吸附到门中心
- 模板缓冲遮住拱门区域
- `stencil(fn, 'replace', 1)` 写入遮罩
- `setStencilTest('less', 1)` 只放行未写值的像素
- LÖVE 12 换成 `setStencilState` 加 `setColorMask`
- 遮罩测试结束必须清掉
- 按 `S` 画出遮罩矩形

## [容易混淆的问题](/cs50g/05/pitfalls)

- hitbox 与 hurtbox：一个能被击中，一个造成伤害
- 图块索引与像素坐标：前者从 1 起，后者从 0 起
- `cameraX` 与 `adjacentOffsetX`：前者平移画布，后者挪动下一间房
- `currentRoom` 与 `nextRoom`：补间结束才交换，不是撞门那一刻
- 状态机与 tween：前者换行为，后者只改数值
- `coroutine.yield` 与 `return`：前者保留调用栈，后者结束函数
- `TILE_EMPTY` 与越界索引：前者是合法编号，后者会取到 `nil`
- 一颗心与 2 点血：界面单位与数据单位，差一个系数
- `solid` 与 `onCollide`：一个只是数据标记，一个才是真正的行为
- `looping = false` 与单次播放：数据想停，代码里被 `or true` 吃掉
