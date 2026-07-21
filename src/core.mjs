import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const execFileAsync = promisify(execFile);
const OUTPUT_LIMIT = 12_000;

export class VerityConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'VerityConfigError';
  }
}

export async function loadConfig(workspace, configFile = 'verity.config.json') {
  const absolutePath = resolveWithinWorkspace(workspace, configFile);
  let source;
  try {
    source = await fs.readFile(absolutePath, 'utf8');
  } catch (error) {
    throw new VerityConfigError(`Could not read configuration at ${configFile}: ${error.message}`);
  }

  let config;
  try {
    config = JSON.parse(source);
  } catch (error) {
    throw new VerityConfigError(`Configuration is not valid JSON: ${error.message}`);
  }
  validateConfig(config);
  return { config, configFile: absolutePath };
}

export async function evaluateProject({ workspace, configFile, now = new Date() }) {
  const root = path.resolve(workspace);
  const { config } = await loadConfig(root, configFile);
  const claims = [];
  let previousHash = 'GENESIS';

  for (const claim of config.claims) {
    const evidence = [];
    for (const item of claim.evidence) {
      const result = await evaluateEvidence({ item, root });
      const chainPayload = stableStringify({
        claimId: claim.id,
        evidenceId: item.id,
        status: result.status,
        detail: result.detail,
        output: result.output
      });
      const hash = sha256(`${previousHash}:${chainPayload}`);
      evidence.push({ ...result, hash, previousHash });
      previousHash = hash;
    }
    claims.push({
      id: claim.id,
      title: claim.title,
      risk: claim.risk,
      whyItMatters: claim.whyItMatters,
      status: summarize(evidence.map((item) => item.status)),
      evidence
    });
  }

  const status = summarize(claims.map((claim) => claim.status));
  return {
    schemaVersion: 1,
    generatedAt: now.toISOString(),
    workspace: root,
    project: config.project,
    status,
    summary: countStatuses(claims),
    chainHead: previousHash,
    claims
  };
}

export function verifyEvidenceChain(report) {
  if (!report || report.schemaVersion !== 1 || !Array.isArray(report.claims)) {
    return { valid: false, message: 'This is not a Verity v1 report.' };
  }
  let previousHash = 'GENESIS';
  for (const claim of report.claims) {
    for (const evidence of claim.evidence ?? []) {
      const chainPayload = stableStringify({
        claimId: claim.id,
        evidenceId: evidence.id,
        status: evidence.status,
        detail: evidence.detail,
        output: evidence.output
      });
      const expectedHash = sha256(`${previousHash}:${chainPayload}`);
      if (evidence.previousHash !== previousHash || evidence.hash !== expectedHash) {
        return {
          valid: false,
          message: `Integrity check failed at ${claim.id}/${evidence.id}. Evidence was changed, removed, or reordered.`
        };
      }
      previousHash = evidence.hash;
    }
  }
  if (report.chainHead !== previousHash) {
    return { valid: false, message: 'Integrity check failed: report chain head does not match its evidence.' };
  }
  return { valid: true, message: `Evidence chain verified (${previousHash.slice(0, 12)}…).` };
}

export function summarize(statuses) {
  if (statuses.includes('fail')) return 'fail';
  if (statuses.includes('review')) return 'review';
  return 'pass';
}

function countStatuses(claims) {
  return claims.reduce(
    (counts, claim) => {
      counts[claim.status] += 1;
      return counts;
    },
    { pass: 0, fail: 0, review: 0 }
  );
}

