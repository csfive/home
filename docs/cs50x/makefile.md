# 怎么写 Makefile

接着 [怎么设置本地运行环境](/cs50x/setup)，用第一章 `01-c/` 里的作业串联演示：如何把一长串 `clang` 命令收进 `Makefile`，看懂它最常用的规则、变量与内置函数，再拆解仓库根目录那份同时管编译、`style50`、`check50` 和 `submit50` 的实战配置。

```svg-diagram
<svg viewBox="0 0 680 250" role="img" aria-label="CS50x 根目录 Makefile 参数解析与命令分发流程" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="cs50-mk-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
      <path d="M 0 0.7 L 6.5 3.5 L 0 6.3 z" fill="var(--info)" />
    </marker>
  </defs>

  <rect x="190" y="14" width="300" height="44" rx="8" fill="var(--sidebar)" stroke="var(--border)" stroke-width="1.2" />
  <text x="340" y="34" text-anchor="middle" font-size="13" font-weight="600" fill="var(--foreground)">终端输入：make c mario-less</text>
  <text x="340" y="50" text-anchor="middle" font-size="10.5" font-family="var(--font-mono)" fill="var(--muted-foreground)">MAKECMDGOALS = c mario-less</text>

  <line x1="340" y1="58" x2="210" y2="86" stroke="var(--info)" stroke-width="1.5" marker-end="url(#cs50-mk-arrow)" />
  <line x1="340" y1="58" x2="496" y2="86" stroke="var(--info)" stroke-width="1.5" marker-end="url(#cs50-mk-arrow)" />

  <rect x="16" y="88" width="388" height="72" rx="10" fill="var(--sidebar)" stroke="var(--border)" stroke-width="1.2" />
  <text x="210" y="112" text-anchor="middle" font-size="13" font-weight="600" fill="var(--foreground)">1. 拆出题名并定位路径与 Slug</text>
  <text x="210" y="132" text-anchor="middle" font-size="10.5" font-family="var(--font-mono)" fill="var(--muted-foreground)">NAME=mario-less → DIR=01-c/mario-less</text>
  <text x="210" y="149" text-anchor="middle" font-size="10.5" font-family="var(--font-mono)" fill="var(--muted-foreground)">SRC=…/mario.c · SLUG=mario/less</text>

  <rect x="420" y="88" width="244" height="72" rx="10" fill="var(--sidebar)" stroke="var(--border)" stroke-width="1.2" />
  <text x="542" y="112" text-anchor="middle" font-size="13" font-weight="600" fill="var(--foreground)">2. 导出 Homebrew 环境</text>
  <text x="542" y="132" text-anchor="middle" font-size="10.5" font-family="var(--font-mono)" fill="var(--muted-foreground)">export C_INCLUDE_PATH</text>
  <text x="542" y="149" text-anchor="middle" font-size="10.5" font-family="var(--font-mono)" fill="var(--muted-foreground)">export LIBRARY_PATH</text>

  <line x1="210" y1="160" x2="290" y2="188" stroke="var(--info)" stroke-width="1.5" marker-end="url(#cs50-mk-arrow)" />
  <line x1="542" y1="160" x2="400" y2="188" stroke="var(--info)" stroke-width="1.5" marker-end="url(#cs50-mk-arrow)" />

  <rect x="16" y="190" width="648" height="46" rx="10" fill="var(--sidebar)" stroke="var(--success)" stroke-width="1.2" />
  <text x="340" y="210" text-anchor="middle" font-size="12.5" font-weight="600" fill="var(--foreground)">3. 按首个动作分发执行</text>
  <text x="340" y="227" text-anchor="middle" font-size="10.5" font-family="var(--font-mono)" fill="var(--muted-foreground)">b/r: clang + ASan/UBSan   |   s: style50   |   c: check50 --offline   |   sub: submit50</text>
</svg>
```

## 从手敲 clang 到最小 Makefile

### 本来怎么编译运行 C

以 `01-c/me/hello.c` 为例，在没有 `Makefile` 的本地 macOS 终端里，编译并运行这一个文件需要完整敲出编译器选项、头文件目录和链接库路径：

