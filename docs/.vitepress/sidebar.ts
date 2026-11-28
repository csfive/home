import type { DefaultTheme } from 'vitepress'

export const sidebar: DefaultTheme.SidebarMulti = {
  '/': [
    {
      text: 'Overview',
      items: [{ text: '指北', link: '/' }],
    },
    {
      text: 'Foundations',
      items: [
        { text: 'CS50x · 计算机科学导论', link: '/cs50x/' },
        { text: 'Missing Semester · 缺失的一课', link: '/missing-semester/' },
        { text: 'CS50P · Python 编程导论', link: '/cs50p/' },
        { text: 'CS50G · 游戏开发导论', link: '/cs50g/' },
      ],
    },
  ],
  '/cs50x/': [
    {
      text: 'CS50x',
      items: [{ text: '索引', link: '/cs50x/' }],
    },
    {
      text: 'C',
      items: [
        { text: '怎么设置本地运行环境', link: '/cs50x/setup' },
        { text: '怎么写 Makefile', link: '/cs50x/makefile' },
        { text: 'C 语言怎么运行的', link: '/cs50x/c' },
        { text: '溢出、截断和浮点误差', link: '/cs50x/numbers' },
        { text: '怎么使用 GDB 进行调试', link: '/cs50x/gdb' },
        { text: '怎么理解递归', link: '/cs50x/recursion' },
      ],
    },
  ],
  '/missing-semester/': [
    {
      text: 'Missing Semester',
      items: [{ text: '索引', link: '/missing-semester/' }],
    },
  ],
  '/cs50p/': [
    {
      text: 'CS50P',
      items: [{ text: '索引', link: '/cs50p/' }],
    },
  ],
  '/cs50g/': [
    {
      text: 'CS50G',
      items: [{ text: '索引', link: '/cs50g/' }],
    },
  ],
}
