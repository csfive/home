---
title: 课程概览与 Shell
description: MIT Missing Semester 第一讲笔记
sidebar:
  order: 0
slug: ms/00
---

[Course Overview + Introduction to the Shell](https://missing.csail.mit.edu/2026/course-shell/ 'MIT Missing Semester 第一讲：官方讲义、视频和课后练习')

> [!TIP]
>
> 本节课的命令默认按 **bash** 写，zsh 大体兼容，个别结果会有所不同。

## 终端与 Shell

**一句话**：终端负责显示和输入，Shell 负责读懂命令并执行。

这两个词经常混着用，但它们不是一回事：终端是窗口，Shell 是窗口里跑的程序。

### 终端：一块会收发字节的画布

上世纪六七十年代，主机在机房，你桌上放一台 VT100 或电传打字机（ASR-33），一根串口线连过去。

Terminal 这个词的原意就是「线路的末端」。那台机器**没有任何计算能力**，只做两件事：

- 输入：把按键变成字节，从串口线发出去
- 输出：把主机发回来的字节打到屏幕上

真正的计算全在机房的主机上。

电传打字机 Teletypewriter，缩写 TTY，沿用到了现在：

- `tty` 命令：现在在哪个终端上
- `ps` 的 `TTY` 列：进程挂在哪个终端上

硬件终端早就不生产了。现代的「终端」其实是**终端模拟器**（terminal emulator），一个普通 GUI 程序，假装自己是 VT100。

它做的事情还是那两件，只不过换成了窗口：

- 输入：键盘、鼠标、粘贴
- 输出：把字节渲染成字符、颜色、光标

还多了标签页、分屏、透明度、滚动缓冲这些东西。

叫「模拟器」是因为 VT100 那套控制码成了标准：`\e[2J` 清屏，`\e[31m` 变红。今天的终端都在照做。它模拟的是**协议**，不是硬件。

常见终端：GNOME Terminal、Konsole、xterm、iTerm2、Terminal.app、Windows Terminal、Alacritty、Kitty、WezTerm、Ghostty。

### Shell：读命令的程序

Shell 是一个进程，大部分时间都在跑同一个循环：

```text
提示符 → 读一行 → 解析/展开 → 找程序 → 执行 → 等结束 → 提示符
```

比如输入：

```bash
echo "hello world"
```

这一行不会原样丢给 `echo`。Shell 会先处理它：

1. 切词：`echo` 和 `"hello world"` 是两个词
2. 展开：引号、变量、命令替换、通配符
3. 查找：在 `$PATH` 里找 `echo`
4. 执行：`fork` + `exec`，父进程 `wait`
5. 拿到返回码，打印下一个提示符

下面按这个顺序拆开。

## 一条命令的旅程

### 切词：空白不是分隔符那么简单

Shell 先按空白把一行切成词：

```bash
echo hello world      # 两个参数：hello、world
echo "hello world"    # 一个参数
echo hello\ world     # 一个参数
echo hello     world  # 还是两个，多个空格只起分隔作用
```

`echo` 会把参数用单个空格拼起来打印，所以前两种输出看起来一样。换个程序就能看出差别：

```bash
python3 -c 'import sys; print(sys.argv[1:])' hello world
# ['hello', 'world']

python3 -c 'import sys; print(sys.argv[1:])' "hello world"
# ['hello world']
```

Shell 传给程序的不是原始字符串，而是 `argv` 数组。C 的 `argc/argv`、Java 的 `String[] args`、Python 的 `sys.argv` 都是这个东西。

### 引号：告诉 Shell 哪些空白和字符不要碰

```bash
echo '$HOME'        # $HOME
echo "$HOME"        # /home/you
name=world
echo "hello $name"  # hello world
echo 'hello $name'  # hello $name
```

- **单引号**：完全字面，里面的空格、`$`、`*` 都不处理
- **双引号**：保留空格，但允许 `$变量`、`$(命令)`、反引号和 `\` 转义
- **反斜杠**：只转义下一个字符，`hello\ world` 里的空格不再是分隔符
- **`$'...'`**：ANSI-C 引号，支持 `\n`、`\t` 这类转义

引号本身不会传给程序，它只是 Shell 解析时的标记。

引号没闭合时，Shell 不会立刻执行，而是进入续行状态，等你补完。按 `Ctrl-C` 可以取消。

### 变量与命令替换

```bash
name=world          # 等号两边不能有空格
echo "$name"
echo "${name}!"     # 花括号划清变量边界
echo "today: $(date +%F)"
```

- `name=value` 定义 Shell 变量
- `$name` 取值，`${name}` 在拼接时更清楚
- `$(命令)` 是命令替换：先执行命令，把输出替换到当前位置
- 旧写法是反引号，不能嵌套，优先用 `$()`
- `export name` 才会把它变成环境变量，传给子进程

在 bash 里，变量展开后如果没加引号，Shell 还会做一次「切词」和「通配符展开」。

```bash
files='a.txt b c.txt'

printf '[%s]\n' "$files"
# [a.txt b c.txt]

printf '[%s]\n' $files
# [a.txt]
# [b]
# [c.txt]
```

`files` 里有一个空格。在 bash 里，两种写法的区别是 Shell 传给 `printf` 的参数个数：

| 写法       | 参数个数 | 每个参数              |
| ---------- | -------- | --------------------- |
| `"$files"` | 1        | `a.txt b c.txt`       |
| `$files`   | 3        | `a.txt`、`b`、`c.txt` |

- **加引号**：空格只是字符串里的普通字符，整个值是一个参数。
- **不加引号**：在 **bash** 里，Shell 按空白切词，空格、Tab、换行都算分隔符，所以切成三个。
- `printf` 对每个参数重复一次格式，所以第二种打印三行。

> 上面是 bash 的行为。zsh 默认不做 word splitting，所以 `$files` 和 `"$files"` 会得到一个参数；要显式切用 `${=files}`。

`echo` 会把多个参数用空格拼回去，所以 `echo $files` 看起来会和 `echo "$files"` 一样；`printf` 才能看出参数个数。

在 bash 里，`$(ls)` 的输出用换行分隔，不加引号也会被切开；但文件名里有空格时照样会被切坏。所以变量一般都要加双引号：`"$name"`、`"$files"`。

### 通配符：Shell 先展开，程序后收到

```bash
echo *.md           # Shell 展开成文件列表
echo "*.md"         # 字面量，交给程序自己处理
echo file?.txt      # 一个字符
echo {a,b,c}.txt    # a.txt b.txt c.txt
```

- `*`：任意长度字符
- `?`：一个字符
- `[abc]`：集合里的一个字符
- `{a,b}`：逗号列表展开成多个词
- `/` 分隔目录层级，`*` 默认不跨 `/`
- 以 `.` 开头的隐藏文件默认不匹配

Shell 展开完才把结果传给程序，所以程序收到的是实际路径列表，不是 `*.md` 这个字符串。

没有匹配时，bash 默认把 `*.md` 原样传下去；这和正则匹配失败是两回事。

### `$PATH`：程序到底从哪来

```bash
echo $PATH
which python3
which -a python3
/usr/bin/python3 --version
```

`$PATH` 是冒号分隔的目录列表。Shell 按顺序找同名可执行文件，找到第一个就执行。

- `which` 显示第一个匹配
- `which -a` 显示所有匹配
- 直接写完整路径可以绕过 `$PATH`
- `cd`、`if`、`while` 这类内建命令不查 `$PATH`
- `$PATH` 是环境变量，会被子进程继承

找不到就是 `command not found`。同名程序在多个目录里时，前面的赢，所以 `$PATH` 的顺序很重要。

### `fork` + `exec`：程序是怎么跑起来的

Shell 自己是一个进程。要跑外部程序时，它大致做：

```text
pid = fork()
if pid == 0:
    execve("/bin/echo", ["echo", "hi"], env)
else:
    wait(pid)
```

- `fork()`：复制当前进程，得到一个子进程；子进程有自己的一份内存
- `execve()`：把子进程的内存镜像替换成新程序；PID 不变
- 父进程 `wait()`：等子进程结束，拿返回码
- `$?` 就是最近一次等待得到的返回码

Shell 内建命令（`cd`、`if`、`while`）不 `fork`，直接在 Shell 进程里执行；外部命令才走 `fork` + `exec`。

## 为什么 `cd` 必须是内建

子进程只能改自己的当前目录，改不了父进程的。

如果 Shell `fork` 一个 `cd` 程序，子进程 `chdir()` 成功后退出，父 Shell 的当前目录根本没变。所以 `cd` 只能由 Shell 自己实现。

## 打开终端发生了什么

### PTY：终端模拟器和 Shell 之间的管道

```text
键盘 → 终端模拟器 → PTY master → 行规程 → PTY slave → Shell
                                                      ↓ fork/exec
                                                   ls / vim / python
显示 ← 终端模拟器 ← PTY master ← 行规程 ← PTY slave ← 输出
```

终端模拟器启动时创建一对 **PTY**（伪终端）：

- master 端由终端模拟器持有
- slave 端交给 Shell，作为它的 stdin/stdout/stderr
- Shell 和终端模拟器都只读写字节
- `tty` 显示的 `/dev/pts/N` 就是 slave 端

终端不知道 `ls` 是什么；Shell 不知道字体、颜色、窗口大小。它们之间只有字节流。

### 行规程：按键在到达 Shell 之前先经过内核

PTY 中间还有一层**行规程**（line discipline），负责把键盘字节整理成 Shell 能读的行。

默认的规范模式（canonical mode）下：

- 输入先缓冲，按 Enter 才交给 Shell
- 输入的字符会回显
- Backspace 删除当前行最后一个字符
- `Ctrl-C` 产生 `SIGINT`，发给前台进程组
- `Ctrl-\` 产生 `SIGQUIT`
- `Ctrl-Z` 产生 `SIGTSTP`，把进程挂起
- `Ctrl-D` 不是信号，表示 EOF：`read` 返回 0

vim、less 这类全屏程序会切到 raw 模式，自己读每个按键、自己重画屏幕，所以按键行为又不一样。

```bash
stty -a       # 看当前行规程设置
stty size     # 终端行列数
```

### 关掉终端后，进程为什么有时候还活着

关闭终端窗口时，master 端关闭，内核会给会话发 `SIGHUP`。Shell 和它的前台任务通常跟着退出。

想让它继续跑：

- `nohup 命令 &`
- `tmux` / `screen`：Shell 跑在 tmux server 里，终端只是连上去的客户端
- `disown -h`：让任务忽略 `SIGHUP`；普通 `disown` 只是从作业表里移除

## 为什么要用 Shell

- 比鼠标点来点去快，任务越复杂越明显
- 能把小工具串起来：`|`、重定向、循环
- 能写脚本，批量处理
- 装开源软件、配 CI、看报错都绕不开它

## 几个容易混的点

| 问题                        | 答案                                                              |
| --------------------------- | ----------------------------------------------------------------- |
| 终端和 Shell 是一回事吗？   | 不是，终端是窗口，Shell 是里面跑的程序                            |
| `$SHELL` 是当前 Shell 吗？  | 不一定，它是登录 Shell；交互式 Shell 看 `$0`，更稳的是 `ps -p $$` |
| `$TERM` 是 Shell 类型吗？   | 不是，是终端能力，比如 `xterm-256color`                           |
| 终端里只能跑 Shell 吗？     | 不是，也可以直接跑 `vim`、`ssh`、`python`                         |
| Shell 一定要有终端吗？      | 不用，脚本、CI、`ssh host 'cmd'` 都可以                           |
| 单引号和双引号一样吗？      | 不一样，单引号全字面，双引号会展开变量和命令替换                  |
| glob 和正则一样吗？         | 不一样，glob 由 Shell 展开，正则由 `grep`、`sed` 等程序解释       |
| `cd` 为什么不能是外部程序？ | 子进程改不了父进程的当前目录                                      |
| `Ctrl-C` 是终端杀进程吗？   | 终端只发字节，内核行规程产生 `SIGINT`，发给前台进程组             |

## 查当前值

```bash
echo $SHELL        # 登录 Shell
echo $0            # 交互式 Shell 的名称；脚本里是脚本名
echo $TERM         # 终端类型
tty                # 当前终端设备
ps -p $$ -o pid,ppid,comm
stty size          # 终端行列数
```
