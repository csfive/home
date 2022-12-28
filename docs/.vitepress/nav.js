export default function () {
    return [
        { text: '公开课', link: '/cs/path' },
        {
            text: '关于',
            activeMatch: '/contributing',
            items: [
                { text: '项目简介', link: '/project' },
                { text: '贡献指南', link: '/contributing' },
            ]
        }
    ]
}