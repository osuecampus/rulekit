import matter from 'gray-matter';

/**
 * Generate a Claude Code command file from prompt content.
 * Claude Code commands are .md files in .claude/commands/ with optional YAML frontmatter.
 * Supported frontmatter fields: allowed-tools, argument-hint, description, model
 * @param content - The prompt content (with optional frontmatter)
 * @param name - Name used as fallback description if no frontmatter description or heading exists
 */
export const generateClaudeCodeCommand = (content: string, name: string): string => {
  const parsed = matter(content);

  // Extract description from first heading if not in frontmatter
  // Fall back to name if neither frontmatter nor heading provides a description
  let description: string | undefined;
  const lines = parsed.content.trim().split('\n');
  if (lines[0]?.startsWith('# ')) {
    description = lines[0].replace('# ', '').trim();
  } else if (!parsed.data.description) {
    description = name;
  }

  // Build Claude Code frontmatter — only include meaningful fields
  const claudeFrontmatter: Record<string, string> = {};

  if (parsed.data['allowed-tools']) {
    claudeFrontmatter['allowed-tools'] = parsed.data['allowed-tools'];
  }
  if (parsed.data['argument-hint']) {
    claudeFrontmatter['argument-hint'] = parsed.data['argument-hint'];
  }
  if (parsed.data.description || description) {
    claudeFrontmatter.description = parsed.data.description || description;
  }
  if (parsed.data.model) {
    claudeFrontmatter.model = parsed.data.model;
  }

  // Only emit frontmatter if there's meaningful metadata
  if (Object.keys(claudeFrontmatter).length > 0) {
    return matter.stringify(parsed.content, claudeFrontmatter);
  }

  // No frontmatter needed — return content as-is
  return parsed.content;
};
