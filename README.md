# skim

`skim` is a tool for running/monitoring commands with long or unpredictable output.

It is especially useful with coding agents, where command output can be huge, noisy, or long running.

Implemented as a node executable with no npm dependencies.

## What it does

- prints first N lines
- prints last N lines
- prints progress ticks while streaming
- optionally prints periodic sample lines
- saves full output to temp logs with pruning

## Usage

```bash
skim --help

some-command | skim
some-command | skim -3 --tick-every 10 --timeout 60
```

## Skill packaging

This package also ships an Agent Skills-compatible skill at `skills/skim/`.

It is structured to work with current distribution mechanisms:

- **Direct git install (baseline):** [`vercel-labs/skills`](https://github.com/vercel-labs/skills#install-a-skill) via `npx skills add <repo>`, using the `skills/<skill>/SKILL.md` layout.
- **npm-bundled discovery by folder convention:** [`antfu/skills-npm`](https://github.com/antfu/skills-npm) (see [`PROPOSAL.md`](https://github.com/antfu/skills-npm/blob/main/PROPOSAL.md)); discovers bundled `skills/*/SKILL.md`.
- **npm-bundled discovery by `package.json` registration:** [`onmax/npm-agentskills`](https://github.com/onmax/npm-agentskills) (current reference implementation for `agents.skills`), using `package.json` `agents.skills` entries ([author docs](https://github.com/onmax/npm-agentskills#for-library-authors-bundling-skills)).

`agents.skills` is currently a tooling convention (not part of the core Agent Skills file-format specification), so we include both the `skills/` directory and `agents.skills` metadata for compatibility.

## Layout

- `skim` — canonical executable CLI
- `skills/skim/scripts/skim` — generated copy for skill portability
- `skills/skim/SKILL.md` — skill entry point
- `skills/skim/references/usage.md` — supplemental docs
- `test/*.test.mjs` — standard Node test suite

## Run tests

```bash
npm test
```

## Sync skill executable copy

```bash
npm run sync:skill-exec
```
