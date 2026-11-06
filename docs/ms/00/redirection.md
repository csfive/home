---
title: 重定向和管道
description: MIT Missing Semester 第 0 讲 · fd、缓冲区与 SIGPIPE
---

# 重定向和管道

重定向是改文件描述符的指向，管道是把两个进程的流接起来。两者都不需要程序配合。

## 重定向

| 写法        | 作用                      |
| ----------- | ------------------------- |
| `> file`    | stdout 覆盖写入           |
| `>> file`   | stdout 追加               |
| `< file`    | stdin 来自文件            |
| `2> file`   | stderr 写入               |
| `&> file`   | stdout 和 stderr 一起写入 |
| `/dev/null` | 丢弃写入                  |

```bash
cmd > out 2>&1    # 两个流都进文件
cmd 2>&1 > out    # stderr 留在终端
```

重定向从左到右生效：先复制 fd 的当前指向，再改下一个。顺序就是语义。

## 持久重定向

```bash
exec 3> log       # 打开 fd 3
echo hi >&3       # 写进 log
exec > log        # 后续所有 stdout 都进 log
```

`sudo echo x > /root/f` 打不开文件，因为打开文件的是当前 Shell；用 `echo x | sudo tee /root/f`。

## 管道

```mermaid
flowchart LR
  A[cat] --> B[grep] --> C[sort] --> D[uniq]
```

- 所有进程同时启动，内核缓冲区在中间
- 写满阻塞、读空等待，形成反压
- 所有写端关闭后，读端读到 EOF
- 读端提前退出，写端收到 `SIGPIPE`，退出码 141
- `yes | head -n 1` 就是写端被杀的例子

| 变量 / 选项       | 作用                 |
| ----------------- | -------------------- |
| `$?`              | 管道最后一段的返回码 |
| `PIPESTATUS`      | 每一段的返回码数组   |
| `set -o pipefail` | 任一段失败即失败     |

## 缓冲

| 输出去向    | 默认缓冲 |
| ----------- | -------- |
| 终端        | 行缓冲   |
| 管道 / 文件 | 块缓冲   |

`tail -f app.log | grep error` 长时间没输出，就是块缓冲造成的。可以选一种：

- `stdbuf -oL cmd`
- `grep --line-buffered`
- `unbuffer cmd`

`stdbuf` 靠预加载库实现，对静态链接程序无效。

## tee 与简写

```bash
make 2>&1 | tee build.log | grep -E 'error|warning'
```

- `tee` 同时写屏幕和文件
- `|&` 等价于 `2>&1 |`
- `<<EOF` 和 `<<<` 是给 stdin 喂数据的另外两种方式
