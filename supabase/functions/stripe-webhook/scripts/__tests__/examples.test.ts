import { resolve } from 'path';
import { readFileSync } from 'fs';
import { load as loadYaml } from 'js-yaml';
import { compile } from 'handlebars';
import { marked } from 'marked';
import {
  createTestContext,
  processTemplate,
  validateOutput,
} from './helpers/test-utils';

describe('Documentation Examples', () => {
  const context = createTestContext('examples');
  
  afterAll(() => {
    context.cleanup();
  });

  describe('Example Data', () => {
    const data = loadYaml(
      readFileSync(
        resolve(__dirname, '__fixtures__/examples/data/examples.yml'),
        'utf-8'
      )
    ) as any;

    it('should have valid navigation', () => {
      expect(data.navigation).toBeInstanceOf(Array);
      data.navigation.forEach((item: any) => {
        expect(item).toMatchObject({
          title: expect.any(String),
          url: expect.stringMatching(/^\/docs\/.+/),
        });
      });
    });

    it('should have valid examples', () => {
      expect(data.examples).toBeInstanceOf(Array);
      data.examples.forEach((example: any) => {
        expect(example).toMatchObject({
          title: expect.any(String),
          description: expect.any(String),
          language: expect.stringMatching(/^[a-z]+$/),
          tags: expect.arrayContaining([expect.any(String)]),
          code: expect.any(String),
        });
      });
    });

    it('should have valid metadata', () => {
      expect(data.metadata).toMatchObject({
        title: expect.any(String),
        description: expect.any(String),
        author: expect.any(String),
        version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
        date: expect.any(String),
        tags: expect.arrayContaining([expect.any(String)]),
      });
    });

    it('should have valid settings', () => {
      expect(data.settings).toMatchObject({
        syntax: expect.any(Boolean),
        preview: expect.any(Boolean),
        lineNumbers: expect.any(Boolean),
        copyButton: expect.any(Boolean),
        theme: expect.any(String),
      });
    });
  });

  describe('Example Template', () => {
    const template = readFileSync(
      resolve(__dirname, '__fixtures__/examples/templates/example.hbs'),
      'utf-8'
    );

    it('should compile without errors', () => {
      expect(() => compile(template)).not.toThrow();
    });

    it('should handle metadata', () => {
      const output = processTemplate(template, {
        title: 'Test Title',
        description: 'Test Description',
        author: 'Test Author',
        date: '2025-05-24',
      });

      expect(output).toContain('Test Title');
      expect(output).toContain('Test Description');
      expect(output).toContain('Test Author');
      expect(output).toContain('2025-05-24');
    });

    it('should handle navigation', () => {
      const output = processTemplate(template, {
        navigation: [
          { title: 'Link 1', url: '/one' },
          { title: 'Link 2', url: '/two' },
        ],
      });

      expect(output).toContain('Link 1');
      expect(output).toContain('Link 2');
      expect(output).toContain('href="/one"');
      expect(output).toContain('href="/two"');
    });

    it('should handle code examples', () => {
      const output = processTemplate(template, {
        sections: [
          {
            title: 'Example 1',
            description: 'Test example',
            language: 'typescript',
            code: 'const test = "code";',
          },
        ],
      });

      expect(output).toContain('Example 1');
      expect(output).toContain('Test example');
      expect(output).toContain('language-typescript');
      expect(output).toContain('const test = "code";');
    });

    it('should handle tags', () => {
      const output = processTemplate(template, {
        tags: ['one', 'two', 'three'],
      });

      expect(output).toContain('class="tag"');
      expect(output).toContain('one');
      expect(output).toContain('two');
      expect(output).toContain('three');
    });
  });

  describe('Example Integration', () => {
    const markdown = readFileSync(
      resolve(__dirname, '__fixtures__/examples/docs/webhook-test.md'),
      'utf-8'
    );

    const template = readFileSync(
      resolve(__dirname, '__fixtures__/examples/templates/example.hbs'),
      'utf-8'
    );

    const data = loadYaml(
      readFileSync(
        resolve(__dirname, '__fixtures__/examples/data/examples.yml'),
        'utf-8'
      )
    ) as any;

    it('should generate valid documentation', () => {
      // Extract frontmatter
      const [, frontmatter, content] = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/) || [];
      const metadata = loadYaml(frontmatter);

      // Process markdown
      const html = marked(content);

      // Generate documentation
      const output = processTemplate(template, {
        ...metadata,
        content: html,
        ...data,
      });

      // Validate output
      expect(
        validateOutput(output, {
          minLength: 1000,
          requiredHeadings: ['Testing Stripe Webhooks', 'Overview', 'Examples'],
          requiredLinks: ['/docs/getting-started', '/docs/api'],
          codeExamples: 3,
        })
      ).toBe(true);
    });

    it('should handle code highlighting', () => {
      const output = processTemplate(template, {
        sections: data.examples,
        syntax: true,
      });

      expect(output).toContain('prismjs');
      expect(output).toContain('language-typescript');
      data.examples.forEach((example: any) => {
        expect(output).toContain(example.code.trim());
      });
    });

    it('should handle responsive layout', () => {
      const output = processTemplate(template, data);
      
      // Check for responsive meta tag
      expect(output).toContain('viewport');
      expect(output).toContain('width=device-width');

      // Check for responsive CSS
      expect(output).toContain('@media');
      expect(output).toContain('max-width');
    });

    it('should sanitize content', () => {
      const output = processTemplate(template, {
        content: '<script>alert("xss")</script>',
      });

      expect(output).not.toContain('<script>alert("xss")</script>');
    });
  });
});