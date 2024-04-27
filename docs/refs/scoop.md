# Scoop

- [Scoop](https://scoop.sh/#/)，一款还算好用的 windows 软件包管理工具
- [Proxy](/refs/proxy)，提高下载速度
- [chawyehsu/dorado](https://github.com/chawyehsu/dorado)，一个 Star 挺多的非官方的 Bucket

## Tips

```powershell
# 更新所有 app
scoop update *

# 清除老版本
scoop cleanup *
```

## My List

```powershell
> scoop bucket list

Name             Source                                        Updated            Manifests
----             ------                                        -------            ---------
main             https://github.com/ScoopInstaller/Main        2024/4/27 8:33:23       1317
extras           https://github.com/ScoopInstaller/Extras      2024/4/27 8:35:50       2013
versions         https://github.com/ScoopInstaller/Versions    2024/4/27 9:32:16        451
nonportable      https://github.com/ScoopInstaller/Nonportable 2024/4/26 20:55:31       127
java             https://github.com/ScoopInstaller/Java        2024/4/24 0:17:58        273
chawyehsu_dorado https://github.com/chawyehsu/dorado           2024/4/27 8:12:49        256
```

```powershell
> scoop list
Installed apps:

Name              Version              Source           Updated             Info
----              -------              ------           -------             ----
7zip              23.01                main             2024-02-17 13:51:26
autodarkmode      10.4.1.1             dorado           2024-03-12 19:29:14
bandizip6         6.29                 versions         2024-02-18 20:55:51
bilibili-livehime 5.4.2.6774           chawyehsu_dorado 2024-04-27 13:36:43
bun               1.1.5                main             2024-04-27 11:08:37
dark              3.14                 main             2024-03-02 18:34:34
fnm               1.35.1               main             2024-02-28 01:03:00
fzf               0.50.0               main             2024-04-18 18:45:53
geekuninstaller   1.5.2.165            extras           2024-02-18 18:56:46
gh                2.48.0               main             2024-04-18 18:45:56
gifcam            7.0                  extras           2024-02-18 21:59:20
git               2.44.0               main             2024-03-01 20:55:35
go                1.22.2               main             2024-04-04 13:50:21
googlechrome      124.0.6367.92        extras           2024-04-27 11:08:59
honeyview         5.51                 extras           2024-03-17 16:26:09
idea-ultimate     2024.1-241.14494.240 extras           2024-04-25 00:52:29
innounp           0.50                 main             2024-04-27 13:35:44
lsd               1.1.2                main             2024-03-26 20:51:41
neofetch          7.1.0                main             2024-03-12 19:13:28
obsidian          1.5.12               extras           2024-04-02 23:27:55
playnite          10.33                extras           2024-04-18 18:46:31
potplayer         240305               extras           2024-03-05 19:46:04
psreadline        2.3.5                extras           2024-04-04 19:08:39
qqnt              9.9.9.240422         dorado           2024-04-23 21:59:36
runcat            2.0                  extras           2024-03-03 19:50:18
rust              1.77.2               main             2024-04-10 18:53:43
rye               0.33.0               main             2024-04-27 11:09:04
sumatrapdf        3.5.2                extras           2024-02-18 21:30:08
temurin21-jdk     21.0.3-9.0           java             2024-04-19 22:44:50
temurin8-jdk      8.0.412-8            java             2024-04-21 00:13:26
utools            4.0.1                dorado           2024-03-12 19:25:51
vscode            1.88.1               extras           2024-04-12 18:10:23
wechat            3.9.10.19            extras           2024-04-18 18:48:10
zoxide            0.9.4                main             2024-03-26 21:17:53
```
