import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';
import { generateCursorCommand } from './promptfile-generators/cursor.js';
import { generateVSCodePrompt } from './promptfile-generators/vscode.js';
import { generateClaudeCodeCommand } from './promptfile-generators/claude-code.js';

/**
 * Sync rules from rules/ directory to target project as AGENTS.md files
 *
 * Directory structure:
 *   rules/common.md                      → AGENTS.md
 *   rules/vue-bootstrap.md               → AGENTS.md (merged with common)
 *   rules/docs/common.md                 → docs/AGENTS.md
 *   rules/src/components/vue-bootstrap.md → src/components/AGENTS.md
 *
 * Files are named by stack (common.md, vue-bootstrap.md, etc.)
 * Directory path determines target location
 */
export const syncRules = async (
  rulekitRoot: string,
  targetPath: string,
  stack: string
): Promise<void> => {
  const rulesDir = path.join(rulekitRoot, 'rules');

  // Find all .md files in rules directory, grouped by their target path
  const rulesByPath = await findRuleFiles(rulesDir);

  for (const [relativePath, stackFiles] of rulesByPath) {
    // Get common content (applies to all stacks)
    const commonContent = stackFiles.get('common') || '';

    // Get stack-specific content (if not syncing 'common' stack)
    const stackContent = stack !== 'common' ? (stackFiles.get(stack) || '') : '';

    // Skip if no content for this stack at this path
    if (!commonContent && !stackContent) continue;

    // Merge: common content first, then stack-specific content
    const mergedContent = mergeContent(commonContent, stackContent);

    // Wrap with frontmatter so stack can be inferred later
    const output = matter.stringify('\n' + mergedContent, { stack });

    // Write to target as AGENTS.md
    const targetFile = path.join(targetPath, relativePath, 'AGENTS.md');
    await fs.ensureDir(path.dirname(targetFile));
    await fs.writeFile(targetFile, output, 'utf-8');

    const displayPath = relativePath ? `${relativePath}/AGENTS.md` : 'AGENTS.md';
    console.log(`  → ${displayPath}`);
  }
};

/**
 * Sync prompt files to target project in both Cursor and VSCode formats
 */
export const syncPrompts = async (
  rulekitRoot: string,
  targetPath: string,
  stack: string
): Promise<void> => {
  const commonPromptsDir = path.join(rulekitRoot, 'prompts', 'common');
  const stackPromptsDir = path.join(rulekitRoot, 'prompts', stack);

  // Collect prompts from common and stack
  const promptFiles: string[] = [];

  if (await fs.pathExists(commonPromptsDir)) {
    const commonPrompts = await glob('**/*.md', { cwd: commonPromptsDir });
    promptFiles.push(...commonPrompts.map(f => path.join(commonPromptsDir, f)));
  }

  if (stack !== 'common' && await fs.pathExists(stackPromptsDir)) {
    const stackPrompts = await glob('**/*.md', { cwd: stackPromptsDir });
    promptFiles.push(...stackPrompts.map(f => path.join(stackPromptsDir, f)));
  }

  for (const promptFile of promptFiles) {
    const content = await fs.readFile(promptFile, 'utf-8');
    const baseName = path.basename(promptFile, '.md');
    const prefixedName = `rulekit-${baseName}`;

    // Generate Cursor command file
    const cursorPath = path.join(targetPath, '.cursor', 'commands', `${prefixedName}.md`);
    await fs.ensureDir(path.dirname(cursorPath));
    await fs.writeFile(cursorPath, generateCursorCommand(content), 'utf-8');
    console.log(`  → .cursor/commands/${prefixedName}.md`);

    // Generate VSCode prompt file
    const vscodePath = path.join(targetPath, '.github', 'prompts', `${prefixedName}.prompt.md`);
    await fs.ensureDir(path.dirname(vscodePath));
    await fs.writeFile(vscodePath, generateVSCodePrompt(content, baseName), 'utf-8');
    console.log(`  → .github/prompts/${prefixedName}.prompt.md`);

    // Generate Claude Code command file
    const claudePath = path.join(targetPath, '.claude', 'commands', `${prefixedName}.md`);
    await fs.ensureDir(path.dirname(claudePath));
    await fs.writeFile(claudePath, generateClaudeCodeCommand(content, baseName), 'utf-8');
    console.log(`  → .claude/commands/${prefixedName}.md`);
  }
};

/**
 * Find all rule files in rules/ directory and group by target path
 * Returns: Map<targetPath, Map<stackName, content>>
 *
 * Example: rules/src/components/vue-bootstrap.md
 *   → targetPath: "src/components"
 *   → stackName: "vue-bootstrap"
 */
const findRuleFiles = async (rulesDir: string): Promise<Map<string, Map<string, string>>> => {
  const rulesByPath = new Map<string, Map<string, string>>();

  if (!(await fs.pathExists(rulesDir))) {
    return rulesByPath;
  }

  const matches = await glob('**/*.md', { cwd: rulesDir });

  for (const match of matches) {
    const fullPath = path.join(rulesDir, match);
    const raw = await fs.readFile(fullPath, 'utf-8');

    // Strip frontmatter — only the body content goes into AGENTS.md
    const parsed = matter(raw);
    const content = parsed.content.trim() ? parsed.content : raw;

    // Extract target path (directory) and stack name (filename without .md)
    const dirPath = path.dirname(match);
    const targetPath = dirPath === '.' ? '' : dirPath;
    const stackName = path.basename(match, '.md');

    // Group by target path
    if (!rulesByPath.has(targetPath)) {
      rulesByPath.set(targetPath, new Map());
    }
    rulesByPath.get(targetPath)!.set(stackName, content);
  }

  return rulesByPath;
};

/**
 * Sync Agent Skills to target project.
 * Copies entire skill directories (SKILL.md + scripts/ + references/ + assets/)
 * to .claude/skills/<skill-name>/ in the consuming project.
 */
export const syncSkills = async (
  rulekitRoot: string,
  targetPath: string,
  _stack: string
): Promise<void> => {
  const skillsDir = path.join(rulekitRoot, 'skills');

  if (!(await fs.pathExists(skillsDir))) {
    return;
  }

  const entries = await fs.readdir(skillsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const skillSource = path.join(skillsDir, entry.name);
    const skillMd = path.join(skillSource, 'SKILL.md');

    // Only sync directories that contain a SKILL.md
    if (!(await fs.pathExists(skillMd))) continue;

    const targetSkillDir = path.join(targetPath, '.claude', 'skills', entry.name);
    await fs.copy(skillSource, targetSkillDir, { overwrite: true });
    console.log(`  → .claude/skills/${entry.name}/`);
  }
};

/**
 * Merge common and stack-specific content
 */
const mergeContent = (commonContent: string, stackContent: string): string => {
  if (!commonContent && !stackContent) return '';
  if (!commonContent) return stackContent;
  if (!stackContent) return commonContent;

  // Add separator between common and stack content
  return `${commonContent.trim()}\n\n---\n\n${stackContent.trim()}\n`;
};

