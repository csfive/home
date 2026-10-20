---
title: Pong
description: 哈佛 CS50G 第一讲笔记
sidebar:
  order: 0
slug: cs50g/00
---

## Lua 语法速成

```lua
-- 全局变量（不带 local），跨文件可见
hello = 'hello'

-- 局部变量，只在当前块里可见
local world = ' world!'

-- 字符串拼接用 .. ，不是 +
print(hello .. world)

-- 单行注释

--[[
    多行注释
]]

-- 函数
function say(text)
    print(text)
end

-- 匿名函数
local add = function(a, b) return a + b end

-- 多返回值
local function minmax(a, b)
    return math.min(a, b), math.max(a, b)
end

-- 表（table）= 数组 + 字典 + 对象
-- 数组（下标从 1 开始！）
local colors = { 'red', 'green', 'blue' }
print(colors[1])   -- red
print(#colors)     -- 3，长度用 #

-- 字典
local player = { x = 10, y = 20, name = 'p1' }
print(player.x)    -- 等价于 player['x']

-- 混合
local t = { 1, 2, key = 'value' }

-- 遍历
for i, v in ipairs(colors) do print(i, v) end   -- 数组，按顺序
for k, v in pairs(player) do print(k, v) end    -- 任意键值

-- 条件判断
-- 只有 nil 和 false 是假，0 和空字符串都是真！
if x then ... end
if not x then ... end
if a == b then ... elseif c ~= d then ... else ... end   -- 不等于是 ~=

-- 三元表达式，用 and/or 模拟
local dx = math.random(2) == 1 and 100 or -100

-- 循环
for i = 1, 10 do ... end       -- 1..10
for i = 10, 1, -1 do ... end   -- 步长 -1
while cond do ... end
repeat ... until cond
```

## Lua 模块

一个文件就是一个模块。

有两种写法：

```lua
-- 写法 A：文件里定义全局（课程代码用这种）
-- Paddle.lua
Paddle = Class{}
-- main.lua
require 'Paddle'   -- 自动找 Paddle.lua，不用写扩展名


-- 写法 B：返回一个表（更推荐，避免全局污染）
-- Paddle.lua
local Paddle = {}
return Paddle
-- main.lua
local Paddle = require 'Paddle'
```

## LÖVE 循环

游戏循环的本质是「翻页动画」：

```
处理输入 → 更新状态 → 渲染 → 下一帧
```

love 自己会维护一个主循环，我们只需要实现几个**回调函数**：

```lua
function love.load()      end       -- 启动时执行一次：初始化
function love.update(dt)  end       -- 每帧执行：处理输入、更新状态
function love.draw()      end       -- 每帧执行：画东西
function love.keypressed(key) end   -- 按键按下时执行一次
function love.resize(w, h) end      -- 窗口尺寸变化时执行
```

## 最小可运行

```sh
# love 只接受一个目录或 .love/.zip 包
# dir 目录须包含 main.lua 当做入口
love dir
```

```lua title="main.lua"
function love.load()
    love.window.setMode(1280, 720, {
        fullscreen = false,
        resizable = false,
        vsync = true,            -- 垂直同步，避免画面撕裂
    })
end

function love.draw()
    love.graphics.printf(
        'Hello World!',
        0,                       -- x，坐标系从左上角开始，向右向下
        WINDOW_HEIGHT / 2,       -- y
        WINDOW_WIDTH,            -- 居中用的宽度
        'center'
    )
end
```

## LÖVE with VS Code

## 虚拟分辨率与 [push](https://github.com/Ulydev/push)

复古质感，游戏内按 432×243 这样的「虚拟分辨率」思考和计算，渲染时整体放大到 1280×720。

```lua
push = require 'push'

function love.load()
    love.graphics.setDefaultFilter('nearest', 'nearest')
    love.window.setMode(1280, 720, { resizable = true, vsync = true })
    push:setupScreen(432, 243, { upscale = 'normal' })
end

-- 每次调整窗口要重新计算
function love.resize(w, h)
    push:resize(w, h)
end

function love.draw()
    push:start()
    -- ... 画所有东西 ...
    push:finish()
end
```

## 最近邻过滤

## 冒号调用语法糖
