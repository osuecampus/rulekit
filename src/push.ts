import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { createInterface } from 'readline';
import { glob } from 'glob';
import matter from 'gray-matter';

export interface PushOptions {
  targetPath: string;
  stack: string;
  type: 'rules' | 'prompts' | 'skills' | 'all';
  message?: string;
  /** True if the stack was explicitly provided via --stack flag */
  stackExplicit: boolean;
  /** Target stack directory for new prompts (defaults to 'common') */
  promptStack?: string;
}

const RULEKIT_REPO = 'git@github.com:osuecampus/rulekit.git';
const TEMP_DIR = '.rulekit-push-tmp';

/**
 * Push local changes back to the rulekit repo via pull request.
 */
export const pushChanges = async (options: PushOptions): Promise<void> => {
  const { targetPath, stack, type, message, stackExplicit, promptStack } = options;

  // Verify gh CLI is available
  assertGhInstalled();

  // Confirm with user when stack defaulted to 'common'
  if (stack === 'common' && !stackExplicit) {
    const confirmed = await confirmCommonStack();
    if (!confirmed) {
      console.log('Push cancelled. Use --stack <name> to specify a stack.');
      return;
    }
  }

  const tempDir = path.join(targetPath, TEMP_DIR);

  try {
    // Shallow-clone rulekit repo
    console.log('  → Cloning rulekit repo...');
    execSync(`git clone --depth 1 ${RULEKIT_REPO} ${tempDir}`, { stdio: 'pipe' });

    // Create feature branch
    const timestamp = Math.floor(Date.now() / 1000);
    const branch = `push/${stack}/${timestamp}`;
    execSync(`git checkout -b ${branch}`, { cwd: tempDir, stdio: 'pipe' });

    let hasChanges = false;

    if (type === 'all' || type === 'rules') {
      const rulesChanged = await pushRules(targetPath, tempDir, stack);
      if (rulesChanged) {
        hasChanges = true;
        console.log('  → Detected changes in rules');
      }
    }

    if (type === 'all' || type === 'prompts') {
      const promptsChanged = await pushPrompts(targetPath, tempDir, promptStack);
      if (promptsChanged) {
        hasChanges = true;
        console.log('  → Detected changes in prompts');
      }
    }

    if (type === 'all' || type === 'skills') {
      const skillsChanged = await pushSkills(targetPath, tempDir);
      if (skillsChanged) {
        hasChanges = true;
        console.log('  → Detected changes in skills');
      }
    }

    if (!hasChanges) {
      console.log('  → No changes detected');
      return;
    }

    // Commit and push (use git to detect actual changes, since some
    // push helpers optimistically copy and rely on git diff)
    execSync('git add -A', { cwd: tempDir, stdio: 'pipe' });
    const staged = execSync('git diff --cached --quiet || echo changed', {
      cwd: tempDir,
      encoding: 'utf-8',
    }).trim();
    if (!staged) {
      console.log('  → No changes detected');
      return;
    }
    const commitMsg = message || `push: update ${type} for ${stack} stack`;
    execSync(`git commit -m "${commitMsg}"`, { cwd: tempDir, stdio: 'pipe' });
    execSync(`git push -u origin ${branch}`, { cwd: tempDir, stdio: 'pipe' });
    console.log(`  → Created branch: ${branch}`);

    // Create PR
    const prBody = message || `Automated push of ${type} changes for the ${stack} stack.`;
    const prOutput = execSync(
      `gh pr create --title "push: ${type} updates for ${stack}" --body "${prBody}" --head ${branch}`,
      { cwd: tempDir, encoding: 'utf-8' }
    );
    console.log(`  → Created PR: ${prOutput.trim()}`);
  } finally {
    // Always clean up temp dir
    await fs.remove(tempDir);
  }
};

/**
 * Push rule changes: reverse-map AGENTS.md back to rule files.
 */
