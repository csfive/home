export const 导航栏 = [
    { text: '公开课', link: '/cs/path' },
    {
        text: '资料',
        activeMatch: '/js/1/1',
        items: [
            { text: 'JS 红宝书', link: '/js/1/1' },
            { text: 'ES6 入门', link: '/es6/1' },
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

export const 红宝书 = [
    {
        text: '什么是 JavaScript',
        collapsible: true,
        collapsed: true,
        items: [
            { text: '1. 简短的历史回顾', link: '/js/1/1' },
            { text: '2. JavaScript 实现', link: '/js/1/2' },
            { text: '3. JavaScript 版本', link: '/js/1/3' },
            { text: '4. 小结', link: '/js/1/4' },
        ]
    },
    {
        text: 'HTML 中的 JavaScript',
        collapsible: true,
        collapsed: true,
        items: [
            { text: '1. script 元素', link: '/js/2/1' },
            { text: '2. 行内代码与外部文件', link: '/js/2/2' },
            { text: '3. 文档模式', link: '/js/2/3' },
            { text: '4. noscript 元素', link: '/js/2/4' },
            { text: '5. 小结', link: '/js/2/5' },
        ]
    },
    {
        text: '语言基础',
        collapsible: true,
        collapsed: true,
        items: [
            { text: '1. 语法', link: '/js/3/1' },
            { text: '2. 关键字与保留字', link: '/js/3/2' },
            { text: '3. 变量', link: '/js/3/3' },
            { text: '4. 数据类型', link: '/js/3/4' },
            { text: '5. 操作符', link: '/js/3/5' },
            { text: '6. 语句', link: '/js/3/6' },
            { text: '7. 函数', link: '/js/3/7' },
            { text: '8. 小结', link: '/js/3/8' },
        ]
    },
    {
        text: '变量、作用域与内存',
        collapsible: true,
        collapsed: true,
        items: [
            { text: '1. 原始值与引用值', link: '/js/4/1' },
            { text: '2. 执行上下文与作用域', link: '/js/4/2' },
            { text: '3. 垃圾回收', link: '/js/4/3' },
            { text: '4. 小结', link: '/js/4/4' },
        ]
    },
    {
        text: '基本引用类型',
        collapsible: true,
        collapsed: true,
        items: [
            { text: '1. Date', link: '/js/5/1' },
            { text: '2. RegExp', link: '/js/5/2' },
            { text: '3. 原始值包装类型', link: '/js/5/3' },
            { text: '4. 单例内置对象', link: '/js/5/4' },
            { text: '5. 小结', link: '/js/5/5' },
        ]
    },
    {
        text: '集合引用类型',
        collapsible: true,
        collapsed: true,
        items: [
            { text: '1. Object', link: '/js/6/1' },
            { text: '2. Array', link: '/js/6/2' },
            { text: '3. 定型数组', link: '/js/6/3' },
            { text: '4. Map', link: '/js/6/4' },
            { text: '5. WeakMap', link: '/js/6/5' },
            { text: '6. Set', link: '/js/6/6' },
            { text: '7. WeakSet', link: '/js/6/7' },
            { text: '8. 迭代与扩展操作', link: '/js/6/8' },
            { text: '9. 小结', link: '/js/6/9' },
        ]
    },
    {
        text: '迭代器与生成器',
        collapsible: true,
        collapsed: true,
        items: [
            { text: '1. 理解迭代', link: '/js/7/1' },
            { text: '2. 迭代器模式', link: '/js/7/2' },
            { text: '3. 生成器', link: '/js/7/3' },
            { text: '4. 小结', link: '/js/7/4' },
        ]
    },
    {
        text: '对象、类与面向对象编程',
        collapsible: true,
        collapsed: true,
        items: [
            { text: '1. 理解对象', link: '/js/8/1' },
            { text: '2. 创建对象', link: '/js/8/2' },
            { text: '3. 继承', link: '/js/8/3' },
            { text: '4. 类', link: '/js/8/4' },
            { text: '5. 小结', link: '/js/8/5' },
        ]
    },
]

export const ES6入门 = [
    {
        items: [
            { text: '1. ECMAScript 6 简介', link: '/es6/1' },
            { text: '2. let 和 const 命令', link: '/es6/2' },
            { text: '3. 变量的解构赋值', link: '/es6/3' },
            { text: '4. 字符串的扩展', link: '/es6/4' },
            { text: '5. 字符串的新增方法', link: '/es6/5' },
            { text: '6. 正则的扩展', link: '/es6/6' },
            { text: '7. 数值的扩展', link: '/es6/7' },
            { text: '8. 函数的扩展', link: '/es6/8' },
            { text: '9. 数组的扩展', link: '/es6/9' },
            { text: '10. 对象的扩展', link: '/es6/10' },
            { text: '11. 对象的新增方法', link: '/es6/11' },
            { text: '12. 运算符的扩展', link: '/es6/12' },
            { text: '13. Symbol', link: '/es6/13' },
            { text: '14. Set 和 Map 数据结构', link: '/es6/14' },
            { text: '15. Proxy', link: '/es6/15' },
            { text: '16. Reflect', link: '/es6/16' },
            { text: '17. Promise 对象', link: '/es6/17' },
            { text: '18. Iterator 和 for...of 循环', link: '/es6/18' },
            { text: '19. Generator 函数的语法', link: '/es6/19' },
            { text: '20. Generator 函数的异步应用', link: '/es6/20' },
            { text: '21. async 函数', link: '/es6/21' },
            { text: '22. Class 的基本语法', link: '/es6/22' },
            { text: '23. Class 的继承', link: '/es6/23' },
            { text: '24. Module 的语法', link: '/es6/24' },
            { text: '25. Module 的加载实现', link: '/es6/25' },
            { text: '26. 编程风格', link: '/es6/26' },
            { text: '27. 读懂规格', link: '/es6/27' },
            { text: '28. 异步遍历器', link: '/es6/28' },
            { text: '29. ArrayBuffer', link: '/es6/29' },
            { text: '30. 最新提案', link: '/es6/30' },
            { text: '31. Decorator', link: '/es6/31' },
        ]
    },
]
