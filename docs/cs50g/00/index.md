---
title: Pong
description: 哈佛 CS50G Week 0 主题清单
---

# Pong

[Week 0 · Pong](https://cs50.harvard.edu/games/weeks/0/ '哈佛 CS50G Week 0：视频、讲义、源码和项目')

[课后练习答案](https://github.com/csfive/CS50G/tree/main/00-pong '非官方，仅供参考')

## [环境](/cs50g/00/environment)

- [LÖVE](https://love2d.org/) 与 [StyLua](https://github.com/JohnnyMorganz/StyLua) 的安装
- `love` 的运行方式：目录或 `.love` 包
- `main.lua` 是入口
- VS Code：[LuaLS](https://luals.github.io/) 与 StyLua
- [LuaJIT](https://luajit.org/) 与 Lua 5.1
- ARM 上的 `jit.off()`

## [Lua](/cs50g/00/lua)

- 全局变量与 `local`
- 字符串拼接 `..`
- 单行注释与 `--[[ ]]`
- 真假值：只有 `nil` 和 `false` 为假
- table：数组、字典、混合
- 数组下标从 1 开始，长度用 `#`
- `ipairs` 与 `pairs`
- 函数、匿名函数、多返回值
- `if` / `elseif` / `then` / `end`
- `for`、`while`、`repeat`
- `and/or` 模拟三元
- `require` 与模块
- 全局模块写法与返回表写法

## [LÖVE 基础](/cs50g/00/game-loop)

- 游戏循环：输入 → 更新 → 渲染
- `love.load`、`love.update`、`love.draw`
- `love.keypressed` 与 `love.keyboard.isDown`
- 2D 坐标系：原点左上、Y 向下
- `love.window.setMode` 与 vsync
- `love.graphics.rectangle` 的 `fill` / `line`
- `love.graphics.clear` 与 RGBA
- 字体：`newFont` 与 `setFont`
- 绘制锚点在左上角
- 帧率与刷新率

## [虚拟分辨率与滤镜](/cs50g/00/virtual-resolution)

- 虚拟分辨率 432×243
- [push](https://github.com/Ulydev/push) 库
- `push.setupScreen`
- `push.start` / `push.finish`
- `upscale`：`normal`、`pixel-perfect`、`stretched`
- `love.resize` 转发
- 鼠标坐标转换
- 最近邻与线性过滤
- `setDefaultFilter(min, mag)`
- 滤镜必须在建资源之前设
- 非整数倍缩放的不均匀

## [移动与 Delta Time](/cs50g/00/delta-time)

- `dt` 是距上一帧的秒数
- 速度乘 `dt` 才能跨帧率一致
- `love.keyboard.isDown` 连续检测
- 边界钳制：`math.max` / `math.min`
- 球的 `dx` / `dy`
- `math.randomseed(os.time())`
- `math.random` 的范围
- `and/or` 三元初始化速度

## [面向对象](/cs50g/00/oop)

- [Class](https://github.com/vrld/hump/blob/master/class.lua) 库（hump）
- `init` 构造函数与 `self`
- 字段与方法
- 冒号语法 `obj:method()`
- `Paddle` 与 `Ball` 模块
- `main.lua` 只保留调度
- 全局对象与 `require`

## [碰撞检测](/cs50g/00/collision)

- AABB：轴对齐包围盒
- X 轴与 Y 轴的间隙判断
- 碰撞后反向 `dx`
- 每次碰撞乘 `1.03` 加速
- 球推出矩形的位置修正
- 墙壁碰撞反向 `dy`
- 碰撞盒的 `line` 模式绘制
- 碰撞后随机化 `dy`

## [得分与状态机](/cs50g/00/score-state)

- `gameState`：`start`、`serve`、`play`、`done`
- 球出界判定
- 得分与发球方
- `ball:reset()`
- 胜利条件 10 分
- 状态转移与 `Enter`
- `done` 后重置比分
- 状态决定 update 与 draw 的行为

## [音效](/cs50g/00/audio)

- `love.audio.newSource`
- `static` 与 `stream`
- `sounds` 表
- `:play()` 方法
- 音效语义：paddle、wall、score
- [BFXR](https://www.bfxr.net/) 与 [ChipTone](https://sfbgames.itch.io/chiptone)

## [容易混淆的问题](/cs50g/00/pitfalls)

- `keypressed` 与 `isDown`
- `dt` 不乘会怎样
- 左上角锚点的宽度补偿
- `push.start` 的范围
- 滤镜设置顺序
- `require` 要不要接返回值
