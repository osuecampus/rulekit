import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import matter from 'gray-matter';
import { pushRules, pushPrompts, pushSkills } from '../push.js';

describe('pushPrompts', () => {
  let tmpDir: string;
  let targetDir: string;
  let cloneDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'rulekit-push-test-'));
    targetDir = path.join(tmpDir, 'project');
    cloneDir = path.join(tmpDir, 'clone');
    await fs.ensureDir(targetDir);
    await fs.ensureDir(cloneDir);
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('updates existing prompt when content differs', async () => {
    // Local prompt in .claude/commands/
    const cmdDir = path.join(targetDir, '.claude', 'commands');
    await fs.ensureDir(cmdDir);
    await fs.writeFile(path.join(cmdDir, 'rulekit-deploy.md'), '# Deploy\n\nUpdated deploy instructions.\n');

    // Existing prompt in clone
    const promptDir = path.join(cloneDir, 'prompts', 'common');
    await fs.ensureDir(promptDir);
    await fs.writeFile(path.join(promptDir, 'deploy.md'), '# Deploy\n\nOld deploy instructions.\n');

    const changed = await pushPrompts(targetDir, cloneDir);

    expect(changed).toBe(true);
    const result = await fs.readFile(path.join(promptDir, 'deploy.md'), 'utf-8');
    expect(result).toContain('Updated deploy instructions.');
  });

  it('creates new prompt in prompts/common/ by default', async () => {
    const cmdDir = path.join(targetDir, '.claude', 'commands');
    await fs.ensureDir(cmdDir);
    await fs.writeFile(path.join(cmdDir, 'rulekit-new-prompt.md'), '# New Prompt\n\nDo something new.\n');

    // Clone has prompts dir but no matching prompt
    await fs.ensureDir(path.join(cloneDir, 'prompts', 'common'));

    const changed = await pushPrompts(targetDir, cloneDir);

    expect(changed).toBe(true);
    const newFile = path.join(cloneDir, 'prompts', 'common', 'new-prompt.md');
    expect(await fs.pathExists(newFile)).toBe(true);
    const content = await fs.readFile(newFile, 'utf-8');
    expect(content).toContain('Do something new.');
  });

  it('creates new prompt in prompts/<stack>/ when promptStack is specified', async () => {
    const cmdDir = path.join(targetDir, '.claude', 'commands');
    await fs.ensureDir(cmdDir);
    await fs.writeFile(path.join(cmdDir, 'rulekit-vue-deploy.md'), '# Vue Deploy\n\nDeploy the Vue app.\n');

    await fs.ensureDir(path.join(cloneDir, 'prompts', 'common'));

    const changed = await pushPrompts(targetDir, cloneDir, 'vue-bootstrap');

    expect(changed).toBe(true);
    const newFile = path.join(cloneDir, 'prompts', 'vue-bootstrap', 'vue-deploy.md');
    expect(await fs.pathExists(newFile)).toBe(true);
  });

  it('reads from .cursor/commands/ when .claude/commands/ does not exist', async () => {
    const cursorDir = path.join(targetDir, '.cursor', 'commands');
    await fs.ensureDir(cursorDir);
    await fs.writeFile(path.join(cursorDir, 'rulekit-cursor-prompt.md'), '# Cursor Prompt\n\nFrom cursor.\n');

    await fs.ensureDir(path.join(cloneDir, 'prompts', 'common'));

    const changed = await pushPrompts(targetDir, cloneDir);

    expect(changed).toBe(true);
    expect(await fs.pathExists(path.join(cloneDir, 'prompts', 'common', 'cursor-prompt.md'))).toBe(true);
  });

  it('reads from .github/prompts/ (VSCode format)', async () => {
    const vscodeDir = path.join(targetDir, '.github', 'prompts');
    await fs.ensureDir(vscodeDir);
    await fs.writeFile(
      path.join(vscodeDir, 'rulekit-vscode-prompt.prompt.md'),
      '---\nname: rulekit-vscode-prompt\ndescription: VSCode Prompt\nagent: agent\n---\n# VSCode Prompt\n\nFrom vscode.\n'
    );

    await fs.ensureDir(path.join(cloneDir, 'prompts', 'common'));

    const changed = await pushPrompts(targetDir, cloneDir);

    expect(changed).toBe(true);
    const newFile = path.join(cloneDir, 'prompts', 'common', 'vscode-prompt.md');
    expect(await fs.pathExists(newFile)).toBe(true);
    const content = await fs.readFile(newFile, 'utf-8');
    expect(content).toContain('From vscode.');
    // Should not contain VSCode-specific frontmatter
    expect(content).not.toContain('agent:');
  });

  it('uses most recently modified when same prompt differs across client locations', async () => {
    // Create older .claude version
    const claudeDir = path.join(targetDir, '.claude', 'commands');
    await fs.ensureDir(claudeDir);
    const claudeFile = path.join(claudeDir, 'rulekit-shared.md');
    await fs.writeFile(claudeFile, '# Shared\n\nOld version.\n');

    // Create newer .cursor version
    const cursorDir = path.join(targetDir, '.cursor', 'commands');
    await fs.ensureDir(cursorDir);
    const cursorFile = path.join(cursorDir, 'rulekit-shared.md');
    await fs.writeFile(cursorFile, '# Shared\n\nNewer version.\n');

    // Set mtime: cursor file is newer
    const past = new Date(Date.now() - 60000);
    await fs.utimes(claudeFile, past, past);

    await fs.ensureDir(path.join(cloneDir, 'prompts', 'common'));

    const changed = await pushPrompts(targetDir, cloneDir);

    expect(changed).toBe(true);
    const result = await fs.readFile(path.join(cloneDir, 'prompts', 'common', 'shared.md'), 'utf-8');
    expect(result).toContain('Newer version.');
  });

  it('uses any copy when all client copies match', async () => {
    const content = '# Shared\n\nSame everywhere.\n';

    const claudeDir = path.join(targetDir, '.claude', 'commands');
    await fs.ensureDir(claudeDir);
    await fs.writeFile(path.join(claudeDir, 'rulekit-shared.md'), content);

    const cursorDir = path.join(targetDir, '.cursor', 'commands');
    await fs.ensureDir(cursorDir);
    await fs.writeFile(path.join(cursorDir, 'rulekit-shared.md'), content);

    await fs.ensureDir(path.join(cloneDir, 'prompts', 'common'));

    const changed = await pushPrompts(targetDir, cloneDir);

    expect(changed).toBe(true);
    const result = await fs.readFile(path.join(cloneDir, 'prompts', 'common', 'shared.md'), 'utf-8');
    expect(result).toContain('Same everywhere.');
  });

  it('returns false when content matches', async () => {
    const cmdDir = path.join(targetDir, '.claude', 'commands');
    await fs.ensureDir(cmdDir);
    await fs.writeFile(path.join(cmdDir, 'rulekit-deploy.md'), '# Deploy\n\nDeploy instructions.\n');

    const promptDir = path.join(cloneDir, 'prompts', 'common');
    await fs.ensureDir(promptDir);
    await fs.writeFile(path.join(promptDir, 'deploy.md'), '# Deploy\n\nDeploy instructions.\n');

    const changed = await pushPrompts(targetDir, cloneDir);

    expect(changed).toBe(false);
  });
});

