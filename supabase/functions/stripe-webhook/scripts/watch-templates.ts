#!/usr/bin/env node
import { watch } from 'chokidar';
import { resolve } from 'path';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { load as loadYaml } from 'js-yaml';
import chalk from 'chalk';

const TEMPLATE_DIR = resolve(__dirname, 'templates');
const DOCS_DIR = resolve(__dirname, '..', 'docs');
const CONFIG_FILE = resolve(__dirname, 'docs.config.ts');

interface TemplateMap {
  [key: string]: {
    output: string;
    data: string;
    helpers?: string;
  };
}

async function main() {
  console.log(chalk.blue('🔍 Watching templates for changes...'));

  // Load configuration
  const config = require(CONFIG_FILE).default;
  const templateMap = loadTemplateMap();

  // Watch templates
  const watcher = watch([
    resolve(TEMPLATE_DIR, '**/*.hbs'),
    resolve(TEMPLATE_DIR, '**/*.yaml'),
    resolve(TEMPLATE_DIR, '**/*.json'),
  ]);

  watcher.on('change', async (path) => {
    try {
      console.log(chalk.yellow(`📝 Template changed: ${path}`));
      await processTemplateChange(path, templateMap, config);
    } catch (error) {
      console.error(chalk.red('❌ Error processing template:'), error);
    }
  });

  // Watch data files
  const dataWatcher = watch([
    resolve(__dirname, 'data', '**/*.{json,yaml,yml}'),
    CONFIG_FILE,
  ]);

  dataWatcher.on('change', async (path) => {
    try {
      console.log(chalk.yellow(`📊 Data changed: ${path}`));
      await regenerateAllDocs(templateMap, config);
    } catch (error) {
      console.error(chalk.red('❌ Error regenerating docs:'), error);
    }
  });
}

function loadTemplateMap(): TemplateMap {
  try {
    const mapPath = resolve(TEMPLATE_DIR, 'template-map.yaml');
    const content = readFileSync(mapPath, 'utf-8');
    return loadYaml(content) as TemplateMap;
  } catch (error) {
    console.error(chalk.red('❌ Error loading template map:'), error);
    process.exit(1);
  }
}

async function processTemplateChange(
  path: string,
  templateMap: TemplateMap,
  config: any
) {
  const templateName = path.split('/').pop()?.replace('.hbs', '');
  if (!templateName || !templateMap[templateName]) {
    console.warn(chalk.yellow(`⚠️ No mapping found for template: ${templateName}`));
    return;
  }

  const mapping = templateMap[templateName];
  const dataPath = resolve(__dirname, 'data', mapping.data);
  const outputPath = resolve(DOCS_DIR, mapping.output);

  console.log(chalk.blue(`🔄 Processing template: ${templateName}`));

  try {
    // Load data
    const data = loadData(dataPath);

    // Process helpers
    let helpers = {};
    if (mapping.helpers) {
      const helperPath = resolve(__dirname, mapping.helpers);
      helpers = require(helperPath);
    }

    // Generate documentation
    await generateDoc(templateName, data, helpers, outputPath, config);

    // Validate output
    await validateOutput(outputPath, config);

    console.log(chalk.green(`✅ Updated documentation: ${outputPath}`));
  } catch (error) {
    console.error(chalk.red(`❌ Error updating ${templateName}:`), error);
  }
}

function loadData(path: string): any {
  const content = readFileSync(path, 'utf-8');
  return path.endsWith('.json') ? JSON.parse(content) : loadYaml(content);
}

async function generateDoc(
  templateName: string,
  data: any,
  helpers: any,
  outputPath: string,
  config: any
): Promise<void> {
  // Generate command based on output type
  const cmd = outputPath.endsWith('.md')
    ? `npm run generate-markdown`
    : outputPath.endsWith('.html')
    ? `npm run generate-html`
    : `npm run generate-doc`;

  // Execute generation
  execSync(`${cmd} --template ${templateName} --data ${JSON.stringify(data)} --output ${outputPath}`, {
    stdio: 'inherit',
  });
}

async function validateOutput(path: string, config: any): Promise<void> {
  // Run configured validations
  if (path.endsWith('.md')) {
    execSync(`npm run validate-markdown ${path}`, { stdio: 'inherit' });
  } else if (path.endsWith('.json')) {
    execSync(`npm run validate-json ${path}`, { stdio: 'inherit' });
  }

  // Run link checker if enabled
  if (config.validation.checkLinks) {
    execSync(`npm run check-links ${path}`, { stdio: 'inherit' });
  }
}

async function regenerateAllDocs(templateMap: TemplateMap, config: any) {
  console.log(chalk.blue('🔄 Regenerating all documentation...'));

  for (const [templateName, mapping] of Object.entries(templateMap)) {
    try {
      const dataPath = resolve(__dirname, 'data', mapping.data);
      const outputPath = resolve(DOCS_DIR, mapping.output);
      const data = loadData(dataPath);
      const helpers = mapping.helpers
        ? require(resolve(__dirname, mapping.helpers))
        : {};

      await generateDoc(templateName, data, helpers, outputPath, config);
      await validateOutput(outputPath, config);

      console.log(chalk.green(`✅ Generated: ${outputPath}`));
    } catch (error) {
      console.error(chalk.red(`❌ Error generating ${templateName}:`), error);
    }
  }
}

// Handle errors
process.on('uncaughtException', (error) => {
  console.error(chalk.red('💥 Fatal error:'), error);
  process.exit(1);
});

// Start watcher
main().catch((error) => {
  console.error(chalk.red('💥 Fatal error:'), error);
  process.exit(1);
});