#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';
import { program } from 'commander';
import chalk from 'chalk';
import { load as loadYaml, dump as dumpYaml } from 'js-yaml';
import sass from 'sass';

program
  .name('manage-themes')
  .description('Manage documentation themes')
  .option('-c, --create <name>', 'Create new theme')
  .option('-e, --edit <name>', 'Edit theme')
  .option('-l, --list', 'List themes')
  .option('-p, --preview <name>', 'Preview theme')
  .option('-x, --export <name>', 'Export theme')
  .option('-i, --import <path>', 'Import theme')
  .parse(process.argv);

const options = program.opts();

interface Theme {
  name: string;
  description: string;
  author: string;
  version: string;
  created: string;
  updated: string;
  variables: Record<string, string>;
  templates: {
    html: string;
    pdf: string;
    epub: string;
    docx: string;
  };
  styles: {
    layout: string;
    typography: string;
    colors: string;
    components: string;
  };
}

const THEMES_DIR = resolve(__dirname, 'templates', 'themes');
const DEFAULT_THEME = 'default';

async function manageThemes() {
  try {
    // Create themes directory if needed
    mkdirSync(THEMES_DIR, { recursive: true });

    if (options.list) {
      listThemes();
      return;
    }

    if (options.create) {
      await createTheme(options.create);
      return;
    }

    if (options.edit) {
      await editTheme(options.edit);
      return;
    }

    if (options.preview) {
      await previewTheme(options.preview);
      return;
    }

    if (options.export) {
      await exportTheme(options.export);
      return;
    }

    if (options.import) {
      await importTheme(options.import);
      return;
    }

    program.help();

  } catch (error) {
    console.error(chalk.red('\n❌ Theme management failed:'), error);
    process.exit(1);
  }
}

function loadTheme(name: string): Theme {
  const path = resolve(THEMES_DIR, `${name}.yml`);
  try {
    return loadYaml(readFileSync(path, 'utf-8')) as Theme;
  } catch (error) {
    throw new Error(`Failed to load theme ${name}: ${error.message}`);
  }
}

function saveTheme(theme: Theme): void {
  const path = resolve(THEMES_DIR, `${theme.name}.yml`);
  try {
    writeFileSync(path, dumpYaml(theme));
  } catch (error) {
    throw new Error(`Failed to save theme ${theme.name}: ${error.message}`);
  }
}

