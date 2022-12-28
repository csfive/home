export default function () {
    return [
        { text: '计算机', link: '/cs/intro' },
        {
            text: '关于',
            activeMatch: '/contributing',
            items: [
                { text: '贡献指南', link: '/contributing' },
            ]
        }
    ]
}