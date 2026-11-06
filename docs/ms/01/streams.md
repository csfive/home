---
title: 流与管道
description: MIT Missing Semester 第 1 讲 · stdin、stdout、stderr 与缓冲
---

# 流与管道

每个程序都有三个默认的流：标准输入、标准输出、标准错误。管道 `|` 把前一个程序的标准输出接到后一个程序的标准输入，两个程序同时运行，而不是先跑完一个再跑下一个。用一个带延迟的例子能看清楚这一点：

```bash
(sleep 15 && cat numbers.txt) | grep -E '^\d$' | sort | uniq
```

执行后立刻看 `ps`，`grep`、`sort`、`uniq` 已经在运行，只有 `cat` 还在等 `sleep` 结束。Shell 先把所有进程启动起来，再把它们的流接好，数据流到哪一步，哪一步才开始干活。

很多程序接受 `-` 作为文件名，表示从标准输入读。`echo hello | grep hello` 和 `echo hello | grep hello -` 等价。标准错误是另一条输出流，专门放警告和错误，默认不进管道，所以 `ls /nonexistent | grep pattern` 的报错仍然会出现在屏幕上。

重定向就是把某个流改到别处：`>` 覆盖写文件，`>>` 追加，`2>` 改标准错误，`&>` 同时改 1 和 2，`<` 从文件读，`/dev/null` 丢弃。`2>&1` 要放在 `>` 之后，先让 stdout 指向文件，再让 stderr 跟着 stdout 走，顺序反过来错误就会留在终端。

管道两端之间有一个内核缓冲区。写端写满就阻塞，读端读空就等待，这种反压让快慢不同的程序自动同步。所有写端关闭后，读端读到 EOF；读端提前退出时，写端会收到 `SIGPIPE`，以 141 结束。`head` 只读前几行就退出，后面的 `yes` 或 `cat` 就是这样被终止的。

缓冲模式决定了“为什么管道里没有输出”。stdout 接终端时是行缓冲，接管道或文件时是块缓冲，`tail -f app.log | grep error` 可能要等缓冲区满了才出现。`stdbuf -oL`、`grep --line-buffered` 或 `unbuffer` 可以强制行缓冲。`stdbuf` 靠预加载库实现，对静态链接的程序无效。

[`fzf`](https://github.com/junegunn/fzf) 是一个把管道变成交互界面的工具：它从标准输入读行，让你边打字边过滤，最后把选中的行写回标准输出。`ls | fzf` 用来选文件，`history | fzf` 用来翻历史；它还能接管 `Ctrl-R` 和补全，细节见「Shell 定制」。

`tee` 把标准输入同时写到标准输出和文件，`|&` 是 `2>&1 |` 的简写。这两个小工具能把“既想留日志又想继续处理”的需求串进同一条管道：

```bash
make 2>&1 | tee build.log | grep -E 'error|warning'
```
