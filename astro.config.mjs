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
      editLink: {
        baseUrl: 'https://github.com/csfive/home/edit/main/',
      },
      customCss: ['./src/styles/custom.css'],
      components: {
        Head: './src/components/Head.astro',
      },
      head: [
        {
          tag: 'link',
          attrs: { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'preconnect',
            href: 'https://chinese-fonts-cdn.netlify.app',
            crossorigin: 'anonymous',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: 'https://chinese-fonts-cdn.netlify.app/packages/dymh/dist/DouyinSansBold/result.css',
          },
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
