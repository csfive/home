---
title: dotfiles 与配置同步
description: MIT Missing Semester 第 2 讲 · dotfiles 与配置同步
---

# dotfiles 与配置同步

点开头的文件默认不显示，`ls -a` 才看得见。

## 谁在读这些文件

Shell 的启动文件按「登录与否」「交互与否」分岔。macOS 的 Terminal 默认开登录 shell，Linux 的终端模拟器多半开交互式非登录 shell，这就是同一份配置在不同机器上表现不一致的根源。

| 文件                                | 读取时机          | 放什么                 |
| ----------------------------------- | ----------------- | ---------------------- |
| `~/.zshenv`                         | 每次启动 zsh      | `PATH`、环境变量       |
| `~/.zprofile`                       | 登录 shell        | 登录时执行一次的初始化 |
| `~/.zshrc`                          | 交互式 shell      | 别名、提示符、补全     |
| `~/.zlogin`                         | 登录 shell，较晚  | 依赖 `.zshrc` 的设置   |
| `~/.bash_profile`                   | 登录 bash         | macOS 上的主入口       |
| `~/.bashrc`                         | 交互式非登录 bash | 别名、函数             |
| `~/.config/nvim/init.lua`           | 启动 Neovim       | 编辑器配置             |
| `~/.config/git/config`              | 每次 `git`        | 与 `~/.gitconfig` 等价 |
| `~/.config/Code/User/settings.json` | VS Code 启动      | 编辑器设置、扩展选项   |

`~/.config` 是 XDG 规范的位置，设了 `$XDG_CONFIG_HOME` 就得换成它。macOS 上 VS Code 的设置文件在 `~/Library/Application Support/Code/User/`，同目录还有 `keybindings.json`，改快捷键不必点图形界面。

`~/.zshenv` 连非交互脚本都会读，把耗时命令写进去会拖慢每一次 `zsh -c`。

## 放进仓库

dotfiles 仓库的常见做法是让仓库里的文件成为唯一真源，再用软链铺到 `$HOME`。手工 `ln -s` 最直白：

```bash
ln -s ~/dotfiles/zsh/.zshrc ~/.zshrc
ln -s ~/dotfiles/nvim ~/.config/nvim
```

文件多了就该用工具。GNU stow 按目录镜像批量建链，chezmoi 还能渲染模板、区分机器。

```bash
# 目录结构 dotfiles/zsh/.zshrc、dotfiles/nvim/init.lua
stow -t ~ zsh nvim

# 换机器时一条命令铺开
chezmoi init --apply git@github.com:you/dotfiles.git
```

不想装工具也能用 bare repo：把 `$HOME` 当工作区，仓库放在 `~/.dotfiles`。

```bash
git init --bare "$HOME/.dotfiles"
alias dotfiles='git --git-dir=$HOME/.dotfiles --work-tree=$HOME'
dotfiles config status.showUntrackedFiles no
dotfiles add ~/.zshrc && dotfiles commit -m "add zshrc"
```

`status.showUntrackedFiles no` 必须设，否则 `$HOME` 里所有文件都会被列成未跟踪。

## 机器差异与秘密

同一份配置要在笔记本、服务器、容器里都成立，就得留出机器相关的分支。简单做法是把机器相关设置放进 `~/.zshrc.local`，在 `~/.zshrc` 末尾按需加载，再把这个文件加进 `.gitignore`。

`$(hostname)` 或 `$OSTYPE` 判断也能用，但主机名一改就失效。CI 和容器里更适合用环境变量开关：`[ -n "$CI" ] && return`。

```bash
# ~/.zshrc 末尾
[ -f ~/.zshrc.local ] && source ~/.zshrc.local
```

凭据放 `~/.ssh`、系统钥匙串或环境变量，仓库只存读取它们的代码。把 `.env` 加进 `.gitignore` 只是最低要求，历史提交里的密钥仍然要当作已泄露。

## 改了不生效

最常见的原因是改完没重新加载。`source ~/.zshrc` 只影响当前 shell，新开窗口才会走完整启动链；另一种是文件被放错层，写在 `.bashrc` 里的 `PATH` 在登录 shell 里可能根本没执行，反过来把慢命令写进 `.zshenv`，每个子进程都要付一次代价。

第三种是软链被替换。部分程序保存配置时先写临时文件再 `rename`，结果是普通文件覆盖了软链，仓库从此和实际配置脱节。定期在仓库里 `git status`，看到「没有改动但行为变了」就检查 `ls -l`。
