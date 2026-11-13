---
title: 开发环境与工具
description: MIT Missing Semester 第 2 讲 主题清单
---

# 开发环境与工具

[第 2 讲 · Development Environment and Tools](https://missing.csail.mit.edu/2026/development-environment/ 'MIT Missing Semester 第 2 讲：视频、讲义和课后练习')

[课后练习答案](https://github.com/csfive/missing-semester/tree/main/02-development-environment '非官方，仅供参考')

## [编辑器与 IDE](/ms/02/editors)

- 开发环境 = 编辑 + 高亮 + 检查 + 格式化 + 补全
- 编辑器只管文本，其余能力靠插件
- IDE 把这一整套聚合进一个应用
- VS Code 是编辑器加扩展市场
- 终端工作流：tmux、Vim、zsh 加语言工具
- GUI 优势：开箱即用、AI 补全集成好
- 终端优势：轻量，无 GUI 也能干活
- 装不了软件的机器上只剩终端
- Vim mode 在编辑器、Shell、AI 工具里都有
- 终端侧工具：`ruff`、`mypy`、`gopls`
- 编辑器不负责构建、运行与部署
- `code .` 从当前目录打开项目

## [Vim 的模式与移动](/ms/02/vim-modes)

- 模式决定同一个按键的含义
- Normal、Insert、Replace、Visual、Command-line
- `<ESC>` 从任何模式回到 Normal
- `i`、`R`、`v`、`V`、`<C-v>`、`:` 进入各模式
- 左下角显示模式，启动默认 Normal
- 不用鼠标，也不用方向键
- `hjkl` 是基本位移
- 键位按助记命名：`w` 是 word、`b` 是 back
- `w`、`b`、`e` 按词移动
- `0`、`^`、`$` 定位行内
- `H`、`M`、`L` 定位屏幕
- `<C-u>`、`<C-d>` 上下翻半屏
- `gg`、`G` 到文件首尾，`{n}G` 跳到指定行
- `%` 在配对括号间跳转
- `f{char}`、`t{char}` 行内查找，`;`、`,` 重复
- `/{regex}` 搜索，`n`、`N` 前后跳
- Caps Lock 映射成 Escape

## [Vim 的编辑语法](/ms/02/vim-editing)

- 动词加名词构成一条编辑命令
- `d{motion}`、`c{motion}`、`y{motion}`
- `dw`、`d$`、`d0` 的范围差异
- `cw` 等于删除后进入 Insert
- `x` 等于 `dl`，`s` 等于 `cl`
- `o`、`O` 在下方、上方开新行
- `p` 粘贴，`u` 撤销，`<C-r>` 重做
- `~` 切换大小写，`J` 合并两行
- 计数：`3w`、`5j`、`7dw`
- 文本对象：`i` 指内部，`a` 含边界
- `ci(`、`ci[`、`ci"`、`da'`
- Visual 选中后直接 `d` 或 `c`
- `.` 重复上一次修改
- `:%s/old/new/g` 全文替换
- 宏：`q` 录制，`@` 回放
- `vimtutor` 自带教程，VimGolf 练手

## [代码智能与语言服务器](/ms/02/language-servers)

- LSP：编辑器与语言服务之间的协议
- 传输用 JSON-RPC，走 stdio 或 socket
- 补全、悬停文档、跳转定义
- 查找引用、整理 import、实时诊断
- 保存时自动补 import
- 格式化与类型检查也常由 server 提供
- VS Code 的 Python 扩展依赖 Pylance
- Go 扩展依赖 `gopls`
- 其他：`rust-analyzer`、`clangd`、`typescript-language-server`
- 项目级配置：指向解释器与虚拟环境
- 没装依赖时补全退化成猜
- `ruff check` 与 `ruff format` 管风格
- `mypy` 做静态类型检查
- Neovim 用 `vim.lsp.enable` 启用 server
- `:checkhealth` 查 server 是否挂上
- LSP 管语言智能，DAP 管调试

## [AI 辅助开发](/ms/02/ai-coding)

- 三种形态：补全、行内对话、编码 agent
- 补全只在光标之后生成
- 补全也会建议先移动光标
- 注释是补全的提示词
- 函数名与 docstring 决定补全质量
- 行内对话能改已经写下的代码
- 行内对话只改选区，跨位置改动交给 agent
- 模型在云端推理，离线只能用小模型
- 选中代码块再描述意图
- agent 跨文件读写并执行命令
- Copilot 与 Cursor 是常见入口
- 学生和开源维护者可免费使用 Copilot
- 补全常把 `import` 塞进函数体
- 生成代码的来源与许可证要确认

## [dotfiles 与配置同步](/ms/02/dotfiles)

- 点开头文件默认隐藏，`ls -a` 可见
- `~/.zshenv` 每次启动 zsh 都读
- `~/.zshrc` 只给交互式 shell
- bash 的 `.bashrc` 与 `.bash_profile`
- `~/.config` 与 `$XDG_CONFIG_HOME`
- `~/.config/nvim/init.lua`
- VS Code 的 `settings.json`、`keybindings.json`
- 软链到仓库：`ln -s`
- GNU stow 按目录批量软链
- chezmoi 处理模板与机器差异
- bare repo：`git --git-dir=$HOME/.dotfiles`
- `.gitignore` 排掉机器私有配置
- 改完要 `source ~/.zshrc` 才生效
- 有的程序保存配置会替换软链

## [终端复用](/ms/02/multiplexer)

- session、window、pane 三层
- `tmux new -s work` 建会话
- `tmux ls` 列表，`tmux a -t work` 接入
- `tmux new -A -s work` 有则接入无则新建
- `<C-b> d` 分离，进程继续跑
- `<C-b> c` 新建 window，`<C-b> 0`…`9` 切换
- `<C-b> %` 左右分屏，`<C-b> "` 上下分屏
- `<C-b> z` 放大当前 pane
- `<C-b> [` 进入复制模式
- `<C-b> x` 关闭 pane
- `tmux send-keys` 把命令送进会话
- `setw synchronize-panes` 同步输入
- `~/.tmux.conf` 与 `set -g mouse on`
- 断线后重新 attach 接着用
- 与 `nohup` 的分工：一个能交互，一个不能

## [远端开发](/ms/02/remote-dev)

- 编辑器拆成 UI 与扩展宿主两半
- UI 在本地，扩展与终端在远端
- Remote SSH 在远端装 `~/.vscode-server`
- 远端要能跑 shell 并能联网下载
- 端口自动转发回本地
- dev container 用镜像固定工具链
- `devcontainer.json` 描述镜像与初始化
- `postCreateCommand` 在启动后装依赖
- 容器内开发，宿主机保持干净
- 纯终端方案：`ssh` 加 tmux
- `mosh` 抗断线与高延迟
- `rsync` 同步，`sshfs` 挂载
- Live Share 做实时协同编辑
- 远端与本地架构不同要重新编译
- 大仓库要调 `inotify` 上限
- 私钥留在本地，用 agent 转发

## [容易混淆的问题](/ms/02/pitfalls)

- Normal 模式的 `x` 与 Insert 模式的 `x`
- `dw` 与 `dd` 删的范围一样吗
- `ciw` 与 `ci(` 该用哪个
- 装了语言服务器为什么补全还是错
- formatter、linter、类型检查各管什么
- 补全、行内对话、agent 的权限边界
- `<C-b> d` 与直接关窗口的区别
- 远端开发时文件到底在哪台机器上
- 改了 `.zshrc` 为什么没生效
- tmux 里按 `C-b` 为什么没反应
