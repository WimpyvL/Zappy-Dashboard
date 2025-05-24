#!/usr/bin/env node
import { mkdirSync, writeFileSync, copyFileSync } from 'fs';
import { resolve, join } from 'path';
import { program } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { config } from './docs.config';

program
  .name('init-docs')
  .description('Initialize documentation environment')
  .option('-f, --force', 'Override existing files', false)
  .option('--skip-install', 'Skip dependency installation', false)
  .option('--skip-git', 'Skip Git initialization', false)
  .parse(process.argv);

const options = program.opts();

interface InitResult {
  directories: string[];
  files: string[];
  dependencies: boolean;
  git: boolean;
}

async function initDocs(): Promise<void> {
  try {
    console.log(chalk.blue('\n🚀 Initializing documentation environment...'));

    const result: InitResult = {
      directories: [],
      files: [],
      dependencies: false,
      git: false,
    };

    // Create directory structure
    await createDirectories(result);

    // Create initial files
    await createFiles(result);

    // Install dependencies
    if (!options.skipInstall) {
      await installDependencies(result);
    }

    // Initialize Git
    if (!options.skipGit) {
      await initializeGit(result);
    }

    // Report results
    logResults(result);

  } catch (error) {
    console.error(chalk.red('\n❌ Initialization failed:'), error);
    process.exit(1);
  }
}

async function createDirectories(result: InitResult): Promise<void> {
  console.log(chalk.blue('\n📁 Creating directories...'));

  const directories = [
    config.paths.docs,
    config.paths.templates.path,
    config.paths.templates.data,
    config.paths.templates.helpers,
    config.paths.output.typedoc,
    join(config.paths.docs, 'api'),
    join(config.paths.docs, 'examples'),
    join(config.paths.docs, 'guides'),
    join(config.paths.docs, 'assets'),
    'schemas',
    '__tests__',
    '__tests__/__fixtures__',
  ];

  directories.forEach(dir => {
    const path = resolve(dir);
    mkdirSync(path, { recursive: true });
    result.directories.push(dir);
    console.log(chalk.green(`✓ Created ${dir}`));
  });
}

async function createFiles(result: InitResult): Promise<void> {
  console.log(chalk.blue('\n📝 Creating files...'));

  // Documentation index
  const indexPath = join(config.paths.docs, 'index.md');
  if (!fileExists(indexPath) || options.force) {
    writeFileSync(indexPath, createIndexContent());
    result.files.push(indexPath);
  }

  // README
  const readmePath = join(config.paths.docs, 'README.md');
  if (!fileExists(readmePath) || options.force) {
    writeFileSync(readmePath, createReadmeContent());
    result.files.push(readmePath);
  }

  // Copy default theme
  const themePath = resolve('templates/themes/default.yml');
  if (!fileExists(themePath) || options.force) {
    copyFileSync(
      resolve(__dirname, 'templates/themes/default.yml'),
      themePath
    );
    result.files.push(themePath);
  }

  // Create .gitignore
  const gitignorePath = resolve('.gitignore');
  if (!fileExists(gitignorePath) || options.force) {
    writeFileSync(gitignorePath, createGitignore());
    result.files.push(gitignorePath);
  }

  // Create theme config
  const themeConfigPath = resolve('templates/themes/config.yml');
  if (!fileExists(themeConfigPath) || options.force) {
    writeFileSync(themeConfigPath, createThemeConfig());
    result.files.push(themeConfigPath);
  }

  // Create search index
  const searchIndexPath = join(config.paths.docs, 'search-index.json');
  if (!fileExists(searchIndexPath) || options.force) {
    writeFileSync(searchIndexPath, '{}');
    result.files.push(searchIndexPath);
  }

  console.log(chalk.green(`✓ Created ${result.files.length} files`));
}

async function installDependencies(result: InitResult): Promise<void> {
  console.log(chalk.blue('\n📦 Installing dependencies...'));

  try {
    execSync('npm install', { stdio: 'inherit' });
    result.dependencies = true;
    console.log(chalk.green('✓ Dependencies installed'));
  } catch (error) {
    console.warn(chalk.yellow('⚠️ Failed to install dependencies'));
    throw error;
  }
}

async function initializeGit(result: InitResult): Promise<void> {
  console.log(chalk.blue('\n🔄 Initializing Git...'));

  try {
    execSync('git init', { stdio: 'inherit' });
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "docs: initial documentation setup"', { stdio: 'inherit' });
    result.git = true;
    console.log(chalk.green('✓ Git initialized'));
  } catch (error) {
    console.warn(chalk.yellow('⚠️ Failed to initialize Git'));
    throw error;
  }
}

function fileExists(path: string): boolean {
  try {
    return fs.existsSync(path);
  } catch {
    return false;
  }
}

function createIndexContent(): string {
  return `# ${config.project.name} Documentation

${config.project.description}

## Getting Started

- [Installation](guides/installation.md)
- [Quick Start](guides/quick-start.md)
- [Examples](examples/index.md)

## API Reference

- [API Overview](api/index.md)
- [Webhooks](api/webhooks.md)
- [Types](api/types.md)

## Resources

- [GitHub Repository](${config.project.repository})
- [License](${config.project.license})
`;
}

function createReadmeContent(): string {
  return `# Documentation

This directory contains the documentation for ${config.project.name}.

## Structure

- \`/api\` - API reference documentation
- \`/examples\` - Code examples and tutorials
- \`/guides\` - User guides and how-tos
- \`/assets\` - Images and other assets

## Contributing

Please see [CONTRIBUTING.md](../CONTRIBUTING.md) for documentation guidelines.

## License

${config.project.license} - see [LICENSE](../LICENSE)
`;
}

function createGitignore(): string {
  return `# Dependencies
node_modules/

# Build output
dist/
build/

# Coverage reports
coverage/

# Generated files
*.generated.*
search-index.json

# Environment variables
.env
.env.*

# IDE files
.idea/
.vscode/
*.swp
`;
}

function createThemeConfig(): string {
  return `# Theme Configuration
name: default
version: 1.0.0
author: ${config.project.author.name}

# Theme Settings
colors:
  primary: '#3ECF8E'
  text: '#1F2937'
  background: '#FFFFFF'

typography:
  font-family: system-ui, -apple-system, sans-serif
  font-size: 16px
  line-height: 1.6

layout:
  max-width: 1200px
  sidebar-width: 280px
`;
}

function logResults(result: InitResult): void {
  console.log(chalk.blue('\n📊 Initialization Results:\n'));
  
  console.log('Directories created:');
  result.directories.forEach(dir => {
    console.log(chalk.green(`  ✓ ${dir}`));
  });

  console.log('\nFiles created:');
  result.files.forEach(file => {
    console.log(chalk.green(`  ✓ ${file}`));
  });

  console.log('\nStatus:');
  console.log(chalk.green(`  ✓ Dependencies: ${result.dependencies ? 'Installed' : 'Skipped'}`));
  console.log(chalk.green(`  ✓ Git: ${result.git ? 'Initialized' : 'Skipped'}`));

  console.log(chalk.blue('\n✨ Documentation environment initialized!\n'));
}

// Run initialization
initDocs().catch((error) => {
  console.error(chalk.red('💥 Fatal error:'), error);
  process.exit(1);
});