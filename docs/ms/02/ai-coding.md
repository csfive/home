---
title: AI 辅助开发
description: MIT Missing Semester 第 2 讲 · AI 辅助开发
---

# AI 辅助开发

三种形态介入的位置不同：补全接在光标后，行内对话改选区，agent 直接动仓库。

## 三种形态

| 形态       | 触发方式           | 改动范围       | 主要风险           |
| ---------- | ------------------ | -------------- | ------------------ |
| 自动补全   | 打字暂停、按 Tab   | 光标之后       | 只看到局部上下文   |
| 行内对话   | 选中代码后描述意图 | 选中的块       | 改坏没读懂的老代码 |
| 编码 agent | 给一句任务描述     | 跨文件、跑命令 | 范围失控、难回滚   |

补全是最轻的，拒绝一次没有成本。行内对话开始修改已有逻辑，必须看 diff。agent 会创建文件、执行命令、装依赖，接受之前先 `git status` 看一眼它到底碰了什么。

## 补全：注释就是提示词

补全模型看到的是光标前后的代码。函数签名和注释比指令更有效，因为它们在正确的上下文里。

```python
import requests

def download_contents(url: str) -> str:
    # 补全大致会长这样
    response = requests.get(url)
    return response.text
```

函数名起得含糊，补全就跟着含糊：

```python
def extract(content: str) -> list[str]:
    # extract all Markdown links from the content
    import re
    pattern = r'\[.*?\]\((.*?)\)'
    return re.findall(pattern, content)
```

这里暴露了补全的典型毛病：`import re` 被塞进函数体。它能跑，但违反模块级导入的惯例，每次调用还要多查一次 `sys.modules`。

改写方式是让补全少猜：函数叫 `extract_links`，写清 docstring，补全自然会给出模块级导入。项目里已经有的依赖也会影响结果，模型倾向于用流行库，未必是你 `requirements.txt` 里装的那个。

## 行内对话：改已有代码

选中三行，说一句「用标准库替代」：

```python
from urllib.request import urlopen

def download_contents(url: str) -> str:
    with urlopen(url) as response:
        return response.read().decode('utf-8')
```

这是行内对话擅长的场景：范围明确、验收标准清楚、上下文就在选区里。反过来，让它「优化这个文件」通常得到一堆无关改动，因为模型不知道你在意什么。

提交前用 `git diff` 复核一遍。行内对话最容易顺手改掉注释、调整空行、重排 import，这些噪声会淹没真正的改动。

## agent 与边界

agent 能读多个文件、跑测试、根据报错继续改，适合「把 X 迁移到 Y」这类机械但跨文件的任务。它的失败模式也从「补错一行」变成「改错十个文件」，所以要有回滚点。

- 开工前确保工作区干净，出问题直接 `git checkout .`
- 明确告诉它跑哪个测试命令，别让它自己猜框架
- 生成的 API 调用要能查到官方文档，查不到就当它编的
- 来源可疑的整段代码要确认许可证，别把受限制的代码带进项目
- 不要把 token、私钥、生产数据贴进对话框
- 接受结果前看一遍依赖变化，别悄悄多出几个包

学生、教师和流行开源项目的维护者可以免费使用 GitHub Copilot，这是讲义明确提到的入口。功能上各家产品差距不大，选一个能和现有编辑器配合的就行：Copilot 以扩展形式接进现有编辑器，Cursor 是把 AI 缝进界面的独立编辑器。
