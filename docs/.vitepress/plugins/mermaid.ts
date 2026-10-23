import type MarkdownIt from 'markdown-it'
import { render } from 'pele'

/**
 * Render ```mermaid fences to SVG at build time.
 *
 * Pele is synchronous and has no runtime dependencies, so diagrams ship as
 * plain SVG with no client-side JavaScript.
 */
export function mermaid(md: MarkdownIt) {
  const fence = md.renderer.rules.fence

  md.renderer.rules.fence = (tokens, index, options, env, self) => {
    const token = tokens[index]
    const [language] = token.info.trim().split(/\s+/)

    if (language !== 'mermaid') {
      return fence
        ? fence(tokens, index, options, env, self)
        : self.renderToken(tokens, index, options)
    }

    try {
      const { svg } = render(token.content)
      return `<div class="pele-diagram">${svg}</div>\n`
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return `<pre class="pele-error">${md.utils.escapeHtml(message)}</pre>\n`
    }
  }
}
