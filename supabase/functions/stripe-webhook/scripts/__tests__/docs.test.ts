import { resolve } from 'path';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import validator from '../helpers/validation';

describe('Documentation Tools', () => {
  const testDir = resolve(__dirname, 'test-docs');
  const templateDir = resolve(__dirname, '../templates');

  beforeAll(() => {
    // Create test directories
    mkdirSync(testDir, { recursive: true });
    mkdirSync(resolve(testDir, 'api'), { recursive: true });
    mkdirSync(resolve(testDir, 'types'), { recursive: true });
  });

  afterAll(() => {
    // Clean up test directories
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('Documentation Generation', () => {
    it('should generate OpenAPI documentation', async () => {
      // Create test OpenAPI spec
      const spec = {
        openapi: '3.1.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {
          '/test': {
            get: {
              summary: 'Test endpoint',
              responses: {
                '200': {
                  description: 'Success',
                },
              },
            },
          },
        },
      };

      writeFileSync(
        resolve(testDir, 'openapi.json'),
        JSON.stringify(spec, null, 2)
      );

      // Generate documentation
      execSync(`ts-node ../generate-openapi.ts -i ${resolve(testDir, 'openapi.json')} -o ${resolve(testDir, 'api/index.md')}`);

      // Verify output
      const output = readFileSync(resolve(testDir, 'api/index.md'), 'utf-8');
      expect(output).toContain('Test API');
      expect(output).toContain('Test endpoint');
    });

    it('should generate TypeScript types', async () => {
      // Create test type definition
      const type = `
        export interface TestType {
          /** Test field */
          field: string;
        }
      `;

      writeFileSync(resolve(testDir, 'test.ts'), type);

      // Generate documentation
      execSync(`ts-node ../generate-types.ts -i ${resolve(testDir, 'test.ts')} -o ${resolve(testDir, 'types/index.md')}`);

      // Verify output
      const output = readFileSync(resolve(testDir, 'types/index.md'), 'utf-8');
      expect(output).toContain('TestType');
      expect(output).toContain('Test field');
    });
  });

  describe('Documentation Validation', () => {
    it('should validate OpenAPI specification', async () => {
      // Create valid spec
      const validSpec = {
        openapi: '3.1.0',
        info: {
          title: 'Valid API',
          version: '1.0.0',
        },
        paths: {},
      };

      writeFileSync(
        resolve(testDir, 'valid.json'),
        JSON.stringify(validSpec, null, 2)
      );

      const result = await validator.validateOpenAPI(resolve(testDir, 'valid.json'));
      expect(result.valid).toBe(true);
    });

    it('should catch invalid OpenAPI specification', async () => {
      // Create invalid spec
      const invalidSpec = {
        openapi: '3.1.0',
        // Missing required 'info' field
        paths: {},
      };

      writeFileSync(
        resolve(testDir, 'invalid.json'),
        JSON.stringify(invalidSpec, null, 2)
      );

      const result = await validator.validateOpenAPI(resolve(testDir, 'invalid.json'));
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate Markdown documentation', async () => {
      // Create valid markdown
      const validMd = `# Test Document
      
## Section 1

Valid markdown content.

\`\`\`typescript
const test = "code";
\`\`\`
`;

      writeFileSync(resolve(testDir, 'valid.md'), validMd);

      const result = await validator.validateMarkdown(resolve(testDir, 'valid.md'));
      expect(result.valid).toBe(true);
    });

    it('should catch invalid Markdown', async () => {
      // Create invalid markdown
      const invalidMd = `# Missing space after#
Wrong indent
  * Invalid list
`;

      writeFileSync(resolve(testDir, 'invalid.md'), invalidMd);

      const result = await validator.validateMarkdown(resolve(testDir, 'invalid.md'));
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Template Handling', () => {
    it('should process Handlebars templates', () => {
      // Create test template
      const template = `# {{title}}

{{description}}

## Features

{{#each features}}
- {{this}}
{{/each}}`;

      writeFileSync(resolve(templateDir, 'test.hbs'), template);

      // Create test data
      const data = {
        title: 'Test Title',
        description: 'Test description',
        features: ['Feature 1', 'Feature 2'],
      };

      writeFileSync(
        resolve(testDir, 'data.json'),
        JSON.stringify(data, null, 2)
      );

      // Generate from template
      execSync(`ts-node ../generate-docs.ts -t test -d ${resolve(testDir, 'data.json')} -o ${resolve(testDir, 'output.md')}`);

      // Verify output
      const output = readFileSync(resolve(testDir, 'output.md'), 'utf-8');
      expect(output).toContain('Test Title');
      expect(output).toContain('Test description');
      expect(output).toContain('Feature 1');
      expect(output).toContain('Feature 2');
    });
  });

  describe('CLI Commands', () => {
    it('should handle CLI options', () => {
      const result = execSync('ts-node ../generate-docs.ts --help').toString();
      expect(result).toContain('Options:');
      expect(result).toContain('--template');
      expect(result).toContain('--output');
    });

    it('should handle validation commands', () => {
      const result = execSync('ts-node ../validate-docs.ts --help').toString();
      expect(result).toContain('Options:');
      expect(result).toContain('--fix');
      expect(result).toContain('--report');
    });
  });
});