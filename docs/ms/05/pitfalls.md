---
title: 容易混淆的问题
description: MIT Missing Semester 第 5 讲 · 常见误解
---

# 容易混淆的问题

依赖、产物、环境这三个词经常被混着用，混起来之后排查方向就会歪。

## 词汇对照

| 容易混淆                            | 区别                                                  |
| ----------------------------------- | ----------------------------------------------------- |
| 虚拟环境 / 容器                     | 前者隔离 Python 包，后者隔离整个文件系统与系统库      |
| `pip install` / `uv pip install`    | 写的是同一套 `site-packages`，只是实现和速度不同      |
| `uv pip` / `uv add`                 | 手动装包 vs 项目模式，读 `pyproject` 并维护锁文件     |
| wheel / sdist                       | 预编译产物 vs 源码包；前者装得快，后者要编译器        |
| `~=2.1.0` / `^2.1.0`                | `~=` 只放开最低段到 `<2.2.0`，`^` 放到 `<3.0.0`       |
| 锁文件 / `requirements.txt`         | 锁文件含完整解算结果与哈希；手写文件只是声明          |
| image / container                   | 模板 vs 运行实例，一个镜像可起多个容器                |
| `depends_on` / 服务就绪             | 前者只等进程启动，等应用可用要配 `healthcheck`        |
| 库 / 应用 的版本约束                | 库要放宽以免和用户冲突，应用要钉死以求可复现          |
| 构建时依赖 / 运行期依赖             | `[build-system].requires` vs `dependencies`           |
| 容器内 `localhost` / 宿主           | 容器内是容器自己，连别的服务用服务名                  |
| 退出容器 / 删除容器                 | 退出只是停止；数据在可写层里，`docker rm` 就没了      |
| 安装名 / 导入名                     | `pip install pyyaml` 之后 `import yaml`，报错里是后者 |
| `--index-url` / `--extra-index-url` | 覆盖主源 vs 追加来源，混用会打开依赖混淆的口子        |

## 环境有三层

`command not found`、`ModuleNotFoundError`、`error while loading shared libraries` 是三层不同的问题，修法完全不同。

- PATH 层：Shell 找不到可执行文件，看 `which -a` 和 `$PATH`
- 语言层：解释器找不到包，看 `sys.path`、`sys.executable` 和 `pip list`
- 系统层：动态链接器找不到 `.so`，看 `ldd` 和包管理器装没装 `-dev` 包

| 报错                                   | 在哪一层  | 第一动作                     |
| -------------------------------------- | --------- | ---------------------------- |
| `command not found`                    | PATH      | `which -a`、`echo $PATH`     |
| `ModuleNotFoundError`                  | 语言      | `sys.executable`、`pip list` |
| `error while loading shared libraries` | 系统      | `ldd`、装 `-dev` 包          |
| `permission denied`                    | 内核/权限 | 看 `ls -l` 与 `id`           |

用错层会得到「重装了还是不行」。

## 依赖的三个阶段

声明、解算、安装是三件事，任何一步缺失都会在别处暴露。

1. 声明：`pyproject.toml` 或 `requirements.txt` 写范围
2. 解算：工具把范围变成一组具体版本，写进锁文件
3. 安装：把产物解包到某个环境里

写进声明不等于装上了，写进锁文件也不等于装上了。CI 里 `uv sync --locked` 三步一次做完，本地却常常跳步，于是「我这能跑」出现了。

```bash
uv lock            # 解算，写锁文件
uv sync --locked   # 只装，不重新解算
```

解算发生在什么时候也容易混：锁文件在本地生成一次并提交，CI 只负责按锁文件装。让 CI 每次重新解算，等于每个构建都可能装到不同的世界。

## 发布时的两个误判

「CI 绿了就能发」：CI 只证明这次构建在它的环境里通过了测试，既不证明生产配置正确，也不证明数据库迁移可逆。发布还需要一次真实环境的验证。

「镜像推上去就完事了」：推送到 registry 只是让产物可获取，服务仍在跑旧版本。要确认的是部署是否生效，比如版本接口返回的 commit 变了没有。

## 补充几则

**激活环境改的是 `$PATH`。** `which python` 变了不是因为装了新解释器，而是 `venv/bin` 排到了前面。`deactivate` 是 `activate` 脚本里定义的函数，它把旧的 `$PATH` 还原回去，所以 `which deactivate` 找不到东西。

**版本号不是承诺。** 语义化版本是约定，不是强制。有人把破坏性改动放进 minor，也有项目干脆不用 SemVer。真正兜底的是锁文件、CI 和回滚能力。

**容器不是「轻量虚拟机」。** 它没有独立内核，启动快是因为不做硬件虚拟化。需要换内核、跑别的操作系统、要强隔离时，仍然得用 VM。

**「发布」和「部署」不是一步。** 发布是把版本交出去，部署是让它在某个环境里跑起来。同一个版本可以只发布不部署，也可以部署到多个环境，两者的失败原因完全不同。
