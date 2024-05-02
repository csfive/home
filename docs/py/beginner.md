# Tic-Tac-Toe

一个简单的井字棋项目，写给那些学了很多语法但不知道下一步该做什么的人。

## Board

首先我们需要一个长宽相同的 3 ✖️ 3 的棋盘，定义一个常量之后用。

```py
BOARD_SIZE = 3
```

棋盘可以用一个简单的嵌套列表来表示，每个元素就代表一个棋盘格，棋盘格内有三种状态：`X`, `O` 和 `None` 也就是空。

```py
[
  ['X', None, 'O'],
  ['O', 'X', None],
  [None, None, 'X']
]
```

那么第一个任务就是 `new_board()` 函数，返回一个空棋盘也就是一个 3 ✖️ 3 的全为 `None` 的嵌套列表。

使用 `python3 -m doctest engine.py` 命令来测试你的代码。

```py
def new_board():
    """
    >>> new_board()
    [[None, None, None], [None, None, None], [None, None, None]]
    """
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
def new_board():
    return [[None for _ in range(BOARD_SIZE)] for _ in range(BOARD_SIZE)]
```

:::

## Render

为了简化，我们会将棋盘直接 print 到终端内，所以第二个任务是实现 `render_board(board)` 函数，接受棋盘作为参数，然后打印出棋盘。

```py
def render_board(board):
    """
    >>> board = new_board()
    >>> board[0][0] = "X"
    >>> board[1][2] = "O"
    >>> board[2][1] = "X"
    >>> render_board(board)
        0 1 2
       -------
    0 | X     |
    1 |     O |
    2 |   X   |
       -------
    """
    # 补全它
```

提示：`print()` 函数可以使用 `end` 参数来指定换行符。

::: details 参考

```py
def render_board(board):
    print("    0 1 2")
    print("   -------")
    for row in range(BOARD_SIZE):
        print(f"{row} | ", end="")
        for col in range(BOARD_SIZE):
            print(board[row][col] or " ", end=" ")
        print("|")
    print("   -------")
```

:::

## Input

任务三：获取玩家输入的以空格分开的行列坐标 `row col`，范围是 [0, 2]，如果输入不符合要求或已经被占用，则提示重新输入。

```py
def get_move(board):
    # 补全它，doctest 不能模拟用户输入，所以需要手动测试
```

::: details 参考

```py
def get_move(board):
    while True:
        try:
            row, col = map(
                int, input("Enter row and column (0~2), separated by a space: ").split()
            )
            if row < 0 or row > BOARD_SIZE - 1 or col < 0 or col > BOARD_SIZE - 1:
                print("Invalid input, please try again.")
                continue
            if board[row][col] is not None:
                print("This square is already taken, please try again.")
                continue
            return row, col
        except ValueError:
            print("Invalid input, please try again.")
```

:::

## Move

任务四：实现 `make_move(board, coord, player)` 函数，接受棋盘、行列坐标和玩家作为参数，然后在相应位置放置玩家的棋子。

为了避免数据突变，我们应该返回一个新的棋盘，而不是直接修改原来的棋盘。

```py
def make_move(board, coord, player):
    """
    >>> old_board = [['X', None, None], [None, None, None], [None, 'O', 'O']]
    >>> new_board = make_move(old_board, (1, 1), 'X')
    >>> new_board[1][1]
    'X'
    """
    # 补全它
```

::: details 参考

```py
def make_move(board, coord, player):
    new_board = board.copy()
    new_board[coord[0]][coord[1]] = player
    return new_board
```

:::
