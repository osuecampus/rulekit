#!/usr/bin/env node
import { Command } from 'commander';
import { syncRules, syncPrompts, syncSkills } from './sync.js';
import { pushChanges } from './push.js';
import { resolveStack } from './env.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name('rulekit')
  .description('Sync shared AGENTS.md rules, prompt files, and Agent Skills into target projects')
  .version('0.1.0');

program
  .command('sync')
  .description('Sync rules, prompts, and skills to a target project')
  .option('-s, --stack <name>', 'Tech stack to use (auto-detects from .env if not specified)')
  .option('-t, --target <path>', 'Target project directory', process.cwd())
  .option('--prompts-only', 'Only sync prompt files')
  .option('--rules-only', 'Only sync AGENTS.md files')
  .option('--skills-only', 'Only sync Agent Skills')
  .action(async (options) => {
    const { target, promptsOnly, rulesOnly, skillsOnly } = options;
    const targetPath = path.resolve(target);
    const rulekitRoot = path.resolve(__dirname, '..');

    const stack = await resolveStack(options.stack, targetPath);
    const autoDetected = !options.stack && stack !== 'common';

    console.log(`Syncing to: ${targetPath}`);
    console.log(`Stack: ${stack}${autoDetected ? ' (auto-detected)' : ''}`);

    const exclusive = promptsOnly || rulesOnly || skillsOnly;

    try {
      if (!exclusive || rulesOnly) {
        await syncRules(rulekitRoot, targetPath, stack);
        console.log('✓ Rules synced');
      }

      if (!exclusive || promptsOnly) {
        await syncPrompts(rulekitRoot, targetPath, stack);
        console.log('✓ Prompts synced');
      }

      if (!exclusive || skillsOnly) {
        await syncSkills(rulekitRoot, targetPath, stack);
        console.log('✓ Skills synced');
      }

      console.log('\nSync complete!');
    } catch (error) {
      console.error('Error during sync:', error);
      process.exit(1);
    }
  });

program
  .command('push')
  .description('Push local changes back to the rulekit repo via pull request')
  .option('-s, --stack <name>', 'Tech stack (auto-detects from .env if not specified)')
  .option('-t, --target <path>', 'Source project directory', process.cwd())
  .option('--type <type>', 'What to push: rules, prompts, skills, all', 'all')
  .option('--prompt-stack <name>', 'Target stack directory for new prompts (defaults to common)')
  .option('-m, --message <msg>', 'PR description')
  .action(async (options) => {
    const { target, type, message, promptStack } = options;
    const targetPath = path.resolve(target);

    const stackExplicit = !!options.stack;
    const stack = await resolveStack(options.stack, targetPath);
    const autoDetected = !stackExplicit && stack !== 'common';

    console.log(`Pushing from: ${targetPath}`);
    console.log(`Stack: ${stack}${autoDetected ? ' (auto-detected)' : ''}`);

    try {
      await pushChanges({ targetPath, stack, type, message, stackExplicit, promptStack });
      console.log('\nPush complete!');
    } catch (error) {
      console.error('Error during push:', error);
      process.exit(1);
    }
  });

program.parse();
