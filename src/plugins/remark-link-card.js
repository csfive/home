/**
 * Render `[title](url "description")` — a paragraph whose only child is a
 * titled link — as a Starlight-style link card.
 *
 * Starlight ships `<LinkCard>` as an MDX component, but its styles are
 * component-scoped, so plain HTML from a remark plugin would stay unstyled.
 * The markup here therefore uses `cs-link-card` classes, styled globally in
 * `src/styles/custom.css`. No MDX needed.
 */
export default function remarkLinkCard() {
  return (tree) => {
    walk(tree)
  }
}

function walk(node) {
  if (!Array.isArray(node.children)) return

  node.children.forEach((child, index) => {
    if (child.type === 'paragraph') {
      const card = toCard(child)
      if (card) {
        node.children[index] = card
        return
      }
    }

    walk(child)
  })
}

function toCard(paragraph) {
  const children = paragraph.children.filter(
    (child) => !(child.type === 'text' && child.value.trim() === ''),
  )

  if (children.length !== 1) return

  const [link] = children
  if (link.type !== 'link' || !link.title) return

  const description = link.title.trim()
  const descriptionHtml = description
    ? `<span class="cs-link-card__description">${escapeHtml(description)}</span>`
    : ''

  return {
    type: 'html',
    value: [
      `<a class="cs-link-card" href="${escapeHtml(link.url)}">`,
      '<span class="cs-link-card__body">',
      `<span class="cs-link-card__title">${inlineToHtml(link.children)}</span>`,
      descriptionHtml,
      '</span>',
      `<svg class="cs-link-card__icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${RIGHT_ARROW}</svg>`,
      '</a>',
    ].join(''),
  }
}

function inlineToHtml(nodes) {
  return nodes
    .map((node) => {
      switch (node.type) {
        case 'text':
          return escapeHtml(node.value)
        case 'inlineCode':
          return `<code>${escapeHtml(node.value)}</code>`
        case 'strong':
          return `<strong>${inlineToHtml(node.children)}</strong>`
        case 'emphasis':
          return `<em>${inlineToHtml(node.children)}</em>`
        case 'delete':
          return `<del>${inlineToHtml(node.children)}</del>`
        case 'break':
          return '<br>'
        // A link inside a link is invalid HTML, so only keep its text.
        case 'link':
          return inlineToHtml(node.children)
        default:
          return node.value ? escapeHtml(node.value) : ''
      }
    })
    .join('')
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Starlight's "right-arrow" icon.
const RIGHT_ARROW =
  '<path d="M17.92 11.62a1.001 1.001 0 0 0-.21-.33l-5-5a1.003 1.003 0 1 0-1.42 1.42l3.3 3.29H7a1 1 0 0 0 0 2h7.59l-3.3 3.29a1.002 1.002 0 0 0 .325 1.639 1 1 0 0 0 1.095-.219l5-5a1 1 0 0 0 .21-.33 1 1 0 0 0 0-.76Z"/>'
