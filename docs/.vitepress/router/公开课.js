export default function () {
    return [
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
        }
    ]
}