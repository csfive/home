# C 语言怎么运行的

从一份 `.c` 源码到终端里运行的可执行文件，要经过预处理、编译、汇编和链接四个阶段。

```svg-diagram
<svg viewBox="0 0 680 214" role="img" aria-label="hello.c 经预处理、编译、汇编、链接生成可执行文件的蜕变过程" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="cs50-c-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M 0 0.6 L 5.5 3 L 0 5.4 z" fill="var(--info)" />
    </marker>
    <marker id="cs50-c-ok" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M 0 0.6 L 5.5 3 L 0 5.4 z" fill="var(--success)" />
    </marker>
  </defs>

  <path d="M 16 26 L 102 26 L 116 40 L 116 112 L 16 112 Z" fill="var(--sidebar)" stroke="var(--border)" stroke-width="1.2" />
  <path d="M 102 26 L 102 40 L 116 40" fill="none" stroke="var(--border)" stroke-width="1.2" />
  <text x="66" y="66" text-anchor="middle" font-size="12.5" font-weight="600" font-family="var(--font-mono)" fill="var(--foreground)">hello.c</text>
  <text x="66" y="88" text-anchor="middle" font-size="10.5" fill="var(--muted-foreground)">C 源码</text>

  <text x="135" y="58" text-anchor="middle" font-size="10" font-family="var(--font-mono)" fill="var(--info)">-E</text>
  <line x1="118" y1="69" x2="150" y2="69" stroke="var(--info)" stroke-width="1.5" marker-end="url(#cs50-c-arrow)" />
  <text x="135" y="86" text-anchor="middle" font-size="9.5" fill="var(--muted-foreground)">预处理</text>

  <path d="M 154 26 L 240 26 L 254 40 L 254 112 L 154 112 Z" fill="var(--sidebar)" stroke="var(--border)" stroke-width="1.2" />
  <path d="M 240 26 L 240 40 L 254 40" fill="none" stroke="var(--border)" stroke-width="1.2" />
  <text x="204" y="66" text-anchor="middle" font-size="12.5" font-weight="600" font-family="var(--font-mono)" fill="var(--foreground)">hello.i</text>
  <text x="204" y="88" text-anchor="middle" font-size="10.5" fill="var(--muted-foreground)">展开头文件</text>

  <text x="273" y="58" text-anchor="middle" font-size="10" font-family="var(--font-mono)" fill="var(--info)">-S</text>
  <line x1="256" y1="69" x2="288" y2="69" stroke="var(--info)" stroke-width="1.5" marker-end="url(#cs50-c-arrow)" />
  <text x="273" y="86" text-anchor="middle" font-size="9.5" fill="var(--muted-foreground)">编译</text>

  <path d="M 292 26 L 378 26 L 392 40 L 392 112 L 292 112 Z" fill="var(--sidebar)" stroke="var(--border)" stroke-width="1.2" />
  <path d="M 378 26 L 378 40 L 392 40" fill="none" stroke="var(--border)" stroke-width="1.2" />
  <text x="342" y="66" text-anchor="middle" font-size="12.5" font-weight="600" font-family="var(--font-mono)" fill="var(--foreground)">hello.s</text>
  <text x="342" y="88" text-anchor="middle" font-size="10.5" fill="var(--muted-foreground)">汇编代码</text>

  <text x="411" y="58" text-anchor="middle" font-size="10" font-family="var(--font-mono)" fill="var(--info)">-c</text>
  <line x1="394" y1="69" x2="426" y2="69" stroke="var(--info)" stroke-width="1.5" marker-end="url(#cs50-c-arrow)" />
  <text x="411" y="86" text-anchor="middle" font-size="9.5" fill="var(--muted-foreground)">汇编</text>

  <path d="M 430 26 L 516 26 L 530 40 L 530 112 L 430 112 Z" fill="var(--sidebar)" stroke="var(--border)" stroke-width="1.2" />
  <path d="M 516 26 L 516 40 L 530 40" fill="none" stroke="var(--border)" stroke-width="1.2" />
  <text x="480" y="66" text-anchor="middle" font-size="12.5" font-weight="600" font-family="var(--font-mono)" fill="var(--foreground)">hello.o</text>
  <text x="480" y="88" text-anchor="middle" font-size="10.5" fill="var(--muted-foreground)">目标机器码</text>

  <text x="549" y="58" text-anchor="middle" font-size="10" fill="var(--success)">链接</text>
  <line x1="532" y1="69" x2="564" y2="69" stroke="var(--success)" stroke-width="1.6" marker-end="url(#cs50-c-ok)" />

  <rect x="568" y="26" width="96" height="86" rx="10" fill="var(--sidebar)" stroke="var(--success)" stroke-width="1.4" />
  <text x="616" y="66" text-anchor="middle" font-size="13" font-weight="600" font-family="var(--font-mono)" fill="var(--success)">hello</text>
  <text x="616" y="88" text-anchor="middle" font-size="10.5" fill="var(--muted-foreground)">可执行文件</text>

  <line x1="549" y1="150" x2="549" y2="75" stroke="var(--success)" stroke-width="1.4" stroke-dasharray="4 3" marker-end="url(#cs50-c-ok)" />
  <rect x="434" y="152" width="230" height="44" rx="8" fill="var(--sidebar)" stroke="var(--success)" stroke-width="1.2" />
  <text x="549" y="172" text-anchor="middle" font-size="11.5" font-weight="600" font-family="var(--font-mono)" fill="var(--foreground)">libc · libcs50 (-lcs50)</text>
  <text x="549" y="188" text-anchor="middle" font-size="10" fill="var(--muted-foreground)">外部库机器码在链接阶段汇入</text>

  <rect x="16" y="152" width="396" height="44" rx="8" fill="var(--sidebar)" stroke="var(--border)" stroke-width="1.2" />
  <text x="214" y="172" text-anchor="middle" font-size="11.5" font-weight="600" fill="var(--foreground)">运行：./hello</text>
  <text x="214" y="188" text-anchor="middle" font-size="10" fill="var(--muted-foreground)">载入内存 → 从 main 执行 → 返回退出码（echo $? 查看）</text>
</svg>
```

