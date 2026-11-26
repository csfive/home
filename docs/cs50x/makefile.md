# 怎么写 Makefile

对照云端 `cs50.dev` 的默认编译配置，在本地用一份根目录 `Makefile` 统一接管编译、运行、风格检查、离线评测和提交。

```svg-diagram
<svg viewBox="0 0 680 200" role="img" aria-label="CS50x 根目录 Makefile 参数解析与命令分发" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="cs50-mk-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
      <path d="M 0 0.7 L 6.5 3.5 L 0 6.3 z" fill="var(--info)" />
    </marker>
  </defs>

  <rect x="16" y="16" width="312" height="70" rx="10" fill="var(--sidebar)" stroke="var(--border)" stroke-width="1.2" />
  <text x="172" y="45" text-anchor="middle" font-size="13.5" font-weight="600" fill="var(--foreground)">参数解析 · MAKECMDGOALS</text>
  <text x="172" y="66" text-anchor="middle" font-size="10.5" font-family="var(--font-mono)" fill="var(--muted-foreground)">make &lt;b|r|s|c|sub&gt; &lt;name&gt;</text>

  <rect x="352" y="16" width="312" height="70" rx="10" fill="var(--sidebar)" stroke="var(--border)" stroke-width="1.2" />
  <text x="508" y="45" text-anchor="middle" font-size="13.5" font-weight="600" fill="var(--foreground)">环境注入 · export</text>
  <text x="508" y="66" text-anchor="middle" font-size="10.5" font-family="var(--font-mono)" fill="var(--muted-foreground)">C_INCLUDE_PATH · LIBRARY_PATH</text>

  <line x1="172" y1="86" x2="172" y2="116" stroke="var(--info)" stroke-width="1.6" marker-end="url(#cs50-mk-arrow)" />
  <line x1="508" y1="86" x2="508" y2="116" stroke="var(--info)" stroke-width="1.6" marker-end="url(#cs50-mk-arrow)" />

  <rect x="16" y="118" width="648" height="66" rx="10" fill="var(--sidebar)" stroke="var(--success)" stroke-width="1.2" />
  <text x="340" y="145" text-anchor="middle" font-size="13.5" font-weight="600" fill="var(--foreground)">定位源码目录并分发执行</text>
  <text x="340" y="166" text-anchor="middle" font-size="11" fill="var(--muted-foreground)">0*-*/&lt;name&gt;/*.c → clang (+ ASan/UBSan) · style50 · check50 --offline · submit50</text>
</svg>
```

## `cs50.dev` 的默认配置

在 `cs50.dev` 里写 `01-c/me/hello.c`，目录里不用放 `Makefile`，直接敲两条命令就能编译运行：

```bash
make hello
./hello
```

