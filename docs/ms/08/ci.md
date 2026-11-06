---
title: 持续集成
description: MIT Missing Semester 第 8 讲 · 持续集成
---

# 持续集成

CI 把检查和构建搬到另一台机器上，每次推送都从头跑一遍。它不看你的本地缓存，也不信「在我机器上是好的」。

## 一份最小 workflow

```yaml
name: ci

on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install -e ".[dev]"
      - run: ruff format --check .
      - run: ruff check .
      - run: pytest -q
```

workflow 放在 `.github/workflows/`，文件名随意。结构只有三层：

- `jobs` 之间默认并行
- `steps` 顺序执行，任何一步非零退出，整个 job 立刻标红，后面的步骤不再运行
- `actions/checkout` 拉代码，`actions/setup-python` 装运行时；没有 checkout 的 job 拿到的是空目录

空目录是新手最常见的第一个报错。

job 之间可以声明依赖。lint 比测试快得多，让它先跑，测试通过 `needs` 排在后面，失败时能早几十秒看到结果：

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - run: ruff check .
  test:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - run: pytest -q
```

## 触发方式与矩阵

| 触发                | 用途                 |
| ------------------- | -------------------- |
| `push`              | 守住主分支           |
| `pull_request`      | 拦住贡献者的问题     |
| `schedule`          | 定时发现依赖侧的变化 |
| `workflow_dispatch` | 手动重跑             |

定时任务的价值在于外部世界会变：某个依赖发了破坏性更新，或者上游镜像消失。没人改代码，构建也可能突然失败。

矩阵把一份配置展开成多次运行：

```yaml
strategy:
  fail-fast: false
  matrix:
    python-version: ['3.10', '3.12']
    os: [ubuntu-latest, macos-latest]
```

`fail-fast: false` 让一个组合失败时其余组合继续跑完，一次就能看到全部兼容性问题。组合数等于版本数乘系统数，加维度之前先算一下额度。

`paths` 过滤器可以省掉无关运行。只改文档时跳过测试，只改前端时跳过后端：

```yaml
on:
  pull_request:
    paths: ['src/**', 'pyproject.toml']
```

## 只检查，不修改

CI 里的工具一律用 check 模式，没有任何一步会写回代码：

- 格式：`ruff format --check`
- lint：`ruff check`
- 类型：`tsc --noEmit`
- 测试：`pytest`

原因是 CI 跑完就销毁，改动不会回到你的机器上，只会让「本地干净、远端报错」的循环更难查。要修就下载日志，在本地跑 `--write` 或 `--fix`，再推一次。

两个配套设置决定红灯是否真的有用：

- 分支保护里把 job 设成 required check，否则红灯只是装饰，谁都能点 merge
- fork 提交的 PR 拿不到 `secrets`，token 也只读，涉及密钥的测试要么跳过，要么由维护者手动触发

## 缓存与并发

依赖安装往往比测试本身慢。`actions/cache` 按 lock 文件的哈希做 key，命中就直接解压：

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.cache/pip
    key: pip-${{ hashFiles('**/lock.txt') }}
```

`setup-node`、`setup-python` 等 action 自带 `cache` 参数，多数情况下不用手写。缓存 key 里必须包含 lock 文件的哈希，否则换了依赖还在用旧缓存，会出现只在 CI 上复现的怪问题。

同一个分支连推三次，前两次的结果已经没意义。加 `concurrency` 可以取消旧任务：

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

再给 job 加 `timeout-minutes`，卡死的任务不会占着额度跑一小时。测试报告、覆盖率 HTML、失败截图用 `actions/upload-artifact` 存下来，事后还能下载。

## 权限与安全

workflow 默认的 `GITHUB_TOKEN` 权限可能比需要的多。显式收窄：

```yaml
permissions:
  contents: read
```

`pull_request_target` 事件在基础仓库上下文运行且能拿到 secrets，不要在这个事件里 checkout 并执行 PR 里的代码。

还有两条常被忽略：

- 第三方 action 固定到 commit SHA，tag 可以被移动，SHA 不行
- 日志里不要 `echo` 密钥，调试时先用 `::add-mask::` 遮蔽

依赖也要锁。提交 lock 文件、在 CI 里用它安装，再让 Dependabot 或 Renovate 定期提 PR。版本范围写得太松，CI 会在某天毫无征兆地变红，而本地因为缓存还是绿的。

## 排查失败

先看第一个失败的 step，不要从头读到尾。调试按这个顺序走：

- 打开对应 job 的原始日志，从第一个红叉往上读
- 需要细节时临时加 `--verbose` 或 `set -x`，只在临时分支开，别留在主分支
- 重跑单个 job 比重跑整个 workflow 省时间，但它拿的是同一份代码，不会自动拾取新提交

日志默认只保留有限时间，失败后先下载再重跑。

本地复刻用 [act](https://github.com/nektos/act) 可以跑大部分 workflow，但镜像、环境变量与 GitHub 托管 runner 不完全一致，只能用于快速迭代，不能当作最终结论。

```markdown
<!-- README 顶部的状态徽章 -->

![ci](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)
```

徽章只反映默认分支最近一次运行，PR 上的红叉要进 Actions 页面看具体 job。

持续部署是同一套设施的延伸：CI 通过后构建二进制或镜像，再发布到 Pages、包仓库或容器 registry。构建产物来自 CI 而不是某人的笔记本，这一点比省下来的那点事更重要。
