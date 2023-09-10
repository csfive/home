# Python Cheat Sheet

> For more information, see the [Python documentation](https://docs.python.org/).

```py
print("Hello, World!")
# Hello, World!
```

## Built-in Data Types

```py
hello = 'hello'
hello = "Hello"
multi_string = """Hello
World From Python"""
```

```py
x = 1    # int
y = 2.8  # float
z = 1j   # complex

print(type(x))
# <class 'int'>
```

```py
my_bool = True
my_bool = False

bool(0)  # => False
bool(1)  # => True
```

```py
my_list = ["apple", "banana", "cherry"]
my_list = [True, False, False]
my_list = [1, 5, 7, 9, 3]
my_list = list((1, 5, 7, 9, 3))
```

```py
# similar to list, but immutable
my_tuple = (1, 2, 3)
my_tuple = tuple((1, 2, 3))
```

```py
# set of unique values
my_set = {"a", "b", "c"}
my_set = set(("a", "b", "c"))
```

```py
# key-value pairs, JSON like object
empty_dict = {}
my_dict = { "one": 1, "two": 2, "three": 3 }

my_dict["one"]    # => 1
my_dict.keys()    # => dict_keys(['one', 'two', 'three'])
my_dict.values()  # => dict_values([1, 2, 3])
my_dict.update({ "four": 4 })
my_dict["four"]   # => 4
```

## Strings

```py
# Get the character at position 1 or last
hello = "Hello"
hello[0]   # => H
hello[-1]  # => o
```

```py
# Loop through the letters in the word "foo"
for char in "foo":
    print(char)
# f
# o
# o
```

```py
#  ┌───┬───┬───┬───┬───┬───┬───┐
#  | m | y | b | a | c | o | n |
#  └───┴───┴───┴───┴───┴───┴───┘
#  0   1   2   3   4   5   6   7
# -7  -6  -5  -4  -3  -2  -1
my_str = "mybacon"
my_str[2:5]         # => bac
my_str[0:2]         # => my
my_str[:2]          # => my
my_str[2:]          # => bacon
my_str[:2] + s[2:]  # => mybacon
my_str[:]           # => mybacon
my_str[-5:-1]       # => baco

# With a stride
my_str[2:5:2]       # => bc
my_str[::2]         # => mbcn
my_str[::-1]        # => nocabym
```

```py
# Get the string length
hello = "Hello" * 5
len(hello)  # => 25
```

```py
s = "spam"
s in "I saw spamalot!'"           # => True
s not in "I saw The Holy Grail!"  # => True
```

```py
# Get input data from console
name = input("Enter your name: ")
```

```py
"#".join(["a", "b", "c"])  # => a#b#c
```

## F-strings

## Flow Control

## Loops

## Functions

## Lists

## Modules

## Advanced Data Types
