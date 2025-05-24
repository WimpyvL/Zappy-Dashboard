import { readFileSync } from 'fs';
import { resolve } from 'path';
import { load as loadYaml } from 'js-yaml';
import { Validator } from 'jsonschema';

describe('Validation Configuration', () => {
  // Load validation schema and config
  const schema = JSON.parse(
    readFileSync(resolve(__dirname, '../schemas/validation.json'), 'utf-8')
  );
  const config = loadYaml(
    readFileSync(resolve(__dirname, '../config/validation.yml'), 'utf-8')
  );
  const validator = new Validator();

  describe('Schema Validation', () => {
    it('should have valid schema structure', () => {
      expect(schema.$schema).toBe('http://json-schema.org/draft-07/schema#');
      expect(schema.type).toBe('object');
      expect(schema.required).toBeDefined();
      expect(Array.isArray(schema.required)).toBe(true);
    });

    it('should define all required sections', () => {
      const requiredSections = [
        'content',
        'structure',
        'code',
        'style',
        'technical',
        'metadata',
        'links',
        'files',
        'reports'
      ];

      requiredSections.forEach(section => {
        expect(schema.required).toContain(section);
        expect(schema.properties[section]).toBeDefined();
      });
    });

    it('should validate numeric constraints', () => {
      // Check content word limits
      expect(schema.properties.content.properties.words.properties.min.minimum).toBe(0);
      expect(schema.properties.content.properties.words.properties.max.minimum).toBe(0);

      // Check readability scores
      expect(schema.properties.content.properties.readability.properties.fleschKincaid.maximum).toBe(100);
      expect(schema.properties.content.properties.readability.properties.gradeLevel.minimum).toBe(0);
    });

    it('should validate enum values', () => {
      // Check complexity levels
      expect(schema.properties.content.properties.readability.properties.complexity.enum)
        .toEqual(['low', 'medium', 'high']);

      // Check report levels
      expect(schema.properties.reports.properties.levels.items.enum)
        .toEqual(['error', 'warning', 'info']);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate against schema', () => {
      const result = validator.validate(config, schema);
      expect(result.valid).toBe(true);
    });

    it('should have valid content rules', () => {
      expect(config.content.words.min).toBeLessThan(config.content.words.max);
      expect(config.content.words.optimal).toBeGreaterThan(config.content.words.min);
      expect(config.content.words.optimal).toBeLessThan(config.content.words.max);
    });

    it('should have valid structure rules', () => {
      expect(config.structure.headings.max_depth).toBeGreaterThan(0);
      expect(config.structure.headings.max_depth).toBeLessThanOrEqual(6);
      expect(config.structure.lists.max_depth).toBeGreaterThan(0);
    });

    it('should have valid code rules', () => {
      expect(config.code.blocks.max_length).toBeGreaterThan(0);
      expect(config.code.inline.max_length).toBeGreaterThan(0);
      expect(config.code.inline.max_length).toBeLessThan(config.code.blocks.max_length);
    });
  });

  describe('Metadata Rules', () => {
    it('should have required metadata fields', () => {
      const requiredFields = [
        'title',
        'description',
        'author',
        'date',
        'version'
      ];

      requiredFields.forEach(field => {
        expect(config.metadata.required).toContain(field);
      });
    });

    it('should not have duplicates between required and optional', () => {
      const intersection = config.metadata.required.filter(
        field => config.metadata.optional.includes(field)
      );
      expect(intersection).toHaveLength(0);
    });
  });

  describe('Link Rules', () => {
    it('should have valid timeout value', () => {
      expect(config.links.validation.timeout).toBeGreaterThan(0);
    });

    it('should have valid ignore patterns', () => {
      config.links.validation.ignore_patterns.forEach(pattern => {
        expect(typeof pattern).toBe('string');
        expect(pattern.length).toBeGreaterThan(0);
      });
    });
  });

  describe('File Rules', () => {
    it('should have valid file pattern', () => {
      expect(() => new RegExp(config.files.naming.pattern)).not.toThrow();
    });

    it('should have allowed file extensions', () => {
      expect(config.files.naming.extensions).toContain('md');
      config.files.naming.extensions.forEach(ext => {
        expect(typeof ext).toBe('string');
        expect(ext).toMatch(/^[a-z0-9]+$/);
      });
    });
  });

  describe('Custom Rules', () => {
    it('should have valid product names', () => {
      config.custom.company.product_names.forEach(name => {
        expect(typeof name).toBe('string');
        expect(name.length).toBeGreaterThan(0);
      });
    });

    it('should have valid terminology mapping', () => {
      Object.entries(config.custom.company.terminology).forEach(([key, value]) => {
        expect(typeof key).toBe('string');
        expect(typeof value).toBe('string');
        expect(key.length).toBeGreaterThan(0);
        expect(value.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Report Rules', () => {
    it('should have valid output configuration', () => {
      expect(config.reports.output.directory).toBeTruthy();
      expect(config.reports.output.filename).toBeTruthy();
      expect(config.reports.formats.length).toBeGreaterThan(0);
    });

    it('should have valid error levels', () => {
      const validLevels = ['error', 'warning', 'info'];
      config.reports.levels.forEach(level => {
        expect(validLevels).toContain(level);
      });
    });
  });
});