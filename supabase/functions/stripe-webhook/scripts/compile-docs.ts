#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';
import { program } from 'commander';
import chalk from 'chalk';
import { compile } from 'handlebars';
import { marked } from 'marked';
import { mdToPdf } from 'md-to-pdf';
import { createDocx } from 'docx';
import { MarkdownToEPub } from 'markdown-to-epub';
import puppeteer from 'puppeteer';
import { config } from './docs.config';
import helpers from './helpers/template';

program
  .name('compile-docs')
  .description('Compile documentation into different formats')
  .option('-f, --formats <list>', 'Output formats (html,pdf,epub,docx)', 'html')
  .option('-o, --output <dir>', 'Output directory', 'dist')
  .option('-t, --theme <name>', 'Theme name', 'default')
  .option('-m, --metadata <file>', 'Metadata file')
  .parse(process.argv);

const options = program.opts();

interface CompileOptions {
  format: string;
  theme: string;
  metadata: any;
}

async function compileDocs() {
  try {
    console.log(chalk.blue('\n📚 Compiling documentation...'));

    // Load metadata
    const metadata = loadMetadata();

    // Create output directory
    mkdirSync(options.output, { recursive: true });

    // Compile requested formats
    const formats = options.formats.split(',');
    for (const format of formats) {
      await compileFormat(format.trim(), {
        format,
        theme: options.theme,
        metadata,
      });
    }

    console.log(chalk.green('\n✅ Documentation compilation complete!'));

  } catch (error) {
    console.error(chalk.red('\n❌ Compilation failed:'), error);
    process.exit(1);
  }
}

function loadMetadata(): any {
  if (!options.metadata) {
    return {};
  }

  try {
    const path = resolve(options.metadata);
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch (error) {
    throw new Error(`Failed to load metadata: ${error.message}`);
  }
}

async function compileFormat(format: string, options: CompileOptions): Promise<void> {
  console.log(chalk.blue(`\n📄 Compiling ${format.toUpperCase()}...`));

  const outputDir = join(options.output, format);
  mkdirSync(outputDir, { recursive: true });

  switch (format) {
    case 'html':
      await compileHtml(outputDir, options);
      break;
    case 'pdf':
      await compilePdf(outputDir, options);
      break;
    case 'epub':
      await compileEpub(outputDir, options);
      break;
    case 'docx':
      await compileDocx(outputDir, options);
      break;
    default:
      console.warn(chalk.yellow(`⚠️ Unknown format: ${format}`));
  }
}

async function compileHtml(outputDir: string, options: CompileOptions): Promise<void> {
  // Load theme template
  const templatePath = resolve(__dirname, 'templates', 'themes', `${options.theme}.hbs`);
  const template = readFileSync(templatePath, 'utf-8');
  const compiledTemplate = compile(template);

  // Process each markdown file
  const files = glob.sync('**/*.md', { cwd: config.paths.docs });
  for (const file of files) {
    const content = readFileSync(resolve(config.paths.docs, file), 'utf-8');
    const html = marked(content);

    // Apply theme
    const themed = compiledTemplate({
      content: html,
      metadata: options.metadata,
      helpers,
    });

    // Save output
    const outputPath = join(outputDir, file.replace('.md', '.html'));
    mkdirSync(resolve(outputPath, '..'), { recursive: true });
    writeFileSync(outputPath, themed);
  }

  // Copy assets
  copyAssets(outputDir);
}

async function compilePdf(outputDir: string, options: CompileOptions): Promise<void> {
  // Launch browser for PDF generation
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    // Process each HTML file
    const files = glob.sync('**/*.html', { cwd: join(options.output, 'html') });
    for (const file of files) {
      const html = readFileSync(join(options.output, 'html', file), 'utf-8');
      
      // Set content
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Generate PDF
      const outputPath = join(outputDir, file.replace('.html', '.pdf'));
      mkdirSync(resolve(outputPath, '..'), { recursive: true });
      
      await page.pdf({
        path: outputPath,
        format: 'A4',
        margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' },
        printBackground: true,
      });
    }
  } finally {
    await browser.close();
  }
}

async function compileEpub(outputDir: string, options: CompileOptions): Promise<void> {
  const epub = new MarkdownToEPub({
    title: options.metadata.title || 'Documentation',
    author: options.metadata.author || 'Unknown',
    publisher: options.metadata.publisher || 'Unknown',
    cover: options.metadata.cover,
  });

  // Add each markdown file
  const files = glob.sync('**/*.md', { cwd: config.paths.docs });
  for (const file of files) {
    const content = readFileSync(resolve(config.paths.docs, file), 'utf-8');
    epub.addChapter(file, content);
  }

  // Generate EPUB
  const outputPath = join(outputDir, 'documentation.epub');
  await epub.generate(outputPath);
}

async function compileDocx(outputDir: string, options: CompileOptions): Promise<void> {
  // Process each markdown file
  const files = glob.sync('**/*.md', { cwd: config.paths.docs });
  for (const file of files) {
    const content = readFileSync(resolve(config.paths.docs, file), 'utf-8');
    
    // Convert to DOCX
    const doc = await createDocx(content, {
      title: options.metadata.title,
      author: options.metadata.author,
      styles: loadDocxStyles(options.theme),
    });

    // Save output
    const outputPath = join(outputDir, file.replace('.md', '.docx'));
    mkdirSync(resolve(outputPath, '..'), { recursive: true });
    await doc.save(outputPath);
  }
}

function copyAssets(outputDir: string): void {
  const assetDir = resolve(config.paths.docs, 'assets');
  const targetDir = join(outputDir, 'assets');

  try {
    mkdirSync(targetDir, { recursive: true });
    execSync(`cp -r ${assetDir}/* ${targetDir}`);
  } catch (error) {
    console.warn(chalk.yellow('⚠️ No assets to copy'));
  }
}

function loadDocxStyles(theme: string): any {
  try {
    const path = resolve(__dirname, 'templates', 'themes', `${theme}.docx.json`);
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return {};
  }
}

// Run compilation
compileDocs().catch((error) => {
  console.error(chalk.red('💥 Fatal error:'), error);
  process.exit(1);
});