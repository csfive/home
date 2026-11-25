# 怎么设置本地运行环境

脱离云端 `cs50.dev`，在 Apple Silicon macOS 上搭一套与官方风格、编译和评测规则对齐，同时支持离线秒测与直接提交的本地 C 开发环境。

```svg-diagram
<svg viewBox="0 0 680 200" role="img" aria-label="CS50x macOS 本地开发环境三层结构" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="cs50-setup-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
      <path d="M 0 0.7 L 6.5 3.5 L 0 6.3 z" fill="var(--info)" />
    </marker>
  </defs>

  <rect x="16" y="16" width="312" height="70" rx="10" fill="var(--sidebar)" stroke="var(--border)" stroke-width="1.2" />
  <text x="172" y="45" text-anchor="middle" font-size="13.5" font-weight="600" fill="var(--foreground)">编辑器层 · VS Code</text>
  <text x="172" y="66" text-anchor="middle" font-size="10.5" font-family="var(--font-mono)" fill="var(--muted-foreground)">vscode-clangd · .clangd · .clang-format</text>

  <rect x="352" y="16" width="312" height="70" rx="10" fill="var(--sidebar)" stroke="var(--border)" stroke-width="1.2" />
  <text x="508" y="45" text-anchor="middle" font-size="13.5" font-weight="600" fill="var(--foreground)">CLI 评测层 · uv 工具集</text>
  <text x="508" y="66" text-anchor="middle" font-size="10.5" font-family="var(--font-mono)" fill="var(--muted-foreground)">style50 · check50 --offline · submit50</text>

  <line x1="172" y1="86" x2="172" y2="116" stroke="var(--info)" stroke-width="1.6" marker-end="url(#cs50-setup-arrow)" />
  <line x1="508" y1="86" x2="508" y2="116" stroke="var(--info)" stroke-width="1.6" marker-end="url(#cs50-setup-arrow)" />

  <rect x="16" y="118" width="648" height="66" rx="10" fill="var(--sidebar)" stroke="var(--success)" stroke-width="1.2" />
  <text x="340" y="145" text-anchor="middle" font-size="13.5" font-weight="600" fill="var(--foreground)">macOS 本地工具链底座</text>
  <text x="340" y="166" text-anchor="middle" font-size="11" fill="var(--muted-foreground)">Xcode CLT（clang · clangd · libc）+ /opt/homebrew（libcs50 · clang-format · uv）</text>
</svg>
```

## 工具链与 libcs50

```bash
# 1. 系统 C 工具链（clang、clangd、make、libc）
xcode-select --install

# 2. Homebrew 安装格式化器与 Python CLI 管理工具 uv
brew install clang-format uv

# 3. 用 uv 隔离安装 CS50 三件套（独立虚拟环境，不污染系统 Python）
uv tool install check50
uv tool install style50
uv tool install submit50

# 4. libcs50 不在 Homebrew 官方源中，直接从源码装进 /opt/homebrew
git clone https://github.com/cs50/libcs50.git
DESTDIR=/opt/homebrew make -C libcs50 install
```

装完后，头文件和动态库会落在 `/opt/homebrew/include/cs50.h` 与 `/opt/homebrew/lib/libcs50.dylib`。

## VS Code 扩展

- **必装 `clangd`**（`llvm-vs-code-extensions.vscode-clangd`）：提供代码补全、悬停文档、实时诊断和 `clang-format` 格式化
- **推荐 `CodeLLDB`**（`vadimcn.vscode-lldb`）：断点调试器，后面查指针和内存越界很顺手
- **不要装微软的 `C/C++`**（`ms-vscode.cpptools`）：和 `clangd` 功能重叠，混装会互相抢语言服务

## `.clang-format` 与 `style50`

