export default function () {
    return [
        { text: '公开课', link: '/cs/path' },
        {
            text: '翻译',
            activeMatch: '/sicp-python/ch1/1-1',
            items: [
                { text: 'SICP Python', link: '/sicp-python/ch1/1-1' },
                { text: 'Dead Simple Python', link: '/dead-simple-python/ch1/1-1' },
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