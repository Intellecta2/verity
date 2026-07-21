import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { evaluateProject, verifyEvidenceChain } from '../src/core.mjs';
import { renderHtml } from '../src/report.mjs';

async function fixture(config, files = {}) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'verity-test-'));
  await fs.writeFile(path.join(directory, 'verity.config.json'), JSON.stringify(config));
  await Promise.all(Object.entries(files).map(async ([file, contents]) => {
    const destination = path.join(directory, file);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, contents);
  }));
  return directory;
}

const project = { name: 'Test project', version: 'test' };

test('connects successful static and executable evidence to a claim', async () => {
  const directory = await fixture({
    project,
    claims: [{
      id: 'validated-input', title: 'Validates input', risk: 'high', whyItMatters: 'Bad input breaks users.',
      evidence: [
        { id: 'source', type: 'file_contains', file: 'src/app.js', pattern: 'validateInput', description: 'Source validates input.' },
        { id: 'test', type: 'command', command: "node -e \"console.log('proof complete')\"", expectOutput: 'proof complete', description: 'Behavioral proof runs.' }
      ]
    }]
  }, { 'src/app.js': 'export const validateInput = () => true;\n' });
  const report = await evaluateProject({ workspace: directory, configFile: 'verity.config.json', now: new Date('2026-07-21T00:00:00.000Z') });
  assert.equal(report.status, 'pass');
  assert.equal(report.summary.pass, 1);
  assert.equal(verifyEvidenceChain(report).valid, true);
});

test('makes missing proof a release failure and detects changed evidence', async () => {
  const directory = await fixture({
    project,
    claims: [{
      id: 'auth', title: 'Has auth', risk: 'critical', whyItMatters: 'Unauthenticated writes are dangerous.',
      evidence: [{ id: 'guard', type: 'file_contains', file: 'api.js', pattern: 'requireUser', description: 'Auth guard exists.' }]
    }]
  }, { 'api.js': 'export const handler = () => true;\n' });
  const report = await evaluateProject({ workspace: directory, configFile: 'verity.config.json' });
  assert.equal(report.status, 'fail');
  assert.equal(verifyEvidenceChain(report).valid, true);
  report.claims[0].evidence[0].detail = 'edited after generation';
  assert.equal(verifyEvidenceChain(report).valid, false);
});

test('keeps human review explicit and renders a standalone report', async () => {
  const directory = await fixture({
    project,
    claims: [{
      id: 'release-scope', title: 'Scope is reviewed', risk: 'medium', whyItMatters: 'Automation cannot infer intent.',
      evidence: [{ id: 'human', type: 'manual', description: 'A release owner confirms scope.' }]
    }]
  });
  const report = await evaluateProject({ workspace: directory, configFile: 'verity.config.json' });
  assert.equal(report.status, 'review');
  const html = renderHtml(report);
  assert.match(html, /Human review required/);
  assert.match(html, /release owner confirms scope/i);
});
