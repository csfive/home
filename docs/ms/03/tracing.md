---
title: 系统调用与追踪
description: MIT Missing Semester 第 3 讲 · 系统调用与追踪
---

# 系统调用与追踪

程序说「打不开文件」「连不上端口」时，真正发生的事在内核边界上。跟踪系统调用能看到它到底要了什么、等了多久。

程序卡住时，输出停在哪一行，通常就卡在那个系统调用上。先看最后一个未返回的调用，比从头读整份日志快。

## strace

```bash
strace ./prog
strace -e trace=file ./prog
strace -f ./prog
strace -p 1234
strace -T ./prog
strace -c ./prog
```

| 选项               | 作用                 |
| ------------------ | -------------------- |
| `-e trace=file`    | 只看文件相关调用     |
| `-e trace=network` | 只看网络相关调用     |
| `-f`               | 跟随 fork 出的子进程 |
| `-p PID`           | 附加到运行中的进程   |
| `-T`               | 每次调用末尾显示耗时 |
| `-c`               | 汇总次数与总耗时     |
| `-s 256`           | 加长字符串参数的显示 |
| `-o file`          | 输出到文件           |

典型输出里，`openat` 返回 `-1 ENOENT` 说明文件不存在，`connect` 返回 `-1 EINPROGRESS` 说明连接还在建立。看不懂返回值时查 `man 2 <syscall>`。

返回 `0` 通常表示成功，`read` 返回字节数，`read` 返回 `0` 表示 EOF。把「返回值」和「errno」分开读，能避免很多误判。

- 加 `-y` 把文件描述符翻译成路径，直接看到 fd 指向哪个文件
- macOS 没有 `strace`，用 `dtruss`；它需要 root，通常还要关闭 SIP

## bpftrace 与 eBPF

`strace` 逐个调用打印，开销大。eBPF 把程序加载进内核，在事件点上执行，开销低得多，还能做聚合。

```bash
sudo bpftrace -e 'tracepoint:syscalls:sys_enter_openat { printf("%s %s\n", comm, str(args->filename)); }'
sudo bpftrace -e 'tracepoint:syscalls:sys_enter_* { @[probe] = count(); }'
sudo bpftrace -e 'tracepoint:syscalls:sys_enter_* /comm == "bash"/ { @[probe] = count(); }'
```

`@[probe] = count()` 是按探针名聚合的 map，按 `Ctrl-C` 时打印汇总。`comm` 是进程名，`pid` 是进程号，`cpid` 由 `-c` 设置。

| 维度 | `strace`         | `bpftrace`                         |
| ---- | ---------------- | ---------------------------------- |
| 开销 | 高               | 低                                 |
| 权限 | 可跟踪自己的进程 | root                               |
| 范围 | 单个进程         | 整个系统，可按 `comm` / `pid` 过滤 |
| 聚合 | `-c` 基础统计    | 任意 map 聚合                      |
| 上手 | 一条命令         | 要写脚本                           |

- eBPF 加载前要过内核 verifier，不能随便解引用指针
- 写错类型时错误信息不直观，先用 `bpftrace -l 'tracepoint:syscalls:*'` 确认探针名

需要「谁在这个目录下打开了什么」这类全系统问题时，`bpftrace` 更合适。`bcc` 把常见需求封装成了命令，例如 `opensnoop` 列出所有打开的文件，`biosnoop` 打印块设备 I/O 延迟。

- 长期使用把探针写成文件，加上过滤和退出条件
- 高频事件不加聚合，输出量会打满终端和磁盘

## 网络抓包

系统调用只能说「发了多少字节」，看不到协议内容。

```bash
sudo tcpdump -i any port 80
sudo tcpdump -i any -w capture.pcap
```

`-i any` 监听所有接口，`-w` 存成 pcap，之后用 Wireshark 打开做流重组和协议解析。HTTPS 是加密的，`tcpdump` 只能看到握手和包长。

- `-A` 按 ASCII 打印载荷，`-X` 同时打印十六进制
- 生产环境别把用户数据直接打到终端
- 加密内容用 `mitmproxy`，客户端信任它的证书
- 或直接用浏览器的 Network 面板看解密后的请求

`mitmproxy` 只能解密愿意信任它的客户端。开启了证书固定的 App 不会接受中间人证书，这时只能抓包看连接阶段。

- 抓包过滤器在采集时生效：`host 10.0.0.5 and port 443`、`not port 22`
- 先 `-c 100` 抓一百个包，确认流量对了再长时间录制

## 排障顺序

从外到内，不要一上来就抓包：

1. `ss -tlnp | grep :8080` 确认端口有没有在听
2. `strace -f -e trace=network ./server` 看连接卡在哪一步
3. `tcpdump` 确认包有没有发出去、有没有回
4. `mitmproxy` 或浏览器面板看应用层内容

先确认「进程在不在、端口通不通、DNS 解析对不对」，再谈协议内容。顺序反了，容易在应用层找一个其实在防火墙上的问题。

「连不上」先分三层：`getent hosts example.com` 验证解析，`nc -vz host 443` 验证连通，`curl -v` 验证 TLS 和 HTTP。哪一层失败，就用哪一层的工具继续往下钻。

## 常见坑

- 忘记 `-f`，只看到父进程，子进程的调用全丢了
- 用 `strace` 跟踪高频服务，开销把问题掩盖或放大
- 在宿主机上用 `-p` 附加容器内进程的 PID，实际跟踪不到
- `tcpdump` 不写 `-i`，在多网卡的机器上抓错接口
- 把 `EAGAIN`、`EINTR` 当成错误，它们通常只是需要重试
- 只抓 loopback，漏掉了走网关的那部分流量
- 在 `strace` 输出里把 `= ?` 当成失败，它可能只是调用还没返回或被信号打断
- `bpftrace` 脚本拼错探针名，启动时报错但命令本身仍然成功退出