describe('pushSkills', () => {
  let tmpDir: string;
  let targetDir: string;
  let cloneDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'rulekit-push-test-'));
    targetDir = path.join(tmpDir, 'project');
    cloneDir = path.join(tmpDir, 'clone');
    await fs.ensureDir(targetDir);
    await fs.ensureDir(cloneDir);
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('updates existing skill when SKILL.md differs', async () => {
    // Local skill
    const localSkill = path.join(targetDir, '.claude', 'skills', 'my-skill');
    await fs.ensureDir(localSkill);
    await fs.writeFile(path.join(localSkill, 'SKILL.md'), '# Updated Skill\n');

    // Existing skill in clone
    const cloneSkill = path.join(cloneDir, 'skills', 'my-skill');
    await fs.ensureDir(cloneSkill);
    await fs.writeFile(path.join(cloneSkill, 'SKILL.md'), '# Old Skill\n');

    const changed = await pushSkills(targetDir, cloneDir);

    expect(changed).toBe(true);
    const result = await fs.readFile(path.join(cloneSkill, 'SKILL.md'), 'utf-8');
    expect(result).toBe('# Updated Skill\n');
  });

  it('creates new skill in clone when it does not exist', async () => {
    const localSkill = path.join(targetDir, '.claude', 'skills', 'new-skill');
    await fs.ensureDir(localSkill);
    await fs.writeFile(path.join(localSkill, 'SKILL.md'), '# New Skill\n');
    await fs.ensureDir(path.join(localSkill, 'references'));
    await fs.writeFile(path.join(localSkill, 'references', 'ref.md'), '# Ref\n');

    // Clone has skills dir but not this skill
    await fs.ensureDir(path.join(cloneDir, 'skills'));

    const changed = await pushSkills(targetDir, cloneDir);

    expect(changed).toBe(true);
    expect(await fs.pathExists(path.join(cloneDir, 'skills', 'new-skill', 'SKILL.md'))).toBe(true);
    expect(await fs.pathExists(path.join(cloneDir, 'skills', 'new-skill', 'references', 'ref.md'))).toBe(true);
  });

  it('returns false when content matches', async () => {
    const localSkill = path.join(targetDir, '.claude', 'skills', 'my-skill');
    await fs.ensureDir(localSkill);
    await fs.writeFile(path.join(localSkill, 'SKILL.md'), '# Same Content\n');

    const cloneSkill = path.join(cloneDir, 'skills', 'my-skill');
    await fs.ensureDir(cloneSkill);
    await fs.writeFile(path.join(cloneSkill, 'SKILL.md'), '# Same Content\n');

    const changed = await pushSkills(targetDir, cloneDir);

    expect(changed).toBe(false);
  });
});

describe('pushRules', () => {
  let tmpDir: string;
  let targetDir: string;
  let cloneDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'rulekit-push-test-'));
    targetDir = path.join(tmpDir, 'project');
    cloneDir = path.join(tmpDir, 'clone');
    await fs.ensureDir(targetDir);
    await fs.ensureDir(cloneDir);
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('creates new stack rule file when it does not exist in clone', async () => {
    // Local AGENTS.md with content
    await fs.writeFile(
      path.join(targetDir, 'AGENTS.md'),
      '---\nstack: vue-bootstrap\n---\n# Common Rules\n\nShared rules.\n\n---\n\n# Vue Rules\n\nVue specific stuff.\n'
    );

    // Clone has rules dir but no vue-bootstrap.md
    await fs.ensureDir(path.join(cloneDir, 'rules'));

    const changed = await pushRules(targetDir, cloneDir, 'vue-bootstrap');

    expect(changed).toBe(true);
    const ruleFile = path.join(cloneDir, 'rules', 'vue-bootstrap.md');
    expect(await fs.pathExists(ruleFile)).toBe(true);
    const content = await fs.readFile(ruleFile, 'utf-8');
    expect(content).toContain('Vue specific stuff.');
  });
});
