import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'CS Five',
  description: '计算机废物自学指北',
  lastUpdated: true,
  cleanUrls: true,
  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#5f67ee' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'en' }],
    ['meta', { name: 'og:site_name', content: 'CS Five' }],
    ['meta', { name: 'og:image', content: 'https://vitepress.dev/vitepress-og.jpg' }],
    ['meta', { name: 'twitter:image', content: 'https://vitepress.dev/vitepress-og.jpg' }],
  ],
  themeConfig: {
    logo: { src: '/logo.svg', width: 24, height: 24 },
    sidebar: [
      { text: '启动', link: '/' },
      { text: 'CS61A', link: '/cs61a' },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/csfive' }],
    search: { provider: 'local' },
  },
})
