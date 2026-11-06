---
title: 依赖与环境
description: MIT Missing Semester 第 5 讲 · 依赖与环境
---

# 依赖与环境

`ModuleNotFoundError` 说明解释器在当前搜索路径里没找到这个包。依赖管理要先回答「装到哪」，再回答「装什么版本」。

## 依赖是一张图

`pip install requests` 看着只装一个包，实际做了四件事：在 PyPI 上找到项目、挑出匹配当前平台和 Python 版本的产物、解算它自己的依赖、下载解包复制文件。

```bash
$ pip install requests
Collecting requests
  Downloading requests-2.32.3-py3-none-any.whl (64 kB)
Collecting charset-normalizer<4,>=2
Collecting idna<4,>=2.5
Collecting urllib3<3,>=1.21.1
Collecting certifi>=2017.4.17
Successfully installed certifi-2024.8.30 charset-normalizer-3.4.0 idna-3.10 requests-2.32.3 urllib3-2.2.3
```

那四个包叫传递依赖，你没有直接写，但程序运行起来离不开它们。约束是区间而不是点，最终装哪个版本由解算器决定。

| 包                | 对 `numpy` 的要求  | 与已有约束的交集   |
| ----------------- | ------------------ | ------------------ |
| `tensorflow==2.3` | `>=1.16.0,<1.19.0` | `>=1.16.0,<1.19.0` |
| `pandas==1.2.0`   | `>=1.16.5`         | `>=1.16.5,<1.19.0` |
| 另一个包          | `>=1.19`           | 空集，冲突         |

冲突无解时，升级任意一个包都无法调和，这类局面叫依赖地狱。隔离是唯一通用的解法。

还有两个容易忽略的细节。安装名和导入名不必相同：`pip install pyyaml` 之后 `import yaml`，`pip install pillow` 之后 `import PIL`，报错信息里出现的是后者。索引也不必唯一：`--index-url` 换源、`--extra-index-url` 追加备用源，企业内网常见这种配置，代价是信任边界变模糊。

## 隔离环境

虚拟环境是一份独立的 `site-packages`，由 `venv/bin` 下的解释器启动时生效，不会影响其他进程。

```bash
python -m venv venv
source venv/bin/activate
which python      # /home/me/proj/venv/bin/python
which pip         # /home/me/proj/venv/bin/pip
pip list          # 只有 pip
deactivate
```

`activate` 做的是把 `venv/bin` 插到 `$PATH` 最前面，并设好 `$VIRTUAL_ENV`。`deactivate` 是脚本里定义的 Shell 函数，不是磁盘上的可执行文件，所以 `which deactivate` 什么也找不到。

| 层级     | 可见范围           | 切换成本            | 典型用途     |
| -------- | ------------------ | ------------------- | ------------ |
| 全局     | 机器上所有项目     | 无                  | 系统自带工具 |
| 虚拟环境 | 单个项目           | `activate` 一条命令 | 日常开发     |
| 容器     | 单个应用及其系统库 | 重建镜像            | 交付与部署   |

系统的 Python 可能被包管理器或 OS 自身使用，改它等于赌系统不会坏。

一个项目一个环境，别搞一个万能环境装所有东西。两个项目的版本要求迟早会撞，撞的时候你只能二选一。

虚拟环境目录里存的是绝对路径：`pyvenv.cfg` 和 `bin/` 下的脚本都指向创建时的位置。把整个目录拷到别的机器、别的路径，多半直接坏掉。正确做法是把依赖声明提交到仓库，到新机器上重建。

```bash
rm -rf venv && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt
```

环境是一次性的，声明文件才是资产。这条心态差别，决定了项目在别人机器上能不能十分钟跑起来。

还有些进程不跟着 `activate` 走：Jupyter 内核、编辑器的 LSP、pytest 的插件各自绑定某个解释器。装完包却仍然 import 失败时，先打印 `sys.executable`，看它到底在哪个环境里。

## 工具与规范

Python 的打包不是由单一工具定义的，而是一组规范：PEP 517 定构建后端接口，PEP 621 定 `pyproject.toml` 里的元数据，PEP 440 定版本号与约束语法。规范稳定了，`pip` 才能被 `uv` 这类更快的实现替换。

同一组规范也让 `pyproject.toml` 取代了 `setup.py` 和手写的 `requirements.txt`，成为唯一的项目声明。

```bash
uv venv --python 3.12 venv312
source venv312/bin/activate
uv pip install requests
uv pip freeze
```

| 任务       | `pip`            | `uv`                    |
| ---------- | ---------------- | ----------------------- |
| 建环境     | `python -m venv` | `uv venv --python 3.12` |
| 装包       | `pip install`    | `uv pip install`        |
| 列已安装   | `pip list`       | `uv pip list`           |
| 导出精确版 | `pip freeze`     | `uv pip freeze`         |

两者写的是同一套 `site-packages` 布局，可以混用，但不要在同一环境里来回切换工具，容易对不上元数据。

`uv` 有两层接口，别混。`uv pip install` 是 `pip` 的替代品，你手动管依赖；`uv add` 与 `uv sync` 是项目模式，读 `pyproject.toml`、写 `uv.lock`、顺手建 `.venv`。做应用用项目模式，做一次性实验用 `uv pip`。

## 常见坑

- `sudo pip install` 绕过了环境隔离，文件落到系统目录，卸载时很难找干净
- `pip` 来自 A 解释器、`python` 是 B 解释器时，用 `python -m pip` 保证两者一致
- `--system-site-packages` 建出的环境能看见全局包，隔离性打折
- 环境目录不提交版本控制，`.venv/` 写进 `.gitignore`
- 编辑器、IDE 需要手动指定解释器路径，否则仍然用系统 Python
- 环境可以随时删掉重建，真正要保住的是依赖声明文件
- `pip install -U pkg` 会连带升级它依赖的包，可能顺手破坏别的东西
- 依赖声明和实际环境长期不同步，是「我这能跑」最常见的来源
- 迁移环境时导出 `pip freeze` 再装，等于把当时的偶然结果当成契约
- 每个环境都装 `ipython`、`black` 这类开发工具，会让锁文件失去区分度，用 `[dependency-groups]` 或 extras 分层
- `conda`、`poetry`、`pdm` 也能管环境，同一个仓库里别混用两套
