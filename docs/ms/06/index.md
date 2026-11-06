---
title: Agentic Coding
description: MIT Missing Semester 第 6 讲 主题清单
---

# Agentic Coding

[第 6 讲 · Agentic Coding](https://missing.csail.mit.edu/2026/agentic-coding/ 'MIT Missing Semester 第 6 讲：视频、讲义和课后练习')

[课后练习答案](https://github.com/csfive/missing-semester/tree/main/06-agentic-coding '非官方，仅供参考')

## [Agent 的运行方式](/ms/06/agent-loop)

- LLM 建模「给定输入后输出什么」的概率分布
- 推理是从分布里采样，不是查表
- `context window` 是输入加输出的总长度上限
- 每轮把整段对话历史重新拼成 prompt
- 角色标记区分 system、user、assistant、tool
- `harness` 拼 prompt、派发工具、回填结果
- 工具调用即模型输出一段结构化参数
- 一次工具调用触发一次完整推理
- 同一 prompt 两次运行结果可能不同
- 默认配置下工具调用要人工确认
- 最小 agent 循环约 200 行代码
- IDE 插件与 CLI 只是外壳不同

## [提示与反馈循环](/ms/06/prompting)

- 规格说清目标与验收，不写实现细节
- 心智模型：带实习生，给方向不给逐行指令
- 给出可运行的验收命令，让它自己验证
- 类型检查、lint、测试都能当反馈信号
- 走错方向立刻打断，不要等它跑完
- 纠错给证据：报错原文、文件与行号
- 说清工具名，别让它猜 `python -m mypy`
- TDD：先写测试，人工审，再让它实现
- 测试本身要审，否则验证的是错的东西
- 小步追问比一次性大需求可靠
- 上下文已脏时重开对话更便宜
- 少用「优化一下」这类无验收的说法

## [常见任务](/ms/06/tasks)

- 新功能：规格加测试，让它反复跑到绿
- 修错误：`fix the issues with mypy`
- 重构：改名、抽函数、拆模块
- 代码审查：`review my uncommitted changes`
- 用 `gh pr diff` 拉 PR 给它读
- 理解代码库：问调用链、数据流、入口
- 当 shell 用：`find`、`mogrify`、`ffmpeg`
- 自然语言描述意图，由它挑命令与参数
- vibe coding：不手写代码，只做验收
- 机械改名优先用 LSP 重命名
- 一次性脚本、胶水代码收益最高
- 关键路径与算法核心自己写

## [上下文管理](/ms/06/context)

- 上下文越长，模型越容易忽略中段信息
- 无关问题直接清空，开新对话
- `rewind` 回退比追加纠错更省 token
- `compaction` 用摘要替换历史前缀
- 摘要会丢细节，压缩后要复核结论
- `AGENTS.md` 每次启动全文注入
- Claude Code 读 `CLAUDE.md`，语义相同
- `/init` 可生成初始版本，需手工删减
- `AGENTS.md` 写命令、约定、禁改范围
- `skills` 只常驻描述，正文按需加载
- `subagents` 有独立上下文，只回传结论
- `llms.txt` 是给模型读的文档入口
- 不用的 MCP server 会一直占工具描述

## [并行与工具接入](/ms/06/parallel-mcp)

- 同一任务跑多份，挑最好的结果
- 不同任务并行，先划清文件边界
- `git worktree add` 给每个 agent 独立目录
- 一个 worktree 一个分支，避免互相覆盖
- 合并前在主干重跑测试
- `MCP` 是连接外部工具的开源协议
- MCP server 暴露资源、工具与提示
- 典型用法：读写 Notion、查数据库
- 工具定义本身计入上下文预算
- 可复用提示正被 `skills` 取代
- Codex 与 Claude Code 都支持自定义提示
- MCP 目录站：Pulse、Glama
- 并行的真实成本是审查与合并

## [验证与纠偏](/ms/06/verification)

- AI 输出一律当外部贡献审
- 验证有时比手写更费时间
- 改测试让它变绿是最常见的作弊
- 看 `git diff`，不看它的总结
- 检查新增依赖、锁文件、构建脚本
- 检查错误处理与边界条件是否被删
- 调试螺旋：同一处反复改仍无进展
- 要求它先复现问题，再改代码
- 让它写出假设与证据，便于你判断
- 幻觉式坚持：被质疑时编造理由
- 关键代码手写，agent 只做辅助
- 提交粒度小，保证随时可回滚

## [工具、隐私与隔离](/ms/06/tooling-privacy)

- harness 在本地，推理通常在云端
- 云端方案可能拿到整个仓库与全部对话
- 先读服务商的数据保留与训练条款
- 私有仓库慎用自动补全与索引
- `yolo mode` 跳过确认，等于交出 shell
- Claude Code：`--dangerously-skip-permissions`
- 隔离手段：容器、虚拟机、devcontainer
- `docker run --rm -it -v "$PWD":/work` 起步
- 不需要网络时加 `--network none`
- 开源模型可本地跑，硬件门槛高
- 常见 agent：Claude Code、Codex、opencode
- 在 `git` 仓库里跑，留好回滚点

## [容易混淆的问题](/ms/06/pitfalls)

- 上下文窗口与训练数据是两回事？
- 清空上下文与压缩上下文怎么选？
- `AGENTS.md` 与 `skills` 该写哪个？
- 子 agent 与并行 agent 是同一件事吗？
- 工具调用是谁在执行？
- MCP 与普通命令行工具的区别？
- agent 说「已修复」算验证过吗？
- 跳过确认与沙箱能互相替代吗？
- 让它改测试算不算作弊？
- 审查 AI 代码该看什么？
