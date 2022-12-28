import nav from './nav'
import cs from './cs'

export default {
    title: 'CSfive',
    description: '计算机自学之路',
    lang: 'zh-CN',
    lastUpdated: true,
    cleanUrls: 'without-subfolders',

    head: [
        // TODO 增加更多
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
        // logo: '/logo.svg',
        outlineTitle: '大纲',
        nav: nav(),
        sidebar: {
            '/cs/': cs(),
        },

        // TODO 增加搜索功能
        // algolia: {
        // },

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
