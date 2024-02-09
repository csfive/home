# 从 0.5 开始的 Python 语法入门

## IDE

- 我只推荐 VS Code
- 扩展：ms-python.python + charliermarsh.ruff
- 相关 VS Code 配置如下

```json
{
  "[python]": {
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll": "always",
      "source.organizeImports": "always"
    },
    "editor.defaultFormatter": "charliermarsh.ruff"
  },
  "python.analysis.inlayHints.callArgumentNames": "partial",
  "python.analysis.inlayHints.functionReturnTypes": true,
  "python.analysis.inlayHints.pytestParameters": true,
  "python.analysis.inlayHints.variableTypes": true,
  "editor.inlayHints.fontSize": 10,
  "editor.inlayHints.padding": true,
}
```


## 猜数字

通过一个简单的代码示例来快速了解常用的 Python 语法。

- 注释
- 变量
- 循环
- 流程控制
- 函数
- 异常处理
- 模块

<<< @/snippets/guess.py


## 语法示例

列举一些必要示例，大多语法与主流编程语言类似，之后可以自行了解扩充。

```py
# 单行注释
""" 多行注释
    三个双引号或是三个单引号都可
    通常用于文档
"""
```

```py
x = 1    # int
y = 2.8  # float
z = 1j   # complex

hello = "Hello World"
hello = 'Hello World'
multi_string = """Multiline Strings
Lorem ipsum dolor sit amet,
consectetur adipiscing elit """

my_bool = True 
my_bool = False

list1 = ["apple", "banana", "cherry"] # 列表
list2 = [True, False, False]
list3 = list((1, 5, 7, 9, 3))

tuple1 = (1, 2, 3)   # 元组，类似于列表但不可变
tuple2 = tuple((1, 2, 3))

set1 = {"a", "b", "c"}   # 集合，不重复元素构成
set2 = set(("a", "b", "c"))

empty_dict = {}   # 字典，键值对的集合
dict1 = {"one": 1, "two": 2, "three": 3}
dict1["one"]   # => 1
```


```py
value = True
if not value:
    print("Value is False")
elif value is None:
    print("Value is None")
else:
    print("Value is True")
```

```py
for i in range(4):
    print(i) # Prints: 0 1 2 3
```

```py
animals = ["dog", "cat", "mouse"]
for i, value in enumerate(animals):
    print(i, value)
```

```py
nums = [60, 70, 30, 110, 90]
for n in nums:
    if n > 100:
        print("%d is bigger than 100" %n)
        break
else:
    print("Not found!")
```

```py
def add(x, y):
    print("x is %s, y is %s" %(x, y))
    return x + y

add(5, 6)    # => 11
```

```py
(lambda x: x > 2)(3)
# => True

(lambda x, y: x ** 2 + y ** 2)(2, 1)
# => 5

[x ** 2 for x in range (1, 11) if  x % 2 == 1]
# => [1, 9, 25, 49, 81]

list(filter(lambda x: x > 5, [3, 4, 5, 6, 7]))
# => [6, 7]
```

```py
try:
    # 使用“raise”来引发错误
    raise IndexError("这是一个索引错误")
except IndexError as e:
    pass                 # pass只是一个空操作。 通常你会在这里做恢复。
except (TypeError, NameError):
    pass                 # 如果需要，可以一起处理多个异常。
else:                    # try/except 块的可选子句。 必须遵循除块之外的所有内容
    print("All good!")   # 仅当 try 中的代码未引发异常时运行
finally:                 # 在所有情况下执行
    print("我们可以在这里清理资源")
```

```py
class Animal: 
    def __init__(self, name, legs):
        self.name = name
        self.legs = legs
    
    def __repr__(self):
        return self.name

    def sound(self):
        print("Sound~")
        
class Dog(Animal):
    def sound(self):
        print("Woof!")

Yoki = Dog("Yoki", 4)
print(Yoki)      # => YOKI
print(Yoki.name) # => YOKI
print(Yoki.legs) # => 4
Yoki.sound()     # => Woof!
```


## 模块

建议重点看一下 [文档](https://docs.python.org/zh-cn/3/tutorial/modules.html)，这里浅显地总结一下。

- `.py` 文件就是模块，文件名就是模块名，模块内部全局变量 `__name__` 也可以获取模块名
- 通过 `import xx` 可以导入模块，访问其中的函数，比如上文中我们调用的 `random.randint(1, 100)`
- 也可以直接导入函数 `from random import randint`
- 使用 as 起一个别名 `import random as ran`
- 以 `python xx.py` 运行模块时，会将 `__name__` 赋值为 `__main__`，所以经常见到的 `if __name__ == '__main__':` 语句，可以将模块当作 py 脚本直接执行，也可以在被导入时避免执行

### 包

> 文件规模继续增大，模块的复用级别不够就出现了包。

- 将不同模块组织到一个文件夹中，并创建 `__init__.py` 文件，就是包，文件夹名也就是包名
- `import a.b` 也就是导入 a 包中的 b 模块
- 包和包之间可以嵌套，可以相对导入

## 参考

- [Python 教程](https://docs.python.org/zh-cn/3/tutorial/index.html)
- [Python 语言参考手册](https://docs.python.org/zh-cn/3/reference/index.html)
- [Python Cheatsheet](https://quickref.me/python.html)
- [Learn Python in Y minutes](https://learnxinyminutes.com/docs/python/)
