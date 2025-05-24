#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { program } from 'commander';
import chalk from 'chalk';
import glob from 'glob';
import { marked } from 'marked';
import { removeMarkdown } from 'remove-markdown';
import { spellcheck } from 'node-spellchecker';
import readabilityScores from 'readability-scores';
import { config } from './docs.config';

program
  .name('analyze-docs')
  .description('Analyze documentation quality')
  .option('-o, --output <path>', 'Analysis report output', 'docs/analysis.json')
  .option('-f, --format <type>', 'Output format (json|html|md)', 'json')
  .option('-t, --threshold <score>', 'Quality score threshold', '80')
  .option('--fix', 'Auto-fix common issues', false)
  .parse(process.argv);

const options = program.opts();

interface DocAnalysis {
  path: string;
  metrics: {
    words: number;
    readingTime: number;
    readability: {
      fleschKincaid: number;
      gradeLevel: number;
      complexity: 'easy' | 'medium' | 'hard';
    };
    codeBlocks: number;
    examples: number;
    headings: number;
    links: number;
    images: number;
  };
  issues: {
    spelling: SpellingIssue[];
    formatting: FormattingIssue[];
    structure: StructureIssue[];
    content: ContentIssue[];
  };
  score: number;
}

interface SpellingIssue {
  word: string;
  line: number;
  suggestions: string[];
}

interface FormattingIssue {
  type: string;
  line: number;
  message: string;
  fix?: string;
}

interface StructureIssue {
  type: string;
  message: string;
  location: string;
}

interface ContentIssue {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

async function analyzeDocs() {
  try {
    console.log(chalk.blue('\n📊 Starting documentation analysis...'));

    // Get all markdown files
    const files = glob.sync('**/*.md', {
      cwd: config.paths.docs,
      ignore: ['node_modules/**'],
    });

    // Analyze each file
    const analyses = await Promise.all(
      files.map((file) => analyzeFile(file))
    );

    // Calculate overall score
    const overallScore = calculateOverallScore(analyses);

    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      score: overallScore,
      analyses,
      summary: generateSummary(analyses),
    };

    // Output report
    outputReport(report);

    // Check threshold
    if (overallScore < parseInt(options.threshold)) {
      console.error(chalk.red(`\n❌ Documentation score ${overallScore}% below threshold ${options.threshold}%`));
      process.exit(1);
    }

    console.log(chalk.green(`\n✅ Documentation analysis complete. Score: ${overallScore}%`));

  } catch (error) {
    console.error(chalk.red('\n❌ Analysis failed:'), error);
    process.exit(1);
  }
}

async function analyzeFile(file: string): Promise<DocAnalysis> {
  const path = resolve(config.paths.docs, file);
  const content = readFileSync(path, 'utf-8');
  const tokens = marked.lexer(content);
  const plainText = removeMarkdown(content);

  // Calculate metrics
  const metrics = {
    words: countWords(plainText),
    readingTime: calculateReadingTime(plainText),
    readability: analyzeReadability(plainText),
    codeBlocks: countCodeBlocks(tokens),
    examples: countExamples(tokens),
    headings: countHeadings(tokens),
    links: countLinks(tokens),
    images: countImages(tokens),
  };

  // Check for issues
  const issues = {
    spelling: checkSpelling(plainText),
    formatting: checkFormatting(content),
    structure: checkStructure(tokens),
    content: checkContent(tokens, metrics),
  };

  // Calculate file score
  const score = calculateFileScore(metrics, issues);

  return {
    path: file,
    metrics,
    issues,
    score,
  };
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  return Math.ceil(countWords(text) / wordsPerMinute);
}

function analyzeReadability(text: string): DocAnalysis['metrics']['readability'] {
  const scores = readabilityScores(text);
  
  return {
    fleschKincaid: scores.fleschKincaid,
    gradeLevel: scores.gradeLevel,
    complexity: scores.fleschKincaid > 70 ? 'easy' :
               scores.fleschKincaid > 50 ? 'medium' : 'hard',
  };
}

function countCodeBlocks(tokens: marked.Token[]): number {
  return tokens.filter(t => t.type === 'code').length;
}

function countExamples(tokens: marked.Token[]): number {
  return tokens.filter(t => 
    t.type === 'heading' && 
    t.text.toLowerCase().includes('example')
  ).length;
}

function countHeadings(tokens: marked.Token[]): number {
  return tokens.filter(t => t.type === 'heading').length;
}

function countLinks(tokens: marked.Token[]): number {
  return tokens.filter(t => t.type === 'link').length;
}

function countImages(tokens: marked.Token[]): number {
  return tokens.filter(t => t.type === 'image').length;
}

function checkSpelling(text: string): SpellingIssue[] {
  const lines = text.split('\n');
  const issues: SpellingIssue[] = [];

  lines.forEach((line, index) => {
    const words = line.split(/\s+/);
    words.forEach((word) => {
      if (!spellcheck.check(word)) {
        issues.push({
          word,
          line: index + 1,
          suggestions: spellcheck.suggest(word),
        });
      }
    });
  });

  return issues;
}