```bash
clang -Wall -Wextra -std=c11 -I/opt/homebrew/include -L/opt/homebrew/lib -lcs50 -lm 01-c/me/hello.c -o 01-c/me/hello
./01-c/me/hello
```

- `-Wall -Wextra`：开启常用与额外编译警告，尽早暴露潜在写法问题
- `-std=c11`：指定按 C11 标准编译
- `-I/opt/homebrew/include`：把 Homebrew 头文件目录加进搜索路径，让 `#include <cs50.h>` 能找到 `cs50.h`
- `-L/opt/homebrew/lib`：把 Homebrew 库目录加进链接器搜索路径，定位 `libcs50.dylib`
- `-lcs50 -lm`：链接 CS50 库与数学库（macOS 系统库已包含数学函数，显式保留 `-lm` 与云端对齐）
- `-o 01-c/me/hello`：指定生成的可执行文件路径，不写时默认输出 `a.out`

要是再补上调试符号（`-ggdb3`）和内存越界检查（`-fsanitize=address,undefined`），每次改完代码重编、换一道题（比如切到 `01-c/mario-less/mario.c`）都要重新拼路径和参数。

### 用最小 Makefile 简化

在 `01-c/me/` 目录下放一个 `Makefile`，把参数和构建命令收进去：

```makefile [01-c/me/Makefile]
CC     := clang
CFLAGS := -Wall -Wextra -std=c11 -I/opt/homebrew/include
LDLIBS := -L/opt/homebrew/lib -lcs50 -lm

hello: hello.c
	$(CC) $(CFLAGS) $< -o $@ $(LDLIBS)

clean:
	rm -f hello
```

- 在 `01-c/me/` 下执行 `make`，默认运行第一条规则 `hello`，展开并执行完整的 `clang` 编译命令
- 如果 `hello.c` 没改过，再运行一次 `make` 会输出 `make: 'hello' is up to date.` 并跳过重复编译
- 执行 `make clean` 可以删掉编译产物 `hello`
- 规则体里的命令必须用真正的 **Tab**（`\t`）缩进，写成空格会直接报错 `missing separator`

GNU Make 本身自带一条针对 C 文件的内置隐式规则 `%: %.c`，默认展开为 `$(CC) $(CFLAGS) $(CPPFLAGS) $(LDFLAGS) $(TARGET_ARCH) $^ $(LOADLIBES) $(LDLIBS) -o $@`。这也是云端 `cs50.dev` 哪怕目录里没有 `Makefile`，只要环境变量预先配好 `CC`、`CFLAGS`、`LDLIBS`，直接敲 `make hello` 就能编译的原因。

## Makefile 核心语法

### 规则、命令前缀与伪目标

一条标准规则由目标、前置依赖和命令三部分组成：

```makefile
target: prerequisites
	recipe
```

- `target`：要生成的文件路径，或一个动作标签（如 `clean`、`help`）
- `prerequisites`：前置依赖，任意依赖文件不存在或修改时间比 `target` 新时，就会触发重新执行 `recipe`
- `recipe`：由 Shell 执行的命令行，行首加 `@` 表示静默执行，只在终端输出命令结果而不回显命令本身
- `.PHONY`：把动作标签声明为伪目标（如 `.PHONY: clean help`），避免目录里刚好存在同名文件时 `make` 误判为已是最新而跳过执行

### 变量赋值与自动变量

`Makefile` 有四种常用赋值方式，区别在于求值时机和是否允许覆盖：

| 写法 | 求值时机与行为                     | 本项目示例                                       |
| ---- | ---------------------------------- | ------------------------------------------------ |
| `:=` | 立即展开，定义时就地求值           | `CC := clang`                                    |
| `=`  | 递归展开，每次被引用时才动态求值   | `CHECK_MODE = $(if $(UPDATE),--local,--offline)` |
| `?=` | 条件赋值，仅在变量未定义时赋默认值 | `YEAR ?= 2026`（命令行可传 `YEAR=2025` 覆盖）    |
| `+=` | 追加赋值，在已有内容后按空格拼接   | 分段追加编译参数                                 |

