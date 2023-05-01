import { 导航栏, 公开课, 红宝书, ES6入门 } from './theme/nav'

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
        nav: 导航栏,
        sidebar: {
            '/cs/': 公开课,
            '/js/': 红宝书,
            '/es6/': ES6入门,
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/csfive' },
            { icon: 'discord', link: 'https://discord.gg/dqZaP5yAHT' },
        ],

        search: {
            provider: 'local'
        },
        
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
