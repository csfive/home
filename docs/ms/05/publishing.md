---
title: 发布与分发
description: MIT Missing Semester 第 5 讲 · 发布与分发
---

# 发布与分发

产物构建出来只是自己机器上的一个文件。发布是让它离开这台机器，并且让陌生人能验证拿到的东西确实是你给的。

## 分发形态

最简单的分发就是一个 HTTP 目录列表。Ubuntu 的包归档至今仍然是这样：一堆 `.deb` 文件挂在 web 服务器上，包管理器按索引去取。

GitHub 成了事实标准：源码公开在仓库里，release 页面挂上按 tag 构建的二进制。包管理器也能直接吃 git 地址。

```bash
pip install git+https://github.com/psf/requests.git
pip install git+https://github.com/psf/requests.git@v2.32.3
pip install https://github.com/user/repo/releases/download/v1.0/package-1.0-py3-none-any.whl
```

| 形态           | 例子                                | 特点                     |
| -------------- | ----------------------------------- | ------------------------ |
| 目录列表       | Ubuntu archive                      | 最原始，靠索引文件       |
| 代码仓库 + tag | `pip install git+...@v2.32.3`       | 从源码构建，需要工具链   |
| release 附件   | GitHub Releases                     | 预编译，下载即用         |
| 去中心化       | Go modules 的 `github.com/...` 路径 | 模块路径就是仓库地址     |
| 中央索引       | PyPI、crates.io、npm                | 有搜索、有元数据、有镜像 |

Go 是特例：`go get` 直接从仓库取代码，没有中央服务器。多数生态仍然选择中央索引，因为可发现性和一致性更重要。

中央索引还承担了缓存和审计：源站挂了镜像还在，公司内网只需要放行一个域名，依赖清单也能被扫描工具统一处理。自己搭私有源，本质上是在复刻这些能力。

## 上传到索引

Python 的主索引是 PyPI。上传前先拿 TestPyPI 演练，它是一套独立的注册表，用来验证流程而不污染正式索引。

```bash
uv build
uv publish --publish-url https://test.pypi.org/legacy/
uv pip install --index-url https://test.pypi.org/simple/ greeting
```

认证靠 API token，`uv publish` 会读 `UV_PUBLISH_TOKEN` 环境变量，也可以用 `--token` 传。token 只放进 CI 的 secret 里，不要写进仓库。

| 生态     | 注册表              | 上传工具              |
| -------- | ------------------- | --------------------- |
| Python   | PyPI、TestPyPI      | `uv publish`、`twine` |
| Rust     | crates.io           | `cargo publish`       |
| JS       | npm                 | `npm publish`         |
| 容器镜像 | Docker Hub、ghcr.io | `docker push`         |

PyPI 的版本号是一次性的：`greeting-0.1.0` 传上去就永远占住这个位置，改代码只能发 `0.1.1`。所以先用 TestPyPI 试，别把正式版本号当试验品。

发错了也不是完全没救。PyPI 支持把一个版本 yank 掉：它仍然可以被精确版本号安装，但不会被选为最新版，也不会进新的解算结果。删包则会连带影响已经依赖它的项目，通常不是好主意。

发布清单大致是：版本号与 tag 一致、`dist/` 里两个产物都在、在干净环境里装过一次、changelog 写好了、token 只从 CI 注入。少一项，出问题的概率就高一截。

## 信任

用户拿到一个包，需要确认两件事：内容没被篡改，来源确实是你。

- 校验和：索引记录每个文件的 hash，`uv.lock` 里也带 `sha256`
- 包签名：部分生态支持用 GPG 或 Sigstore 对产物签名
- 私有源：内部包放在自建 PyPI 镜像或私有 registry，不公开
- 命名空间：npm 的 `@scope/pkg` 减少抢注，PyPI 没有命名空间，只能靠抢名字

一个常见攻击面是「依赖混淆」：如果 CI 里用 `--index-url` 覆盖了默认源，同时漏了 `--extra-index-url` 的优先级规则，攻击者可以在公共源上传一个同名但版本更高的包，让构建装到假货。内部包名要有前缀，或者干脆只信任一个源。

锁文件里的 `sha256` 也是防线的一部分：索引被投毒、镜像被替换时，哈希对不上会直接失败。前提是锁文件的每次改动都被人看过。

## 部署到网上

把 Web 服务放到公网还需要几层：注册域名、配 DNS 指向服务器、用 nginx 之类的反向代理终结 HTTPS 并转发到应用端口。证书现在基本由 Let's Encrypt 自动化。

静态站点简单得多，GitHub Pages 直接从仓库构建并托管，推一次代码就更新。文档、博客、这门课的笔记站都适合这条路。

镜像发布和包发布是两条线：包走语言生态的索引，镜像走容器 registry，`docker push ghcr.io/user/app:0.1.0` 之后，任何机器 `docker pull` 就能跑起来，不需要 Python 环境。

部署流程通常是：构建镜像并打上版本 tag，推到 registry，服务器上 `docker compose pull` 再 `up -d`。证书和域名都可以自动化，手工续期迟早会过期。

镜像标签别只用 `latest`。它指向什么随时会变，回滚时无法指回上一个确定状态；版本 tag 加 digest 才能让「部署的是哪一版」有答案。
