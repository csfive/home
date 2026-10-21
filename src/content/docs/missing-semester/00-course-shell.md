---
title: 课程概览与 Shell
description: MIT Missing Semester 第一讲笔记
sidebar:
  order: 0
slug: ms/00
tableOfContents:
  maxHeadingLevel: 4
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

硬件终端现在很少见了。我们说的「终端」其实是**终端模拟器**（terminal emulator），一个普通 GUI 程序，假装自己是 VT100。

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
ls -la
```

这一行不会原样丢给 `ls`。Shell 会先处理它：

1. 切词：`ls` 和 `-la` 是两个词
2. 展开：处理引号、变量、命令替换、glob（这里没有）
3. 查找：在 `$PATH` 里找 `ls`
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

变量展开后如果没加引号，Shell 还会做一次「切词」和 glob 展开。

```bash
files='a.txt b c.txt'

printf '[%s]\n' "$files"
# [a.txt b c.txt]

printf '[%s]\n' $files
# [a.txt]
# [b]
# [c.txt]
```

`files` 里有一个空格。两种写法的区别是 Shell 传给 `printf` 的参数个数：

| 写法       | 参数个数 | 每个参数              |
| ---------- | -------- | --------------------- |
| `"$files"` | 1        | `a.txt b c.txt`       |
| `$files`   | 3        | `a.txt`、`b`、`c.txt` |

- **加引号**：空格只是字符串里的普通字符，整个值是一个参数。
- **不加引号**：Shell 按空白切词，空格、Tab、换行都算分隔符，所以切成三个。
- `printf` 对每个参数重复一次格式，所以第二种打印三行。

> 上面是 bash 的行为。zsh 默认不做 word splitting，所以 `$files` 和 `"$files"` 会得到一个参数；要显式切用 `${=files}`。

`echo` 会把多个参数用空格拼回去，所以 `echo $files` 看起来会和 `echo "$files"` 一样；`printf` 才能看出参数个数。

`$(ls)` 的输出用换行分隔；在 bash 里，不加引号也会被切开，但文件名里有空格时照样会被切坏。所以变量一般都要加双引号：`"$name"`、`"$files"`。

### glob：Shell 先展开，程序后收到

**一句话**：Shell 用 `*`、`?`、`[]` 这些通配符去匹配文件名，并把匹配结果替换到命令里。这个展开过程叫 **glob**，也叫 pathname expansion。

`*` 不是原样传给程序的参数，Shell 会先按文件名展开，再把结果塞进 `argv`。

#### 先看一个目录

```text
project/
├── intro.md
├── main.md
├── notes.txt
├── a1.txt
├── a2.txt
└── docs/
    ├── guide.md
    └── deep/
        └── api.md