在规则的 `recipe` 里还可以用自动变量代替重复文件名：

- `$@`：当前规则的 `target`（如 `hello`）
- `$<`：第一个前置依赖文件（如 `hello.c`）
- `$^`：去重后的所有前置依赖文件列表

### 环境导出与默认目标

- `export VAR := val`：把变量导出到 `make` 启动的所有子进程环境里，让内层调用的 `clang` 和 `check50` 都能读到
- `.DEFAULT_GOAL := help`：显式指定直接输入 `make` 时运行的默认目标，打破「默认执行文件第一条规则」的限制

### 条件分支与常用内置函数

以 `make c mario-less` 和 `01-c/mario-less/mario.c` 为例，下面这几个分支与文本函数就能串联起目录查找和参数转换：

| 语法 / 函数             | 作用                                      | `mario-less` 示例结果                                  |
| ----------------------- | ----------------------------------------- | ------------------------------------------------------ |
| `ifeq ($(A),$(B))`      | 判断两字符串是否相等，常配 `ifneq` 判非空 | 校验首参是否落在动作白名单内                           |
| `$(firstword list)`     | 取空格分隔列表的第 1 个词                 | 从 `c mario-less` 提取 `c`                             |
| `$(word n,list)`        | 取空格分隔列表的第 n 个词                 | 从 `c mario-less` 提取 `mario-less`                    |
| `$(filter pat,text)`    | 仅保留匹配模式的词                        | 校验 `c` 是否属于允许动作                              |
| `$(wildcard pat)`       | 展开通配符匹配磁盘上真实存在的路径        | `0*-*/mario-less` 展开为 `01-c/mario-less`             |
| `$(basename path)`      | 去掉文件扩展名                            | `01-c/mario-less/mario.c` 变为 `01-c/mario-less/mario` |
| `$(notdir path)`        | 剥离前面的目录路径，只留最后一段          | `01-c/mario-less` 变为 `mario-less`                    |
| `$(patsubst p,r,t)`     | 按 `%` 通配符做模式替换                   | `$(patsubst %/,%,01-c/mario-less/)` 去掉尾斜杠         |
| `$(subst from,to,text)` | 纯字符串替换                              | 把 `-less` 替换为 `/less`，得到 `mario/less`           |
| `$(if cond,then,else)`  | 条件三元式，`cond` 非空走 `then`          | `UPDATE=1` 时取 `--local`，否则 `--offline`            |
| `$(eval text)`          | 解析阶段把字符串当作 `Makefile` 语法执行  | 动态把 `mario-less` 注册为无操作伪目标                 |

## 项目根目录的实战 Makefile

第一章有 `world`、`me`、`mario-less`、`mario-more`、`cash`、`credit` 六个独立目录，每个目录放一份 `Makefile` 既冗余又难同步修改参数。把下面这份 `Makefile` 放在 `CS50x` 仓库根目录，就可以用统一指令调度所有作业：

