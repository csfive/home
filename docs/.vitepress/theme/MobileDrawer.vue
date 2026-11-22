<script setup lang="ts">
import type { DefaultTheme } from 'vitepress'
import { useData, useRoute, withBase } from 'vitepress'
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { isActivePath, isNavLinkActive, normalizeSidebar } from './sidebar'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { theme } = useData()
const route = useRoute()

const groups = computed(() => normalizeSidebar(theme.value.sidebar, route.path))
const navItems = computed<DefaultTheme.NavItem[]>(() =>
  Array.isArray(theme.value.nav) ? theme.value.nav : [],
)

function hasChildren(item: DefaultTheme.NavItem): item is DefaultTheme.NavItemWithChildren {
  return 'items' in item && Array.isArray(item.items)
}

function collectNavLinks(item: DefaultTheme.NavItemWithChildren): DefaultTheme.NavItemWithLink[] {
  const out: DefaultTheme.NavItemWithLink[] = []
  for (const child of item.items) {
    if ('link' in child && child.link) {
      out.push(child)
    } else if ('items' in child && Array.isArray(child.items)) {
      for (const grand of child.items) {
        if ('link' in grand && grand.link) out.push(grand)
      }
    }
  }
  return out
}

watch(
  () => route.path,
  () => {
    if (props.open) emit('close')
  },
)

watch(
  () => props.open,
  (open) => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = open ? 'hidden' : ''
    }
  },
)

function onKeyDown(e: KeyboardEvent) {
  if (props.open && e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="导航菜单"
    >
      <div
        class="fixed inset-0 bg-black/32 backdrop-blur-xs"
        aria-hidden="true"
        @click="emit('close')"
      />

      <div
        class="coss-scroll relative z-10 flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-border bg-background p-6 pt-6 shadow-xl"
      >
        <div class="mb-4 flex items-center justify-between">
          <span class="text-sm font-medium text-foreground">导航</span>
          <button
            type="button"
            class="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="关闭菜单"
            @click="emit('close')"
          >
            <svg
              class="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div v-if="navItems.length" class="mb-5 flex flex-col gap-3 border-b border-border pb-5">
          <template v-for="(item, idx) in navItems" :key="`nav-${idx}`">
            <div v-if="hasChildren(item)" class="flex flex-col gap-1">
              <div v-if="item.text" class="text-xs font-medium text-foreground">
                {{ item.text }}
              </div>
              <div class="flex flex-col gap-0.5">
                <a
                  v-for="child in collectNavLinks(item)"
                  :key="child.link"
                  :href="withBase(child.link)"
                  :data-active="isNavLinkActive(child, route.path)"
                  class="flex h-8 items-center rounded-lg px-2.5 text-sm text-muted-foreground no-underline hover:text-foreground data-[active=true]:bg-accent data-[active=true]:font-medium data-[active=true]:text-foreground"
                  @click="emit('close')"
                >
                  <span class="truncate">{{ child.text }}</span>
                </a>
              </div>
            </div>

            <a
              v-else-if="'link' in item && item.link"
              :href="withBase(item.link)"
              :data-active="isNavLinkActive(item, route.path)"
              class="flex h-8 items-center rounded-lg px-2.5 text-sm text-muted-foreground no-underline hover:text-foreground data-[active=true]:bg-accent data-[active=true]:font-medium data-[active=true]:text-foreground"
              @click="emit('close')"
            >
              <span class="truncate">{{ item.text }}</span>
            </a>
          </template>
        </div>

        <div class="flex flex-col gap-6">
          <div v-for="group in groups" :key="group.key" class="flex flex-col gap-2">
            <div v-if="group.title" class="text-xs font-medium text-foreground">
              {{ group.title }}
            </div>
            <div class="flex flex-col gap-0.5">
              <a
                v-for="item in group.items"
                :key="`${item.link}-${item.text}`"
                :href="withBase(item.link)"
                :data-active="isActivePath(item.link, route.path)"
                class="flex h-8 items-center rounded-lg pe-2.5 text-sm text-muted-foreground no-underline hover:text-foreground data-[active=true]:bg-accent data-[active=true]:font-medium data-[active=true]:text-foreground"
                :style="{ paddingInlineStart: `${10 + item.depth * 12}px` }"
                @click="emit('close')"
              >
                <span class="truncate">{{ item.text }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
