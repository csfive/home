---
title: 项目结构
description: 哈佛 CS50G Week 2 · 项目结构
---

# 项目结构

Breakout 的文件数量已经不适合全部平铺在根目录，目录本身就是第一层模块划分。

## 目录布局

| 路径          | 内容                     |
| ------------- | ------------------------ |
| `src/`        | 实体、状态机、工具函数   |
| `src/states/` | 每个界面一个状态文件     |
| `graphics/`   | 图集、背景、心、粒子贴图 |
| `sounds/`     | wav 音效与循环音乐       |
| `fonts/`      | ttf 字体                 |
| `lib/`        | push 与 class            |

| 文件                   | 职责                      |
| ---------------------- | ------------------------- |
| `main.lua`             | 回调、全局表、共享渲染    |
| `src/Dependencies.lua` | 统一 `require`            |
| `src/constants.lua`    | 窗口与虚拟分辨率          |
| `src/Util.lua`         | quad 生成与 `table.slice` |

`table.slice(t, first, last, step)` 是课程自写的工具：不修改原表，返回 `first` 到 `last` 的新表，缺省范围是 1 到最后。切砖块时用它截取 `GenerateQuads` 结果的前 21 个。

`love.load` 依次做四件事：设滤镜和随机种子、建字体与纹理、切出 quad、建状态机并进入 `start`。`love.resize` 只把尺寸转给 push，其他回调都转给状态机。

`main.lua` 只剩 LÖVE 的五个回调和三个共享渲染函数，`love.load`、`love.update`、`love.draw`、`love.keypressed`、`love.resize` 之外没有游戏逻辑。 状态按文件拆开后，`require` 的路径就是模块边界。`src/Util.lua` 放不依赖游戏状态的函数，状态之间不互相 `require`，全部靠 `gStateMachine:change` 通信。素材包里还有 `blocks.png` 和 `ui.png`，这个版本没有加载。

## 依赖与常量

```lua
-- src/Dependencies.lua
push = require 'lib.push'
Class = require 'lib.class'

require 'src.constants'
require 'src.Ball'
require 'src.Brick'
require 'src.LevelMaker'
require 'src.Paddle'
require 'src.StateMachine'
require 'src.Util'
require 'src.states.PlayState'
```

`main.lua` 顶部只写一行 `require 'src.Dependencies'`，所有文件由这一个入口加载，`require` 会缓存已加载的模块。

`src.constants` 必须排在其他依赖之前，晚加载会拿到 `nil` 并在运算时报错。模块名区分大小写，Linux 上写错大小写直接找不到文件。常量文件只放不随状态变化的值。

```lua
WINDOW_WIDTH = 1280
WINDOW_HEIGHT = 720
VIRTUAL_WIDTH = 432
VIRTUAL_HEIGHT = 243
PADDLE_SPEED = 200
```

窗口尺寸与虚拟分辨率是两套坐标。渲染在 432×243 的虚拟画布上完成，再由 push 放大到窗口；写游戏逻辑时只用虚拟尺寸，只有 `setMode` 和 `setupScreen` 碰真实尺寸。

## 全局表

| 全局            | 创建方式                    | 内容                       |
| --------------- | --------------------------- | -------------------------- |
| `gTextures`     | `newImage`                  | 背景、图集、心、箭头、粒子 |
| `gFrames`       | `GenerateQuads*`            | 每张图集切出的 quad        |
| `gFonts`        | `newFont`                   | small、medium、large       |
| `gSounds`       | `newSource(path, 'static')` | 音效与音乐                 |
| `gStateMachine` | `StateMachine{...}`         | 当前状态调度               |

这些表都在 `love.load` 里建一次，之后状态只读不写。`gTextures` 必须先于 `gFrames`，因为 `newQuad` 需要 `atlas:getDimensions()`。

纹理分两类：`gTextures['main']` 是 192×256 的图集，背景、心、箭头、粒子是独立小图。音效统一用 `'static'` 模式，音乐文件也按 `static` 处理；背景音乐在建好后 `play()` 并 `setLooping(true)`，否则只播一遍就静音。

## 共享函数

| 函数                   | 调用者               | 作用         |
| ---------------------- | -------------------- | ------------ |
| `renderHealth(health)` | serve、play、victory | 画满心与空心 |
| `renderScore(score)`   | serve、play、victory | 右上角分数   |
| `displayFPS()`         | `love.draw`          | 左上角帧率   |

这三个函数不属于任何状态，却被两个以上状态调用，放在 `main.lua` 里只写一份。

它们依赖全局的 `gTextures` 和 `gFrames`，只能在 `love.load` 之后调用。`displayFPS` 只是调试工具，发布时删掉它和那行绿色 `setColor` 即可。

## 加载顺序

```lua
function love.load()
    love.graphics.setDefaultFilter('nearest', 'nearest')
    math.randomseed(os.time())

    gTextures = {
        ['main'] = love.graphics.newImage('graphics/breakout.png')
    }
    gFrames = {
        ['bricks'] = GenerateQuadsBricks(gTextures['main'])
    }

    love.window.setMode(WINDOW_WIDTH, WINDOW_HEIGHT, { vsync = true })
    push.setupScreen(VIRTUAL_WIDTH, VIRTUAL_HEIGHT, { upscale = 'normal' })
end
```

顺序里有几条硬约束：

- `setDefaultFilter` 必须在所有 `newImage`、`newFont` 之前
- `math.randomseed(os.time())` 只调一次，不要放进 `update`
- `newFont` 之后再 `setFont`，否则默认字体不是想要的字号
- `push.setupScreen` 放在 `setMode` 之后，窗口尺寸才确定

`setDefaultFilter` 只影响此后创建的纹理，先加载图片再设滤镜，放大时边缘就糊了。每帧的 `love.draw` 被 `push.start()` 与 `push.finish()` 包住，漏掉 `finish` 会让画布变换留在栈上。`upscale` 用 `normal` 允许非整数倍，`pixel-perfect` 只取整数倍，`stretched` 会变形。

## 打包与发布

把项目目录压成 zip 改后缀为 `.love`，`love breakout.love` 就能运行。再和 LÖVE 的二进制拼接，可以生成不依赖客户端的可执行文件。

存档不打进 `.love`，它始终在用户目录，升级版本不会覆盖最高分。

- 确认 `main.lua` 在压缩包根目录
- 只打包 `src`、`graphics`、`sounds`、`fonts`、`lib`
- 发布前关掉 FPS 显示

`.love` 只是 zip，解压后就能检查内容；发布前用它跑一遍，比直接信任目录结构可靠。测试时把它放到没有源码的目录再运行，能提前发现漏掉的文件和大小写问题。LÖVE 的版本要和打包用的运行时一致，用 11.x 打包却让玩家用 0.10 打开，`push` 和粒子接口都可能不兼容。

发布目录里不要放 `.git`、编辑器配置和测试素材，它们会让包变大，也可能暴露本地路径。Windows 上双击 `.love` 需要系统关联 LÖVE；给玩家发独立可执行文件更省事。macOS 的 `.app` 需要签名才能在默认设置下打开。压缩时用 store 模式即可，Lua 和图片本身已经压过。打好的包先自己玩一关，再发给别人，版本号写清楚。
