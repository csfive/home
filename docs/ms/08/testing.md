---
title: 测试
description: MIT Missing Semester 第 8 讲 · 测试
---

# 测试

测试就是用代码验证代码：跑一遍实现，断言结果符合预期，不符合就让进程以非零码退出。

## 从单元到端到端

粒度决定了测试能定位到什么。单元测试盯一个函数，失败时几乎不用排查；端到端测试走完整个流程，能发现集成问题，但失败原因往往要先手动复现一遍。

| 层级   | 验证对象           | 速度 | 稳定性 |
| ------ | ------------------ | ---- | ------ |
| 单元   | 单个函数或类       | 毫秒 | 高     |
| 集成   | 模块、数据库、HTTP | 秒   | 中     |
| 端到端 | 完整用户流程       | 分钟 | 低     |

测试金字塔的意思是：底层单元测试多，顶层端到端少。反过来做，CI 会慢到没人愿意等，而且失败信息往往指向「某个页面打不开」，对定位帮助有限。

判断该写哪一层，看你想锁定什么。算法分支用单元测试；序列化与数据库约束之间的一致性用集成测试；登录后能下单用端到端测试。

## pytest 的常用开关

```python
import pytest

@pytest.mark.parametrize("x,expected", [(2, 4), (3, 9)])
def test_square(x, expected):
    assert x * x == expected

def test_raises():
    with pytest.raises(ValueError):
        int("nope")
```

pytest 自动发现 `test_*.py` 里以 `test_` 开头的函数。断言失败时它会重写 `assert`，把两边的值打印出来，不需要手写消息。`parametrize` 把同一段逻辑展开成多条独立用例，失败时能直接看到是哪组输入。

```bash
pytest -k "square and not slow"
pytest -x
pytest --lf
pytest -q --tb=short
```

`-k` 按用例名筛选，支持 `and`、`or`、`not`；`-x` 首个失败即停；`--lf` 只跑上次失败的用例；`--tb=short` 压缩回溯，先看结论。调试时先跑单个用例，改完再跑全量。

fixture 负责准备和清理，用 `yield` 分隔两段。`tmp_path` 提供每个用例独立的临时目录，避免测试之间互相踩文件。

```python
@pytest.fixture
def db(tmp_path):
    conn = connect(tmp_path / "test.db")
    yield conn
    conn.close()
```

## 测试替身

外部依赖要换掉，否则测试会受网络、第三方服务和本机环境影响。替换的方式不止一种，选错会让测试和实现绑死。

| 替身   | 行为                   | 适合               |
| ------ | ---------------------- | ------------------ |
| stub   | 返回固定值             | 让流程走下去       |
| spy    | 记录调用，保留真实行为 | 验证「有没有调用」 |
| mock   | 预设返回值并断言调用   | 验证交互细节       |
| fake   | 有简化但真实的实现     | 内存数据库、假队列 |
| replay | 录制真实响应并回放     | 第三方 HTTP 接口   |

```python
from unittest.mock import patch

def test_status(monkeypatch):
    monkeypatch.setenv("API_URL", "http://example.test")
    with patch("app.client.get") as get:
        get.return_value = {"ok": True}
        assert fetch_status() is True
        get.assert_called_once()
```

`monkeypatch` 适合临时改环境变量和属性，测试结束自动还原；`patch` 适合替换模块里的函数。断言调用次数和参数，能锁住协议细节；但断言得太细，重构内部实现时测试会成片变红。

不想手写返回值时，可以用 `pytest-vcr` 这类录制工具：第一次跑真实请求并把响应存成文件，之后离线回放，接口测试不依赖网络。

## 测试的几种写法

三种写法各有用途：

- TDD：先写失败的测试，再写刚好让它通过的实现，最后重构。它强迫你先想清楚接口，代价是初期速度变慢
- 回归测试：修 bug 前先复现，看着它失败，再修。同一个 bug 不会回来
- 属性测试：不列举用例，描述输入范围和必须成立的性质，Hypothesis 自动生成数据并保存最小反例

```python
from hypothesis import given, strategies as st

@given(st.lists(st.integers()))
def test_reverse_twice(xs):
    assert list(reversed(list(reversed(xs)))) == xs
```

随机数、时钟、UUID 都要注入而不是直接调用。测试里直接 `datetime.now()` 或 `random.random()`，等于把不确定性写进了断言。

属性测试只覆盖你写下的那几条性质：实现错了但恰好满足这些性质时，测试照样全绿。它是例子测试的补充，不是替代。

## 让测试可靠且够快

不稳定的测试比没有测试更糟：它会训练大家忽略红灯。常见成因有五种——依赖真实时间、依赖随机数、依赖网络、用例之间共享状态、异步操作只等固定 `sleep`。对应修法是注入时钟、固定种子、打桩网络、每个用例独立目录、用轮询代替等待。

速度问题有两个方向：

- 并行：`pytest-xdist` 的 `-n auto` 按 CPU 核数分发，`--dist loadscope` 让同一文件的用例落在同一个 worker，减少 fixture 重复创建
- 分层：单元测试每次保存都跑，集成测试在 pre-push 跑，端到端测试交给 CI 或夜间任务

## 覆盖率

```bash
coverage run -m pytest
coverage report -m
coverage html
pytest --cov=src --cov-branch --cov-report=html
```

`coverage html` 生成 `htmlcov/index.html`，逐行标出执行过和没执行过的代码。分支覆盖比行覆盖严格：`if` 只走真分支时，行覆盖看起来是满的，分支覆盖会指出假分支没测。

`coverage xml` 输出机器可读的报告，适合直接交给编码 agent：让它跑测试、读缺口、补用例，循环到覆盖率达标。

覆盖率是下限不是目标，两个常见误解要拆开看：

- 覆盖率高不等于断言有效：把断言删掉，覆盖率一点不掉
- `subprocess` 启动的子进程不被统计：测试里跑的 CLI 要单独测量，或者把逻辑挪进可导入的函数

想验证断言本身，得用变异测试：故意改坏源码，看测试能不能抓住。`mutmut` 是 Python 里现成的工具。