能直接跑通，是因为 GNU Make 自带隐式规则 `%: %.c`（默认展开成 `$(CC) $(CFLAGS) ... $^ $(LDLIBS) -o $@`），而云端镜像 `cs50/cli` 又在 [`etc/profile.d/cli.sh`](https://github.com/cs50/cli/blob/main/etc/profile.d/cli.sh#L46-L49) 里预配了三个环境变量：

```bash
export CC="clang"
export CFLAGS="-ferror-limit=1 -gdwarf-4 -ggdb3 -O0 -std=c23 -Wall -Werror -Wextra -Wno-gnu-folding-constant -Wno-sign-compare -Wno-unused-parameter -Wno-unused-variable -Wno-unused-but-set-variable -Wshadow"
export LDLIBS="-lcrypt -lcs50 -lm"
```

- `CC="clang"`：指定使用 `clang`，云端头文件和库装在系统默认路径 `/usr/include` 与 `/usr/lib`，不用额外指定
- `-ferror-limit=1`：遇到第一个错误就停下，免得一处笔误牵出一整屏连锁报错
- `-gdwarf-4 -ggdb3 -O0`：生成 DWARF 4 格式完整调试符号并关闭优化，确保 `gdb` 和 `valgrind` 能对上源码行号
- `-std=c23 -Wall -Werror -Wextra -Wshadow`：按 C23 标准编译，开启常见警告和变量遮蔽检查，并把警告当成报错拦下来
- `-Wno-gnu-folding-constant -Wno-sign-compare -Wno-unused-parameter -Wno-unused-variable -Wno-unused-but-set-variable`：放行常量折叠、有/无符号比较、未使用参数和未使用变量这几类警告
- `LDLIBS="-lcrypt -lcs50 -lm"`：链接加密库、CS50 库和数学库

## 本地手动编译

回到 macOS，`libcs50` 装在 `/opt/homebrew`，系统默认 `make` 既找不到头文件也不会自动链接 `-lcs50`。想在本地保持和云端一样的编译检查，再补上内存检测，直接用 `clang` 编译 `01-c/me/hello.c` 要敲这么一长串：

```bash
clang -fsanitize=signed-integer-overflow -fsanitize=undefined -fsanitize=address \
  -ferror-limit=1 -gdwarf-4 -ggdb3 -O0 -std=c23 -Wall -Werror -Wextra \
  -Wno-gnu-folding-constant -Wno-sign-compare -Wno-unused-parameter \
  -Wno-unused-variable -Wno-unused-but-set-variable -Wshadow \
  -I/opt/homebrew/include -L/opt/homebrew/lib -lcs50 \
  01-c/me/hello.c -o 01-c/me/hello
./01-c/me/hello
```

对比云端的 `cli.sh`，本地主要调了这几项：

- `-fsanitize=signed-integer-overflow -fsanitize=undefined -fsanitize=address`：开启有符号整数溢出、未定义行为和内存越界/泄漏检查，顶替 macOS 上跑不了的 `valgrind`
- `-I/opt/homebrew/include` 与 `-L/opt/homebrew/lib`：告诉编译器去 Homebrew 目录找 `cs50.h` 和 `libcs50.dylib`
- `-lcs50`：链接 CS50 库，macOS 已把 `crypt` 和数学库合进系统库 `libSystem`，不用加 `-lcrypt` 和 `-lm`
- `-o 01-c/me/hello`：指定生成的可执行文件路径，不写默认输出 `a.out`

## 单目录 Makefile

在 `01-c/me/` 里写一份最简 `Makefile`，在目录里直接敲 `make` 就能编译：

```makefile [01-c/me/Makefile]
CC     := clang
CFLAGS := -std=c23 -Wall -Wextra -I/opt/homebrew/include
LDLIBS := -L/opt/homebrew/lib -lcs50

.PHONY: clean

hello: hello.c
	$(CC) $(CFLAGS) $< -o $@ $(LDLIBS)

clean:
	rm -f hello
```

- `hello: hello.c`：左边是目标、右边是依赖，不带参数敲 `make` 默认跑第一个普通目标，只有 `hello` 不存在或 `hello.c` 比它新时才会重新编译
- `:=`、`$<` 与 `$@`：`:=` 在定义时立即求值，`$@` 展开成目标 `hello`，`$<` 展开成第一个依赖 `hello.c`
- **Tab 缩进**：规则下的命令行必须用真正的 Tab 开头，写成空格会直接报 `missing separator`
- `.PHONY: clean`：声明伪目标，免得目录里碰巧有同名文件 `clean` 时 `make clean` 被当成已是最新而跳过

## 根目录统一 Makefile

第一周就有 6 个题目目录，每个目录各放一份 `Makefile` 既重复又难同步。干脆只在仓库根目录放一份，把编译、运行、`style50`、`check50`、`submit50` 和清理全收进来，日常只用敲这几条命令：

| 命令                | 作用                                                           |
| ------------------- | -------------------------------------------------------------- |
| `make r me`         | 编译并运行 `01-c/me/hello.c`                                   |
| `make s mario-less` | 对 `01-c/mario-less/mario.c` 运行 `style50`                    |
| `make c mario-less` | 离线运行 `check50` 评测 `mario/less`（加 `UPDATE=1` 联网更新） |
| `make sub credit`   | 提交 `01-c/credit/credit.c` 到 CS50                            |
| `make clean`        | 清理所有 `.c` 对应的可执行文件和 `.dSYM` 目录                  |

### 环境注入与编译参数

```makefile
export C_INCLUDE_PATH := /opt/homebrew/include
export LIBRARY_PATH   := /opt/homebrew/lib

CC      := clang
CFLAGS  := -fsanitize=signed-integer-overflow -fsanitize=undefined -fsanitize=address \
           -ferror-limit=1 -gdwarf-4 -ggdb3 -O0 -std=c23 -Wall -Werror -Wextra \
           -Wno-gnu-folding-constant -Wno-sign-compare -Wno-unused-parameter \
           -Wno-unused-variable -Wno-unused-but-set-variable -Wshadow
LDLIBS  := -lcs50
YEAR    ?= 2026
```

- `export C_INCLUDE_PATH` / `LIBRARY_PATH`：把 Homebrew 路径导出给子进程，不管直接调 `clang` 还是 `make c` 启动的 `check50` 都能直接找到 `libcs50`，不用再到处写 `-I` 和 `-L`
- `CFLAGS` 与 `LDLIBS`：保留云端 `cli.sh` 的全部编译参数，叠上三项 sanitizer 检查，库只留 `-lcs50`
- `YEAR ?= 2026`：条件赋值，未指定时默认 `2026`，跑往年题库时传 `YEAR=2025` 就能覆盖

### 解析动作与题名

```makefile
ACTIONS := b r s c sub build run style check submit
ifeq ($(filter $(firstword $(MAKECMDGOALS)),$(ACTIONS)),$(firstword $(MAKECMDGOALS)))
  NAME := $(word 2,$(MAKECMDGOALS))
  ifneq ($(NAME),)
    $(eval .PHONY: $(NAME))
    $(eval $(NAME):;@:)
  endif
endif
```

敲 `make r mario-less` 时，`make` 默认会把 `r` 和 `mario-less` 当成两个依次构建的目标。这里顺手把第二个词拦下来当题名参数：

- `MAKECMDGOALS` 与 `filter`：拿到命令行传入的目标列表，确认第一个词在 `ACTIONS` 里后，把第二个词存进 `NAME`
- `$(eval ...)`：在解析阶段把 `NAME` 注册成执行静默空命令 `@:` 的伪目标，免得跑完动作后报错找不到 `mario-less` 规则

### 定位源码与映射题库

```makefile
DIR        := $(firstword $(wildcard $(NAME) 0*-*/$(NAME)))
SRC        := $(firstword $(wildcard $(DIR)/*.c))
BIN        := $(basename $(SRC))
BASE_NAME  := $(notdir $(patsubst %/,%,$(NAME)))
AUTO_SLUG  := $(subst -less,/less,$(subst -more,/more,$(BASE_NAME)))
SLUG       := $(if $(S),$(S),$(AUTO_SLUG))
CHECK_MODE = $(if $(UPDATE),--local,--offline)
```

- `DIR`：用 `wildcard` 从当前目录或 `0*-*/` 下定位题目路径，比如 `mario-less` 会匹配到 `01-c/mario-less`
- `SRC` 与 `BIN`：抓取该目录下的 `.c` 文件（目录叫 `me`、源码叫 `hello.c` 也能匹配），再用 `basename` 去掉 `.c` 当可执行文件路径
- `BASE_NAME` 与 `AUTO_SLUG`：`patsubst` 去尾斜杠、`notdir` 取目录名后，把 `-less` 和 `-more` 替换成 `/less` 与 `/more` 得到 `mario/less`
- `SLUG`：默认用 `AUTO_SLUG`，遇到目录名和题库不一致的情况可以传 `S=...` 覆盖
- `CHECK_MODE`：默认走 `--offline` 离线秒测，传 `UPDATE=1` 时切回 `--local` 刷新本地用例缓存

### 动作目标与清理

```makefile
.DEFAULT_GOAL := help

b:
	@test -n "$(NAME)" || { echo "Usage: make r <name> (e.g. make r me)"; exit 1; }
	@test -n "$(DIR)" || { echo "Error: '$(NAME)' not found under $(NAME)/ or 0*-*/$(NAME)/"; exit 1; }
	@if [ -f "$(DIR)/Makefile" ]; then $(MAKE) -C "$(DIR)"; else $(CC) $(CFLAGS) $(SRC) -o $(BIN) $(LDLIBS); fi

r: b
	./$(BIN)

c:
	@test -n "$(NAME)" || { echo "Usage: make c <name> (e.g. make c me)"; exit 1; }
	@test -n "$(DIR)" || { echo "Error: '$(NAME)' not found under $(NAME)/ or 0*-*/$(NAME)/"; exit 1; }
	cd $(DIR) && check50 $(CHECK_MODE) cs50/problems/$(YEAR)/x/$(SLUG)

clean:
	@find . -maxdepth 4 -name '*.c' -exec sh -c 'for f; do rm -f "$${f%.c}"; rm -rf "$${f%.c}.dSYM"; done' _ {} +
```

- `.DEFAULT_GOAL := help`：直接敲 `make` 不带参数时打印用法说明
- `@test -n`：`@` 用来隐藏命令回显，先确认题名和目录都存在，缺参直接提示用法并退出
- `b` 与 `r`：遇到后面自带官方 `Makefile` 的多文件作业，自动用 `$(MAKE) -C` 进子目录编译，单文件题直接调 `clang`，`r` 把 `b` 设为依赖，编完就会直接运行
- `s`、`c` 与 `sub`：做完同样的校验后分别跑 `style50`、`check50` 和 `submit50`，评测和提交前先 `cd $(DIR)` 确保只检查当前目录
- `clean`：macOS 开 `-ggdb3` 会在可执行文件旁生成 `.dSYM` 调试目录，扫描 4 层内的 `.c` 文件并用 Shell 参数展开 `${f%.c}` 把可执行文件和 `.dSYM` 一并删掉（`$$` 用来把 `$` 转义留给 Shell）
