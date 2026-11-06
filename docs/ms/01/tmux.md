---
title: 终端复用
description: MIT Missing Semester 第 1 讲 · tmux 的会话、窗口与窗格
---

# 终端复用

tmux 把多个 Shell 放进一个终端窗口，并让它们活过 SSH 断开。

## 三层结构

| 层      | 对应   | 说明                |
| ------- | ------ | ------------------- |
| session | 工作区 | 可分离、可重连      |
| window  | 标签页 | 一个 session 里多个 |
| pane    | 分屏   | 一个 window 里多个  |

## 命令

```bash
tmux new -s work
tmux ls
tmux a -t work
tmux kill-session -t work
```

## 快捷键

前缀是 `Ctrl-b`，按完松开再按下一个键。

| 快捷键    | 作用               |
| --------- | ------------------ |
| `<C-b> d` | 分离 session       |
| `<C-b> c` | 新建 window        |
| `<C-b> N` | 跳到第 N 个 window |
| `<C-b> w` | 列出 window        |
| `<C-b> %` | 垂直分屏           |
| `<C-b> "` | 水平分屏           |
| 方向键    | 切换 pane          |
| `<C-b> z` | 放大当前 pane      |
| `<C-b> [` | 滚屏与复制         |

## 配置

```bash
set -g prefix C-a
set -g mouse on
```

改完 `tmux source-file ~/.tmux.conf` 生效。

| 需求             | 写法                                |
| ---------------- | ----------------------------------- |
| 换前缀           | `set -g prefix C-a`                 |
| 开鼠标           | `set -g mouse on`                   |
| 复制到系统剪贴板 | macOS 配 `pbcopy`，Linux 配 `xclip` |

## 远端场景

- SSH 断开、网络抖动、合盖，session 都还在服务器上
- 重新 `tmux a` 就能继续，不需要 `nohup`
- 脚本里用 `tmux new-session -d -s work`，再 `tmux send-keys` 注入命令
- 嵌套 tmux 时内外层抢前缀，给内层换一个前缀
