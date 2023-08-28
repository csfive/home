import { defineConfig } from 'vitepress'

export default defineConfig({
    title: 'CS Five',
    titleTemplate: ':title',
    appearance: 'dark',
    lang: 'en',
    description: '计算机废物自学指北',
    srcDir: 'docs',
    cleanUrls: true,
    head: [
        ['link', { rel: 'icon', href: '/logo.svg' }],
        ['meta', { name: 'theme-color', content: '#5f67ee' }],
        ['meta', { name: 'og:type', content: 'website' }],
        ['meta', { name: 'og:locale', content: 'en' }],
        ['meta', { name: 'og:site_name', content: 'CS Five' }],
    ],
    markdown: {
        theme: {
            light: 'github-light',
            dark: 'github-dark',
        },
    },
    themeConfig: {
        logo: { src: '/logo.svg', width: 24, height: 24 },
        sidebar: [
            { text: '启动', link: '/' },
            {
                text: 'CS61A',
                items: [{ text: 'Python', link: '/cs61a/python' }],
            },
        ],
        socialLinks: [{ icon: 'github', link: 'https://github.com/csfive' }],
        search: { provider: 'local' },
    },
})
