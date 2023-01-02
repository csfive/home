# 贡献指南

本文档使用 VitePress 搭建，文章使用 markdown 格式书写，全部位于 docs 文件夹下，你可以直接在 GitHub 上编辑文件后进行 PR 或克隆到本地修改。

如果想在本地运行本项目，请在安装 pnpm 后执行以下指令：

```sh
git clone https://github.com/csfive/docs
cd docs
pnpm i  # npm i -g pnpm
pnpm run dev
```

## 关于排版

请参考 [中文文案排版指北](https://github.com/sparanoid/chinese-copywriting-guidelines) 和 [中文技术文档写作风格指南](https://github.com/yikeke/zh-style-guide) 进行写作，在此列出部分规范：

- 中英文之间需要增加空格
- 中文与数字之间需要增加空格
- 数字与单位之间需要增加空格
- 全角标点与其他字符之间不加空格
- 使用全角中文标点
- 专有名词使用正确的大小写，如 GitHub
- ...


## 关于 commit messages

请遵守 [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) 来规范提交信息，在此列出部分约定：

| 类型     | 描述                     |
| -------- | ------------------------ |
| feat     | 引入新功能               |
| fix      | 修复 bug                 |
| style    | 更新样式                 |
| docs     | 添加/更新文档            |
| perf     | 提高性能/优化            |
| refactor | 改进代码结构/代码格式    |
| test     | 增加/改进测试            |
| chore    | 构建过程或辅助工具的变动 |
| ...      | ...                      |



## 关于 PR

如果你不知道如何创建 PR 可以参考 [GitHub 文档](https://docs.github.com/zh/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) 进行学习。


## 关于 Markdown 语法

本文档的一些特殊 Markdown 语法请参考 [本文](./markdown) 进行学习。


## TODO