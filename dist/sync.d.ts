/**
 * Sync AGENTS.md rules from common + stack directories to target project
 */
export declare const syncRules: (rulekitRoot: string, targetPath: string, stack: string) => Promise<void>;
/**
 * Sync prompt files to target project in both Cursor and VSCode formats
 */
export declare const syncPrompts: (rulekitRoot: string, targetPath: string, stack: string) => Promise<void>;
