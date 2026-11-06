---
title: 代码质量
description: MIT Missing Semester 第 8 讲 主题清单
---

# 代码质量

[第 8 讲 · Code Quality](https://missing.csail.mit.edu/2026/code-quality/ 'MIT Missing Semester 第 8 讲：视频、讲义和课后练习')

[课后练习答案](https://github.com/csfive/missing-semester/tree/main/08-code-quality '非官方，仅供参考')

## [格式化](/ms/08/formatting)

- 自动格式化只改表面语法
- 统一引号、空格、换行、尾逗号
- 排序 `import`、折断超长行
- 行宽约定：80、88、100
- Prettier 覆盖 JS、TS、CSS、Markdown
- `prettier --check` 只报告，`--write` 改写
- `.prettierrc` 提交进版本库
- Black：Python，刻意少给配置
- `ruff format` 与 Black 风格兼容
- `gofmt -l .` 列出不合规文件
- `gofmt` 随 Go 工具链分发，没有开关
- rustfmt、clang-format、StyLua
- `.editorconfig` 统一缩进与换行
- IDE 保存时格式化
- 纯格式化提交单独一次，减少 diff 噪音
- `.git-blame-ignore-revs` 跳过格式化提交

## [静态检查](/ms/08/linting)

- 静态分析不运行代码就读出问题
- 规则集与预设按项目启用
- Ruff 规则码：`E501`、`F401`、`SIM102`
- `ruff check` 报告，`--fix` 自动修
- `[tool.ruff.lint]` 配 `select` 与 `ignore`
- ESLint 的 flat config
- ShellCheck 抓引号与变量展开
- clang-tidy、golangci-lint
- 行内豁免：`# noqa: F401`
- 行内豁免：`eslint-disable-next-line`
- 每条规则自带文档，解释为什么
- 误报用 `noqa` 行内豁免，别全局关规则
- 类型检查：mypy、pyright、`tsc --noEmit`
- semgrep 在 AST 层匹配危险模式
- `semgrep -l python -e "..."`
- 格式化器管排版，linter 管语义

## [测试](/ms/08/testing)

- 单元、集成、端到端三层
- 测试金字塔：单元多、端到端少
- pytest 发现 `test_*.py` 与 `test_*`
- `pytest -k` 按名字筛选用例
- `pytest -x` 首个失败即停
- `pytest --lf` 只跑上次失败
- fixture 准备与清理资源
- `pytest.raises` 断言异常
- `monkeypatch` 与 `unittest.mock.patch`
- mock 数据库、HTTP 等外部依赖
- TDD：先写失败的测试
- 回归测试：修 bug 前先复现
- 属性测试：Hypothesis 的 `@given`
- `coverage run -m pytest` 与 `coverage html`
- 行覆盖与分支覆盖
- 覆盖率是下限，不是目标

## [提交前钩子](/ms/08/pre-commit)

- `.git/hooks/pre-commit` 是可执行脚本
- 非零退出码中止提交
- `git commit --no-verify` 跳过钩子
- pre-commit 框架统一管理钩子
- `.pre-commit-config.yaml` 的 `repos` 与 `hooks`
- `pre-commit install` 写入钩子
- `pre-commit run --all-files` 全量跑
- `pre-commit autoupdate` 升级钩子版本
- 默认只检查暂存的文件
- 未暂存改动先 stash 再还原
- `language: system` 调用本机工具
- `commit-msg` 检查提交信息格式
- `pre-push` 放慢检查
- `core.hooksPath` 指向仓库内钩子
- 钩子可被跳过，CI 才是底线

## [持续集成](/ms/08/ci)

- workflow 放在 `.github/workflows/`
- `on: push` 与 `on: pull_request`
- `on: schedule` 用 cron 定时跑
- `jobs` 定义并行任务
- `runs-on` 与 `steps` 描述执行过程
- `actions/checkout` 拉代码
- `actions/setup-python` 装运行时
- `strategy.matrix` 组合多版本
- `actions/cache` 缓存依赖
- CI 跑 check 模式，不改代码
- 格式化用 `--check` 而非 `--write`
- 失败状态阻止合并
- 分支保护配 required checks
- `secrets` 在 fork PR 中不可用
- 状态徽章显示在 README
- 持续部署：构建产物并发布

## [命令入口](/ms/08/command-runners)

- 命令越长越没人记得住
- `justfile` 定义 recipe
- `just lint` 代替长命令
- `just --list` 列出全部 recipe
- recipe 可依赖其他 recipe
- 每行 recipe 默认独立 shell
- `set shell` 改成 `bash -uc`
- `make` 依赖 tab 缩进
- `.PHONY` 声明伪目标
- `npm run` 读 `package.json` 的 `scripts`
- `uv run` 在项目环境执行
- Hatch 的 `tool.hatch.envs.*.scripts`
- 约定 `check` 汇总全部检查
- `#` 注释作为 recipe 说明
- recipe 应幂等可重复

## [正则表达式](/ms/08/regex)

- 正则描述一组字符串
- `.` 匹配任意单字符
- `[abc]`、`[^abc]`、`[a-f]`
- 量词 `?`、`*`、`+`、`{N}`
- 锚点 `^` 与 `$`
- 分组 `(...)` 与捕获
- 贪婪 `.*` 与懒惰 `.*?`
- 命名分组 `(?P<name>...)`
- 反向引用 `\1`
- 前瞻 `(?=...)` 与后顾 `(?<=...)`
- Python 的 `re.match`、`search`、`fullmatch`
- `re.sub` 的替换模板
- 原始字符串 `r""` 保留反斜杠
- `grep -E` 与 `grep -P` 的方言
- `go test -run` 用正则筛测试
- 不拿正则解析 HTML 与 JSON

## [重构与自动修复](/ms/08/refactoring)

- 重构不改变外部行为
- 小步提交，每步保持测试通过
- IDE 的 rename 基于符号而非文本
- extract function 与 inline
- `ruff check --fix` 修机械问题
- `eslint --fix` 修 JS 常见模式
- `cargo clippy --fix`
- semgrep `--autofix` 批量改
- ast-grep 用 `$X` 匹配节点
- codemod 处理跨文件迁移
- 文本替换会误伤注释与字符串
- 格式化提交与逻辑提交分开
- 大改前先补基线测试
- 清理死代码与兼容层

## [容易混淆的问题](/ms/08/pitfalls)

- 格式化器与 linter 各管什么
- `--check` 与 `--write` 分别用在哪
- pre-commit 与 CI 谁负责拦
- `pytest -k` 与 `go test -run` 匹配什么
- 覆盖率 100% 是否说明测试可靠
- `re.match` 与 `re.fullmatch` 的差别
- `.*` 与 `.*?` 在替换里的结果
- 替换引用写 `$1` 还是 `\1`
- 重构与重写的边界
- semgrep 与 grep 的匹配层
