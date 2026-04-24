# skim usage reference

## Common flags

- `--head <n>`: leading lines (default: 5)
- `--tail <n>`: trailing lines (default: 5)
- `--tick-every <n>`: marker interval (default: 1, `0` disables)
- `--tick-char <c>`: marker character (default: `.`)
- `--peek-every <n>`: periodic full-line sample (default: 0, disabled)
- `--timeout <seconds>`: stop reading after total timeout (returns `124`)
- `--inactive-timeout <seconds>`: stop if no output is received for this long (resets on any characters; wrapped mode only; returns `125`)

## Size shorthand

- `-N` means `--head N --tail N`
- example: `-3`

## Examples

```bash
# default behavior
some-command | skim

# more visible progress
some-command | skim --tick-char + --tick-every 10

# periodic sample lines too
some-command | skim --tick-every 20 --peek-every 100

# custom windows
some-command | skim --head 10 --tail 15

# abort if command goes quiet for 30s (wrapped mode)
skim --inactive-timeout 30 -- some-command
```

## Exit-code note

- In `cmd | skim` pipelines, upstream failures can be hidden unless your shell uses `pipefail`.
- Use `set -o pipefail` when exit-code propagation matters.
- In wrapped mode (`skim -- cmd ...`), skim returns the wrapped command exit code on normal completion.

## If `skim` is not on PATH

```bash
node ./skim --help
some-command | node ./skim
```
