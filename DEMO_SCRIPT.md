# Three-minute demo script

## 0:00–0:20 — Problem

“AI coding agents can create large, plausible pull requests quickly. The hard part is no longer only generating code; it is knowing whether the important release promises are actually proven. A green test suite does not tell a reviewer what it proves.”

## 0:20–0:45 — Product

“This is Verity: a proof-carrying release gate for AI-assisted changes. I declare a release claim, why it matters, and evidence that can support it. Verity never treats an agent’s summary as proof.”

Show `verity.config.json`, highlighting `title`, `whyItMatters`, and the two pieces of evidence for `order-authentication`.

## 0:45–1:20 — Working demo

Run:

```bash
npm run demo
open artifacts/verity-report.html
```

“The first critical claim is that only authenticated customers can create an order. Verity connects the source guard and the executable behavior test to that promise. The report shows the captured test output and a per-evidence hash.”

Click “Show captured output.” Point out that the third claim remains amber: a human must verify that evidence covers the actual release scope.

## 1:20–1:55 — Failure + integrity

In a prepared demo branch or temporary edit, remove the `if (!request.user?.id)` guard from `fixtures/storefront/api.mjs`, then run:

```bash
node src/cli.mjs report --config verity.config.json --out artifacts/verity-report.html --allow-review
```

“Now the exact release promise is red. Verity names the failed evidence rather than producing a vague quality score.”

Restore the guard. Then run:

```bash
node src/cli.mjs verify --input artifacts/verity-report.json
```

“Evidence is hash-chained. If someone changes, removes, or reorders the JSON after it was generated, verification fails.”

## 1:55–2:25 — Codex and GPT-5.6

“I built Verity in Codex with GPT-5.6 during Build Week. I used Codex to turn the evaluation rubric into the product thesis, design the evaluator and report, implement and test the CLI, and keep the judge path to one command with no API key. The important product decision was human: Verity makes manual review explicit instead of making an agent the release authority.”

Show a brief Codex thread screenshot or session history, if available, and put the real `/feedback` ID in the Devpost submission.

## 2:25–3:00 — Impact and close

“Verity is designed for the moment where agentic development makes change volume exceed reviewer attention. Instead of asking a reviewer to trust a diff or an AI summary, it hands them a compact map from a real product promise to reproducible proof. It works locally today and ships a GitHub Actions workflow that uploads the evidence report for every pull request.”

End on the static report’s claim cards and the integrity-chain message.
