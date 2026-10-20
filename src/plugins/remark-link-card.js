/**
 * Render `[title](url "description")` as a Starlight-style link card.
 *
 * A paragraph made only of titled links becomes one card per link. Adjacent
 * such paragraphs are grouped into a single grid, mirroring Starlight's
 * <LinkCards>: one card stands alone, several sit side by side.
 *
 * Starlight ships <LinkCard> as an MDX component whose styles are scoped, so
 * plain HTML from a remark plugin would stay unstyled. The markup below uses
 * `cs-link-card` / `cs-link-cards` classes, styled globally in
 * `src/styles/custom.css`. No MDX needed.
 */
export default function remarkLinkCard() {
  return (tree) => {
    walk(tree)
  }
}

function walk(parent) {
  if (!Array.isArray(parent.children)) return

  const out = []
  let cards = []

  const flush = () => {
    if (!cards.length) return

    out.push(cards.length === 1 ? cardNode(cards[0]) : gridNode(cards))
    cards = []
  }

  parent.children.forEach((child) => {
    if (child.type === 'paragraph') {
      const links = linksIn(child)
      if (links) {
        cards.push(...links)
        return
      }
    }

    flush()
    walk(child)
    out.push(child)
  })

  flush()
  parent.children = out
}

function linksIn(paragraph) {
  const children = paragraph.children.filter(
    (child) => !(child.type === 'text' && child.value.trim() === ''),
  )

  if (children.length === 0) return null
  if (!children.every((child) => child.type === 'link' && child.title)) return null

  return children
}

function cardNode(link) {
  return { type: 'html', value: cardHtml(link) }
}

function gridNode(links) {
  return {
    type: 'html',
    value: `<div class="cs-link-cards">${links.map(cardHtml).join('')}</div>`,
  }
}

function cardHtml(link) {
  const description = link.title.trim()
  const descriptionHtml = description
    ? `<span class="cs-link-card__description">${escapeHtml(description)}</span>`
    : ''

  return [
    `<a class="cs-link-card" href="${escapeHtml(link.url)}">`,
    '<span class="cs-link-card__body">',
    `<span class="cs-link-card__title">${inlineToHtml(link.children)}</span>`,
    descriptionHtml,
    '</span>',
    `<svg class="cs-link-card__icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${RIGHT_ARROW}</svg>`,
    '</a>',
  ].join('')
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
