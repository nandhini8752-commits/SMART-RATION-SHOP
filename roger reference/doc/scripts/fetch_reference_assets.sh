#!/usr/bin/env bash
set -euo pipefail

# Optional, manual-use asset fetcher. This does not run automatically during build.
# Review licensing and appropriateness before using government identity assets.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/assets/downloads"
mkdir -p "$OUT"

printf '\nThis script downloads reference assets only. It does not grant permission to use them as an official service identity.\n'
printf 'Keep the prototype disclaimer visible and follow the credits in docs/ASSET_CREDITS.md.\n\n'

if ! command -v curl >/dev/null 2>&1; then
  echo 'curl is required.' >&2
  exit 1
fi

curl --fail --location --silent --show-error --max-time 45 \
  'https://upload.wikimedia.org/wikipedia/commons/b/b9/Tamil_Nadu_Emblem.png' \
  --output "$OUT/tamil-nadu-emblem-commons.png"

curl --fail --location --silent --show-error --max-time 45 \
  'https://chennai.nic.in/wp-content/themes/dbim-theme/images/flag.svg' \
  --output "$OUT/chennai-district-reference-flag.svg"

file "$OUT/tamil-nadu-emblem-commons.png" "$OUT/chennai-district-reference-flag.svg" 2>/dev/null || true
printf '\nDownloads saved to %s\n' "$OUT"
printf 'Review and update docs/ASSET_CREDITS.md before including any downloaded asset in the public site.\n'
