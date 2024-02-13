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
