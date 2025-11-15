import { spawn } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createWriteStream } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const server = join(root, '..', '.next', 'standalone', 'server.js')

const out = createWriteStream(join(root, '..', 'server.log'), { flags: 'a' })
const proc = spawn(process.execPath, [server], {
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: ['ignore', 'pipe', 'pipe'],
})

proc.stdout.pipe(process.stdout)
proc.stdout.pipe(out)
proc.stderr.pipe(process.stderr)
proc.stderr.pipe(out)

proc.on('exit', (code) => {
  console.log(`[start] server exited with code ${code}`)
  out.end()
})

