---
title: 返回码与条件
description: MIT Missing Semester 第 1 讲 · 成功、失败与短路
---

# 返回码与条件

返回码是程序退出的状态，0 表示成功，非 0 表示失败。Shell 脚本默认返回 0，用 `exit NUM` 指定其他值，`$?` 读取上一条命令的返回码。

`&&` 和 `||` 根据返回码短路：`grep -q pattern file && echo found` 只在找到时打印，`|| echo missing` 则相反。`if` 和 `while` 判断的也是命令的返回码，`while read line; do ...; done < file` 之所以能读完整个文件，是因为 `read` 在遇到 EOF 时返回非 0。`!` 把判断反过来，`if ! grep -q pattern file; then ...; fi` 命中“没找到”的情况。

返回码只有一个字节，范围是 0 到 255。`exit 256` 实际会变成 0，`kill -9` 之后的 137 是 128 加 9。写脚本时如果拿返回码当错误类型用，要记得这个上限。

条件判断的语法有两套。`test` 和 `[` 是命令，所以方括号两边必须有空格，变量不加引号时还会因为空值报错；`[[ ]]` 是 bash 的语法结构，支持 `&&`、`||`、`=~` 和模式匹配，写新脚本优先用它。字符串比较用 `=`，数值比较用 `-eq`、`-lt`，文件判断用 `-f`、`-d`、`-e`。

管道默认只返回最后一段的状态，`grep pattern file | head` 里 `grep` 失败了也看不出来。`set -o pipefail` 改成“任何一段失败都算失败”，`PIPESTATUS` 数组则保留每一段的具体值：

```bash
false | true | false
echo "${PIPESTATUS[@]}"   # 1 0 1
```

`set -e` 让脚本在任何命令失败时退出，但它有边界：出现在 `if` 条件、`&&` 左值和 `!` 后面的命令不会触发退出，子 Shell 和命令替换里的失败也未必传得出来。所以重要的检查仍然要显式写 `|| exit 1`，或者用 `trap 'echo failed' ERR`。

`case` 是另一种条件结构，做字符串匹配比一长串 `if` 清楚：

```bash
case "$1" in
  start|stop) systemctl "$1" app ;;
  *) echo "usage: $0 start|stop" >&2; exit 2 ;;
esac
```

返回码也决定了自动化工具怎么判断成功。CI 里每一条命令都靠返回码决定要不要继续，这也是为什么脚本里不要用 `exit 0` 掩盖错误。
