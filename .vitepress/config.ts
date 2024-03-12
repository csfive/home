import { DefaultTheme, defineConfig } from 'vitepress'

const CS61A: DefaultTheme.NavItemWithLink[] = [
  { text: 'Guide', link: '/cs61a/' },
]

const PYTHON: DefaultTheme.NavItemWithLink[] = [
  { text: 'Syntax', link: '/python/syntax' },
]

const PREFERENCES: DefaultTheme.NavItemWithLink[] = [
  { text: 'WSL', link: '/refs/wsl' },
]

export default defineConfig({
  title: 'CS Five',
  titleTemplate: ':title',
  description: '计算机废物自学指北',
  srcDir: 'docs',
  cleanUrls: true,
  ignoreDeadLinks: true,
  head: [['link', { rel: 'icon', href: '/logo.svg' }]],
  themeConfig: {
    logo: { src: '/logo.svg', width: 24, height: 24 },
    nav: [
      { text: 'CS61A', items: [{ items: CS61A }] },
      { text: 'Python', items: PYTHON },
      { text: 'Preferences', items: PREFERENCES },
    ],
    sidebar: Object.assign(
      {},
      {
        '/': [
          { text: 'CS61A', items: CS61A },
          { text: 'Python', items: PYTHON },
          { text: 'References', items: PREFERENCES },
        ],
      },
    ),
    socialLinks: [{ icon: 'github', link: 'https://github.com/csfive' }],
    search: { provider: 'local' },
  },
})
