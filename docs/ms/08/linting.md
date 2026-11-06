---
title: 静态检查
description: MIT Missing Semester 第 8 讲 · 静态检查
---

# 静态检查

linter 不运行代码，只读语法树和控制流，把可疑模式标出来。它比格式化器深一层：格式化器管排版，linter 管语义。

## 规则与预设

linter 的能力由规则集决定。规则通常按前缀分组：Ruff 里 `E` 是 pycodestyle 风格错误，`F` 是 Pyflakes 的未定义名与未使用导入，`SIM` 是可以简化的写法，`I` 管导入排序，`B` 来自 flake8-bugbear，专抓容易出错的写法。

项目在配置里选一组预设，再按需增删。`SIM102` 是典型例子：它抓「嵌套的 `if` 可以直接合并」，文档页会说明这条规则在找什么、为什么这样写更差、应该改成什么样。好的 linter 把教学材料直接挂在报错里。

```toml
[tool.ruff.lint]
select = ["E", "F", "SIM", "I"]
ignore = ["E501"]
```

`ruff check` 只报告，`ruff check --fix` 会改写能安全修复的问题。`ruff check --statistics` 按规则统计数量，先修出现最多的那一类，收益最高。

| 工具          | 语言   | 典型规则               |
| ------------- | ------ | ---------------------- |
| Ruff          | Python | `F401` 未使用的 import |
| ESLint        | JS、TS | `no-unused-vars`       |
| ShellCheck    | Shell  | `SC2086` 变量未加引号  |
| clang-tidy    | C、C++ | `bugprone-*`           |
| golangci-lint | Go     | 聚合多个 linter        |
| semgrep       | 多语言 | 自定义 AST 模式        |

ESLint 的配置早已从 `.eslintrc` 迁到 flat config：`eslint.config.js` 导出一个数组，插件与规则都写成普通对象，不再有多层 `extends` 的隐式合并。

## 抑制与误报

读一条报错的顺序是固定的：先按规则编号搜官方文档，看它标出的范围是一个 token、一行还是一段控制流，再判断是真问题还是误报。能用 `--fix` 解决就不要手工改，手工改容易漏掉同类写法。

再好的规则也有误报。行内抑制的写法各语言不同，但都要带具体规则编号，不要整行静音。

```python
import json  # noqa: F401
```

```javascript
// eslint-disable-next-line no-unused-vars
const debug = 1
```

```bash
# shellcheck disable=SC2086
rm $files
```

抑制注释会随时间腐化：代码改了，豁免还留着；文件重写了，`noqa` 还在原地。定期搜一遍 `noqa` 与 `eslint-disable`，确认每条还有理由，否则它们会慢慢变成永久静音。

存量项目常见的做法是「棘轮」：先只对改动过的文件开规则，或者用 `ruff check --add-noqa .` 给现有违规批量补上豁免，把基线冻住，之后新增代码一律不许带 `noqa`。

## 从 grep 到 semgrep

`grep` 在字符层匹配，注释、字符串、换行都会骗过它。想找 `subprocess.Popen(..., shell=True)`，一条注释里的示例代码也会被算进去。

semgrep 先把代码解析成 AST，再按模式匹配，跨行、别名、嵌套参数都能处理。

```bash
semgrep -l python -e "subprocess.Popen(..., shell=True, ...)"
semgrep --config=auto .
```

`...` 是省略运算符，表示中间可以有任意参数。第一条命令专门找「用 shell 执行字符串」的危险调用；第二条拉取社区规则集扫全仓库。

自定义规则写成 YAML，团队可以把「禁止某个内部 API」「禁止裸 `except:`」固化成检查项。这是把口头约定变成可执行约束的最短路径。

## 类型检查也是静态分析

mypy、pyright 和 `tsc --noEmit` 不产生运行产物，却在提交前就能报错，常见的几类问题是：

- 参数类型不匹配
- 可能为 `None` 的取值
- 缺失的属性或方法
- 返回值与声明不一致

它们和 linter 是两套工具：linter 看写法模式，类型检查看数据流。一个函数可能通过全部 lint 规则，却把 `str` 传给了要 `int` 的参数。CI 里通常各跑一步，任何一步失败都算红。

类型标注本身也是文档。读代码的人不需要追进三层调用，就能知道参数不能为 `None`。

## 速度与运行时机

linter 必须在每次保存后几百毫秒内返回结果，否则没人愿意开着它。Ruff 用 Rust 重写，单文件检查在毫秒级；ESLint 在大型前端仓库里可能跑上几十秒，通常只在 pre-commit 和 CI 里跑全量，编辑器里只检查当前文件。

检查范围也要控制。全仓库扫描适合 CI，本地只跑改动过的文件或当前文件。两者用同一份配置，否则会出现「本地干净、CI 报错」的经典问题。

## 落地顺序

一次全开会得到上千条报错，团队的第一反应往往是关掉工具。增量推进才能让它活下来。

1. 先接入格式化，把纯排版问题清零，diff 噪音消失
2. 再开基础规则集，用 `--fix` 清掉自动可修项
3. 对剩余问题加豁免，冻结基线
4. 最后加类型检查与自定义规则，只对新增代码生效
