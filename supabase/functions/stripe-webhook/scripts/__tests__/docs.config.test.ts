import { resolve } from 'path';
import { config } from '../docs.config';
import { DocsConfig } from '../types/docs-config';
import { Validator } from 'jsonschema';
import { readFileSync } from 'fs';

describe('Documentation Configuration', () => {
  const schema = JSON.parse(
    readFileSync(resolve(__dirname, '../schemas/theme.json'), 'utf-8')
  );
  const validator = new Validator();

  describe('Project Configuration', () => {
    it('should have valid project info', () => {
      expect(config.project).toMatchObject({
        name: expect.any(String),
        version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
        description: expect.any(String),
        repository: expect.stringMatching(/^https?:\/\/.+/),
        license: expect.any(String),
      });
    });

    it('should have valid author information', () => {
      expect(config.project.author).toMatchObject({
        name: expect.any(String),
        email: expect.stringMatching(/^.+@.+\..+$/),
        url: expect.stringMatching(/^https?:\/\/.+/),
      });
    });
  });

  describe('Path Configuration', () => {
    it('should have required paths', () => {
      expect(config.paths).toMatchObject({
        docs: expect.any(String),
        source: expect.any(String),
        output: expect.any(Object),
        templates: expect.any(Object),
      });
    });

    it('should have valid output paths', () => {
      expect(config.paths.output).toMatchObject({
        typedoc: expect.stringContaining('docs'),
        openapi: expect.stringContaining('docs'),
        markdown: expect.stringContaining('docs'),
        types: expect.stringContaining('src'),
      });
    });

    it('should have valid template paths', () => {
      expect(config.paths.templates).toMatchObject({
        path: expect.stringContaining('templates'),
        data: expect.stringContaining('data'),
        helpers: expect.stringContaining('helpers'),
      });
    });
  });

  describe('Template Configuration', () => {
    it('should have default template', () => {
      expect(config.templates.default).toBe('default');
    });

    it('should have valid template definitions', () => {
      config.templates.templates.forEach((template) => {
        expect(template).toMatchObject({
          name: expect.any(String),
          path: expect.stringContaining('.hbs'),
          data: expect.stringMatching(/\.(yml|yaml|json)$/),
          output: expect.stringContaining('docs'),
        });
      });
    });
  });

  describe('Generation Configuration', () => {
    it('should have valid TypeDoc config', () => {
      expect(config.generation.typedoc).toMatchObject({
        entryPoints: expect.arrayContaining([expect.any(String)]),
        out: expect.stringContaining('docs'),
        theme: expect.any(String),
      });
    });

    it('should have valid OpenAPI config', () => {
      expect(config.generation.openapi).toMatchObject({
        title: expect.any(String),
        version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
        description: expect.any(String),
        servers: expect.arrayContaining([
          expect.objectContaining({
            url: expect.stringMatching(/^https?:\/\/.+/),
            description: expect.any(String),
          }),
        ]),
      });
    });

    it('should have valid markdown config', () => {
      expect(config.generation.markdown).toMatchObject({
        include: expect.arrayContaining([expect.any(String)]),
        exclude: expect.arrayContaining([expect.any(String)]),
        plugins: expect.arrayContaining([expect.any(String)]),
      });
    });
  });

  describe('Validation Configuration', () => {
    it('should have valid link checking config', () => {
      expect(config.validation.links).toMatchObject({
        checkExternal: expect.any(Boolean),
        ignore: expect.arrayContaining([expect.any(String)]),
        timeout: expect.any(Number),
      });
    });

    it('should have valid content validation', () => {
      expect(config.validation.content).toMatchObject({
        minWords: expect.any(Number),
        maxWords: expect.any(Number),
        requiredSections: expect.arrayContaining([expect.any(String)]),
      });
    });

    it('should have valid code validation', () => {
      expect(config.validation.code).toMatchObject({
        lint: expect.any(Boolean),
        test: expect.any(Boolean),
        format: expect.any(Boolean),
      });
    });
  });

  describe('Output Configuration', () => {
    it('should have valid asset config', () => {
      expect(config.output.assets).toMatchObject({
        from: expect.any(String),
        to: expect.stringContaining('docs'),
        include: expect.arrayContaining([expect.any(String)]),
      });
    });

    it('should have valid search config', () => {
      expect(config.output.search).toMatchObject({
        enabled: expect.any(Boolean),
        output: expect.stringContaining('docs'),
        options: expect.objectContaining({
          fields: expect.arrayContaining([expect.any(String)]),
          boosts: expect.any(Object),
        }),
      });
    });
  });

  describe('Version Configuration', () => {
    it('should have valid versioning config', () => {
      expect(config.versioning).toMatchObject({
        enabled: expect.any(Boolean),
        dir: expect.any(String),
        latest: expect.any(String),
        format: expect.stringContaining('${'),
      });
    });

    it('should have valid archive settings', () => {
      expect(config.versioning.archive).toMatchObject({
        enabled: expect.any(Boolean),
        path: expect.any(String),
        keep: expect.any(Number),
      });
    });
  });

  describe('Analysis Configuration', () => {
    it('should have valid threshold settings', () => {
      expect(config.analysis.thresholds).toMatchObject({
        score: expect.any(Number),
        coverage: expect.any(Number),
        readability: expect.any(Number),
      });
    });

    it('should have valid weight settings', () => {
      expect(config.analysis.weights).toMatchObject({
        spelling: expect.any(Number),
        formatting: expect.any(Number),
        structure: expect.any(Number),
        content: expect.objectContaining({
          low: expect.any(Number),
          medium: expect.any(Number),
          high: expect.any(Number),
        }),
      });
    });

    it('should have valid ignore settings', () => {
      expect(config.analysis.ignore).toMatchObject({
        files: expect.arrayContaining([expect.any(String)]),
        issues: expect.arrayContaining([expect.any(String)]),
      });
    });
  });

  describe('Theme Configuration', () => {
    it('should validate against schema', () => {
      const themes = resolve(__dirname, '../templates/themes');
      const defaultTheme = readFileSync(
        resolve(themes, 'default.yml'),
        'utf-8'
      );
      const result = validator.validate(defaultTheme, schema);
      expect(result.valid).toBe(true);
    });
  });
});