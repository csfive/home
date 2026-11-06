---
title: 信号与作业控制
description: MIT Missing Semester 第 1 讲 · 中断、挂起与后台任务
---

# 信号与作业控制

信号是一种软件中断，进程收到后可以退出、暂停，也可以捕获后自行处理。`Ctrl-C` 对应 `SIGINT`，`Ctrl-\` 对应 `SIGQUIT`，`Ctrl-Z` 对应 `SIGTSTP`。很多人以为是 Shell 在发信号，实际上是终端驱动把信号发给当前的前台进程组；Shell 只是负责作业控制，记录谁在前台、谁被挂起。

进程组是这里的关键概念。一个管道里的所有进程属于同一个作业，终端只认前台进程组，信号会发给组里的每一个成员。`ps -o pid,ppid,pgid,sid,tty` 能看到进程组和会话；`Ctrl-C` 之所以能同时停掉管道两端，就是因为它们在同一个组里。

| 信号      | 快捷键   | 默认行为         |
| --------- | -------- | ---------------- |
| `SIGINT`  | `Ctrl-C` | 终止             |
| `SIGQUIT` | `Ctrl-\` | 终止并 core dump |
| `SIGTSTP` | `Ctrl-Z` | 暂停             |
| `SIGHUP`  | 终端关闭 | 终止             |

`SIGTERM` 是通用的终止请求，`kill -TERM PID` 发送它，`kill -l` 列出所有信号。`SIGKILL` 是例外，它不能被捕获，进程一定会死，代价是来不及清理，可能留下孤儿子进程。`SIGSTOP` 同样不可捕获，和 `SIGTSTP` 的区别就在这里：前者只能被 `SIGCONT` 恢复，后者能被程序自己忽略。

作业可以用 job spec 引用：`jobs` 列出当前终端的作业，`%1` 是第一个，`kill %1` 结束它，`$!` 是最后一个后台进程的 PID。`&` 让命令在后台启动，`fg` 把它调回前台，`bg` 让挂起的作业继续在后台运行。

进程的生命周期不只属于当前 Shell。`nohup` 让程序忽略 `SIGHUP`，并把输出改到 `nohup.out`；`disown` 把已经启动的作业从作业表里移除；`setsid` 开一个新会话，彻底脱离控制终端。三者都不能让进程在终端关闭后继续读终端，`tmux` 从根上解决这个问题。

脚本里可以用 `trap` 在收到信号或退出时执行清理：

```bash
cleanup() { rm -f "$tmp"; }
trap cleanup EXIT
trap 'exit 130' INT TERM
```

`EXIT` 在脚本正常结束或 `exit` 时都触发，`ERR` 在命令失败时触发，`DEBUG` 每条命令前触发。`trap -l` 和 `trap -p` 分别列出信号和已安装的处理器。

等待进程时，`wait` 只对自己启动的子进程有效；要等一个不认识的 PID，可以用 `kill -0` 探活，它不发信号，只在进程不存在时返回非 0。`timeout 10 cmd` 则给命令加一个自动的 `SIGTERM` 超时，写脚本时比手写循环和 `kill` 简单。

退出码和信号是对应的：被信号终止的进程，Shell 记录的返回码是 128 加信号编号，所以 `kill -9` 之后是 137，`Ctrl-C` 之后是 130。
