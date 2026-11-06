---
title: 终端复用
description: MIT Missing Semester 第 1 讲 · tmux 的会话、窗口与窗格
---

# 终端复用

`tmux` 把多个 Shell 放进一个终端窗口，分为三层：session 是一次独立的工作区，window 相当于标签页，pane 是窗口里的分屏。启动 `tmux` 会新建一个 session，`tmux new -s name` 给它起名，`tmux ls` 列出所有 session，`tmux a -t name` 重新接上。

所有快捷键都带前缀 `Ctrl-b`，按完松开再按下一个键。`<C-b> d` 分离当前 session，进程继续在后台运行；`<C-b> c` 新建 window，`<C-b> N` 跳到第 N 个，`<C-b> w` 列出 window；`<C-b> %` 垂直分屏，`<C-b> "` 水平分屏，方向键切换 pane，`<C-b> z` 把当前 pane 放大，`<C-b> [` 进入滚屏和复制模式。

它最大的价值在远端：SSH 断开、网络抖动、笔记本合盖，session 都还在服务器上，重新 `tmux a` 就能接着用，不需要 `nohup` 那一套。这也是它和 `screen` 的核心差异：`tmux` 的会话模型更清晰，配置和脚本接口也更完整。

`~/.tmux.conf` 可以改前缀键、状态栏和鼠标支持。最常见的两行是把前缀换成 `Ctrl-a`、打开鼠标：

```bash
set -g prefix C-a
set -g mouse on
```

改完执行 `tmux source-file ~/.tmux.conf`，或者 `<C-b> :source-file ~/.tmux.conf` 让它生效。

复制模式默认用 `<C-b> [` 进入，vi 风格按键可以翻页和选择，`<space>` 开始选择、`<enter>` 复制。macOS 上复制到系统剪贴板要额外配置 `pbcopy`，Linux 则是 `xclip` 或 `wl-copy`。

会话管理还有几个常用命令：`tmux kill-session -t name` 结束一个会话，`tmux rename-session` 改名，`tmux new-window -n build` 起一个有名字的窗口。写脚本时用 `tmux new-session -d -s work` 在后台创建，再 `tmux send-keys` 注入命令，可以把长任务和交互工具放进受控的会话里。

嵌套 tmux 时前缀会冲突，外层和内层都抢 `Ctrl-b`。用 `<C-b> :set -g prefix C-a` 临时换掉内层的，或者干脆避免嵌套。