async function createTheme(name: string): Promise<void> {
  console.log(chalk.blue(`\n🎨 Creating theme ${name}...`));

  if (themeExists(name)) {
    throw new Error(`Theme ${name} already exists`);
  }

  // Create base theme from default
  const defaultTheme = loadTheme(DEFAULT_THEME);
  const theme: Theme = {
    ...defaultTheme,
    name,
    description: `Documentation theme: ${name}`,
    author: process.env.USER || 'unknown',
    version: '1.0.0',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  // Save theme
  saveTheme(theme);

  // Create associated files
  createThemeFiles(theme);

  console.log(chalk.green(`\n✅ Theme ${name} created`));
}

function createThemeFiles(theme: Theme): void {
  const themeDir = resolve(THEMES_DIR, theme.name);
  mkdirSync(themeDir, { recursive: true });

  // Create template files
  Object.entries(theme.templates).forEach(([format, template]) => {
    writeFileSync(join(themeDir, `${format}.hbs`), template);
  });

  // Create style files
  Object.entries(theme.styles).forEach(([name, style]) => {
    writeFileSync(join(themeDir, `_${name}.scss`), style);
  });

  // Create main SCSS file
  const mainScss = `
    // Variables
    ${Object.entries(theme.variables)
      .map(([key, value]) => `$${key}: ${value};`)
      .join('\n')}

    // Styles
    ${Object.keys(theme.styles)
      .map((name) => `@import '${name}';`)
      .join('\n')}
  `;
  writeFileSync(join(themeDir, 'main.scss'), mainScss);
}

async function editTheme(name: string): Promise<void> {
  console.log(chalk.blue(`\n✏️ Editing theme ${name}...`));

  const theme = loadTheme(name);
  const editor = process.env.EDITOR || 'nano';

  // Create temporary file
  const tempPath = resolve(THEMES_DIR, `${name}.tmp.yml`);
  writeFileSync(tempPath, dumpYaml(theme));

  try {
    // Open editor
    await execAsync(`${editor} ${tempPath}`);

    // Load edited theme
    const editedTheme = loadYaml(readFileSync(tempPath, 'utf-8')) as Theme;
    editedTheme.updated = new Date().toISOString();

    // Save theme
    saveTheme(editedTheme);
    console.log(chalk.green(`\n✅ Theme ${name} updated`));

  } finally {
    // Clean up
    unlinkSync(tempPath);
  }
}

async function previewTheme(name: string): Promise<void> {
  console.log(chalk.blue(`\n👁️ Previewing theme ${name}...`));

  const theme = loadTheme(name);
  const previewDir = resolve(THEMES_DIR, '_preview');
  mkdirSync(previewDir, { recursive: true });

  try {
    // Compile SCSS
    const css = sass.compile(
      resolve(THEMES_DIR, theme.name, 'main.scss')
    ).css;

    // Create preview HTML
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Theme Preview: ${theme.name}</title>
          <style>${css}</style>
        </head>
        <body>
          <h1>Theme Preview: ${theme.name}</h1>
          ${generatePreviewContent()}
        </body>
      </html>
    `;

    const previewPath = resolve(previewDir, `${name}.html`);
    writeFileSync(previewPath, html);

    // Open preview
    await execAsync(`open ${previewPath}`);

  } catch (error) {
    throw new Error(`Failed to preview theme: ${error.message}`);
  }
}

function generatePreviewContent(): string {
  return `
    <section>
      <h2>Typography</h2>
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
      <p>Regular paragraph text</p>
      <a href="#">Link</a>
      <code>Code</code>
      <pre><code>Code block</code></pre>
    </section>

    <section>
      <h2>Components</h2>
      <table>
        <tr><th>Header</th></tr>
        <tr><td>Cell</td></tr>
      </table>
      <blockquote>Blockquote</blockquote>
      <ul><li>List item</li></ul>
    </section>
  `;
}

async function exportTheme(name: string): Promise<void> {
  console.log(chalk.blue(`\n📤 Exporting theme ${name}...`));

  const theme = loadTheme(name);
  const exportPath = resolve(process.cwd(), `${name}-theme.yml`);

  try {
    writeFileSync(exportPath, dumpYaml(theme));
    console.log(chalk.green(`\n✅ Theme exported to ${exportPath}`));
  } catch (error) {
    throw new Error(`Failed to export theme: ${error.message}`);
  }
}

async function importTheme(path: string): Promise<void> {
  console.log(chalk.blue('\n📥 Importing theme...'));

  try {
    const theme = loadYaml(readFileSync(path, 'utf-8')) as Theme;
    
    if (themeExists(theme.name)) {
      throw new Error(`Theme ${theme.name} already exists`);
    }

    theme.updated = new Date().toISOString();
    saveTheme(theme);
    createThemeFiles(theme);

    console.log(chalk.green(`\n✅ Theme ${theme.name} imported`));
  } catch (error) {
    throw new Error(`Failed to import theme: ${error.message}`);
  }
}

function listThemes(): void {
  console.log(chalk.blue('\n🎨 Documentation Themes\n'));

  const themes = readdirSync(THEMES_DIR)
    .filter(file => file.endsWith('.yml'))
    .map(file => loadTheme(file.replace('.yml', '')));

  themes.forEach(theme => {
    console.log(chalk.bold(theme.name));
    console.log(`Description: ${theme.description}`);
    console.log(`Author: ${theme.author}`);
    console.log(`Version: ${theme.version}`);
    console.log(`Updated: ${new Date(theme.updated).toLocaleDateString()}`);
    console.log();
  });
}

function themeExists(name: string): boolean {
  return existsSync(resolve(THEMES_DIR, `${name}.yml`));
}

// Run theme management
manageThemes().catch((error) => {
  console.error(chalk.red('💥 Fatal error:'), error);
  process.exit(1);
});