```

假设当前在 `project/`，输入：

```bash
echo *.md
```

Shell 不会把 `*.md` 传给 `echo`，而是先替换：

```text
echo *.md  →  echo intro.md main.md
```

`echo` 收到的是两个参数。用 `printf` 能看清：

```bash
printf '[%s]\n' *.md
# [intro.md]
# [main.md]
```

加引号就阻止展开：

```bash
printf '[%s]\n' "*.md"
# [*.md]
```

引号和上一节一样：让 `*` 变成普通字符，原样交给程序。

#### 这些模式分别匹配

| 模式             | 匹配结果                            | 说明                                                      |
| ---------------- | ----------------------------------- | --------------------------------------------------------- |
| `*.md`           | `intro.md`、`main.md`               | `*` 不跨 `/`，不会进 `docs/`                              |
| `*.txt`          | `notes.txt`、`a1.txt`、`a2.txt`     | 只匹配当前目录                                            |
| `a?.txt`         | `a1.txt`、`a2.txt`                  | `?` 正好一个字符                                          |
| `a[12].txt`      | `a1.txt`、`a2.txt`                  | 集合里任选一个                                            |
| `{main,notes}.*` | `main.md`、`notes.txt`              | 先展开成两个模式，再 glob                                 |
| `docs/**/*.md`   | `docs/guide.md`、`docs/deep/api.md` | `**/` 递归任意层（zsh 默认，bash 要先 shopt -s globstar） |

`{a,b}` 严格说是 brace expansion，不是 glob；它先展开成多个词，之后每个词还可能继续 glob。

以 `.` 开头的隐藏文件默认不匹配，要写 `.*`。

#### 递归 glob

`**` 是递归 glob：沿着目录往下走，不限制层数。

| shell | 默认                      | 说明                                     |
| ----- | ------------------------- | ---------------------------------------- |
| bash  | `**` 等同 `*`，只匹配一层 | 要 `shopt -s globstar` 才递归            |
| zsh   | `**/` 默认递归            | `**` 省略 `/` 的写法看 `GLOB_STAR_SHORT` |

```bash
# zsh 默认；bash 要先 shopt -s globstar
printf '%s\n' docs/**/*.md
# → docs/guide.md
# → docs/deep/api.md
```

bash 没开 `globstar` 时，`docs/**/*.md` 等价于 `docs/*/*.md`，只匹配 `docs/deep/api.md`，不会匹配 `docs/guide.md`。

不想依赖 shell 设置就用：

```bash
find docs -name '*.md'
```

#### 没有匹配时会怎样

bash 默认把模式原样传下去：

```bash
printf '[%s]\n' *.nope
# [*.nope]
```

程序收到的是字面量 `*.nope`，不是空列表。zsh 默认会直接报 `no matches found`。

#### glob 不是正则

```bash
ls *.md          # glob，Shell 展开
grep '.*\.md'    # 正则，grep 自己解释
```

- glob 是 Shell 的路径匹配语言，只有 `*`、`?`、`[]` 这些简单能力
- 正则由 `grep`、`sed`、`awk` 等程序解释，表达能力强得多
- 加引号就是把模式原样交给程序，不让 Shell 先展开

一个常见错误：

```bash
# 假设当前目录有 a.md、b.md
grep *.md        # 展开成 grep a.md b.md；a.md 被当成模式
```

变量展开后如果没加引号，结果里的 `*` 也会继续做 glob。所以变量一般都要加引号。

### `$PATH`：程序到底从哪来

Shell 不是凭空知道 `ls` 在哪，它查 `$PATH`。

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
- `cd`、`export` 这类内建命令和 `if`、`while` 这类语法不查 `$PATH`
- `echo` 在 bash 里通常也是内建；`ls`、`grep` 才是典型的外部程序
- `$PATH` 是环境变量，会被子进程继承

找不到就是 `command not found`。同名程序在多个目录里时，前面的赢，所以 `$PATH` 的顺序很重要。

### `fork` + `exec`：程序是怎么跑起来的

Shell 自己是一个进程。要跑外部程序时，它大致做：

```text
pid = fork()
if pid == 0:
    execve("/bin/ls", ["ls", "-l"], env)
else:
    wait(pid)
```

- `fork()`：复制当前进程，得到一个子进程；子进程有自己的一份内存
- `execve()`：把子进程的内存镜像替换成新程序；PID 不变
- 父进程 `wait()`：等子进程结束，拿返回码
- `$?` 就是最近一次等待得到的返回码

`cd`、`export` 这类内建命令不 `fork`，直接在 Shell 进程里执行；`if`、`while` 本来就是 Shell 语法。外部命令才走 `fork` + `exec`。

### 为什么 `cd` 必须是内建

子进程只能改自己的当前目录，改不了父进程的。

如果 Shell `fork` 一个 `cd` 程序，子进程 `chdir()` 成功后退出，父 Shell 的当前目录根本没变。所以 `cd` 只能由 Shell 自己实现。

## 打开终端后发生了什么

前面一直在讲 Shell 怎么处理命令。现在回到更底层：这个 Shell 本身是怎么被终端启动的。

点开终端图标，看起来只是多了一个窗口，背后其实有三个角色：

| 角色       | 例子                   | 负责                       |
| ---------- | ---------------------- | -------------------------- |
| 终端模拟器 | GNOME Terminal、iTerm2 | 画字符、收键盘、鼠标、粘贴 |
| Shell      | bash、zsh              | 读命令、解析、执行         |
| 内核       | Linux / macOS          | 提供 PTY、行规程、发信号   |

它们不是直接连在一起的。终端模拟器和 Shell 中间隔着一对 **PTY**。

### 先补一个 Unix 世界观：一切皆文件

`stdin` / `stdout` 不是什么特殊通道；在 Shell 和系统调用层面，它们就是**文件描述符**（file descriptor，fd）0/1/2：

| fd  | 名字   | 默认指向 |
| --- | ------ | -------- |
| 0   | stdin  | 终端     |
| 1   | stdout | 终端     |
| 2   | stderr | 终端     |

Unix 把很多东西都抽象成文件：普通文件、目录、设备、管道、socket、PTY。进程不用关心 fd 后面是磁盘、管道还是终端，它只读 fd 0、写 fd 1。

fd 是进程级的。`fork` 后子进程继承一份 fd 表，`exec` 替换程序但保留 fd。所以 Shell 只要在 `exec` 之前改掉 fd 的指向，命令就会自动继承。

重定向和管道，本质都是这件事：

```bash
ls > out.txt      # Shell 把 fd1 指向 out.txt，再 exec ls
ls 2> err.txt     # fd2 指向 err.txt
ls | grep foo     # ls 的 fd1 → 管道写端；grep 的 fd0 → 管道读端
```

看当前 Shell 的 fd：

```bash
ls -l /proc/$$/fd
# 0 → /dev/pts/3
# 1 → /dev/pts/3
# 2 → /dev/pts/3
```

macOS 没有 `/proc`，可以用：

```bash
lsof -p $$ -a -d 0,1,2
```

### 为什么需要 PTY

Shell 是普通程序，它不知道自己在 GUI 窗口里。它期望 fd 0/1/2 指向一个「终端设备」，这样下面这些东西才工作：

- `isatty(0)` 返回真
- 行编辑、回显、`Ctrl-C`
- `tty`、`stty`、作业控制
- `vim`、`less` 这类全屏程序

以前这个终端设备是真硬件；现在没有硬件了，内核就提供一个**伪终端**（pseudo-terminal，PTY）。

PTY 是一对设备：

- **master**：终端模拟器拿着
- **slave**：Shell 拿着，看起来就像 `/dev/pts/3` 这样的真实终端

从「一切皆文件」的角度看，PTY 只是内核提供的一对设备文件：Shell 的 fd 0/1/2 指向 slave，终端模拟器读写 master。

终端模拟器把字节写到 master，Shell 从 slave 读到；Shell 把输出写到 slave，终端模拟器从 master 读到。它像一根双向管道，但 slave 端多了「终端语义」：行缓冲、回显、信号、窗口大小。

### 启动顺序

1. 终端模拟器启动，向内核要一对 PTY
2. 它 `fork` 一个子进程
3. 子进程把 slave 接到自己的 stdin / stdout / stderr
4. 子进程 `exec` 成 Shell
5. Shell 往 slave 打印提示符，终端模拟器从 master 读到并画出来

很多终端模拟器会用 `forkpty()` 把 1–3 步打包；`exec` Shell 还是后面单独做。

### 一次按键的旅程

假设现在是默认的规范模式，你在提示符下输入 `ls`，然后按 Enter：

```text
你按 'l'
  → 终端模拟器把 'l' 写到 PTY master
  → 行规程暂存并回显 'l'
  → 终端模拟器读到回显，画到屏幕

你按 Enter
  → 行规程把这一行交给 Shell
  → Shell 从 PTY slave 读到 "ls\n"
  → Shell 解析，fork + exec ls
  → ls 继承 slave 作为 stdout，写出文件名
  → 终端模拟器从 master 读到，渲染到窗口
```

这里最关键的一点：

- 终端模拟器不知道 `ls` 是什么，它只转发字节
- Shell 不负责字体、颜色和窗口渲染，它只读写 slave
- 默认规范模式下，按键先由行规程整理成一行；bash 的 readline 还会接管补全和历史

### PTY 的两端

| 端     | 谁拿着       | 看到的东西                      |
| ------ | ------------ | ------------------------------- |
| master | 终端模拟器   | 字节流：键盘输入、要显示的输出  |
| slave  | Shell / 命令 | 一个终端设备，比如 `/dev/pts/3` |

```bash
tty                          # 当前终端设备，通常是 /dev/pts/N
ps -p $$ -o tty=,comm=       # 当前 Shell 挂在哪个终端上
```

所以 `tty` 打印的不是「哪个窗口」，而是 slave 端的设备名。

### 行规程：按键在到达 Shell 之前先经过内核

行规程（line discipline）不是独立程序，是内核 TTY 驱动的一部分。它负责把键盘字节整理成 Shell 能读的行。

默认的规范模式（canonical mode）下，行规程负责这些事：

| 输入      | 行规程的动作                            |
| --------- | --------------------------------------- |
| 普通字符  | 放进缓冲区并回显                        |
| Enter     | 把这一行交给 Shell                      |
| Backspace | 删除缓冲区最后一个字符                  |
| `Ctrl-C`  | 产生 `SIGINT`，发给前台进程组           |
| `Ctrl-\`  | 产生 `SIGQUIT`                          |
| `Ctrl-Z`  | 产生 `SIGTSTP`，把进程挂起              |
| `Ctrl-D`  | 不是信号；空行时表示 EOF，`read` 返回 0 |

vim、less 这类全屏程序会切到 raw 模式，自己读每个按键、自己重画屏幕，所以按键行为又不一样。bash 的 readline 也会切到自己的模式处理行编辑、补全和历史，但 `Ctrl-C` 这类信号仍由行规程产生。

```bash
stty -a       # 看当前行规程设置
stty size     # 终端行列数
```

### 关掉终端时，PTY 会发生什么

PTY 的生命周期和终端窗口绑在一起：打开终端时创建，关闭时销毁。

关闭窗口时，master 端关闭，内核会给这个终端的前台进程组发 `SIGHUP`。Shell 和它的前台任务通常跟着退出。

所以「关掉终端后进程还活着」通常只有两种情况：

- 进程忽略了 `SIGHUP`：`nohup` 或 `disown -h`
- 进程的 PTY 不在这个窗口上：`tmux` / `screen` 的 server 持有自己的 PTY，关闭窗口只是断开 client，Shell 仍然挂在 server 的 PTY 上

## 容易混淆的问题

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

## 常用文本工具

这些工具不用背参数，先知道它们存在，用的时候查帮助。

### 帮助系统

```bash
man ls          # 完整手册，q 退出
ls --help       # 常用参数
tldr ls         # 常见例子
```

- `man` 里按 `/` 搜索，`n` / `N` 跳下一个 / 上一个
- `--help` 通常比 man 短，先看这个更快
- `tldr` 只给常见例子，适合快速回忆

### 工具表

| 命令          | 作用               | 常见写法                                            |
| ------------- | ------------------ | --------------------------------------------------- |
| `cat`         | 打印整个文件       | `cat file`                                          |
| `less`        | 分页查看           | `less file`                                         |
| `head`/`tail` | 文件头 / 尾        | `head -n 20 file` / `tail -n 20 file`               |
| `sort`        | 按行排序           | `sort -n file` / `sort -u file`                     |
| `uniq`        | 去掉相邻重复行     | `sort file \| uniq -c`                              |
| `grep`        | 按正则搜索行       | `grep -rn 'TODO' .`                                 |
| `sed`         | 流编辑，常用来替换 | `sed -i 's/old/new/g' file`                         |
| `find`        | 按条件找文件       | `find ~/Downloads -type f -name '*.zip' -mtime +30` |
| `awk`         | 按列处理文本       | `awk -F, '{print $2}' data.csv`                     |

几个容易忘的点：

- `sort` 默认字典序，数值排序要 `-n`
- `uniq` 只去相邻重复，先 `sort` 再 `uniq`
- `grep` 的 pattern 是正则，`-r` 递归，`-l` 只列文件名
- `sed -i` 直接改文件，`g` 表示一行内全部替换
- `find` 默认递归，`-exec ... {} \;` 对每个结果执行命令
- `awk` 默认按空白分列，`-F,` 改成逗号分隔

### 现代替代

[modern-unix](https://github.com/ibraheemdev/modern-unix '常见 Unix 命令的现代替代品合集')