```makefile [Makefile]
export C_INCLUDE_PATH := /opt/homebrew/include
export LIBRARY_PATH   := /opt/homebrew/lib

CC      := clang
CFLAGS  := -fsanitize=signed-integer-overflow -fsanitize=undefined -fsanitize=address \
           -ggdb3 -O0 -std=c11 -Wall -Werror -Wextra \
           -Wno-sign-compare -Wno-unused-parameter -Wno-unused-variable -Wshadow
LDLIBS  := -lcs50 -lm
YEAR    ?= 2026

ACTIONS := b r s c sub build run style check submit
ifeq ($(filter $(firstword $(MAKECMDGOALS)),$(ACTIONS)),$(firstword $(MAKECMDGOALS)))
  NAME := $(word 2,$(MAKECMDGOALS))
  ifneq ($(NAME),)
    $(eval .PHONY: $(NAME))
    $(eval $(NAME):;@:)
  endif
endif

DIR        := $(firstword $(wildcard $(NAME) 0*-*/$(NAME)))
SRC        := $(firstword $(wildcard $(DIR)/*.c))
BIN        := $(basename $(SRC))
BASE_NAME  := $(notdir $(patsubst %/,%,$(NAME)))
AUTO_SLUG  := $(subst -less,/less,$(subst -more,/more,$(BASE_NAME)))
SLUG       := $(if $(S),$(S),$(AUTO_SLUG))
CHECK_MODE = $(if $(UPDATE),--local,--offline)

.DEFAULT_GOAL := help
.PHONY: help b build r run s style c check sub submit clean

help:
	@echo "Usage:"
	@echo "  make r <name>             编译并运行（例：make r me）"
	@echo "  make s <name>             运行 style50 风格检查"
	@echo "  make c <name>             离线运行 check50（-less/-more 自动映射）"
	@echo "  make c <name> UPDATE=1    联网刷新 check50 用例库后再测"
	@echo "  make sub <name>           提交到 CS50（submit50）"
	@echo "  make clean                清理所有 .c 对应的编译产物与 .dSYM"

b:
	@test -n "$(NAME)" || { echo "Usage: make r <name> (e.g. make r me)"; exit 1; }
	@test -n "$(DIR)" || { echo "Error: '$(NAME)' not found under $(NAME)/ or 0*-*/$(NAME)/"; exit 1; }
	@if [ -f "$(DIR)/Makefile" ]; then $(MAKE) -C "$(DIR)"; else $(CC) $(CFLAGS) $(SRC) -o $(BIN) $(LDLIBS); fi

build: b

r: b
	./$(BIN)

run: r

s:
	@test -n "$(NAME)" || { echo "Usage: make s <name> (e.g. make s me)"; exit 1; }
	@test -n "$(DIR)" || { echo "Error: '$(NAME)' not found under $(NAME)/ or 0*-*/$(NAME)/"; exit 1; }
	style50 $(SRC)

style: s

c:
	@test -n "$(NAME)" || { echo "Usage: make c <name> (e.g. make c me)"; exit 1; }
	@test -n "$(DIR)" || { echo "Error: '$(NAME)' not found under $(NAME)/ or 0*-*/$(NAME)/"; exit 1; }
	cd $(DIR) && check50 $(CHECK_MODE) cs50/problems/$(YEAR)/x/$(SLUG)

check: c

sub:
	@test -n "$(NAME)" || { echo "Usage: make sub <name> (e.g. make sub me)"; exit 1; }
	@test -n "$(DIR)" || { echo "Error: '$(NAME)' not found under $(NAME)/ or 0*-*/$(NAME)/"; exit 1; }
	cd $(DIR) && submit50 cs50/problems/$(YEAR)/x/$(SLUG)

submit: sub

clean:
	@find . -maxdepth 4 -name '*.c' -exec sh -c 'for f; do rm -f "$${f%.c}"; rm -rf "$${f%.c}.dSYM"; done' _ {} +
```

### 1. 注入 Homebrew 路径

`clang` 编译和链接时会主动读取 `C_INCLUDE_PATH` 与 `LIBRARY_PATH` 环境变量。前两行用 `export` 把 `/opt/homebrew` 路径写进子进程环境后，无论是自己调用 `clang`，还是 `make c mario-less` 启动的 `check50` 子进程（它内部只会直接调用 `clang -std=c11 -ggdb -lm -lcs50`），都能顺利找到 `cs50.h` 和 `libcs50.dylib`。

### 2. 编译参数与题库年份

- `-fsanitize=signed-integer-overflow -fsanitize=undefined -fsanitize=address`：开启有符号整数溢出、未定义行为（UBSan）与内存越界/泄漏检查（ASan），在 macOS 上补齐云端 `valgrind` 的运行时防线
- `-ggdb3 -O0`：保留完整调试信息并关闭优化，出错堆栈和 `CodeLLDB` 断点能直接对齐源码行号
- `-std=c11`：指定按 C11 标准编译
- `-Wall -Werror -Wextra`：开启常用与额外警告，并把警告升格为编译失败
- `-Wno-sign-compare -Wno-unused-parameter -Wno-unused-variable -Wshadow`：放行有/无符号比较和暂未使用的参数或变量（与 CS50 官方编译策略一致），同时保留 `-Wshadow` 提醒变量遮蔽
- `LDLIBS := -lcs50 -lm`：链接 CS50 库与数学库
- `YEAR ?= 2026`：默认指定 2026 题库分支，需要测往年题目时传 `YEAR=2025` 即可覆盖

