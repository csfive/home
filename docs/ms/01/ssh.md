---
title: 远程机器
description: MIT Missing Semester 第 1 讲 · SSH、密钥与文件传输
---

# 远程机器

SSH 既是登录工具，也是把命令、文件、端口带到另一台机器上的通道。

## 执行命令

| 写法                     | 在哪里执行            |
| ------------------------ | --------------------- |
| `ssh host ls`            | 远端 `ls`，本地不展开 |
| `ssh host 'ls \| wc -l'` | 整条管道在远端        |
| `ssh host "ls $dir"`     | 本地先展开 `$dir`     |
| `ssh -t host cmd`        | 分配伪终端            |

引号归属是这里最容易错的地方：双引号本地展开，单引号远端展开。

## 密钥

```bash
ssh-keygen -a 100 -t ed25519
ssh-copy-id -i ~/.ssh/id_ed25519.pub alice@host
```

| 项          | 要求                          |
| ----------- | ----------------------------- |
| 私钥权限    | 600                           |
| `.ssh` 目录 | 700                           |
| 公钥位置    | 远端 `~/.ssh/authorized_keys` |
| 主机指纹    | 首次连接写入 `known_hosts`    |
| passphrase  | 用 `ssh-agent` 缓存           |

权限或指纹检查不通过时，ssh 会直接拒绝连接，不会降级成警告。

## config

```ini
Host vm
    User alice
    HostName 172.16.174.141
    Port 2222
    IdentityFile ~/.ssh/id_ed25519
```

| 字段            | 作用           |
| --------------- | -------------- |
| `Host`          | 别名，支持通配 |
| `HostName`      | 真实地址       |
| `User` / `Port` | 登录信息       |
| `IdentityFile`  | 私钥路径       |
| `LocalForward`  | 本地端口转发   |
| `ControlMaster` | 复用连接       |

`scp`、`rsync`、`mosh` 都读这份配置。

## 传文件

| 工具    | 特点                 |
| ------- | -------------------- |
| `scp`   | 简单，整文件复制     |
| `rsync` | 增量、可续传、可排除 |
| `mosh`  | 断线恢复，UDP        |

传目录和传文件只差一个结尾的斜杠，但结果完全不同。

```bash
rsync -av --partial src/ host:/srv/app/
```

`src/` 复制目录内容，`src` 复制目录本身。

## 端口与跳板

```bash
ssh -N -f -L 9999:localhost:8888 vm
ssh -J jump host
```

| 选项 | 作用         |
| ---- | ------------ |
| `-L` | 本地端口转发 |
| `-R` | 远端端口转发 |
| `-D` | SOCKS 代理   |
| `-J` | 经过跳板机   |
| `-N` | 不执行命令   |
| `-f` | 后台运行     |

没有 tty 的环境不会分配伪终端，需要交互时加 `-t`。
