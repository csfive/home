---
title: 计时与资源监控
description: MIT Missing Semester 第 3 讲 · 计时与资源监控
---

# 计时与资源监控

程序慢，先分清是 CPU 算得慢、I/O 等得久，还是根本没在跑。计时和监控给出第一手证据。

## real、user、sys

```bash
time curl -s https://missing.csail.mit.edu > /dev/null
```

```text
real    0m0.272s
user    0m0.079s
sys     0m0.028s
```

| 指标 | 含义                   | 变大说明           |
| ---- | ---------------------- | ------------------ |
| real | 墙钟时间，从开始到结束 | 等待、阻塞、调度   |
| user | 用户态 CPU 时间        | 计算密集           |
| sys  | 内核态 CPU 时间        | 系统调用、I/O 密集 |

`real` 远大于 `user + sys`，说明程序大部分时间在等：网络、磁盘、锁、定时器。反过来，多线程程序里 `user + sys` 可以超过 `real`，因为多个核在并行计时。

bash 的 `time` 是关键字，`/usr/bin/time -v` 才能给出最大内存驻留等更多信息。

- 跑得太快的命令会被启动开销主导，测的是 shell 而不是逻辑
- 这时把循环放进程序内部，或用 `hyperfine` 多次采样
- 更高精度用 `clock_gettime(CLOCK_MONOTONIC)` 打点
- 它不受系统时间调整影响，适合测事件间隔
- `sys` 高说明系统调用多，不一定是 I/O 慢

## 进程与资源

| 工具      | 看什么            | 常用操作                      |
| --------- | ----------------- | ----------------------------- |
| `htop`    | CPU、内存、进程树 | `F6` 排序，`t` 树形，`H` 线程 |
| `iotop`   | 进程级磁盘 I/O    | 需要 root                     |
| `free -h` | 内存总量与可用量  | 看 `available` 而不是 `free`  |
| `lsof`    | 进程打开的文件    | `lsof -p PID`、`lsof /path`   |
| `ss`      | 套接字与连接      | `ss -tlnp`                    |
| `nethogs` | 进程级网络带宽    | 按进程排序                    |
| `iftop`   | 连接级网络流量    | 按主机聚合                    |

`free` 的 `free` 列很小是正常的，页缓存会占满内存；`available` 才是还能给新进程用的量。

`htop` 里的 CPU 百分比是采样区间内的占用率，不是累计值。看到某个核 100% 时，再按 `H` 确认是哪个线程在跑，而不是进程里所有线程一起忙。

- 容器里的 CPU 和内存受 cgroup 限制，`free` 显示的是宿主机
- `pidstat 1` 按进程打印 CPU、内存和 I/O 增量
- `iostat -xz 1` 看磁盘利用率和等待队列
- `vmstat 1` 的 `r` 列长期大于核数，说明进程在排队
- `htop` 的 `F5` 也能切换树形视图

## 端口被占用

```bash
python -m http.server 4444
ss -tlnp | grep 4444
kill <PID>
```

`ss` 的四个字母分别是 TCP、监听、数字端口、进程。macOS 上没有 `ss`，用 `lsof -i :4444`。

没有权限看别的用户的进程时，`ss` 的进程列会是空的，加 `sudo` 再试。

- 端口被占但找不到进程，可能是 `TIME_WAIT` 或另一个 namespace
- `ss -s` 汇总各状态连接数
- `ss -tan state time-wait` 只列 `TIME_WAIT`
- 这个状态通常几十秒后自动消失，不需要手工清理
- macOS 上直接 `lsof -i :4444` 最快

## 把数据画出来

数字表格看不出趋势，画图能一眼看到周期性尖峰和拐点。

- 日志按 `timestamp,value` 输出 CSV，一行一个采样
- 不要在日志里写自然语言句子，解析成本高
- 一次只画一个指标，避免双 Y 轴误读

```bash
# latency.csv: 1705012345,42.5
gnuplot -e "set datafile separator ','; plot 'latency.csv' using 1:2 with lines"
```

```python
import matplotlib.pyplot as plt
import pandas as pd

df = pd.read_csv("latency.csv", names=["ts", "ms"])
df["time"] = pd.to_datetime(df["ts"], unit="s")
df.plot(x="time", y="ms", linewidth=0.5)
plt.show()
```

`ggplot2` 的分面（facet）适合按接口、机器或时段拆开看。整体 P99 变差，可能只是某一个接口退化。

- 采样间隔决定能看到什么，一分钟一个点看不到毫秒抖动
- 看尾延迟就按请求记录原始值，再算分位数
- 导出 CSV 统一时间格式，别混用本地时间和 UTC
- 数值不要带千位分隔符，否则按逗号切列会错位
- 周期性尖峰通常来自定时任务、GC 停顿或备份窗口
- gnuplot 的 `using 1:2` 表示第 1 列作 X、第 2 列作 Y

## 常见坑

- 只看平均值，忽略长尾；P99 才是用户感受到的延迟
- 在开发机上计时，后台还在跑构建或同步
- 用 `time` 测一个已经被页缓存的命令，结果偏快
- 把 `free` 列当成「内存不足」，实际只是缓存
- 多线程程序里用 `real` 判断 CPU 用量，忽略了并行
- 在容器里用宿主机的监控数字，忽略了 cgroup 限额
- 把 `sys` 高当成用户代码慢，实际是系统调用太频繁
- 在虚拟机里计时，把宿主的调度抖动算到程序头上
- 只测 CPU 时间，忽略了真实用户等待的墙钟时间
- `time` 的输出默认走 stderr，脚本里要用 `2>` 接
- `/usr/bin/time -v` 的 `Maximum resident set size` 是峰值 RSS
- `real` 包含进程启动和退出，短命令里占比很高
- `user` 与 `sys` 只统计真正占用 CPU 的时间
- 看长尾时用 p95、p99，最大值容易被单次异常拉高
- 单次 `time` 误差大，重复跑取中位数
