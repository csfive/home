---
title: 远程机器
description: MIT Missing Semester 第 1 讲 · SSH、密钥与文件传输
---

# 远程机器

`ssh user@host` 打开一个远端 Shell，连接本身是加密的。它也可以只跑一条命令：`ssh host ls` 把远端 `ls` 的输出带回来，`ssh host 'ls | wc -l'` 则在远端执行整条管道。区别在于引号归谁解释：不带引号时，本地 Shell 先展开并切词，再交给远端；带引号时，整串原样送过去。需要本地变量先展开时，用双引号；需要远端展开时，用单引号。

```bash
dir=/tmp
ssh host "ls $dir"        # 本地展开，远端看到 ls /tmp
ssh host 'ls $dir'        # 远端展开
ssh host 'ls | wc -l'     # 整条管道在远端执行
```

密码登录不如密钥。`ssh-keygen -a 100 -t ed25519` 生成一对密钥，私钥留在本地，公钥用 `ssh-copy-id` 追加到远端的 `~/.ssh/authorized_keys`。服务端只认公钥，客户端用私钥证明自己持有对应的秘密，全程不传私钥。私钥文件权限必须是 600，目录是 700，否则 `ssh` 会拒绝使用；`known_hosts` 记录第一次连接时服务端的指纹，换机器或重装后会报警。

`~/.ssh/config` 给主机起别名并预设参数：

```ini
Host vm
    User alice
    HostName 172.16.174.141
    Port 2222
    IdentityFile ~/.ssh/id_ed25519
```

`Host` 支持通配，`Host *.mit.edu` 可以给一整批机器设默认值。`scp`、`rsync`、`mosh` 都读这份配置。私钥有 passphrase 时，`ssh-agent` 负责在会话里缓存解密后的密钥，`ssh-add` 把密钥加进去，不用每次输入。

`scp` 和 `rsync` 都能传文件。`rsync` 比 `scp` 多做了增量判断，还支持 `--partial` 续传、`--exclude` 排除和 `-a` 保留权限时间；源路径末尾有没有 `/` 含义不同，`src/` 复制目录内容，`src` 复制目录本身。

```bash
rsync -av --partial src/ host:/srv/app/
```

需要转发端口时，`LocalForward 9999 localhost:8888` 把本地端口接到远端服务上，配合 `ssh -N -f` 可以在后台只做转发、不开 Shell。`-R` 是反方向，`-D` 提供一个 SOCKS 代理。跳板机可以用 `-J jump host`，或者多级 `ProxyJump`。

连接本身也能复用：`ControlMaster auto` 加 `ControlPath` 让后续的 `ssh`、`scp` 走已经建立的连接，省掉重复握手，批量操作快很多。

[`mosh`](https://mosh.org/) 是 SSH 的替代品，网络切换或休眠后能恢复会话，适合移动环境；它在 UDP 上自己维护状态，代价是首次连接和端口转发不如 ssh 通用。

远端没有图形界面时，`ssh -X` 可以转发 X11，但现在更常见的是本地编辑器配 SSH 插件，或者直接 `code --remote`。没有 tty 的命令（CI、脚本）不会分配伪终端，需要交互时加 `-t`。
