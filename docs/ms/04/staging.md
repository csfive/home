---
title: 提交与暂存区
description: MIT Missing Semester 第 4 讲 · 提交与暂存区
---

# 提交与暂存区

`git commit` 记录的不是工作区现状，而是索引里的内容；暂存区就是中间那层可以挑拣的缓冲。

## 三个区域

工作区是磁盘上的文件，索引（`.git/index`）是下一次提交的草稿，仓库是已提交的对象。`git status` 用两列告诉你文件在这三层之间怎么流动。

| 区域   | 位置           | 内容             |
| ------ | -------------- | ---------------- |
| 工作区 | 项目目录       | 你正在编辑的文件 |
| 索引   | `.git/index`   | 下次提交的快照   |
| 仓库   | `.git/objects` | 已提交的历史     |

```bash
git init
git status --short
git add main.c
git commit -m "add main"
```

`git add` 是把工作区内容写进索引，而不是「开始跟踪」这么含糊的动作。文件第一次 `add` 之前是未跟踪状态，`status` 会单独提示。

## 挑着提交

```bash
git add -p          # 逐块询问是否暂存
git add -u          # 已跟踪文件的修改与删除
git add .           # 当前目录全部，小心误加
git commit -v       # 编辑器里附上 diff 方便回看
```

`-p` 解决的是「两个功能混在一个文件」的常见局面：按块挑选，先提交修 bug 的部分，再提交新功能。同样的效果也可以用 `git commit -- <paths>` 只提交指定路径。

消息写清楚「为什么改」，别写「update」或「fix」。第一行控制在 50 字符左右，空一行再写正文，`git log --oneline` 才看得下去。

## 三种 diff

| 命令                | 比较对象               |
| ------------------- | ---------------------- |
| `git diff`          | 工作区 vs 索引         |
| `git diff --staged` | 索引 vs `HEAD`         |
| `git diff HEAD`     | 工作区 vs `HEAD`       |
| `git diff A B`      | 两个提交之间           |
| `git show <rev>`    | 单个提交的元数据与补丁 |

暂存之后 `git diff` 忽然变空是正常的，改动已经进了索引，要用 `--staged` 才看得到。提交前核对 `git diff --staged` 是个值得养成的习惯。

## 忽略文件

`.gitignore` 按行写模式：`build/` 只匹配目录，`*.log` 匹配任意层级的文件，前面加 `/` 锚定仓库根，`!keep.log` 把已被前面规则排除的文件拉回来。

已经被跟踪的文件不受忽略规则影响。要先 `git rm --cached <file>` 让它变成未跟踪，规则才会生效。

```text
build/
*.o
!important.o
.DS_Store
```

OS 与编辑器产生的文件适合放全局忽略：`git config --global core.excludesFile ~/.gitignore_global`，然后手工创建那个文件。

## 改写上一次提交

`git commit --amend` 用当前索引替换上一个提交，哈希随之改变。补一个漏掉的文件、改一条写错的说明都用它，但只能用在还没推送的提交上。

`git commit --allow-empty -m "trigger ci"` 可以造空提交触发流水线，这也是理解「提交只是快照加元数据」的好例子。
