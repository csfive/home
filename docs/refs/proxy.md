# Cross the Wall

- [一个链接](https://feiniaoyun01.life/#/register?code=W6Oo9meK)
- [Scoop](/refs/scoop)，Clash 软件推荐在 Scoop 搜索安装
- [Continuation of Clash Verge](https://github.com/clash-verge-rev/clash-verge-rev)，一个基于 Tauri 的 GUI
- [clash 中文网](https://clashcn.com/clash), 备用软件下载

## WSL

粘贴到 `.bashrc` 或者 `.zshrc` 或者别的什么配置文件里：

```shell
host_ip=$(cat /etc/resolv.conf | grep "nameserver" | cut -f 2 -d " ")
export all_proxy=http://$host_ip:7890
export http_proxy=http://$host_ip:7890
export https_proxy=http://$host_ip:7890
```

## PowerShell

PowerShell 的配置文件路径是变量 `$PROFILE`，复制到该文件：

```powershell
$env:http_proxy="http://127.0.0.1:7890"
$env:https_proxy="http://127.0.0.1:7890"
```

如果没有该配置文件，使用以下命令自动创建：

```powershell
if (-not (Test-Path $profile)) {
  New-Item -ItemType File -Path (Split-Path $profile) -Force -Name (Split-Path $profile -Leaf)
}
```
