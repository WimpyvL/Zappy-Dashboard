#!/usr/bin/env node
import { program } from 'commander';
import { resolve } from 'path';
import { mkdirSync, rmSync } from 'fs';
import { execSync } from 'child_process';
import { config } from './docs.config';

program
  .name('generate-docs')
  .description('Generate all documentation')
  .option('-c, --clean', 'Clean output directories first', false)
  .option('-w, --watch', 'Watch for changes', false)
  .option('-s, --serve', 'Serve documentation', false)
  .option('-p, --port <number>', 'Server port', '3000')
  .parse(process.argv);

const options = program.opts();

async function generateDocs() {
  try {
    console.log('🚀 Starting documentation generation...');
    
    // Clean if requested
    if (options.clean) {
      cleanDirectories();
    }

    // Create directories
    createDirectories();

    // Generate all docs
    await Promise.all([
      generateOpenAPI(),
      generateTypeDoc(),
      generateTypes(),
      generateMarkdown(),
    ]);

    // Validate output
    if (config.build.validateOutput) {
      await validateOutput();
    }

    // Serve if requested
    if (options.serve) {
      serveDocumentation(parseInt(options.port));
    }

    // Watch if requested
    if (options.watch) {
      watchFiles();
    }

    console.log('✅ Documentation generation complete!');
  } catch (error) {
    console.error('❌ Error generating documentation:', error);
    if (config.build.failOnError) {
      process.exit(1);
    }
  }
}

function cleanDirectories() {
  console.log('🧹 Cleaning output directories...');
  
  [
    config.paths.output.typedoc,
    config.paths.output.openapi,
    config.paths.output.markdown,
    config.paths.output.types,
  ].forEach(path => {
    try {
      rmSync(path, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Warning: Could not clean ${path}`);
    }
  });
}

function createDirectories() {
  console.log('📁 Creating directories...');
  
  [
    config.paths.docs,
    config.paths.output.typedoc,
    resolve(config.paths.output.openapi, '..'),
    resolve(config.paths.output.markdown, '..'),
    resolve(config.paths.output.types, '..'),
  ].forEach(path => {
    try {
      mkdirSync(path, { recursive: true });
    } catch (error) {
      // Ignore if directory exists
    }
  });
}

async function generateOpenAPI() {
  console.log('📝 Generating OpenAPI spec...');
  
  execSync(`ts-node ${resolve(__dirname, 'generate-openapi.ts')}
    --output ${config.paths.output.openapi}
    --title "${config.openapi.title}"
    --version "${config.openapi.version}"
    --description "${config.openapi.description}"`, 
    { stdio: 'inherit' });
}

async function generateTypeDoc() {
  console.log('📚 Generating TypeDoc documentation...');
  
  execSync(`typedoc
    --options ${resolve(__dirname, 'typedoc.json')}
    --out ${config.paths.output.typedoc}`,
    { stdio: 'inherit' });
}

async function generateTypes() {
  console.log('🏷️ Generating TypeScript types...');
  
  execSync(`ts-node ${resolve(__dirname, 'generate-types.ts')}
    --input ${config.paths.output.openapi}
    --output ${config.paths.output.types}
    --prefix ${config.types.prefix}`,
    { stdio: 'inherit' });
}

async function generateMarkdown() {
  console.log('📖 Generating Markdown documentation...');
  
  execSync(`ts-node ${resolve(__dirname, 'generate-markdown.ts')}
    --input ${config.paths.output.openapi}
    --output ${config.paths.output.markdown}`,
    { stdio: 'inherit' });
}

async function validateOutput() {
  console.log('✨ Validating documentation...');
  
  if (config.validation.lint) {
    console.log('Linting OpenAPI spec...');
    execSync(`spectral lint ${config.paths.output.openapi}`,
      { stdio: 'inherit' });
  }

  if (config.validation.checkLinks) {
    console.log('Checking markdown links...');
    execSync(`markdown-link-check ${config.paths.output.markdown}`,
      { stdio: 'inherit' });
  }
}

function serveDocumentation(port: number) {
  console.log(`🌐 Serving documentation on http://localhost:${port}`);
  
  execSync(`npx serve ${config.paths.docs} -p ${port}`, {
    stdio: 'inherit',
  });
}

function watchFiles() {
  console.log('👀 Watching for changes...');
  
  const chokidar = require('chokidar');
  const watcher = chokidar.watch([
    resolve(config.paths.source, '**/*.ts'),
    resolve(config.paths.source, '**/*.tsx'),
    resolve(config.paths.docs, '**/*.md'),
  ]);

  watcher.on('change', async (path: string) => {
    console.log(`File changed: ${path}`);
    await generateDocs();
  });
}

// Run generator
generateDocs().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});