### 3. 把第二个参数变成题名

终端里输入 `make r mario-less` 时，`make` 默认会把 `r` 和 `mario-less` 当作两个待构建的目标依次执行，跑完 `r` 就会因找不到 `mario-less` 规则而报错。

- `MAKECMDGOALS` 保存命令行传入的完整目标列表（如 `r mario-less`）
- `ifeq` 配合 `filter` 判断第一个词是否属于 `ACTIONS` 白名单，属于时用 `$(word 2,$(MAKECMDGOALS))` 取出题名赋给 `NAME`
- 用 `$(eval .PHONY: $(NAME))` 和 `$(eval $(NAME):;@:)` 动态把题名注册为一个仅执行 `@:`（Shell 空操作）的伪目标，让 `make` 静默结束

### 4. 自动定位源码与映射 Slug

- `DIR`：先匹配当前目录 `$(NAME)`，找不到再匹配 `0*-*/$(NAME)`，所以传 `mario-less` 或 `01-c/mario-less` 都能定位到 `01-c/mario-less`
- `SRC` 与 `BIN`：读取 `DIR` 下的第一个 `.c` 文件（如 `01-c/me/hello.c`），再用 `basename` 剥离 `.c` 得到二进制路径 `01-c/me/hello`，不要求目录名和 `.c` 文件名同名
- `BASE_NAME` 与 `AUTO_SLUG`：先用 `patsubst %/,%,$(NAME)` 去掉可能多打的末尾斜杠，再用 `notdir` 剥离外层目录；随后用嵌套 `subst` 把 `-less`、`-more` 自动转成 `/less`、`/more`（例如 `mario-less` 变成 `mario/less`）
- `SLUG` 与 `CHECK_MODE`：本地目录名与官方 slug 不一致时可传 `S=...` 覆盖；`CHECK_MODE` 默认输出 `--offline` 实现断网秒测，传 `UPDATE=1` 时切换成 `--local` 更新本地题库缓存

### 5. 动作分发与产物清理

- `b`（`build`）先用两个 `test -n` 校验题名非空和目录存在，若子目录里自带独立 `Makefile`（后续多文件项目会遇到），则通过 `$(MAKE) -C "$(DIR)"` 委托子目录构建，否则执行 `clang` 编译
- `r`（`run`）将 `b` 设为前置依赖，实现编译通过后直接运行 `./$(BIN)`
- `s`（`style`）、`c`（`check`）、`sub`（`submit`）分别校验路径后进入 `$(DIR)` 执行 `style50`、`check50` 与 `submit50`
- `clean` 用 `find . -maxdepth 4 -name '*.c'` 扫描 4 层深度内的 `.c` 文件，在 Shell 循环里用 `${f%.c}` 删掉对应的无扩展名可执行文件与 macOS 编译生成的 `.dSYM` 调试符号目录（`$$` 用于在 `Makefile` 中转义 `$`，把参数展开留给 Shell）

日常在 `CS50x` 根目录刷第一章作业时，实际只需要记这几条命令：

| 命令                         | 作用                                                 |
| ---------------------------- | ---------------------------------------------------- |
| `make r me`                  | 编译并运行 `01-c/me/hello.c`                         |
| `make s mario-less`          | 对 `01-c/mario-less/mario.c` 运行 `style50` 风格检查 |
| `make c mario-less`          | 离线运行 `check50` 评测 `mario/less`                 |
| `make c mario-less UPDATE=1` | 联网刷新本地用例库后再评测                           |
| `make sub credit`            | 提交 `01-c/credit/credit.c` 到 CS50                  |
| `make clean`                 | 清理全部 `.c` 对应的可执行文件与 `.dSYM` 目录        |
