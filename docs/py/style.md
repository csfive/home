# Python 风格指南

- [Ruff Docs](https://docs.astral.sh/ruff/)
- [PEP 8 – Style Guide for Python Code](https://peps.python.org/pep-0008/)
- [PEP 257 – Docstring Conventions](https://peps.python.org/pep-0257/)
- [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html)

## Ruff

> An extremely fast Python linter and code formatter, written in Rust.

安装 [VS Code 插件](https://marketplace.visualstudio.com/items?itemName=charliermarsh.ruff) 后，配置如下：

```json [.vscode/settings.json]
{
  "[python]": {
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll": "explicit",
      "source.organizeImports": "explicit"
    },
    "editor.defaultFormatter": "charliermarsh.ruff"
  }
}
```

## Naming

### Class

```py
class fooClass: ... # [!code --]
class foo_class: ... # [!code --]

class FooClass: ... # [!code ++]
```

### Function

```py
def CapCamelCase(*a): ... # [!code --]
def mixCamelCase(*a): ... # [!code --]

def foo_bar_function(): ... # [!code ++]
```

### Variable

```py
FooVar = "CapWords" # [!code --]
fooVar = "mixedCase" # [!code --]
Foo_Var = "CapWords_With_Underscore" # [!code --]

# local variable
var = "lowercase" # [!code ++]

# internal use
_var = "_single_leading_underscore" # [!code ++]

# avoid conflicts with Python keyword
var_ = "single_trailing_underscore_" # [!code ++]

# a class attribute (private use in class)
__var = " __double_leading_underscore" # [!code ++]

# "magic" objects or attributes, ex: __init__
__name__ # [!code ++]

# throwaway variable, ex: _, v = (1, 2)
_ = "throwaway" # [!code ++]
```
