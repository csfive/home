# Tic-Tac-Toe

一个简单的井字棋项目，写给那些学了很多语法但不知道下一步该做什么的人。

## Board

首先我们需要一个 3 ✖️ 3 的棋盘，可以用一个简单的列表来表示，每个元素就代表一个棋盘格。

```py
[
    None, None, None,
    None, None, None,
    None, None, None
]
```

任务一：实现 `new_board()` 函数，返回一个空棋盘，也就是一个全为 `None` 的列表。

```py
def new_board():
    # 补全它
```

::: details 参考

```py
def new_board():
    return [None] * 9
```

:::

## Render

为了简化，我们会将棋盘直接 print 到终端内，就像这样：

```
    1 2 3
   -------
1 | X O X |
2 | O X O |
3 |       |
   -------
```

任务二：实现 `print_board(board)` 函数，接受棋盘作为参数，然后打印出棋盘。

```py
def print_board(board):
    # 补全它
```

提示：`print()` 函数可以使用 `end` 参数来指定换行符。

::: details 参考

```py
def print_board(board):
    print("    1 2 3")
    print("   -------")
    for row in range(3):
        print(f"{row + 1} | ", end="")
        for col in range(3):
            print(board[row * 3 + col] or " ", end=" ")
        print("|")
    print("   -------")
```

:::

## Input

任务三：获取玩家输入，范围是 [1, 9]，如果输入不符合要求或已经被占用，则提示重新输入。

```py
def get_move(board):
    # 补全它
```

::: details 参考

```py
def get_move(board):
    while True:
        try:
            move = int(input("Enter move (1-9): ")) - 1
            if move < 0 or move >= 9:
                raise ValueError
            if board[move] is not None:
                print("This square is already taken, try again.")
                continue
            return move
        except ValueError:
            print("Invalid input, try again.")
```

:::

## Move

任务四：实现 `make_move(board, move, player)` 函数，在对应位置放置玩家的棋子。

```py
def make_move(board, move, player):
    # 补全它
```

::: details 参考

```py
def make_move(board, move, player):
    board[move] = player
```

:::

## Winner

任务五：检测有无获胜者，如果有，则返回获胜者，否则返回 `None`。

```py
def check_winner(board):
    lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ]

    # 补全它
```

::: details 参考

```py
def check_winner(board):
    lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ]

    for line in lines:
        a, b, c = line
        if board[a] and board[a] == board[b] == board[c]:
            return board[a]
    return None
```

:::

## Draw

任务六：如果没有获胜者，则继续检测棋盘是否已经被占满，如果是，则判定为平局。

```py
def check_draw(board):
    # 补全它
```

::: details 参考

```py
def check_draw(board):
    return None not in board
```

:::

## Game Loop

任务七：组合以上函数，实现一个完整的游戏循环。

```py
def play_game():
    # 初始化棋盘
    # 初始化玩家
    # 显示棋盘
    while True:
        # 玩家输入
        # 显示输入后的棋盘
        # 判定输赢或平局
        # 切换玩家

if __name__ == "__main__":
    play_game()
```

::: details 参考

```py
def play_game():
    board = new_board()
    player = "X"
    print_board(board)
    while True:
        move = get_move(board)
        make_move(board, move, player)
        print_board(board)
        winner = check_winner(board)
        if winner:
            print(f"{winner} wins!")
            break
        if check_draw(board):
            print("Draw!")
            break
        player = "O" if player == "X" else "X"
```

:::

## Random AI

任务八：实现 AI 随机落子的函数，返回一个随机的棋子位置。

```py
def get_random_ai_move(board):
    # 补全它
```

::: details 参考

```py
def get_random_ai_move(board):
    available_moves = [i for i in range(9) if board[i] is None]
    return random.choice(available_moves)

def play_game():
    ...
    while True:
        if player == "X":
            move = get_move(board)
        else:
            move = get_random_ai_move(board)
        make_move(board, move, player)
        ...
```

:::

## Minimax AI

任务十：学习并实现 Minimax 算法，实现 AI 的最佳落子。

```py
def get_ai_move(board):
    # 补全它
```

::: details 参考

```py
def get_ai_move(board):
    best_score = float("-inf")
    best_move = None
    for i in range(len(board)):
        if board[i] is None:
            board[i] = "O"
            score = minimax(board, False)
            board[i] = None
            if score > best_score:
                best_score = score
                best_move = i
    return best_move


def minimax(board, is_maximizing):
    winner = check_winner(board)
    if winner == "X":
        return -10
    elif winner == "O":
        return 10
    elif check_draw(board):
        return 0

    if is_maximizing:
        best_score = float("-inf")
        for i in range(len(board)):
            if board[i] is None:
                board[i] = "O"
                score = minimax(board, False)
                board[i] = None
                best_score = max(score, best_score)
        return best_score
    else:
        best_score = float("inf")
        for i in range(len(board)):
            if board[i] is None:
                board[i] = "X"
                score = minimax(board, True)
                board[i] = None
                best_score = min(score, best_score)
        return best_score
```

:::
