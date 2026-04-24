import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function parseFrontmatter(text, skillMdPath) {
  const m = text.match(/^---\n([\s\S]*?)\n---/)
  assert.ok(m, `missing frontmatter in ${skillMdPath}`)

  const fm = m[1]
  const name = (fm.match(/^name:\s*(.+)$/m) || [])[1]?.trim()
  const description = (fm.match(/^description:\s*(.+)$/m) || [])[1]?.trim()

  assert.ok(name, `missing frontmatter name in ${skillMdPath}`)
  assert.ok(description, `missing frontmatter description in ${skillMdPath}`)
  return { name, description }
}

test('package.json agents.skills entries are valid', () => {
  const pkg = readJSON(path.join(root, 'package.json'))
  const entries = pkg?.agents?.skills

  assert.ok(Array.isArray(entries), 'agents.skills must be an array')
  assert.ok(entries.length > 0, 'agents.skills must not be empty')

  for (const entry of entries) {
    assert.equal(typeof entry, 'object', 'agents.skills entry must be object')
    assert.ok(entry.name, 'agents.skills entry missing name')
    assert.ok(entry.path, 'agents.skills entry missing path')

    const skillDir = path.resolve(root, entry.path)
    const skillMd = path.join(skillDir, 'SKILL.md')
    assert.ok(fs.existsSync(skillMd), `missing SKILL.md: ${skillMd}`)

    const { name } = parseFrontmatter(fs.readFileSync(skillMd, 'utf8'), skillMd)
    const folder = path.basename(skillDir)

    assert.equal(name, folder, `frontmatter name '${name}' != folder '${folder}'`)
    assert.equal(entry.name, folder, `agents name '${entry.name}' != folder '${folder}'`)
  }
})

test('bin points to executable skim', () => {
  const pkg = readJSON(path.join(root, 'package.json'))
  const rel = pkg?.bin?.skim
  assert.equal(rel, 'skim', 'bin.skim must point to "skim"')

  const binPath = path.join(root, 'skim')
  assert.ok(fs.existsSync(binPath), 'skim executable missing')

  const st = fs.statSync(binPath)
  assert.ok(st.isFile(), 'skim must be a file')
  assert.ok((st.mode & 0o111) !== 0, 'skim must be executable')
})

test('skill-local executable copy matches canonical ./skim', () => {
  const canonical = path.join(root, 'skim')
  const skillCopy = path.join(root, 'skills', 'skim', 'scripts', 'skim')

  assert.ok(fs.existsSync(skillCopy), 'missing generated skill executable copy')

  const src = fs.readFileSync(canonical)
  const dst = fs.readFileSync(skillCopy)
  assert.deepEqual(dst, src, 'skill executable copy is out of sync with ./skim')

  const st = fs.statSync(skillCopy)
  assert.ok((st.mode & 0o111) !== 0, 'skill executable copy must be executable')
})
