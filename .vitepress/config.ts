import { DefaultTheme, defineConfig } from 'vitepress'

const CS61A: DefaultTheme.NavItemWithLink[] = [
  { text: 'Guide', link: '/cs61a/guide' },
]

const CS61B: DefaultTheme.NavItemWithLink[] = [
  { text: 'Guide', link: '/cs61b/guide' },
]

const CS61C: DefaultTheme.NavItemWithLink[] = [
  { text: 'Guide', link: '/cs61c/guide' },
]

const PYTHON: DefaultTheme.NavItemWithLink[] = [
  { text: 'Syntax', link: '/python/syntax' },
]

const PREFERENCES: DefaultTheme.NavItemWithLink[] = [
  { text: 'WSL', link: '/refs/wsl' },
  { text: 'Windows Fonts', link: '/refs/fonts' },
  { text: 'Scoop', link: '/refs/scoop' },
  { text: 'Rye', link: '/refs/rye' },
  { text: 'Proxy', link: '/refs/proxy' },
]

export default defineConfig({
  title: 'CS Five',
  titleTemplate: ':title',
  description: '计算机废物自学指北',
  srcDir: 'docs',
  cleanUrls: true,
  lang: 'zh-CN',
  head: [['link', { rel: 'icon', href: '/logo.svg' }]],
  vite: {
    ssr: {
      noExternal: ['@nolebase/vitepress-plugin-enhanced-readabilities'],
    },
  },
  themeConfig: {
    logo: { src: '/logo.svg' },
    nav: [
      {
        text: 'CS',
        items: [
          { text: 'CS61A', items: CS61A },
          { text: 'CS61B', items: CS61B },
          { text: 'CS61C', items: CS61C },
        ],
      },
      { text: 'Python', items: PYTHON },
      { text: 'Preferences', items: PREFERENCES },
    ],
    sidebar: {
      '/': [
        { text: 'CS61A', collapsed: false, items: CS61A },
        { text: 'CS61B', collapsed: true, items: CS61B },
        { text: 'CS61C', collapsed: true, items: CS61C },
        { text: 'Python', collapsed: true, items: PYTHON },
        { text: 'References', collapsed: true, items: PREFERENCES },
      ],
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/csfive' }],
    search: { provider: 'local' },
  },
})
