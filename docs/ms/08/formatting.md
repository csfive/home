---
title: 格式化
description: MIT Missing Semester 第 8 讲 · 格式化
---

# 格式化

格式化器只重写表面语法：引号、空格、换行、导入顺序，一次定死，评审里就只剩语义改动。

## 它改什么，不改什么

同一份代码有无数种合法写法。格式化器把源码解析成语法树，再按固定规则打印回来：二元运算符两侧留空格、逗号后面换行、字符串统一引号风格、超宽的行在合适位置折断、`import` 按字母排序、去掉行尾空白。

因为是「解析再打印」，改动范围被限制在 token 之间的空白和少数等价标点上：

- 注释保留，但位置可能被移动
- 空行通常压到最多一到两行
- 字符串内容不改，只有包裹它的引号风格可能变

它不做语义判断。下面这些都不归它管：

- 变量命名与注释质量
- 函数长度、嵌套深度
- 重复代码与永远走不到的分支

格式化必须是幂等的。对已经格式化过的文件再跑一次，输出应当逐字节相同。如果两次结果不同，说明工具在某个边界上有 bug，或者配置被两条不同的规则同时命中，这种抖动会一直出现在 diff 里。

| 工具           | 语言                        | 配置位置         |
| -------------- | --------------------------- | ---------------- |
| Prettier       | JS、TS、CSS、HTML、Markdown | `.prettierrc`    |
| Black          | Python                      | `pyproject.toml` |
| `ruff format`  | Python                      | 复用 ruff 配置   |
| `gofmt`        | Go                          | 没有配置         |
| `rustfmt`      | Rust                        | `rustfmt.toml`   |
| `clang-format` | C、C++                      | `.clang-format`  |
| StyLua         | Lua                         | `.stylua.toml`   |

## 配置越少越好

Prettier 暴露几十个选项，团队通常只留 `printWidth`、`singleQuote`、`semi` 三项。Black 只提供 `line-length`、`target-version` 等少数开关。`gofmt` 干脆没有选项，Go 社区的标准写法就是官方输出。

这不是能力差异，是产品决策。选项越多，越容易在「单引号还是双引号」这种问题上耗掉一个下午。管理学里管这叫 bikeshedding：人们对无关紧要的细节最有表达欲，对真正困难的取舍反而沉默。

- 行宽 80 来自传统终端宽度
- 88 是 Black 的默认值
- 100 与 120 适合宽屏

选定一个写进配置，之后不再讨论。

```bash
npx prettier --check .
npx prettier --write .
black --check .
gofmt -l .
```

`--check` 只报告哪些文件不合规，并以非零码退出；`--write` 直接改写文件。前者用于 CI，后者用于本地。两者必须读同一份配置，否则 CI 会对着「本地已经格式化过」的代码报错。`gofmt -l` 列出不合规文件，`gofmt -w` 才写回。

## 和编辑器、版本库配合

IDE 的 format on save 调用的就是同一个二进制或 language server。保存即格式化，能避免「先写完再统一跑一遍」带来的大块 diff。

`.editorconfig` 补上格式化器不管的部分：缩进宽度、换行符、编码、文件末尾空行。它被多数编辑器和 IDE 原生支持，不需要装插件。

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
```

`root = true` 阻止编辑器继续向上查找，避免被家目录里的配置覆盖。`[*]` 是通配，可以对 `Makefile` 单独指定 `indent_style = tab`，因为 make 只认 tab。

## 一次引入的步骤

1. 选定工具与配置，先只格式化一个新文件，确认输出符合预期
2. 在本地跑一次全量 `--write`，单独提交这次纯格式化改动
3. 把该提交的 hash 写进 `.git-blame-ignore-revs`，配置 `git config blame.ignoreRevsFile .git-blame-ignore-revs`
4. 接入 pre-commit 与 CI 的 `--check`，此后不再手工调整排版

## 常见坑

- 一次性引入会重排全仓库，产生巨型 diff。不单独提交、不配 blame ignore，`git blame` 会把每个函数的历史都指到那次格式化。
- `.prettierignore` 要排除 `dist/`、`node_modules/`、锁文件和自动生成的代码，否则每次构建都会冒出新改动。
- 编辑器插件与命令行工具版本不一致时，两边会来回改写同一段代码。锁定版本，或在 CI 里跑同一个版本。
- ESLint 的风格类规则会和 Prettier 抢同一块地盘。装 `eslint-config-prettier` 关掉冲突规则，让格式化器独占排版。
- Windows 上 `core.autocrlf` 与 `end_of_line` 冲突会让整个文件显示为已修改，先统一换行符再提交。
- Markdown 里的围栏代码块也会被 Prettier 格式化，缩进和换行会跟着变，写文档时要预期到。
- 没有官方格式化器的语言不要硬凑。用社区工具时先看它是否还在维护，以及能否处理该语言的新语法；一个停更的格式化器会把新语法解析失败，整文件跳过。
