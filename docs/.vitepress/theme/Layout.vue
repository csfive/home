<script setup lang="ts">
import { Content, useData, useRoute, withBase } from 'vitepress'
import { computed, ref } from 'vue'
import DocsSidebar from './DocsSidebar.vue'
import DocsToc from './DocsToc.vue'
import MobileDrawer from './MobileDrawer.vue'
import SearchModal from './SearchModal.vue'
import SiteHeader from './SiteHeader.vue'
import { getPrevNext } from './sidebar'

const { frontmatter, page, theme } = useData()
const route = useRoute()

const mobileMenuOpen = ref(false)
const searchOpen = ref(false)

const prevNext = computed(() => getPrevNext(theme.value.sidebar, route.path))

const formattedLastUpdated = computed(() => {
  const ts = page.value.lastUpdated
  if (!ts) return ''
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Shanghai',
  }).format(new Date(ts))
})

const showFooter = computed(() => {
  if (frontmatter.value.footer === false || page.value.isNotFound) {
    return false
  }
  return Boolean(prevNext.value.prev || prevNext.value.next)
})
</script>

<template>
  <div
    class="relative isolate flex min-h-svh flex-col overflow-x-clip bg-sidebar font-sans text-foreground antialiased [--header-height:4rem]"
  >
    <SiteHeader @open-menu="mobileMenuOpen = true" @open-search="searchOpen = true" />

    <main class="flex flex-1 flex-col">
      <div
        class="container min-h-min flex-1 items-start px-0 lg:px-0 [--sidebar-width:220px] [--top-spacing:0] lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:[--sidebar-width:240px] lg:[--top-spacing:calc(var(--spacing)*4)]"
      >
        <DocsSidebar />

        <div class="flex min-w-0 flex-1 items-stretch xl:w-full">
          <div class="relative flex w-full min-w-0 flex-1 flex-col lg:mt-8 lg:mr-4 lg:mb-8">
            <!-- Coss CardFrame: double-layered outer frame + muted bottom tray -->
            <div
              data-slot="card-frame"
              class="relative flex flex-1 flex-col rounded-2xl border border-sidebar-border bg-card text-card-foreground shadow-lg/5 not-dark:bg-clip-padding [--clip-bottom:-1rem] [--clip-top:-1rem] before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:bg-muted/72 before:shadow-[0_1px_--theme(--color-black/4%)] max-lg:rounded-none max-lg:border-none max-lg:shadow-none max-lg:before:rounded-none dark:bg-background dark:before:shadow-[0_-1px_--theme(--color-white/6%)]"
            >
              <!-- Upper Card: main document prose -->
              <article
                data-slot="card"
                :class="[
                  'relative z-1 flex flex-1 flex-col border border-border bg-card text-card-foreground not-dark:bg-clip-padding max-lg:m-0 max-lg:rounded-none max-lg:border-x-0 max-lg:border-t-0 dark:bg-background lg:-m-px',
                  showFooter ? 'rounded-t-2xl rounded-b-xl' : 'rounded-2xl',
                ]"
              >
                <div class="flex-1 px-5 py-7 sm:px-7 sm:py-8 lg:px-10 lg:py-9">
                  <div class="mx-auto w-full max-w-[45rem]">
                    <div v-if="page.isNotFound" class="flex flex-col items-start gap-3 py-12">
                      <p class="text-xs font-medium text-muted-foreground">404</p>
                      <h1 class="text-3xl font-bold text-foreground">
                        {{ theme.notFound?.title || '页面未找到' }}
                      </h1>
                      <p class="text-muted-foreground">
                        {{ theme.notFound?.quote || '这个页面不存在，可能已经被移动或删除了。' }}
                      </p>
                      <a
                        :href="withBase('/')"
                        class="mt-2 inline-flex h-8 items-center rounded-lg border border-input bg-card px-3 text-sm font-medium text-foreground no-underline shadow-xs/5 hover:bg-accent dark:bg-background"
                      >
                        {{ theme.notFound?.linkText || '返回首页' }}
                      </a>
                    </div>

                    <template v-else>
                      <Content class="vp-doc" />
                      <p v-if="formattedLastUpdated" class="mt-12 text-xs text-muted-foreground/75">
                        {{ theme.lastUpdated?.text || '最后更新于' }}：{{ formattedLastUpdated }}
                      </p>
                    </template>
                  </div>
                </div>
              </article>

              <!-- Lower CardFrame Tray: borderless Prev/Next directly inside tray -->
              <footer
                v-if="showFooter"
                class="relative z-1 px-5 py-5 sm:px-7 lg:rounded-b-2xl lg:px-10"
              >
                <nav
                  class="mx-auto grid w-full max-w-[45rem] grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-8"
                  aria-label="页面切换"
                >
                  <a
                    v-if="prevNext.prev"
                    :href="withBase(prevNext.prev.link)"
                    class="-mx-3 flex min-w-0 flex-col items-start gap-1 rounded-lg px-3 py-2 text-left no-underline transition-colors hover:bg-accent/80"
                  >
                    <span class="text-xs text-muted-foreground">
                      {{ theme.docFooter?.prev || '上一篇' }}
                    </span>
                    <span
                      class="w-full truncate text-[0.9375rem] leading-snug font-medium text-foreground"
                    >
                      {{ prevNext.prev.text }}
                    </span>
                  </a>

                  <a
                    v-if="prevNext.next"
                    :href="withBase(prevNext.next.link)"
                    :class="[
                      '-mx-3 flex min-w-0 flex-col items-end gap-1 rounded-lg px-3 py-2 text-right no-underline transition-colors hover:bg-accent/80',
                      !prevNext.prev && 'sm:col-start-2',
                    ]"
                  >
                    <span class="text-xs text-muted-foreground">
                      {{ theme.docFooter?.next || '下一篇' }}
                    </span>
                    <span
                      class="w-full truncate text-[0.9375rem] leading-snug font-medium text-foreground"
                    >
                      {{ prevNext.next.text }}
                    </span>
                  </a>
                </nav>
              </footer>
            </div>
          </div>

          <DocsToc />
        </div>
      </div>
    </main>

    <MobileDrawer :open="mobileMenuOpen" @close="mobileMenuOpen = false" />
    <SearchModal :open="searchOpen" @open="searchOpen = true" @close="searchOpen = false" />
  </div>
</template>