function checkFormatting(content: string): FormattingIssue[] {
  const issues: FormattingIssue[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Check line length
    if (line.length > 100) {
      issues.push({
        type: 'line-length',
        line: index + 1,
        message: 'Line exceeds 100 characters',
      });
    }

    // Check heading spacing
    if (line.startsWith('#') && !line.match(/^#+\s/)) {
      issues.push({
        type: 'heading-space',
        line: index + 1,
        message: 'Missing space after heading marker',
        fix: line.replace(/^(#+)/, '$1 '),
      });
    }

    // Check list item spacing
    if ((line.startsWith('-') || line.startsWith('*')) && !line.match(/^[-*]\s/)) {
      issues.push({
        type: 'list-space',
        line: index + 1,
        message: 'Missing space after list marker',
        fix: line.replace(/^([-*])/, '$1 '),
      });
    }
  });

  return issues;
}

function checkStructure(tokens: marked.Token[]): StructureIssue[] {
  const issues: StructureIssue[] = [];
  const headings: string[] = [];

  tokens.forEach((token) => {
    if (token.type === 'heading') {
      headings.push(token.text);

      // Check heading levels
      if (token.depth > headings.length) {
        issues.push({
          type: 'heading-level',
          message: 'Heading level skipped',
          location: token.text,
        });
      }
    }
  });

  // Check required sections
  ['Introduction', 'Usage', 'Examples'].forEach((section) => {
    if (!headings.some(h => h.toLowerCase().includes(section.toLowerCase()))) {
      issues.push({
        type: 'missing-section',
        message: `Missing ${section} section`,
        location: 'document',
      });
    }
  });

  return issues;
}

function checkContent(
  tokens: marked.Token[],
  metrics: DocAnalysis['metrics']
): ContentIssue[] {
  const issues: ContentIssue[] = [];

  // Check content length
  if (metrics.words < 100) {
    issues.push({
      type: 'content-length',
      message: 'Content too short (< 100 words)',
      severity: 'medium',
    });
  }

  // Check code examples
  if (metrics.codeBlocks === 0) {
    issues.push({
      type: 'no-code',
      message: 'No code examples found',
      severity: 'high',
    });
  }

  // Check readability
  if (metrics.readability.complexity === 'hard') {
    issues.push({
      type: 'readability',
      message: 'Content may be too complex',
      severity: 'medium',
    });
  }

  return issues;
}

function calculateFileScore(
  metrics: DocAnalysis['metrics'],
  issues: DocAnalysis['issues']
): number {
  let score = 100;

  // Deduct for issues
  const deductions = {
    spelling: 1,
    formatting: 2,
    structure: 5,
    content: {
      low: 2,
      medium: 5,
      high: 10,
    },
  };

  score -= issues.spelling.length * deductions.spelling;
  score -= issues.formatting.length * deductions.formatting;
  score -= issues.structure.length * deductions.structure;
  
  issues.content.forEach((issue) => {
    score -= deductions.content[issue.severity];
  });

  // Add bonuses
  if (metrics.examples > 0) score += 5;
  if (metrics.readability.complexity === 'easy') score += 5;
  if (metrics.codeBlocks > 0) score += 5;

  return Math.max(0, Math.min(100, score));
}

function calculateOverallScore(analyses: DocAnalysis[]): number {
  const total = analyses.reduce((sum, analysis) => sum + analysis.score, 0);
  return Math.round(total / analyses.length);
}

function generateSummary(analyses: DocAnalysis[]) {
  return {
    files: analyses.length,
    totalWords: analyses.reduce((sum, a) => sum + a.metrics.words, 0),
    avgReadingTime: Math.round(
      analyses.reduce((sum, a) => sum + a.metrics.readingTime, 0) / analyses.length
    ),
    totalIssues: analyses.reduce((sum, a) => 
      sum + 
      a.issues.spelling.length +
      a.issues.formatting.length +
      a.issues.structure.length +
      a.issues.content.length,
      0
    ),
    issuesByType: {
      spelling: analyses.reduce((sum, a) => sum + a.issues.spelling.length, 0),
      formatting: analyses.reduce((sum, a) => sum + a.issues.formatting.length, 0),
      structure: analyses.reduce((sum, a) => sum + a.issues.structure.length, 0),
      content: analyses.reduce((sum, a) => sum + a.issues.content.length, 0),
    },
  };
}

function outputReport(report: any): void {
  switch (options.format) {
    case 'html':
      outputHtml(report);
      break;
    case 'md':
      outputMarkdown(report);
      break;
    default:
      outputJson(report);
  }

  console.log(chalk.blue(`\n📝 Report saved to: ${options.output}`));
}

function outputJson(report: any): void {
  writeFileSync(options.output, JSON.stringify(report, null, 2));
}

function outputHtml(report: any): void {
  // Generate HTML report
  const html = `<!DOCTYPE html>
    <html>
      <head>
        <title>Documentation Analysis Report</title>
        <style>
          /* Add styles here */
        </style>
      </head>
      <body>
        <h1>Documentation Analysis Report</h1>
        <pre>${JSON.stringify(report, null, 2)}</pre>
      </body>
    </html>`;

  writeFileSync(options.output, html);
}

function outputMarkdown(report: any): void {
  // Generate Markdown report
  const md = `# Documentation Analysis Report

Score: ${report.score}%

## Summary
${JSON.stringify(report.summary, null, 2)}

## Details
${JSON.stringify(report.analyses, null, 2)}
`;

  writeFileSync(options.output, md);
}

// Run analysis
analyzeDocs().catch((error) => {
  console.error(chalk.red('💥 Fatal error:'), error);
  process.exit(1);
});