export const pushRules = async (
  targetPath: string,
  tempDir: string,
  stack: string
): Promise<boolean> => {
  const agentsFile = path.join(targetPath, 'AGENTS.md');
  if (!(await fs.pathExists(agentsFile))) return false;

  const agentsRaw = await fs.readFile(agentsFile, 'utf-8');

  // Strip YAML frontmatter before splitting on the merge separator
  const agentsContent = matter(agentsRaw).content;

  // Split on the same separator that mergeContent uses (\n\n---\n\n)
  const sections = agentsContent.split(/\n\n---\n\n/);

  // For common stack, use the first section; for others, use the last section
  let ruleContent: string;
  if (stack === 'common') {
    ruleContent = sections[0].trim();
  } else {
    ruleContent = sections.length > 1 ? sections[sections.length - 1].trim() : sections[0].trim();
  }

  // Strip the "About This File" guidance section that rulekit injects
  ruleContent = stripGuidanceSection(ruleContent);

  // Read existing rule file from the clone
  const ruleFile = path.join(tempDir, 'rules', `${stack}.md`);
  let existingContent = '';
  if (await fs.pathExists(ruleFile)) {
    const parsed = matter(await fs.readFile(ruleFile, 'utf-8'));
    existingContent = parsed.content.trim();
  }

  let rootChanged = false;

  if (ruleContent !== existingContent) {
    // Write back with frontmatter preserved
    const frontmatter = { stack };
    const output = matter.stringify('\n' + ruleContent + '\n', frontmatter);
    await fs.writeFile(ruleFile, output, 'utf-8');
    rootChanged = true;
  }

  // Also check subdirectory rules
  const subdirChanged = await pushSubdirRules(targetPath, tempDir, stack);

  return rootChanged || subdirChanged;
};

/**
 * Push rule changes from subdirectories (e.g., docs/AGENTS.md, src/components/AGENTS.md).
 */
const pushSubdirRules = async (
  targetPath: string,
  tempDir: string,
  stack: string
): Promise<boolean> => {
  const agentsFiles = await glob('**/AGENTS.md', {
    cwd: targetPath,
    ignore: ['node_modules/**', TEMP_DIR + '/**'],
  });

  let changed = false;

  for (const relPath of agentsFiles) {
    if (relPath === 'AGENTS.md') continue; // Already handled by pushRules

    const dirPath = path.dirname(relPath);
    const raw = await fs.readFile(path.join(targetPath, relPath), 'utf-8');

    // Strip YAML frontmatter before splitting on the merge separator
    const content = matter(raw).content;

    const sections = content.split(/\n\n---\n\n/);
    let ruleContent: string;
    if (stack === 'common') {
      ruleContent = sections[0].trim();
    } else {
      ruleContent = sections.length > 1 ? sections[sections.length - 1].trim() : '';
    }

    if (!ruleContent) continue;

    const ruleFile = path.join(tempDir, 'rules', dirPath, `${stack}.md`);
    await fs.ensureDir(path.dirname(ruleFile));

    const frontmatter = { stack };
    const output = matter.stringify('\n' + ruleContent + '\n', frontmatter);
    await fs.writeFile(ruleFile, output, 'utf-8');
    changed = true;
  }

  return changed;
};

/** Client-injected frontmatter fields to strip when writing to prompts/ source */
const CLIENT_ONLY_FIELDS = ['name', 'agent'] as const;

/**
 * Convert client prompt content to canonical prompts/ format.
 * Preserves all frontmatter except client-injected fields (name, agent).
 */
const toCanonicalPromptFormat = (raw: string): string => {
  const parsed = matter(raw);
  const content = parsed.content.trim();

  const canonical: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(parsed.data)) {
    if (CLIENT_ONLY_FIELDS.includes(key as (typeof CLIENT_ONLY_FIELDS)[number])) continue;
    if (val == null) continue;

    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (trimmed) {
        canonical[key] = trimmed;
      }
    } else {
      canonical[key] = val;
    }
  }

  if (Object.keys(canonical).length > 0) {
    return matter.stringify(content, canonical);
  }
  return content;
};

/**
 * Normalize existing prompts/ file to canonical format for comparison.
 * Strips any non-canonical frontmatter so we compare apples to apples.
 */
const normalizePromptFile = (raw: string): string => {
  return toCanonicalPromptFormat(raw);
};

/**
 * Collect rulekit-* prompt files from .claude/commands and .github/prompts.
 * Returns prompt name → full canonical content (with frontmatter preserved).
 * When the same prompt exists in multiple locations with different content,
 * warns and uses the most recently modified file.
 */
