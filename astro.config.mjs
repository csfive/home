// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import { unified } from '@astrojs/markdown-remark'
import remarkPeleMermaid from './src/plugins/remark-pele-mermaid.js'
import remarkLinkCard from './src/plugins/remark-link-card.js'
import remarkGithubAlerts from './src/plugins/remark-github-alerts.js'

// https://astro.build/config
export default defineConfig({
  site: 'https://csfive.netlify.app',
  trailingSlash: 'never',
  build: {
    format: 'preserve',
  },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkGithubAlerts, remarkLinkCard, remarkPeleMermaid],
    }),
  },
  integrations: [
    starlight({
      title: 'CS Five',
      description: '计算机废物自学指北，@mancuoj 的自学笔记',
      locales: {
        root: { label: '简体中文', lang: 'zh-CN' },
      },
      titleDelimiter: '·',
      logo: {
        src: './src/assets/logo.svg',
        alt: 'CS Five',
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/csfive/home',
        },
      ],
      customCss: ['./src/styles/kero.css', './src/styles/custom.css'],
      components: {
        Head: './src/components/Head.astro',
        Header: './src/components/Header.astro',
        PageTitle: './src/components/PageTitle.astro',
        Footer: './src/components/Footer.astro',
      },
      head: [
        {
          tag: 'link',
          attrs: { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' },
        },
      ],
      sidebar: [
        { label: '路线图', link: '/roadmap' },
        {
          label: 'MIT Missing Semester',
          items: [{ autogenerate: { directory: 'missing-semester' } }],
        },
        {
          label: 'CS50 2D Game',
          items: [{ autogenerate: { directory: 'cs50g' } }],
        },
      ],
    }),
  ],
})
