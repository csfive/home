---
title: AI 在命令行里
description: MIT Missing Semester 第 1 讲 · 生成命令与管道调用
---

# AI 在命令行里

最轻的用法是让模型生成命令：`llm cmd "find all python files modified in the last week"` 直接给出 `find . -name "*.py" -mtime -7`。更实用的是把模型接进管道：面对格式不统一的文本，正则写起来很痛苦，但 `llm "$INSTRUCTIONS" < users.txt` 可以按自然语言要求抽取字段，输出继续交给后面的命令处理。

```bash
INSTRUCTIONS="Extract just the username from each line, one per line"
llm "$INSTRUCTIONS" < users.txt | sort | uniq -c | sort -nr
```

这里有两个细节值得注意。指令里的空格要靠引号保住，否则会被切词；输入用 `<` 重定向，而不是把文件内容拼进提示词，既能处理大文件，也不会在进程列表里暴露内容。

再进一步是 AI Shell 和 agent 工具：它们接受英文描述，自己决定调用哪些命令、改哪些文件，适合多步骤任务。用得越深，越需要把前面这些基础概念弄清楚，否则很难判断它到底做了什么。

生成的命令不要直接执行。`llm cmd` 这类工具通常要求你确认，但真正安全的做法是先看懂：`--dry-run`、`-n` 能验证的先用，删除、覆盖、`sudo` 这类操作先换成 `ls` 或 `echo` 跑一遍。任何带 `rm -rf`、`curl | bash`、`chmod 777` 的建议都值得多看一眼。

对话式工具会把上下文带进请求，贴进去的日志和环境变量可能包含密钥。用本地模型或明确的隐私设置，至少不要把 `.env` 和私钥内容直接粘进去。成本也是因素：大文件先 `head` 或 `grep` 收窄，再交给模型。

这些工具最适合的场景是“知道要做什么，但忘了具体语法”：正则、`find` 的谓词、`awk` 的字段、`ffmpeg` 的参数。它们不替代理解，只是把查手册的时间省下来。
