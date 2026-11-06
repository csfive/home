---
title: 版本控制与 Git
description: MIT Missing Semester 第 4 讲 主题清单
---

# 版本控制与 Git

[第 4 讲 · Version Control](https://missing.csail.mit.edu/2026/version-control/ 'MIT Missing Semester 第 4 讲：视频、讲义和课后练习')

[课后练习答案](https://github.com/csfive/missing-semester/tree/main/04-version-control '非官方，仅供参考')

## [数据模型](/ms/04/data-model)

- 快照模型：每次提交保存整棵树
- `blob` 是文件内容，不带文件名
- `tree` 把名字映射到 `blob` 或 `tree`
- `commit` 指向顶层 `tree`
- `commit` 含 `parents`、作者、时间、消息
- 历史是有向无环图 `DAG`
- 合并提交有两个 parent
- 对象按内容哈希寻址
- `git cat-file -t` 与 `-p`
- `git hash-object` 手工存对象
- 引用是可变的提交指针
- `refs/heads/*` 存分支
- `HEAD` 指向当前分支
- `git symbolic-ref HEAD`
- 仓库 = 对象 + 引用
- 所有命令都在改这张图

## [提交与暂存区](/ms/04/staging)

- `git init` 生成 `.git`
- 工作区、索引、仓库三层
- 索引文件就是 `.git/index`
- `git status` 对照三层状态
- `git add <path>` 把改动写进索引
- `git add -p` 按块挑改动
- `git add -u` 只处理已跟踪文件
- `git commit` 只记录索引内容
- `git commit --amend` 改写上一个提交
- `git diff` 工作区对索引
- `git diff --staged` 索引对 `HEAD`
- `git diff HEAD` 工作区对 `HEAD`
- `git show <rev>` 看提交与补丁
- `.gitignore` 只约束未跟踪文件
- `!pattern` 把例外重新纳入
- 全局忽略：`core.excludesFile`

## [分支与 HEAD](/ms/04/branching)

- 分支只是指向提交的引用
- `git branch` 列出本地分支
- `git branch <name>` 只建不切
- `git switch <name>` 切换分支
- `git switch -c <name>` 建并切
- `git switch -` 回上一个分支
- 切换会更新 `HEAD` 与工作区
- `HEAD` 存的是分支名
- `git switch --detach <rev>` 分离 HEAD
- 分离状态的提交不属于任何分支
- `git branch -d` 拒绝删未合并分支
- `git branch -D` 强制删除
- `git branch -vv` 看 upstream 与领先落后
- `git branch -m` 重命名分支
- `git tag` 固定指向某个提交
- 分支名 `main`、`master` 只是约定

## [合并与冲突](/ms/04/merge)

- `git merge <rev>` 合入当前分支
- fast-forward 只移动指针
- `--no-ff` 强制生成合并提交
- 三方合并以共同祖先为基准
- `git merge-base A B` 求共同祖先
- 合并提交的 parent 顺序有意义
- 冲突时索引里存三个版本
- 冲突标记 `<<<<<<<`、`=======`、`>>>>>>>`
- 解决后 `git add` 标记已解决
- `git commit` 或 `git merge --continue` 收尾
- `git merge --abort` 回到合并前
- `git checkout --ours` 取当前分支版本
- `git checkout --theirs` 取对方版本
- `git mergetool` 调外部合并工具
- `git log --merge` 只列相关提交
- `git rerere` 复用冲突解决方案

## [变基与重写历史](/ms/04/rebase)

- `git rebase <base>` 把提交重放到新基底
- 变基逐个重放，冲突逐个解决
- 每个重放都产生新哈希
- 历史从分叉变成直线
- 不重写已推送的公共分支
- `git rebase -i HEAD~3` 交互式整理
- 动作：`pick`、`reword`、`edit`、`squash`、`fixup`、`drop`
- `git rebase --continue`、`--abort`、`--skip`
- `git rebase --onto A B C` 搬运区间
- `git cherry-pick <rev>` 复制单个提交
- `git commit --fixup` 配合 `--autosquash`
- `ORIG_HEAD` 记下变基前的点
- `git reflog` 找回被改写前的分支
- 改写后推送用 `--force-with-lease`

## [远端协作](/ms/04/remotes)

- `git remote -v` 列出远端与 URL
- `git remote add origin <url>`
- `git clone` 自动建 `origin`
- `git fetch` 只下载对象与引用
- `origin/main` 是远端跟踪引用
- `git pull` 等于 `fetch` 加 `merge`
- `git pull --rebase` 换成变基
- `git push -u origin main` 设 upstream
- `git push origin local:remote`
- `git branch --set-upstream-to=origin/main`
- `git branch -vv` 看领先与落后
- `--force-with-lease` 比 `--force` 安全
- `git push origin --delete <branch>`
- `git remote prune origin` 清理失效引用
- `git clone --depth 1` 浅克隆
- Git 不是 GitHub，PR 是平台概念

## [撤销与恢复](/ms/04/undo)

- `git restore <file>` 丢弃工作区改动
- `git restore --staged <file>` 取消暂存
- `git restore --source=<rev> <file>` 取旧版本
- `git reset --soft` 只挪 `HEAD`
- `git reset --mixed` 默认，连带重置索引
- `git reset --hard` 覆盖工作区
- `git reset` 不改 `reflog`
- `git revert <rev>` 生成反向提交
- 已推送的提交用 `revert` 撤销
- `git checkout <rev> -- <file>` 旧写法
- `git clean -fd` 删未跟踪文件，先用 `-n` 预览
- `git stash push -m` 暂存改动
- `git stash -u` 连未跟踪文件一起
- `git stash list`、`pop`、`apply`、`drop`
- `git reflog` 找回丢失提交
- 误删分支：`git branch <name> <sha>`

## [历史排查](/ms/04/history)

- `git log --all --graph --decorate --oneline`
- `git log -p <file>` 逐次改动
- `git log --follow <file>` 跟随重命名
- `git log -S'<string>'` 搜索增删
- `git log -G'<regex>'` 搜索补丁内容
- `--author`、`--since`、`--grep` 过滤
- `git log -L 10,20:file` 追一段行的历史
- `git blame <file>` 每行的最后改动
- `git blame -L 5,15 <file>` 限定行范围
- `git blame -w` 忽略空白改动
- `git show <rev>:<path>` 读某个版本的文件
- `git diff A..B` 比较两个端点
- `git diff A...B` 从共同祖先比到 B
- `git bisect start`、`good`、`bad`
- `git bisect run <script>` 自动二分
- `git rev-list --count HEAD` 数提交

## [容易混淆的问题](/ms/04/pitfalls)

- `git pull` 到底是合并还是变基
- `fetch` 之后工作区为什么没变
- `reset --hard` 与 `restore` 差在哪
- `revert` 与 `reset` 都叫撤销，用哪个
- 分支与 tag 都是引用，区别是什么
- `checkout`、`switch`、`restore` 的分工
- 分离 HEAD 时新建的提交去哪了
- 变基之后为什么推送被拒
- `.gitignore` 为什么对某些文件无效
- `origin/main` 与本地 `main` 的关系
