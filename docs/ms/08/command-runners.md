---
title: 命令入口
description: MIT Missing Semester 第 8 讲 · 命令入口
---

# 命令入口

项目里的检查命令会越积越长。命令运行器把它们收成短名字，新同事不用背 `uv run ruff check --fix` 这种串。

## 为什么要有这一层

一个项目跑测试可能要设置环境变量、切到子目录、带上三个参数。这些命令通常散落在三处：

- README 的一段说明
- CI 配置里的 `run:`
- 老同事的记忆

三处不同步，就是「在我机器上能跑」的主要来源。命令运行器把入口收敛成一个文件，README 只写 `just check`，CI 也调 `just check`，人和机器走同一条路径。

它还有个隐性收益：命令变成可搜索的。想知道项目有哪些检查，`just --list` 一行行列出来，比翻文档快。

## just

```just
# 跑全部检查
check: format lint test

format:
    ruff format .

lint:
    ruff check --fix .

test:
    pytest -q
```

`just check` 会按依赖顺序先跑 `format`、`lint`、`test`。`#` 开头的注释就是该 recipe 的说明，`just --list` 会把它列出来。常用开关不多，记住几个就够：

- `--dry-run` 只打印将要执行的命令，排查参数拼错时很有用
- recipe 可以声明参数，`just test tests/unit` 会把路径原样传进去
- `set dotenv-load` 自动读取 `.env`，环境变量不用在每条命令前手动加
- `[private]` 让内部 recipe 不出现在 `--list` 里
- `--choose` 拉起 fzf，忘记名字时直接选

just 与 make 最大的差别是不看文件时间戳。每次调用都真的执行命令，不会因为「目标文件比依赖新」而跳过。跑测试、跑 lint 这类任务本来就该每次都跑，时间戳判断只会带来困惑。

一个容易踩的坑：just 默认每一行 recipe 都起一个新的 shell，`cd` 或 `export` 不会带到下一行。需要连续上下文时，在文件顶部写 `set shell := ["bash", "-uc"]`，或者把多行写成一段。

## 语言自带的入口

不是所有项目都需要 just。包管理器通常已经有等价物。

| 工具  | 配置文件                    | 调用              |
| ----- | --------------------------- | ----------------- |
| just  | `justfile`                  | `just check`      |
| make  | `Makefile`                  | `make check`      |
| npm   | `package.json` 的 `scripts` | `npm run check`   |
| Hatch | `pyproject.toml`            | `hatch run check` |
| uv    | `pyproject.toml`            | `uv run pytest`   |

npm 的 `test` 是特殊名字，`npm test` 等价于 `npm run test`；其他脚本必须带 `run`。脚本值是一整条 shell 命令，可以用 `&&` 串联。需要跨平台设置环境变量时，装 `cross-env`，别写 `FOO=1 cmd`。

```json
{
  "scripts": {
    "check": "npm run format && npm run lint && npm test",
    "format": "prettier --check .",
    "lint": "eslint ."
  }
}
```

Hatch 把命令写在 `[tool.hatch.envs.default.scripts]` 里，值是命令列表，和 just 的依赖一样按顺序执行。uv 则更进一步：`uv run` 自动同步依赖并在项目虚拟环境里执行，连「先激活环境」这一步都省了。

make 仍然可用，但它按文件时间戳决定是否执行，任务本身不产出文件时必须声明 `.PHONY`，否则同名文件存在就会永远跳过。recipe 行首必须是 tab，不是空格；`make -j` 可以并行，前提是依赖声明正确。

## 设计一套 recipe

入口名字控制在五六个，多了没人记得住：

- `check`：只读，格式化检查、lint、类型检查、测试
- `fix`：会写文件，格式化与自动修复
- `test`：只跑测试，额外参数原样透传
- `build` / `serve`：产物构建与开发服务器

`check` 与 `fix` 必须分开。CI 只调 `check`，本地改代码用 `fix`，两者跑的工具集合相同，模式不同。混成一个 `check` 里顺手 `--fix`，CI 就会在工作区留下未提交的改动，而你还以为已经检查过了。

recipe 还有两条硬性要求：

- 幂等：连跑两次结果一样，不会追加配置、不会重复写文件，带副作用的命令先判断是否已存在
- 可移植：不要写死机器相关的绝对路径，它们会被复制、被贴进 issue

需要密钥就用 `.env`，并把 `.env` 加进 `.gitignore`。

## CI 复用同一入口

CI 里只写 `just check`，不要复制一遍工具列表。复制的那一刻起，两边就会开始漂移：本地加了新检查，CI 没加；CI 用了不同参数，本地复现不了。

安装与版本也要固定：

- 用现成 action 装 just，版本写死，不用 `latest`
- 本地用 `mise`、`asdf` 或系统包管理器装同一版本，记进 `.tool-versions`
- `just --version` 写进 README，避免有人用发行版里那个三年前的版本执行新语法

同一份入口还有个附带效果：新人第一天就能跑通。他们不需要理解每个工具的调用方式，先看到绿灯，再慢慢读 recipe 里的细节。

路径也统一从仓库根算起，别写 `cd ../..` 这种依赖调用位置的相对路径。CI 的任务目录和本地不同，这类写法迟早会崩，而且报错信息通常指向一个不存在的文件。
