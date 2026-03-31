# skim usage reference

## Common flags

- `--head <n>`: leading lines (default: 5)
- `--tail <n>`: trailing lines (default: 5)
- `--tick-every <n>`: marker interval (default: 20, `0` disables)
- `--tick-char <c>`: marker character (default: `.`)
- `--peek-every <n>`: periodic full-line sample (default: 0, disabled)
- `--timeout <seconds>`: stop reading after timeout (returns `124`)

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
```

## If `skim` is not on PATH

```bash
node ./skim --help
some-command | node ./skim
```
