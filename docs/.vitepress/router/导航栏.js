export default function () {
    return [
        { text: '公开课', link: '/cs/path' },
        {
            text: '资料',
            activeMatch: '/sicp-python/ch1/1-1',
            items: [
                { text: 'SICP Python 翻译【WIP】', link: '/sicp-python/ch1/1-1' },
                { text: 'Python 速查表', link: '/cheatsheets/py'},
            ]
        },
        {
            text: '关于',
            activeMatch: '/about/contributing',
            items: [
                { text: '项目简介', link: '/about/project' },
                { text: '贡献指南', link: '/about/contributing' },
                { text: '团队成员', link: '/about/team' },
                {
                    items: [
                        { text: 'Markdown', link: '/about/markdown' },
                    ]
                }
            ]
        }
    ]
}