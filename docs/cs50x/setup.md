# 怎么设置本地运行环境

在 Apple Silicon macOS 上脱离云端 `cs50.dev`，搭一套与官方风格、编译和评测规则对齐，同时支持离线秒测与直接提交的本地 C 开发环境。

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

- **必装 `clangd`**（`llvm-vs-code-extensions.vscode-clangd`）：提供代码补全、悬停文档与实时诊断，并自带 `clang-format` 格式化。
- **推荐 `CodeLLDB`**（`vadimcn.vscode-lldb`）：Apple Silicon 原生断点调试器，后续排查指针与内存越界很顺手。
- **不要装微软的 `C/C++`**（`ms-vscode.cpptools`）：与 `clangd` 功能重叠、体量大，混装会互相抢接语言服务。

## `.clang-format` 与 `style50`

翻看 `style50` [源码](https://github.com/cs50/style50/blob/main/style50/languages.py#L14-L21) 会发现，它对 C 语言并没有另写解析器，而是把标准 `clang-format` 包了一层，再补上字符级 diff、打分和注释统计。把里面硬编码的 [`C.styleConfig`](https://github.com/cs50/style50/blob/main/style50/languages.py#L18) 直接放进 `.clang-format`，保存时就能和 `style50` 完全对齐：

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

`.clangd` 负责把 `/opt/homebrew/include` 喂给语言服务，让 `#include <cs50.h>` 不报红，同时开启 `-Wshadow` 提前标出外内层变量遮蔽：

```yaml [.clangd]
CompileFlags:
  Add:
    - -I/opt/homebrew/include
    - -std=c11
    - -Wall
    - -Wextra
    - -Wshadow
```

这里刻意不加 `-Werror` 和 `-fsanitize=...`——写到一半时编辑器满屏红线很干扰节奏，把强拦截留给终端编译阶段即可。

编辑器配置固定调用系统自带的 `/usr/bin/clangd`，并加上 `--header-insertion=never`，防止补全函数时擅自插入 macOS 内部头文件：

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

顺着 `check50` 的 [交互调度](https://github.com/cs50/check50/blob/main/check50/_api.py#L10) 与 [C 编译源码](https://github.com/cs50/check50/blob/main/check50/c.py#L10-L16) 看下来，它的本地运行机制很清晰：

- 用 Python 的 `pexpect` 开伪终端模拟输入，再比对 `stdout` 与退出码；
- 测试用例保存在 [cs50/problems](https://github.com/cs50/problems/tree/2026/x) 对应分支里，跑过一次 `--local` 后会缓存到 `~/.local/share/check50/cs50/problems`，之后加 **`--offline`** 就能完全断网秒测；
- `check50.c.compile()` 内部直接调用 `clang -std=c11 -ggdb -lm -lcs50`，不会自动追加 Homebrew 路径，需要靠环境变量注入（见 [怎么写 Makefile](/cs50x/makefile) 中的 `export` 写法）。

| 差异点                 | `cs50.dev` 云端（Linux）                                                        | macOS 本地（Apple Silicon）                                                                     |
| ---------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **头/库路径**          | 默认位于 `/usr/include`、`/usr/lib`                                             | 装在 `/opt/homebrew`，由 `Makefile` 注入 `C_INCLUDE_PATH` / `LIBRARY_PATH`（不污染 `~/.zshrc`） |
| **加密库 `-lcrypt`**   | `make` 默认会追加 `-lcrypt`                                                     | macOS 已合进系统库，加上反而报 `library 'crypt' not found`，需去掉                              |
| **内存越界与泄漏检查** | 后端跑 [`valgrind`](https://github.com/cs50/check50/blob/main/check50/c.py#L75) | 不支持 `valgrind`，平时编译改开 `-fsanitize=address,undefined`（ASan + UBSan）                  |

## `submit50` 与目录结构

- 在 GitHub 添加 `~/.ssh/id_ed25519.pub` 公钥并用 `ssh -T git@github.com` 验通后，到 [submit.cs50.io](https://submit.cs50.io) 完成一次账号授权，即可免密走 SSH 提交。
- 从题库的 [`.cs50.yml`](https://github.com/cs50/problems/blob/2026/x/mario/less/.cs50.yml#L1-L7) 可以看到：`submit50` 与 `check50` 共用同一份 `!exclude "*"` / `!require <文件名>` 规则，**只检查当前目录下的目标文件**（例如 `mario.c`），外层按周建成 `01-c/mario-less/` 完全兼容。
