import type { DefaultTheme } from 'vitepress'

export const sidebar: DefaultTheme.SidebarMulti = {
  '/': [
    {
      text: 'Overview',
      items: [{ text: '开始', link: '/' }],
    },
    {
      text: 'Foundations',
      items: [
        { text: 'CS50x · 计算机科学导论', link: '/cs50x/setup' },
        { text: 'Missing Semester · 缺失的一课', link: '/missing-semester/' },
        { text: 'CS50P · Python 编程导论', link: '/cs50p/' },
        { text: 'CS50G · 游戏开发导论', link: '/cs50g/' },
      ],
    },
  ],
  '/cs50x/': [
    {
      text: 'C',
      items: [
        { text: '怎么设置本地运行环境', link: '/cs50x/setup' },
        { text: '怎么写 Makefile', link: '/cs50x/makefile' },
      ],
    },
  ],
  '/missing-semester/': [
    {
      text: 'Missing Semester',
      items: [{ text: '概览', link: '/missing-semester/' }],
    },
  ],
  '/cs50p/': [
    {
      text: 'CS50P',
      items: [{ text: '概览', link: '/cs50p/' }],
    },
  ],
  '/cs50g/': [
    {
      text: 'CS50G',
      items: [{ text: '概览', link: '/cs50g/' }],
    },
  ],
}
