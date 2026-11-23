# AGENTS.md

VitePress 个人学习站。内容在 `docs/`，部署在 Netlify。

## 命令

```bash
bun run dev      # 本地预览
bun run build    # 构建，改完必须过
bun run format   # prettier
bun run check    # format:check + build
```

## 学习与笔记规范

- **快节奏协作**：AI 先浓缩模块核心要点 → 用户写代码并抛出真实疑问与卡点 → 答疑后趁热把「要点 + 真实问题/踩坑」整理成卡，快速推进整门课。
- **页面拆分**：每周或每模块拆为多篇独立「概念短卡」（每篇 300–600 字）与独立的「项目复盘篇」（不设固定模板，按项目体量动态组织）。
- **图先于字，拒绝教材味**：
  - 全站只使用 Mermaid（` ```mermaid `）与浅深色自适应定制 SVG 示意图（` ```svg-diagram `，配色使用站点 CSS 变量），不做实机截图或 GIF。
  - 配极简代码对比（通常 5–15 行），直奔机制与常见误区，不铺陈冗长背景。
  - **不写自测题、复习检查清单或考题式追问**，只追求短小清晰、让人愿意反复点开重看。
- **站点同步**：新增文章时同步更新 `docs/.vitepress/sidebar.ts`，新增课程时同步更新 `docs/.vitepress/config.ts` 的 `nav`，改完运行 `bun run format && bun run check`。
