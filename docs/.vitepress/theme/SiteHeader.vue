<script setup lang="ts">
import type { DefaultTheme } from 'vitepress'
import { useData, useRoute, withBase } from 'vitepress'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { isNavLinkActive } from './sidebar'

defineEmits<{
  (e: 'open-menu'): void
  (e: 'open-search'): void
}>()

const { site, theme, isDark } = useData()
const route = useRoute()

const openIndex = ref<number | null>(null)
const navRef = ref<HTMLElement | null>(null)

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

function isGroupActive(item: DefaultTheme.NavItemWithChildren): boolean {
  return collectNavLinks(item).some((child) => isNavLinkActive(child, route.path))
}

function getGroupLabel(item: DefaultTheme.NavItemWithChildren): string {
  const active = collectNavLinks(item).find((child) => isNavLinkActive(child, route.path))
  if (!active) return item.text ?? ''
  return active.text.split('·')[0]?.trim() || active.text
}

function toggleDropdown(idx: number) {
  openIndex.value = openIndex.value === idx ? null : idx
}

function onDocumentClick(event: MouseEvent) {
  if (openIndex.value === null) return
  const target = event.target
  if (target instanceof Node && navRef.value?.contains(target)) return
  openIndex.value = null
}

function onKeyDown(event: KeyboardEvent) {
  if (openIndex.value !== null && event.key === 'Escape') {
    openIndex.value = null
  }
}

watch(
  () => route.path,
  () => {
    openIndex.value = null
  },
)

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  window.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  window.removeEventListener('keydown', onKeyDown)
})

const githubLink = computed(() => {
  const socials = theme.value.socialLinks
  if (!Array.isArray(socials)) return undefined
  return socials.find((item) => item.icon === 'github')?.link
})

function toggleTheme() {
  isDark.value = !isDark.value
}
</script>

