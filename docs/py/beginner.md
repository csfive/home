# Tic-Tac-Toe

这是一个简单的井字棋项目，写给那些学了很多语法但不知道下一步该做什么的人。

## Board

首先我们需要一个长宽相同的 3 ✖️ 3 的棋盘：

```py
BOARD_SIZE = 3
```

棋盘可以用一个简单的嵌套列表来表示，每个元素就代表一个棋盘格，棋盘格内有三种状态：`X`, `O` 和 `None` 也就是空：

```py
[
  ['X', None, 'O'],
  ['O', 'X', None],
  [None, None, 'X']
]
```

那么第一个任务就是 `new_board()` 函数，返回一个空棋盘也就是一个 3 ✖️ 3 的全为 `None` 的嵌套列表：

```py
def new_board():
    # 补全它
```

::: details 参考

```py
def new_board():
    board = []
    for _ in range(BOARD_SIZE):
        col = []
        for _ in range(BOARD_SIZE):
            col.append(None)
        col.append(None)
    return board

# 使用列表推导式简化以上代码
def new_board_alt():
    return [[None for _ in range(BOARD_SIZE)] for _ in range(BOARD_SIZE)]
```

:::

## Render

为了简化，我们会直接打印在终端内，就像这样：

```shell

```
