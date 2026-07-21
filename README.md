# Verity

**Proof-carrying release gates for AI-assisted code changes.**

AI coding agents can produce a convincing diff and a green test suite without making it clear which user-facing promise is actually proven. Verity turns a release's important promises into explicit **claims**, connects each claim to reproducible evidence, and creates a portable report a reviewer can inspect without trusting the agent's summary.

> A test is not a claim. It becomes evidence only when a team declares what it is supposed to prove.

![Developer Tools](https://img.shields.io/badge/OpenAI%20Build%20Week-Developer%20Tools-0b7285)
![Node 20+](https://img.shields.io/badge/Node-20%2B-3c873a)
![License MIT](https://img.shields.io/badge/license-MIT-5b5b5b)

## Why this exists

As AI agents take on multi-file implementation work, code review has a new failure mode: a reviewer gets a large, plausible change plus an agent-written “done” message, but cannot quickly see whether the high-risk release promises were really tested. Existing test runners report test status; existing policy tools report rule violations. Neither makes the missing link first-class:

```text
release promise → exact evidence → captured output → integrity-checked report
```

Verity makes that link reviewable. It deliberately does **not** let automation silently replace a human decision. A claim that needs human judgment is shown as `REVIEW`, not marked green.

## The 45-second demo

Requires Node.js 20+ on macOS or Linux (Windows is supported through WSL). No package install, account, API key, or network access is required.

```bash
git clone https://github.com/Intellecta2/verity.git
cd verity
npm test
npm run demo
open artifacts/verity-report.html # macOS
```

On Linux, open `artifacts/verity-report.html` in your browser. The demo uses the included Cedar Storefront fixture; the report is branded as **Verity Release Evidence** so it is clear that the storefront is only the scenario being checked.

- `artifacts/verity-report.html` — an interactive, self-contained release-evidence report
- `artifacts/verity-report.json` — the portable report and evidence integrity chain

## Host the demo on GitHub Pages

This repository includes a GitHub Pages workflow. After pushing it to a public repository, enable **Settings → Pages → Source → GitHub Actions** once. Every push to `main` then tests Verity, builds the demo, and deploys the resulting report at:

```text
https://intellecta2.github.io/verity/
```

The hosted page is a **judgeable demo artifact**, not a hosted CLI service. The actual developer tool remains installable and testable from the repository.

To make a **failure** legible in a live demo, temporarily delete the authentication guard in `fixtures/storefront/api.mjs` and run `npm run demo` again. The precise claim becomes red and Verity exits non-zero. Restore it afterwards.

## What it does

1. Reads a small, reviewable `verity.config.json` contract.
2. Runs evidence checks: source-pattern presence/absence, test or shell commands, and explicit manual checks.
3. Captures result details and redacts common secret-shaped strings from command output.
4. Hash-chains every evidence result in order. `verity verify` detects a changed, removed, or reordered item.
5. Creates an accessible static HTML report that works offline and is easy to attach to a pull request or CI artifact.

### Claim configuration

```json
{
  "id": "order-authentication",
  "title": "Order creation requires an authenticated customer",
  "risk": "critical",
  "whyItMatters": "An unauthenticated order endpoint enables fraud and privacy failures.",
  "evidence": [
    {
      "id": "auth-guard-in-source",
      "type": "file_contains",
      "file": "src/orders.mjs",
      "pattern": "if \\(!request\\.user\\?\\.id\\)",
      "description": "The request boundary rejects anonymous callers."
    },
    {
      "id": "auth-behavior-test",
      "type": "command",
      "command": "node --test test/orders.test.mjs",
      "description": "Executable coverage exercises the anonymous path."
    }
  ]
}
```

Supported evidence types:

| Type | What it proves | Result |
| --- | --- | --- |
| `file_contains` | A required source pattern exists | pass / fail |
| `file_not_contains` | A prohibited source pattern is absent | pass / fail |
| `command` | A project-defined command succeeds and optional output rules hold | pass / fail |
| `manual` | A judgment only a release owner can make | review |

## CLI

```bash
# Gate a release. A manual item holds the gate unless it has been explicitly acknowledged.
node src/cli.mjs check --config verity.config.json
node src/cli.mjs check --config verity.config.json --allow-review

# Generate standalone HTML + JSON evidence artifacts.
node src/cli.mjs report --config verity.config.json --out artifacts/verity-report.html --allow-review

# Verify the JSON evidence chain after upload, download, or handoff.
node src/cli.mjs verify --input artifacts/verity-report.json
```

The supplied [GitHub Actions workflow](.github/workflows/verity.yml) demonstrates the CI use case: it generates the report and preserves it as an artifact on each pull request.

## Safety model

Verity intentionally executes only the commands declared in the repository's config. Treat a project’s `verity.config.json` exactly as you would `package.json` scripts or a CI workflow: review it before running it. Commands run locally with a 60-second timeout. Static paths are blocked from escaping the workspace. This prototype redacts common API-key, token, and password-shaped output before writing the report; it is not a replacement for a full secret scanner.

## Architecture

```text
verity.config.json
      │
      ▼
claim evaluator ──► static checks / executable checks / manual review
      │                              │
      ├──► ordered SHA-256 evidence chain
      ▼
standalone HTML report + portable JSON ──► reviewer / CI artifact / release handoff
```

The small core is intentional: teams can inspect the exact logic that produces a green release decision. See [src/core.mjs](src/core.mjs) and [src/report.mjs](src/report.mjs).

## Built with Codex and GPT-5.6

Verity was designed and implemented during OpenAI Build Week in Codex, using GPT-5.6. Codex was used to:

- turn the hackathon rubric into the product thesis: evidence must be connected to a real release promise;
- design and implement the config schema, evaluator, integrity chain, CLI, and no-dependency report UI;
- create a runnable fixture and automated tests for both the tool and the sample API;
- iterate on the judge path: one command, no API key, a visible failure mode, and a portable report.

The central product decision remained human-made: Verity does not claim that static analysis or an AI agent can certify release scope. It preserves a first-class `REVIEW` state for that judgment.

**Hackathon submission requirement:** before submitting, add the `/feedback` session ID from the primary Codex build thread here and to the Devpost form:

```text
Codex /feedback Session ID: <PASTE-YOUR-SESSION-ID>
```

## Submission assets

- [Devpost submission copy](SUBMISSION.md)
- [Three-minute demo script](DEMO_SCRIPT.md)
- [Build log](BUILD_LOG.md)

## Development

```bash
npm test
npm run demo
```

There are no runtime dependencies. The automated suite covers success, failure, integrity tampering, explicit manual review, the sample API, and standalone-report rendering.

## License

[MIT](LICENSE)
# verity
