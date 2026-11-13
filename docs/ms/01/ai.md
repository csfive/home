---
title: AI 在命令行里
description: MIT Missing Semester 第 1 讲 · 生成命令与管道调用
---

# AI 在命令行里

模型在命令行里主要有三种用法。

## 三种用法

| 用法     | 例子                                     | 适合         |
| -------- | ---------------------------------------- | ------------ |
| 生成命令 | `llm cmd "find py files from last week"` | 忘了具体语法 |
| 管道处理 | `llm "$INSTRUCTIONS" < users.txt`        | 非结构化文本 |
| AI shell | 自然语言驱动多步任务                     | 探索性操作   |

```bash
INSTRUCTIONS="Extract just the username from each line, one per line"
llm "$INSTRUCTIONS" < users.txt | sort | uniq -c | sort -nr
```

- 指令要加引号，否则被切词
- 输入用 `<` 重定向，不要把整个文件拼进提示词
- 输出可以继续接管道

## 不要直接执行

| 风险           | 做法                          |
| -------------- | ----------------------------- |
| 删除或覆盖     | 先换成 `ls` 或 `echo` 干跑    |
| `curl \| bash` | 先下载、读一遍                |
| `sudo` 命令    | 逐段确认作用范围              |
| 密钥泄露       | 不要贴 `.env`、私钥、完整日志 |

`--dry-run`、`-n` 能验证的先用；`rm -rf`、`chmod 777` 这类建议多看一眼。

## 成本与隐私

大文件先 `head`、`grep` 收窄，再交给模型。对话工具会把上下文带进请求，敏感内容用本地模型或明确的隐私设置。
