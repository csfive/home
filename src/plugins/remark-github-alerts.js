/**
 * Convert GitHub-style blockquote alerts into Starlight asides.
 *
 * Source stays valid on GitHub:
 *   > [!TIP]
 *   > Optional information...
 *
 * Starlight then renders it as its normal aside component.
 */
const TYPES = {
  NOTE: 'note',
  TIP: 'tip',
  IMPORTANT: 'note',
  WARNING: 'caution',
  CAUTION: 'danger',
}

const MARKER = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\s+|$)/i

export default function remarkGithubAlerts() {
  return (tree) => walk(tree)
}

function walk(node) {
  if (!Array.isArray(node.children)) return

  node.children.forEach((child, index) => {
    if (child.type === 'blockquote') {
      const aside = toAside(child)
      if (aside) {
        node.children[index] = aside
        walk(aside)
        return
      }
    }

    walk(child)
  })
}

function toAside(blockquote) {
  if (!blockquote.children.length) return null

  const first = blockquote.children[0]
  if (first.type !== 'paragraph' || first.children.length === 0) return null

  const marker = first.children[0]
  if (marker.type !== 'text') return null

  const match = marker.value.match(MARKER)
  if (!match) return null

  const type = TYPES[match[1].toUpperCase()]
  const rest = marker.value.slice(match[0].length)

  if (rest) {
    marker.value = rest
  } else {
    first.children.shift()
    while (first.children[0]?.type === 'break' || first.children[0]?.type === 'softbreak') {
      first.children.shift()
    }
  }

  const children = blockquote.children.filter(
    (child, index) => !(index === 0 && isEmptyParagraph(child)),
  )

  return {
    type: 'containerDirective',
    name: type,
    children,
  }
}

function isEmptyParagraph(node) {
  return node.type === 'paragraph' && node.children.length === 0
}
