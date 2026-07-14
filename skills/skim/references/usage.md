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

## stderr capture

- In wrapped mode (`skim -- cmd ...`), skim captures both stdout and stderr in true write order: the command is launched via a fixed POSIX-sh wrapper (`sh -c 'exec "$@" 2>&1'`) that merges stderr into stdout at the fd level and then replaces itself with the command (`child.pid` is the real command, not a shell).
- Security: command arguments are passed as positional parameters and expanded with quoted `"$@"`. They are never interpolated into shell text, so metacharacters (`$(...)`, backticks, `;`, globs) in arguments are not evaluated.
- A missing command is reported by sh inside the captured output and exits `127`. Wrapped mode requires `/bin/sh` and skim exits with an error where none exists (e.g. Windows, distroless containers). Pipeline mode has no such requirement.
- Log files are created with mode `0600`, since captured stderr often contains more sensitive material than stdout.
- In pipeline mode (`cmd | skim`), only stdout is piped in. Add `2>&1` to the upstream command if you want stderr too:

```bash
some-command 2>&1 | skim
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
