---
title: 重定向和管道
description: MIT Missing Semester 第 0 讲 · fd、缓冲区与 SIGPIPE
---

# 重定向和管道

重定向的本质是改文件描述符的指向。Shell 先打开目标文件，再把 fd 1 指过去，程序对此一无所知。`>` 截断写入，`>>` 追加，`<` 换掉标准输入，`2>` 改标准错误，`&>` 同时改 1 和 2，`/dev/null` 是一个丢弃写入的设备。开了 `noclobber` 之后 `>` 不覆盖已存在的文件，`>|` 可以强行覆盖。

`2>&1` 的顺序经常被写错。`cmd > out 2>&1` 先把 stdout 指向 `out`，再把 stderr 指向 stdout 当前的位置，两个流都进文件；`cmd 2>&1 > out` 先把 stderr 指向终端，再把 stdout 指向文件，错误仍然打在屏幕上。重定向从左到右生效，顺序就是语义。

`exec` 可以把重定向变成持久的：`exec 3> log` 打开 fd 3，之后 `echo hi >&3` 都写进这个文件；`exec > log` 则把整个脚本后续的输出都改道。`sudo` 和重定向放在一起也容易踩坑：`sudo echo x > /root/f` 里，打开文件的是当前 Shell，不是 `sudo`，所以权限检查按当前用户算。正确写法是 `echo x | sudo tee /root/f`。

管道把前一个程序的标准输出接到后一个程序的标准输入。管道两端同时运行，内核在中间维护一个缓冲区，常见实现是几十 KB。写端写满就阻塞，读端读空就等待，这种反压让生产者和消费者自然同步。所有写端关闭后，读端读到 EOF；读端提前退出时，写端会收到 `SIGPIPE`，进程以 141 结束。`yes | head -n 1` 就是这种情形：`head` 读完一行就退出，`yes` 下一次写的时候收到 `SIGPIPE`。

`set -o pipefail` 让管道的返回码取第一个失败的命令，`PIPESTATUS` 数组则保留每一段的状态。默认情况下管道只返回最后一段的返回码，`grep pattern file | head` 里 `grep` 失败了也看不出来。

缓冲会让管道的行为看起来很奇怪。stdout 接终端时通常是行缓冲，接管道时变成块缓冲，于是 `tail -f app.log | grep error` 可能半天没有输出。`stdbuf -oL`、`grep --line-buffered` 或 `unbuffer` 可以强制行缓冲。`stdbuf` 靠预加载库实现，对静态链接的程序无效。

`tee` 把标准输入同时写到标准输出和文件，适合既想留日志又想看屏幕的场景：`verbose cmd | tee verbose.log | grep CRITICAL`。`|&` 是 `2>&1 |` 的简写，把标准错误也送进管道。here-document `<<EOF` 和 here-string `<<<` 则是另一种给标准输入喂数据的方式。

一个完整的例子是把远端日志拉到本地再拆开看：

```bash
ssh myserver 'journalctl -u sshd -b-1' \
  | grep 'Disconnected from' \
  | sed -E 's/.*user (.*) [^ ]+ port.*/\1/' \
  | sort | uniq -c | sort -nr | head
```

每一段只做一件小事，整条管道却完成了过滤、抽取、统计和排序。
