import { DefaultTheme, defineConfig } from 'vitepress'

const CS61A: DefaultTheme.NavItemWithLink[] = [{ text: 'Guide', link: '/cs61a/guide' }]

const PYTHON: DefaultTheme.NavItemWithLink[] = [
  { text: 'The Zen of Python', link: '/py/zen' },
  { text: 'Style Guide', link: '/py/style' },
  { text: 'Syntax Basics', link: '/py/syntax' },
  { text: 'Rye', link: '/py/rye' },
]

const CS61B: DefaultTheme.NavItemWithLink[] = [{ text: 'Guide', link: '/cs61b/guide' }]

const PREFERENCES: DefaultTheme.NavItemWithLink[] = [
  { text: 'WSL', link: '/refs/wsl' },
  { text: 'Windows Fonts', link: '/refs/fonts' },
  { text: 'Scoop', link: '/refs/scoop' },
  { text: 'Proxy', link: '/refs/proxy' },
  { text: 'Powershell', link: '/refs/powershell' },
]

const NAV = [
  {
    text: 'CS',
    items: [
      { text: 'CS61A', items: CS61A },
      { text: 'CS61B', items: CS61B },
    ],
  },
  { text: 'Python', items: PYTHON },
  { text: 'Preferences', items: PREFERENCES },
]

const SIDEBAR = {
  '/': [
    { text: 'CS61A', collapsed: false, items: CS61A },
    { text: 'Python', collapsed: false, items: PYTHON },
    { text: 'CS61B', collapsed: false, items: CS61B },
    { text: 'References', collapsed: false, items: PREFERENCES },
  ],
}

export default defineConfig({
  title: 'CS Five',
  titleTemplate: ':title',
  description: '计算机废物自学指北',
  srcDir: 'docs',
  cleanUrls: true,
  lang: 'zh-CN',
  head: [['link', { rel: 'icon', href: '/logo.svg' }]],

  vite: {
    optimizeDeps: {
      include: ['@nolebase/vitepress-plugin-enhanced-readabilities > @nolebase/ui > @rive-app/canvas'],
      exclude: ['@nolebase/vitepress-plugin-enhanced-readabilities/client'],
    },
    ssr: {
      noExternal: ['@nolebase/vitepress-plugin-enhanced-readabilities'],
    },
  },

  markdown: {
    math: true,
    image: {
      lazyLoading: true,
    },
  },

  themeConfig: {
    logo: { src: '/logo.svg' },
    nav: NAV,
    sidebar: SIDEBAR,
    socialLinks: [{ icon: 'github', link: 'https://github.com/csfive' }],
    search: { provider: 'local' },
    lastUpdated: {
      text: 'Last Updated',
      formatOptions: { dateStyle: 'short', timeStyle: 'short' },
    },
  },
})
