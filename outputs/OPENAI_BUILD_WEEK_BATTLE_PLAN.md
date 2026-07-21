# OpenAI Build Week — Developer Tools battle plan

Prepared July 21, 2026 for a solo, India-based entrant.

## Executive decision

**Submit Verity in Developer Tools.** It is a proof-carrying release gate for AI-assisted code changes: teams declare a real release promise, attach executable/static/manual evidence, and receive a portable evidence report instead of an agent-written “done” message.

This is the right direction because it is deliberately narrow but complete: a developer-facing problem, a working CLI, an interactive product surface, an obvious failure mode, a CI path, and no dependency on an API key or a hosted backend. It directly targets the moment agentic coding creates more change than a reviewer can safely inspect.

## Verified contest facts

| Item | What it means for this submission |
| --- | --- |
| Sponsor / administrator | OpenAI is the sponsor; Devpost administers the event. The rules, rather than a plugin response, control if information conflicts. [Official rules](https://openai.devpost.com/rules) |
| Deadline | **Tuesday, July 21, 5:00 PM PDT**, which is **Wednesday, July 22, 5:30 AM IST**. At 1:26 PM IST on July 21, there were roughly 16 hours remaining. [FAQ](https://openai.devpost.com/details/faqs) |
| Eligible entrant | Entrants must be at the age of majority and reside in a supported country/territory. India is listed in OpenAI’s current supported-country page. Eligibility still depends on the entrant’s own circumstances. [Supported countries](https://developers.openai.com/api/docs/supported-countries) |
| Required tool evidence | Codex and GPT-5.6 must be meaningful, not decorative. The submission needs the primary Codex `/feedback` Session ID; judges expect concrete Codex/GPT-5.6 evidence in the README and narration. [FAQ: tools](https://openai.devpost.com/details/faqs) |
| What Developer Tools covers | Testing, DevOps, agentic workflows, and security are explicitly in scope. Verity occupies testing + agentic workflow + release safety. [Challenge page](https://openai.devpost.com/) |
| Submission materials | Working project; one category; written description; public YouTube video under 3 minutes with voiceover; code repository; primary `/feedback` ID. A private repository must be shared with `testing@devpost.com` and `build-week-event@openai.com`. [FAQ: submissions](https://openai.devpost.com/details/faqs) |
| Extra Developer Tool requirement | Include installation instructions, supported platforms, and a way to test without rebuilding. Verity supplies Node 20+, a one-command fixture demo, static report output, and a GitHub Actions artifact flow. [FAQ](https://openai.devpost.com/details/faqs) |
| IP / provenance | Work must be original or properly licensed. Existing projects are allowed only if the new work is clearly documented and attributable to the submission period. Verity was created as a new project in this workspace; publish it under MIT. [Official rules](https://openai.devpost.com/rules) |

## The actual scorecard

The official rules give four criteria equal weight. Ties are broken by the **first applicable criterion**, technical implementation, so that is the decisive place to be unusually concrete. [Official rules: judges and criteria](https://openai.devpost.com/rules)

| Criterion | What judges ask | Verity’s answer | Demo proof |
| --- | --- | --- | --- |
| Technical implementation | Is Codex used thoroughly and is this a real, non-trivial implementation? | Config validation, evaluator, static and executable checks, an integrity chain, redaction, static HTML report, CLI, test suite, fixture, and CI workflow. | Run tests; generate report; run integrity verification; show the red failure after removing a guard. |
| Design | Is this a coherent runnable product rather than a proof of concept? | One config contract, one command, clear semantic statuses (`PASS`, `REVIEW`, `FAIL`), and a visual report that answers “what promise is protected?” | Open `artifacts/verity-report.html`; expand captured output. |
| Potential impact | Does it solve a credible problem for a real audience? | AI-assisted engineering increases code-change volume. Release owners need a compact link from customer/security promise to testable evidence. | Lead with a reviewer facing a large agent-generated PR, not with a model demo. |
| Quality / novelty | Is it creative and distinguishable? | Verity does not invent another test runner, linter, or AI code reviewer. It creates a **claim → evidence → integrity-checked handoff** layer and keeps human judgment explicit. | Say “a test is not a claim; it becomes evidence only when linked to a promise.” |

## Organizers and judges — useful, bounded signals

The official Build Week page names five judges: Thibault Sottiaux (Head of Product & Platform), Kath Korevec and Tara Seshan (Members of Product Staff), Leah Belsky (VP of Education), and Peter Steinberger (Member of Technical Staff, Clawfather). [Official Build Week page](https://openai.com/build-week/)

We should not pretend to know individual, undisclosed preferences. The following are **strategy inferences from public roles and the shared rubric**, not claims about private judging criteria:

| Judge signal | Submission implication |
| --- | --- |
| Thibault — product and platform; publicly associated with Codex’s rise | Make the developer workflow feel inevitable, not like an academic evaluation framework. Show the exact before/after reviewer experience in 20 seconds. |
| Kath + Tara — product staff | The report must be legible at first glance. Explain a single persona: a release owner reviewing an AI-generated change. Avoid configuration-heavy narration. |
| Leah — education leadership | Keep the concept explainable to someone outside the specific codebase. “Claim, evidence, review” is a simple transferable mental model. This is not a reason to dilute the Developer Tools positioning. |
| Peter — technical staff / agentic engineering | Show that agents are useful but not automatically trusted. The explicit human `REVIEW` state is an important product stance; show reproducibility and the failure path, not only a polished pass. |

## Why this is stronger than common Developer Tools ideas

| Common idea | Why it is risky here | Verity’s differentiator |
| --- | --- | --- |
| Generic AI code-review chatbot | Feels familiar and can be dismissed as a thin model wrapper. | Verity produces durable, testable evidence artifacts rather than more text. |
| Multi-agent task manager | Scope explodes; difficult to prove it works in a three-minute video. | It tackles the downstream trust problem created by any agent. |
| New lint/security scanner | Competes with mature tools and is hard to validate in a night. | It composes existing checks into product promises and exposes remaining human judgment. |
| “Autonomous release agent” | Safety story is weak if the agent marks itself correct. | Verity explicitly refuses that authority. |

## What must be true at submission time

- [ ] The Git repository is public with `MIT` license **or** private and shared with both required emails.
- [ ] The placeholder `/feedback` Session ID in `README.md` and `SUBMISSION.md` is replaced using `/feedback` in this primary Codex thread.
- [ ] `npm test` passes on a clean local checkout.
- [ ] `npm run demo` passes and opens the generated report.
- [ ] The demo video is public, English (or has English translation), less than 3 minutes, and includes audible narration.
- [ ] Narration says exactly how Codex and GPT-5.6 were used—not merely “built with AI.”
- [ ] Devpost category is **Developer Tools**.
- [ ] Devpost description uses the copy in `SUBMISSION.md` and includes the repository and YouTube URLs.
- [ ] Do not claim a live deployment, API integration, security guarantee, or user result that is not actually demonstrated.

## The 16-hour execution order

1. **Now — 30 minutes:** run `npm test` and `npm run demo`; read the report and practice one clean failure recovery.
2. **Next — 45 minutes:** create a public GitHub repository, push the code, replace the repository URL in `SUBMISSION.md`, and ensure the MIT license is visible.
3. **Next — 20 minutes:** run `/feedback` in this primary Codex thread; paste the resulting ID into `README.md` and `SUBMISSION.md`.
4. **Next — 75 minutes:** record the 3-minute script in `DEMO_SCRIPT.md`. Record the terminal and static report; use a prepared branch for the failure scene so the final code remains clean.
5. **Next — 30 minutes:** upload to YouTube as Public; verify the audio, title, description, and link from an incognito/private window if possible.
6. **Next — 30 minutes:** enter the Devpost form. Submit the video link, code URL, chosen category, description, and `/feedback` ID. Reopen the draft and verify every field.
7. **Before 5:30 AM IST:** make the final submission. The official rule says post-deadline changes are not allowed, so submit a working version early and do not wait for a cosmetic improvement.

## Demo narrative to repeat

> “AI agents can generate a large convincing pull request, but a green test suite does not say which customer or security promise it proves. Verity turns each important promise into an explicit claim, attaches reproducible evidence, and produces an integrity-checked release handoff. The agent can help build the code; it cannot silently certify its own release.”

This sentence lands the project’s problem, impact, distinction, and safety posture in about 30 seconds.
