---
title: 代码智能与语言服务器
description: MIT Missing Semester 第 2 讲 · 代码智能与语言服务器
---

# 代码智能与语言服务器

补全、跳转、悬停文档这些能力不属于编辑器，属于编辑器背后那台语言服务器。

## LSP 是什么

Language Server Protocol 规定编辑器与语言服务之间的消息格式：请求、响应、通知，全部用 JSON-RPC 编码，默认走标准输入输出，也可以走 TCP socket。编辑器启动时拉起一个 server 进程，双方交换能力清单，之后按需发问。

```mermaid
flowchart LR
  E[编辑器] -->|JSON RPC| S[语言服务器]
  S -->|解析| P[项目文件与依赖]
  S -->|诊断通知| E
```

这套协议的价值在于解耦。同一个 `gopls` 可以同时服务 VS Code、Neovim、Emacs，编辑器不必为每种语言实现一套解析器。m 个编辑器配 n 种语言，从 m×n 份适配变成 m+n 份。

## 能力清单

| 能力        | 典型方法                          |
| ----------- | --------------------------------- |
| 补全        | `textDocument/completion`         |
| 悬停文档    | `textDocument/hover`              |
| 跳转定义    | `textDocument/definition`         |
| 查找引用    | `textDocument/references`         |
| 重命名符号  | `textDocument/rename`             |
| 整理 import | `textDocument/codeAction`         |
| 格式化      | `textDocument/formatting`         |
| 实时诊断    | `textDocument/publishDiagnostics` |

诊断是 server 主动推送的通知，不是编辑器去问。所以你会看到「刚打开文件就有红线」，那是 server 解析完整个项目的结果，也解释了为什么大仓库第一次打开会卡几秒。

保存时自动补上缺失的 `import`、按字母序整理导入，也是 server 提供的 `codeAction`，编辑器只是把它绑到了保存事件。

## 装哪个 server

| 语言       | server                       | 备注                         |
| ---------- | ---------------------------- | ---------------------------- |
| Python     | Pylance 或 `pyright`         | VS Code 里由 Python 扩展带   |
| Go         | `gopls`                      | 官方维护                     |
| Rust       | `rust-analyzer`              | 读 `Cargo.toml`              |
| C/C++      | `clangd`                     | 依赖 `compile_commands.json` |
| TypeScript | `typescript-language-server` | 基于 tsserver                |
| Lua        | `lua-language-server`        | Neovim 配置常用              |

有些语言装完扩展就能用，有些要额外告诉 server 项目在哪。C/C++ 是最典型的例子：没有 `compile_commands.json`，`clangd` 只能瞎猜头文件路径，跳转就时灵时不灵。

## 让它看见你的环境

Python 是最容易出错的一类。系统里同时有 `/usr/bin/python3`、`pyenv` 的版本、项目的 `.venv`，server 默认可能选中了错的那个，于是导入全是红线、补全只剩关键字。

```json
{
  "python.defaultInterpreterPath": "${workspaceFolder}/.venv/bin/python",
  "python.analysis.typeCheckingMode": "basic"
}
```

在 VS Code 里也可以打开命令面板（`Cmd-Shift-P`）执行 `Python: Select Interpreter`，选中 `.venv`。Neovim 0.11 起用 `vim.lsp.config` 传参数、`vim.lsp.enable` 启用 server，配置里同样要写清 `venvPath` 与 `venv`，否则它还是看不见依赖。

`:checkhealth` 能看到 server 有没有启动、根目录识别成了哪里。多数「LSP 不工作」的问题出在根目录选错，而不是 server 装错。

## 与独立工具的分工

格式化、lint、类型检查都能脱离编辑器单独跑。CI 里跑的是命令行，编辑器里跑的是同一个程序的 LSP 封装，两边规则不一致就会吵架。

| 工具          | 职责                   | 常用命令              |
| ------------- | ---------------------- | --------------------- |
| `ruff`        | lint 加格式化          | `ruff check --fix .`  |
| `ruff format` | 只做格式化             | `ruff format .`       |
| `mypy`        | 静态类型检查           | `mypy src`            |
| `gopls`       | 语言服务，也带 `check` | `gopls check main.go` |

LSP 管语言智能，调试走另一个协议 DAP。编辑器同时接两个 server 很常见：一个给补全，一个给断点。
