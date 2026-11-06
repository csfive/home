---
title: 常用文本工具
description: MIT Missing Semester 第 0 讲 · grep、sed、find、awk
---

# 常用文本工具

`man` 是命令的说明书，`--help` 给出简短版本，`tldr` 只列最常见的几个例子。查看文件用 `cat`，长文件用 `less`，`head` 和 `tail` 各看一头一尾，`tail -f` 持续跟踪追加内容。

`sort` 排序，`uniq` 去掉相邻重复行，所以统计频次总是 `sort | uniq -c`。`sort -k2,2n` 按第二列数值排序，`-r` 反过来。`grep` 按正则找行，`-r` 递归目录，`-l` 只列文件名，`-v` 取反，`-P` 用 PCRE 语法。`cut -d, -f2` 取逗号分隔的第二列，`paste -sd,` 把行拼成一行。

`sed` 做流式替换，`sed -i 's/old/new/g' file` 就地改写。`-E` 打开扩展正则，捕获组用 `\1` 引用，`s/.*user (.*) port.*/\1/` 只保留用户名。`sed -n '5,10p'` 只打印指定行，`sed '/pattern/d'` 删除匹配行。macOS 的 `sed -i` 需要跟一个备份后缀，`sed -i ''` 才是原地改。

`find` 按路径、类型、时间、大小筛文件：`find . -name '*.py' -type f`，`-mtime -7` 是七天内修改过，`-size +100M` 是大于一百兆。-exec 对每个结果执行命令，`find . -name '*.py' -exec grep -l TODO {} \;` 找含 TODO 的 Python 文件。更稳妥的做法是 `-print0 | xargs -0`，它能处理文件名里的空格和换行。

`awk` 按列处理文本，`awk '{print $2}'` 取第二列，`-F,` 换分隔符。`$0` 是整行，`NR` 是行号，`$3 > 100` 这样的条件可以筛行，`{sum += $2} END {print sum}` 可以做聚合。它适合结构化但格式不严格的数据，比写一段 Python 快得多。

把这些串起来就是一条真实的数据管道。比如统计某台机器上 SSH 断开连接最多的用户名：

```bash
ssh myserver 'journalctl -u sshd -b-1 | grep "Disconnected from"' \
  | sed -E 's/.*Disconnected from .* user (.*) [^ ]+ port.*/\1/' \
  | sort | uniq -c | sort -nr | head -n 10
```

远端负责取日志和过滤，本地负责抽取、排序和计数，每一段都很小，组合起来却很能干。

现代替代品可以按需换：`ripgrep`（`rg`）比 grep 快且默认递归，`fd` 比 find 友好，`bat` 带语法高亮，`jq` 处理 JSON，`yq` 处理 YAML。它们不改变管道的结构，只是让每一段更顺手。

[modern-unix](https://github.com/ibraheemdev/modern-unix '常见 Unix 命令的现代替代品合集')
