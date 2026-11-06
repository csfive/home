---
title: Flappy Bird
description: 哈佛 CS50G Week 1 主题清单
---

# Flappy Bird

[Week 1 · Flappy Bird](https://cs50.harvard.edu/games/weeks/1/ '哈佛 CS50G Week 1：视频、讲义、源码和项目')

[课后练习答案](https://github.com/csfive/CS50G/tree/main/01-flappy-bird '非官方，仅供参考')

## [精灵](/cs50g/01/sprites)

- 精灵就是会移动的图片
- `love.graphics.newImage(path)` 把图片读进内存
- `love.graphics.draw(image, x, y)` 贴到屏幕
- `image:getWidth()` 与 `image:getHeight()`
- 用图片尺寸算布局，不写死数字
- `setDefaultFilter('nearest', 'nearest')` 保住像素边缘
- 滤镜必须在建图片、字体之前设
- `Class{}` 定义 `Bird`，`init` 当构造函数
- `bird:update(dt)` 的冒号是隐式 `self`
- 冒号等价于 `Bird.update(bird, dt)`
- `bird:render()` 只画自己，不碰别人的坐标
- 绘制顺序就是图层次序

## [无限滚动与视差](/cs50g/01/scrolling)

- 滚动量是一路累加的偏移值
- 速度乘 `dt` 才与帧率无关
- 背景 30、地面 60，视差由此产生
- 移动慢的图层看起来更远
- `%` 取模把偏移绕回 0
- 回绕点要选图案重复的位置
- 背景回绕点 413，地面用屏宽
- 绘制时把偏移取负，才是向左滚
- 地面贴在 `VIRTUAL_HEIGHT - 16`
- 图片宽度要大于屏宽加回绕点
- 回绕瞬间断层就是没选对周期
- `push.start` / `push.finish` 包住整场

## [重力与跳跃](/cs50g/01/gravity)

- `GRAVITY` 是每秒钟加给速度的量
- `dy = dy + GRAVITY * dt` 先加速度
- `y = y + dy * dt` 再加速度到位置
- 跳跃是直接把 `dy` 赋成负数
- 赋值而不是累减，手感才干脆
- 跳跃速度是负数常量，单位与重力自洽
- `love.keypressed` 只能写在 `main.lua`
- 自建 `love.keyboard.keysPressed = {}`
- `love.keyboard.wasPressed(key)` 查本帧
- 每帧末尾把按键表清空
- 不清空就会每帧都触发跳跃
- `love.mousepressed(x, y, button)` 取左键
- 键盘与鼠标任一命中就跳
- 鸟落在地面高度即判死

## [管道生成](/cs50g/01/pipes)

- 计时器累加 `dt`，到点生成
- `table.insert(pipes, PipePair(y))` 追加
- 生成的是一对管，不是一个
- 管道图片定义在类外，只加载一次
- `PIPE_WIDTH` / `PIPE_HEIGHT` 是共享常量
- 上管 Y 直接给，下管再偏移
- 下管 Y = 上管 Y + 管高 + 缺口
- `GAP_HEIGHT` 是难度旋钮
- 上管用 `scaleY = -1` 翻转
- 翻转后要补一个 `PIPE_HEIGHT` 才不动位
- 新管 Y 基于上一个 Y 加抖动
- `math.max` / `math.min` 夹住生成范围
- 完全随机会生成通不过的断崖
- 出屏不立刻删，先置 `remove`
- 迭代中删表会跳过下一个元素
- 从后往前删可以就地移除

## [碰撞检测](/cs50g/01/collision)

- AABB 即轴对齐包围盒
- 两边 X 区间有交集才算可能相撞
- 再判 Y 区间，全满足才碰撞
- 鸟按矩形近似，不管翅膀形状
- 碰撞盒四边各内缩 2 像素
- 内缩是给玩家的容错
- 每个管道对要判上下两根
- 命中后 `return`，避免重复切状态
- 碰撞判定放在 `update` 而不是 `draw`
- 速度太快会穿过物体，即穿透
- 鸟撞地面用另一条判定

## [状态机](/cs50g/01/state-machine)

- 一串 `if gameState == 'play'` 会越长越乱
- 状态做成类，每个状态自己管实体
- `StateMachine` 存一张 `states` 表
- `current` 指向当前状态实例
- `change(name, params)` 做三步切换
- 先 `exit`，再新建实例，最后 `enter`
- 状态表里放返回新实例的匿名函数
- 每次进入都是干净状态
- `BaseState` 给全套空方法当契约
- `Class{__includes = BaseState}` 继承
- `assert` 拦住拼错的状态名
- `gStateMachine` 全局，任何状态都能切
- 所有状态共用的绘制留在 `main.lua`

## [计分与倒计时](/cs50g/01/scoring)

- 分数是 `PlayState` 的字段
- 鸟越过管右缘才加一分
- `pair.scored` 标记防止反复加分
- 判定 `pair.x + PIPE_WIDTH < bird.x`
- 死亡时 `change('score', { score = n })`
- `ScoreState:enter(params)` 接住数据
- 状态之间靠 `params` 表传值
- 倒计时 3、2、1，每个 0.75 秒
- 计时器超过阈值就减一
- 计时器用取模留下余数，别清零
- 倒计时结束才进 `play`

## [音效与音乐](/cs50g/01/audio)

- `love.audio.newSource(path, 'static')`
- 短音效用 `static`，长音乐用 `stream`
- `sounds` 表按事件名索引
- `sounds['jump']:play()` 播一次
- 音乐 `setLooping(true)` 后 `play()`
- 同一个 source 重播会打断上一次
- 要叠音就 `source:clone()`
- 撞管同时播爆炸与受伤两轨
- `:pause()` / `:resume()` 控制长音轨
- `love.audio.setVolume` 调总音量
- BFXR、ChipTone 能直接生成素材

## [容易混淆的问题](/cs50g/01/pitfalls)

- 滚动为什么必须取模
- 回绕点与图片宽度是什么关系
- 跳跃为什么要直接赋值 `dy`
- 帧末不清空按键表会怎样
- 上管翻转为什么还要加高度
- 为什么出屏不直接 `table.remove`
- `pairs` 与 `ipairs` 该用哪个
- `exit` 和 `enter` 分别在什么时候跑
- 分数为什么要用 `scored` 标记
- 音效为什么有时听不到第二声
