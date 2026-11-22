<script setup lang="ts">
import { useData, useRoute, withBase } from 'vitepress'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { isActivePath, normalizeSidebar } from './sidebar'

const { theme } = useData()
const route = useRoute()

const groups = computed(() => normalizeSidebar(theme.value.sidebar, route.path))

const viewportRef = ref<HTMLElement | null>(null)
const canScrollTop = ref(false)
const canScrollBottom = ref(false)

function updateFade() {
  const el = viewportRef.value
  if (!el) return
  canScrollTop.value = el.scrollTop > 2
  canScrollBottom.value = el.scrollTop + el.clientHeight < el.scrollHeight - 2
}

const fadeMaskStyle = computed(() => {
  if (!canScrollTop.value && !canScrollBottom.value) return undefined
  const topStop = canScrollTop.value ? 'transparent, black 1.5rem' : 'black 0'
  const bottomStop = canScrollBottom.value ? 'black calc(100% - 1.5rem), transparent' : 'black 100%'
  const gradient = `linear-gradient(to bottom, ${topStop}, ${bottomStop})`
  return {
    maskImage: gradient,
    WebkitMaskImage: gradient,
  }
})

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  updateFade()
  if (viewportRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(updateFade)
    resizeObserver.observe(viewportRef.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})
</script>

<template>
  <aside
    v-if="groups.length"
    class="sticky top-(--header-height) z-30 hidden h-[calc(100svh-var(--header-height))] w-(--sidebar-width) shrink-0 flex-col bg-transparent lg:flex"
    aria-label="侧边栏导航"
  >
    <div
      ref="viewportRef"
      class="coss-scroll-hover flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-2"
      :style="fadeMaskStyle"
      @scroll="updateFade"
    >
      <div class="h-(--top-spacing) shrink-0" />
      <div v-for="group in groups" :key="group.key" class="flex flex-col gap-1 p-2">
        <div
          v-if="group.title"
          class="flex h-7 items-center px-0 text-xs font-medium text-sidebar-accent-foreground"
        >
          {{ group.title }}
        </div>
        <ul class="flex flex-col gap-0.5">
          <li v-for="item in group.items" :key="`${item.link}-${item.text}`">
            <a
              :href="withBase(item.link)"
              :data-active="isActivePath(item.link, route.path)"
              :aria-current="isActivePath(item.link, route.path) ? 'page' : undefined"
              class="flex h-8 w-full items-center rounded-lg pe-2 text-sm text-sidebar-foreground no-underline select-none hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground"
              :style="{ paddingInlineStart: `${14 + item.depth * 12}px` }"
            >
              <span class="truncate">{{ item.text }}</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>
