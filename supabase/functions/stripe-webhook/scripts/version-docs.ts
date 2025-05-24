#!/usr/bin/env node
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';
import { program } from 'commander';
import chalk from 'chalk';
import semver from 'semver';
import { config } from './docs.config';

program
  .name('version-docs')
  .description('Manage documentation versions')
  .option('-b, --bump <type>', 'Bump version (major|minor|patch)', 'patch')
  .option('-t, --tag <version>', 'Create specific version')
  .option('-l, --list', 'List versions')
  .option('-d, --delete <version>', 'Delete version')
  .option('-r, --rollback', 'Rollback to previous version')
  .option('--latest', 'Set version as latest')
  .parse(process.argv);

const options = program.opts();

interface Version {
  version: string;
  date: string;
  latest: boolean;
  changes: string[];
}

interface Versions {
  current: string;
  versions: Version[];
}

async function manageVersions() {
  try {
    // Load version data
    const versions = loadVersions();

    if (options.list) {
      listVersions(versions);
      return;
    }

    if (options.delete) {
      await deleteVersion(versions, options.delete);
      return;
    }

    if (options.rollback) {
      await rollbackVersion(versions);
      return;
    }

    // Create new version
    const version = options.tag || getNextVersion(versions.current, options.bump);
    await createVersion(versions, version);

  } catch (error) {
    console.error(chalk.red('\n❌ Version management failed:'), error);
    process.exit(1);
  }
}

function loadVersions(): Versions {
  try {
    const path = resolve(config.paths.docs, 'versions.json');
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return {
      current: '1.0.0',
      versions: [],
    };
  }
}

function saveVersions(versions: Versions): void {
  const path = resolve(config.paths.docs, 'versions.json');
  writeFileSync(path, JSON.stringify(versions, null, 2));
}

function getNextVersion(current: string, bump: string): string {
  if (!semver.valid(current)) {
    throw new Error(`Invalid version: ${current}`);
  }

  switch (bump) {
    case 'major':
      return semver.inc(current, 'major') || '1.0.0';
    case 'minor':
      return semver.inc(current, 'minor') || '0.1.0';
    case 'patch':
      return semver.inc(current, 'patch') || '0.0.1';
    default:
      throw new Error(`Invalid bump type: ${bump}`);
  }
}

async function createVersion(versions: Versions, version: string): Promise<void> {
  console.log(chalk.blue(`\n📝 Creating version ${version}...`));

  // Validate version
  if (!semver.valid(version)) {
    throw new Error(`Invalid version: ${version}`);
  }

  if (versions.versions.find(v => v.version === version)) {
    throw new Error(`Version ${version} already exists`);
  }

  // Create version directory
  const versionDir = resolve(config.paths.docs, 'versions', version);
  mkdirSync(versionDir, { recursive: true });

  // Generate documentation
  execSync('npm run docs:generate', { stdio: 'inherit' });

  // Copy current docs to version directory
  copyDocs(config.paths.docs, versionDir);

  // Update versions
  const changes = getChanges();
  versions.versions.push({
    version,
    date: new Date().toISOString(),
    latest: options.latest || versions.versions.length === 0,
    changes,
  });

  versions.current = version;
  if (options.latest) {
    versions.versions.forEach(v => v.latest = v.version === version);
  }

  // Save versions
  saveVersions(versions);

  // Update version links
  updateVersionLinks(versions);

  console.log(chalk.green(`\n✅ Version ${version} created`));
}

function copyDocs(source: string, dest: string): void {
  const exclude = ['versions', 'version.json'];
  
  execSync(`rsync -av --exclude=${exclude.join(' --exclude=')} ${source}/ ${dest}/`);
}

function getChanges(): string[] {
  try {
    const lastTag = execSync('git describe --tags --abbrev=0').toString().trim();
    const log = execSync(`git log ${lastTag}..HEAD --pretty=format:"%s"`).toString();
    
    return log
      .split('\n')
      .filter(msg => msg.startsWith('docs:'))
      .map(msg => msg.replace('docs:', '').trim());
  } catch {
    return ['Initial version'];
  }
}

function updateVersionLinks(versions: Versions): void {
  const latest = versions.versions.find(v => v.latest);
  if (!latest) return;

  const versionList = versions.versions
    .sort((a, b) => semver.compare(b.version, a.version))
    .map(v => ({
      version: v.version,
      path: v.latest ? '/' : `/versions/${v.version}`,
      latest: v.latest,
    }));

  // Create version selector
  const selector = {
    versions: versionList,
    current: latest.version,
  };

  writeFileSync(
    resolve(config.paths.docs, 'versions.js'),
    `window.$versions = ${JSON.stringify(selector, null, 2)};`
  );
}

async function deleteVersion(versions: Versions, version: string): Promise<void> {
  console.log(chalk.blue(`\n🗑️ Deleting version ${version}...`));

  const versionInfo = versions.versions.find(v => v.version === version);
  if (!versionInfo) {
    throw new Error(`Version ${version} not found`);
  }

  if (versionInfo.latest) {
    throw new Error('Cannot delete latest version');
  }

  // Remove version directory
  execSync(`rm -rf ${resolve(config.paths.docs, 'versions', version)}`);

  // Update versions
  versions.versions = versions.versions.filter(v => v.version !== version);
  saveVersions(versions);

  // Update version links
  updateVersionLinks(versions);

  console.log(chalk.green(`\n✅ Version ${version} deleted`));
}

async function rollbackVersion(versions: Versions): Promise<void> {
  console.log(chalk.blue('\n⏮️ Rolling back version...'));

  if (versions.versions.length < 2) {
    throw new Error('No version to rollback to');
  }

  // Sort versions by date
  const sorted = versions.versions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const current = sorted[0];
  const previous = sorted[1];

  // Restore previous version
  const source = resolve(config.paths.docs, 'versions', previous.version);
  copyDocs(source, config.paths.docs);

  // Update versions
  versions.current = previous.version;
  versions.versions = versions.versions.filter(v => v.version !== current.version);
  saveVersions(versions);

  // Update version links
  updateVersionLinks(versions);

  console.log(chalk.green(`\n✅ Rolled back to version ${previous.version}`));
}

function listVersions(versions: Versions): void {
  console.log(chalk.blue('\n📚 Documentation Versions\n'));
  
  versions.versions
    .sort((a, b) => semver.compare(b.version, a.version))
    .forEach(v => {
      const latest = v.latest ? chalk.green(' (latest)') : '';
      const date = new Date(v.date).toLocaleDateString();
      console.log(chalk.bold(`${v.version}${latest}`));
      console.log(`Released: ${date}`);
      if (v.changes.length > 0) {
        console.log('Changes:');
        v.changes.forEach(c => console.log(`  - ${c}`));
      }
      console.log();
    });
}

// Run version management
manageVersions().catch((error) => {
  console.error(chalk.red('💥 Fatal error:'), error);
  process.exit(1);
});