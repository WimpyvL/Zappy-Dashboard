#!/usr/bin/env node
import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { program } from 'commander';
import chalk from 'chalk';
import validator from './helpers/validation';
import { config } from './docs.config';

program
  .name('validate-docs')
  .description('Validate documentation before publishing')
  .option('-f, --fix', 'Attempt to fix issues automatically', false)
  .option('-r, --report <path>', 'Generate validation report')
  .option('-t, --threshold <number>', 'Error threshold (0-100)', '0')
  .parse(process.argv);

const options = program.opts();

interface ValidationReport {
  timestamp: string;
  summary: {
    total: number;
    errors: number;
    warnings: number;
    score: number;
  };
  results: {
    [key: string]: {
      valid: boolean;
      errors: any[];
      warnings: any[];
    };
  };
}

async function validateDocs() {
  console.log(chalk.blue('🔍 Starting documentation validation...'));

  const report: ValidationReport = {
    timestamp: new Date().toISOString(),
    summary: {
      total: 0,
      errors: 0,
      warnings: 0,
      score: 100,
    },
    results: {},
  };

  try {
    // Validate OpenAPI spec
    console.log('\nValidating OpenAPI specification...');
    const openApiResult = await validator.validateOpenAPI(
      resolve(config.paths.output.openapi)
    );
    report.results.openapi = openApiResult;
    logValidationResult('OpenAPI', openApiResult);

    // Validate Markdown docs
    console.log('\nValidating Markdown documentation...');
    const markdownFiles = [
      'api/index.md',
      'config/index.md',
      'database/index.md',
      'errors/index.md',
      'examples/index.md',
      'security/index.md',
      'testing/index.md',
      'types/index.md',
    ];

    for (const file of markdownFiles) {
      const result = await validator.validateMarkdown(
        resolve(config.paths.docs, file)
      );
      report.results[file] = result;
      logValidationResult(file, result);
    }

    // Validate TypeScript types
    console.log('\nValidating TypeScript types...');
    const typesResult = await validator.validateTypes(
      resolve(config.paths.output.types)
    );
    report.results.types = typesResult;
    logValidationResult('Types', typesResult);

    // Validate documentation structure
    console.log('\nValidating documentation structure...');
    const structureResult = validator.validateStructure(
      config.paths.docs,
      [
        'README.md',
        'CONTRIBUTING.md',
        'api/index.md',
        'config/index.md',
        'openapi.json',
      ]
    );
    report.results.structure = structureResult;
    logValidationResult('Structure', structureResult);

    // Calculate summary
    summarizeResults(report);

    // Generate report if requested
    if (options.report) {
      writeFileSync(
        options.report,
        JSON.stringify(report, null, 2)
      );
      console.log(chalk.blue(`\n📊 Report generated: ${options.report}`));
    }

    // Check error threshold
    const threshold = parseInt(options.threshold);
    if (report.summary.score < (100 - threshold)) {
      console.error(chalk.red(`\n❌ Validation failed: Score ${report.summary.score}% below threshold ${100 - threshold}%`));
      process.exit(1);
    }

    console.log(chalk.green('\n✅ All validations passed!'));
    console.log(chalk.blue(`📊 Documentation Score: ${report.summary.score}%`));

  } catch (error) {
    console.error(chalk.red('\n❌ Validation failed:'), error);
    process.exit(1);
  }
}

function logValidationResult(name: string, result: any) {
  if (result.valid) {
    console.log(chalk.green(`✓ ${name}`));
  } else {
    console.log(chalk.red(`✗ ${name}`));
    console.log(validator.formatResults(result));
  }
}

function summarizeResults(report: ValidationReport) {
  let totalChecks = 0;
  let totalErrors = 0;
  let totalWarnings = 0;

  Object.values(report.results).forEach((result) => {
    totalChecks++;
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
  });

  report.summary = {
    total: totalChecks,
    errors: totalErrors,
    warnings: totalWarnings,
    score: Math.max(0, Math.round(100 * (1 - totalErrors / (totalChecks * 10)))),
  };
}

async function attemptFixes(report: ValidationReport) {
  if (!options.fix) return;

  console.log(chalk.blue('\n🔧 Attempting to fix issues...'));

  try {
    // Fix markdown formatting
    Object.entries(report.results)
      .filter(([file]) => file.endsWith('.md'))
      .forEach(([file, result]) => {
        if (result.errors.length > 0 || result.warnings.length > 0) {
          const content = readFileSync(resolve(config.paths.docs, file), 'utf-8');
          const fixed = fixMarkdown(content);
          writeFileSync(resolve(config.paths.docs, file), fixed);
          console.log(chalk.green(`✓ Fixed: ${file}`));
        }
      });

    // Fix TypeScript formatting
    if (report.results.types?.errors.length > 0) {
      const content = readFileSync(config.paths.output.types, 'utf-8');
      const fixed = fixTypeScript(content);
      writeFileSync(config.paths.output.types, fixed);
      console.log(chalk.green('✓ Fixed: TypeScript types'));
    }

    // Fix OpenAPI formatting
    if (report.results.openapi?.errors.length > 0) {
      const content = readFileSync(config.paths.output.openapi, 'utf-8');
      const fixed = fixOpenAPI(content);
      writeFileSync(config.paths.output.openapi, fixed);
      console.log(chalk.green('✓ Fixed: OpenAPI specification'));
    }

    console.log(chalk.green('\n✅ Fixes applied successfully!'));
  } catch (error) {
    console.error(chalk.red('\n❌ Error applying fixes:'), error);
  }
}

function fixMarkdown(content: string): string {
  // Add basic markdown fixes here
  return content
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+$/gm, '');
}

function fixTypeScript(content: string): string {
  // Add TypeScript formatting fixes here
  return content;
}

function fixOpenAPI(content: string): string {
  // Add OpenAPI formatting fixes here
  return content;
}

// Run validation
validateDocs().catch((error) => {
  console.error(chalk.red('💥 Fatal error:'), error);
  process.exit(1);
});