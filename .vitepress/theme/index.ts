import type { Theme as ThemeConfig } from 'vitepress'
import DefaultTheme from 'vitepress/theme-without-fonts'
import { h } from 'vue'
import {
  NolebaseEnhancedReadabilitiesMenu,
  NolebaseEnhancedReadabilitiesScreenMenu,
} from '@nolebase/vitepress-plugin-enhanced-readabilities/client'
import Layout from './components/Layout.vue'
import '@nolebase/vitepress-plugin-enhanced-readabilities/client/style.css'
import './styles/index.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(Layout, null, {
      'nav-bar-content-after': () => h(NolebaseEnhancedReadabilitiesMenu),
      'nav-screen-content-after': () => h(NolebaseEnhancedReadabilitiesScreenMenu),
    })
  },
} satisfies ThemeConfig
