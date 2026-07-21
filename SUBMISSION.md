# Devpost submission copy — Verity

## Project name

Verity — Proof-carrying release gates for AI-assisted code changes

## Tagline

Make every AI-assisted release claim prove itself.

## Track

Developer Tools

## Description

AI coding agents make it easy to generate a large, convincing diff—and just as easy to ship a vague “done” message. A green test suite is useful, but it does not tell a reviewer which release promise was actually tested.

Verity is a local-first release gate that turns important promises into explicit, reviewable claims. For every claim, it runs declared evidence (source checks, executable tests, or explicit human review), captures the outcome, and produces a portable static HTML report. Every evidence result is SHA-256 hash-chained, so changing, removing, or reordering a result is detectable with `verity verify`.

The distinction that matters is simple: **a test is not a claim**. It becomes evidence only when it is linked to the user, security, or product promise it supports. If a decision genuinely requires a human, Verity displays `REVIEW` rather than quietly turning it green.

The included Cedar Storefront sandbox demonstrates three claims: authenticated order creation, safe public errors, and explicit human sign-off on release scope. It runs with Node 20+, has no API key or account requirement, and produces an interactive report in one command.

## How it works

1. Write `verity.config.json` with claims, their risk, why each matters, and evidence items.
2. Run `verity report`. Verity evaluates static and executable evidence, records explicit human review, and writes an offline HTML report plus portable JSON.
3. Run `verity verify` after any handoff to validate the report’s integrity chain.
4. Use the generated artifact in CI or attach it to a release/pull-request review.

## Testing instructions for judges

```bash
npm test
npm run demo
open artifacts/verity-report.html
```

Supported platform: Node 20+ on macOS or Linux; Windows through WSL. No installation, account, or network access is required.

## Codex and GPT-5.6 use

Built in Codex during OpenAI Build Week with GPT-5.6. Codex accelerated the full product loop: rubric-to-problem framing, the evaluator and evidence-chain implementation, fixture and test design, report UI, and hardening the one-command judge experience. A key human decision was to preserve manual review as an explicit state rather than give an agent the authority to certify release scope.

Codex /feedback Session ID: **<PASTE-YOUR-PRIMARY-THREAD-ID>**

## Links to add before submitting

- Repository: `<REPOSITORY_URL>`
- Public demo video: `<YOUTUBE_URL>`
- Live demo (optional): `<DEPLOYED_URL>`
