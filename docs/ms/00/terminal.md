---
title: 终端与 Shell
description: MIT Missing Semester 第 0 讲 · 终端与 Shell
---

# 终端与 Shell

终端负责显示和输入，Shell 负责解释命令。两者经常被混为一谈，但一个是设备，一个是进程。

## 分工

|      | 终端                       | Shell              |
| ---- | -------------------------- | ------------------ |
| 角色 | 显示字符、接收按键         | 解释命令、启动进程 |
| 例子 | iTerm2、Alacritty、Ghostty | bash、zsh、fish    |
| 边界 | 窗口关掉就没了             | 会话里可以有很多个 |

## 从 TTY 到模拟器

- ASR-33 电传打字机，Teletype 缩写成 TTY
- `tty` 打印当前终端设备路径
- VT100 用控制序列移动光标、改变颜色
- 终端模拟器解释同一套 ANSI 序列

```bash
tty
echo $TERM
tput colors
```

`$TERM` 只是能力名，不是能力本身。terminfo 数据库描述它支持哪些序列，名字写错时程序要么不敢用颜色，要么输出乱码。

## Shell 的循环

1. 打印提示符，通常由 `$PS1` 决定
2. 读入一行
3. 切词、展开
4. 沿 `$PATH` 查找程序
5. `fork` + `exec`，父进程 `wait`
6. 记录返回码，回到 1

## argv

`echo hello` 交给程序的是 `["echo", "hello"]`。Shell 只负责切词，`hello` 是什么意思由程序解释。

| 变量      | 作用域       | 含义       |
| --------- | ------------ | ---------- |
| `$0`      | 脚本 / Shell | 程序名     |
| `$1`…`$9` | 脚本         | 前九个参数 |
| `$#`      | 脚本         | 参数个数   |
| `$@`      | 脚本         | 全部参数   |

## 不同 Shell

| Shell | 特点                    |
| ----- | ----------------------- |
| bash  | 默认选择，POSIX 的超集  |
| zsh   | 补全、主题、插件更丰富  |
| fish  | 语法更友好，不兼容 bash |
| sh    | 最小公共集，脚本可移植  |

`echo $SHELL` 显示登录 Shell，`ps -p $$` 才是当前进程。改默认 Shell 用 `chsh -s /bin/zsh`，重新登录后生效。
