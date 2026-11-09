---
title: Shell 定制
description: MIT Missing Semester 第 1 讲 · dotfile、PATH 与历史
---

# Shell 定制

定制的目标是让环境在每台机器上都一样，并且启动不要太慢。

## 启动文件

| 模式       | 读取的文件                                       |
| ---------- | ------------------------------------------------ |
| 登录 Shell | `~/.bash_profile`、`~/.bash_login`、`~/.profile` |
| 交互非登录 | `~/.bashrc`                                      |
| 非交互脚本 | 通常都不读                                       |

很多系统在 profile 里 `source ~/.bashrc`，把两条路径接上。

```bash
bash -l   # 登录模式
bash -i   # 交互模式
```

## PATH

```bash
export PATH="$PATH:$HOME/.local/bin"
```

- 从左到右查找，前面的优先
- 重复执行会累积重复项
- `type -a` 看所有候选

## 提示符

`PS1` 决定提示符怎么渲染，bash 里 `\u`、`\h`、`\w`、`\$` 分别是用户名、主机名、当前路径和权限符号，root 会显示 `#`。

```bash
PS1='\u@\h \w \$ '
```

改完要写进启动文件才持久。powerlevel10k、starship 这类主题会接管整条提示符，顺带显示 git 分支和上一条命令的返回码。

## alias 与函数

| 方式                                   | 能力                     |
| -------------------------------------- | ------------------------ |
| `alias ll='ls -lh'`                    | 文本替换，不能带中间参数 |
| `mkcd() { mkdir -p "$1" && cd "$1"; }` | 可带参数、条件、循环     |

```bash
alias ll='ls -lh'
alias ll        # 查看定义
\ls             # 绕过别名
unalias ll
```

## 历史

| 操作                     | 说明                    |
| ------------------------ | ----------------------- |
| `Ctrl-R`                 | 反向搜索                |
| `history`                | 列出历史                |
| `HISTCONTROL=ignoredups` | 去掉连续重复            |
| `HISTIGNORE`             | 不记录指定命令          |
| fzf                      | 接管 `Ctrl-R`，模糊搜索 |

历史里可能有 token，命令前加空格可以避免记录，前提是开了 `ignorespace`。

## dotfiles

1. 建一个仓库
2. 把配置文件放进去
3. 写 `install.sh`，用 `ln -sf` 链回 home
4. 换机器：clone、跑脚本

`curl ... | bash` 会直接执行没看过的代码，先下载再读一遍更稳妥。

## 工具与终端

| 类别     | 选择                          |
| -------- | ----------------------------- |
| 包管理器 | brew、apt、dnf、pacman        |
| 搜索     | `ripgrep`、`fd`               |
| 手册     | `tldr`、command-not-found.com |
| 框架     | oh-my-zsh、prezto             |
| 插件     | 语法高亮、自动建议、补全      |
| 终端     | Alacritty、Ghostty，GPU 渲染  |

框架省事但拖慢启动，只装真正用到的插件更快。启动耗时可以用 `time bash -i -c exit` 量。
