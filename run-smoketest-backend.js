#!/usr/bin/env node
// Unified backend smoke test (brands, catalog, search, projects, schedules)
// Uses the running Next.js server; expects DB schema to be migrated.
// Usage: SMOKETEST_BASE_URL=http://localhost:3000 node run-smoketest-backend.js

const fs = require('fs')
const path = require('path')

const BASE_URL = process.env.SMOKETEST_BASE_URL || 'http://localhost:3000'
const USER_ID = process.env.SMOKETEST_USER_ID || 'smoketest-user'
const OUT_FILE = path.join(process.cwd(), 'smoke-test-backend-log.md')

function now() {
  return new Date().toISOString()
}

function randSuffix() {
  return Math.random().toString(36).slice(2, 8)
}

async function request(method, route, body) {
  const url = BASE_URL + route
  const headers = { 'Content-Type': 'application/json' }
  const options = { method, headers }
  if (body !== undefined) {
    options.body = JSON.stringify(body)
  }
  let res
  let text
  try {
    res = await fetch(url, options)
    text = await res.text()
  } catch (err) {
    return { ok: false, status: 0, raw: String(err), json: null }
  }

  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    // ignore parse errors
  }

  return { ok: res.ok, status: res.status, raw: text, json }
}

function addSection(lines, title, { method, route, body }, res) {
  lines.push(`## ${title}`)
  lines.push(`**Request:** \`${method} ${route}\``)
  if (body !== undefined) {
    lines.push('**Body:**')
    lines.push('```json')
    lines.push(JSON.stringify(body, null, 2))
    lines.push('```')
  }
  lines.push(`**Status:** ${res.status}${res.ok ? ' ✅' : ' ❌'}`)
  if (res.json !== null) {
    lines.push('**Response:**')
    lines.push('```json')
    lines.push(JSON.stringify(res.json, null, 2))
    lines.push('```')
  } else if (res.raw) {
    lines.push('**Response (raw):**')
    lines.push('```')
    lines.push(String(res.raw).slice(0, 400))
    lines.push('```')
  }
  lines.push('')
}

async function main() {
  const lines = [
    '# Backend Smoke Test',
    '',
    `Base URL: ${BASE_URL}`,
    `User: ${USER_ID}`,
    `Date: ${now()}`,
    '',
    '---',
    '',
  ]

  // 1. Catalog meta
  const metaRes = await request('GET', '/api/catalog/meta')
  addSection(lines, 'Catalog Meta', { method: 'GET', route: '/api/catalog/meta' }, metaRes)

  // 2. Categories tree
  const catRes = await request('GET', '/api/catalog/categories')
  addSection(lines, 'Categories', { method: 'GET', route: '/api/catalog/categories' }, catRes)

  // 3. Brands list
  const brandsRes = await request('GET', '/api/brands')
  addSection(lines, 'Brands List', { method: 'GET', route: '/api/brands' }, brandsRes)

  // 4. Create brand (idempotent-ish via random suffix)
  const newBrand = {
    name: `Smoke Brand ${randSuffix()}`,
    website: null,
    phone: null,
    isActive: true,
  }
  const createBrandRes = await request('POST', '/api/brands', newBrand)
  addSection(lines, 'Create Brand', { method: 'POST', route: '/api/brands', body: newBrand }, createBrandRes)

  // 5. Products list
  const productsRes = await request('GET', '/api/products')
  addSection(lines, 'Products List', { method: 'GET', route: '/api/products' }, productsRes)

  // 6. Product search + suggestions
  const searchRes = await request('GET', '/api/search/products?q=tile')
  addSection(lines, 'Search Products', { method: 'GET', route: '/api/search/products?q=tile' }, searchRes)
  const suggestRes = await request('GET', '/api/search/suggestions?q=tile')
  addSection(
    lines,
    'Search Suggestions',
    { method: 'GET', route: '/api/search/suggestions?q=tile' },
    suggestRes,
  )

  // 7. Projects create + list + patch + detail
  const projectPayload = {
    name: `Smoke Project ${randSuffix()}`,
    code: `SMK-${randSuffix()}`.toUpperCase(),
    clientName: 'Smoke Client',
    description: 'Smoke test project',
  }
  const createProjRes = await request('POST', '/api/projects', projectPayload)
  addSection(lines, 'Create Project', { method: 'POST', route: '/api/projects', body: projectPayload }, createProjRes)
  const projectId = createProjRes.json?.project?.id || null

  const listProjRes = await request('GET', '/api/projects')
  addSection(lines, 'List Projects', { method: 'GET', route: '/api/projects' }, listProjRes)

  if (projectId) {
    const patchBody = { name: `${projectPayload.name} (updated)` }
    const patchProjRes = await request('PATCH', `/api/projects/${projectId}`, patchBody)
    addSection(
      lines,
      'Update Project',
      { method: 'PATCH', route: `/api/projects/${projectId}`, body: patchBody },
      patchProjRes,
    )

    const detailProjRes = await request('GET', `/api/projects/${projectId}`)
    addSection(
      lines,
      'Project Detail',
      { method: 'GET', route: `/api/projects/${projectId}` },
      detailProjRes,
    )
  } else {
    lines.push('## Update/Detail Project')
    lines.push('Skipped: projectId missing from create response.')
    lines.push('')
  }

  // 8. Schedule create + list + add item (uses in-memory stub)
  const scheduleBody = { name: `Smoke Schedule ${randSuffix()}`, description: 'Smoke schedule', userId: USER_ID }
  const createSchedRes = await request('POST', '/api/schedule', scheduleBody)
  addSection(
    lines,
    'Create Schedule',
    { method: 'POST', route: '/api/schedule', body: scheduleBody },
    createSchedRes,
  )
  const scheduleId = createSchedRes.json?.schedule?.id || null

  const listSchedRes = await request('GET', `/api/schedule?userId=${encodeURIComponent(USER_ID)}`)
  addSection(
    lines,
    'List Schedules',
    { method: 'GET', route: `/api/schedule?userId=${encodeURIComponent(USER_ID)}` },
    listSchedRes,
  )

  if (scheduleId) {
    const itemBody = { scheduleId, code: `CODE-${randSuffix()}`, quantity: 1, unitOfMeasure: 'pcs' }
    const addItemRes = await request('POST', '/api/schedule/items', itemBody)
    addSection(
      lines,
      'Add Schedule Item',
      { method: 'POST', route: '/api/schedule/items', body: itemBody },
      addItemRes,
    )
  } else {
    lines.push('## Add Schedule Item')
    lines.push('Skipped: scheduleId missing from create response.')
    lines.push('')
  }

  lines.push('---')
  lines.push('Smoke test complete.')

  fs.writeFileSync(OUT_FILE, lines.join('\n'), 'utf8')
  console.log(`Smoke test finished. Log written to ${OUT_FILE}`)
}

main().catch((err) => {
  console.error('Smoke test failed:', err)
  process.exit(1)
})
