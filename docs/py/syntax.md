# Syntax Basics

- [The Python Tutorial](https://docs.python.org/3/tutorial/index.html)，官方教程
- [Python Crash Course](https://book.douban.com/subject/36365320/)，Python 编程从入门到实战
- [Comprehensive Python Cheatsheet](https://gto76.github.io/python-cheatsheet/)

## Tic-Tac-Toe

> 本文目标读者是那些学了很多语法但不知道下一步该做什么的人

井字棋，大家应该都玩过，首先我们需要一个长宽相同的 3 ✖️ 3 的棋盘：

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
    board = []
    for _ in range(BOARD_SIZE):
        col = []
        for _ in range(BOARD_SIZE):
            col.append(None)
        col.append(None)
    return board
```

可以使用 [列表推导式](https://docs.python.org/zh-cn/3/tutorial/datastructures.html#list-comprehensions) 简化以上代码：

```py
def new_board():
    return [[None for _ in range(BOARD_SIZE)] for _ in range(BOARD_SIZE)]
```
