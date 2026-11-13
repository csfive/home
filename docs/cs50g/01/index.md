---
title: Flappy Bird
description: 哈佛 CS50G Week 1 主题清单
---

# Flappy Bird

[Week 1 · Flappy Bird](https://cs50.harvard.edu/games/weeks/1/ '哈佛 CS50G Week 1：视频、讲义、源码和项目')

[课后练习答案](https://github.com/csfive/CS50G/tree/main/01-flappy-bird '非官方，仅供参考')

## [精灵](/cs50g/01/sprites)

- `love.graphics.newImage(path)`
- `love.graphics.draw(image, x, y)`
- `image:getWidth()` / `image:getHeight()` / `getDimensions()`
- 尺寸从图片取，不写死
- `setDefaultFilter('nearest', 'nearest')`
- 滤镜必须在建图片、字体之前设
- `Class{}` 定义 `Bird`
- `bird:update(dt)` 的冒号等价于 `Bird.update(bird, dt)`
- `setColor` 是乘算色，画完要复位
- 绘制顺序就是图层次序

## [无限滚动与视差](/cs50g/01/scrolling)

- 偏移量累加再对回绕点取模
- 视差来自两层速度差：背景 30、地面 60
- 回绕点取图案重复的周期：背景 413、地面用屏宽
- 绘制时偏移取负
- 地面贴 `VIRTUAL_HEIGHT - 16`
- 图片宽要大于屏宽加回绕点
- `push.start` / `push.finish` 包住整场

## [重力与跳跃](/cs50g/01/gravity)

- 半隐式欧拉：先 `dy = dy + GRAVITY * dt`，再 `y = y + dy * dt`
- 跳跃是 `dy = -300` 赋值，不是累减
- `GRAVITY` / `FLAP_VELOCITY` 的单位是每秒
- `love.keypressed` 只能定义在 `main.lua`
- 自建 `love.keyboard.keysPressed` 表
- `love.keyboard.wasPressed(key)`
- 每帧末清空按键表
- `love.mouse.wasPressed(1)` 与键盘并联
- `dt` 封顶防止穿透

## [管道生成](/cs50g/01/pipes)

- 计时器累加 `dt` 到点生成
- `table.insert(pipePairs, PipePair(y))`
- `PIPE_WIDTH` / `PIPE_HEIGHT` / `GAP_HEIGHT`
- 下管 Y = 上管 Y + `PIPE_HEIGHT` + `GAP_HEIGHT`
- 上管用 `scaleY = -1` 翻转，补 `PIPE_HEIGHT` 回到原位
- 新管 Y 在上一对 Y 附近抖动
- `math.max` / `math.min` 夹住生成范围
- 出屏先置 `remove`，遍历结束再删
- 倒序 `for i = #t, 1, -1` 就地删除

## [碰撞检测](/cs50g/01/collision)

- AABB 两次区间比较：X 与 Y 都无间隙才算撞
- 碰撞盒四边各内缩 2 像素
- `Bird:collides(pipe)` 同时判上下两根管
- 命中后 `return` 避免重复切状态
- 落地判定 `y + height > VIRTUAL_HEIGHT - 16`
- 判定放在 `update`，不放 `render`
- `line` 模式画碰撞盒调试

## [状态机](/cs50g/01/state-machine)

- 状态即类，每个状态自己持有实体
- `StateMachine` 的 `states` 表存构造函数
- `change(name, params)`：`exit` → 新实例 → `enter`
- `BaseState` 提供空方法
- `Class{__includes = BaseState}` 继承
- `assert(self.states[name])` 拦住拼错
- 跨状态共用逻辑留在 `main.lua`
- `love.load` 预建四档字体

## [计分与倒计时](/cs50g/01/scoring)

- 分数是 `PlayState` 的字段
- 过管条件 `pair.x + PIPE_WIDTH < bird.x`
- `pair.scored` 防止重复加分
- `change('score', { score = n })` 传值
- `ScoreState:enter(params)` 接住参数
- 倒计时 3、2、1，每个 0.75 秒
- 计时器取模而非清零
- `love.filesystem` 存最高分

## [音效与音乐](/cs50g/01/audio)

- `love.audio.newSource(path, 'static')`
- 短音效 `static`，长音乐 `stream`
- `sounds` 表按事件名索引
- `source:play()` / `pause()` / `resume()` / `stop()`
- `setLooping(true)` 循环背景音乐
- 同一 source 重播会打断上一次
- 叠音用 `source:clone()`
- `love.audio.setVolume` 调总音量
- [BFXR](https://www.bfxr.net/) 与 [ChipTone](https://sfbgames.itch.io/chiptone)

## [容易混淆的问题](/cs50g/01/pitfalls)

- `wasPressed` 还是 `isDown`
- 跳跃为什么是赋值不是累减
- 位置项漏乘 `dt` 会怎样
- 取模为什么不能换成清零
- 上管翻转为什么还要加高度
- 出屏为什么不直接 `table.remove`
- `pairs` 与 `ipairs` 该用哪个
- `init` 与 `enter` 分别在什么时候跑
- `scored` 与 `remove` 两个标记
