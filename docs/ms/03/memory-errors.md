---
title: 内存错误
description: MIT Missing Semester 第 3 讲 · 内存错误
---

# 内存错误

内存错误不按出错的位置报错。一次越界写可能改掉相邻对象的字段，程序在几万行之后才崩溃。

## 错误类型

| 类型           | 表现             | 典型原因                    |
| -------------- | ---------------- | --------------------------- |
| 缓冲区溢出     | 相邻数据被改写   | 下标越界、`strcpy` 不带长度 |
| use-after-free | 读到的值随机变化 | `free` 后继续用指针         |
| 内存泄漏       | 内存持续上涨     | 分配后丢失指针              |
| 未初始化读取   | 结果依赖栈上残留 | 忘了赋值                    |
| 数据竞争       | 多线程下偶发错误 | 无锁共享写入                |

后两类最容易被忽略，因为它们不一定让程序崩溃。越界写也一样：只要写进的是同一页内可写的内存，操作系统不会介入。

堆上的错误尤其隐蔽。分配器在块之间放了元数据，越界几个字节改坏的是下一个块的头部，崩溃可能发生在完全无关的 `free` 调用里。

## Sanitizer

Sanitizer 是编译器插桩：在每次内存访问前后插入检查，出错时立刻报告。

```bash
gcc -fsanitize=address -g program.c -o program
./program
```

ASan 能抓堆、栈、全局变量的越界，以及 use-after-free、use-after-return 和泄漏。报告里通常有三段栈：

- 出错位置：哪一行读了或写了非法地址
- 分配位置：这块内存是谁申请的
- 释放位置：谁先 `free` 的

- 这三段分别对应谁用、谁分配、谁释放
- 报告里的地址是虚拟地址，直接看行号
- 全是 `??` 说明缺少符号化工具
- 装 `llvm-symbolizer` 并设置 `ASAN_SYMBOLIZER_PATH`

| Sanitizer | 编译选项               | 抓什么                     |
| --------- | ---------------------- | -------------------------- |
| ASan      | `-fsanitize=address`   | 越界、use-after-free、泄漏 |
| TSan      | `-fsanitize=thread`    | 数据竞争                   |
| MSan      | `-fsanitize=memory`    | 未初始化读取               |
| UBSan     | `-fsanitize=undefined` | 整数溢出、非法移位         |

ASan 与 TSan 不能同时开启，一次只能选一种。MSan 要求所有代码（包括依赖库）都插桩，实际门槛最高。

- ASan 和 UBSan 可以同时开：`-fsanitize=address,undefined`
- UBSan 默认只警告，加 `-fno-sanitize-recover=all` 才停下

## Valgrind

没有源码或不能重编译时，用 Valgrind。它把程序放进受控的执行环境，逐条指令检查内存访问。

```bash
valgrind --leak-check=full ./program
valgrind --leak-check=full --show-leak-kinds=all ./program
```

| 维度       | Sanitizer   | Valgrind               |
| ---------- | ----------- | ---------------------- |
| 是否重编译 | 需要        | 不需要                 |
| 速度       | 约 2 倍开销 | 10 倍以上              |
| 精度       | 高          | 高，但更慢             |
| 适用       | 开发和 CI   | 第三方二进制、线上复现 |

Valgrind 的 `definitely lost` 是确定泄漏，`still reachable` 通常是全局缓存，不一定是 bug。先看前者。

它还能报「使用了未初始化的值」，这类问题 ASan 不一定覆盖。看到 `Conditional jump or move depends on uninitialised value`，往上找第一次分配那块内存的位置。

- 加 `--track-origins=yes` 才会显示未初始化值在哪里被创建
- `--show-leak-kinds=all` 才会列出 `still reachable`
- 代价是更慢、更占内存
- 多线程下 Valgrind 更慢，还可能改变线程交错顺序
- 它能发现「这里有竞争」，但不能证明「没有竞争」

## 把检查放进流程

内存错误越晚发现越贵。常见做法：

- 开发时用 `-fsanitize=address,undefined` 构建
- CI 单独跑一遍 sanitizer 构建
- 泄漏检查只在测试环境开，避免误报干扰
- 用 `ASAN_OPTIONS=detect_leaks=1:halt_on_error=1` 让第一次错误就失败

`halt_on_error=0` 可以让程序继续跑，收集更多报告，但后续状态可能已经被污染。

第三方库的已知泄漏可以用抑制文件过滤，避免 CI 长期红灯。抑制规则要写清楚来源和日期，否则下次升级库时没人敢删。

## 常见坑

- 只跑一次 ASan 没报错就认为没问题，实际没覆盖到出错路径
- 用 `-O2` 加 sanitizer，优化把越界访问消掉，问题不再出现
- 把 `still reachable` 当成泄漏，花时间清理无害的全局对象
- 修复后不补回归测试，同样的越界换个输入又回来
- 把触发错误的用例留作回归测试，防止再次引入
- 把 ASan 当生产工具，运行时开销和内存占用都不可接受
- 临时关掉泄漏检查用 `ASAN_OPTIONS=detect_leaks=0`，只在确认误报时用
- 在 macOS 上默认工具链没有 LSan，泄漏检测要换平台
- 开了 ASan 却用 `LD_PRELOAD` 加载了未插桩的分配器
- 只看最后一条报告，忽略第一条；后面的错误往往是前面的连锁反应
