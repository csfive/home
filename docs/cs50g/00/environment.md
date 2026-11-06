---
title: 环境
description: 哈佛 CS50G Week 0 · LÖVE 与 Lua 工具链
---

# 环境

课程用 Lua 写游戏，用 LÖVE 提供窗口、绘图、输入和音频。环境只需要一个可执行文件和一个 `main.lua`。

## 工具链

| 工具                                              | 作用                            |
| ------------------------------------------------- | ------------------------------- |
| [LÖVE](https://love2d.org/)                       | 2D 运行时，负责窗口、渲染、音频 |
| LuaJIT                                            | LÖVE 内置的解释器，兼容 Lua 5.1 |
| [LuaLS](https://luals.github.io/)                 | VS Code 的 Lua 语言服务         |
| [StyLua](https://github.com/JohnnyMorganz/StyLua) | Lua 格式化工具                  |

## 运行方式

| 方式          | 命令                          |
| ------------- | ----------------------------- |
| 拖目录到 LÖVE | 自动执行目录里的 `main.lua`   |
| 命令行        | `love .`                      |
| 打包          | 目录压成 `.love`，再交给 LÖVE |
| VS Code       | Love 2D Support，快捷键运行   |

`main.lua` 是入口，LÖVE 启动后只认这个文件名。

## 项目结构

```text
pong/
├── main.lua
├── Paddle.lua
├── Ball.lua
├── font.ttf
└── sounds/
    ├── paddle.wav
    └── score.wav
```

`require 'Paddle'` 会自动找 `Paddle.lua`，不用写扩展名。

## ARM 上的 LuaJIT

Apple Silicon 上某些 LÖVE 版本会有 JIT 兼容问题，启动时调用 `jit.off()` 可以退回解释器：

```lua
if jit then jit.off() end
```

代价是性能下降；只是拿来跑课程示例通常感觉不到。

## 版本

LÖVE 11.x 对应 Lua 5.1 / LuaJIT。不要用 Lua 5.3 的整数语义写代码，课程示例按 5.1 的行为设计。
