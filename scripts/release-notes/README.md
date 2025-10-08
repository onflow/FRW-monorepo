Release Notes Scripts

Overview

- These scripts generate user-facing release notes for a given tag and update
  the corresponding GitHub Release body.
- Monorepo-aware: for tags like `release/ext-3.0.0`, commits are compared to the
  most recent tag with the same prefix (`release/ext-*`).

Scripts

- `collect_commits.sh`: Determines `TAG_NAME`, finds `PREVIOUS_TAG`, and writes
  `commit_info.md` for AI.
- `generate_with_ai.sh`: Calls Anthropic Claude (optional) to produce
  `ai_release_notes.md`, with a fallback if the API is unavailable.
- `sanitize_notes.sh`: Fixes common formatting artifacts (trailing spaces, stray
  `]`, excessive blank lines).
- `update_release_body.sh`: Updates the GitHub Release body with the generated
  notes.

Requirements

- `git`, `bash`, `jq`, `curl` installed locally.
- Access to the repository with tags present (git clone with tags).
- Optional: `ANTHROPIC_API_KEY` for AI-generated notes; otherwise fallback text
  is used.
- For updating the GitHub Release body: a `GITHUB_TOKEN` with `repo` scope.

Local Testing (No network update)

1. Choose a tag, e.g. `release/mob-3.0.0`.
2. Collect commits (no API calls): EVENT_NAME=workflow_dispatch \
   INPUT_TAG_NAME=release/mob-3.0.0 \
   REPOSITORY=onflow/FRW-monorepo \
   bash scripts/release-notes/collect_commits.sh
   - Outputs: `commit_info.md`, and prints commit count. Environment outputs are
     only used in Actions; locally, just inspect the files.

3. Generate notes (AI optional):
   - With AI: export `ANTHROPIC_API_KEY` then run:
     PREVIOUS_TAG=$(git tag --list 'release/mob-*' --sort=-version:refname | grep -v '^release/mob-3.0.0$'
     | head -n1) \
     TAG_NAME=release/mob-3.0.0 \
     COMMIT_COUNT=$(rg -c '^### Commit ' commit_info.md || true) \
     REPOSITORY=onflow/FRW-monorepo \
     bash scripts/release-notes/generate_with_ai.sh

   - Without AI (fallback): omit `ANTHROPIC_API_KEY` and run the same command.
     It writes `ai_release_notes.md` using a generic template and changelog
     link.

4. Sanitize Markdown: bash scripts/release-notes/sanitize_notes.sh
   ai_release_notes.md

5. Inspect output locally: open `ai_release_notes.md` in your editor to review
   formatting and content.

Local Testing (Perform GitHub update) Warning: This will PATCH the release body
on GitHub.

1. Ensure a Release exists for the target tag in GitHub.
2. Run after steps 1–4 above: TAG_NAME=release/mob-3.0.0 \
   REPOSITORY=onflow/FRW-monorepo \
   GITHUB_TOKEN=ghp_xxx # or a fine-grained token \
   bash scripts/release-notes/update_release_body.sh

CI Usage Notes

- In GitHub Actions, the workflow supports two triggers:
  - `release` events (`created`, `published`): no manual input required.
  - `workflow_dispatch` (manual): `tag_name` input is optional. If omitted and
    the run is dispatched from a tag ref, the scripts use `GITHUB_REF_NAME` as
    `TAG_NAME`. Otherwise, the run will fail with an error asking for a tag.

Troubleshooting

- No previous tag found: The first release for a prefix will compare against
  repo start; this is expected.
- Contributors count looks low: GitHub’s built-in contributors list is PR-based
  and not prefix-aware. Consider adding a custom contributors section if needed.
- Stray `]` at line ends: The sanitizer removes unmatched trailing brackets
  without impacting valid Markdown.
- Missing `jq`/`curl`: Install via your package manager (`brew install jq curl`
  on macOS).
