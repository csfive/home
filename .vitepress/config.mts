import { defineConfig } from "vitepress"

export default defineConfig({
  title: "CS Five",
  titleTemplate: ":title",
  description: "计算机废物自学指北",
  srcDir: "docs",
  cleanUrls: true,
  ignoreDeadLinks: true,
  head: [["link", { rel: "icon", href: "/logo.svg" }]],
  themeConfig: {
    logo: { src: "/logo.svg", width: 24, height: 24 },
    sidebar: [
      { text: "启动", link: "/" },
      {
        text: "CS61A",
        items: [
          { text: "从 0.5 开始的 Python 语法入门", link: "/python/syntax" },
          { text: "Python 包管理小结", link: "/python/package" },
          { text: "起步，CS61A 第一章", link: "/cs61a/ch1" },
          { text: "Python 测试简单实践", link: "/python/test" },
        ],
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/csfive" }],
    search: { provider: "local" },
  },
})
