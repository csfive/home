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
            // collapsed: true,
            items: [
                { text: '课程简介', link: '/cs/missing-semester/intro' },
            ]
        },
        {
            text: 'CS61A',
            collapsible: true,
            // collapsed: true,
            items: [
                { text: '课程简介', link: '/cs/cs61a/intro' },
            ]
        }
    ]
}