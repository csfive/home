import { h, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Comment from './components/Comment.vue'
import mediumZoom from 'medium-zoom'
import './style/custom.css'

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