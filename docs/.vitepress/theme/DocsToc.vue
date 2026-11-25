<script setup lang="ts">
import { onContentUpdated, useData } from 'vitepress'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

interface TocItem {
  id: string
  title: string
  depth: number
}

const { theme } = useData()
const items = ref<TocItem[]>([])
const activeId = ref<string | null>(null)

const outlineLabel = computed(() => {
  const outline = theme.value.outline
  if (typeof outline === 'object' && !Array.isArray(outline) && outline.label) {
    return outline.label
  }
  return '目录'
})

let observer: IntersectionObserver | null = null

function extractHeadingTitle(el: Element): string {
  let text = ''
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent ?? ''
    } else if (
      node.nodeType === Node.ELEMENT_NODE &&
      !(node as Element).classList.contains('header-anchor')
    ) {
      text += node.textContent ?? ''
    }
  }
  return text.trim()
}

function disconnectObserver() {
  if (observer) {
    observer.disconnect()
    observer = null
  }
}

function collectHeadings() {
  disconnectObserver()

  const doc = document.querySelector('.vp-doc')
  if (!doc) {
    items.value = []
    activeId.value = null
    return
  }

  const headings = Array.from(doc.querySelectorAll('h2[id], h3[id]')).filter(
    (el) => Boolean(el.id) && extractHeadingTitle(el).length > 0,
  )

  items.value = headings.map((el) => ({
    id: el.id,
    title: extractHeadingTitle(el),
    depth: Number(el.tagName[1]),
  }))

  if (!items.value.length) {
    activeId.value = null
    return
  }

  activeId.value = items.value[0]?.id ?? null

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
        }
      }
    },
    { rootMargin: '0% 0% -80% 0%' },
  )

  for (const el of headings) {
    observer.observe(el)
  }
}

function onScroll() {
  if (!items.value.length) return
  if (window.scrollY < 4) {
    activeId.value = items.value[0]?.id ?? null
    return
  }
  const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4
  if (atBottom) {
    activeId.value = items.value[items.value.length - 1]?.id ?? null
  }
}

onMounted(() => {
  nextTick(collectHeadings)
  window.addEventListener('scroll', onScroll, { passive: true })
})

onContentUpdated(() => {
  nextTick(collectHeadings)
})

onBeforeUnmount(() => {
  disconnectObserver()
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <aside
    class="sticky top-(--header-height) z-30 ms-auto hidden h-[calc(100svh-var(--header-height))] w-72 shrink-0 flex-col overflow-hidden overscroll-none xl:flex"
    aria-label="页面目录"
  >
    <div v-if="items.length" class="coss-scroll-none flex-1 overflow-y-auto">
      <div class="flex min-h-0 flex-col gap-2 py-2">
        <div class="h-(--top-spacing) shrink-0" />
        <nav class="z-10 flex flex-col gap-1 py-2 ps-6 pe-4 text-sm">
          <p class="flex h-7 items-center text-xs font-medium text-foreground">
            {{ outlineLabel }}
          </p>
          <div
            class="relative ms-3.5 flex flex-col gap-0.5 before:absolute before:inset-y-0 before:-left-3.25 before:w-px before:bg-border"
          >
            <a
              v-for="item in items"
              :key="item.id"
              :href="`#${item.id}`"
              :data-active="activeId === item.id"
              :data-depth="item.depth"
              class="relative py-1 text-[.8125rem] leading-5 text-sidebar-foreground no-underline transition-colors before:absolute before:inset-y-px before:-left-3.25 before:w-px before:rounded-full hover:text-foreground data-[active=true]:text-foreground data-[active=true]:before:w-0.5 data-[active=true]:before:bg-primary data-[depth=3]:ps-3.5"
              @click="activeId = item.id"
            >
              <span class="block break-words">{{ item.title }}</span>
            </a>
          </div>
        </nav>
      </div>
    </div>
  </aside>
</template>
