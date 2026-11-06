---
title: Shell 定制
description: MIT Missing Semester 第 1 讲 · dotfile、PATH 与历史
---

# Shell 定制

以点开头的文件默认不显示，配置就藏在这些 dotfile 里：`~/.bashrc`、`~/.gitconfig`、`~/.vimrc`、`~/.ssh/config`、`~/.tmux.conf`。Shell 启动时读哪个文件，取决于它是登录 Shell 还是交互 Shell：登录 Shell 读 `~/.bash_profile` 或 `~/.profile`，交互非登录 Shell 读 `~/.bashrc`。很多系统在 profile 里显式 `source ~/.bashrc`，把两条路径接上。

这个区别解释了很多“为什么配置在脚本里不生效”的问题。非交互 Shell 通常不读 `~/.bashrc`，脚本里的别名和函数因此不存在；`bash -l` 强制登录模式，`bash -i` 强制交互模式，排查时可以用它们验证。

最常见的改动是往 `$PATH` 里加目录：`export PATH="$PATH:$HOME/.local/bin"`。重复执行会累积重复项，路径顺序决定优先级，排在前面的一直赢。`typeset -U path`（zsh）或手动去重可以避免 `$PATH` 越来越长。

`alias` 给命令起短名，`alias ll="ls -lh"` 之后 `ll` 就等价于那串命令；`alias ll` 查看定义，`\ls` 绕过别名，`unalias` 删除。别名只是文本替换，不能在中间插参数，需要逻辑时写函数：

```bash
mkcd() { mkdir -p "$1" && cd "$1"; }
```

`history` 记录命令，`Ctrl-R` 反向搜索，装了 fzf 之后 `Ctrl-R` 会变成模糊搜索整个历史。`HISTCONTROL=ignoredups` 去掉连续重复，`HISTSIZE` 和 `HISTFILESIZE` 控制内存和文件里的条数，`history -c` 清空。历史里可能带着密钥和 token，`HISTIGNORE` 或命令前加空格（配合 `HISTCONTROL=ignorespace`）可以避免记录。

dotfile 应该有自己的仓库，再用符号链接放回 home 目录。这样换机器只需要 clone 一次、跑一遍链接脚本，改动也有版本记录。链接脚本本身也要进仓库，最简版本就是一组 `ln -sf`；仓库里常见的是 `dotfiles` 加 `install.sh` 的结构。

安装脚本要小心 `curl ... | bash` 这种写法，它直接执行没看过的代码；先下载、读一遍、再执行更稳妥。包管理器安装的软件通常不需要这种脚本，Homebrew、apt、dnf、pacman 都能处理。

工具本身用包管理器装：macOS 是 Homebrew，Debian/Ubuntu 是 `apt`，Fedora 是 `dnf`，Arch 是 `pacman`。装完可以试试 `ripgrep` 和 `fd`，它们分别是 `grep` 和 `find` 的现代版本；`tldr` 给出命令的常用例子，command-not-found.com 则告诉你某个命令该用哪个包安装。

zsh 生态里有 oh-my-zsh、prezto 这类框架，也有语法高亮、自动建议、补全增强这些单独插件。框架省事，但会拖慢启动；只装真正用到的插件通常更快，也更好控制。启动耗时可以用 `time bash -i -c exit` 或 zsh 的 `zprof` 量一下。

`$PS1` 控制提示符，补全和语法高亮则决定了日常输入的顺手程度。最后是终端模拟器本身：字体、配色、滚屏行数、快捷键都值得调一次。Alacritty、Ghostty 这类新终端用 GPU 渲染，`$TERM` 告诉里面的程序支持哪些能力。
