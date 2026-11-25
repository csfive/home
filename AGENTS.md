# AGENTS.md

[CS Five](https://csfive.netlify.app/)（`csfive/home`）是基于 VitePress 的个人 CS 自学笔记站，内容在 `docs/`，部署在 Netlify。

## 常用命令

```bash
bun run dev      # 本地预览
bun run build    # 构建，改完必须过
bun run format   # prettier 格式化
bun run check    # format:check + build
```

## 双仓库分工与路线

- **代码仓（如 `/Users/mancuoj/CS/CS50x`）**：按周存放作业代码与课前消化底稿。
  - CS50x 旧版（2022）归档在 `2022` 分支，当前从头学习在 `main` 分支；每道题无论 less / more **全刷**。
  - 每周课前消化总结放在代码仓 `notes/` 下，已在 `.gitignore` 中忽略，**不提交到 git**。
- **笔记站（本仓库 `csfive-home`）**：按阶段（`Foundations` → `Core` → `FP / PL` → `Systems`）与**主题聚合**组织常青短文，不按课程周数硬拆分；没有真正值得回看的洞察就不勉强占位。

## 三步学习协作流

1. **课前消化**：每周开工前，先把该周官方讲义（Notes）+ 视频演示脉络 + Shorts 浓缩成一篇详细、面向零基础、配齐完整可运行 C/Python 代码示例与常见报错对照的 Markdown 放进代码仓 `notes/`，作为用户刷题时的手边参考底稿。
2. **全题实战**：用户在 IDE 写完该周全部作业并自测，过程中随时抛出真实卡点、底层好奇或工具链问题。
3. **主题沉淀**：只挑真正有回看价值的问题发散深挖，写成 `csfive-home` 的独立主题短文，不在公开站堆砌泛泛语法速查。

## 笔记站写作与验收规范

- **图先于字，拒绝教材味**：
  - 全站只使用 Mermaid（` ```mermaid `）与浅深色自适应定制 SVG 示意图（` ```svg-diagram `，配色使用站点 CSS 变量），不做实机截图或 GIF。
  - 配极简代码对比，直奔机制与真问题，不铺陈冗长背景，不写入门语法水文。
  - **不写自测题、复习检查清单或考题式追问**，只追求短小清晰、让人愿意反复点开重看。
- **站点同步与检查**：新增或调整文章时同步更新 `docs/.vitepress/sidebar.ts` 与 `docs/.vitepress/config.ts` 的 `nav`；修改后运行 `bun run format && bun run check`。

## 当前进度锚点

- **CS50x**：跳过 Week 0，进入 Week 1（C）且讲义底稿已落盘到 `CS50x/notes/week1-c.md`；Pset 1 已完成 `world`、`me`（本地提交 `ecee97f`，待 Week 1 全刷完再 push），待做 `mario-less`、`mario-more`、`cash`、`credit`。
- **csfive-home**：已按 `Foundations` 建好导航与占位（`origin/main` `383b18c`），待 Week 1 刷完题后一起讨论撰写 `docs/cs50x/c.md`、`docs/cs50x/setup.md`、`docs/cs50x/makefile.md` 等主题短文。
