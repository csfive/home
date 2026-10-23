import type MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'

type Card = {
  href: string
  title: string
  description: string
}

/**
 * Render `[title](url "description")` as a link card.
 *
 * A paragraph made only of titled links becomes one card per link. Adjacent
 * such paragraphs are grouped into a single grid, so a few cards can sit side
 * by side. Everything else is left untouched.
 */
export function linkCard(md: MarkdownIt) {
  md.core.ruler.push('cs_link_card', (state) => {
    const tokens = state.tokens
    const result: Token[] = []
    let index = 0

    const inlineToHtml = (children: Token[]) =>
      state.md.renderer.renderInline(
        children.filter((child) => child.type !== 'link_open' && child.type !== 'link_close'),
        state.md.options,
        state.env,
      )

    const linksIn = (inline: Token): Card[] | null => {
      const children = inline.children ?? []
      const cards: Card[] = []
      let cursor = 0

      while (cursor < children.length) {
        const child = children[cursor]

        if (child.type === 'text' && child.content.trim() === '') {
          cursor++
          continue
        }

        if (child.type === 'softbreak' || child.type === 'hardbreak') {
          cursor++
          continue
        }

        if (child.type !== 'link_open') return null

        let depth = 0
        let end = cursor

        for (; end < children.length; end++) {
          if (children[end].type === 'link_open') depth++
          else if (children[end].type === 'link_close') {
            depth--
            if (depth === 0) break
          }
        }

        const href = child.attrGet('href')
        const description = child.attrGet('title')

        if (depth !== 0 || !href || !description) return null

        cards.push({
          href,
          description,
          title: inlineToHtml(children.slice(cursor + 1, end)),
        })

        cursor = end + 1
      }

      return cards.length > 0 ? cards : null
    }

    while (index < tokens.length) {
      const cards: Card[] = []
      let next = index

      while (
        next + 2 < tokens.length &&
        tokens[next].type === 'paragraph_open' &&
        tokens[next + 1].type === 'inline' &&
        tokens[next + 2].type === 'paragraph_close'
      ) {
        const links = linksIn(tokens[next + 1])
        if (!links) break

        cards.push(...links)
        next += 3
      }

      if (cards.length === 0) {
        result.push(tokens[index])
        index++
        continue
      }

      const token = new state.Token('html_block', '', 0)
      token.block = true
      token.content = cards.length === 1 ? cardHtml(cards[0]) : gridHtml(cards)
      token.map = [tokens[index].map?.[0] ?? 0, tokens[next - 1].map?.[1] ?? 0]
      token.level = tokens[index].level
      result.push(token)
      index = next
    }

    state.tokens = result
  })
}

function cardHtml(card: Card) {
  const description = card.description
    ? `<span class="cs-link-card__description">${escapeHtml(card.description)}</span>`
    : ''

  return [
    `<a class="cs-link-card" href="${escapeHtml(card.href)}">`,
    '<span class="cs-link-card__body">',
    `<span class="cs-link-card__title">${card.title}</span>`,
    description,
    '</span>',
    `<svg class="cs-link-card__icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${RIGHT_ARROW}</svg>`,
    '</a>',
  ].join('')
}

function gridHtml(cards: Card[]) {
  return `<div class="cs-link-cards">${cards.map(cardHtml).join('')}</div>`
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const RIGHT_ARROW =
  '<path d="M17.92 11.62a1.001 1.001 0 0 0-.21-.33l-5-5a1.003 1.003 0 1 0-1.42 1.42l3.3 3.29H7a1 1 0 0 0 0 2h7.59l-3.3 3.29a1.002 1.002 0 0 0 .325 1.639 1 1 0 0 0 1.095-.219l5-5a1 1 0 0 0 .21-.33 1 1 0 0 0 0-.76Z"/>'
