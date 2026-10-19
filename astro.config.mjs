// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://csfive.netlify.app',
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
			head: [
				{
					tag: 'link',
					attrs: { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' },
				},
			],
			sidebar: [
				{ label: '路线图', link: '/roadmap/' },
				{ label: '笔记', link: '/notes/' },
			],
		}),
	],
});
