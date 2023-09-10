# Python Cheat Sheet

For more information, see the [Python documentation](https://docs.python.org/).

```python
print("Hello, World!")
# Hello, World!
```

## Built-in Data Types

```python
hello = 'hello'
hello = "Hello"
multi_string = """Hello
World From Python"""
```

```python
x = 1    # int
y = 2.8  # float
z = 1j   # complex

print(type(x))
# <class 'int'>
```

```python
my_bool = True
my_bool = False

bool(0)  # => False
bool(1)  # => True
```

```python
my_list = ["apple", "banana", "cherry"]
my_list = [True, False, False]
my_list = list((1, 5, 7, 9, 3))
my_list = list(range(1, 11))  # 1~10

my_list = []
my_list.append(1)
my_list.append(2)
my_list.append(3)             # => [1, 2, 3]
my_list.pop()                 # => [1, 2]
del my_list[0]                # => [2]
my_list.extend([3, 4, 5])     # => [2, 3, 4, 5]
my_list + [6, 7, 8]           # => [2, 3, 4, 5, 6, 7, 8]
```

```python
list(filter(lambda x: x % 2 == 1, range(1, 20)))
# => [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]

[x ** 2 for x in range(1, 11) if x % 2 == 1]
# => [1, 9, 25, 49, 81]

list(filter(lambda x: x > 5, [3, 4, 5, 6, 7]))
# => [6, 7]

[x for x in [3, 4, 5, 6, 7] if x > 5]
# => [6, 7]
```

```python
# similar to list, but immutable
my_tuple = (1, 2, 3)
my_tuple = tuple((1, 2, 3))
```

```python
# set of unique values
my_set = {"a", "b", "c"}
my_set = set(("a", "b", "c"))
```

```python
# key-value pairs, JSON like object
empty_dict = {}
my_dict = { "one": 1, "two": 2, "three": 3 }

my_dict["one"]                     # => 1
my_dict.keys()                     # => dict_keys(['one', 'two', 'three'])
my_dict.values()                   # => dict_values([1, 2, 3])
my_dict.update({ "four": 4 })      # => { "one": 1, "two": 2, "three": 3, "four": 4 }
my_dict["four"]                    # => 4
```

## Strings

```python
# Get the character at position 1 or last
hello = "Hello"
hello[0]     # => H
hello[-1]    # => o
```

```python
# Loop through the letters in the word "foo"
for char in "foo":
    print(char)
# f
# o
# o
```

```python
#  ┌───┬───┬───┬───┬───┬───┬───┐
#  | m | y | b | a | c | o | n |
#  └───┴───┴───┴───┴───┴───┴───┘
#  0   1   2   3   4   5   6   7
# -7  -6  -5  -4  -3  -2  -1
my_str = "mybacon"
my_str[2:5]                 # => bac
my_str[0:2]                 # => my
my_str[:2]                  # => my
my_str[2:]                  # => bacon
my_str[:2] + s[2:]          # => mybacon
my_str[:]                   # => mybacon
my_str[-5:-1]               # => baco

# With a stride
my_str[2:5:2]               # => bc
my_str[::2]                 # => mbcn
my_str[::-1]                # => nocabym
```

```python
# Get the string length
hello = "Hello" * 5
len(hello)  # => 25
```

```python
s = "spam"
s in "I saw spamalot!'"             # => True
s not in "I saw The Holy Grail!"    # => True
```

```python
# Get input data from console
name = input("Enter your name: ")
```

```python
"#".join(["a", "b", "c"])   # => a#b#c
```

## F-strings

```python
name = 'mancuoj'
f"Hello, {name}"      # => Hello, mancuoj

f'{12345:0>10}'       # fill left => 0000012345
f'{"text":*<10}'      # fill right => text******
f'{"text":*^10}'      # fill center => ***test***

# Types
f'{10:b}'             # binary => 1010
f'{10:#b}'            # with notation => 0b1010
f'{200:x}'            # hexadecimal => c8
f'{65:c}'             # character => A

# Others
f'{12345:+}'          # => +12345'
f'{-12345:+}'         # -12345

```

## Flow Control

## Loops

## Functions

## Modules

## File Handling

## Class

```python
# Defining
class MyNewClass:
  pass

# Instantiation
my = MyNewClass()
```

## Advanced Data Types
