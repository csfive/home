import nav from './nav'
import cs from './cs'
import sicp from './sicp'

export default {
    title: 'CSfive',
    description: '计算机自学之路',
    lang: 'zh-CN',
    lastUpdated: true,
    cleanUrls: 'without-subfolders',

    head: [
        ['link', { rel: 'icon', href: '/logo.svg' }],
        ['meta', { name: 'keywords', content: 'CSfive, 计算机, 公开课' }],
    ],

    markdown: {
        // lineNumbers: true,
        theme: {
            light: 'github-light',
            dark: 'github-dark'
        },
    },

    themeConfig: {
        outlineTitle: '大纲',
        nav: nav(),
        sidebar: {
            '/cs/': cs(),
            '/sicp-py/': sicp()
        },

        algolia: {
            appId: '02TS8NY1RF',
            apiKey: '00fb35d8ff81b7843417d67ba0bc4f28',
            indexName: 'csfive docs',
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/csfive' },
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
