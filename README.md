# Obsidian DevLab

Reusable Obsidian desktop E2E lab. Public infrastructure only: never put private plugin code, classroom notes, access tokens or personal vaults here.

## v0.1 preview
A reusable GitHub Actions workflow runs on Linux with Node 22, Python 3.11 and Xvfb. It builds the calling repository using its devlab:prepare script, runs a real public stable Obsidian desktop instance via WebdriverIO, and uploads screenshots, DOM, per-test JSON, JUnit and driver logs. Error listener captures uncaught errors after session setup; not full startup console capture. No paid beta credentials needed. No persistent runner.

## Consumer contract
- Define npm script devlab:prepare to run checks and create a plugin directory containing manifest.json and main.js (styles.css optional).
- Keep synthetic fixtures under test-vault and specs under e2e, with *.e2e.mjs files importing @wdio/globals. Specs are copied into the harness; use relative imports only within e2e. Tests may use browser.executeObsidian / executeObsidianCommand.
- Call .github/workflows/e2e.yml at an immutable commit SHA, and supply the same SHA as harness_ref. Override plugin_path, vault_path, specs_path, extras (JSON array of runtime directory names), and obsidian_version as needed.
- Use synthetic vaults only. Artifacts are visible according to the calling repository's permissions and expire after 7 days. Never pass secrets to tests. Workflows use read-only contents permissions, no deployment or automatic release.
- The launcher installs only core plugin files; extras are copied into the disposable vault before launching. The original fixture is never modified.

## Example
```yaml
jobs:
  e2e:
    uses: helliprojects/obsidian-devlab/.github/workflows/e2e.yml@COMMIT_SHA
    with:
      harness_ref: COMMIT_SHA
      plugin_path: dist/my-plugin
```

Use the same real SHA in both places. See the self-test workflow for a reference fixture. Run results and artifacts are under Actions in the caller repo. Check actual CI status before claiming functionality.

## Roadmap
- First milestone: reference fixture and real plugin UI tests on Linux.
- Next: lockfiles, pinned Obsidian release matrix, reproducible visual baselines, performance measurements, Windows/macOS, structured HTML summary and optional CLI/MCP integration.
- No visual diff, persistent live session, automatic repair agent, or release gate is claimed implemented yet.

## Windows desktop E2E (preview)
Set `runner: windows-2022` in the reusable workflow inputs to run the same specs on the GitHub-hosted Windows desktop; Xvfb is Linux-only. Separate OS-specific artifacts prevent collisions in a matrix. See self-test results for verification; Windows GUI availability, driver compatibility, and focus behavior are subject to actual CI results.
