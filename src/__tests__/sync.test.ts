import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import matter from 'gray-matter';
import { syncRules, syncPrompts, syncSkills } from '../sync.js';

describe('syncRules', () => {
  let tmpDir: string;
  let rulekitRoot: string;
  let targetDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'rulekit-test-'));
    rulekitRoot = path.join(tmpDir, 'rulekit');
    targetDir = path.join(tmpDir, 'target');
    await fs.ensureDir(targetDir);
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('syncs common rules to root AGENTS.md', async () => {
    await fs.ensureDir(path.join(rulekitRoot, 'rules'));
    await fs.writeFile(
      path.join(rulekitRoot, 'rules', 'common.md'),
      '---\nstack: common\n---\n# Common Rules\n\nBe nice.\n'
    );

    await syncRules(rulekitRoot, targetDir, 'common');

    const result = await fs.readFile(path.join(targetDir, 'AGENTS.md'), 'utf-8');
    expect(result).toContain('# Common Rules');
    expect(result).toContain('Be nice.');
  });

  it('merges common and stack rules with separator', async () => {
    await fs.ensureDir(path.join(rulekitRoot, 'rules'));
    await fs.writeFile(
      path.join(rulekitRoot, 'rules', 'common.md'),
      '---\nstack: common\n---\n# Common\n\nShared rules.\n'
    );
    await fs.writeFile(
      path.join(rulekitRoot, 'rules', 'vue-bootstrap.md'),
      '---\nstack: vue-bootstrap\n---\n# Vue Rules\n\nVue stuff.\n'
    );

    await syncRules(rulekitRoot, targetDir, 'vue-bootstrap');

    const result = await fs.readFile(path.join(targetDir, 'AGENTS.md'), 'utf-8');
    expect(result).toContain('# Common');
    expect(result).toContain('---');
    expect(result).toContain('# Vue Rules');
  });

  it('writes stack frontmatter to synced AGENTS.md', async () => {
    await fs.ensureDir(path.join(rulekitRoot, 'rules'));
    await fs.writeFile(
      path.join(rulekitRoot, 'rules', 'common.md'),
      '---\nstack: common\n---\n# Rules\n'
    );

    await syncRules(rulekitRoot, targetDir, 'vue-bootstrap');

    const result = await fs.readFile(path.join(targetDir, 'AGENTS.md'), 'utf-8');
    const parsed = matter(result);
    expect(parsed.data.stack).toBe('vue-bootstrap');
  });

  it('strips frontmatter from source rule files', async () => {
    await fs.ensureDir(path.join(rulekitRoot, 'rules'));
    await fs.writeFile(
      path.join(rulekitRoot, 'rules', 'common.md'),
      '---\nstack: common\ncustom: value\n---\n# Rules\n\nContent here.\n'
    );

    await syncRules(rulekitRoot, targetDir, 'common');

    const result = await fs.readFile(path.join(targetDir, 'AGENTS.md'), 'utf-8');
    const parsed = matter(result);
    // Should have stack frontmatter from sync, but not the source's custom field
    expect(parsed.data.stack).toBe('common');
    expect(parsed.data).not.toHaveProperty('custom');
    expect(parsed.content).toContain('# Rules');
  });

  it('syncs subdirectory rules to matching paths', async () => {
    await fs.ensureDir(path.join(rulekitRoot, 'rules', 'docs'));
    await fs.writeFile(
      path.join(rulekitRoot, 'rules', 'docs', 'common.md'),
      '# Doc Rules\n\nWrite good docs.\n'
    );

    await syncRules(rulekitRoot, targetDir, 'common');

    const result = await fs.readFile(path.join(targetDir, 'docs', 'AGENTS.md'), 'utf-8');
    expect(result).toContain('# Doc Rules');
  });

  it('skips paths with no matching stack content', async () => {
    await fs.ensureDir(path.join(rulekitRoot, 'rules'));
    await fs.writeFile(
      path.join(rulekitRoot, 'rules', 'vue-bootstrap.md'),
      '# Vue Only\n'
    );

    await syncRules(rulekitRoot, targetDir, 'nuxt');

    // Should not create AGENTS.md since there's no common or nuxt rule
    expect(await fs.pathExists(path.join(targetDir, 'AGENTS.md'))).toBe(false);
  });

  it('handles missing rules directory gracefully', async () => {
    // rulekitRoot exists but has no rules/ dir
    await fs.ensureDir(rulekitRoot);
    await syncRules(rulekitRoot, targetDir, 'common');

    expect(await fs.pathExists(path.join(targetDir, 'AGENTS.md'))).toBe(false);
  });
});

