---
title: 调试器
description: MIT Missing Semester 第 3 讲 · 调试器
---

# 调试器

调试器让程序停在任意一行，把变量、调用栈和内存摊开给你看，而不必靠猜。

## 什么时候需要它

`print` 适合「知道要打印什么」的场景。调试器适合另外三种：

- 还不知道该看哪个变量
- bug 只在特定条件下出现，重跑成本高
- 程序启动慢，或状态需要复杂操作才能重建

| 场景                 | 首选             |
| -------------------- | ---------------- |
| 输出里少了一个字段   | `print` / 日志   |
| 循环第 700 次才出错  | 条件断点         |
| 指针指向的内容被改   | 观察点 `watch`   |
| 崩溃后想知道调用路径 | `bt` + core 文件 |

调试器也有成本：要学命令、要重新编译带符号的版本，远程和容器环境还要额外配置。它最适合「一次运行能拿到大量信息」的场合，而不是所有问题都值得开。

## gdb 起步

```bash
gcc -g -O0 prog.c -o prog
gdb ./prog
```

```text
(gdb) break main
(gdb) run
(gdb) next
(gdb) print i
(gdb) continue
```

`-g` 生成 DWARF 调试信息，把机器地址映射回文件名和行号。`-O0` 关掉优化，避免变量被内联、重排或直接消除。

| 命令                    | 作用               |
| ----------------------- | ------------------ |
| `run` / `r`             | 启动程序           |
| `break f` / `b file:12` | 下断点             |
| `continue` / `c`        | 继续到下一个断点   |
| `step` / `s`            | 执行一行，进入函数 |
| `next` / `n`            | 执行一行，不进入   |
| `finish`                | 跑完当前函数       |
| `print x` / `p x`       | 打印变量           |
| `bt`                    | 打印调用栈         |
| `frame N`               | 切到第 N 个栈帧    |
| `info locals`           | 当前帧所有局部变量 |

- 参数通过 `run arg1 arg2` 传入，环境变量用 `set env KEY=value`
- `gdb -p PID` 附加到已经在跑的进程，适合排查卡死的服务
- `x/16xb ptr` 按字节看内存，`info registers` 看寄存器
- `set var x=42` 临时改值，验证后续路径
- `gdb -tui` 打开分屏源码，运行中按 `Ctrl-x a` 切换
- 没有 TUI 时用 `list` 看当前行附近的源码
- `info breakpoints` 查看所有断点编号
- `delete N` 删除指定断点

## 断点与观察点

普通断点按位置停，条件断点按表达式停：

```text
(gdb) break merge if i > 100
(gdb) watch students[1].id
(gdb) info watchpoints
```

- `watch` 在表达式值变化时停下，用来抓「谁改了我的变量」
- 它监视的是地址，变量离开作用域后可能失效
- 条件断点每次命中都要求值，循环里跑几十万次会明显变慢
- 第 N 次之后才出问题时，用 `ignore 1 1000` 跳过前一千次
- 硬件观察点数量有限，超出后 gdb 会退回软件实现

`commands` 可以给断点绑定动作，适合不想每次手动敲的场景：

```text
(gdb) break process
(gdb) commands
> silent
> printf "id=%d\n", id
> continue
> end
```

## 崩溃之后

程序崩溃时先看栈，再看变量，最后看内存。

```bash
ulimit -c unlimited
./prog            # 崩溃后留下 core
gdb ./prog core
```

```text
(gdb) bt full
(gdb) frame 2
(gdb) info args
(gdb) p *ptr
```

Linux 上 systemd 系统可以用 `coredumpctl list` 和 `coredumpctl gdb <pid>` 取回 core。栈里出现 `??` 通常意味着缺少调试符号，或者栈已经被优化破坏。

- `bt` 乱了先怀疑栈溢出或野指针，用 `info registers` 看 `sp`、`pc`
- `x/8gx $sp` 检查栈顶内容是否落在合理范围
- `-fno-omit-frame-pointer` 让每一帧保留帧指针
- 发布构建保留一份带符号的二进制，崩溃时才能还原行号
- core 文件可能被 `ulimit` 或 systemd 的配置限制掉
- `bt full` 一次打印所有栈帧的局部变量

## 语言级调试器

不是所有语言都用 gdb。解释型语言通常自带调试器：

| 工具      | 语言            | 启动方式               |
| --------- | --------------- | ---------------------- |
| `gdb`     | C / C++ / Rust  | `gdb ./prog`           |
| `lldb`    | C / C++ / Swift | `lldb ./prog`          |
| `pdb`     | Python          | `python -m pdb app.py` |
| `debugpy` | Python          | 编辑器通过 DAP 连接    |
| `jdb`     | Java            | `jdb Main`             |

`pdb` 的命令与 gdb 类似：`b`、`n`、`s`、`c`、`p`、`pp`、`l`、`w`。在代码里插入 `breakpoint()` 也能进入调试器，比 `pdb.set_trace()` 更通用。

Python 这类语言没有 core 文件，进程崩溃后只能靠 traceback 和 faulthandler。`python -X faulthandler app.py` 能在段错误时打印 Python 栈。

- 编辑器的图形调试器底层多说 DAP（Debug Adapter Protocol），能力取决于后端
- `lldb` 的命令名不同但概念一致：`b`、`run`、`next`、`step`、`frame variable`、`bt`
- 从 gdb 迁移时先查命令对照表，别照抄
- `pdb` 的 `w` 打印调用栈，`l` 显示当前行附近的源码
- `bt` 只列栈帧，`info frame` 看当前帧的详细信息
- `stepi` 按机器指令单步，适合没有源码的崩溃

## 常见坑

- 用 `-O2` 编译再调试，变量显示 `<optimized out>`
- 在 release 二进制上调试，既没有 `-g` 也没有符号
- `watch` 一个局部变量，函数返回后地址已经失效
- 断点打在空行或内联函数上，实际位置和预期不同
- 程序在等 stdin，看起来像卡死
- 远程调试时忘了把源码路径映射到本地
- 多线程程序里用普通断点，停下的线程不一定是出问题的那个
