---
title: 环境
description: 哈佛 CS50G Week 0 · LÖVE 与 Lua 工具链
---

# 环境

## 工具链

| 工具                                              | 作用                                    |
| ------------------------------------------------- | --------------------------------------- |
| [LÖVE](https://love2d.org/)                       | 2D 游戏框架，提供窗口、绘图、输入和音频 |
| LuaJIT                                            | LÖVE 自带的解释器，兼容 Lua 5.1         |
| [LuaLS](https://luals.github.io/)                 | VS Code 的 Lua 语言服务                 |
| [StyLua](https://github.com/JohnnyMorganz/StyLua) | Lua 格式化工具                          |

## 运行方式

| 场景     | 做法               |
| -------- | ------------------ |
| 当前目录 | `love .`           |
| 指定目录 | `love ~/code/pong` |

## LuaJIT

LÖVE 内置 LuaJIT，不用另装 Lua。它是 Lua 5.1 的一个实现，主打性能。

JIT 是 Just-In-Time 的缩写：程序跑起来之后，反复执行的那几段会被编译成机器码，之后直接跑机器码，不用再逐条解释。

语法基本停在 5.1，只额外认 `goto`、`\z` 这几个 5.2 的特性。5.3 的 `//` 和位运算符没有，位运算要走 `bit` 库：`local bit = require('bit')`。

ARM 这边，LÖVE 11.4 起才有原生 arm64 包。JIT 编译得在系统里申请一块可执行内存，Apple Silicon 上这块内存不太可靠，11.5 索性把 macOS arm64 的 JIT 默认关了。
