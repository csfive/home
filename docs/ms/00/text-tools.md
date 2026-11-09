---
title: 常用文本工具
description: MIT Missing Semester 第 0 讲 · grep、sed、find、awk
---

# 常用文本工具

这些工具都很小，组合起来却能完成很复杂的文本处理。记它们的输入输出比记选项更重要。

## 工具速查

| 工具             | 用途         | 常见写法               |
| ---------------- | ------------ | ---------------------- |
| `man` / `--help` | 查用法       | `man ls`               |
| `tldr`           | 只看例子     | `tldr find`            |
| `cat` / `less`   | 查看文件     | `less app.log`         |
| `head` / `tail`  | 头尾几行     | `tail -f app.log`      |
| `sort`           | 排序         | `sort -k2,2n`          |
| `uniq`           | 去相邻重复   | `uniq -c`              |
| `grep`           | 按正则找行   | `grep -rn TODO .`      |
| `sed`            | 流式替换     | `sed -E 's/a/b/g'`     |
| `find`           | 按条件找文件 | `find . -name '*.py'`  |
| `awk`            | 按列处理     | `awk -F, '{print $2}'` |
| `jq`             | 处理 JSON    | `jq '.items[].name'`   |

单条命令解决不了的问题，通常是把其中三四个接成管道。

## 组合套路

```bash
# 出现最多的十行
sort file | uniq -c | sort -nr | head

# 七天内的 Python 文件
find . -name '*.py' -mtime -7

# 含 TODO 的文件
find . -name '*.py' -exec grep -l TODO {} \;

# CSV 第二列求和
awk -F, '{sum += $2} END {print sum}' data.csv
```

`sort | uniq -c` 是频次统计的固定写法，`uniq` 只处理相邻重复，所以必须先排序。

`sort` 默认按字典序比较整行，`3`、`31`、`4` 会排成 3、31、4；按数值排序要加 `-n`，按某一列排序写 `-k2,2n`。

## find 与 xargs

| 需求     | 写法                              |
| -------- | --------------------------------- |
| 按名字   | `find . -name '*.log'`            |
| 按时间   | `find . -mtime -7`                |
| 按大小   | `find . -size +100M`              |
| 限制深度 | `find . -maxdepth 2 -name '*.py'` |
| 逐个执行 | `-exec cmd {} \;`                 |
| 批量执行 | `-print0 \| xargs -0 cmd`         |

`-maxdepth` 必须写在 `-name`、`-mtime` 这类测试条件之前，顺序反了 find 直接报错。文件名可能带空格，`-print0` 加 `xargs -0` 比 `-exec` 更稳。

## 日志分析

```bash
ssh myserver 'journalctl -u sshd -b-1 | grep "Disconnected from"' \
  | sed -E 's/.*user (.*) [^ ]+ port.*/\1/' \
  | sort | uniq -c | sort -nr | head
```

- 远端：取日志、过滤行
- 本地：抽取用户名、排序、计数

每一段只做一件事，失败时也容易单独调试。

换现代工具之前，先确认目标机器上装得上；很多服务器只保证 POSIX 那套。

## 现代替代

| 传统   | 现代  | 差异                              |
| ------ | ----- | --------------------------------- |
| `grep` | `rg`  | 默认递归、更快、尊重 `.gitignore` |
| `find` | `fd`  | 语法更短、默认忽略隐藏目录        |
| `cat`  | `bat` | 语法高亮、分页                    |
| `sed`  | `sd`  | 替换语法更直观                    |

[modern-unix](https://github.com/ibraheemdev/modern-unix '常见 Unix 命令的现代替代品合集')
