export const 导航栏 = [
    { text: '公开课', link: '/cs/path' },
    {
        text: '资料',
        activeMatch: '/js/1/1',
        items: [
            { text: 'SICP Python', link: '/sicp-python/ch1/1-1' },
        ]
    },
    {
        text: '关于',
        activeMatch: '/about/project',
        items: [
            { text: '项目简介', link: '/about/project' },
            { text: '贡献指南', link: '/about/contributing' },
            // { text: '团队成员', link: '/about/team' },
            {
                items: [
                    { text: 'Markdown', link: '/about/markdown' },
                ]
            }
        ]
    }
]

export const 公开课 = [
    {
        items: [
            { text: '学习路线', link: '/cs/path' }
        ]
    },
    {
        text: 'Missing Semester',
        collapsible: true,
        collapsed: true,
        items: [
            { text: '课程简介', link: '/cs/missing-semester/intro' },
            { text: '资源汇总', link: '/cs/missing-semester/resource' },
        ]
    },
    {
        text: 'CS50x',
        collapsible: true,
        collapsed: true,
        items: [
            { text: '课程简介', link: '/cs/cs50x/intro' },
            { text: '资源汇总', link: '/cs/cs50x/resource' },
        ]
    },
    {
        text: 'CS50P',
        collapsible: true,
        collapsed: true,
        items: [
            { text: '课程简介', link: '/cs/cs50p/intro' },
            { text: '资源汇总', link: '/cs/cs50p/resource' },
        ]
    },
    {
        text: 'CS61A',
        collapsible: true,
        collapsed: true,
        items: [
            { text: '课程简介', link: '/cs/cs61a/intro' },
            { text: '资源汇总', link: '/cs/cs61a/resource' },
        ]
    },
    {
        text: 'CS61B',
        collapsible: true,
        collapsed: true,
        items: [
            { text: '课程简介', link: '/cs/cs61b/intro' },
            { text: '资源汇总', link: '/cs/cs61b/resource' },
        ]
    },
    {
        text: '自己动手画 CPU',
        collapsible: true,
        collapsed: true,
        items: [
            { text: '课程简介', link: '/cs/hust-cpu/intro' },
            { text: '资源汇总', link: '/cs/hust-cpu/resource' },
        ]
    },
    {
        text: 'Nand2Tetris',
        collapsible: true,
        collapsed: true,
        items: [
            { text: '课程简介', link: '/cs/nand2tetris/intro' },
            { text: '资源汇总', link: '/cs/nand2tetris/resource' },
        ]
    },
    {
        text: 'CS61C',
        collapsible: true,
        collapsed: true,
        items: [
            { text: '课程简介', link: '/cs/cs61c/intro' },
            { text: '资源汇总', link: '/cs/cs61c/resource' },
        ]
    },
    {
        text: '计算机系统基础',
        collapsible: true,
        collapsed: true,
        items: [
            { text: '课程简介', link: '/cs/nju-pa/intro' },
            { text: '资源汇总', link: '/cs/nju-pa/resource' },
        ]
    },
    {
        text: 'CS50AI',
        collapsible: true,
        collapsed: true,
        items: [
            { text: '课程简介', link: '/cs/cs50ai/intro' },
            { text: '资源汇总', link: '/cs/cs50ai/resource' },
        ]
    },
]