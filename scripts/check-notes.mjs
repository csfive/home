import { readdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const roots = ['docs/ms', 'docs/cs50g']
let errors = 0
let lectures = 0
let articles = 0

for (const root of roots) {
  const entries = await readdir(root, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const dir = join(root, entry.name)
    const indexPath = join(dir, 'index.md')
    if (!existsSync(indexPath)) {
      console.error(`${dir}: missing index.md`)
      errors++
      continue
    }

    lectures++
    const text = await readFile(indexPath, 'utf8')
    const links = [...text.matchAll(/^## \[([^\]]+)\]\(([^)]+)\)/gm)]
    const targets = new Set()

    for (const [, title, href] of links) {
      const target = `docs${href.replace(/\/$/, '')}.md`
      targets.add(target.split('/').pop())
      if (!existsSync(target)) {
        console.error(`${indexPath}: dead link for "${title}" -> ${href}`)
        errors++
      }
    }

    const files = (await readdir(dir)).filter((name) => name.endsWith('.md') && name !== 'index.md')
    articles += files.length

    for (const file of files) {
      if (!targets.has(file)) {
        console.error(`${dir}: ${file} is not linked from index.md`)
        errors++
      }
    }

    if (!files.includes('pitfalls.md')) {
      console.error(`${dir}: missing pitfalls.md`)
      errors++
    }
  }
}

if (errors > 0) {
  console.error(`\n${errors} problem(s) across ${lectures} lectures`)
  process.exit(1)
}

console.log(`${lectures} lectures, ${articles} articles: links OK`)
