---
title: Pong
description: 哈佛 CS50G Week 0 笔记
sidebar:
  order: 0
slug: cs50g/00
---

[Week 0 · Pong](https://cs50.harvard.edu/games/weeks/0/ '哈佛 CS50G Week 0 官方课程页面：讲义、slides 和源码')

## 环境

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

### VS Code

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

写法 B：返回一个表，更推荐，避免全局污染。

```lua
-- Paddle.lua
local Paddle = {}
return Paddle

-- main.lua
local Paddle = require 'Paddle'
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

[Ulydev/push](https://github.com/Ulydev/push/tree/dev) 是个单文件库（`push.lua` 和 `main.lua` 放同级），负责算缩放比和偏移，把虚拟坐标映射到窗口，窗口缩放时重算。

```lua title="main.lua"
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

- `push.start()` / `push.finish()` 只包 `love.draw`
- `upscale = 'normal'` 等比缩放，16:9 正好铺满；`pixel-perfect` 只按整数倍（黑边大），`stretched` 拉伸变形
- 窗口缩放要把 `love.resize` 转发给 `push.resize`，否则画面会错位

## 采样与滤镜

432×243 的画面放大到 1280×720，文字和图片都会遇到「纹理被放大」的情况。LÖVE 默认线性插值，所以不设这一行，像素字就是糊的：

```lua
love.graphics.setDefaultFilter('nearest', 'nearest')
```

### 放大之后为什么会糊

push 默认不建 canvas，`push.start()` 里直接把绘制放大：

```lua
love.graphics.translate(offset.x, offset.y)   -- 居中
love.graphics.scale(scale.x, scale.y)         -- 1280 / 432 ≈ 2.96
```

三类东西受影响的方式不同：

| 画的东西             | 会糊吗 | 原因                         |
| -------------------- | ------ | ---------------------------- |
| `rectangle` / `line` | 不会   | 几何图形，直接光栅化         |
| `print` / `printf`   | 会     | 字体是图集纹理，画字就是贴图 |
| `newImage`           | 会     | 本身就是纹理                 |

纹理像素（texel）和屏幕像素不是 1:1 时，GPU 要决定每个屏幕像素取什么颜色：

- 放大：1 个 texel 铺满好几个屏幕像素
- 缩小：好几个 texel 挤进 1 个屏幕像素

两种取法：

- `nearest`：直接取最近的 1 个 texel，边缘硬，是像素块
- `linear`：取周围 4 个 texel 加权平均，边缘渐变，发糊

放大 3 倍时，nearest 把 1 个 texel 复制成 3×3 的纯色块，linear 在块与块之间插出渐变。

### 两个参数与默认值

```lua
love.graphics.setDefaultFilter(min, mag, anisotropy)
```

| 参数         | 什么时候生效   | 取值                     | 默认       |
| ------------ | -------------- | ------------------------ | ---------- |
| `min`        | 纹理被缩小     | `'linear'` / `'nearest'` | `'linear'` |
| `mag`        | 纹理被放大     | 同上                     | `'linear'` |
| `anisotropy` | 斜视角的清晰度 | 数字                     | `1`        |

默认 `linear` / `linear`，不设就是糊的。

- 窗口比虚拟分辨率大 → `mag` 生效，Pong 里主要是它
- 窗口拖得比虚拟分辨率小 → `min` 生效，`nearest` 会闪烁
- 折中：`setDefaultFilter('linear', 'nearest')`，缩小平滑、放大锐利
- `anisotropy` 只对 3D 斜视角有意义，2D 正交镜头下保持 1

查当前值：`print(love.graphics.getDefaultFilter())` → `linear  linear  1`。

### 必须在建资源之前设置

纹理在创建时把「当时的默认值」复制一份，所以顺序反了不会报错，只是不生效：

```lua
function love.load()
    love.graphics.setDefaultFilter('nearest', 'nearest')  -- 先设

    smallFont = love.graphics.newFont('font.ttf', 8)      -- 后建 → nearest
    scoreFont = love.graphics.newFont('font.ttf', 32)
end
```

字体、图片、canvas 都是纹理，都吃这个默认值。只想改一张：

```lua
local img = love.graphics.newImage('player.png')
img:setFilter('nearest', 'nearest')
print(img:getFilter())   --> nearest  nearest  1
```

### 非整数倍带来的不均匀

1280 ÷ 432 = 2.962…，不是整数倍，同一个源像素在屏幕上占 2 或 3 个物理像素，交替出现。

nearest 保证不糊，但保证不了每个像素一样大，看文字笔画会略有粗细。

- 想均匀：`upscale = 'pixel-perfect'`，缩放比 floor 成 2 倍（864×486），四周黑边
- 想铺满：`upscale = 'normal'`，接受轻微不均匀
