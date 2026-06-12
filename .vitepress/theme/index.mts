import DefaultTheme from 'vitepress/theme-without-fonts'
import { installMermaid } from 'v-beautiful-mermaid/client'
import 'v-beautiful-mermaid/style.css'
import './style.css'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    installMermaid(app)
  },
}
