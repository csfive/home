# AGENTS.md

VitePress 个人学习站。内容在 `docs/`，部署在 Netlify。

## 命令

```bash
bun run dev      # 本地预览
bun run build    # 构建，改完必须过
bun run format   # prettier
bun run check    # format:check + build
```

## 学习与沉淀原则

- **先学后记**：默认通过对话按「问题链」学习（是什么 → 为什么需要 → 底层怎么运作 → 常见误区），配合小检验与动手写代码；**不提前为未学的课程生成笔记**。
- **只留值得回看的主题**：只有真正学过、觉得日后值得重读的主题链，才整理成文放进 `docs/`。
- **写作方式（链式精读，不做速查表）**：
  - 以因果和直觉为主线，一步步把概念串起来，让读者顺着「为什么」就能推出结论，而不是平铺 API 表格和干结论。
  - 先给动机和场景，再讲机制，最后自然带出边界与踩坑。
  - 必要时用最小示例或 mermaid 图辅助理解，不为凑结构硬塞表格或模板。
- 新增文章时同步更新 `docs/.vitepress/sidebar.ts`（新增课程时同步更新 `docs/.vitepress/config.ts` 的 `nav`），改完运行 `bun run format && bun run check`。
