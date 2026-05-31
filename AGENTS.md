# Agent Search Guardrails

- Never run recursive searches from repository root (for example `grep -r`, `find .`, `Get-ChildItem -Recurse`, or `rg` without a scoped path).
- Do not scan dependency/vendor directories, especially `node_modules`.
- Always scope recursive search commands to a relevant subdirectory first (for example `client/src`, `server/src`, `game`, or `docs`).
- If the correct directory is unknown, ask for scope instead of searching from root.
