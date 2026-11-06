---
title: 流与管道
description: MIT Missing Semester 第 1 讲 · stdin、stdout、stderr 与缓冲
---

# 流与管道

三个流是进程和外界通信的默认通道，管道把它们接起来，让多个程序同时干活。

## 三个流

| 流     | fd  | 默认去向 | 用途       |
| ------ | --- | -------- | ---------- |
| stdin  | 0   | 键盘     | 输入       |
| stdout | 1   | 终端     | 正常输出   |
| stderr | 2   | 终端     | 错误和警告 |

## 管道

```mermaid
flowchart LR
  A[cat] --> B[grep] --> C[sort] --> D[uniq]
```

```bash
(sleep 15 && cat numbers.txt) | grep -E '^\d$' | sort | uniq
```

- 所有进程同时启动，Shell 只负责接流
- 内核缓冲区在中间，写满阻塞、读空等待
- 所有写端关闭，读端读到 EOF
- 读端提前退出，写端收到 `SIGPIPE`，退出码 141

多数程序接受 `-` 作为 stdin 文件名：

```bash
echo hello | grep hello -
```

stderr 默认不进管道，所以 `ls /nonexistent | grep pattern` 的报错仍在屏幕上。

## 重定向

| 写法        | 作用        |
| ----------- | ----------- |
| `> f`       | stdout 覆盖 |
| `>> f`      | stdout 追加 |
| `2> f`      | stderr      |
| `&> f`      | 两个流      |
| `< f`       | stdin       |
| `/dev/null` | 丢弃        |

`2>&1` 要放在 `>` 之后，顺序决定语义。

## 缓冲

| 输出去向    | 缓冲方式 |
| ----------- | -------- |
| 终端        | 行缓冲   |
| 管道 / 文件 | 块缓冲   |

`tail -f app.log | grep error` 卡住是块缓冲的经典现象。

- `stdbuf -oL cmd`
- `grep --line-buffered`
- `unbuffer cmd`

## 交互与管道

| 工具  | 作用                               |
| ----- | ---------------------------------- |
| `fzf` | 从 stdin 读行，交互过滤后写 stdout |
| `tee` | 同时写屏幕和文件                   |
| `\|&` | `2>&1 \|` 的简写                   |

```bash
history | fzf
make 2>&1 | tee build.log | grep -E 'error|warning'
```
