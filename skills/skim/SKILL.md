---
name: skim
description: Use `skim` whenever a command might produce large, long running, or unpredictable output, or whenever you would append `| head ...` or `| tail ...`. It prints an early+late summary with progress markers while saving full output to a temp log.
---

# skim

Use `./scripts/skim` to replace most end-of-command `| head ...` / `| tail ...` usage.

`skim` supports two modes:
- **pipeline mode**: `<command> | skim`
- **wrapped mode**: `skim [opts] -- <command> [args...]`

## Quick usage

```bash
# pipeline mode
<command> | ./scripts/skim

# wrapped mode (skim runs command directly)
./scripts/skim -- <command> [args...]
```

Default behavior:
- first 5 lines
- `.` every 1 lines (no newline)
- last 5 lines
- full output saved to temp log (path printed to stderr)

## Useful options

```bash
# Control window sizes
<command> | skim --head 8 --tail 12

# Time-box long/stuck commands
<command> | skim --timeout 30

# Abort if command goes silent for 30s
# (resets on any received characters, not just newlines)
# --inactive-timeout is wrapped-mode only
skim --inactive-timeout 30 -- <command>

# Marker style ('+') and periodic sample lines
<command> | skim --tick-every 20 --peek-every 100 --tick-char +
```

## Notes

- Prefer `skim` over trailing `| head ...` / `| tail ...` for long or unpredictable commands.
- `--peek-every` prints the current input line every N lines (in addition to head/tail output).
- Markers/samples are suppressed when total output is `<= head + tail`.
- While total size is still unknown, marker/sample events are buffered; as soon as input exceeds `head + tail`, buffered events are emitted immediately, then streaming continues normally.
- Exit code is `124` for `--timeout` and `125` for `--inactive-timeout`.
- In wrapped mode (`skim -- cmd ...`), skim returns the wrapped command's exit code on normal completion.
- `--inactive-timeout` is only supported in wrapped mode.
- In pipeline mode, `--timeout` may not interrupt until the upstream command performs its next write.
- In plain pipelines (`cmd | skim`), use shell `pipefail` if you need upstream failures to affect pipeline status.
- Logs are pruned automatically from the temp skim directory by age and max file count.
