---
title: 调试与性能分析
description: MIT Missing Semester 第 3 讲 主题清单
---

# 调试与性能分析

[第 3 讲 · Debugging and Profiling](https://missing.csail.mit.edu/2026/debugging-profiling/ 'MIT Missing Semester 第 3 讲：视频、讲义和课后练习')

[课后练习答案](https://github.com/csfive/missing-semester/tree/main/03-debugging-profiling '非官方，仅供参考')

## [调试与日志](/ms/03/debugging-and-logging)

- 程序执行的是写下的代码，不是你的预期
- 最小可复现示例
- 二分注释代码与二分输入
- 在边界打印参数验证假设
- `print` 只输出中间状态
- 日志级别 `DEBUG`、`INFO`、`WARN`、`ERROR`
- 按级别过滤，运行时开关
- 日志分流到文件、stderr、syslog
- 结构化日志：JSON Lines
- 时间戳与 `request_id`
- 惰性格式化 `log.debug("%s", x)`
- 修完后把 `print` 改成 `log.debug`
- `-v`、`-vv` 提高详细度
- `/var/log` 与 `journalctl -u`
- 第三方库的调试环境变量
- LLM 解释报错与崩溃栈

## [调试器](/ms/03/debuggers)

- 调试器与 `print` 的适用边界
- 不知道打印什么时用调试器
- 启动慢、状态难重建的程序
- `gdb` 与 `lldb` 调试原生二进制
- `-g` 生成 DWARF 调试信息
- `run`、`break`、`continue`
- `step` 与 `next`
- `finish` 跑完当前函数
- `print`、`info locals`
- `bt` 与 `frame N`
- 条件断点 `break ... if`
- `watch` 观察变量写入
- `gdb -tui` 与 `Ctrl-x a`
- core 文件与 `coredumpctl`
- `-fno-omit-frame-pointer`
- `pdb`、`debugpy`、`jdb`

## [记录回放调试](/ms/03/record-replay)

- Heisenbug：一观察就消失
- 加 `print` 后不再复现
- 竞态与时序依赖
- 记录执行，确定性重放
- `rr record` 与 `rr replay`
- 重放直接进入 GDB
- `reverse-continue` 反向运行
- `reverse-step` 与 `reverse-next`
- `reverse-finish` 反向出栈
- watchpoint 回追写入
- 仅支持 Linux
- 依赖硬件性能计数器
- 云主机与 GPU 的限制
- 线程调度被序列化
- 多次录制抓间歇失败
- macOS 上的 Warpspeed

## [系统调用与追踪](/ms/03/tracing)

- 系统调用是程序与内核的边界
- `strace ./prog`
- `-e trace=file` 与 `trace=network`
- `-f` 跟随子进程
- `-p PID` 附加到运行中进程
- `-T` 显示单次调用耗时
- `-c` 汇总次数与时间
- 返回值与 `errno`
- macOS 的 `dtruss` 与 SIP
- eBPF 与 `bpftrace` 的 `tracepoint:syscalls:*`
- `@[probe] = count()` 聚合
- 按 `comm`、`pid`、`cpid` 过滤
- `bcc` 的 `opensnoop`、`biosnoop`
- `tcpdump -i any port 80`
- `-w` 存 pcap 交给 Wireshark
- HTTPS 用 `mitmproxy` 或浏览器面板

## [内存错误](/ms/03/memory-errors)

- 越界、use-after-free、泄漏
- 错误延迟到远处才崩溃
- Sanitizer 是编译期插桩
- `-fsanitize=address`
- ASan 抓堆、栈、全局越界
- ASan 的分配栈与释放栈
- `-fsanitize=thread` 抓数据竞争
- `-fsanitize=memory` 抓未初始化读取
- `-fsanitize=undefined` 抓未定义行为
- ASan 与 TSan 不能同时开
- MSan 需要全量插桩
- Valgrind 无需重编译
- `--leak-check=full`
- `definitely lost` 与 `still reachable`
- `ASAN_OPTIONS=halt_on_error=1`
- sanitizer 构建进 CI

## [计时与资源监控](/ms/03/timing-and-monitoring)

- `time` 的 real、user、sys
- real 包含等待时间
- 多线程下 user + sys 可超过 real
- real 远大于 CPU 时间说明在等 I/O
- `/usr/bin/time -v`
- `htop` 的 `F6`、`t`、`H`
- `iotop` 看进程级磁盘 I/O
- `free -h` 看 `available`
- `lsof` 查打开的文件
- `ss -tlnp` 查监听端口
- `lsof -i :8080`
- `nethogs` 与 `iftop`
- 日志输出 `timestamp,value` CSV
- `gnuplot -e` 直接画线
- `matplotlib` 与 `ggplot2` 分面
- 周期性尖峰与 GC 停顿

## [CPU 性能分析](/ms/03/cpu-profiling)

- 采样 profiler 与追踪 profiler
- 采样开销低，适合生产
- 追踪记录每次调用，精确但慢
- `perf stat` 总览硬件计数器
- `insn per cycle` 与 `branch-misses`
- `perf record -g` 记录调用栈
- `perf report` 与 `perf script`
- `stackcollapse-perf.pl` 生成火焰图
- 火焰图 X 轴是样本占比
- 火焰图 Y 轴是调用深度
- 颜色无语义，左右不是时间
- `perf_event_paranoid` 权限
- `valgrind --tool=callgrind`
- `callgrind_annotate`、`kcachegrind`
- `cProfile`、`py-spy`、`pprof`
- `cargo flamegraph`、`taskset`

## [内存分析与基准测试](/ms/03/memory-profiling-and-benchmarking)

- Massif 采样堆使用量
- `valgrind --tool=massif`
- `ms_print` 看曲线与快照
- 峰值不回落不等于泄漏
- `memory-profiler` 逐行分析
- `@profile` 只在对应模块生效
- `hyperfine` 多次测量
- `--warmup` 预热缓存
- `--prepare` 重置状态
- `--runs` 与 `--export-json`
- 均值、标准差与极值
- 微基准不等于真实负载
- 后台噪声与 CPU 降频
- DevTools Performance 面板
- Firefox Profiler
- 优化后重跑基准

## [容易混淆的问题](/ms/03/pitfalls)

- `print` 与 logging 该选哪个
- 日志该写 stdout 还是 stderr
- `gdb` 断点为什么没停
- `watch` 与条件断点有什么区别
- rr 为什么录不出竞态
- `strace` 与 `bpftrace` 怎么选
- ASan、Valgrind、Massif 分别查什么
- `user + sys` 超过 `real` 正常吗
- 火焰图能看出调用先后顺序吗
- 采样 profiler 会漏掉什么
