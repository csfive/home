# Style Guide

- [Ruff Docs](https://docs.astral.sh/ruff/)
- [PEP 8 – Style Guide for Python Code](https://peps.python.org/pep-0008/)
- [PEP 257 – Docstring Conventions](https://peps.python.org/pep-0257/)
- [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html)

## Ruff

> An extremely fast Python linter and code formatter, written in Rust.

安装 [VS Code 插件](https://marketplace.visualstudio.com/items?itemName=charliermarsh.ruff) ，简单配置如下：

```json
// .vscode/settings.json
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

### Others

- Modules (filenames): short, all-lowercase names, and they can contain underscores
- Packages (directionaries): short, all-lowercase names, preferably without underscores
- Variable names are not full descriptors
- Put details in comments
- Too specific name might mean too specific code
- Keep short scopes for quick lookup
- Spend time thinking about readability

### Summary

| Type                       | Public               | Internal              |
| :------------------------- | :------------------- | :-------------------- |
| Packages                   | `lower_with_under`   |                       |
| Modules                    | `lower_with_under`   | `_lower_with_under`   |
| Classes                    | `CapWords`           | `_CapWords`           |
| Exceptions                 | `CapWords`           |                       |
| Functions                  | `lower_with_under()` | `_lower_with_under()` |
| Global/Class Constants     | `CAPS_WITH_UNDER`    | `_CAPS_WITH_UNDER`    |
| Global/Class Variables     | `lower_with_under`   | `_lower_with_under`   |
| Instance Variables         | `lower_with_under`   | `_lower_with_under`   |
| Method Names               | `lower_with_under()` | `_lower_with_under()` |
| Function/Method Parameters | `lower_with_under`   |                       |
| Local Variables            | `lower_with_under`   |
