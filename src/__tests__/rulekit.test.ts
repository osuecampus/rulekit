import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import matter from 'gray-matter';
import { syncRules, syncPrompts, syncSkills } from '../sync.js';
import { resolveStack } from '../env.js';
import { pushRules, pushPrompts, pushSkills } from '../push.js';
import { generateVSCodePrompt } from '../promptfile-generators/vscode.js';
import { generateClaudeCodeCommand } from '../promptfile-generators/claude-code.js';

let tmpDir: string;
let rulekitRoot: string;
let targetDir: string;
let cloneDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'rulekit-test-'));
  rulekitRoot = path.join(tmpDir, 'rulekit');
  targetDir = path.join(tmpDir, 'target');
  cloneDir = path.join(tmpDir, 'clone');
  await fs.ensureDir(targetDir);
  await fs.ensureDir(cloneDir);
});

afterEach(async () => {
  await fs.remove(tmpDir);
});

describe('syncRules', () => {
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

  it('merges common and stack rules with separator and writes stack frontmatter', async () => {
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
    const parsed = matter(result);
    expect(parsed.data.stack).toBe('vue-bootstrap');
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

  it('does not create file when no matching content exists', async () => {
    await fs.ensureDir(path.join(rulekitRoot, 'rules'));
    await fs.writeFile(path.join(rulekitRoot, 'rules', 'vue-bootstrap.md'), '# Vue Only\n');

    await syncRules(rulekitRoot, targetDir, 'nuxt');

    expect(await fs.pathExists(path.join(targetDir, 'AGENTS.md'))).toBe(false);
  });

  it('handles missing rules directory gracefully', async () => {
    await fs.ensureDir(rulekitRoot);
    await syncRules(rulekitRoot, targetDir, 'common');

    expect(await fs.pathExists(path.join(targetDir, 'AGENTS.md'))).toBe(false);
  });
});

describe('syncPrompts', () => {
  it('generates VSCode and Claude Code formats with correct structure', async () => {
    await fs.ensureDir(path.join(rulekitRoot, 'prompts', 'common'));
    await fs.writeFile(
      path.join(rulekitRoot, 'prompts', 'common', 'review.md'),
      '# Code Review\n\nReview the code.\n'
    );

    await syncPrompts(rulekitRoot, targetDir, 'common');

    // VSCode — proper frontmatter
    const vscode = await fs.readFile(
      path.join(targetDir, '.github', 'prompts', 'rulekit-review.prompt.md'),
      'utf-8'
    );
    const vsParsed = matter(vscode);
    expect(vsParsed.data.name).toBe('rulekit-review');
    expect(vsParsed.data.description).toBe('Code Review');
    expect(vsParsed.data.agent).toBe('agent');

    // Claude Code — description frontmatter
    const claude = await fs.readFile(
      path.join(targetDir, '.claude', 'commands', 'rulekit-review.md'),
      'utf-8'
    );
    const ccParsed = matter(claude);
    expect(ccParsed.data.description).toBe('Code Review');
  });

  it('includes stack-specific prompts alongside common', async () => {
    await fs.ensureDir(path.join(rulekitRoot, 'prompts', 'common'));
    await fs.ensureDir(path.join(rulekitRoot, 'prompts', 'vue-bootstrap'));
    await fs.writeFile(path.join(rulekitRoot, 'prompts', 'common', 'shared.md'), '# Shared\n');
    await fs.writeFile(path.join(rulekitRoot, 'prompts', 'vue-bootstrap', 'vue-specific.md'), '# Vue Specific\n');

    await syncPrompts(rulekitRoot, targetDir, 'vue-bootstrap');

    expect(await fs.pathExists(
      path.join(targetDir, '.claude', 'commands', 'rulekit-shared.md')
    )).toBe(true);
    expect(await fs.pathExists(
      path.join(targetDir, '.claude', 'commands', 'rulekit-vue-specific.md')
    )).toBe(true);
  });

  it('handles missing prompts directory gracefully', async () => {
    await fs.ensureDir(rulekitRoot);
    await syncPrompts(rulekitRoot, targetDir, 'common');

    expect(await fs.pathExists(path.join(targetDir, '.claude', 'commands'))).toBe(false);
  });
});

describe('syncSkills', () => {
  it('copies skill with subdirectories to .claude/skills/', async () => {
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

  it('handles missing skills directory gracefully', async () => {
    await fs.ensureDir(rulekitRoot);
    await syncSkills(rulekitRoot, targetDir, 'common');

    expect(await fs.pathExists(path.join(targetDir, '.claude'))).toBe(false);
  });
});

describe('resolveStack', () => {
  it('follows priority chain: explicit > .env > AGENTS.md > common', async () => {
    await fs.writeFile(path.join(targetDir, '.env'), 'RULEKIT_STACK=nuxt\n');
    await fs.writeFile(
      path.join(targetDir, 'AGENTS.md'),
      '---\nstack: react\n---\n# Rules\n'
    );

    // Explicit wins over .env and AGENTS.md
    expect(await resolveStack('vue-bootstrap', targetDir)).toBe('vue-bootstrap');

    // .env wins over AGENTS.md
    expect(await resolveStack(undefined, targetDir)).toBe('nuxt');

    // Remove .env — AGENTS.md wins
    await fs.remove(path.join(targetDir, '.env'));
    expect(await resolveStack(undefined, targetDir)).toBe('react');

    // Remove AGENTS.md — falls back to common
    await fs.remove(path.join(targetDir, 'AGENTS.md'));
    expect(await resolveStack(undefined, targetDir)).toBe('common');
  });

  it('handles quoted .env values', async () => {
    await fs.writeFile(path.join(targetDir, '.env'), 'RULEKIT_STACK="vue-bootstrap"\n');
    expect(await resolveStack(undefined, targetDir)).toBe('vue-bootstrap');

    await fs.writeFile(path.join(targetDir, '.env'), "RULEKIT_STACK='nuxt'\n");
    expect(await resolveStack(undefined, targetDir)).toBe('nuxt');
  });
});

describe('pushRules', () => {
  it('detects changed content and writes to clone', async () => {
    await fs.writeFile(
      path.join(targetDir, 'AGENTS.md'),
      '---\nstack: vue-bootstrap\n---\n# Common Rules\n\nShared rules.\n\n---\n\n# Vue Rules\n\nVue specific stuff.\n'
    );
    await fs.ensureDir(path.join(cloneDir, 'rules'));

    const changed = await pushRules(targetDir, cloneDir, 'vue-bootstrap');

    expect(changed).toBe(true);
    const ruleFile = path.join(cloneDir, 'rules', 'vue-bootstrap.md');
    expect(await fs.pathExists(ruleFile)).toBe(true);
    const content = await fs.readFile(ruleFile, 'utf-8');
    expect(content).toContain('Vue specific stuff.');
  });
});

describe('pushPrompts', () => {
  it('detects changed content and writes to clone', async () => {
    const cmdDir = path.join(targetDir, '.claude', 'commands');
    await fs.ensureDir(cmdDir);
    await fs.writeFile(path.join(cmdDir, 'rulekit-deploy.md'), '# Deploy\n\nUpdated deploy instructions.\n');

    const promptDir = path.join(cloneDir, 'prompts', 'common');
    await fs.ensureDir(promptDir);
    await fs.writeFile(path.join(promptDir, 'deploy.md'), '# Deploy\n\nOld deploy instructions.\n');

    const changed = await pushPrompts(targetDir, cloneDir);

    expect(changed).toBe(true);
    const result = await fs.readFile(path.join(promptDir, 'deploy.md'), 'utf-8');
    expect(result).toContain('Updated deploy instructions.');
  });

  it('creates new prompts when they do not exist in clone', async () => {
    const cmdDir = path.join(targetDir, '.claude', 'commands');
    await fs.ensureDir(cmdDir);
    await fs.writeFile(path.join(cmdDir, 'rulekit-new-prompt.md'), '# New Prompt\n\nDo something new.\n');

    await fs.ensureDir(path.join(cloneDir, 'prompts', 'common'));

    const changed = await pushPrompts(targetDir, cloneDir);

    expect(changed).toBe(true);
    const newFile = path.join(cloneDir, 'prompts', 'common', 'new-prompt.md');
    expect(await fs.pathExists(newFile)).toBe(true);
  });

  it('returns false when nothing changed', async () => {
    const cmdDir = path.join(targetDir, '.claude', 'commands');
    await fs.ensureDir(cmdDir);
    await fs.writeFile(path.join(cmdDir, 'rulekit-deploy.md'), '# Deploy\n\nDeploy instructions.\n');

    const promptDir = path.join(cloneDir, 'prompts', 'common');
    await fs.ensureDir(promptDir);
    await fs.writeFile(path.join(promptDir, 'deploy.md'), '# Deploy\n\nDeploy instructions.\n');

    expect(await pushPrompts(targetDir, cloneDir)).toBe(false);
  });

  it('reads from .github/prompts when .claude not present', async () => {
    const promptsDir = path.join(targetDir, '.github', 'prompts');
    await fs.ensureDir(promptsDir);
    await fs.writeFile(path.join(promptsDir, 'rulekit-copilot-prompt.prompt.md'), '# Copilot Prompt\n\nFrom copilot.\n');

    await fs.ensureDir(path.join(cloneDir, 'prompts', 'common'));

    const changed = await pushPrompts(targetDir, cloneDir);

    expect(changed).toBe(true);
    expect(await fs.pathExists(path.join(cloneDir, 'prompts', 'common', 'copilot-prompt.md'))).toBe(true);
  });

  it('uses most recently modified when prompts conflict across locations', async () => {
    // Older .claude version
    const claudeDir = path.join(targetDir, '.claude', 'commands');
    await fs.ensureDir(claudeDir);
    const claudeFile = path.join(claudeDir, 'rulekit-shared.md');
    await fs.writeFile(claudeFile, '# Shared\n\nOld version.\n');

    // Newer .github version
    const githubDir = path.join(targetDir, '.github', 'prompts');
    await fs.ensureDir(githubDir);
    const githubFile = path.join(githubDir, 'rulekit-shared.prompt.md');
    await fs.writeFile(githubFile, '# Shared\n\nNewer version.\n');

    const past = new Date(Date.now() - 60000);
    await fs.utimes(claudeFile, past, past);

    await fs.ensureDir(path.join(cloneDir, 'prompts', 'common'));

    await pushPrompts(targetDir, cloneDir);

    const result = await fs.readFile(path.join(cloneDir, 'prompts', 'common', 'shared.md'), 'utf-8');
    expect(result).toContain('Newer version.');
  });

  it('preserves canonical frontmatter when updating existing prompt', async () => {
    const claudeDir = path.join(targetDir, '.claude', 'commands');
    await fs.ensureDir(claudeDir);
    await fs.writeFile(
      path.join(claudeDir, 'rulekit-deploy.md'),
      '---\nallowed-tools: Read, Write, Bash\nmodel: sonnet\n---\n# Deploy\n\nUpdated deploy instructions.\n'
    );

    const promptDir = path.join(cloneDir, 'prompts', 'common');
    await fs.ensureDir(promptDir);
    await fs.writeFile(
      path.join(promptDir, 'deploy.md'),
      '---\nallowed-tools: Read, Write\nmodel: sonnet\n---\n# Deploy\n\nOld deploy instructions.\n'
    );

    const changed = await pushPrompts(targetDir, cloneDir);

    expect(changed).toBe(true);
    const result = await fs.readFile(path.join(promptDir, 'deploy.md'), 'utf-8');
    const parsed = matter(result);
    expect(parsed.data['allowed-tools']).toBe('Read, Write, Bash');
    expect(parsed.data.model).toBe('sonnet');
    expect(parsed.content.trim()).toContain('Updated deploy instructions.');
  });

  it('preserves canonical frontmatter when creating new prompt', async () => {
    const claudeDir = path.join(targetDir, '.claude', 'commands');
    await fs.ensureDir(claudeDir);
    await fs.writeFile(
      path.join(claudeDir, 'rulekit-new-feature.md'),
      '---\nallowed-tools: Read, Write\nargument-hint: feature-name\n---\n# New Feature\n\nCreate a new feature.\n'
    );

    await fs.ensureDir(path.join(cloneDir, 'prompts', 'common'));

    const changed = await pushPrompts(targetDir, cloneDir);

    expect(changed).toBe(true);
    const result = await fs.readFile(path.join(cloneDir, 'prompts', 'common', 'new-feature.md'), 'utf-8');
    const parsed = matter(result);
    expect(parsed.data['allowed-tools']).toBe('Read, Write');
    expect(parsed.data['argument-hint']).toBe('feature-name');
    expect(parsed.content.trim()).toContain('Create a new feature.');
  });

  it('returns false when content and frontmatter match', async () => {
    const claudeDir = path.join(targetDir, '.claude', 'commands');
    await fs.ensureDir(claudeDir);
    await fs.writeFile(
      path.join(claudeDir, 'rulekit-deploy.md'),
      '---\nallowed-tools: Read\nmodel: sonnet\n---\n# Deploy\n\nSame instructions.\n'
    );

    const promptDir = path.join(cloneDir, 'prompts', 'common');
    await fs.ensureDir(promptDir);
    await fs.writeFile(
      path.join(promptDir, 'deploy.md'),
      '---\nallowed-tools: Read\nmodel: sonnet\n---\n# Deploy\n\nSame instructions.\n'
    );

    expect(await pushPrompts(targetDir, cloneDir)).toBe(false);
  });

  it('preserves custom frontmatter and strips client-injected fields', async () => {
    const claudeDir = path.join(targetDir, '.claude', 'commands');
    await fs.ensureDir(claudeDir);
    await fs.writeFile(
      path.join(claudeDir, 'rulekit-custom.md'),
      '---\npriority: high\ntags: testing\nallowed-tools: Read\n---\n# Custom\n\nWith custom metadata.\n'
    );

    await fs.ensureDir(path.join(cloneDir, 'prompts', 'common'));

    const changed = await pushPrompts(targetDir, cloneDir);

    expect(changed).toBe(true);
    const result = await fs.readFile(path.join(cloneDir, 'prompts', 'common', 'custom.md'), 'utf-8');
    const parsed = matter(result);
    expect(parsed.data.priority).toBe('high');
    expect(parsed.data.tags).toBe('testing');
    expect(parsed.data['allowed-tools']).toBe('Read');
    expect(parsed.data.name).toBeUndefined();
    expect(parsed.data.agent).toBeUndefined();
  });
});

describe('pushSkills', () => {
  it('detects changed content and writes to clone', async () => {
    const localSkill = path.join(targetDir, '.claude', 'skills', 'my-skill');
    await fs.ensureDir(localSkill);
    await fs.writeFile(path.join(localSkill, 'SKILL.md'), '# Updated Skill\n');

    const cloneSkill = path.join(cloneDir, 'skills', 'my-skill');
    await fs.ensureDir(cloneSkill);
    await fs.writeFile(path.join(cloneSkill, 'SKILL.md'), '# Old Skill\n');

    const changed = await pushSkills(targetDir, cloneDir);

    expect(changed).toBe(true);
    const result = await fs.readFile(path.join(cloneSkill, 'SKILL.md'), 'utf-8');
    expect(result).toBe('# Updated Skill\n');
  });

  it('creates new skills when they do not exist in clone', async () => {
    const localSkill = path.join(targetDir, '.claude', 'skills', 'new-skill');
    await fs.ensureDir(path.join(localSkill, 'references'));
    await fs.writeFile(path.join(localSkill, 'SKILL.md'), '# New Skill\n');
    await fs.writeFile(path.join(localSkill, 'references', 'ref.md'), '# Ref\n');

    await fs.ensureDir(path.join(cloneDir, 'skills'));

    const changed = await pushSkills(targetDir, cloneDir);

    expect(changed).toBe(true);
    expect(await fs.pathExists(path.join(cloneDir, 'skills', 'new-skill', 'SKILL.md'))).toBe(true);
    expect(await fs.pathExists(path.join(cloneDir, 'skills', 'new-skill', 'references', 'ref.md'))).toBe(true);
  });

  it('returns false when nothing changed', async () => {
    const localSkill = path.join(targetDir, '.claude', 'skills', 'my-skill');
    await fs.ensureDir(localSkill);
    await fs.writeFile(path.join(localSkill, 'SKILL.md'), '# Same Content\n');

    const cloneSkill = path.join(cloneDir, 'skills', 'my-skill');
    await fs.ensureDir(cloneSkill);
    await fs.writeFile(path.join(cloneSkill, 'SKILL.md'), '# Same Content\n');

    expect(await pushSkills(targetDir, cloneDir)).toBe(false);
  });
});

describe('generators', () => {
  it('VSCode generates proper frontmatter', () => {
    const result = generateVSCodePrompt('# My Prompt\n\nDo something useful.', 'my-prompt');
    const parsed = matter(result);

    expect(parsed.data.name).toBe('rulekit-my-prompt');
    expect(parsed.data.description).toBe('My Prompt');
    expect(parsed.data.agent).toBe('agent');
  });

  it('Claude Code adds description and preserves allowed-tools/model', () => {
    const content = '---\nallowed-tools: Read, Write, Bash\nmodel: sonnet\n---\n# My Command\n\nDo stuff.';
    const result = generateClaudeCodeCommand(content, 'tools-test');
    const parsed = matter(result);

    expect(parsed.data.description).toBe('My Command');
    expect(parsed.data['allowed-tools']).toBe('Read, Write, Bash');
    expect(parsed.data.model).toBe('sonnet');
  });

  it('Claude Code uses name as fallback description when no metadata', () => {
    const result = generateClaudeCodeCommand('Just plain instructions.', 'plain');

    expect(result).toMatch(/^---/);
    expect(result).toContain('description: plain');
    expect(result).toContain('Just plain instructions.');
  });
});
