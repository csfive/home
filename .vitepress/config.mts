import { defineConfig, type DefaultTheme, type HeadConfig } from 'vitepress'
import { vitepressBeautifulMermaid } from 'v-beautiful-mermaid'

const sidebar: DefaultTheme.Sidebar = [
  {
    text: 'ROADMAP',
    items: [
      { text: '🚧 MIT Missing Semester', link: '/roadmap/missing-semester' },
      { text: 'Harvard CS50x', link: '/roadmap/cs50x' },
      { text: 'Harvard CS50P', link: '/roadmap/cs50p' },
      { text: '🚧 Harvard CS50G', link: '/roadmap/cs50g' },
      { text: 'UCB CS61A', link: '/roadmap/cs61a' },
      { text: '🚧 Nand2Tetris', link: '/roadmap/nand2tetris' },
      { text: '🚧 HUST CPU', link: '/roadmap/hust-cpu' },
      { text: '⏳ Haskell MOOC', link: '/roadmap/haskell-mooc' },
      { text: '⏳ Cornell CS3110', link: '/roadmap/cs3110' },
      { text: '⏳ UCB CS61B', link: '/roadmap/cs61b' },
      { text: '⏳ UCB CS61C', link: '/roadmap/cs61c' },
      { text: '⏳ NJU PA', link: '/roadmap/nju-pa' },
      { text: '⏳ NJU OS', link: '/roadmap/nju-os' },
    ],
  },
]

const configs = {
  sidebar,
  lang: 'zh-CN',
  title: '计算机废物自学指北',
  description: 'csdiy.wiki 的 fork + @mancuoj 的自学路线图',
  repo: 'csfive/home',
  chineseFont: 'https://chinese-fonts-cdn.netlify.app/packages/dymh/dist/DouyinSansBold/result.css',
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
    config: (md) => {
      md.use(vitepressBeautifulMermaid)
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
