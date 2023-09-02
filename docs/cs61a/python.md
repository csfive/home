# Python Cheat Sheet

:::tip
For more information, see the [Python documentation](https://docs.python.org/).
:::

## Hello World

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
list1 = ["apple", "banana", "cherry"]
list2 = [True, False, False]
list3 = [1, 5, 7, 9, 3]
list4 = list((1, 5, 7, 9, 3))
```

```py
# similar to list, but immutable
my_tuple = (1, 2, 3)
my_tuple = tuple((1, 2, 3))
```

```py
# set of unique values
set1 = {"a", "b", "c"}
set2 = set(("a", "b", "c"))
```

```py
# key-value pairs, JSON like object
empty_dict = {}
a = { "one": 1, "two": 2, "three": 3 }

a["one"]    # => 1
a.keys()    # => dict_keys(['one', 'two', 'three'])
a.values()  # => dict_values([1, 2, 3])
a.update({ "four": 4 })
a["four"]   # => 4
```

## Strings

```py
# Get the character at position 1 or last
hello = 'Hello'
hello[0]   # => H
hello[-1]  # => o
```

```py
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
s = "mybacon"
s[2:5]         # => bac
s[0:2]         # => my
s[:2]          # => my
s[2:]          # => bacon
s[:2] + s[2:]  # => mybacon
s[:]           # => mybacon
s[-5:-1]       # => baco

# with a stride
s[2:5:2]       # => bc
s[::2]         # => mbcn
s[::-1]        # => nocabym
```

```py
# Get the string length
hello = 'Hello' * 5
len(hello)  # => 25
```


```py
s = 'spam'
s in 'I saw spamalot!'           # => True
s not in 'I saw The Holy Grail!' # => True
```

```py
```

```py

```

```py

```

## Advanced Data Types

```py

```

```py

```