看 `style50` 的 [源码](https://github.com/cs50/style50/blob/main/style50/languages.py#L14-L21) 会发现，它只是把标准 `clang-format` 包了一层，又补上了字符级 diff、打分和注释统计。把其中的 [`C.styleConfig`](https://github.com/cs50/style50/blob/main/style50/languages.py#L18) 放进 `.clang-format`，格式化时就能和 `style50` 对齐：

```yaml [.clang-format]
BasedOnStyle: LLVM
AllowShortFunctionsOnASingleLine: Empty
BreakBeforeBraces: Custom
BraceWrapping:
  AfterCaseLabel: true
  AfterControlStatement: Always
  AfterFunction: true
  AfterStruct: true
  BeforeElse: true
  BeforeWhile: true
ColumnLimit: 100
IndentCaseLabels: true
IndentWidth: 4
SpaceAfterCStyleCast: true
TabWidth: 4
```

## `.clangd` 与编辑器配置

`.clangd` 用来把 `/opt/homebrew/include` 加进头文件搜索路径，让 `#include <cs50.h>` 不报红，顺便开 `-Wshadow` 提醒内外层变量遮蔽：

```yaml [.clangd]
CompileFlags:
  Add:
    - -I/opt/homebrew/include
    - -std=c11
    - -Wall
    - -Wextra
    - -Wshadow
```

这里不加 `-Werror` 和 `-fsanitize=...`，避免写到一半编辑器满屏红线干扰节奏，留到终端编译时再拦就行。

编辑器配置固定调用系统自带的 `/usr/bin/clangd`，传入三个参数并开启 C 文件保存自动格式化：

- `--background-index`：后台建立代码索引，跳转定义和查找引用更快
- `--clang-tidy`：开启静态分析，提前提示常见写法问题
- `--header-insertion=never`：禁止补全函数时自动插入 macOS 内部头文件
- `[c]`：指定 C 文件默认用 `clangd` 格式化，并在保存时自动触发

```json [.vscode/settings.json]
{
  "clangd.path": "/usr/bin/clangd",
  "clangd.arguments": ["--background-index", "--clang-tidy", "--header-insertion=never"],
  "[c]": {
    "editor.defaultFormatter": "llvm-vs-code-extensions.vscode-clangd",
    "editor.formatOnSave": true
  }
}
```

## `check50` 与本地差异

顺着 `check50` 的 [交互调度](https://github.com/cs50/check50/blob/main/check50/_api.py#L10) 和 [C 编译源码](https://github.com/cs50/check50/blob/main/check50/c.py#L10-L16) 看下来，运行机制还是很清晰的：

- 用 Python 的 `pexpect` 开伪终端模拟输入，再比对 `stdout` 和退出码
- 测试用例在 [cs50/problems](https://github.com/cs50/problems/tree/2026/x) 对应分支里，跑过一次 `--local` 缓存到 `~/.local/share/check50/cs50/problems` 后，加 **`--offline`** 就能断网秒测
- `check50.c.compile()` 直接调用 `clang -std=c11 -ggdb -lm -lcs50`，不会带 Homebrew 路径，需要靠环境变量注入（见 [怎么写 Makefile](/cs50x/makefile) 的 `export` 写法）

| 差异点                 | `cs50.dev` 云端（Linux）                                                        | macOS 本地（Apple Silicon）                                                    |
| ---------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **头/库路径**          | 默认位于 `/usr/include`、`/usr/lib`                                             | 装在 `/opt/homebrew`，由 `Makefile` 注入 `C_INCLUDE_PATH` / `LIBRARY_PATH`     |
| **加密库 `-lcrypt`**   | `make` 默认会追加 `-lcrypt`                                                     | macOS 已合进系统库，不用加                                                     |
| **内存越界与泄漏检查** | 后端跑 [`valgrind`](https://github.com/cs50/check50/blob/main/check50/c.py#L75) | 不支持 `valgrind`，平时编译改开 `-fsanitize=address,undefined`（ASan + UBSan） |

## `submit50` 与目录结构

- 在 GitHub 配好 SSH 公钥（`ssh -T git@github.com` 能通），再到 [submit.cs50.io](https://submit.cs50.io) 授权一次账号，就能正常使用在线 `check50` 和 `submit50`
- 看题库的 [`.cs50.yml`](https://github.com/cs50/problems/blob/2026/x/mario/less/.cs50.yml#L1-L7) 可知，`check50` 和 `submit50` **只检查当前目录下的目标文件**（如 `mario.c`），所以外层目录随便怎么分层（比如按周放 `01-c/mario-less/`）都没影响
