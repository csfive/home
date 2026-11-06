---
title: 远端协作
description: MIT Missing Semester 第 4 讲 · 远端协作
---

# 远端协作

远端不是特殊仓库，只是加了名字的 URL。`fetch` 把对象和引用搬回来，`push` 把本地引用送出去并请求对方更新。

## 远端引用

`git remote add origin <url>` 只是往 `.git/config` 写一行。`origin` 是默认名字，不是关键字，用 `upstream` 命名上游仓库同样合法。

```bash
git remote -v
git remote add origin git@github.com:me/repo.git
git remote rename origin github
git remote show origin
```

| 引用             | 含义                       |
| ---------------- | -------------------------- |
| `main`           | 本地分支                   |
| `origin/main`    | 上次抓取时远端 main 的位置 |
| `refs/remotes/*` | 所有远端跟踪引用的存放处   |

`origin/main` 是只读快照，不能直接提交。它在你 `fetch` 或 `push` 之后才更新，不会自动跟着远端变。

## 抓取与拉取

```bash
git fetch origin
git log HEAD..origin/main --oneline   # 看看多了什么
git pull origin main
git pull --rebase
```

`fetch` 只更新 `origin/*`，不动工作区，这是它安全的原因。`pull` 等于 `fetch` 加 `merge`，把远端改动直接并进来；加 `--rebase` 则改成变基，历史更直但会重写本地提交。

想固定默认行为可以设 `git config --global pull.rebase true`，省得每次纠结。多人共用分支时，`pull --rebase` 通常比默认的合并提交干净。

## 推送与 upstream

```bash
git push -u origin main
git push origin local:remote
git push origin --delete old-branch
git branch -vv
```

`-u` 把本地 main 与 `origin/main` 绑定，之后 `git push`、`git pull` 不用再写参数。`git branch -vv` 会显示每个分支的 upstream 以及领先、落后多少个提交。

`git branch --set-upstream-to=origin/main` 可以给已有分支补绑，`git branch --unset-upstream` 取消绑定。

改写过的历史只能强推。用 `--force-with-lease`：远端有别人的新提交时它会拒绝，`--force` 则直接覆盖掉。

远端已删除的分支，本地 `origin/*` 会残留。`git remote prune origin` 或 `git fetch --prune` 清掉这些失效引用。

## 克隆的变体

| 命令                           | 效果                     |
| ------------------------------ | ------------------------ |
| `git clone <url>`              | 完整历史，建 `origin`    |
| `git clone --depth 1 <url>`    | 只取最新一个提交         |
| `git clone --filter=blob:none` | 取全部提交，按需下载文件 |
| `git clone --branch v1 <url>`  | 直接检出指定分支或 tag   |

浅克隆适合 CI 和只看最新代码的场景，代价是没有完整历史，`blame`、`bisect` 都用不了。需要时 `git fetch --unshallow` 补全。

## 延伸：Git 不是 GitHub

PR、fork、issue、review 都是平台功能，Git 本身只有分支、提交和引用。同一套仓库可以推到 GitLab、Bitbucket 等任意支持 Git 协议的服务。

fork 工作流的实质是两个远端：`origin` 指向自己的副本，`upstream` 指向原项目。同步上游用 `git fetch upstream` 加 `git rebase upstream/main`，再从自己的副本发 PR。
