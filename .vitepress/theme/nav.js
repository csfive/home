export const 导航栏 = [
    { text: '公开课', link: '/cs/path' },
    {
        text: '资料',
        activeMatch: '/js/1',
        items: [
            { text: 'JS 红宝书', link: '/js/1' },
            { text: 'ES6 入门', link: '/es6/1' },
            { text: '现代 JS 教程', link: '/jsinfo/intro' },
            { text: '速查表', link: '/cheatsheets/regex' },
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


export const 速查表 = [
    {
        items: [
            { text: '正则速查表', link: '/cheatsheets/regex' },
            { text: 'C 速查表', link: '/cheatsheets/c' },
            { text: 'Python 速查表', link: '/cheatsheets/py' },
            { text: 'Python 速查表【2】', link: '/cheatsheets/py2' },
        ]
    },
]

export const 红宝书 = [
    {
        items: [
            { text: '第一章', link: '/js/1' },
        ]
    },
]

export const ES6入门 = [
    {
        items: [
            { text: '第一章', link: '/es6/1' },
        ]
    },
]

export const 现代JS教程 = [
    {
        items: [
            { text: '简介', link: '/jsinfo/intro' },
        ]
    },
]