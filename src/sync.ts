import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import { generateCursorCommand } from './promptfile-generators/cursor.js';
import { generateVSCodePrompt } from './promptfile-generators/vscode.js';

/**
 * Sync AGENTS.md rules from common + stack directories to target project
 */
export const syncRules = async (
  rulekitRoot: string,
  targetPath: string,
  stack: string
): Promise<void> => {
  const commonDir = path.join(rulekitRoot, 'stacks', 'common');
  const stackDir = path.join(rulekitRoot, 'stacks', stack);

  // Collect all AGENTS.md files from common
  const commonFiles = await findAgentsMdFiles(commonDir);

  // Collect all AGENTS.md files from stack (if not 'common')
  const stackFiles = stack !== 'common' ? await findAgentsMdFiles(stackDir) : new Map();

  // Merge and get all unique relative paths
  const allPaths = new Set([...commonFiles.keys(), ...stackFiles.keys()]);

  for (const relativePath of allPaths) {
    const commonContent = commonFiles.get(relativePath) || '';
    const stackContent = stackFiles.get(relativePath) || '';

    // Merge: common content first, then stack-specific content
    const mergedContent = mergeContent(commonContent, stackContent);

    // Write to target
    const targetFile = path.join(targetPath, relativePath);
    await fs.ensureDir(path.dirname(targetFile));
    await fs.writeFile(targetFile, mergedContent, 'utf-8');
    console.log(`  → ${relativePath}`);
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
  }
};

/**
 * Find all AGENTS.md files in a directory and return map of relative path -> content
 */
const findAgentsMdFiles = async (dir: string): Promise<Map<string, string>> => {
  const files = new Map<string, string>();

  if (!(await fs.pathExists(dir))) {
    return files;
  }

  const matches = await glob('**/AGENTS.md', { cwd: dir });

  for (const match of matches) {
    const fullPath = path.join(dir, match);
    const content = await fs.readFile(fullPath, 'utf-8');
    files.set(match, content);
  }

  return files;
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

