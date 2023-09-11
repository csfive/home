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
# Similar to string
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
# Similar to list, but immutable
my_tuple = (1, 2, 3)
my_tuple = tuple((1, 2, 3))
```

```python
# Set of unique values
my_set = {"a", "b", "c"}
my_set = set(("a", "b", "c"))
```

```python
# JSON like object, key-value pairs
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

f'{"text":10}'        # [width] => 'text      '
f'{12345:0>10}'       # fill left => 0000012345
f'{"text":*<10}'      # fill right => text******
f'{"text":*^10}'      # fill center => ***test***

f'{12345:010}'        # => 0000012345
f'{-12345:010}'       # => -000012345

# Types
f'{10:b}'             # binary => 1010
f'{10:#b}'            # with notation => 0b1010
f'{200:x}'            # hexadecimal => c8
f'{65:c}'             # character => A

# Others
f'{math.pi:.2f}'      # => 3.14
f'{1000000:,.2f}'     # => 1,000,000.00

f'{0.25:0%}'          # => 25.000000%
f'{0.25:.0%}'         # => 25%

f'{12345:+}'          # => +12345
f'{-12345:+}'         # => -12345
```

## Flow Control

```python
num = 5
if num > 10:
    print("num is totally bigger than 10.")
elif num < 10:
    print("num is smaller than 10.")
else:
    print("num is indeed 10.")
```

```python
# one line
a = 330
b = 200
r = "a" if a > b else "b"
print(r)
# a
```

## Loops

```python
primes = [2, 3, 5, 7]
for prime in primes:
    print(prime)
```

```python
animals = ["dog", "cat", "mouse"]
for i, value in enumerate(animals):
    print(i, value)

# Skip break and continue ...
```

```python
# range()
for i in range(4):
    print(i)                   # 0 1 2 3

for i in range(4, 8):
    print(i)                   # 4 5 6 7

for i in range(4, 10, 2):
    print(i)                   # 4 6 8
```

```python
# zip()
words = ['Mon', 'Tue', 'Wed']
nums = [1, 2, 3]

for w, n in zip(words, nums):
    print(f'{n}:{w}, ', end='')
```

```python
# for-else
nums = [60, 70, 30, 110, 90]
for n in nums:
    if n > 100:
        print("%d is bigger than 100" %n)
        break
else:
    print("Not found!")
```

## Functions

```python
def add(x, y):
    print(f"x is {x}, y is {y}")
    return x + y

add(5, 6)
# => 11
```

```python
def varargs(*args):
    return args

varargs(1, 2, 3)
# => (1, 2, 3)
```

```python
def keyword_args(**kwargs):
    return kwargs

keyword_args(big="foot", loch="ness")
# => {"big": "foot", "loch": "ness"}
```

```python
# Returning multiple
def swap(x, y):
    return y, x

# Default value
def add(x, y=10):
    return x + y

# Anonymous functions
(lambda x: x > 2)(3)
(lambda x, y: x ** 2 + y ** 2)(2, 1)
```

## Modules

```python
import math
math.sqrt(16)  # => 4.0
```

```python
from math import ceil, floor
ceil(3.7)      # => 4.0
floor(3.7)     # => 3.0
```

```python
from math import *
```

```python
import math as m
math.sqrt(16) == m.sqrt(16)
# => True
```

```python
# Functions and attributes
import math
dir(math)
```

## Class

```python
# Defining and method
class Dog:
	def bark(self):
        print("Ham-ham")

# Class instantiation
charlie = Dog()
charlie.bark()     # Ham-ham
```

```python
# Constructors
class Animal:
    def __init__(self, voice):
        self.voice = voice

    def __repr__(self):
        return self.voice

cat = Animal('Meow')
print(cat.voice)      # => Meow
print(cat)            # => Meow
```

```python
class ParentClass:
    def print_test(self):
        print("Parent Method")

class ChildClass(ParentClass):
    def print_test(self):
        print("Child Method")
        # Calls the parent's print_test()
        super().print_test()

child_instance = ChildClass()
child_instance.print_test()
# Child Method
# Parent Method
```

```python
class ParentClass:
    def print_self(self):
        print("Parent")

class ChildClass(ParentClass):
    # overriding
    def print_self(self):
        print("Child")

child_instance = ChildClass()
child_instance.print_self()        # => Child
```

```python
class Animal:
    def __init__(self, name, legs):
        self.name = name
        self.legs = legs

class Dog(Animal):
    def sound(self):
        print("Woof!")

Yoki = Dog("Yoki", 4)
print(Yoki.name)            # => YOKI
print(Yoki.legs)            # => 4
Yoki.sound()                # => Woof!
```

## Exception

```python
try:
    raise IndexError("error")
except IndexError as e:
    pass
except (TypeError, NameError):
    pass
else:
    print("All good")
finally:
    print("Clean up resources here")
```

```python
# User-defined exceptions
class CustomError(Exception):
    pass
```

## File Handling

```python
with open("myfile.txt") as file:
    for line in file:
        print(line)
```

```python
# With line number
file = open('myfile.txt', 'r')
for i, line in enumerate(file, start=1):
    print(f"Number {i}: {line}")
```

```python
contents = {"aa": 12, "bb": 21}
with open("myfile1.txt", "w+") as file:
    file.write(str(contents))           # write a string
    file.write(json.dumps(contents))    # write a object
```

```python
with open('myfile1.txt', "r+") as file:
    contents = file.read()              # read a string
	contents = json.load(file)          # read a object
```

```python
import os

os.remove("myfile.txt")
os.rmdir("myfolder")

# check
if os.path.exists("myfile.txt"):
    os.remove("myfile.txt")
else:
    print("The file does not exist")
```

## Advanced Data Types

```python
import heapq

my_list = [9, 5, 4, 1, 3, 2]
heapq.heapify(my_list)               # turn into a min heap
print(my_list)                       # [1, 3, 2, 5, 9, 4]

heapq.heappush(my_list, 10)
heapq.heappop(my_list)               # => 1
```

```python
from collections import deque

q = deque()
q = deque([1, 2, 3])

q.append(4)
q.appendleft(0)           # => deque([0, 1, 2, 3, 4])
q.pop()                   # 4
q.popleft()               # 0
q.rotate(1)               # => deque([3, 1, 2])
```
