---
title: 内存分析与基准测试
description: MIT Missing Semester 第 3 讲 · 内存分析与基准测试
---

# 内存分析与基准测试

内存错误和内存用量是两件事。前者让程序出错，后者让程序被 OOM 杀掉，或者拖慢整台机器。

## 堆内存曲线

Massif 采样堆的分配量，画出随时间变化的曲线。

```bash
valgrind --tool=massif ./prog
ms_print massif.out.12345
```

`ms_print` 输出一张 ASCII 曲线和若干快照，每个快照列出当时的分配栈。看三件事：

- 峰值出现在哪一段
- 峰值之后有没有回落
- 哪条分配路径占了最大份额

不回落不代表泄漏：缓存、连接池、预分配都会长期占住内存。泄漏的特征是「只增不减，并且与输入规模成正比」。

- `--time-unit=B` 改成按字节记录，适合跨机器比较分配行为
- `--massif-out-file=massif.%p` 分开保存两次运行，再分别 `ms_print`
- 采样有开销，长跑程序会自动拉大采样间隔
- 分配栈按调用路径聚合，先看最宽的那条
- 横轴可以按时间或字节，读图前先确认单位
- 对比两个版本的曲线，比只看单个峰值更能说明问题

| 工具              | 作用                       | 是否需要重编译 |
| ----------------- | -------------------------- | -------------- |
| Massif            | 堆使用随时间变化           | 否             |
| Valgrind memcheck | 非法访问与泄漏             | 否             |
| ASan / LSan       | 越界、use-after-free、泄漏 | 是             |
| `memory-profiler` | Python 逐行内存            | 否             |

- Massif 只看堆，不统计栈、全局区和 mmap 的大块映射
- RSS 涨了但曲线平，问题可能在栈、线程栈或内存映射文件

## Python 逐行分析

```bash
pip install memory-profiler
python -m memory_profiler app.py
```

```python
from memory_profiler import profile

@profile
def load(path):
    rows = [line.split(",") for line in open(path)]
    return rows
```

输出每行的增量（`Increment`）和当前总量（`Memory usage`）。增量大的那几行就是优化目标。

`@profile` 是 `memory-profiler` 注入的名字，不需要自己定义，但只在用 `-m memory_profiler` 运行时生效。

- 逐行模式会拖慢程序，长时间任务改用 `mprof run` 与 `mprof plot`
- `Increment` 为负可能只是对象回到内存池，不代表归还给操作系统
- `mprof` 生成的是时间曲线，适合看泄漏趋势
- `%memit` 可以只测一行语句的峰值
- 解释曲线时区分「解释器持有」和「进程实际占用」

## hyperfine

比较两个实现，不要靠一次 `time`。

```bash
hyperfine --warmup 3 'fd -e jpg' 'find . -iname "*.jpg"'
hyperfine --warmup 3 --runs 20 --prepare 'sync' './build/a' './build/b'
```

| 选项            | 作用                     |
| --------------- | ------------------------ |
| `--warmup N`    | 先跑 N 次，预热缓存      |
| `--runs N`      | 正式测量的次数           |
| `--prepare CMD` | 每次测量前执行，重置状态 |
| `--shell=none`  | 跳过 shell，减少启动开销 |
| `--export-json` | 导出结果做后续分析       |

输出包含均值、标准差、最小值和最大值。标准差很大时，先查环境噪声，不要急着下结论。

`hyperfine` 会给两个命令做统计比较，但样本量小的时候，几毫秒的差距可能没有意义。跑之前先估计「多大的差异才算重要」，再看结果是否超过这个阈值。

- `--prepare 'sync'` 清掉页缓存，适合测冷启动
- 测热路径时要故意不清理缓存
- `--parameter-list N 1,2,4,8` 一次跑完所有参数组合
- `--export-json` 的结果可以直接画图对比

## 基准的陷阱

- 没预热：第一次跑要读文件、建索引，结果偏慢
- 后台有编译、同步、浏览器，噪声盖过差异
- 微基准和真实负载差很远，函数快不等于程序快
- 只测一次，把偶然当必然
- 改了代码没重跑基准，凭感觉宣布优化成功

- 把 stdout 重定向到 `/dev/null`，避免终端渲染和管道背压
- 浏览器基准要考虑 JIT 预热和 GC，跑一万次和一百万次差别很大
- 用 DevTools 的 Performance 面板或 Firefox Profiler 看长任务
- 固定 CPU governor 和插电状态，减少频率漂移
- 关掉后台同步、索引和自动更新
- 标准差超过均值一成时，先别下结论
- 先跑一遍再测，避免首次导入和初始化的开销

## 常见坑

- 把 Massif 的峰值当成泄漏
- 用 `time` 比较两个命令，忽略了页缓存的冷热差别
- 基准测试跑在电池模式或降频的笔记本上
- 只看吞吐，不看 P99 延迟
- 让基准命令输出到终端，I/O 开销混进了测量结果
- 用 `--shell=none` 后才发现命令里有管道和重定向，根本跑不起来
- 只跑一轮就下结论，忽略了 CPU 频率在两次运行间的漂移
