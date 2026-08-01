#!/usr/bin/env sh
set -eu

generated_file="$(mktemp)"
trap 'rm -f "$generated_file"' EXIT

pnpm dlx supabase gen types typescript --local > "$generated_file"
if ! cmp -s "$generated_file" lib/supabase/database.types.ts; then
  echo "Supabase database types are out of date. Run: pnpm db:types" >&2
  exit 1
fi
