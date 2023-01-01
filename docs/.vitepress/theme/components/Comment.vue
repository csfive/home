<script setup>
import Giscus from '@giscus/vue'
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { computed } from 'vue'

const { isDark } = useData()
const { Layout } = DefaultTheme
const theme = computed(() => isDark.value ? 'transparent_dark' : 'light')
</script>

<template>
  <Layout>
    <template #doc-after>
      <div id="giscus">
        <Giscus id="comments" repo="csfive/docs" repoId="R_kgDOIr671A" category="Announcements"
          categoryId="DIC_kwDOIr671M4CTWpS" mapping="pathname" strict="1" reactionsEnabled="1" emitMetadata="0"
          inputPosition="top" lang="zh-CN" loading="lazy" :theme="theme" />
      </div>
    </template>
  </Layout>
</template>

<style scoped>
#giscus {
  margin-top: 3rem;
}
</style>