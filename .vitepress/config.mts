import { defineConfig, type DefaultTheme } from 'vitepress'

export const SIDEBAR: DefaultTheme.Sidebar = [
  {
    text: '入门',
    collapsed: false,
    items: [
      { text: 'MIT - Missing Semester', link: '/missing-semester/README' },
      { text: 'Harvard - CS50x', link: '/cs50x/README' },
      { text: 'Harvard - CS50P', link: '/cs50p/README' },
    ],
  },
]

export default defineConfig({
  lang: 'zh-CN',
  title: '计算机废物自学指北',
  titleTemplate: ':title',
  description: 'csdiy.wiki fork + 一些有用的链接',
  cleanUrls: true,
  ignoreDeadLinks: true,
  lastUpdated: true,
  markdown: {
    math: true,
    image: {
      lazyLoading: true,
    },
    container: {
      tipLabel: '提示',
      warningLabel: '警告',
      dangerLabel: '危险',
      infoLabel: '信息',
      detailsLabel: '详细信息',
    },
  },
  themeConfig: {
    logo: '/logo.svg',
    sidebar: SIDEBAR,
    socialLinks: [{ icon: 'github', link: 'https://github.com/csfive' }],
    editLink: {
      pattern: 'https://github.com/csfive/home/edit/main/:path',
      text: '在 GitHub 上编辑此页面',
    },
    lastUpdated: {
      text: '最近更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short',
      },
    },
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
  },
  head: [
    ['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://chinese-fonts-cdn.deno.dev/packages/lxgwwenkaibright/dist/LXGWBright-Medium/result.css',
      },
    ],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap',
      },
    ],
    [
      'script',
      {
        defer: '',
        src: 'https://a.mancuoj.me/script.js',
        'data-website-id': 'dfd65e36-145e-4d2a-a5c5-5bf11eab5c8e',
      },
    ],
  ],
})
