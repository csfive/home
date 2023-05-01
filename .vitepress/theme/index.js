import { h, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import mediumZoom from 'medium-zoom'
import Comment from './Comment.vue'
import './custom.css'
import "@fontsource/ibm-plex-sans"
import "@fontsource/jetbrains-mono"

export default {
    ...DefaultTheme,
    Layout() {
        return h(DefaultTheme.Layout, null, {
            'doc-after': () => h(Comment)
        })
    },
    setup() {
        const route = useRoute()
        const initZoom = () => {
            new mediumZoom('.main img', { background: 'var(--vp-c-bg)' })
        }

        onMounted(() => {
            initZoom()
        })

        watch(
            () => route.path,
            () => nextTick(() => initZoom())
        )
    }
}