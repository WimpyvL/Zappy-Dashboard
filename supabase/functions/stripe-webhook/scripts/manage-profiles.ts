#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { program } from 'commander';
import chalk from 'chalk';
import { merge } from 'lodash';
import { dump as dumpYaml, load as loadYaml } from 'js-yaml';

program
  .name('manage-profiles')
  .description('Manage documentation configuration profiles')
  .option('-c, --create <name>', 'Create new profile')
  .option('-d, --delete <name>', 'Delete profile')
  .option('-s, --switch <name>', 'Switch to profile')
  .option('-l, --list', 'List profiles')
  .option('-e, --export <name>', 'Export profile')
  .option('-i, --import <path>', 'Import profile')
  .option('-m, --merge <name>', 'Merge profile with current')
  .parse(process.argv);

const options = program.opts();

interface Profile {
  name: string;
  description: string;
  created: string;
  updated: string;
  config: any;
}

const PROFILES_DIR = resolve(__dirname, 'profiles');

async function manageProfiles() {
  try {
    if (options.list) {
      listProfiles();
      return;
    }

    if (options.create) {
      await createProfile(options.create);
      return;
    }

    if (options.delete) {
      await deleteProfile(options.delete);
      return;
    }

    if (options.switch) {
      await switchProfile(options.switch);
      return;
    }

    if (options.export) {
      await exportProfile(options.export);
      return;
    }

    if (options.import) {
      await importProfile(options.import);
      return;
    }

    if (options.merge) {
      await mergeProfile(options.merge);
      return;
    }

    program.help();
  } catch (error) {
    console.error(chalk.red('\n❌ Profile management failed:'), error);
    process.exit(1);
  }
}

function loadProfile(name: string): Profile {
  const path = resolve(PROFILES_DIR, `${name}.yml`);
  try {
    return loadYaml(readFileSync(path, 'utf-8')) as Profile;
  } catch (error) {
    throw new Error(`Failed to load profile ${name}: ${error.message}`);
  }
}

function saveProfile(profile: Profile): void {
  const path = resolve(PROFILES_DIR, `${profile.name}.yml`);
  try {
    writeFileSync(path, dumpYaml(profile));
  } catch (error) {
    throw new Error(`Failed to save profile ${profile.name}: ${error.message}`);
  }
}

async function createProfile(name: string): Promise<void> {
  console.log(chalk.blue(`\n📝 Creating profile ${name}...`));

  if (profileExists(name)) {
    throw new Error(`Profile ${name} already exists`);
  }

  // Read current config
  const config = loadYaml(readFileSync(resolve(__dirname, 'docs.config.ts'), 'utf-8'));

  // Create profile
  const profile: Profile = {
    name,
    description: `Documentation profile: ${name}`,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    config,
  };

  // Save profile
  saveProfile(profile);
  console.log(chalk.green(`\n✅ Profile ${name} created`));
}

async function deleteProfile(name: string): Promise<void> {
  console.log(chalk.blue(`\n🗑️ Deleting profile ${name}...`));

  if (!profileExists(name)) {
    throw new Error(`Profile ${name} not found`);
  }

  const path = resolve(PROFILES_DIR, `${name}.yml`);
  try {
    unlinkSync(path);
    console.log(chalk.green(`\n✅ Profile ${name} deleted`));
  } catch (error) {
    throw new Error(`Failed to delete profile ${name}: ${error.message}`);
  }
}

async function switchProfile(name: string): Promise<void> {
  console.log(chalk.blue(`\n🔄 Switching to profile ${name}...`));

  const profile = loadProfile(name);
  
  // Backup current config
  const backupPath = resolve(__dirname, 'docs.config.backup.ts');
  copyFileSync(resolve(__dirname, 'docs.config.ts'), backupPath);

  try {
    // Update config
    writeFileSync(
      resolve(__dirname, 'docs.config.ts'),
      `export const config = ${JSON.stringify(profile.config, null, 2)};`
    );

    console.log(chalk.green(`\n✅ Switched to profile ${name}`));
    console.log(chalk.yellow('ℹ️ Backup saved to docs.config.backup.ts'));
  } catch (error) {
    // Restore backup
    copyFileSync(backupPath, resolve(__dirname, 'docs.config.ts'));
    throw new Error(`Failed to switch profile: ${error.message}`);
  }
}

async function exportProfile(name: string): Promise<void> {
  console.log(chalk.blue(`\n📤 Exporting profile ${name}...`));

  const profile = loadProfile(name);
  const exportPath = resolve(process.cwd(), `${name}-profile.yml`);

  try {
    writeFileSync(exportPath, dumpYaml(profile));
    console.log(chalk.green(`\n✅ Profile exported to ${exportPath}`));
  } catch (error) {
    throw new Error(`Failed to export profile: ${error.message}`);
  }
}

async function importProfile(path: string): Promise<void> {
  console.log(chalk.blue('\n📥 Importing profile...'));

  try {
    const profile = loadYaml(readFileSync(path, 'utf-8')) as Profile;
    
    if (profileExists(profile.name)) {
      throw new Error(`Profile ${profile.name} already exists`);
    }

    profile.updated = new Date().toISOString();
    saveProfile(profile);

    console.log(chalk.green(`\n✅ Profile ${profile.name} imported`));
  } catch (error) {
    throw new Error(`Failed to import profile: ${error.message}`);
  }
}

async function mergeProfile(name: string): Promise<void> {
  console.log(chalk.blue(`\n🔄 Merging profile ${name}...`));

  const profile = loadProfile(name);
  const currentConfig = loadYaml(readFileSync(resolve(__dirname, 'docs.config.ts'), 'utf-8'));

  try {
    // Merge configs
    const mergedConfig = merge({}, currentConfig, profile.config);

    // Update config
    writeFileSync(
      resolve(__dirname, 'docs.config.ts'),
      `export const config = ${JSON.stringify(mergedConfig, null, 2)};`
    );

    console.log(chalk.green(`\n✅ Merged profile ${name}`));
  } catch (error) {
    throw new Error(`Failed to merge profile: ${error.message}`);
  }
}

function listProfiles(): void {
  console.log(chalk.blue('\n📚 Documentation Profiles\n'));

  const profiles = readdirSync(PROFILES_DIR)
    .filter(file => file.endsWith('.yml'))
    .map(file => loadProfile(file.replace('.yml', '')));

  profiles.forEach(profile => {
    console.log(chalk.bold(profile.name));
    console.log(`Description: ${profile.description}`);
    console.log(`Created: ${new Date(profile.created).toLocaleDateString()}`);
    console.log(`Updated: ${new Date(profile.updated).toLocaleDateString()}`);
    console.log();
  });
}

function profileExists(name: string): boolean {
  return existsSync(resolve(PROFILES_DIR, `${name}.yml`));
}

// Run profile management
manageProfiles().catch((error) => {
  console.error(chalk.red('💥 Fatal error:'), error);
  process.exit(1);
});