<script setup lang="ts">
import localSearchIndex from '@localSearchIndex'
import MiniSearch from 'minisearch'
import { useData, useRouter, withBase } from 'vitepress'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { flattenSidebarLinks } from './sidebar'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'open'): void
  (e: 'close'): void
}>()

interface SearchEntry {
  id: string
  title: string
  breadcrumb?: string
}

const { localeIndex, theme } = useData()
const router = useRouter()

const inputRef = ref<HTMLInputElement | null>(null)
const listRef = ref<HTMLElement | null>(null)
const query = ref('')
const selectedIndex = ref(0)
const isLoadingIndex = ref(false)
const searchIndex = shallowRef<MiniSearch | null>(null)
const indexData = shallowRef(localSearchIndex)

if (import.meta.hot) {
  import.meta.hot.accept('@localSearchIndex', (mod) => {
    if (mod) {
      indexData.value = mod.default
      searchIndex.value = null
    }
  })
}

async function ensureIndex() {
  if (searchIndex.value || isLoadingIndex.value) return
  isLoadingIndex.value = true
  try {
    const loader = indexData.value[localeIndex.value]
    const json = (await loader?.())?.default
    if (!json) return

    const miniOpts =
      theme.value.search?.provider === 'local' ? theme.value.search.options?.miniSearch : undefined

    searchIndex.value = MiniSearch.loadJSON(json, {
      fields: ['title', 'titles', 'text'],
      storeFields: ['title', 'titles'],
      searchOptions: {
        fuzzy: 0.2,
        prefix: true,
        boost: { title: 4, text: 2, titles: 1 },
        ...miniOpts?.searchOptions,
      },
      ...miniOpts?.options,
    })
  } finally {
    isLoadingIndex.value = false
  }
}

const sidebarQuickLinks = computed<SearchEntry[]>(() =>
  flattenSidebarLinks(theme.value.sidebar).map((item) => ({
    id: item.link,
    title: item.text,
  })),
)

function decodeHtmlEntities(value: string): string {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&#x27;', "'")
}

const entries = computed<SearchEntry[]>(() => {
  const q = query.value.trim()
  if (!q) return sidebarQuickLinks.value
  if (!searchIndex.value) return []

  return searchIndex.value
    .search(q)
    .slice(0, 16)
    .map((hit) => {
      const titles = Array.isArray(hit.titles)
        ? (hit.titles as string[]).map(decodeHtmlEntities)
        : []
      return {
        id: String(hit.id),
        title: decodeHtmlEntities(String(hit.title || '')),
        breadcrumb: titles.length ? titles.join(' › ') : undefined,
      }
    })
})

watch(entries, (next) => {
  selectedIndex.value = next.length ? 0 : -1
})

watch(
  () => props.open,
  async (open) => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = open ? 'hidden' : ''
    }
    if (open) {
      selectedIndex.value = 0
      void ensureIndex()
      await nextTick()
      inputRef.value?.focus()
      inputRef.value?.select()
    }
  },
)

function navigateTo(id: string) {
  emit('close')
  void router.go(withBase(id))
}

function isEditingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return target.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

function scrollSelectedIntoView() {
  nextTick(() => {
    const el = listRef.value?.querySelector('[data-selected="true"]')
    el?.scrollIntoView({ block: 'nearest' })
  })
}

