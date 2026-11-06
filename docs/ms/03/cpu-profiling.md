---
title: CPU 性能分析
description: MIT Missing Semester 第 3 讲 · CPU 性能分析
---

# CPU 性能分析

优化之前先找热点。CPU profiler 回答的是「时间花在哪些函数上」，而不是「哪里写得丑」。

## 采样与追踪

| 类型 | 做法                     | 优点               | 缺点                 |
| ---- | ------------------------ | ------------------ | -------------------- |
| 采样 | 每隔一段时间抓一次调用栈 | 开销低，可用于生产 | 看不到极短的函数     |
| 追踪 | 记录每次函数进入和退出   | 调用次数精确       | 开销大，程序明显变慢 |

采样频率常见 99Hz 到 1kHz，也就是 10ms 到 1ms 抓一次。抓到的样本按调用栈聚合，宽度就代表占比。

采样有统计偏差：调用次数多但每次很短的函数容易漏掉，被内联的函数则算在调用者头上。看到热点后，回到源码确认它是不是真的做了那么多工作。

- 采样只记录「正在 CPU 上运行」的时刻
- 阻塞在网络、锁或磁盘上的时间不会出现，属于 off-CPU 分析
- 采样 profiler 适合生产，追踪 profiler 适合离线精确定位
- 没有符号时采样只能看到地址，先编译 `-g`

## perf

Linux 上的标准工具，不需要改代码。

```bash
perf stat ./slow
perf record -g ./slow
perf report
```

`perf stat` 给出硬件计数器总览：

| 计数器           | 含义                         |
| ---------------- | ---------------------------- |
| `task-clock`     | 占用的 CPU 时间              |
| `cycles`         | CPU 周期数                   |
| `instructions`   | 执行的指令数                 |
| `insn per cycle` | 每周期指令数，衡量流水线效率 |
| `branch-misses`  | 分支预测失败比例             |
| `page-faults`    | 缺页次数                     |

- `insn per cycle` 远低于 1，往往是在等内存或分支预测失败
- `perf record -g` 记录调用栈，`perf report` 交互查看
- `perf script` 导出文本，`perf report --stdio` 适合终端
- `perf top` 实时看系统级热点
- 分析运行中的服务用 `perf record -p PID -F 99 -- sleep 30`
- `perf stat -r 5` 重复五次，减小单次波动

`perf` 受 `kernel.perf_event_paranoid` 限制，值越大权限越紧。指定事件用 `perf stat -e cache-misses,branch-misses ./prog`，事件名用 `perf list` 查。

## 火焰图

```bash
perf script | stackcollapse-perf.pl | flamegraph.pl > flamegraph.svg
```

| 看图规则 | 说明                     |
| -------- | ------------------------ |
| X 轴宽度 | 该函数在样本中出现的比例 |
| Y 轴     | 调用深度，下面是调用者   |
| 顶层宽块 | 优先优化的热点           |
| 颜色     | 随机配色，没有含义       |
| 左右顺序 | 不表示时间先后           |

火焰图不是时间轴。要看时间顺序，用 trace timeline，例如 Perfetto 或 Speedscope 的 time order 视图。

- 一个宽块可能是「自己算得久」，也可能只是调用了很多子函数
- 点进去看它下面有没有更窄的帧，没有子帧的宽块才是真正的工作量
- `stackcollapse-perf.pl` 和 `flamegraph.pl` 来自 Brendan Gregg 的 FlameGraph 仓库
- 折叠文本是「分号分隔的调用栈 + 计数」，也可以直接交给 Speedscope
- 优化前后各录一份，用 `difffolded.pl` 生成差分火焰图，红色变慢、蓝色变快
- 看顶层宽块之前，先确认程序确实在算而不是在等

## 精确计数

需要调用次数而不是采样估计时，用 Callgrind：

```bash
valgrind --tool=callgrind ./prog
callgrind_annotate callgrind.out.12345
kcachegrind callgrind.out.12345
```

它记录完整的调用关系和指令数，支持 `--cache-sim=yes` 模拟缓存行为，代价是程序慢几十倍。

- `Inclusive` 包含被调用函数，`Self` 只算函数自身
- 优化前看 `Self`，看调用关系时看 `Inclusive`
- 默认输出文件名带进程号，用 `--callgrind-out-file=out.%p` 显式命名
- 跑多次时保留每次结果，再横向比较
- `callgrind_annotate` 的文本报告适合放进 CI 日志

| 语言           | 工具                        |
| -------------- | --------------------------- |
| Python         | `cProfile`、`py-spy`        |
| Go             | `go tool pprof`             |
| Rust / C / C++ | `cargo flamegraph`、`perf`  |
| 任意编译产物   | `valgrind --tool=callgrind` |

`py-spy` 可以附加到运行中的 Python 进程，不必改代码；权限受限时需要 `sudo`。Go 的 `pprof` 同时提供 CPU、堆和 goroutine 视图，采样数据可以用 `go tool pprof -http=:8080` 在浏览器里看。

## 常见坑

- 在 `-O0` 构建上做性能分析，热点和线上完全不同
- 采样到的是「等待」，火焰图看起来全是 `pthread_cond_wait`
- 只看单次运行，忽略缓存冷热和 CPU 频率变化
- 用 `taskset --cpu-list 0,2 stress -c 3` 时，疑惑为什么只用了两个核
- 把火焰图左右顺序当成执行顺序
- 在生产环境用追踪 profiler，把服务拖慢到不可用
- 只优化最宽的帧，却没确认那部分代码是否真的可以改
- 用采样结果推断调用次数，短函数会被系统性低估
- 忽略采样频率，99Hz 和 1kHz 能看到的细节并不一样
- 把采样占比当成绝对耗时，它只说明相对分布
- `perf record` 需要符号才能显示函数名，否则只有地址