describe('syncPrompts', () => {
  let tmpDir: string;
  let rulekitRoot: string;
  let targetDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'rulekit-test-'));
    rulekitRoot = path.join(tmpDir, 'rulekit');
    targetDir = path.join(tmpDir, 'target');
    await fs.ensureDir(targetDir);
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('generates Cursor, VSCode, and Claude Code files from a prompt', async () => {
    await fs.ensureDir(path.join(rulekitRoot, 'prompts', 'common'));
    await fs.writeFile(
      path.join(rulekitRoot, 'prompts', 'common', 'test-prompt.md'),
      '# Test Prompt\n\nDo the thing.\n'
    );

    await syncPrompts(rulekitRoot, targetDir, 'common');

    // Cursor
    expect(await fs.pathExists(
      path.join(targetDir, '.cursor', 'commands', 'rulekit-test-prompt.md')
    )).toBe(true);

    // VSCode
    expect(await fs.pathExists(
      path.join(targetDir, '.github', 'prompts', 'rulekit-test-prompt.prompt.md')
    )).toBe(true);

    // Claude Code
    expect(await fs.pathExists(
      path.join(targetDir, '.claude', 'commands', 'rulekit-test-prompt.md')
    )).toBe(true);
  });

  it('applies rulekit- prefix to prompt names', async () => {
    await fs.ensureDir(path.join(rulekitRoot, 'prompts', 'common'));
    await fs.writeFile(
      path.join(rulekitRoot, 'prompts', 'common', 'deploy.md'),
      '# Deploy\n\nDeploy the app.\n'
    );

    await syncPrompts(rulekitRoot, targetDir, 'common');

    expect(await fs.pathExists(
      path.join(targetDir, '.cursor', 'commands', 'rulekit-deploy.md')
    )).toBe(true);
  });

  it('includes stack-specific prompts when stack is not common', async () => {
    await fs.ensureDir(path.join(rulekitRoot, 'prompts', 'common'));
    await fs.ensureDir(path.join(rulekitRoot, 'prompts', 'vue-bootstrap'));
    await fs.writeFile(
      path.join(rulekitRoot, 'prompts', 'common', 'shared.md'),
      '# Shared\n'
    );
    await fs.writeFile(
      path.join(rulekitRoot, 'prompts', 'vue-bootstrap', 'vue-specific.md'),
      '# Vue Specific\n'
    );

    await syncPrompts(rulekitRoot, targetDir, 'vue-bootstrap');

    // Both should be synced
    expect(await fs.pathExists(
      path.join(targetDir, '.cursor', 'commands', 'rulekit-shared.md')
    )).toBe(true);
    expect(await fs.pathExists(
      path.join(targetDir, '.cursor', 'commands', 'rulekit-vue-specific.md')
    )).toBe(true);
  });

  it('VSCode output has proper frontmatter', async () => {
    await fs.ensureDir(path.join(rulekitRoot, 'prompts', 'common'));
    await fs.writeFile(
      path.join(rulekitRoot, 'prompts', 'common', 'review.md'),
      '# Code Review\n\nReview the code.\n'
    );

    await syncPrompts(rulekitRoot, targetDir, 'common');

    const vscodeContent = await fs.readFile(
      path.join(targetDir, '.github', 'prompts', 'rulekit-review.prompt.md'),
      'utf-8'
    );
    const parsed = matter(vscodeContent);
    expect(parsed.data.name).toBe('rulekit-review');
    expect(parsed.data.description).toBe('Code Review');
    expect(parsed.data.agent).toBe('agent');
  });

  it('Claude Code output has description frontmatter', async () => {
    await fs.ensureDir(path.join(rulekitRoot, 'prompts', 'common'));
    await fs.writeFile(
      path.join(rulekitRoot, 'prompts', 'common', 'review.md'),
      '# Code Review\n\nReview the code.\n'
    );

    await syncPrompts(rulekitRoot, targetDir, 'common');

    const claudeContent = await fs.readFile(
      path.join(targetDir, '.claude', 'commands', 'rulekit-review.md'),
      'utf-8'
    );
    const parsed = matter(claudeContent);
    expect(parsed.data.description).toBe('Code Review');
  });

  it('handles missing prompts directory gracefully', async () => {
    await fs.ensureDir(rulekitRoot);
    await syncPrompts(rulekitRoot, targetDir, 'common');

    // Should not create any files
    expect(await fs.pathExists(path.join(targetDir, '.cursor'))).toBe(false);
  });
});

