<script setup lang="ts">
import { computed } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'

const { Layout } = DefaultTheme
const { page } = useData()

const site = 'https://csfive.netlify.app'
const repo = 'https://github.com/csfive/home'

const cleanPath = page.value.relativePath
  .replace(/\.md$/, '')
  .replace(/index$/, '')
  .replace(/\/$/, '')
const pageUrl = computed(() => `${site}/${cleanPath}`)
const editUrl = computed(() => `${repo}/edit/main/docs/${page.value.relativePath}`)

const issueUrl = computed(() => {
  const title = `[${cleanPath || 'home'}] 反馈`
  const body = [
    `页面：${pageUrl.value}`,
    '',
    '位置（小节标题或原句）：',
    '',
    '问题类型：看不懂 / 表述有误 / 内容缺失',
    '',
    '补充说明：',
  ].join('\n')

  return `${repo}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`
})
</script>

<template>
  <Layout>
    <template #doc-footer-before>
      <div class="page-feedback">
        <span>这页有看不懂或表述不清的地方？</span>
        <a :href="issueUrl" target="_blank" rel="noreferrer">提交反馈</a>
        <span aria-hidden="true">·</span>
        <a :href="editUrl" target="_blank" rel="noreferrer">直接改这页</a>
      </div>
    </template>
  </Layout>
</template>
