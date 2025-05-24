#!/usr/bin/env node
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { program } from 'commander';
import chalk from 'chalk';
import { config } from './docs.config';
import validator from './helpers/validation';

program
  .name('publish-docs')
  .description('Publish documentation updates')
  .option('-b, --branch <name>', 'Target branch', 'main')
  .option('-m, --message <text>', 'Commit message', 'docs: update documentation')
  .option('-t, --tag <version>', 'Version tag')
  .option('-d, --dry-run', 'Validate without publishing', false)
  .parse(process.argv);

const options = program.opts();

interface PublishResult {
  success: boolean;
  version: string;
  changes: string[];
  errors: string[];
}

async function publishDocs(): Promise<void> {
  console.log(chalk.blue('🚀 Starting documentation publication...'));

  try {
    // Generate docs
    await generateDocs();

    // Validate docs
    await validateDocs();

    // Check changes
    const changes = getDocChanges();
    if (changes.length === 0) {
      console.log(chalk.yellow('⚠️ No documentation changes detected'));
      return;
    }

    // Update version
    const version = updateVersion();

    // Publish if not dry run
    if (!options.dryRun) {
      await publishChanges(version, changes);
    } else {
      console.log(chalk.yellow('\n⚠️ Dry run - skipping publication'));
    }

    console.log(chalk.green('\n✅ Documentation update complete!'));
  } catch (error) {
    console.error(chalk.red('\n❌ Publication failed:'), error);
    process.exit(1);
  }
}

async function generateDocs(): Promise<void> {
  console.log(chalk.blue('\n📚 Generating documentation...'));

  try {
    execSync('npm run docs:generate', { stdio: 'inherit' });
    console.log(chalk.green('✓ Documentation generated'));
  } catch (error) {
    throw new Error('Failed to generate documentation');
  }
}

async function validateDocs(): Promise<void> {
  console.log(chalk.blue('\n✨ Validating documentation...'));

  // Validate OpenAPI spec
  const openApiResult = await validator.validateOpenAPI(
    resolve(config.paths.output.openapi)
  );
  if (!openApiResult.valid) {
    throw new Error('OpenAPI validation failed');
  }

  // Validate markdown
  const markdownResult = await validator.validateMarkdown(
    resolve(config.paths.docs)
  );
  if (!markdownResult.valid) {
    throw new Error('Markdown validation failed');
  }

  // Validate types
  const typesResult = await validator.validateTypes(
    resolve(config.paths.output.types)
  );
  if (!typesResult.valid) {
    throw new Error('Type validation failed');
  }

  console.log(chalk.green('✓ Documentation validated'));
}

function getDocChanges(): string[] {
  console.log(chalk.blue('\n🔍 Checking for changes...'));

  try {
    const status = execSync('git status --porcelain docs/').toString();
    const changes = status
      .split('\n')
      .filter(Boolean)
      .map((line) => line.slice(3));

    console.log(chalk.green(`✓ Found ${changes.length} changes`));
    changes.forEach((change) => console.log(`  ${change}`));

    return changes;
  } catch (error) {
    throw new Error('Failed to check documentation changes');
  }
}

function updateVersion(): string {
  console.log(chalk.blue('\n📝 Updating version...'));

  const version = options.tag || getNextVersion();
  
  try {
    // Update package.json
    const pkgPath = resolve(__dirname, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    pkg.version = version;
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

    // Update version file
    writeFileSync(
      resolve(config.paths.docs, 'version.json'),
      JSON.stringify({ version, updated: new Date().toISOString() })
    );

    console.log(chalk.green(`✓ Updated to version ${version}`));
    return version;
  } catch (error) {
    throw new Error('Failed to update version');
  }
}

function getNextVersion(): string {
  try {
    const pkg = JSON.parse(
      readFileSync(resolve(__dirname, 'package.json'), 'utf-8')
    );
    const [major, minor, patch] = pkg.version.split('.').map(Number);
    return `${major}.${minor}.${patch + 1}`;
  } catch {
    return '1.0.0';
  }
}

async function publishChanges(version: string, changes: string[]): Promise<void> {
  console.log(chalk.blue('\n📤 Publishing changes...'));

  try {
    // Stage changes
    execSync('git add docs/');

    // Commit changes
    const message = `${options.message}\n\nChanges:\n${changes.map(c => `- ${c}`).join('\n')}`;
    execSync(`git commit -m "${message}"`);

    // Tag if version provided
    if (version) {
      execSync(`git tag v${version}`);
    }

    // Push to branch
    execSync(`git push origin ${options.branch}`);
    if (version) {
      execSync('git push --tags');
    }

    console.log(chalk.green('✓ Changes published'));

    // Create GitHub release if tagged
    if (version) {
      createGitHubRelease(version, changes);
    }
  } catch (error) {
    throw new Error('Failed to publish changes');
  }
}

function createGitHubRelease(version: string, changes: string[]): void {
  console.log(chalk.blue('\n📦 Creating GitHub release...'));

  try {
    const body = [
      '## Documentation Updates',
      '',
      'Changes in this release:',
      '',
      ...changes.map((change) => `- ${change}`),
    ].join('\n');

    execSync(
      `gh release create v${version} \
        --title "Documentation v${version}" \
        --notes "${body}" \
        --target ${options.branch}`
    );

    console.log(chalk.green('✓ GitHub release created'));
  } catch (error) {
    console.warn(chalk.yellow('⚠️ Failed to create GitHub release'));
  }
}

// Run publication
publishDocs().catch((error) => {
  console.error(chalk.red('💥 Fatal error:'), error);
  process.exit(1);
});