#!/usr/bin/env sh
set -eu
root="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cp "$root/skim" "$root/skills/skim/scripts/skim"
chmod +x "$root/skim" "$root/skills/skim/scripts/skim"
echo "synced: skim -> skills/skim/scripts/skim"
