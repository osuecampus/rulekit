#!/usr/bin/env node
import { Command } from 'commander';
import { syncRules, syncPrompts } from './sync.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name('rulekit')
  .description('Sync shared AGENTS.md rules and prompt files into target projects')
  .version('0.1.0');

program
  .command('sync')
  .description('Sync rules and prompts to a target project')
  .option('-s, --stack <name>', 'Tech stack to use (vue, nuxt, common)', 'common')
  .option('-t, --target <path>', 'Target project directory', process.cwd())
  .option('--prompts-only', 'Only sync prompt files')
  .option('--rules-only', 'Only sync AGENTS.md files')
  .action(async (options) => {
    const { stack, target, promptsOnly, rulesOnly } = options;
    const targetPath = path.resolve(target);
    const rulekitRoot = path.resolve(__dirname, '..');

    console.log(`Syncing to: ${targetPath}`);
    console.log(`Stack: ${stack}`);

    try {
      if (!promptsOnly) {
        await syncRules(rulekitRoot, targetPath, stack);
        console.log('✓ Rules synced');
      }

      if (!rulesOnly) {
        await syncPrompts(rulekitRoot, targetPath, stack);
        console.log('✓ Prompts synced');
      }

      console.log('\nSync complete!');
    } catch (error) {
      console.error('Error during sync:', error);
      process.exit(1);
    }
  });

program.parse();

