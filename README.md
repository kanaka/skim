# skim

`skim` is a tool for running/monitoring commands with long or unpredictable output.

It is especially useful with coding agents, where command output can be huge, noisy, or long running.

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

It is structured to work with multiple skills conventions:

- `skills-npm` (discovers `skills/*/SKILL.md`)
- `npm-agentskills` (uses `package.json` `agents.skills` entries)

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
