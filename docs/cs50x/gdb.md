# 怎么使用 GDB 进行调试

代码能编译但结果不对时，靠满屏 `printf` 猜变量值效率很低。GDB 可以让程序停在指定代码行，一步步跟着跑，随时看清每个变量当前的值。

```svg-diagram
<svg viewBox="0 0 680 226" role="img" aria-label="GDB 调试器断点暂停与变量监视示意图" xmlns="http://www.w3.org/2000/svg">
  <rect x="16" y="16" width="648" height="194" rx="10" fill="var(--sidebar)" stroke="var(--border)" stroke-width="1.2" />

  <line x1="16" y1="48" x2="664" y2="48" stroke="var(--border)" stroke-width="1.2" />
  <text x="34" y="37" font-size="12" font-weight="600" font-family="var(--font-mono)" fill="var(--foreground)">buggy.c</text>
  <text x="102" y="37" font-size="11" fill="var(--muted-foreground)">调试视图（-g -O0）</text>
  <text x="646" y="37" text-anchor="end" font-size="11" font-family="var(--font-mono)" fill="var(--info)">b → r → n / s → p → c → q</text>

  <line x1="412" y1="48" x2="412" y2="210" stroke="var(--border)" stroke-width="1.2" />

  <text x="56" y="76" font-size="11" font-family="var(--font-mono)" fill="var(--muted-foreground)">5   int total = 0;</text>

  <rect x="24" y="88" width="378" height="28" rx="6" fill="var(--background)" stroke="var(--info)" stroke-width="1.2" />
  <circle cx="38" cy="102" r="4.5" fill="var(--destructive)" />
  <text x="52" y="106" font-size="11" font-weight="600" font-family="var(--font-mono)" fill="var(--info)">▶</text>
  <text x="68" y="106" font-size="11" font-weight="600" font-family="var(--font-mono)" fill="var(--foreground)">6   for (int i = 1; i &lt; n; i++)</text>

  <text x="56" y="138" font-size="11" font-family="var(--font-mono)" fill="var(--muted-foreground)">7   {</text>
  <text x="56" y="162" font-size="11" font-family="var(--font-mono)" fill="var(--muted-foreground)">8       total += i;</text>
  <text x="34" y="194" font-size="10.5" fill="var(--muted-foreground)">红点：b 6 打断点 · ▶：当前暂停行（n 跨过 / s 进入）</text>

  <text x="430" y="74" font-size="12" font-weight="600" fill="var(--foreground)">局部变量 · p 查看</text>

  <rect x="430" y="88" width="216" height="24" rx="5" fill="var(--background)" stroke="var(--border)" stroke-width="1" />
  <text x="442" y="104" font-size="11" font-family="var(--font-mono)" fill="var(--muted-foreground)">n</text>
  <text x="634" y="104" text-anchor="end" font-size="11" font-weight="600" font-family="var(--font-mono)" fill="var(--foreground)">3</text>

  <rect x="430" y="118" width="216" height="24" rx="5" fill="var(--background)" stroke="var(--info)" stroke-width="1" />
  <text x="442" y="134" font-size="11" font-family="var(--font-mono)" fill="var(--info)">i</text>
  <text x="634" y="134" text-anchor="end" font-size="11" font-weight="600" font-family="var(--font-mono)" fill="var(--info)">2 → 3 (退出)</text>

  <rect x="430" y="148" width="216" height="24" rx="5" fill="var(--background)" stroke="var(--warning)" stroke-width="1" />
  <text x="442" y="164" font-size="11" font-family="var(--font-mono)" fill="var(--warning)">total</text>
  <text x="634" y="164" text-anchor="end" font-size="11" font-weight="600" font-family="var(--font-mono)" fill="var(--warning)">3 (漏加 3)</text>

  <text x="430" y="194" font-size="10.5" fill="var(--muted-foreground)">macOS 用 lldb，短命令完全通用</text>
</svg>
```

## 第一步：编译时保留调试信息

