<script setup>
import Giscus from '@giscus/vue'
import { useData, useRoute } from 'vitepress'
import { computed } from 'vue'

const { isDark } = useData()
const route = useRoute()
const theme = computed(() => isDark.value ? 'transparent_dark' : 'light')
</script>

<template>
  <div id="giscus">
    <Giscus :term="route.path" id="comments" repo="csfive/docs" repoId="R_kgDOIr671A" category="Announcements"
      categoryId="DIC_kwDOIr671M4CTWpS" mapping="pathname" strict="1" reactionsEnabled="1" emitMetadata="0"
      inputPosition="top" lang="zh-CN" :theme="theme" async />
  </div>
</template>

<style scoped>
#giscus {
  margin-top: 3rem;
}
</style>