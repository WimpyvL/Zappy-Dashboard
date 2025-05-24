import { resolve } from 'path';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { execSync } from 'child_process';
import { marked } from 'marked';
import { compile } from 'handlebars';

/**
 * Test utilities for documentation tools
 */

interface TestDoc {
  path: string;
  content: string;
  metadata?: Record<string, any>;
}

interface TestTemplate {
  name: string;
  content: string;
  data?: any;
  helpers?: Record<string, Function>;
}

interface TestContext {
  root: string;
  docs: TestDoc[];
  templates: TestTemplate[];
  cleanup: () => void;
}

/**
 * Create a test documentation environment
 */
export function createTestContext(name: string): TestContext {
  const root = resolve(__dirname, '..', '__fixtures__', name);
  
  // Clean up existing test directory
  rmSync(root, { recursive: true, force: true });
  
  // Create test directory structure
  mkdirSync(resolve(root, 'docs'), { recursive: true });
  mkdirSync(resolve(root, 'templates'), { recursive: true });
  mkdirSync(resolve(root, 'data'), { recursive: true });

  const context = {
    root,
    docs: [],
    templates: [],
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };

  return context;
}

/**
 * Add a test document
 */
export function addTestDoc(
  context: TestContext,
  doc: TestDoc
): void {
  const path = resolve(context.root, 'docs', doc.path);
  const dir = resolve(path, '..');
  
  mkdirSync(dir, { recursive: true });

  // Add frontmatter if metadata exists
  const content = doc.metadata
    ? `---\n${JSON.stringify(doc.metadata, null, 2)}\n---\n\n${doc.content}`
    : doc.content;

  writeFileSync(path, content);
  context.docs.push(doc);
}

/**
 * Add a test template
 */
export function addTestTemplate(
  context: TestContext,
  template: TestTemplate
): void {
  const path = resolve(context.root, 'templates', `${template.name}.hbs`);
  writeFileSync(path, template.content);

  if (template.data) {
    const dataPath = resolve(context.root, 'data', `${template.name}.json`);
    writeFileSync(dataPath, JSON.stringify(template.data, null, 2));
  }

  context.templates.push(template);
}

/**
 * Run documentation tool in test context
 */
export function runTool(
  context: TestContext,
  command: string,
  args: string[] = []
): string {
  try {
    return execSync(
      `ts-node ../scripts/${command} ${args.join(' ')}`,
      {
        cwd: context.root,
        encoding: 'utf-8',
      }
    );
  } catch (error) {
    throw new Error(`Tool execution failed: ${error.message}`);
  }
}

/**
 * Parse markdown content
 */
export function parseMarkdown(content: string): marked.Token[] {
  return marked.lexer(content);
}

/**
 * Extract headings from markdown
 */
export function extractHeadings(content: string): string[] {
  const tokens = parseMarkdown(content);
  return tokens
    .filter(token => token.type === 'heading')
    .map(token => (token as marked.Tokens.Heading).text);
}

/**
 * Extract code blocks from markdown
 */
export function extractCode(content: string): string[] {
  const tokens = parseMarkdown(content);
  return tokens
    .filter(token => token.type === 'code')
    .map(token => (token as marked.Tokens.Code).text);
}

/**
 * Extract links from markdown
 */
export function extractLinks(content: string): { text: string; url: string }[] {
  const tokens = parseMarkdown(content);
  const links: { text: string; url: string }[] = [];

  tokens.forEach(token => {
    if (token.type === 'paragraph') {
      const matches = token.text.match(/\[([^\]]+)\]\(([^)]+)\)/g);
      if (matches) {
        matches.forEach(match => {
          const [, text, url] = match.match(/\[([^\]]+)\]\(([^)]+)\)/) || [];
          links.push({ text, url });
        });
      }
    }
  });

  return links;
}

/**
 * Validate documentation output
 */
export function validateOutput(
  content: string,
  options: {
    minLength?: number;
    requiredHeadings?: string[];
    requiredLinks?: string[];
    codeExamples?: number;
  } = {}
): boolean {
  const {
    minLength = 0,
    requiredHeadings = [],
    requiredLinks = [],
    codeExamples = 0,
  } = options;

  // Check length
  if (content.length < minLength) {
    return false;
  }

  // Check headings
  const headings = extractHeadings(content);
  if (!requiredHeadings.every(h => headings.includes(h))) {
    return false;
  }

  // Check links
  const links = extractLinks(content);
  if (!requiredLinks.every(l => links.some(link => link.url.includes(l)))) {
    return false;
  }

  // Check code examples
  if (extractCode(content).length < codeExamples) {
    return false;
  }

  return true;
}

/**
 * Process template with data and helpers
 */
export function processTemplate(
  template: string,
  data: any = {},
  helpers: Record<string, Function> = {}
): string {
  const compiledTemplate = compile(template);
  Object.entries(helpers).forEach(([name, helper]) => {
    compile.registerHelper(name, helper);
  });
  return compiledTemplate(data);
}

/**
 * Create test metadata
 */
export function createTestMetadata(overrides: Record<string, any> = {}): any {
  return {
    title: 'Test Document',
    description: 'Test description',
    version: '1.0.0',
    author: 'Test Author',
    date: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Simulate documentation generation
 */
export async function simulateGeneration(
  context: TestContext,
  options: {
    docs?: TestDoc[];
    templates?: TestTemplate[];
    command?: string;
  } = {}
): Promise<void> {
  const { docs = [], templates = [], command = 'generate-docs' } = options;

  // Add docs and templates
  docs.forEach(doc => addTestDoc(context, doc));
  templates.forEach(template => addTestTemplate(context, template));

  // Run generation
  await runTool(context, command);
}

/**
 * Create test error cases
 */
export function createTestErrors(): TestDoc[] {
  return [
    {
      path: 'invalid-heading.md',
      content: '#Invalid Heading\nNo space after #',
    },
    {
      path: 'broken-link.md',
      content: '[Broken Link](invalid-url)',
    },
    {
      path: 'missing-metadata.md',
      content: 'No frontmatter metadata',
    },
    {
      path: 'empty-section.md',
      content: '## Empty Section\n\n## Next Section',
    },
  ];
}