import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { resolveStack } from '../env.js';

describe('resolveStack', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'rulekit-test-'));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('returns explicit stack when provided', async () => {
    const result = await resolveStack('vue-bootstrap', tmpDir);
    expect(result).toBe('vue-bootstrap');
  });

  it('returns explicit stack even when .env and AGENTS.md exist', async () => {
    await fs.writeFile(path.join(tmpDir, '.env'), 'RULEKIT_STACK=nuxt\n');
    await fs.writeFile(
      path.join(tmpDir, 'AGENTS.md'),
      '---\nstack: react\n---\n# Rules\n'
    );
    const result = await resolveStack('vue-bootstrap', tmpDir);
    expect(result).toBe('vue-bootstrap');
  });

  it('reads stack from .env when no explicit stack', async () => {
    await fs.writeFile(path.join(tmpDir, '.env'), 'RULEKIT_STACK=vue-bootstrap\n');
    const result = await resolveStack(undefined, tmpDir);
    expect(result).toBe('vue-bootstrap');
  });

  it('handles quoted values in .env', async () => {
    await fs.writeFile(path.join(tmpDir, '.env'), 'RULEKIT_STACK="vue-bootstrap"\n');
    const result = await resolveStack(undefined, tmpDir);
    expect(result).toBe('vue-bootstrap');
  });

  it('handles single-quoted values in .env', async () => {
    await fs.writeFile(path.join(tmpDir, '.env'), "RULEKIT_STACK='nuxt'\n");
    const result = await resolveStack(undefined, tmpDir);
    expect(result).toBe('nuxt');
  });

  it('reads stack from .env with other variables present', async () => {
    await fs.writeFile(
      path.join(tmpDir, '.env'),
      'NODE_ENV=development\nRULEKIT_STACK=vue-bootstrap\nPORT=3000\n'
    );
    const result = await resolveStack(undefined, tmpDir);
    expect(result).toBe('vue-bootstrap');
  });

  it('.env takes priority over AGENTS.md frontmatter', async () => {
    await fs.writeFile(path.join(tmpDir, '.env'), 'RULEKIT_STACK=nuxt\n');
    await fs.writeFile(
      path.join(tmpDir, 'AGENTS.md'),
      '---\nstack: vue-bootstrap\n---\n# Rules\n'
    );
    const result = await resolveStack(undefined, tmpDir);
    expect(result).toBe('nuxt');
  });

  it('reads stack from AGENTS.md frontmatter when no .env', async () => {
    await fs.writeFile(
      path.join(tmpDir, 'AGENTS.md'),
      '---\nstack: vue-bootstrap\n---\n# Rules\n'
    );
    const result = await resolveStack(undefined, tmpDir);
    expect(result).toBe('vue-bootstrap');
  });

  it('ignores AGENTS.md with stack: common (falls through to default)', async () => {
    await fs.writeFile(
      path.join(tmpDir, 'AGENTS.md'),
      '---\nstack: common\n---\n# Rules\n'
    );
    const result = await resolveStack(undefined, tmpDir);
    expect(result).toBe('common');
  });

  it('ignores AGENTS.md without frontmatter', async () => {
    await fs.writeFile(path.join(tmpDir, 'AGENTS.md'), '# Just some rules\n');
    const result = await resolveStack(undefined, tmpDir);
    expect(result).toBe('common');
  });

  it('defaults to common when no .env and no AGENTS.md', async () => {
    const result = await resolveStack(undefined, tmpDir);
    expect(result).toBe('common');
  });

  it('ignores .env without RULEKIT_STACK variable', async () => {
    await fs.writeFile(path.join(tmpDir, '.env'), 'NODE_ENV=production\n');
    const result = await resolveStack(undefined, tmpDir);
    expect(result).toBe('common');
  });
});
