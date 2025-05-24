#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';
import { program } from 'commander';
import chalk from 'chalk';
import glob from 'glob';
import { marked } from 'marked';
import { format } from 'prettier';
import { exec } from 'child_process';
import { promisify } from 'util';
import { config } from './docs.config';

const execAsync = promisify(exec);

program
  .name('extract-examples')
  .description('Extract and validate code examples from documentation')
  .option('-o, --output <dir>', 'Output directory for examples', 'docs/examples')
  .option('-t, --test', 'Test extracted examples', false)
  .option('-f, --fix', 'Auto-fix formatting', false)
  .option('-l, --list', 'List examples only', false)
  .parse(process.argv);

const options = program.opts();

interface CodeExample {
  id: string;
  title: string;
  language: string;
  code: string;
  sourcePath: string;
  sourceLine: number;
  description?: string;
  dependencies?: string[];
  setup?: string;
  cleanup?: string;
}

async function extractExamples() {
  try {
    console.log(chalk.blue('\n📝 Extracting code examples...'));

    // Get all markdown files
    const files = glob.sync('**/*.md', {
      cwd: config.paths.docs,
      ignore: ['node_modules/**'],
    });

    // Extract examples from each file
    const examples: CodeExample[] = [];
    for (const file of files) {
      const fileExamples = await extractFromFile(file);
      examples.push(...fileExamples);
    }

    console.log(chalk.blue(`\nFound ${examples.length} code examples`));

    // List examples if requested
    if (options.list) {
      listExamples(examples);
      return;
    }

    // Process examples
    await processExamples(examples);

  } catch (error) {
    console.error(chalk.red('\n❌ Extraction failed:'), error);
    process.exit(1);
  }
}

async function extractFromFile(file: string): Promise<CodeExample[]> {
  const path = resolve(config.paths.docs, file);
  const content = readFileSync(path, 'utf-8');
  const tokens = marked.lexer(content);
  const examples: CodeExample[] = [];

  let currentTitle = '';
  let currentDescription = '';
  let exampleIndex = 0;

  tokens.forEach((token, index) => {
    if (token.type === 'heading') {
      currentTitle = token.text;
    } else if (token.type === 'paragraph') {
      currentDescription = token.text;
    } else if (token.type === 'code') {
      exampleIndex++;
      const example: CodeExample = {
        id: `${file}-${exampleIndex}`,
        title: currentTitle || `Example ${exampleIndex}`,
        language: token.lang || 'typescript',
        code: token.text,
        sourcePath: file,
        sourceLine: getLineNumber(content, token.text),
        description: currentDescription,
        dependencies: extractDependencies(token.text),
      };

      // Extract setup/cleanup comments
      const setupMatch = token.text.match(/\/\/ Setup:?\n([\s\S]*?)(?=\/\/|$)/);
      if (setupMatch) {
        example.setup = setupMatch[1].trim();
      }

      const cleanupMatch = token.text.match(/\/\/ Cleanup:?\n([\s\S]*?)(?=\/\/|$)/);
      if (cleanupMatch) {
        example.cleanup = cleanupMatch[1].trim();
      }

      examples.push(example);
      currentDescription = '';
    }
  });

  return examples;
}

function getLineNumber(content: string, code: string): number {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(code.split('\n')[0])) {
      return i + 1;
    }
  }
  return 0;
}

function extractDependencies(code: string): string[] {
  const deps = new Set<string>();

  // Extract imports
  const imports = code.match(/import.*from\s+['"]([^'"]+)['"]/g);
  if (imports) {
    imports.forEach((imp) => {
      const match = imp.match(/from\s+['"]([^'"]+)['"]/);
      if (match) deps.add(match[1]);
    });
  }

  // Extract requires
  const requires = code.match(/require\(['"]([^'"]+)['"]\)/g);
  if (requires) {
    requires.forEach((req) => {
      const match = req.match(/require\(['"]([^'"]+)['"]\)/);
      if (match) deps.add(match[1]);
    });
  }

  return Array.from(deps);
}

async function processExamples(examples: CodeExample[]): Promise<void> {
  // Create output directory
  mkdirSync(options.output, { recursive: true });

  // Process each example
  for (const example of examples) {
    console.log(chalk.blue(`\n📄 Processing: ${example.title}`));

    try {
      // Format code if requested
      if (options.fix) {
        example.code = await formatCode(example.code, example.language);
      }

      // Save example
      const outputPath = join(options.output, `${example.id}.${getFileExtension(example.language)}`);
      writeFileSync(outputPath, example.code);
      console.log(chalk.green(`✓ Saved to ${outputPath}`));

      // Test if requested
      if (options.test) {
        await testExample(example);
      }

    } catch (error) {
      console.error(chalk.red(`❌ Failed to process ${example.title}:`), error);
    }
  }

  // Save metadata
  const metadata = examples.map(({ code, ...meta }) => meta);
  writeFileSync(
    join(options.output, 'examples.json'),
    JSON.stringify(metadata, null, 2)
  );
}

async function formatCode(code: string, language: string): Promise<string> {
  try {
    return format(code, {
      parser: getParser(language),
      semi: true,
      singleQuote: true,
    });
  } catch {
    return code;
  }
}

function getParser(language: string): string {
  switch (language.toLowerCase()) {
    case 'typescript':
    case 'ts':
      return 'typescript';
    case 'javascript':
    case 'js':
      return 'babel';
    case 'json':
      return 'json';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'markdown':
    case 'md':
      return 'markdown';
    default:
      return 'babel';
  }
}

function getFileExtension(language: string): string {
  switch (language.toLowerCase()) {
    case 'typescript':
    case 'ts':
      return 'ts';
    case 'javascript':
    case 'js':
      return 'js';
    case 'json':
      return 'json';
    case 'yaml':
    case 'yml':
      return 'yml';
    case 'markdown':
    case 'md':
      return 'md';
    default:
      return 'txt';
  }
}

async function testExample(example: CodeExample): Promise<void> {
  console.log(chalk.blue(`🧪 Testing ${example.title}...`));

  const testDir = join(options.output, '__tests__');
  mkdirSync(testDir, { recursive: true });

  try {
    // Create test file
    const testPath = join(testDir, `${example.id}.test.ts`);
    const testCode = generateTest(example);
    writeFileSync(testPath, testCode);

    // Run test
    await execAsync(`npm test ${testPath}`);
    console.log(chalk.green('✓ Tests passed'));

  } catch (error) {
    console.error(chalk.red('❌ Tests failed:'), error);
    throw error;
  }
}

function generateTest(example: CodeExample): string {
  return `
    import { beforeAll, afterAll, test } from '@jest/globals';

    ${example.setup ? `
    beforeAll(async () => {
      ${example.setup}
    });
    ` : ''}

    ${example.cleanup ? `
    afterAll(async () => {
      ${example.cleanup}
    });
    ` : ''}

    test('${example.title}', async () => {
      ${example.code}
    });
  `;
}

function listExamples(examples: CodeExample[]): void {
  console.log(chalk.blue('\n📚 Code Examples:\n'));

  examples.forEach((example) => {
    console.log(chalk.bold(example.title));
    console.log(`Language: ${example.language}`);
    console.log(`Source: ${example.sourcePath}:${example.sourceLine}`);
    if (example.description) {
      console.log(`Description: ${example.description}`);
    }
    if (example.dependencies?.length) {
      console.log('Dependencies:', example.dependencies.join(', '));
    }
    console.log();
  });
}

// Run extraction
extractExamples().catch((error) => {
  console.error(chalk.red('💥 Fatal error:'), error);
  process.exit(1);
});