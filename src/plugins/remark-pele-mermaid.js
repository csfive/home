import { render } from 'pele'

/**
 * Render ```mermaid code fences to SVG at build time with Pele.
 * Keeps the Markdown source portable — no components or client-side JS.
 */
export default function remarkPeleMermaid() {
  return (tree) => {
    walk(tree)
  }
}

function walk(node) {
  if (!Array.isArray(node.children)) return

  node.children.forEach((child, index) => {
    if (child.type === 'code' && child.lang === 'mermaid') {
      const { svg } = render(child.value)
      node.children[index] = {
        type: 'html',
        value: `<div class="pele-diagram">${svg}</div>`,
      }
      return
    }

    walk(child)
  })
}
