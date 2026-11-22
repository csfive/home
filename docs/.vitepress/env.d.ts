/// <reference types="vitepress/client" />

declare module '@localSearchIndex' {
  const index: Record<string, () => Promise<{ default: string }>>
  export default index
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}
