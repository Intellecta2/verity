#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { evaluateProject, VerityConfigError, verifyEvidenceChain } from './core.mjs';
import { writeReport } from './report.mjs';

const HELP = `
Verity — proof-carrying release gates for AI-assisted changes

Usage:
  verity check  [--config verity.config.json] [--allow-review] [--json report.json]
  verity report [--config verity.config.json] [--out artifacts/verity-report.html] [--allow-review]
  verity verify --input artifacts/verity-report.json

Evidence types: file_contains, file_not_contains, command, manual

Commands configured in a Verity file are executed by your local shell. Review a
project's configuration before running it, just as you would review package scripts.
`;

async function main() {
  const [command = 'help', ...args] = process.argv.slice(2);
  if (['help', '--help', '-h'].includes(command)) return console.log(HELP.trim());
  const flags = parseFlags(args);

  if (command === 'verify') {
    if (!flags.input) throw new VerityConfigError('verify requires --input <report.json>.');
    const inputPath = path.resolve(process.cwd(), flags.input);
    const report = JSON.parse(await fs.readFile(inputPath, 'utf8'));
    const result = verifyEvidenceChain(report);
    console.log(result.valid ? `✓ ${result.message}` : `✗ ${result.message}`);
    process.exitCode = result.valid ? 0 : 1;
    return;
  }

  if (!['check', 'report'].includes(command)) {
    throw new VerityConfigError(`Unknown command: ${command}`);
  }

  const report = await evaluateProject({
    workspace: process.cwd(),
    configFile: flags.config ?? 'verity.config.json'
  });
  printSummary(report);

  if (flags.json) {
    const jsonPath = path.resolve(process.cwd(), flags.json);
    await fs.mkdir(path.dirname(jsonPath), { recursive: true });
    await fs.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`  Report JSON: ${relative(jsonPath)}`);
  }

  if (command === 'report') {
    const htmlPath = path.resolve(process.cwd(), flags.out ?? 'artifacts/verity-report.html');
    const jsonPath = htmlPath.replace(/\.html?$/i, '.json');
    await writeReport({ report, htmlPath, jsonPath });
    console.log(`  Interactive report: ${relative(htmlPath)}`);
    console.log(`  Evidence JSON: ${relative(jsonPath)}`);
  }

  const blocked = report.status === 'fail' || (report.status === 'review' && !flags.allowReview);
  if (blocked) {
    console.log(report.status === 'review'
      ? '✗ Release is held for explicit human review. Re-run with --allow-review only after review is recorded.'
      : '✗ Release is blocked by failing evidence.');
    process.exitCode = 1;
  } else {
    console.log(report.status === 'review'
      ? '✓ Automated proof passed; explicit human review was acknowledged.'
      : '✓ All release claims have passing evidence.');
  }
}

function parseFlags(args) {
  const flags = {};
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (token === '--allow-review') flags.allowReview = true;
    else if (['--config', '--out', '--json', '--input'].includes(token)) {
      const value = args[index + 1];
      if (!value || value.startsWith('--')) throw new VerityConfigError(`${token} requires a value.`);
      flags[token.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value;
      index += 1;
    } else {
      throw new VerityConfigError(`Unknown option: ${token}`);
    }
  }
  return flags;
}

function printSummary(report) {
  const icon = report.status === 'pass' ? '✓' : report.status === 'review' ? '!' : '✗';
  console.log(`${icon} ${report.project.name}: ${report.status.toUpperCase()}`);
  for (const claim of report.claims) {
    const claimIcon = claim.status === 'pass' ? '✓' : claim.status === 'review' ? '!' : '✗';
    console.log(`  ${claimIcon} [${claim.risk}] ${claim.title}`);
    for (const evidence of claim.evidence) {
      const evidenceIcon = evidence.status === 'pass' ? '✓' : evidence.status === 'review' ? '!' : '✗';
      console.log(`    ${evidenceIcon} ${evidence.description}`);
    }
  }
}

function relative(absolutePath) {
  return path.relative(process.cwd(), absolutePath) || '.';
}

main().catch((error) => {
  const message = error instanceof VerityConfigError ? error.message : error.stack ?? error.message;
  console.error(`Verity error: ${message}`);
  process.exitCode = 1;
});
