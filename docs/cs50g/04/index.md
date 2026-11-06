---
title: Super Mario Bros.
description: 哈佛 CS50G Week 4 主题清单
---

# Super Mario Bros.

[Week 4 · Super Mario Bros.](https://cs50.harvard.edu/games/weeks/4/ '哈佛 CS50G Week 4：视频、讲义、源码和项目')

[课后练习答案](https://github.com/csfive/CS50G/tree/main/04-mario '非官方，仅供参考')

## [瓦片地图](/cs50g/04/tile-map)

- 世界是一张记录 tile ID 的二维表
- `TILE_SIZE = 16` 决定网格尺寸
- `tiles[y][x]` 先行后列
- tile ID 对应图集里的一块 quad
- `SKY`、`GROUND` 是自定义常量
- `GenerateQuads` 均匀切分图集
- `love.graphics.newQuad` 取子区域
- 绘制坐标 `(x - 1) * TILE_SIZE`
- 1 基下标与像素坐标差一
- tile 带 `id`、`topper`、`tileset`
- `pointToTile` 把像素换成格子
- 像素除以 `TILE_SIZE` 后取整
- 世界坐标不等于屏幕坐标
- 只画可见列可减少绘制调用

## [相机滚动](/cs50g/04/camera)

- `love.graphics.translate` 平移后续绘制
- 相机右移等于世界左移
- 传负值才像相机向前
- `camX` 跟随玩家
- `player.x - (VIRTUAL_WIDTH / 2 - 8)`
- 平移前用 `math.floor` 取整
- 夹取范围 `0` 到地图右边界
- `TILE_SIZE * mapWidth - VIRTUAL_WIDTH`
- `love.graphics.push` / `pop` 隔离平移
- 背景按 `camX / 3` 移动
- 背景 `% 256` 循环拼接

## [角色动画](/cs50g/04/animation)

- 角色是 16×20，不是 16×16
- 精灵表按帧切成 quad
- 帧号是 quad 数组的下标
- `Animation` 存 `frames` 与 `interval`
- `timer` 每帧累加 `dt`
- 单帧动画不更新计时
- `timer % interval` 保留溢出量
- `(currentFrame + 1) % (#frames + 1)` 循环
- `math.max(1, ...)` 防下标归零
- `getCurrentFrame` 返回当前 quad
- 走路帧 10、11，间隔 0.1 秒
- 跳跃只有第 3 帧
- 负 X 缩放实现水平翻转
- 原点设在精灵中心再绘制

## [重力与平台碰撞](/cs50g/04/physics)

- `dy = dy + GRAVITY * dt`
- `y = y + dy * dt`
- `GRAVITY = 900`、起跳速度 `-300`
- 只有落地状态能起跳
- `wasPressed('space')` 避免连跳
- `dy >= 0` 时从上升转下落
- 脚下取左右两个采样点
- 头顶取左右两个采样点
- `pointToTile` 越界返回 `nil`
- 查 `COLLIDABLE_TILES` 白名单
- 撞头后清零 `dy` 并转下落
- 落地对齐 `(tile.y - 1) * TILE_SIZE`
- 再减角色高度得到 `y`
- 侧面卡墙用 `tile.x` 反推
- 每帧只查 2–4 个格子

## [关卡生成](/cs50g/04/level-generation)

- `LevelMaker.generate(width, height)`
- 关卡 100×10 个 tile
- 先全部填成天空
- 再按列向下补地面
- 地面固定从第 7 行起
- `TILE_ID_EMPTY = 5`、`TILE_ID_GROUND = 3`
- 1/7 概率整列留空成深渊
- 1/8 概率生成柱子
- 柱子顶行才画 topper
- `goto continue` 跳过整列
- `GenerateTileSets` 把图集分块
- 每组 tileset 是 5×4
- 随机选 tileset 与 topperset
- topper 只是叠加的装饰层
- 生成结果打包成 `GameLevel`

## [实体与状态机](/cs50g/04/entities)

- `Entity` 提供位置、速度、尺寸
- 实体持有 `map` 与 `level` 引用
- `stateMachine` 组合进实体
- `changeState(name, params)` 切状态
- 状态表存工厂函数而非实例
- `BaseState` 提供空的 `enter`/`exit`
- 状态类实现 `update` 与 `render`
- `Player` 继承 `Entity`
- 玩家状态：`idle`、`walking`、`jump`、`falling`
- 进入状态时换动画
- 状态内读输入决定去向
- `Entity:collides` 是 AABB
- 游戏级状态复用同一个状态机
- 状态名拼错会被 `assert` 拦下

## [游戏对象](/cs50g/04/objects)

- `GameObject` 没有状态机
- 位置尺寸固定，不主动移动
- `collidable` 决定是否检测碰撞
- `solid` 决定是否把玩家推出
- `consumable` 决定能否被吃掉
- `hit` 记录是否已触发
- `onCollide` 在碰撞时回调
- `onConsume` 在拾取时回调
- 砖块 1/5 概率掉宝石
- 宝石用 `Timer.tween` 上浮
- 回调里直接加 `player.score`
- 对象存放在 `level.objects`
- 灌木只装饰，`collidable = false`

## [敌人 AI](/cs50g/04/enemies)

- 蜗牛是 `Entity` 子类
- 状态：`idle`、`moving`、`chasing`
- `idle` 等待随机秒数
- `waitPeriod` 由 `enter` 传入
- `math.abs(player.x - snail.x)` 量距离
- 5 个 tile 内切 `chasing`
- 超出 5 个 tile 回 `moving`
- `moving` 随机方向和时长
- 前方无地面就停住
- 撞墙反向
- 边缘检测用脚下 tile
- 从上方踩中会移除敌人
- 侧面接触玩家则重开
- 每列 1/20 概率生成

## [容易混淆的问题](/cs50g/04/pitfalls)

- `wasPressed` 与 `isDown` 谁管跳跃
- 相机平移为什么取负
- 相机为什么必须取整
- `pointToTile` 为什么会返回 `nil`
- 头顶只查一个点会怎样
- 落地修正为什么要减 `height`
- `tile.x` 是格子还是像素
- 状态表为什么存函数
- `solid` 与 `collidable` 差在哪
- `pairs` 遍历中能删元素吗
