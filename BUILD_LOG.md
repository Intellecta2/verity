# Build log

This project was created in the primary Codex Build Week thread on July 21, 2026.

## Product decisions

1. **Start from a reviewer problem, not a model capability.** The event guidance emphasizes real problems, a non-trivial working implementation, and a coherent product—not a technical proof of concept. The chosen problem is the gap between an AI agent’s assertion that a change is complete and a reviewer’s ability to verify specific release promises.
2. **Keep the tool local-first and judgeable.** The first release uses Node 20 and no dependencies, external account, API key, or network connection. This makes the required test path both reliable and quick.
3. **Do not hide human judgment.** `manual` evidence intentionally returns `REVIEW`; an operator must explicitly acknowledge it with `--allow-review`. A tool that silently approves ambiguous release scope would contradict its own purpose.
4. **Make evidence tampering legible.** Evidence items are ordered and SHA-256 hash-chained. The CLI can verify a report after upload or handoff.

## Codex + GPT-5.6 contribution

Codex with GPT-5.6 was used throughout the core work: analyzing the rules and judging rubric, synthesizing the project concept, implementing the CLI and evaluation engine, designing a self-contained report, building test fixtures, and running/verifying the automated test and demo paths. This repository records the implementation artifacts; the primary thread’s `/feedback` ID must be added to the README and Devpost form before submission.
