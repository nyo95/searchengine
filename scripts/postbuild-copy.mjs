import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function safeCopy(src, dest) {
  if (!existsSync(src)) return
  // Ensure parent dir exists
  const parent = dirname(dest)
  try {
    mkdirSync(parent, { recursive: true })
  } catch {}
  try {
    cpSync(src, dest, { recursive: true, force: true })
    console.log(`[postbuild] Copied`, src, '->', dest)
  } catch (err) {
    console.warn(`[postbuild] Skip copy`, src, '->', dest, err?.message || err)
  }
}

const root = join(__dirname, '..')
const nextDir = join(root, '..', '.next')
const standalone = join(nextDir, 'standalone')

// Copy .next/static into standalone/.next/static (Next standalone excludes it)
safeCopy(join(nextDir, 'static'), join(standalone, '.next', 'static'))

// Copy public into standalone/public to serve static assets
safeCopy(join(root, '..', 'public'), join(standalone, 'public'))