平时直接 `clang buggy.c -o buggy` 编出来的程序里，源码行号和变量名都被去掉了。要让调试器看懂代码，编译时加上 `-g` 和 `-O0`：

```bash
clang -g -O0 buggy.c -o buggy
```

- `-g`：把源码行号、函数名和变量名写进可执行文件（本地 `Makefile` 里的 `-gdwarf-4 -ggdb3` 是更完整的调试信息格式）
- `-O0`：关闭编译器优化，防止调试时执行行号乱跳或局部变量被优化掉

## 第二步：准备一段带 bug 的代码

下面这段代码本来想求 `1 + 2 + 3`（预期输出 `6`），但循环条件写成了 `i < n`，结果只输出了 `3`：

```c [buggy.c]
#include <stdio.h>

int sum_to(int n)
{
    int total = 0;
    for (int i = 1; i < n; i++)
    {
        total += i;
    }
    return total;
}

int main(void)
{
    int result = sum_to(3);
    printf("sum = %i\n", result);
    return 0;
}
```

## 第三步：走完一次完整调试

启动 GDB 载入刚编好的程序：

```bash
gdb ./buggy
```

如果程序本身需要命令行参数（例如 `./caesar 13`），启动时加上 `--args`：

```bash
gdb --args ./caesar 13
```

进入 `(gdb)` 提示符后，跟着敲下面几条最常用的命令，很快就能抓出 `sum_to` 少循环一次的问题：

```text
(gdb) b main          # 在 main 入口打断点
(gdb) r               # 开始运行，停在 main 第一行
(gdb) s               # 钻进 sum_to 函数内部
(gdb) n               # 逐行向下执行
(gdb) p i             # 打印 i 当前的值
(gdb) p total         # 打印 total 当前的值
(gdb) c               # 继续运行到下一个断点或程序结束
(gdb) q               # 退出 GDB
```

每走完一轮循环看一眼 `p i` 和 `p total`，会发现 `i` 涨到 `3` 时循环直接退出了，没有执行 `total += 3`，原因一目了然。

- 在 `(gdb)` 里**直接按回车**会重复执行上一条命令，连续按回车就能一直 `n` 往下单步走

## 常用命令速查

入门阶段记住这 9 条命令就够应付绝大多数逻辑 bug：

| 命令          | 全称       | 作用                                      |
| ------------- | ---------- | ----------------------------------------- |
| `b main`      | `break`    | 在 `main` 函数入口打断点                  |
| `b buggy.c:6` | `break`    | 在 `buggy.c` 第 6 行打断点                |
| `r`           | `run`      | 启动或重新运行程序（可接参数，如 `r 13`） |
| `n`           | `next`     | 单步执行下一行，遇到函数直接跑完不进入    |
| `s`           | `step`     | 单步执行，遇到自定义函数会进入内部        |
| `p x`         | `print`    | 打印变量或表达式 `x` 当前的值             |
| `l`           | `list`     | 查看当前暂停行附近的源码                  |
| `c`           | `continue` | 继续运行直到下一个断点或程序结束          |
| `q`           | `quit`     | 退出调试器                                |

断点打多了想清理，用 `info b` 查看编号，再敲 `d 1`（`delete`）就能删掉 1 号断点。

## `debug50` 与 macOS 上的 `lldb`

- **`cs50.dev` 云端**：`debug50 ./buggy` 其实就是把 GDB 包进了 VS Code 界面，行号左侧点红点对应 `b`，Step Over 对应 `n`，Step Into 对应 `s`，Continue 对应 `c`
- **macOS 本地**：Apple Silicon 上没有原生 `gdb`，系统自带的是 `lldb`，启动命令换成 `lldb -- ./buggy`（带参数写 `lldb -- ./caesar 13`），进去之后上面的 `b`、`r`、`n`、`s`、`p`、`l`、`c`、`q` 完全通用
- **图形化断点**：如果平时习惯在编辑器里点红点看侧边栏变量，装好 [怎么设置本地运行环境](/cs50x/setup) 里提到的 `CodeLLDB` 扩展即可，底层调用的同样是 `lldb`
