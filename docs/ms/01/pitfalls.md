---
title: 容易混淆的问题
description: MIT Missing Semester 第 1 讲 · 常见误解
---

# 容易混淆的问题

| 容易混淆                    | 区别                                    |
| --------------------------- | --------------------------------------- |
| `source` / `./script.sh`    | 当前 Shell vs 子进程，改动是否留下      |
| `$?` / `$!`                 | 返回码 vs 后台进程 PID                  |
| `kill %1` / `kill PID`      | 作业号 vs 系统级进程号                  |
| `Ctrl-C` / `Ctrl-Z`         | `SIGINT` 终止 vs `SIGTSTP` 挂起         |
| `nohup` / `disown` / `tmux` | 忽略挂断 vs 移出作业表 vs 独立会话      |
| `ssh host cmd` 引号         | 本地展开 vs 远端展开                    |
| `-`                         | 程序约定，不是 Shell 语法               |
| `--`                        | 终止选项解析，本身不是参数              |
| `alias` / 函数              | 文本替换 vs 可带参数和逻辑              |
| `$@` 加不加引号             | 保持独立 vs 重新切词                    |
| 信号来源                    | 终端驱动发给前台进程组 vs 脚本里 `kill` |
| 关闭终端杀后台              | `SIGHUP` 导致                           |

## 两个补充

**`set -e` 不是万能的。** `if` 条件、`&&` 左值、`!` 后面的失败不会触发退出。

**管道返回码。** 默认只看最后一段，用 `pipefail` 或 `PIPESTATUS`。