describe('syncSkills', () => {
  let tmpDir: string;
  let rulekitRoot: string;
  let targetDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'rulekit-test-'));
    rulekitRoot = path.join(tmpDir, 'rulekit');
    targetDir = path.join(tmpDir, 'target');
    await fs.ensureDir(targetDir);
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('copies skill directory to .claude/skills/', async () => {
    const skillDir = path.join(rulekitRoot, 'skills', 'my-skill');
    await fs.ensureDir(path.join(skillDir, 'references'));
    await fs.writeFile(path.join(skillDir, 'SKILL.md'), '# My Skill\n');
    await fs.writeFile(path.join(skillDir, 'references', 'ref.md'), '# Reference\n');

    await syncSkills(rulekitRoot, targetDir, 'common');

    expect(await fs.pathExists(
      path.join(targetDir, '.claude', 'skills', 'my-skill', 'SKILL.md')
    )).toBe(true);
    expect(await fs.pathExists(
      path.join(targetDir, '.claude', 'skills', 'my-skill', 'references', 'ref.md')
    )).toBe(true);
  });

  it('skips directories without SKILL.md', async () => {
    const noSkillDir = path.join(rulekitRoot, 'skills', 'not-a-skill');
    await fs.ensureDir(noSkillDir);
    await fs.writeFile(path.join(noSkillDir, 'README.md'), '# Not a skill\n');

    await syncSkills(rulekitRoot, targetDir, 'common');

    expect(await fs.pathExists(
      path.join(targetDir, '.claude', 'skills', 'not-a-skill')
    )).toBe(false);
  });

  it('syncs multiple skills', async () => {
    for (const name of ['skill-a', 'skill-b']) {
      const dir = path.join(rulekitRoot, 'skills', name);
      await fs.ensureDir(dir);
      await fs.writeFile(path.join(dir, 'SKILL.md'), `# ${name}\n`);
    }

    await syncSkills(rulekitRoot, targetDir, 'common');

    expect(await fs.pathExists(
      path.join(targetDir, '.claude', 'skills', 'skill-a', 'SKILL.md')
    )).toBe(true);
    expect(await fs.pathExists(
      path.join(targetDir, '.claude', 'skills', 'skill-b', 'SKILL.md')
    )).toBe(true);
  });

  it('handles missing skills directory gracefully', async () => {
    await fs.ensureDir(rulekitRoot);
    await syncSkills(rulekitRoot, targetDir, 'common');

    expect(await fs.pathExists(path.join(targetDir, '.claude'))).toBe(false);
  });

  it('overwrites existing skill files on re-sync', async () => {
    const skillDir = path.join(rulekitRoot, 'skills', 'my-skill');
    await fs.ensureDir(skillDir);
    await fs.writeFile(path.join(skillDir, 'SKILL.md'), '# Updated Skill\n');

    // Pre-populate target with old content
    const targetSkill = path.join(targetDir, '.claude', 'skills', 'my-skill');
    await fs.ensureDir(targetSkill);
    await fs.writeFile(path.join(targetSkill, 'SKILL.md'), '# Old Skill\n');

    await syncSkills(rulekitRoot, targetDir, 'common');

    const result = await fs.readFile(
      path.join(targetDir, '.claude', 'skills', 'my-skill', 'SKILL.md'),
      'utf-8'
    );
    expect(result).toBe('# Updated Skill\n');
  });
});
