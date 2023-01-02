import { h, watch } from 'vue'
import { useRoute } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Comment from './components/Comment.vue'
import './custom.css'

export default {
    ...DefaultTheme,
    Layout() {
        return h(DefaultTheme.Layout, null, {
            'doc-after': () => h(Comment)
        })
    },
    setup() {
        const route = useRoute()
        watch(
            () => route.path
        )
    }
}