function handleKeyDown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    if (props.open) emit('close')
    else emit('open')
    return
  }

  if (
    !props.open &&
    event.key === '/' &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.altKey &&
    !isEditingTarget(event.target)
  ) {
    event.preventDefault()
    emit('open')
    return
  }

  if (!props.open) return

  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }

  if (!entries.value.length) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    selectedIndex.value = (selectedIndex.value + 1) % entries.value.length
    scrollSelectedIntoView()
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    selectedIndex.value = (selectedIndex.value - 1 + entries.value.length) % entries.value.length
    scrollSelectedIntoView()
  } else if (event.key === 'Enter' && selectedIndex.value >= 0) {
    event.preventDefault()
    const target = entries.value[selectedIndex.value]
    if (target) navigateTo(target.id)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex flex-col items-center px-4 py-6 sm:py-[10vh]"
      role="dialog"
      aria-modal="true"
      aria-label="搜索文档"
    >
      <div
        class="fixed inset-0 bg-black/32 backdrop-blur-sm"
        aria-hidden="true"
        @click="emit('close')"
      />

      <div
        class="relative z-10 flex max-h-[420px] min-h-0 w-full max-w-xl flex-col rounded-2xl border border-border bg-popover text-popover-foreground shadow-lg/5 not-dark:bg-clip-padding before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:bg-muted/72 before:shadow-[0_1px_--theme(--color-black/4%)] dark:before:shadow-[0_-1px_--theme(--color-white/6%)]"
      >
        <div
          class="relative z-1 -m-px flex min-h-0 flex-1 flex-col rounded-t-2xl rounded-b-xl border border-border bg-card dark:bg-background"
        >
          <div class="flex items-center gap-2 border-b border-border/64 px-3.5 py-2.5">
            <svg
              class="size-4 shrink-0 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              ref="inputRef"
              v-model="query"
              type="search"
              placeholder="搜索文档…"
              class="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
            />
            <button
              v-if="query"
              type="button"
              class="shrink-0 cursor-pointer whitespace-nowrap rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
              @click="query = ''"
            >
              清除
            </button>
          </div>

          <div ref="listRef" class="coss-scroll min-h-0 flex-1 overflow-y-auto p-1.5">
            <div v-if="isLoadingIndex" class="px-3 py-8 text-center text-sm text-muted-foreground">
              加载搜索索引…
            </div>

            <div
              v-else-if="!entries.length"
              class="px-3 py-8 text-center text-sm text-muted-foreground"
            >
              没有找到相关内容
            </div>

            <div v-else class="flex flex-col gap-0.5">
              <div
                v-if="!query.trim()"
                class="px-2.5 py-1.5 text-xs font-medium text-muted-foreground"
              >
                页面
              </div>
              <button
                v-for="(item, idx) in entries"
                :key="item.id"
                type="button"
                :data-selected="idx === selectedIndex"
                class="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-foreground transition-colors data-[selected=true]:bg-accent"
                @mouseenter="selectedIndex = idx"
                @click="navigateTo(item.id)"
              >
                <svg
                  class="size-4 shrink-0 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                  <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                </svg>
                <span class="min-w-0 flex-1 truncate">
                  <span v-if="item.breadcrumb" class="text-muted-foreground">
                    {{ item.breadcrumb }} ›
                  </span>
                  <span class="font-medium">{{ item.title }}</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        <div
          class="relative z-1 flex items-center justify-between px-4 py-2 text-xs text-muted-foreground"
        >
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center gap-1">
              <kbd
                class="inline-flex h-5 items-center rounded bg-card px-1.5 font-sans text-[11px] font-medium text-muted-foreground shadow-2xs dark:bg-background"
              >
                ↑↓
              </kbd>
              <span>切换</span>
            </span>
            <span class="inline-flex items-center gap-1">
              <kbd
                class="inline-flex h-5 items-center rounded bg-card px-1.5 font-sans text-[11px] font-medium text-muted-foreground shadow-2xs dark:bg-background"
              >
                ↵
              </kbd>
              <span>打开</span>
            </span>
          </div>
          <span class="inline-flex items-center gap-1">
            <kbd
              class="inline-flex h-5 items-center rounded bg-card px-1.5 font-sans text-[11px] font-medium text-muted-foreground shadow-2xs dark:bg-background"
            >
              Esc
            </kbd>
            <span>关闭</span>
          </span>
        </div>
      </div>
    </div>
  </Teleport>
</template>
