import matter from 'gray-matter';
/**
 * Generate a VSCode prompt file from prompt content
 * VSCode prompts use .prompt.md extension with YAML frontmatter
 */
export const generateVSCodePrompt = (content, name) => {
    // Check if content already has frontmatter
    const parsed = matter(content);
    // Extract first line as description if it's a heading
    let description = name;
    const lines = parsed.content.trim().split('\n');
    if (lines[0]?.startsWith('# ')) {
        description = lines[0].replace('# ', '').trim();
    }
    // Build frontmatter
    const frontmatter = {
        name: `rulekit-${name}`,
        description,
        agent: 'agent',
        ...parsed.data, // Preserve any existing frontmatter
    };
    // Reconstruct with VSCode-compatible frontmatter
    return matter.stringify(parsed.content, frontmatter);
};
