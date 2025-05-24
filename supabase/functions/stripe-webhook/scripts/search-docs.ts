#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { program } from 'commander';
import chalk from 'chalk';
import glob from 'glob';
import lunr from 'lunr';
import { marked } from 'marked';
import { removeMarkdown } from 'remove-markdown';
import { config } from './docs.config';

program
  .name('search-docs')
  .description('Search and index documentation')
  .option('-q, --query <text>', 'Search query')
  .option('-r, --rebuild', 'Rebuild search index')
  .option('-o, --output <path>', 'Index output path', 'docs/search-index.json')
  .option('-f, --format <type>', 'Output format (json|html)', 'json')
  .option('-l, --limit <number>', 'Result limit', '10')
  .parse(process.argv);

const options = program.opts();

interface SearchResult {
  title: string;
  path: string;
  content: string;
  score: number;
  section?: string;
  preview?: string;
}

interface DocumentSection {
  id: string;
  title: string;
  content: string;
  path: string;
  tags: string[];
}

async function searchDocs() {
  try {
    // Rebuild index if requested
    if (options.rebuild) {
      await buildSearchIndex();
    }

    // Search if query provided
    if (options.query) {
      await searchDocuments(options.query);
    }

  } catch (error) {
    console.error(chalk.red('\n❌ Search failed:'), error);
    process.exit(1);
  }
}

async function buildSearchIndex(): Promise<void> {
  console.log(chalk.blue('\n🔍 Building search index...'));

  try {
    // Get all markdown files
    const files = glob.sync('**/*.md', {
      cwd: config.paths.docs,
      ignore: ['node_modules/**'],
    });

    // Extract sections from files
    const sections: DocumentSection[] = [];
    files.forEach((file) => {
      const path = resolve(config.paths.docs, file);
      const content = readFileSync(path, 'utf-8');
      sections.push(...extractSections(content, file));
    });

    console.log(chalk.blue(`Found ${sections.length} sections`));

    // Build index
    const idx = lunr(function() {
      this.ref('id');
      this.field('title', { boost: 10 });
      this.field('content');
      this.field('path');
      this.field('tags', { boost: 5 });

      sections.forEach((section) => {
        this.add(section);
      });
    });

    // Save index and documents
    const searchData = {
      index: idx,
      documents: sections.reduce((acc, section) => {
        acc[section.id] = section;
        return acc;
      }, {} as Record<string, DocumentSection>),
    };

    writeFileSync(options.output, JSON.stringify(searchData));
    console.log(chalk.green(`\n✅ Search index built: ${options.output}`));

  } catch (error) {
    throw new Error(`Failed to build search index: ${error.message}`);
  }
}

function extractSections(content: string, path: string): DocumentSection[] {
  const sections: DocumentSection[] = [];
  const tokens = marked.lexer(content);
  let currentSection: Partial<DocumentSection> = {};

  tokens.forEach((token) => {
    if (token.type === 'heading') {
      // Save previous section
      if (currentSection.title) {
        sections.push({
          id: `${path}#${currentSection.title?.toLowerCase().replace(/\s+/g, '-')}`,
          title: currentSection.title,
          content: currentSection.content || '',
          path,
          tags: extractTags(currentSection.content || ''),
        });
      }

      // Start new section
      currentSection = {
        title: token.text,
        content: '',
      };
    } else if (token.type === 'text' || token.type === 'paragraph') {
      currentSection.content = (currentSection.content || '') + ' ' + token.text;
    } else if (token.type === 'code') {
      currentSection.content = (currentSection.content || '') + ' ' + token.text;
    }
  });

  // Add final section
  if (currentSection.title) {
    sections.push({
      id: `${path}#${currentSection.title.toLowerCase().replace(/\s+/g, '-')}`,
      title: currentSection.title,
      content: currentSection.content || '',
      path,
      tags: extractTags(currentSection.content || ''),
    });
  }

  return sections;
}

function extractTags(content: string): string[] {
  const tags = new Set<string>();
  
  // Extract inline code
  content.match(/`[^`]+`/g)?.forEach((match) => {
    tags.add(match.replace(/`/g, '').trim());
  });

  // Extract emphasized text
  content.match(/\*\*[^*]+\*\*/g)?.forEach((match) => {
    tags.add(match.replace(/\*\*/g, '').trim());
  });

  // Extract links
  content.match(/\[([^\]]+)\]\([^)]+\)/g)?.forEach((match) => {
    const text = match.match(/\[([^\]]+)\]/)?.[1];
    if (text) tags.add(text.trim());
  });

  return Array.from(tags);
}

async function searchDocuments(query: string): Promise<void> {
  console.log(chalk.blue(`\n🔍 Searching for: ${query}`));

  try {
    // Load index
    const searchData = JSON.parse(readFileSync(options.output, 'utf-8'));
    const idx = lunr.Index.load(searchData.index);
    const documents = searchData.documents;

    // Search
    const results = idx.search(query);
    const limit = parseInt(options.limit);
    const limitedResults = results.slice(0, limit);

    // Format results
    const formattedResults = limitedResults.map((result) => {
      const doc = documents[result.ref];
      return {
        title: doc.title,
        path: doc.path,
        content: doc.content,
        score: result.score,
        section: doc.id.split('#')[1],
        preview: generatePreview(doc.content, query),
      };
    });

    // Output results
    if (options.format === 'html') {
      outputHtml(formattedResults);
    } else {
      outputJson(formattedResults);
    }

  } catch (error) {
    throw new Error(`Failed to search documents: ${error.message}`);
  }
}

function generatePreview(content: string, query: string): string {
  const plainText = removeMarkdown(content);
  const words = query.toLowerCase().split(/\s+/);
  
  // Find best matching snippet
  let bestSnippet = '';
  let bestScore = 0;

  const snippets = plainText.split(/[.!?]+/);
  snippets.forEach((snippet) => {
    const score = words.filter(word => 
      snippet.toLowerCase().includes(word)
    ).length;

    if (score > bestScore) {
      bestScore = score;
      bestSnippet = snippet.trim();
    }
  });

  // Highlight query terms
  words.forEach((word) => {
    bestSnippet = bestSnippet.replace(
      new RegExp(word, 'gi'),
      match => `**${match}**`
    );
  });

  return bestSnippet;
}

function outputJson(results: SearchResult[]): void {
  console.log(JSON.stringify(results, null, 2));
}

function outputHtml(results: SearchResult[]): void {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Search Results</title>
      <style>
        body { font-family: system-ui; line-height: 1.6; max-width: 800px; margin: 2rem auto; }
        .result { margin-bottom: 2rem; padding: 1rem; border: 1px solid #eee; border-radius: 4px; }
        .title { font-size: 1.2rem; margin: 0; }
        .path { color: #666; margin: 0.5rem 0; }
        .preview { margin: 0.5rem 0; }
        .score { color: #999; font-size: 0.9rem; }
      </style>
    </head>
    <body>
      <h1>Search Results</h1>
      ${results.map((result) => `
        <div class="result">
          <h2 class="title">${result.title}</h2>
          <div class="path">${result.path}#${result.section}</div>
          <div class="preview">${result.preview}</div>
          <div class="score">Score: ${result.score.toFixed(2)}</div>
        </div>
      `).join('')}
    </body>
    </html>
  `;

  console.log(html);
}

// Run search
searchDocs().catch((error) => {
  console.error(chalk.red('💥 Fatal error:'), error);
  process.exit(1);
});