<template>
  <header
    class="sticky top-0 z-40 w-full bg-sidebar/80 backdrop-blur-sm before:pointer-events-none before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border/64"
  >
    <div
      class="container relative flex h-(--header-height) w-full items-center justify-between gap-2 px-4 sm:px-6"
    >
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="-ms-1.5 inline-flex size-8 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent lg:hidden"
          :aria-label="theme.sidebarMenuLabel || '菜单'"
          @click="$emit('open-menu')"
        >
          <svg
            class="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <line x1="4" x2="20" y1="8" y2="8" />
            <line x1="4" x2="14" y1="16" y2="16" />
          </svg>
        </button>

        <a
          :href="withBase('/')"
          class="flex shrink-0 items-center gap-2 font-display text-lg font-bold tracking-tight text-foreground no-underline sm:text-xl"
        >
          <img
            v-if="theme.logo"
            :src="withBase(String(theme.logo))"
            alt=""
            class="size-5 shrink-0"
          />
          <span>{{ site.title }}</span>
        </a>
      </div>

      <div class="ms-auto flex items-center gap-1 md:gap-1.5">
        <nav
          v-if="navItems.length"
          ref="navRef"
          aria-label="课程导航"
          class="me-1 hidden items-center gap-1 sm:flex"
        >
          <template v-for="(item, idx) in navItems" :key="`header-nav-${idx}`">
            <div v-if="hasChildren(item)" class="relative">
              <button
                type="button"
                aria-haspopup="menu"
                :aria-expanded="openIndex === idx"
                :class="[
                  'inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg px-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-foreground',
                  openIndex === idx || isGroupActive(item)
                    ? 'text-foreground'
                    : 'text-muted-foreground',
                ]"
                @click="toggleDropdown(idx)"
              >
                <span>{{ getGroupLabel(item) }}</span>
                <svg
                  :class="[
                    'size-3.5 text-muted-foreground transition-transform duration-150',
                    openIndex === idx && 'rotate-180',
                  ]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              <div
                v-if="openIndex === idx"
                role="menu"
                class="absolute top-full right-0 z-50 mt-2 min-w-52 rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg/10 dark:shadow-black/30"
              >
                <a
                  v-for="child in collectNavLinks(item)"
                  :key="child.link"
                  role="menuitem"
                  :href="withBase(child.link)"
                  :class="[
                    'flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-sm no-underline transition-colors hover:bg-accent hover:text-accent-foreground',
                    isNavLinkActive(child, route.path)
                      ? 'bg-accent/70 font-medium text-foreground'
                      : 'text-popover-foreground',
                  ]"
                  @click="openIndex = null"
                >
                  <span class="truncate">{{ child.text }}</span>
                  <svg
                    v-if="isNavLinkActive(child, route.path)"
                    class="size-3.5 shrink-0 text-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </a>
              </div>
            </div>

            <a
              v-else-if="'link' in item && item.link"
              :href="withBase(item.link)"
              :class="[
                'inline-flex h-8 items-center rounded-lg px-2.5 text-sm font-medium no-underline transition-colors hover:bg-accent hover:text-foreground',
                isNavLinkActive(item, route.path) ? 'text-foreground' : 'text-muted-foreground',
              ]"
            >
              {{ item.text }}
            </a>
          </template>
        </nav>

        <button
          type="button"
          class="inline-flex size-8 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent md:hidden"
          aria-label="搜索文档"
          @click="$emit('open-search')"
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
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>

        <button
          type="button"
          class="hidden h-8 cursor-pointer items-center gap-2 rounded-lg border border-input bg-card px-2 text-muted-foreground shadow-xs/5 transition-colors hover:border-ring/50 hover:text-foreground md:inline-flex dark:bg-input/32"
          aria-label="搜索文档"
          aria-keyshortcuts="/ control+k meta+k"
          @click="$emit('open-search')"
        >
          <svg
            class="size-3.5 text-foreground/80"
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
          <span class="inline-flex items-center gap-1" aria-hidden="true">
            <kbd
              class="kbd-mod inline-flex h-5 min-w-5 items-center justify-center rounded bg-muted px-1 font-sans text-[11px] font-medium leading-none text-muted-foreground"
            />
            <kbd
              class="inline-flex h-5 min-w-5 items-center justify-center rounded bg-muted px-1 font-sans text-[11px] font-medium leading-none text-muted-foreground"
            >
              K
            </kbd>
          </span>
        </button>

        <div class="mx-1.5 hidden h-5 w-px bg-border md:block" aria-hidden="true" />

        <a
          v-if="githubLink"
          :href="githubLink"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          class="inline-flex size-8 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent"
        >
          <svg class="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              d="M12 1.27a11 11 0 0 0-3.48 21.46c.55.1.75-.24.75-.53v-1.85c-3.06.66-3.71-1.48-3.71-1.48-.5-1.27-1.22-1.61-1.22-1.61-1-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.98 1.68 2.57 1.2 3.2.92.1-.71.38-1.2.7-1.48-2.44-.28-5-1.22-5-5.43 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.91 0 0 .92-.3 3.02 1.12a10.5 10.5 0 0 1 5.5 0c2.1-1.42 3.02-1.12 3.02-1.12.6 1.51.22 2.63.11 2.91.7.77 1.13 1.75 1.13 2.95 0 4.22-2.57 5.15-5.02 5.42.39.34.74 1.01.74 2.04v3.02c0 .29.2.63.76.53A11 11 0 0 0 12 1.27Z"
            />
          </svg>
        </a>

        <button
          type="button"
          class="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent"
          :title="
            isDark
              ? theme.lightModeSwitchTitle || '切换到浅色模式'
              : theme.darkModeSwitchTitle || '切换到深色模式'
          "
          :aria-label="theme.darkModeSwitchLabel || '外观'"
          @click="toggleTheme"
        >
          <svg
            class="size-4 -rotate-45"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" stroke="none" />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>
