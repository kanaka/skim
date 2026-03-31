import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const skim = path.join(root, 'skim')

function run(args, input = '') {
  const p = spawnSync(skim, args, {
    input,
    encoding: 'utf8',
  })
  return { status: p.status, stdout: p.stdout, stderr: p.stderr }
}

function runRaw(args, inputBuffer) {
  const p = spawnSync(skim, args, { input: inputBuffer })
  return {
    status: p.status,
    stdout: p.stdout,
    stderr: p.stderr,
  }
}

async function runTimeoutNoInput(args) {
  const child = spawn(skim, args, { stdio: ['pipe', 'pipe', 'pipe'] })
  const out = []
  const err = []

  child.stdout.on('data', (d) => out.push(d))
  child.stderr.on('data', (d) => err.push(d))

  // Keep stdin open; timeout should fire and terminate process quickly.
  const code = await new Promise((resolve) => {
    child.on('close', (c) => resolve(c ?? 1))
  })

  return {
    status: code,
    stdout: Buffer.concat(out).toString('utf8'),
    stderr: Buffer.concat(err).toString('utf8'),
  }
}

function lines(start, end) {
  let s = ''
  for (let i = start; i <= end; i++) s += `${i}\n`
  return s
}

function render(items) {
  return items.map((x) => `${x}\n`).join('')
}

function parseLogPath(stderrText) {
  const m = stderrText.match(/^\[skim\] full output: (.+)$/m)
  assert.ok(m, `missing log path in stderr: ${stderrText}`)
  return m[1].trim()
}

test('default output shape', () => {
  const res = run(['--quiet-log-path'], lines(1, 40))
  assert.equal(res.status, 0)
  assert.equal(res.stderr, '')

  const expected = render([1, 2, 3, 4, 5, '..', 36, 37, 38, 39, 40])
  assert.equal(res.stdout, expected)
})

test('short size shorthand -3', () => {
  const res = run(['-3', '--tick-every', '0', '--quiet-log-path'], lines(1, 8))
  assert.equal(res.status, 0)
  assert.equal(res.stderr, '')
  assert.equal(res.stdout, render([1, 2, 3, 6, 7, 8]))
})

test('small output has no ticks/peeks when <= head+tail', () => {
  const res = run([
    '--head', '15',
    '--tail', '15',
    '--tick-every', '5',
    '--peek-every', '10',
    '--quiet-log-path',
  ], lines(1, 20))

  assert.equal(res.status, 0)
  assert.equal(res.stdout, lines(1, 20))
  assert.equal(res.stderr, '')
})

test('flushes buffered ticks/peeks once stream exceeds window', () => {
  const res = run([
    '--head', '15',
    '--tail', '15',
    '--tick-every', '5',
    '--peek-every', '10',
    '--tick-char', '+',
    '--quiet-log-path',
  ], lines(1, 40))

  const expected = render([
    ...Array.from({ length: 15 }, (_, i) => i + 1),
    '++++', 20, '++', 30, '++', 40,
    ...Array.from({ length: 15 }, (_, i) => i + 26),
  ])

  assert.equal(res.status, 0)
  assert.equal(res.stderr, '')
  assert.equal(res.stdout, expected)
})

test('supports --max-files=-1', () => {
  const res = run(['--max-files=-1', '--quiet-log-path'], 'x\n')
  assert.equal(res.status, 0)
  assert.equal(res.stdout, 'x\n')
})

test('supports --max-files -1 (separate token)', () => {
  const res = run(['--max-files', '-1', '--quiet-log-path'], 'x\n')
  assert.equal(res.status, 0)
  assert.equal(res.stdout, 'x\n')
})

test('binary-safe passthrough', () => {
  const input = Buffer.from([0x61, 0x0a, 0xe9, 0x0a, 0x6c, 0x61, 0x73, 0x74, 0x0a])
  const res = runRaw([
    '--head', '2',
    '--tail', '2',
    '--tick-every', '1',
    '--quiet-log-path',
  ], input)

  assert.equal(res.status, 0)
  assert.deepEqual(res.stdout, input)
  assert.deepEqual(res.stderr, Buffer.alloc(0))
})

test('writes full output log file', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'skim-test-log-'))
  try {
    const input = lines(1, 12)
    const res = run([
      '--tmp-dir', tmp,
      '--head', '2',
      '--tail', '2',
      '--tick-every', '0',
    ], input)

    assert.equal(res.status, 0)
    const logPath = parseLogPath(res.stderr)
    assert.ok(fs.existsSync(logPath))
    assert.equal(fs.readFileSync(logPath, 'utf8'), input)
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true })
  }
})

test('prunes by max file count', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'skim-test-prune-count-'))
  try {
    for (let i = 0; i < 5; i++) {
      fs.writeFileSync(path.join(tmp, `skim-pre-${i}.log`), `old ${i}\n`)
    }

    const res = run([
      '--tmp-dir', tmp,
      '--max-files', '2',
      '--max-age-days', '0',
      '--quiet-log-path',
    ], 'x\n')

    assert.equal(res.status, 0)
    const logs = fs.readdirSync(tmp).filter((n) => n.startsWith('skim-') && n.endsWith('.log'))
    assert.ok(logs.length <= 3, `expected <= 3 logs, got ${logs.length}`)
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true })
  }
})

test('prunes by max age', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'skim-test-prune-age-'))
  try {
    const old = path.join(tmp, 'skim-old.log')
    const recent = path.join(tmp, 'skim-recent.log')
    fs.writeFileSync(old, 'old\n')
    fs.writeFileSync(recent, 'new\n')

    const oldMs = Date.now() - 3 * 24 * 60 * 60 * 1000
    fs.utimesSync(old, oldMs / 1000, oldMs / 1000)

    const res = run([
      '--tmp-dir', tmp,
      '--max-files', '999',
      '--max-age-days', '1',
      '--quiet-log-path',
    ], 'x\n')

    assert.equal(res.status, 0)
    assert.equal(fs.existsSync(old), false)
    assert.equal(fs.existsSync(recent), true)
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true })
  }
})

test('timeout returns 124 and prints timeout message', async () => {
  const t0 = Date.now()
  const res = await runTimeoutNoInput(['--timeout', '0.15', '--quiet-log-path'])
  const elapsed = Date.now() - t0

  assert.equal(res.status, 124)
  assert.match(res.stderr, /timeout reached/)
  assert.ok(elapsed < 1500, `timeout test was too slow: ${elapsed}ms`)
})

test('shorthand still works after regular options', () => {
  const res = run(['--head', '2', '-3', '--tick-every', '0', '--quiet-log-path'], lines(1, 8))
  assert.equal(res.status, 0)
  assert.equal(res.stderr, '')
  assert.equal(res.stdout, render([1, 2, 3, 6, 7, 8]))
})
