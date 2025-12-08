import { defineConfig, type DefaultTheme, type HeadConfig } from 'vitepress'

const sidebar: DefaultTheme.Sidebar = [
  {
    text: '入门',
    collapsed: false,
    items: [
      { text: 'MIT Missing Semester', link: '/beginner/missing-semester' },
      { text: 'Harvard CS50x', link: '/beginner/cs50x' },
      { text: 'Harvard CS50P', link: '/beginner/cs50p' },
      { text: 'Harvard CS50G', link: '/beginner/cs50g' },
      { text: 'UCB CS61A', link: '/beginner/cs61a' },
    ],
  },
  {
    text: '基础',
    collapsed: false,
    items: [
      { text: 'HUST CPU', link: '/basic/hust-cpu' },
      { text: 'Nand2Tetris', link: '/basic/nand2tetris' },
      { text: 'NJU PA', link: '/basic/nju-pa' },
    ],
  },
  {
    text: '实用工具',
    collapsed: false,
    items: [
      { text: 'Docker', link: '/tools/docker' },
      { text: 'mise', link: '/tools/mise' },
    ],
  },
]

const configs = {
  sidebar,
  lang: 'zh-CN',
  title: '计算机废物自学指北',
  description: 'csdiy.wiki fork + 一些有用的链接',
  repo: 'csfive/home',
  umamiId: 'dfd65e36-145e-4d2a-a5c5-5bf11eab5c8e',
  chineseFont: 'https://chinese-fonts-cdn.deno.dev/packages/dymh/dist/DouyinSansBold/result.css',
  googleFont:
    'https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap',
}

export default defineConfig({
  lang: configs.lang,
  title: configs.title,
  titleTemplate: ':title',
  description: configs.description,
  cleanUrls: true,
  ignoreDeadLinks: true,
  lastUpdated: true,
  markdown: {
    math: true,
    image: {
      lazyLoading: true,
    },
  },
  themeConfig: {
    logo: '/logo.svg',
    sidebar: configs.sidebar,
    socialLinks: [{ icon: 'github', link: `https://github.com/${configs.repo}` }],
    ...getLabel(),
  },
  head: getHead(),
})

function getHead() {
  const head: HeadConfig[] = [['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }]]
  if (configs.chineseFont) {
    head.push(['link', { rel: 'stylesheet', href: configs.chineseFont }])
  }
  if (configs.googleFont) {
    head.push(['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }])
    head.push(['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }])
    head.push(['link', { rel: 'stylesheet', href: configs.googleFont }])
  }
  if (configs.umamiId) {
    head.push([
      'script',
      { defer: '', src: 'https://a.mancuoj.me/script.js', 'data-website-id': configs.umamiId },
    ])
  }
  return head
}

function getLabel(): DefaultTheme.Config {
  if (configs.lang === 'zh-CN') {
    return {
      editLink: {
        pattern: `https://github.com/${configs.repo}/edit/main/:path`,
        text: '在 GitHub 上编辑此页面',
      },
      lastUpdated: {
        text: '最近更新于',
        formatOptions: { dateStyle: 'short', timeStyle: 'short' },
      },
      docFooter: { prev: '上一页', next: '下一页' },
      outlineTitle: '大纲',
      langMenuLabel: '切换语言',
      returnToTopLabel: '返回顶部',
      sidebarMenuLabel: '侧边栏目录',
      skipToContentLabel: '跳转至内容',
      darkModeSwitchTitle: '切换到暗色模式',
      lightModeSwitchTitle: '切换到亮色模式',
      darkModeSwitchLabel: '切换主题',
    }
  }
  return {
    editLink: {
      pattern: `https://github.com/${configs.repo}/edit/main/:path`,
    },
    lastUpdated: {
      formatOptions: { dateStyle: 'short', timeStyle: 'short' },
    },
  }
}
