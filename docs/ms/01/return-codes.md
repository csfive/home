---
title: 返回码与条件
description: MIT Missing Semester 第 1 讲 · 成功、失败与短路
---

# 返回码与条件

返回码是命令之间最基础的通信方式：0 成功，非 0 失败，后面的逻辑都建在这一个字节上。

## 基础

| 概念     | 说明                        |
| -------- | --------------------------- |
| 成功     | 返回 0                      |
| 失败     | 返回 1–255                  |
| `$?`     | 上一条命令的返回码          |
| `exit N` | 指定脚本返回码              |
| 截断     | `exit 256` 实际是 0         |
| 信号     | 128 + 信号编号，如 137、130 |

## 短路

```bash
grep -q pattern file && echo found
grep -q pattern file || echo missing
```

- `&&` 左边成功才执行右边
- `||` 左边失败才执行右边
- `if`、`while` 判断的也是返回码

## 条件

| 写法              | 说明                             |
| ----------------- | -------------------------------- |
| `[ -f f ]`        | `test` 命令，两侧要空格          |
| `[[ -f f ]]`      | bash 语法，支持 `&&`、`\|`、`=~` |
| `[ "$a" = "$b" ]` | 字符串                           |
| `[ "$n" -eq 3 ]`  | 数值                             |
| `! cmd`           | 取反                             |

## 管道

```bash
false | true | false
echo "${PIPESTATUS[@]}"   # 1 0 1
```

| 设置              | 效果             |
| ----------------- | ---------------- |
| 默认              | 只看最后一段     |
| `set -o pipefail` | 任一段失败即失败 |
| `PIPESTATUS`      | 每段的具体返回码 |

## set -e 的边界

- `if cmd; then` 里的 `cmd` 失败不退出
- `cmd && ...` 左值失败不退出
- `! cmd` 不退出
- 子 Shell 和命令替换里的失败未必传出来

重要的检查仍然要显式 `|| exit 1`，或者 `trap ... ERR`。

## case

```bash
case "$1" in
  start|stop) systemctl "$1" app ;;
  *) echo "usage: $0 start|stop" >&2; exit 2 ;;
esac
```
