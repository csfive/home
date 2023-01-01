# Markdown

记录本文档里的一些特殊的 Markdown 语法，更多请参考 [VitePress 官方文档](https://vitepress.vuejs.org/guide/markdown)


## 生成目录

```
[[toc]]
```

## HTML 标签

<div align="center">
H<sub>sub</sub>O，10<sup>sup</sup>，<b>b</b>，<i>i</i>，<u>u</u>，<mark>mark</mark>，<del>del</del>，<a>a</a>，<big>big</big>, <small>small</small>
</div>

<h1 align="center">h123456</h1>

```html
<div align="center">
  ...
</div>

<h1 align="center">h123456</h1>
```

## 自定义容器

:::tip
来源于插件 markdown-it-container
:::

```md
:::tip/info/warning/danger/details 标题可选
你好，世界！
:::
```


## 徽章 <Badge type="warning" text="Badge" />


```md
### Title1 <Badge type="info" text="default" />
### Title2 <Badge type="tip" text="已完成" />
### Title3 <Badge type="warning" text="beta" />
### Title4 <Badge type="danger" text="caution" />
```



## 代码高亮

````md{1,5,7-8}
```js{1,5,7-8}
msg: "全体目光向我看齐",
msg: "全体目光向我看齐",
msg: "全体目光向我看齐",
msg: "亮✨",
msg: "全体目光向我看齐",
msg: "亮✨",
msg: "亮✨",
msg: "全体目光向我看齐"
```
````

## 其他高亮

在每行后添加 `// [!code focus/hl/--/++/warning/error]`

```js
export default {
  msg: "全体目光向我看齐",  // [!code focus]
  msg: "我宣布个事儿",  // [!code hl]
  msg: "我是个傻逼！",  // [!code --]
  msg: "我是个大傻逼！",  // [!code ++]
  msg: "危险❗", // [!code warning]
  msg: "危险❗危险❗危险❗" // [!code error]
}
```

## 代码组

````
::: code-group
```sh [npm]
npm install
```

```sh [yarn]
yarn install
```

```sh [pnpm]
pnpm install
```
:::
````


::: code-group
```sh [npm]
npm install
```

```sh [yarn]
yarn install
```

```sh [pnpm]
pnpm install
```
:::

## 引入代码片段

`@` 表示根目录

```
<<< @/snippets/snippet.cs{1,2,4-6 c#}
```


