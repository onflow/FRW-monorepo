#!/usr/bin/env bash
set -euo pipefail

# Sanitize AI-generated release notes to fix common formatting artifacts.
# Usage: bash scripts/release-notes/sanitize_notes.sh <path-to-notes-md>

FILE_PATH=${1:-ai_release_notes.md}
if [ ! -f "$FILE_PATH" ]; then
  echo "No release notes file found at $FILE_PATH; skipping sanitize." >&2
  exit 0
fi

TMP_FILE="${FILE_PATH}.tmp"

# 1) Trim trailing spaces
sed -E 's/[[:space:]]+$//' "$FILE_PATH" > "$TMP_FILE"
mv "$TMP_FILE" "$FILE_PATH"

# 2) Remove unmatched trailing ']' at line ends (common artifact like "#72, #444]")
# Use perl for portability across awk variants
perl -pe '
  my $l = $_; my $o = () = $l =~ /\[/g; my $c = () = $l =~ /\]/g;
  if ($c > $o) { s/\]+$//; }
' "$FILE_PATH" > "$TMP_FILE"
mv "$TMP_FILE" "$FILE_PATH"

# 3) Normalize multiple blank lines to max 2
awk 'BEGIN{blank=0} {
  if ($0 ~ /^\s*$/) {
    blank++
    if (blank <= 2) print
  } else {
    blank=0; print
  }
}' "$FILE_PATH" > "$TMP_FILE"
mv "$TMP_FILE" "$FILE_PATH"

exit 0

