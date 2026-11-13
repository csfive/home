---
title: Breakout
description: 哈佛 CS50G Week 2 主题清单
---

# Breakout

[Week 2 · Breakout](https://cs50.harvard.edu/games/weeks/2/ '哈佛 CS50G Week 2：视频、讲义、源码和项目')

[课后练习答案](https://github.com/csfive/CS50G/tree/main/02-breakout '非官方，仅供参考')

## [项目结构](/cs50g/02/project-structure)

- `src/` 放 Lua 代码，`src/states/` 一个状态一个文件
- `graphics/`、`sounds/`、`fonts/`、`lib/`
- `main.lua` 只留 LÖVE 回调与共享渲染
- `src/Dependencies.lua` 集中 `require`
- `src/constants.lua` 存全局常量
- `src/Util.lua` 放 quad 生成与 `table.slice`
- `table.slice(t, first, last)` 返回新表
- `WINDOW_WIDTH` 与 `VIRTUAL_WIDTH` 分开
- `PADDLE_SPEED = 200`
- 全局表 `gTextures`、`gFrames`、`gFonts`、`gSounds`
- `gStateMachine` 在 `love.load` 里建
- `renderHealth`、`renderScore` 放 `main.lua`

## [状态机](/cs50g/02/state-machine)

- 八个状态：`start`、`paddle-select`、`high-scores`、`serve`、`play`、`victory`、`game-over`、`enter-high-score`
- `StateMachine:change(name, params)`
- 状态表里存工厂函数
- `change` 先 `exit` 再 `enter`
- 每次切换都新建状态实例
- `enterParams` 跨状态传数据
- `empty` 空状态兜住首帧
- `BaseState` 提供五个空回调
- `Class{__includes = BaseState}`
- 暂停用 `paused` 字段，不进状态机
- 文件级 `local` 与 `init` 字段的寿命不同

## [精灵表与 Quad](/cs50g/02/sprite-sheets)

- 图集把几十张图打成一张纹理
- `newQuad(x, y, w, h, atlas:getDimensions())`
- `draw(texture, quad, x, y)` 只画一块
- quad 不复制像素，只记录 UV
- `GenerateQuads` 按格子均匀切
- 计数器从 1 开始，行优先
- 砖块 32×16、球 8×8、心 10×9、箭头 24×24
- 砖块只取前 21 个 quad
- 挡板宽 32、64、96、128 四档
- 砖块索引 `1 + (color-1)*4 + tier`
- 挡板索引 `size + 4*(skin-1)`
- `setDefaultFilter('nearest','nearest')` 防糊
- 图集边长必须是格子整数倍

## [挡板与球](/cs50g/02/paddle-ball)

- `Paddle.dx` 只有水平分量，松键归零
- 左夹紧 `math.max(0, x)`，右夹紧要减 `self.width`
- `size` 决定绘制宽度档位，`skin` 决定颜色
- `Ball` 宽高都是 8
- `Ball:collides` 是 AABB
- 左右上三面反弹并贴边，底边直接出界
- `serve` 状态球贴挡板中线，Enter 才发球
- 初速 `dx` 取 -200 到 200，`dy` 取 -60 到 -50
- `wasPressed` 是课程自定义封装
- `size` 改了碰撞盒不会跟着变

## [关卡生成](/cs50g/02/level-maker)

- `LevelMaker.createMap(level)` 静态调用
- 行数 1 到 5，列数 7 到 13 后取奇数
- `highestTier` 每 5 关涨一级，封顶 3
- `highestColor` 封顶 5
- X 坐标 `(x - 1) * 32 + 8 + (13 - numCols) * 16`
- Y 坐标 `y * 16`
- 每行独立决定是否隔块、是否交替颜色
- `goto continue` 与 `::continue::`
- `Brick` 有 `tier`、`color`、`inPlay`
- `hit()` 先降 color 再降 tier

## [碰撞响应](/cs50g/02/collision)

- AABB 任一轴有间隙即不碰
- 挡板命中先抬到 `paddle.y - 8`
- 中线偏移决定 `dx` 大小，偏移乘 8、基线 50
- 砖块用中心偏移算穿透深度 `px`、`py`
- 穿透浅的轴才是反弹轴
- 沿穿透深度推出球
- 命中后 `break` 只处理一块
- `dy` 乘 1.02，封顶 150
- `line` 模式画碰撞盒调试

## [生命、得分与粒子](/cs50g/02/health-score)

- 满血 3 颗心，先画满心再补空心
- 球过底边扣 1 血，归零进 `game-over`
- 得分 `tier * 200 + color * 25`
- `renderScore` 固定右上角，`printf` 右对齐
- 分数过阈值回 1 血，阈值每次翻倍封顶 100000
- 每块砖自带粒子系统，缓冲 64
- 粒子寿命 0.5 到 1 秒
- Y 加速度只取正值，颜色渐变到透明
- 粒子要在砖块之后渲染

## [关卡推进与存档](/cs50g/02/progression)

- `checkVictory` 遍历 `inPlay`
- 胜利后按 Enter 进下一关
- 挡板、血量、分数跨关保留，球重新随机
- `setIdentity('breakout')` 定存档目录
- `getInfo` 判断文件是否存在
- 首次启动写 10 条默认分
- 名字与分数各占一行，`lines` 交替解析
- 三字母用 65 到 90 的码，`string.char` 转字符
- 从第 10 名往上比出插入位
- 写回时整表覆盖文件

## [容易混淆的问题](/cs50g/02/pitfalls)

- 状态表里存的是类还是实例？
- 为什么 `change` 之后旧状态的数据还在？
- `init` 与 `enter` 谁先执行？
- 图集过滤为什么要设 `nearest`？
- `size` 变了碰撞盒会变吗？
- 球撞砖为什么只处理一块？
- `px` 与 `py` 为什么要取绝对值？
- 球速过快为什么会穿过去？
- 满血时还会消耗回血阈值吗？
- 存档为什么整表重写？
