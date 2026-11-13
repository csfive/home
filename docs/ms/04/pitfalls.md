---
title: 容易混淆的问题
description: MIT Missing Semester 第 4 讲 · 容易混淆的问题
---

# 容易混淆的问题

这些问题都出在同一处：命令名字接近，改的却是模型里不同的层。

| 容易混淆                          | 区别                                  |
| --------------------------------- | ------------------------------------- |
| `pull` / `fetch`                  | 前者合并或变基，后者只更新 `origin/*` |
| `reset --hard` / `restore`        | 移动分支指针 vs 只改工作区或索引      |
| `revert` / `reset`                | 追加反向提交 vs 改写历史              |
| 分支 / tag                        | 会随提交前移 vs 固定指向某个提交      |
| `checkout` / `switch` / `restore` | 老命令身兼两职，新命令各管一件事      |
| 分离 HEAD 下的提交                | 不在任何分支上，切走就只剩 reflog     |
| 变基后推送                        | 历史已分叉，需要 `--force-with-lease` |
| `.gitignore` 不生效               | 文件已被跟踪，先 `git rm --cached`    |
| `origin/main` / `main`            | 远端快照 vs 本地分支，互不自动同步    |
| `merge` / `rebase`                | 保留分叉 vs 拉成直线，哈希是否改变    |

## 两个补充

**`git commit` 只提交索引。** 忘记 `git add` 时新文件不会进提交，`git status` 里仍是未跟踪。

**`reset --hard` 不删对象。** 它只让分支后退，提交仍可通过 `git reflog` 找回。真正危险的是 `git clean`，未跟踪文件不在对象库里，删掉没有任何退路。

让忽略规则对已跟踪文件生效，先把它们从索引里摘掉：

```bash
git rm --cached .env
git rm -r --cached build/
```
