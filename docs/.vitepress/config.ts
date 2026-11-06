import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import { linkCard } from './plugins/link-card.ts'
import { mermaid } from './plugins/mermaid.ts'

const sidebar = [
  { text: '关于', link: '/' },
  {
    text: 'Missing Semester',
    collapsed: false,
    items: [
      {
        text: '课程概览与 Shell',
        link: '/ms/00/',
        collapsed: true,
        items: [
          { text: '终端与 Shell', link: '/ms/00/terminal' },
          { text: '一条命令的旅程', link: '/ms/00/command-journey' },
          { text: '打开终端后发生了什么', link: '/ms/00/terminal-internals' },
          { text: '重定向和管道', link: '/ms/00/redirection' },
          { text: 'bash 编程与脚本', link: '/ms/00/bash' },
          { text: '常用文本工具', link: '/ms/00/text-tools' },
          { text: '容易混淆的问题', link: '/ms/00/pitfalls' },
        ],
      },
      {
        text: '命令行环境',
        link: '/ms/01/',
        collapsed: true,
        items: [
          { text: '参数与 flag', link: '/ms/01/arguments' },
          { text: '流与管道', link: '/ms/01/streams' },
          { text: '变量与环境', link: '/ms/01/environment' },
          { text: '返回码与条件', link: '/ms/01/return-codes' },
          { text: '信号与作业控制', link: '/ms/01/signals' },
          { text: '远程机器', link: '/ms/01/ssh' },
          { text: '终端复用', link: '/ms/01/tmux' },
          { text: 'Shell 定制', link: '/ms/01/shell-customization' },
          { text: 'AI 在命令行里', link: '/ms/01/ai' },
          { text: '容易混淆的问题', link: '/ms/01/pitfalls' },
        ],
      },
      { text: '开发环境与工具', link: '/ms/02' },
      { text: '调试与性能分析', link: '/ms/03' },
      { text: '版本控制与 Git', link: '/ms/04' },
      { text: '打包与发布', link: '/ms/05' },
      { text: 'Agentic Coding', link: '/ms/06' },
      { text: '代码之外', link: '/ms/07' },
      { text: '代码质量', link: '/ms/08' },
    ],
  },
  {
    text: 'CS50G',
    collapsed: false,
    items: [
      {
        text: 'Pong',
        link: '/cs50g/00/',
        collapsed: true,
        items: [
          { text: '环境', link: '/cs50g/00/environment' },
          { text: 'Lua', link: '/cs50g/00/lua' },
          { text: 'LÖVE 基础', link: '/cs50g/00/game-loop' },
          { text: '虚拟分辨率与滤镜', link: '/cs50g/00/virtual-resolution' },
          { text: '移动与 Delta Time', link: '/cs50g/00/delta-time' },
          { text: '面向对象', link: '/cs50g/00/oop' },
          { text: '碰撞检测', link: '/cs50g/00/collision' },
          { text: '得分与状态机', link: '/cs50g/00/score-state' },
          { text: '音效', link: '/cs50g/00/audio' },
          { text: '容易混淆的问题', link: '/cs50g/00/pitfalls' },
        ],
      },
      { text: 'Flappy Bird', link: '/cs50g/01' },
      { text: 'Breakout', link: '/cs50g/02' },
      { text: 'Match 3', link: '/cs50g/03' },
      { text: 'Super Mario Bros.', link: '/cs50g/04' },
      { text: 'Legend of Zelda', link: '/cs50g/05' },
      { text: 'Angry Birds', link: '/cs50g/06' },
      { text: 'Pokémon', link: '/cs50g/07' },
    ],
  },
]

export default defineConfig({
  lang: 'zh-CN',
  title: 'CS Five',
  titleTemplate: ':title · CS Five',
  description: '计算机废物自学指北，@mancuoj 的自学笔记',
  cleanUrls: true,
  lastUpdated: true,

  head: [['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }]],

  sitemap: {
    hostname: 'https://csfive.netlify.app',
  },

  markdown: {
    theme: { light: 'vitesse-light', dark: 'vitesse-dark' },
    config(md) {
      md.use(mermaid)
      md.use(linkCard)
      md.use(groupIconMdPlugin)
    },
  },

  vite: {
    plugins: [
      groupIconVitePlugin({
        customIcon: {
          '.sh': 'logos:bash-icon',
          '.sql': 'vscode-icons:file-type-sql',
        },
      }),
    ],
  },

  themeConfig: {
    sidebar,

    logo: '/logo.svg',
    socialLinks: [{ icon: 'github', link: 'https://github.com/csfive/home' }],

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short',
      },
    },

    outline: { level: [2, 3], label: '目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    sidebarMenuLabel: '菜单',
    mobileMenuLabel: '菜单',
    navMenuLabel: '主导航',
    extraMenuLabel: '更多',
    returnToTopLabel: '回到顶部',
    langMenuLabel: '切换语言',
    skipToContentLabel: '跳到正文',
    notFound: {
      title: '页面未找到',
      quote: '这个页面不存在，可能已经被移动或删除了。',
      linkText: '返回首页',
      linkLabel: '返回首页',
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索',
            buttonAriaLabel: '搜索文档',
          },
          modal: {
            displayDetails: '显示详情',
            resetButtonTitle: '清除查询',
            backButtonTitle: '返回',
            noResultsText: '没有找到结果',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭',
            },
          },
        },
      },
    },
  },
})