## 从源码到运行

先看一个最小的 C 程序：

```c [hello.c]
#include <stdio.h>

int main(void)
{
    printf("hello, world\n");
    return 0;
}
```

在终端里用 `clang` 编译再运行：

```bash
clang hello.c -o hello
./hello
```

- `clang`：C 编译器，把源码翻译成可执行文件
- `hello.c`：输入的源码文件
- `-o hello`：指定生成的可执行文件名，不写时会默认生成 `a.out`
- `./hello`：运行当前目录下的 `hello` 程序（`./` 告诉终端去当前目录找，而不是去系统命令路径里找）

如果代码里引入了 `<cs50.h>` 并调用了 `get_string`，还需要额外加 `-lcs50` 告诉编译器去链接 CS50 库；平时敲的 `make` 本质上就是自动帮你拼好这一串 `clang` 参数（细节见 [怎么写 Makefile](/cs50x/makefile)）。

## 编译背后的四个阶段

敲下一条 `clang hello.c -o hello`，编译器背后其实依次完成了四步。用不同参数可以让它停在任意一步，亲眼看到中间产物。

### 1. 预处理（Preprocessing）

处理所有以 `#` 开头的指令。看到 `#include <stdio.h>` 时，预处理器会直接把 `stdio.h` 里的函数声明复制粘贴到你的源码顶部，同时删掉所有注释。

```bash
clang -E hello.c | tail -n 20
```

- `-E`：只执行预处理，把展开后的结果输出到终端
- `tail -n 20`：因为 `stdio.h` 展开后有几百行，这里只看最后 20 行

### 2. 编译（Compiling）

检查语法和类型，把预处理后的 C 代码翻译成更贴近硬件的**汇编代码**（Assembly Code）。漏分号、变量没声明类型、调用了未声明的函数，都会在这一步被拦下来。

```bash
clang -S hello.c
```

- `-S`：停在编译阶段，在当前目录生成文本文件 `hello.s`

### 3. 汇编（Assembling）

由汇编器把 `hello.s` 里的汇编指令逐条翻译成 CPU 能执行的二进制机器码，产出**目标文件**（Object File，`hello.o`）。

```bash
clang -c hello.c
```

- `-c`：编译并汇编，但不做链接，生成二进制文件 `hello.o`

此时的 `hello.o` 还不能直接运行，因为它只包含你写的 `main`，里面调用的 `printf` 还没有接上真正的实现代码。

### 4. 链接（Linking）

链接器把 `hello.o` 和系统标准库（以及 `-lcs50` 等第三方库）里早已编好的机器码拼在一起，补齐 `printf`、`get_string` 这些函数的真正地址，最终生成可以直接运行的 `hello`。

## 报错落在哪一阶段

分清四个阶段后，看到报错信息就能很快判断问题出在哪：

| 常见报错现象                                      | 所在阶段 | 典型原因                                         |
| ------------------------------------------------- | -------- | ------------------------------------------------ |
| `'studio.h' file not found`                       | 预处理   | 头文件名拼错，或没把头文件目录加进搜索路径       |
| `expected ';' after expression`                   | 编译     | 漏分号、括号不匹配、类型写错                     |
| `call to undeclared function 'foo'`               | 编译     | 函数写在 `main` 后面，顶部忘了写函数原型声明     |
| `undefined symbols` / `undefined reference`       | 链接     | 写了 `#include <cs50.h>` 但编译命令漏了 `-lcs50` |
| 编译通过但输出不对，或运行中报 `AddressSanitizer` | 运行     | 逻辑错误、数组越界或除零，需靠调试定位           |

## 运行时与退出码

敲下 `./hello` 后，操作系统会把可执行文件读进内存，找到 `main` 作为唯一入口开始执行，遇到 `return` 时结束程序，并把返回值交给终端当作**退出状态码**（Exit Status）：

- 返回 `0` 表示程序正常结束
- 返回非 `0`（常见 `1`）表示运行出错，比如缺少必要的命令行参数

程序跑完后，可以在终端敲 `echo $?` 查看上一条命令的退出码：

```bash
./hello
echo $?
```

- `$?`：Shell 内置变量，保存上一条命令结束时返回的退出状态码