async function evaluateEvidence({ item, root }) {
  const base = {
    id: item.id,
    type: item.type,
    description: item.description
  };
  try {
    if (item.type === 'manual') {
      return {
        ...base,
        status: 'review',
        detail: 'Human confirmation required. Verity records this explicitly instead of pretending an automated check proves it.',
        output: ''
      };
    }

    if (item.type === 'command') {
      const execution = await runCommand(item.command, root);
      const output = redactAndTrim(`${execution.stdout}${execution.stderr}`);
      const expected = item.expectOutput ? new RegExp(item.expectOutput, 'i').test(output) : true;
      const forbidden = item.forbidOutput ? new RegExp(item.forbidOutput, 'i').test(output) : false;
      const passed = execution.exitCode === 0 && expected && !forbidden;
      const reasons = [
        execution.exitCode === 0 ? null : `command exited ${execution.exitCode}`,
        expected ? null : `output did not match /${item.expectOutput}/i`,
        forbidden ? `output matched forbidden /${item.forbidOutput}/i` : null
      ].filter(Boolean);
      return {
        ...base,
        status: passed ? 'pass' : 'fail',
        detail: passed ? `Command completed successfully: ${item.command}` : reasons.join('; '),
        command: item.command,
        output
      };
    }

    const absoluteFile = resolveWithinWorkspace(root, item.file);
    const source = await fs.readFile(absoluteFile, 'utf8');
    const matcher = new RegExp(item.pattern, item.flags ?? 'm');
    const matched = matcher.test(source);
    const shouldMatch = item.type === 'file_contains';
    const passed = shouldMatch ? matched : !matched;
    return {
      ...base,
      status: passed ? 'pass' : 'fail',
      file: normalizePath(root, absoluteFile),
      detail: passed
        ? shouldMatch
          ? `Found the expected implementation pattern in ${normalizePath(root, absoluteFile)}.`
          : `Did not find the forbidden implementation pattern in ${normalizePath(root, absoluteFile)}.`
        : shouldMatch
          ? `Expected implementation pattern /${item.pattern}/ was not found.`
          : `Forbidden implementation pattern /${item.pattern}/ was found.`,
      output: passed ? '' : lineExcerpt(source, item.pattern)
    };
  } catch (error) {
    return {
      ...base,
      status: 'fail',
      detail: error.message,
      output: ''
    };
  }
}

async function runCommand(command, cwd) {
  try {
    const { stdout, stderr } = await execFileAsync('/bin/sh', ['-lc', command], {
      cwd,
      timeout: 60_000,
      maxBuffer: OUTPUT_LIMIT
    });
    return { exitCode: 0, stdout, stderr };
  } catch (error) {
    return {
      exitCode: typeof error.code === 'number' ? error.code : 1,
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? error.message
    };
  }
}

function validateConfig(config) {
  if (!config || typeof config !== 'object') throw new VerityConfigError('Configuration must be an object.');
  if (!config.project?.name) throw new VerityConfigError('Configuration requires project.name.');
  if (!Array.isArray(config.claims) || config.claims.length === 0) {
    throw new VerityConfigError('Configuration requires at least one claim.');
  }
  const ids = new Set();
  for (const claim of config.claims) {
    if (!claim.id || !claim.title || !claim.whyItMatters || !Array.isArray(claim.evidence) || claim.evidence.length === 0) {
      throw new VerityConfigError('Each claim requires id, title, whyItMatters, and at least one evidence item.');
    }
    if (ids.has(claim.id)) throw new VerityConfigError(`Duplicate claim id: ${claim.id}`);
    ids.add(claim.id);
    for (const item of claim.evidence) {
      if (!item.id || !item.type || !item.description) {
        throw new VerityConfigError(`Claim ${claim.id} has an incomplete evidence item.`);
      }
      if (!['file_contains', 'file_not_contains', 'command', 'manual'].includes(item.type)) {
        throw new VerityConfigError(`Claim ${claim.id} uses unsupported evidence type: ${item.type}`);
      }
      if (item.type === 'command' && !item.command) {
        throw new VerityConfigError(`Command evidence ${item.id} needs command.`);
      }
      if (item.type.startsWith('file_') && (!item.file || !item.pattern)) {
        throw new VerityConfigError(`File evidence ${item.id} needs file and pattern.`);
      }
    }
  }
}

function resolveWithinWorkspace(root, relativePath) {
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, relativePath);
  if (resolved !== resolvedRoot && !resolved.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new VerityConfigError(`Path escapes the workspace: ${relativePath}`);
  }
  return resolved;
}

function normalizePath(root, target) {
  return path.relative(root, target) || '.';
}

function lineExcerpt(source, pattern) {
  const regex = new RegExp(pattern, 'i');
  const lines = source.split('\n');
  const lineNumber = lines.findIndex((line) => regex.test(line));
  if (lineNumber < 0) return '';
  return lines.slice(Math.max(0, lineNumber - 1), lineNumber + 2).join('\n');
}

function redactAndTrim(text) {
  return text
    .replace(/sk-[A-Za-z0-9_-]{8,}/g, 'sk-••••REDACTED')
    .replace(/(api[_-]?key|token|password)\s*[=:]\s*[^\s]+/gi, '$1=••••REDACTED')
    .slice(0, OUTPUT_LIMIT);
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}
