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

    // Commit and push
    execSync('git add -A', { cwd: tempDir, stdio: 'pipe' });
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

  const agentsContent = await fs.readFile(agentsFile, 'utf-8');

  // Split on --- separator to extract stack portion
  const sections = agentsContent.split(/\n---\n/);

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

  if (ruleContent === existingContent) return false;

  // Write back with frontmatter preserved
  const frontmatter = { stack };
  const output = matter.stringify('\n' + ruleContent + '\n', frontmatter);
  await fs.writeFile(ruleFile, output, 'utf-8');

  // Also check subdirectory rules
  await pushSubdirRules(targetPath, tempDir, stack);

  return true;
};

/**
 * Push rule changes from subdirectories (e.g., docs/AGENTS.md, src/components/AGENTS.md).
 */
const pushSubdirRules = async (
  targetPath: string,
  tempDir: string,
  stack: string
): Promise<void> => {
  const agentsFiles = await glob('**/AGENTS.md', {
    cwd: targetPath,
    ignore: ['node_modules/**', TEMP_DIR + '/**'],
  });

  for (const relPath of agentsFiles) {
    if (relPath === 'AGENTS.md') continue; // Already handled by pushRules

    const dirPath = path.dirname(relPath);
    const content = await fs.readFile(path.join(targetPath, relPath), 'utf-8');

    const sections = content.split(/\n---\n/);
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
  }
};

/**
 * Collect rulekit-* prompt files from all three client command locations.
 * Returns a map of prompt name → { content, mtime } using deduplication.
 * When the same prompt exists in multiple locations with different content,
 * warns and uses the most recently modified file.
 */
export const collectLocalPrompts = async (
  targetPath: string
): Promise<Map<string, string>> => {
  const locations = [
    { dir: path.join(targetPath, '.claude', 'commands'), pattern: 'rulekit-*.md', stripExt: '.md' },
    { dir: path.join(targetPath, '.cursor', 'commands'), pattern: 'rulekit-*.md', stripExt: '.md' },
    { dir: path.join(targetPath, '.github', 'prompts'), pattern: 'rulekit-*.prompt.md', stripExt: '.prompt.md' },
  ];

  // Collect all candidates: name → [{ content, mtime, filePath }]
  const candidates = new Map<string, { content: string; mtime: number; filePath: string }[]>();

  for (const loc of locations) {
    if (!(await fs.pathExists(loc.dir))) continue;

    const files = await glob(loc.pattern, { cwd: loc.dir });
    for (const file of files) {
      const name = file.replace('rulekit-', '').replace(loc.stripExt, '');
      const filePath = path.join(loc.dir, file);
      const raw = await fs.readFile(filePath, 'utf-8');
      const parsed = matter(raw);
      const content = parsed.content.trim();
      const stat = await fs.stat(filePath);

      if (!candidates.has(name)) candidates.set(name, []);
      candidates.get(name)!.push({ content, mtime: stat.mtimeMs, filePath });
    }
  }

  // Deduplicate: pick content for each prompt name
  const result = new Map<string, string>();
  for (const [name, entries] of candidates) {
    const uniqueContents = new Set(entries.map((e) => e.content));
    if (uniqueContents.size === 1) {
      result.set(name, entries[0].content);
    } else {
      // Conflict: warn and pick most recently modified
      const sorted = entries.sort((a, b) => b.mtime - a.mtime);
      console.warn(
        `  ⚠ Prompt "${name}" differs across client locations. Using most recent: ${sorted[0].filePath}`
      );
      result.set(name, sorted[0].content);
    }
  }

  return result;
};

/**
 * Push prompt changes: compare rulekit-* prompts from all client locations against prompts/ sources.
 */
export const pushPrompts = async (
  targetPath: string,
  tempDir: string,
  promptStack?: string
): Promise<boolean> => {
  const localPrompts = await collectLocalPrompts(targetPath);
  if (localPrompts.size === 0) return false;

  let changed = false;

  for (const [name, sourceContent] of localPrompts) {
    // Try to find existing prompt in any prompts/* directory in the clone
    const promptDirs = await glob('prompts/*', { cwd: tempDir });
    let found = false;

    for (const promptDir of promptDirs) {
      const sourceFile = path.join(tempDir, promptDir, `${name}.md`);
      if (await fs.pathExists(sourceFile)) {
        found = true;
        const existing = await fs.readFile(sourceFile, 'utf-8');
        const existingParsed = matter(existing);
        if (sourceContent !== existingParsed.content.trim()) {
          await fs.writeFile(sourceFile, sourceContent + '\n', 'utf-8');
          changed = true;
        }
      }
    }

    // New prompt: create in the appropriate stack directory
    if (!found) {
      const targetStack = promptStack || 'common';
      const newFile = path.join(tempDir, 'prompts', targetStack, `${name}.md`);
      await fs.ensureDir(path.dirname(newFile));
      await fs.writeFile(newFile, sourceContent + '\n', 'utf-8');
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
    const sourceSkillMd = path.join(sourceSkill, 'SKILL.md');

    if (await fs.pathExists(sourceSkillMd)) {
      // Existing skill: only copy if SKILL.md content differs
      const localContent = await fs.readFile(localSkillMd, 'utf-8');
      const sourceContent = await fs.readFile(sourceSkillMd, 'utf-8');

      if (localContent !== sourceContent) {
        await fs.copy(localSkill, sourceSkill, { overwrite: true });
        changed = true;
      }
    } else {
      // New skill: create the target directory and copy
      await fs.ensureDir(sourceSkill);
      await fs.copy(localSkill, sourceSkill, { overwrite: true });
      changed = true;
    }
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
