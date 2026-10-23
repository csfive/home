import { defineConfig } from 'vitepress'
import { linkCard } from './plugins/link-card.ts'
import { mermaid } from './plugins/mermaid.ts'

export default defineConfig({
  lang: 'zh-CN',
  title: 'CS Five',
  description: '计算机废物自学指北，@mancuoj 的自学笔记',
  cleanUrls: true,
  head: [['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }]],
  sitemap: {
    hostname: 'https://csfive.netlify.app',
  },

  markdown: {
    theme: { light: 'vitesse-light', dark: 'vitesse-dark' },
    config(md) {
      md.use(mermaid)
      md.use(linkCard)
    },
  },

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'CS Five',

    nav: [
      { text: '路线图', link: '/roadmap' },
      { text: 'Missing Semester', link: '/ms/00' },
      { text: 'CS50G', link: '/cs50g/00' },
    ],

    sidebar: [
      { text: '路线图', link: '/roadmap' },
      {
        text: 'Missing Semester',
        collapsed: false,
        items: [
          { text: '课程概览与 Shell', link: '/ms/00' },
          { text: '命令行环境', link: '/ms/01' },
          { text: '开发环境与工具', link: '/ms/02' },
          { text: '调试与性能分析', link: '/ms/03' },
          { text: '版本控制与 Git', link: '/ms/04' },
          { text: '打包与发布', link: '/ms/05' },
          { text: 'Agentic Coding', link: '/ms/06' },
          { text: '代码之外', link: '/ms/07' },
          { text: '代码质量', link: '/ms/08' },
        ],
      },
      {
        text: 'CS50G',
        collapsed: false,
        items: [
          { text: 'Pong', link: '/cs50g/00' },
          { text: 'Flappy Bird', link: '/cs50g/01' },
          { text: 'Breakout', link: '/cs50g/02' },
          { text: 'Match 3', link: '/cs50g/03' },
          { text: 'Super Mario Bros.', link: '/cs50g/04' },
          { text: 'Legend of Zelda', link: '/cs50g/05' },
          { text: 'Angry Birds', link: '/cs50g/06' },
          { text: 'Pokémon', link: '/cs50g/07' },
        ],
      },
    ],

    outline: { level: [2, 3], label: '目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    sidebarMenuLabel: '菜单',
    mobileMenuLabel: '菜单',
    navMenuLabel: '主导航',
    extraMenuLabel: '更多',
    returnToTopLabel: '回到顶部',
    langMenuLabel: '切换语言',
    skipToContentLabel: '跳到正文',
    notFound: {
      title: '页面未找到',
      quote: '这个页面不存在，可能已经被移动或删除了。',
      linkText: '返回首页',
      linkLabel: '返回首页',
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/csfive/home' }],

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索',
            buttonAriaLabel: '搜索文档',
          },
          modal: {
            displayDetails: '显示详情',
            resetButtonTitle: '清除查询',
            backButtonTitle: '返回',
            noResultsText: '没有找到结果',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭',
            },
          },
        },
      },
    },
  },
})
