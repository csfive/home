---
title: 命令行环境
description: MIT Missing Semester 第 1 讲 主题清单
---

# 命令行环境

[第 1 讲 · Command-line Environment](https://missing.csail.mit.edu/2026/command-line-environment/ 'MIT Missing Semester 第 1 讲：视频、讲义和课后练习')

[课后练习答案](https://github.com/csfive/missing-semester/tree/main/01-command-line-environment '非官方，仅供参考')

## 参数与 flag

- 参数是纯字符串，含义由程序解释
- `$1`…`$9`、`$#`、`$@`、`$0`
- `"$@"` 的引号语义
- `-a` 与 `--all` 等价
- 短选项合并、顺序无关：`ls -la`
- `--` 终止选项解析
- 可变参数：同一操作作用于多个文件
- glob 在程序启动前展开成参数

## 流与管道

- 管道中所有进程同时启动
- stdin、stdout、stderr 的分工
- `-` 作为 stdin 的文件名
- `>`、`>>`、`<`、`2>`、`&>` 与 `/dev/null`
- [fzf](https://github.com/junegunn/fzf) 过滤 stdin：`ls | fzf`、`history | fzf`

## 变量与环境

- `foo=bar` 不能有空格
- `'` 字面量与 `"` 展开
- 命令替换 `$(...)` 保留换行
- 进程替换 `<(...)` 的临时文件
- `printenv`、`export`、`unset`
- 单命令环境：`TZ=Asia/Tokyo date`
- 环境变量大写命名只是约定
- `$HOME`、`$PATH` 的隐式作用
- `source` 与 `.` 在当前 shell 执行
- 子 shell 与变量作用域

## 返回码与条件

- 0 成功、非 0 失败
- `exit NUM` 与 `$?`
- `$?` 只保留上一条命令
- `&&`、`||` 短路
- `if cmd; then` 与 `while read`
- 返回码 0–255 截断

## 信号与作业控制

- 信号即软件中断
- `SIGINT`、`SIGQUIT`、`SIGTERM`
- `SIGSTOP`、`SIGTSTP`、`SIGHUP`
- `SIGKILL` 不可捕获
- `Ctrl-C`、`Ctrl-\`、`Ctrl-Z`
- 信号由终端发给前台进程组
- `kill -l`、`kill -TERM PID`
- `kill %1`、`kill $!`
- `jobs`、`fg`、`bg`、`&`
- `pgrep`、`pkill -lf`
- `wait` 只等子进程
- `kill -0` 探活
- `nohup`、`disown`
- 关闭终端与 `SIGHUP`
- `trap cleanup EXIT`

## 远程机器

- `ssh user@host`
- `ssh host cmd` 的引号归属
- 公钥认证与私钥
- `ssh-keygen -a 100 -t ed25519`
- `ssh-copy-id` 与 `authorized_keys`
- `~/.ssh/config` 的 Host 块与通配
- `IdentityFile`、`Port`、`User`
- `ssh-agent` 与 passphrase
- 密钥权限 600/700
- `known_hosts` 与首次连接
- `scp`、`rsync` 与 `--partial`
- `rsync` 源路径的尾部 `/`
- 端口转发：`LocalForward`、`-N -f`
- [mosh](https://mosh.org/) 的断线恢复

## 终端复用

- session、window、pane 三层
- `tmux new -s` 命名 session
- `tmux ls` 与 `tmux a -t`
- `<C-b> d` 分离 session
- `<C-b> c`、`<C-b> N`、`<C-b> w`
- `<C-b> %` 垂直分屏
- `<C-b> "` 水平分屏
- 方向键切换 pane、`<C-b> z` 放大
- `<C-b> [` 滚屏与复制
- 远端会话替代 `nohup`

## Shell 定制

- dotfile 与隐藏文件约定
- bash 启动文件：`.bashrc` 与 `.bash_profile`
- `export PATH="$PATH:..."`
- `PATH` 的重复项与顺序
- `alias` 与函数
- `alias ll`、`\ls`、`unalias`
- `history`、`Ctrl-R`
- fzf 接管历史搜索
- dotfiles 仓库与 `ln -s`
- `curl | bash` 的风险
- brew、apt、dnf、pacman
- `ripgrep` 与 `fd`
- `tldr`、command-not-found.com
- oh-my-zsh、prezto 与插件，按需安装
- `$PS1`、补全、语法高亮
- 终端模拟器：字体、配色、GPU 与 `$TERM`

## AI 在命令行里

- `llm cmd` 生成命令
- [llm](https://github.com/simonw/llm) 接管道清洗文本

## 容易混淆的问题

- `source` 与 `./script.sh`
- `$?` 与 `$!`
- `kill %1` 与 `kill PID`
- `Ctrl-C` 与 `Ctrl-Z`
- `nohup`、`disown` 与 tmux
- `ssh host cmd` 的引号由哪端展开
- `-` 是 stdin 还是文件名
- `--` 是参数还是终止符
- `alias` 与函数
- `$@` 加不加引号
- 信号是 shell 发的还是终端发的
- 关闭终端为何杀掉后台任务
