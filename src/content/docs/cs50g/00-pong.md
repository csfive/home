---
title: Pong
description: 哈佛 CS50G 第一讲笔记
sidebar:
  order: 0
slug: cs50g/00
---

[Week 0 · Pong](https://cs50.harvard.edu/games/weeks/0/ '哈佛 CS50G 第一讲，官方课程页面：讲义、slides 和源码')

## 环境

### 安装

```sh
brew install --cask love
brew install stylua
```

LÖVE 11.5 自带运行时（LuaJIT），不用单独装 Lua。其他平台见 [下载页](https://love2d.org/)。

### 跑起来

love 只接受一个目录或 `.love` / `.zip` 包，目录里必须有 `main.lua`：

```sh
love 00-pong            # 从仓库根目录跑某一周
cd 00-pong && love .    # 或者在项目目录里跑
```

### 编辑器

```sh
code --install-extension sumneko.lua
code --install-extension JohnnyMorganz.stylua
```

- `sumneko.lua`（LuaLS）：补全、跳转、检查 `love` 全局，读仓库里的 `.luarc.json`
- `JohnnyMorganz.stylua`：保存时格式化，配置在 `.stylua.toml`

配置细节见 [csfive/CS50G](https://github.com/csfive/CS50G)。

### LuaJIT

LuaJIT 是用汇编实现的 Lua 5.1 兼容运行时，带 JIT。`main.lua` 跑在 LÖVE 内置的 LuaJIT 里。

LÖVE 11.5 在 ARM 上启动时会执行 `jit.off()`，所以实际是 LuaJIT 的解释器在执行，语义仍是 Lua 5.1，只是没有 JIT 编译。

```lua
print(_VERSION)           --> Lua 5.1
print(jit.version)        --> LuaJIT 2.1.1700008891
print(jit.arch)           --> arm64

local jitOn = jit.status()
print(jitOn)              --> false，JIT 被关掉了

print(love.getVersion())  --> 11  5  0  Mysterious Mysteries
```

## Lua 速查

只列 Week 0 用得到的，不追求覆盖全部语法。

### 变量与真假值

```lua
-- 全局变量（不带 local），跨文件可见
hello = 'hello'

-- 局部变量，只在当前块里可见
local world = ' world!'

-- 字符串拼接用 ..，不是 +
print(hello .. world)

-- 单行注释
--[[
    多行注释
]]

-- 只有 nil 和 false 是假，0 和空字符串都是真！
```

### table

table = 数组 + 字典 + 对象，数组下标从 1 开始。

```lua
-- 数组
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
```

### 函数

```lua
function say(text)
    print(text)
end

-- 匿名函数
local add = function(a, b) return a + b end

-- 多返回值
local function minmax(a, b)
    return math.min(a, b), math.max(a, b)
end
```

### 模块

一个文件就是一个模块。

写法 A：文件里定义全局，课程代码用这种。

```lua
-- Paddle.lua
Paddle = Class{}

-- main.lua
require 'Paddle'   -- 自动找 Paddle.lua，不用写扩展名
-- 其实是一个函数调用，不过单字符串参数可以省略括号
```

`Class{}` 是课程里的 OOP 工具，讲到 Paddle 时再补。

写法 B：返回一个表，更推荐，避免全局污染。

```lua
-- Paddle.lua
local Paddle = {}
return Paddle

-- main.lua
local Paddle = require 'Paddle'
```

### 条件与循环

```lua
if a == b then
    -- ...
elseif c ~= d then   -- 不等于是 ~=
    -- ...
else
    -- ...
end

-- 三元表达式，用 and/or 模拟
local dx = math.random(2) == 1 and 100 or -100

for i = 1, 10 do
    -- 1..10
end

for i = 10, 1, -1 do
    -- 步长 -1
end

while cond do
    -- ...
end

repeat
    -- ...
until cond
```

## LÖVE 基础

### 游戏循环

游戏循环的本质是「翻页动画」：

```
处理输入 → 更新状态 → 渲染 → 下一帧
```

love 自己维护主循环，我们只需要实现几个回调：

| 回调                   | 时机         | 用途                                      |
| ---------------------- | ------------ | ----------------------------------------- |
| `love.load()`          | 启动时一次   | 初始化、设窗口、建对象                    |
| `love.update(dt)`      | 每帧         | 处理输入、更新状态；`dt` 是距上一帧的秒数 |
| `love.draw()`          | 每帧         | 画东西                                    |
| `love.keypressed(key)` | 按键按下一次 | 一次性输入                                |
| `love.resize(w, h)`    | 窗口尺寸变化 | 通知 push 重算                            |

### 最小可运行

```lua title="main.lua"
WINDOW_WIDTH = 1280
WINDOW_HEIGHT = 720

function love.load()
    love.window.setMode(WINDOW_WIDTH, WINDOW_HEIGHT, {
        fullscreen = false,
        resizable = false,
        vsync = true, -- 垂直同步，避免画面撕裂
    })
end

function love.draw()
    love.graphics.printf(
        'Hello World!',
        0, -- x，坐标系从左上角开始，向右向下
        WINDOW_HEIGHT / 2, -- y
        WINDOW_WIDTH, -- 居中用的宽度
        'center'
    )
end
```

`printf(text, x, y, limit, align)`：`limit` 是「在这个宽度内对齐」。

## 虚拟分辨率

**一句话**：游戏逻辑只认 432×243，画到窗口时整体放大。

- 位置、速度、尺寸、碰撞 → 全用虚拟坐标
- 鼠标、窗口尺寸 → 真实坐标，用 `push.toGame` 换

```lua
VIRTUAL_WIDTH  = 432
VIRTUAL_HEIGHT = 243
```

432×243 是 16:9，放大 2.96 倍正好铺满 1280×720。现代屏幕直接画，8px 的字小得看不见，也没有像素感。

## push

push 是个单文件库（[Ulydev/push](https://github.com/Ulydev/push/tree/dev)，`push.lua` 和 `main.lua` 放同级），负责算缩放比和偏移，把虚拟坐标映射到窗口，窗口缩放时重算。

```lua
push = require 'push'

function love.load()
    -- 滤镜必须在创建任何图像、字体之前
    love.graphics.setDefaultFilter('nearest', 'nearest')

    love.window.setMode(1280, 720, { resizable = true, vsync = true })
    push.setupScreen(VIRTUAL_WIDTH, VIRTUAL_HEIGHT, { upscale = 'normal' })
end

function love.draw()
    push.start()   -- 之后所有坐标按 432×243 算
    -- 画东西
    push.finish()  -- 回到真实像素
end

function love.resize(w, h)
    push.resize(w, h)
end
```

- `push.start()` / `push.finish()` 只包 `love.draw`，`love.update` 里不用
- 窗口缩放要把 `love.resize` 转发给 `push.resize`，否则画面会错位
- 鼠标坐标用 `push.toGame(x, y)`
- `upscale = 'normal'` 等比缩放，16:9 正好铺满；`pixel-perfect` 只按整数倍（黑边大），`stretched` 拉伸变形
- 课程用的是 dev 分支（v1.0）：点号调用、3 个参数。[master](https://github.com/Ulydev/push) 是冒号 + 5 参数，别混

## 采样与滤镜

### 过滤原理

窗口 1280×720、虚拟画面 432×243，放大由显卡完成：

1. 屏幕上每个像素，反算出它在虚拟画面里的位置 `(u, v)`
2. 按 `(u, v)` 去画面里取颜色
3. 把颜色写到屏幕像素

第 2 步就是过滤（filter）。texel 是「纹理像素」，可以理解成画面上的一个点。

- 只取最近的 1 个 texel → `nearest`，边缘是硬的
- 取周围 4 个 texel 加权平均 → `linear`，边缘出现过渡色

所以过滤不是「放大算法」，是「采样算法」。

### nearest vs linear

|           | nearest              | linear               |
| --------- | -------------------- | -------------------- |
| 取色      | 最近的 1 个 texel    | 周围 4 个 texel 加权 |
| 边缘      | 硬，方块感           | 软，渐变             |
| 适合      | 像素画、低分辨率放大 | 照片、3D 贴图        |
| LÖVE 写法 | `'nearest'`          | `'linear'`（默认）   |

像素画误用 linear，每个方块边缘会多出 1~2px 的过渡色，像隔了层毛玻璃。

### 怎么设置

```lua
-- 全局默认：影响之后创建的所有 Image、Canvas、Font
love.graphics.setDefaultFilter('nearest', 'nearest')

-- 单个对象：只改自己
image:setFilter('nearest', 'nearest')
```

- 只对之后创建的资源生效，已经建好的不会变
- 放在 `love.load` 最前面，早于 `newImage` / `newCanvas` / `newFont`
- 字体也吃这个默认值，字形图集在 `newFont` 时就定下来了
- 矩形、线是矢量绘制，不受滤镜影响；Pong 里只有文字受影响
- 像素画不要开 mipmap（`{ mipmaps = true }`），缩小采样会糊

### 2.96 倍的副作用

1280 ÷ 432 = 2.962…，243 × 2.962 = 720，刚好铺满，但不是整数倍。

同一个源像素在屏幕上占 2 或 3 个物理像素，交替出现。nearest 保证「不糊」，但保证不了「每个像素一样大」。

- 整数倍只有 2 倍可行（864×486），四周留黑边；3 倍要 1296×729，高度超出 720
- `upscale = 'normal'` 接受轻微不均匀：静态看不出来，移动时偶尔有像素抖动
