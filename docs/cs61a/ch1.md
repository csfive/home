# 起步，CS61A 第一章

## 准备

第一章对应课表内参考 Textbook 为 Ch1 的项，题源 [CS61A 2024 Spring](https://cs61a.org/)，不同时间题目类似。

仅以此文记录我的做题过程，步骤解释以及踩坑记录，环境的设置就不赘述了。

如果你是 Windows 用户，我会无脑推荐你 WSL2 + Windows Terminal + VS Code，方便好用还免费。

## [Lab 00](https://cs61a.org/lab/lab00/)

第一次作业，根据提示我们需要先下载提供的 Stater Files 也就是入门文件，点击下载后得到一个压缩包，解压后拖到编辑器里即可。

这是正常流程，但我们是学计算机的，我们要学着用更 nerd 的方式来做。

复制下载链接，使用 `wget` 来下载文件，然后 `unzip` 解压：

```sh
wget https://cs61a.org/lab/lab00/lab00.zip
unzip lab00.zip
```

:::details 如果你不熟悉这些“奇奇怪怪”的命令行工具
可以安装一个 [tldr](https://github.com/tldr-pages/tldr?tab=readme-ov-file#how-do-i-use-it) 来获知它们的使用方法：

```sh
pip3 install tldr   # 安装
tldr wget   # 使用
tldr unzip   
```

它会返回一个简单的，基于示例的手册，比如 `wget` 的如下：

```md
> Download files from the Web.
> Supports HTTP, HTTPS, and FTP.
> More information: <https://www.gnu.org/software/wget>.

- Download the contents of a URL to a file (named "foo" in this case):

`wget {{https://example.com/foo}}`

- Download the contents of a URL to a file (named "bar" in this case):

`wget --output-document {{bar}} {{https://example.com/foo}}`

- Download a single web page and all its resources with 3-second intervals between requests (scripts, stylesheets, images, etc.):

`wget --page-requisites --convert-links --wait=3 {{https://example.com/somepage.html}}`

- Download all listed files within a directory and its sub-directories (does not download embedded page elements):

`wget --mirror --no-parent {{https://example.com/somepath/}}`

- Limit the download speed and the number of connection retries:

`wget --limit-rate={{300k}} --tries={{100}} {{https://example.com/somepath/}}`

- Download a file from an HTTP server using Basic Auth (also works for FTP):

`wget --user={{username}} --password={{password}} {{https://example.com}}`

- Continue an incomplete download:

`wget --continue {{https://example.com}}`

- Download all URLs stored in a text file to a specific directory:

`wget --directory-prefix {{path/to/directory}} --input-file {{URLs.txt}}`
```
:::


## HW 01

## Lab 01
