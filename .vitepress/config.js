import 导航栏 from './theme/导航栏'
import 公开课 from './theme/公开课'
import 速查表 from './theme/速查表'

export default {
    title: 'CSfive',
    description: '计算机自学之路',
    lang: 'zh-CN',
    lastUpdated: true,
    cleanUrls: 'without-subfolders',

    head: [
        ['link', { rel: 'icon', href: '/logo.svg' }],
        ['link', { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css' }],
        ['meta', { name: 'keywords', content: 'csfive, 计算机, 公开课' }],
    ],

    markdown: {
        // lineNumbers: true,
        theme: {
            light: 'github-light',
            dark: 'github-dark'
        },
        config: (md) => {
            md.use(require('markdown-it-imsize'))
                .use(require('markdown-it-mark'))
                .use(require('markdown-it-smartarrows'))
                .use(require('markdown-it-texmath'), { engine: require('katex'), delimiters: 'dollars', katexOptions: { macros: { "\\RR": "\\mathbb{R}" } } })
        }
    },

    themeConfig: {
        outlineTitle: '大纲',
        nav: 导航栏(),
        sidebar: {
            '/cs/': 公开课(),
            '/cheatsheets/': 速查表()
        },

        algolia: {
            appId: '02TS8NY1RF',
            apiKey: '00fb35d8ff81b7843417d67ba0bc4f28',
            indexName: 'csfive docs',
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/csfive' },
            { icon: 'discord', link: 'https://discord.gg/dqZaP5yAHT' },
        ],

        editLink: {
            pattern: 'https://github.com/csfive/docs/edit/main/docs/:path',
            text: '在 GitHub 上修改此页'
        },

        lastUpdatedText: '上次更新时间',

        docFooter: {
            prev: '上一页',
            next: '下一页'
        },

        footer: {
            message: 'Released under the MIT License',
            copyright: 'Copyright © 2022-present csfive'
        },
    }
}
