import type { DefaultTheme } from 'vitepress'

export interface SidebarLink {
  text: string
  link: string
  depth: number
}

export interface SidebarGroup {
  key: string
  title?: string
  items: SidebarLink[]
}

export function normalizePath(path: string): string {
  const withoutHash = path.split('#')[0] ?? ''
  const withoutQuery = withoutHash.split('?')[0] ?? ''
  let clean = withoutQuery.replace(/\.html$/, '').replace(/\/index$/, '/')
  if (clean.length > 1 && clean.endsWith('/')) {
    clean = clean.slice(0, -1)
  }
  return clean || '/'
}

export function isActivePath(link: string | undefined, currentPath: string): boolean {
  if (!link || link.includes('#')) return false
  return normalizePath(link) === normalizePath(currentPath)
}

export function isNavLinkActive(
  item: { link?: string; activeMatch?: string },
  currentPath: string,
): boolean {
  if (item.activeMatch) {
    try {
      return new RegExp(item.activeMatch).test(normalizePath(currentPath))
    } catch {
      return false
    }
  }
  return isActivePath(item.link, currentPath)
}

function joinBase(base: string | undefined, link: string | undefined): string | undefined {
  if (!link || !base || link.startsWith('/') || /^https?:\/\//.test(link)) {
    return link
  }
  const cleanBase = base.endsWith('/') ? base : `${base}/`
  return `${cleanBase}${link}`
}

function applyBase(items: DefaultTheme.SidebarItem[], base?: string): DefaultTheme.SidebarItem[] {
  if (!base) return items
  return items.map((item) => ({
    ...item,
    link: joinBase(base, item.link),
    items: item.items ? applyBase(item.items, base) : undefined,
  }))
}

export function resolveSidebarItems(
  sidebar: DefaultTheme.Sidebar | undefined,
  currentPath: string,
): DefaultTheme.SidebarItem[] {
  if (!sidebar) return []
  if (Array.isArray(sidebar)) return sidebar

  const target = normalizePath(currentPath)
  let bestLength = -1
  let bestEntry:
    DefaultTheme.SidebarItem[] | { items: DefaultTheme.SidebarItem[]; base: string } | undefined

  for (const [key, value] of Object.entries(sidebar)) {
    const normKey = normalizePath(key)
    const matched = normKey === '/' ? true : target === normKey || target.startsWith(`${normKey}/`)
    if (matched && normKey.length > bestLength) {
      bestLength = normKey.length
      bestEntry = value
    }
  }

  if (!bestEntry) return []
  if (Array.isArray(bestEntry)) return bestEntry
  return applyBase(bestEntry.items, bestEntry.base)
}

function collectLinks(items: DefaultTheme.SidebarItem[], depth: number, out: SidebarLink[]) {
  for (const item of items) {
    if (item.link) {
      out.push({ text: item.text ?? '', link: item.link, depth })
    }
    if (item.items?.length) {
      collectLinks(item.items, item.link ? depth + 1 : depth, out)
    }
  }
}

function buildGroups(items: DefaultTheme.SidebarItem[], prefix: string): SidebarGroup[] {
  const groups: SidebarGroup[] = []
  let looseLinks: SidebarLink[] = []

  const flushLoose = () => {
    if (looseLinks.length > 0) {
      groups.push({ key: `${prefix}-group-${groups.length}`, items: looseLinks })
      looseLinks = []
    }
  }

  for (const entry of items) {
    if (entry.items?.length && !entry.link) {
      flushLoose()
      const collected: SidebarLink[] = []
      collectLinks(entry.items, 0, collected)
      groups.push({
        key: `${prefix}-group-${groups.length}-${entry.text ?? ''}`,
        title: entry.text,
        items: collected,
      })
    } else {
      collectLinks([entry], 0, looseLinks)
    }
  }

  flushLoose()
  return groups
}

export function normalizeSidebar(
  sidebar: DefaultTheme.Sidebar | undefined,
  currentPath = '/',
): SidebarGroup[] {
  return buildGroups(resolveSidebarItems(sidebar, currentPath), 'sidebar')
}

export function flattenSidebarLinks(
  sidebar: DefaultTheme.Sidebar | undefined,
  currentPath?: string,
): SidebarLink[] {
  if (!sidebar) return []

  const seen = new Set<string>()
  const result: SidebarLink[] = []

  const pushGroups = (groups: SidebarGroup[]) => {
    for (const group of groups) {
      for (const item of group.items) {
        if (!item.link || item.link.includes('#')) continue
        const key = normalizePath(item.link)
        if (seen.has(key)) continue
        seen.add(key)
        result.push(item)
      }
    }
  }

  if (currentPath !== undefined || Array.isArray(sidebar)) {
    pushGroups(normalizeSidebar(sidebar, currentPath ?? '/'))
    return result
  }

  for (const [key, value] of Object.entries(sidebar)) {
    const rawItems = Array.isArray(value) ? value : applyBase(value.items, value.base)
    pushGroups(buildGroups(rawItems, `multi-${key}`))
  }

  return result
}

export function getPrevNext(
  sidebar: DefaultTheme.Sidebar | undefined,
  currentPath: string,
): { prev?: SidebarLink; next?: SidebarLink } {
  const links = flattenSidebarLinks(sidebar, currentPath)
  const target = normalizePath(currentPath)
  const idx = links.findIndex((item) => normalizePath(item.link) === target)

  if (idx === -1) return {}

  return {
    prev: idx > 0 ? links[idx - 1] : undefined,
    next: idx < links.length - 1 ? links[idx + 1] : undefined,
  }
}
