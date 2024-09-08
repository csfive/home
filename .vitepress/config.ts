import { DefaultTheme, defineConfig } from 'vitepress'

const SIDEBAR = {
  '/': [{ text: '速通 Python', link: '/crash-python' }],
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
    sidebar: SIDEBAR,
    socialLinks: [{ icon: 'github', link: 'https://github.com/csfive' }],
    search: { provider: 'local' },
    lastUpdated: {
      text: 'Last Updated',
      formatOptions: { dateStyle: 'short', timeStyle: 'short' },
    },
  },
})
