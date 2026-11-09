---
title: 信号与作业控制
description: MIT Missing Semester 第 1 讲 · 中断、挂起与后台任务
---

# 信号与作业控制

信号是进程间的软件中断，作业控制是 Shell 对前台和后台的调度。

## 信号

| 信号      | 触发         | 默认行为           |
| --------- | ------------ | ------------------ |
| `SIGINT`  | `Ctrl-C`     | 终止               |
| `SIGQUIT` | `Ctrl-\`     | 终止并 core dump   |
| `SIGTSTP` | `Ctrl-Z`     | 暂停               |
| `SIGHUP`  | 终端关闭     | 终止               |
| `SIGTERM` | `kill`       | 终止               |
| `SIGKILL` | `kill -9`    | 强制终止，不可捕获 |
| `SIGSTOP` | `kill -STOP` | 强制暂停，不可捕获 |
| `SIGCONT` | `kill -CONT` | 继续已暂停的进程   |

```mermaid
flowchart LR
  K[Ctrl-C] --> T[终端驱动] --> G[前台进程组] --> S[收到 SIGINT]
```

Shell 不亲手发信号，它只切换前台进程组。表里前四个由终端触发，后面三个要靠 `kill` 主动发送。

## 发送信号

```bash
kill -l
kill -TERM 1234
kill %1
kill $!
pgrep -lf python
pkill -f python
```

| 写法          | 含义                |
| ------------- | ------------------- |
| `%1`          | 当前 Shell 的作业号 |
| `$!`          | 最后一个后台进程    |
| `PID`         | 系统级进程号        |
| `kill -0 PID` | 只探活，不发信号    |

## 作业控制

| 命令   | 作用                 |
| ------ | -------------------- |
| `&`    | 后台启动             |
| `jobs` | 列出作业             |
| `fg`   | 调回前台             |
| `bg`   | 挂起的作业继续在后台 |
| `wait` | 等自己的子进程       |

`wait` 只对当前 Shell 启动的子进程有效，等陌生 PID 用 `kill -0` 轮询或 `timeout`。

`fg` 把挂起的作业调回前台，`bg` 让它在后台继续，两者实际都是给作业发 `SIGCONT`。进程已经不在作业表里时，只能 `kill -CONT PID`。

## 脱离终端

| 手段          | 效果                              |
| ------------- | --------------------------------- |
| `nohup cmd &` | 忽略 `SIGHUP`，输出进 `nohup.out` |
| `disown`      | 从作业表移除                      |
| `setsid`      | 新会话，脱离控制终端              |
| `tmux`        | 会话独立，可重新接上              |

前三个解决的是信号和会话，解决不了“重新接上”；需要这个能力时只能上 tmux。

## trap

```bash
cleanup() { rm -f "$tmp"; }
trap cleanup EXIT
trap 'exit 130' INT TERM
```

| 事件           | 触发时机          |
| -------------- | ----------------- |
| `EXIT`         | 正常退出或 `exit` |
| `ERR`          | 命令失败          |
| `INT` / `TERM` | 收到对应信号      |

被信号终止时，Shell 记录的返回码是 128 + 信号编号：`SIGKILL` 是 137，`SIGINT` 是 130。
