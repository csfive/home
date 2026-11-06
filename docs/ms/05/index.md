---
title: 打包与发布
description: MIT Missing Semester 第 5 讲 主题清单
---

# 打包与发布

[第 5 讲 · Packaging and Shipping Code](https://missing.csail.mit.edu/2026/shipping-code/ 'MIT Missing Semester 第 5 讲：视频、讲义和课后练习')

[课后练习答案](https://github.com/csfive/missing-semester/tree/main/05-shipping-code '非官方，仅供参考')

## [依赖与环境](/ms/05/dependencies)

- `import` 失败：包不在搜索路径
- `pip install` 的四步：查索引、选产物、解依赖、落盘
- PyPI 与各语言的包索引
- 传递依赖：`requests` 与 `urllib3`
- 依赖冲突与「依赖地狱」
- 版本区间求交集的判定
- `python -m venv venv`
- `source venv/bin/activate` 只改 `$PATH`
- `which python` 与 `which pip` 的前后变化
- `deactivate` 是 Shell 函数而非程序
- 每个项目一个环境
- 系统自带的 Python 不要动
- `uv venv --python 3.12`
- `uv pip install` 与 `pip` 同接口
- PEP 517、PEP 621 的规范分层
- `pyproject.toml` 取代 `setup.py` 与 `requirements.txt`

## [构建产物与打包](/ms/05/packaging)

- 库、命令行工具、Web 服务的交付形态
- 换目录后 `import` 失败的根因
- Python 的模块搜索路径
- wheel：带固定目录结构的 zip
- sdist：源码分发包 `.tar.gz`
- `pyproject.toml` 的 `[project]` 段
- `dependencies` 声明运行期依赖
- `[project.scripts]` 生成命令行入口
- `[build-system]` 与 `build-backend`
- `uv build` 产出 `dist/`
- `unzip -l` 检查 wheel 内容
- `dist-info/` 里的 `METADATA` 与 `RECORD`
- 平台标签 `cp312-cp312-macosx_14_0_arm64`
- `py3-none-any` 代表跨平台纯 Python
- 装源码要编译器，装二进制要匹配平台
- `ripgrep` releases 的预编译矩阵

## [发布与版本号](/ms/05/versioning)

- 开发是连续的，发布是离散的
- dev、staging、prod 的边界
- 一次发布包含的步骤
- 版本号标识某一时刻的行为
- patch、minor、breaking change
- changelog 与 release notes 的分工
- SemVer：`MAJOR.MINOR.PATCH`
- `0.y.z` 期间接口不承诺稳定
- `uv tree` 查看整棵依赖树
- PEP 440 的版本约束语法
- `==`、`>=`、`>=1.24,<2.0`
- `~=2.1.0` 等价于 `>=2.1.0,<2.2.0`
- `~=` 与 npm、cargo 的 `^`
- 预发布版本 `1.0.0rc1`
- CalVer：Ubuntu 的 `24.04`
- 语义化版本也会被违反

## [可复现构建](/ms/05/reproducibility)

- 钉版本（pinning）与范围约束
- 锁文件记录解算后的精确版本
- `uv lock` 与 `uv.lock`
- 锁文件里的 `sha256` 校验和
- `uv sync --locked` 拒绝漂移
- 库用范围、应用用精确
- 构建环境本身也是输入
- 编译器、系统库、驱动版本
- Nix、Bazel 的 hermetic build
- 内容寻址与逐位一致
- `SOURCE_DATE_EPOCH` 固定时间戳
- CI 里对新版本依赖跑测试
- Dependabot 自动提升级 PR
- 升级失败时的回滚预案
- `pip freeze` 不是真正的锁文件

## [虚拟机与容器](/ms/05/containers)

- 包管理器管不到的系统依赖
- GPU 驱动、`libpq`、`OpenSSL`
- VM 虚拟整台机器，自带内核
- 容器共享宿主内核，更轻更快
- Docker 与 containerd 的分层
- `docker run -it python:3.12 python`
- image 是产物，container 是实例
- 镜像分层与构建缓存
- `FROM python:3.12-slim` 的意义
- 合并 `RUN` 与清理 `apt` 缓存
- `COPY --from=...` 的 builder 模式
- `linux/amd64` 与 `linux/arm64` 不可互换
- macOS 上 Docker 跑在轻量 VM 里
- 容器隔离弱于 VM
- 别用 root 跑、别把密钥烤进层

## [配置与密钥](/ms/05/configuration)

- 配置在运行时注入，不写死在代码里
- 环境变量：`os.environ.get`
- 配置文件：`config.yaml`
- 默认值与必填项的写法
- 同一份代码部署到多个环境
- 只改配置、不改代码
- 启动即校验，失败就退出
- 密钥不进版本控制
- `.env`、`.env.example` 与 `.gitignore`
- 优先级：flag 高于环境变量高于文件
- 容器里的环境变量传递
- 密钥轮换与最小权限

## [服务与编排](/ms/05/services)

- 单体与微服务的取舍
- Redis、Memcached 当独立服务用
- 服务之间走 HTTP API
- `docker-compose.yml` 声明多容器
- `depends_on` 只管启动顺序
- healthcheck 才管服务可用
- Docker 内建 DNS：服务名即主机名
- `volumes` 持久化数据
- `docker compose up -d` 与 `logs -f`
- `restart` 策略与开机自启
- systemd 拉起 compose
- Kubernetes 的适用规模
- `curl` 直接调 HTTP API

## [发布与分发](/ms/05/publishing)

- 最简单的分发：HTTP 目录列表
- GitHub Releases 附上预编译产物
- `pip install git+https://...@v2.32.3`
- 直接从 release URL 装 wheel
- Go 的去中心化模块分发
- 中央索引：PyPI、crates.io、npm
- `uv publish` 上传产物
- TestPyPI 演练发布流程
- `--index-url` 从测试源安装
- 校验和与包签名
- PyPI 版本号不可复用
- 私有 registry 与制品库
- Docker Hub 与 `ghcr.io`
- 域名、DNS 与反向代理
- GitHub Pages 托管静态站点

## [容易混淆的问题](/ms/05/pitfalls)

- 虚拟环境和容器解决的是同一件事吗
- `pip install` 与 `uv pip install` 装到哪
- wheel 和 sdist 应该发哪个
- `~=` 与 `^` 是一回事吗
- 锁文件和 `requirements.txt` 差在哪
- image 与 container 有何不同
- `depends_on` 能保证依赖服务就绪吗
- 库和应用为什么对版本约束态度相反
- 容器里的 `localhost` 指向谁
- 退出容器后数据去哪了
