import { describe, it, expect } from 'vitest';
import matter from 'gray-matter';
import { generateCursorCommand } from '../promptfile-generators/cursor.js';
import { generateVSCodePrompt } from '../promptfile-generators/vscode.js';
import { generateClaudeCodeCommand } from '../promptfile-generators/claude-code.js';

describe('generateCursorCommand', () => {
  it('passes content through unchanged', () => {
    const content = '# My Prompt\n\nDo something useful.';
    expect(generateCursorCommand(content)).toBe(content);
  });
});

describe('generateVSCodePrompt', () => {
  it('adds VSCode frontmatter with name, description, and agent', () => {
    const content = '# My Prompt\n\nDo something useful.';
    const result = generateVSCodePrompt(content, 'my-prompt');
    const parsed = matter(result);

    expect(parsed.data.name).toBe('rulekit-my-prompt');
    expect(parsed.data.description).toBe('My Prompt');
    expect(parsed.data.agent).toBe('agent');
  });

  it('extracts description from first heading', () => {
    const content = '# Generate Tests\n\nWrite unit tests for all functions.';
    const result = generateVSCodePrompt(content, 'gen-tests');
    const parsed = matter(result);

    expect(parsed.data.description).toBe('Generate Tests');
  });

  it('falls back to name when no heading', () => {
    const content = 'Do something without a heading.';
    const result = generateVSCodePrompt(content, 'no-heading');
    const parsed = matter(result);

    expect(parsed.data.description).toBe('no-heading');
  });

  it('preserves existing frontmatter fields', () => {
    const content = '---\ncustom: value\n---\n# My Prompt\n\nBody text.';
    const result = generateVSCodePrompt(content, 'test');
    const parsed = matter(result);

    expect(parsed.data.custom).toBe('value');
    expect(parsed.data.name).toBe('rulekit-test');
  });
});

describe('generateClaudeCodeCommand', () => {
  it('adds description frontmatter from heading', () => {
    const content = '# Deploy Helper\n\nHelp deploy the app.';
    const result = generateClaudeCodeCommand(content, 'deploy');
    const parsed = matter(result);

    expect(parsed.data.description).toBe('Deploy Helper');
  });

  it('returns content without frontmatter when no heading and no metadata', () => {
    const content = 'Just plain instructions with no heading.';
    const result = generateClaudeCodeCommand(content, 'plain');

    // Should not have frontmatter markers
    expect(result).not.toMatch(/^---/);
    expect(result).toContain('Just plain instructions');
  });

  it('preserves allowed-tools from source frontmatter', () => {
    const content = '---\nallowed-tools: Read, Write, Bash\n---\n# My Command\n\nDo stuff.';
    const result = generateClaudeCodeCommand(content, 'tools-test');
    const parsed = matter(result);

    expect(parsed.data['allowed-tools']).toBe('Read, Write, Bash');
    expect(parsed.data.description).toBe('My Command');
  });

  it('preserves model from source frontmatter', () => {
    const content = '---\nmodel: sonnet\n---\n# Fast Command\n\nQuick task.';
    const result = generateClaudeCodeCommand(content, 'fast');
    const parsed = matter(result);

    expect(parsed.data.model).toBe('sonnet');
  });

  it('prefers frontmatter description over heading', () => {
    const content = '---\ndescription: Custom description\n---\n# Heading\n\nBody.';
    const result = generateClaudeCodeCommand(content, 'custom');
    const parsed = matter(result);

    expect(parsed.data.description).toBe('Custom description');
  });

});
