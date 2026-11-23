import type MarkdownIt from 'markdown-it'

/**
 * Render ```svg-diagram fences via v-html so inline schematics adapt to theme
 * CSS variables while avoiding VitePress staticInjectMarkerRE chunk corruption.
 */
export function svgDiagram(md: MarkdownIt) {
  const fence = md.renderer.rules.fence

  md.renderer.rules.fence = (tokens, index, options, env, self) => {
    const token = tokens[index]
    const [language] = token.info.trim().split(/\s+/)

    if (language !== 'svg-diagram') {
      return fence
        ? fence(tokens, index, options, env, self)
        : self.renderToken(tokens, index, options)
    }

    const escaped = md.utils.escapeHtml(JSON.stringify(token.content.trim()))
    return `<div class="cs-diagram" v-html="${escaped}"></div>\n`
  }
}
