export default function () {
    return [
        { text: '公开课', link: '/cs/path' },
        { text: 'CS61A 教材中译版', link: '/sicp-py/1-1' },
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