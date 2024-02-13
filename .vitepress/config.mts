import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'CS Five',
  titleTemplate: ':title',
  description: '计算机废物自学指北',
  srcDir: 'docs',
  cleanUrls: true,
  ignoreDeadLinks: true,
  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }],
  ],
  themeConfig: {
    logo: { src: '/logo.svg', width: 24, height: 24 },
    sidebar: [
      { text: '启动', link: '/' },
      {
        text: 'CS61A',
        items: [
          { text: 'Python 语法入门', link: '/cs61a/py' },
          { text: 'Python 包管理', link: '/cs61a/py-package' },
          { text: '第一章小结', link: '/cs61a/ch1' },
          { text: 'Python 测试', link: '/cs61a/py-test' },
        ]
      }
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/csfive' }],
    search: { provider: 'local' },
  },
})
