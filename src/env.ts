import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';

/**
 * Resolve the stack to use.
 * Priority: explicit --stack flag > RULEKIT_STACK in .env > AGENTS.md frontmatter > 'common' default
 */
export const resolveStack = async (
  explicitStack: string | undefined,
  targetPath: string
): Promise<string> => {
  if (explicitStack) {
    return explicitStack;
  }

  const envStack = await readStackFromEnv(targetPath);
  if (envStack) {
    return envStack;
  }

  const agentsStack = await readStackFromAgentsMd(targetPath);
  if (agentsStack) {
    return agentsStack;
  }

  return 'common';
};

/**
 * Read RULEKIT_STACK from target project's .env file.
 * Simple regex parse — no dotenv dependency needed.
 */
const readStackFromEnv = async (targetPath: string): Promise<string | undefined> => {
  const envPath = path.join(targetPath, '.env');

  if (!(await fs.pathExists(envPath))) {
    return undefined;
  }

  const content = await fs.readFile(envPath, 'utf-8');
  const match = content.match(/^RULEKIT_STACK\s*=\s*(.+)$/m);

  if (!match) {
    return undefined;
  }

  // Strip quotes and whitespace
  return match[1].trim().replace(/^["']|["']$/g, '');
};

/**
 * Read the stack from the frontmatter of the target project's AGENTS.md.
 *
 * syncRules writes the resolved stack into AGENTS.md frontmatter. This helper
 * simply parses that frontmatter and, if a non-"common" string `stack` field
 * is present, returns it to be used as the inferred stack.
 */
const readStackFromAgentsMd = async (targetPath: string): Promise<string | undefined> => {
  const agentsPath = path.join(targetPath, 'AGENTS.md');

  if (!(await fs.pathExists(agentsPath))) {
    return undefined;
  }

  const content = await fs.readFile(agentsPath, 'utf-8');
  const parsed = matter(content);

  const stack = parsed.data?.stack;
  if (stack && typeof stack === 'string' && stack !== 'common') {
    return stack;
  }

  return undefined;
};
