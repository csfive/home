# Python 包管理小结

## 虚拟环境

不同的 Python App 可能需要不同版本的包，如果全局安装可能会存在冲突。

解决方案是创建一个虚拟环境，也是一个独立的目录树，其中包含 Python 解释器副本和各种支持文件。

```sh
# 创建
python -m venv tutorial-env

# 激活
source tutorial-env/bin/activate

# 停用
deactivate
```

## pip

使用 pip 来安装、升级和删除包。

```sh
python -m pip install novas
python -m pip install requests==2.6.0      # 特定版本
python -m pip install --upgrade requests   # 升级到最新
python -m pip uninstall 
python -m pip show
python -m pip list 
python -m pip freeze
```

## Rye

> Rye is a comprehensive project and package management solution for Python.

Flask 作者写的一个 All in One 的 Python 一站式管理工具，具体可以看作者发的 [视频](https://www.youtube.com/watch?v=q99TYA7LnuA)。

```sh
curl -sSf https://rye-up.com/get | bash
rye init my-project
rye sync
rye add "flask>=2.0"
rye remove flask
rye show
rye show --installed-deps

. .venv/bin/activate
deactivate
```

## PDM

> PDM, as described, is a modern Python package and dependency manager supporting the latest PEP standards. But it is more than a package manager. It boosts your development workflow in various aspects.

比起 rye 更成熟，已经活跃了很长时间的依赖管理工具。

```sh
curl -sSL https://pdm-project.org/install-pdm.py | python3 -

mkdir my-project && cd my-project
pdm init
pdm info
pdm list
pdm list --tree
pdm export -o requirements.txt
pdm build
pdm publish
pdm config
pdm run  # like npm run 

pdm add requests   # add requests
pdm add requests==2.25.1   # add requests with version constraint
pdm add requests[socks]   # add requests with extra dependency
pdm add "flask>=1.0" flask-sqlalchemy   # add multiple dependencies with different specifiers
pdm add ./sub-package
pdm add ./first-1.0.0-py2.py3-none-any.whl
pdm add "https://github.com/numpy/numpy/releases/download/v1.20.0/numpy-1.20.0.tar.gz"
pdm add "https://github.com/explosion/spacy-models/releases/download/en_core_web_trf-3.5.0/en_core_web_trf-3.5.0-py3-none-any.whl"
pdm add "git+https://github.com/pypa/pip.git@22.0"
pdm add -dG test pytest  # development only dependencies

pdm remove requests  # Remove requests from the default dependencies
pdm remove -G web h11  # Remove h11 from the 'web' group of optional-dependencies
pdm remove -dG test pytest-cov  # Remove pytest-cov from the `test` group of dev-dependencies

pdm sync
pdm update
pdm install
```