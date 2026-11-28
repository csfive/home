import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import { linkCard } from './plugins/link-card.ts'
import { mermaid } from './plugins/mermaid.ts'
import { svgDiagram } from './plugins/svg-diagram.ts'
import { sidebar } from './sidebar.ts'

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
    theme: { light: 'github-light', dark: 'github-dark' },
    config(md) {
      md.use(mermaid)
      md.use(svgDiagram)
      md.use(linkCard)
      md.use(groupIconMdPlugin)

      const defaultCodeInline = md.renderer.rules.code_inline
      md.renderer.rules.code_inline = (tokens, idx, options, env, self) => {
        const html = defaultCodeInline
          ? defaultCodeInline(tokens, idx, options, env, self)
          : `<code${self.renderAttrs(tokens[idx])}>${md.utils.escapeHtml(tokens[idx].content)}</code>`
        const content = tokens[idx].content
        if (content.length < 12) return html
        const match = html.match(/^(<code[^>]*>)([\s\S]*)(<\/code>)$/)
        if (!match) return html
        const [, open, inner, close] = match
        const pattern =
          content.length >= 18
            ? /(?<=[^\s/])\/(?=\S)|(?<=[^\s])(?:[.,=]|-(?!-))(?=\S)/g
            : /(?<=[^\s/])\/(?=\S)/g
        return `${open}${inner.replace(pattern, '$&<wbr>')}${close}`
      }
    },
  },

  vite: {
    plugins: [
      tailwindcss(),
      groupIconVitePlugin({
        customIcon: {
          '.sh': 'logos:bash-icon',
          '.sql': 'vscode-icons:file-type-sql',
        },
      }),
    ],
  },

  themeConfig: {
    nav: [
      {
        text: 'Foundations',
        items: [
          {
            text: 'CS50x · 计算机科学导论',
            link: '/cs50x/',
            activeMatch: '^/cs50x(/|$)',
          },
          {
            text: 'Missing Semester · 缺失的一课',
            link: '/missing-semester/',
            activeMatch: '^/missing-semester(/|$)',
          },
          {
            text: 'CS50P · Python 编程导论',
            link: '/cs50p/',
            activeMatch: '^/cs50p(/|$)',
          },
          {
            text: 'CS50G · 游戏开发导论',
            link: '/cs50g/',
            activeMatch: '^/cs50g(/|$)',
          },
        ],
      },
    ],

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
