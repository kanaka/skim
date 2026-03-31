---
name: skim
description: Use `skim` whenever a command might produce large, long running, or unpredictable output, or whenever you would append `| head ...` or `| tail ...`. It prints an early+late summary with progress markers while saving full output to a temp log.
---

# skim

Use `./scripts/skim` to replace most end-of-command `| head ...` / `| tail ...` usage.

## Quick usage

```bash
<command> | ./scripts/skim
```

Default behavior:
- first 5 lines
- `.` every 20 lines (no newline)
- last 5 lines
- full output saved to temp log (path printed to stderr)

## Useful options

```bash
# Control window sizes
<command> | skim --head 8 --tail 12

# Time-box long/stuck commands
<command> | skim --timeout 30

# Marker style ('+') and periodic sample lines
<command> | skim --tick-every 20 --peek-every 100 --tick-char +
```

## Notes

- Prefer `skim` over trailing `| head ...` / `| tail ...` for long or unpredictable commands.
- `--peek-every` prints the current input line every N lines (in addition to head/tail output).
- Markers/samples are suppressed when total output is `<= head + tail`.
- While total size is still unknown, marker/sample events are buffered; as soon as input exceeds `head + tail`, buffered events are emitted immediately, then streaming continues normally.
- Exit code is `124` when timeout is reached.
- Logs are pruned automatically from the temp skim directory by age and max file count.