export const collectLocalPrompts = async (
  targetPath: string
): Promise<Map<string, string>> => {
  const locations = [
    { dir: path.join(targetPath, '.claude', 'commands'), pattern: 'rulekit-*.md', stripExt: '.md' },
    {
      dir: path.join(targetPath, '.github', 'prompts'),
      pattern: 'rulekit-*.prompt.md',
      stripExt: '.prompt.md',
    },
  ];

  const candidates = new Map<
    string,
    { canonical: string; content: string; mtime: number; filePath: string }[]
  >();

  for (const loc of locations) {
    if (!(await fs.pathExists(loc.dir))) continue;

    const files = await glob(loc.pattern, { cwd: loc.dir });
    for (const file of files) {
      const name = file.replace('rulekit-', '').replace(loc.stripExt, '');
      const filePath = path.join(loc.dir, file);
      const raw = await fs.readFile(filePath, 'utf-8');
      const canonical = toCanonicalPromptFormat(raw);
      const content = matter(canonical).content.trim();
      const stat = await fs.stat(filePath);

      if (!candidates.has(name)) candidates.set(name, []);
      candidates.get(name)!.push({ canonical, content, mtime: stat.mtimeMs, filePath });
    }
  }

  const result = new Map<string, string>();
  for (const [name, entries] of candidates) {
    const uniqueContents = new Set(entries.map((e) => e.content));
    if (uniqueContents.size === 1) {
      // Same body everywhere — prefer the one with the most frontmatter (Claude)
      const withFm = entries.find((e) => e.canonical.includes('---'));
      result.set(name, withFm ? withFm.canonical : entries[0].canonical);
    } else {
      const sorted = entries.sort((a, b) => b.mtime - a.mtime);
      console.warn(
        `  ⚠ Prompt "${name}" differs across client locations. Using most recent: ${sorted[0].filePath}`
      );
      result.set(name, sorted[0].canonical);
    }
  }

  return result;
};

/**
 * Push prompt changes: compare rulekit-* prompts from .claude/commands and .github/prompts.
 * Preserves all frontmatter except client-injected fields (name, agent).
 */
export const pushPrompts = async (
  targetPath: string,
  tempDir: string,
  promptStack?: string
): Promise<boolean> => {
  const localPrompts = await collectLocalPrompts(targetPath);
  if (localPrompts.size === 0) return false;

  let changed = false;
  const promptDirs = await glob('prompts/*', { cwd: tempDir });

  for (const [name, canonicalContent] of localPrompts) {
    let found = false;

    for (const promptDir of promptDirs) {
      const sourceFile = path.join(tempDir, promptDir, `${name}.md`);
      if (await fs.pathExists(sourceFile)) {
        found = true;
        const existing = await fs.readFile(sourceFile, 'utf-8');
        const existingNormalized = normalizePromptFile(existing);
        if (canonicalContent !== existingNormalized) {
          const output = canonicalContent.endsWith('\n') ? canonicalContent : canonicalContent + '\n';
          await fs.writeFile(sourceFile, output, 'utf-8');
          changed = true;
        }
      }
    }

    if (!found) {
      const targetStack = promptStack || 'common';
      const newFile = path.join(tempDir, 'prompts', targetStack, `${name}.md`);
      await fs.ensureDir(path.dirname(newFile));
      const output = canonicalContent.endsWith('\n') ? canonicalContent : canonicalContent + '\n';
      await fs.writeFile(newFile, output, 'utf-8');
      changed = true;
    }
  }

  return changed;
};

/**
 * Push skill changes: compare .claude/skills/* against skills/* sources.
 */
export const pushSkills = async (
  targetPath: string,
  tempDir: string
): Promise<boolean> => {
  const skillsDir = path.join(targetPath, '.claude', 'skills');
  if (!(await fs.pathExists(skillsDir))) return false;

  const entries = await fs.readdir(skillsDir, { withFileTypes: true });
  let changed = false;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const localSkill = path.join(skillsDir, entry.name);
    const localSkillMd = path.join(localSkill, 'SKILL.md');

    // Skip directories without SKILL.md
    if (!(await fs.pathExists(localSkillMd))) continue;

    const sourceSkill = path.join(tempDir, 'skills', entry.name);

    // Always copy the entire skill directory; git diff will determine
    // whether anything actually changed (catches edits to references/,
    // scripts/, assets/, etc. even when SKILL.md is untouched).
    await fs.ensureDir(sourceSkill);
    await fs.copy(localSkill, sourceSkill, { overwrite: true });
    changed = true;
  }

  return changed;
};

/**
 * Strip the "About This File" guidance section that rulekit injects into rules.
 */
const stripGuidanceSection = (content: string): string => {
  return content.replace(
    /## About This File[\s\S]*?(?=\n## |\n# |$)/,
    ''
  ).trim();
};

/**
 * Ask user to confirm pushing to the 'common' stack when it was inferred (not explicit).
 */
const confirmCommonStack = async (): Promise<boolean> => {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(
      'Stack defaulted to "common". Push to common rules? (y/N) ',
      (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === 'y');
      }
    );
  });
};

/**
 * Verify that the gh CLI is installed and authenticated.
 */
const assertGhInstalled = (): void => {
  try {
    execSync('gh auth status', { stdio: 'pipe' });
  } catch {
    throw new Error(
      'The GitHub CLI (gh) is required for push. Install it:\n' +
      '  brew install gh    # macOS\n' +
      '  gh auth login      # authenticate\n' +
      'See: https://cli.github.com/'
    );
  }
};
