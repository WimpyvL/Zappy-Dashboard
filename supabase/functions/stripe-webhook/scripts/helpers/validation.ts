import { readFileSync } from 'fs';
import { resolve } from 'path';
import { format } from 'prettier';
import { validate as validateOpenAPI } from '@stoplight/spectral-core';
import { Validator } from 'jsonschema';
import { remark } from 'remark';
import remarkLint from 'remark-lint';
import remarkValidateLinks from 'remark-validate-links';
import { Link, LinkChecker } from 'markdown-link-check';
import { OpenAPIV3 } from 'openapi-types';

/**
 * Documentation Validation Utilities
 * Validates generated documentation for correctness and consistency
 */

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  type: string;
  message: string;
  path: string;
  line?: number;
  column?: number;
}

interface ValidationWarning {
  type: string;
  message: string;
  path: string;
  line?: number;
  column?: number;
}

export class DocumentationValidator {
  private validator: Validator;
  private linkChecker: LinkChecker;
  private remarkProcessor: any;

  constructor() {
    this.validator = new Validator();
    this.linkChecker = new LinkChecker();
    this.remarkProcessor = remark()
      .use(remarkLint)
      .use(remarkValidateLinks);
  }

  /**
   * Validate OpenAPI specification
   */
  async validateOpenAPI(path: string): Promise<ValidationResult> {
    try {
      const content = readFileSync(path, 'utf-8');
      const spec: OpenAPIV3.Document = JSON.parse(content);
      
      const results = await validateOpenAPI(spec);
      
      return {
        valid: results.length === 0,
        errors: results
          .filter((r) => r.severity === 0)
          .map((r) => ({
            type: 'openapi',
            message: r.message,
            path: r.path.join('/'),
          })),
        warnings: results
          .filter((r) => r.severity === 1)
          .map((r) => ({
            type: 'openapi',
            message: r.message,
            path: r.path.join('/'),
          })),
      };
    } catch (error) {
      return {
        valid: false,
        errors: [{
          type: 'openapi',
          message: `Failed to validate OpenAPI: ${error}`,
          path: path,
        }],
        warnings: [],
      };
    }
  }

  /**
   * Validate Markdown documentation
   */
  async validateMarkdown(path: string): Promise<ValidationResult> {
    try {
      const content = readFileSync(path, 'utf-8');
      
      // Validate markdown syntax
      const syntaxResults = await this.remarkProcessor.process(content);
      
      // Check links
      const links = await this.linkChecker.check(content);
      
      const errors = [
        ...syntaxResults.messages
          .filter((m: any) => m.fatal)
          .map((m: any) => ({
            type: 'markdown',
            message: m.reason,
            path: path,
            line: m.line,
            column: m.column,
          })),
        ...links
          .filter((l: Link) => !l.valid)
          .map((l: Link) => ({
            type: 'link',
            message: `Broken link: ${l.url}`,
            path: path,
          })),
      ];

      const warnings = syntaxResults.messages
        .filter((m: any) => !m.fatal)
        .map((m: any) => ({
          type: 'markdown',
          message: m.reason,
          path: path,
          line: m.line,
          column: m.column,
        }));

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [{
          type: 'markdown',
          message: `Failed to validate Markdown: ${error}`,
          path: path,
        }],
        warnings: [],
      };
    }
  }

  /**
   * Validate TypeScript types
   */
  async validateTypes(path: string): Promise<ValidationResult> {
    try {
      const content = readFileSync(path, 'utf-8');
      
      // Format and validate syntax
      const formatted = await format(content, {
        parser: 'typescript',
        printWidth: 80,
      });

      // TODO: Add type checking using TypeScript compiler API
      
      return {
        valid: true,
        errors: [],
        warnings: [],
      };
    } catch (error) {
      return {
        valid: false,
        errors: [{
          type: 'typescript',
          message: `Failed to validate TypeScript: ${error}`,
          path: path,
        }],
        warnings: [],
      };
    }
  }

  /**
   * Validate documentation schema
   */
  validateSchema(content: any, schema: any): ValidationResult {
    try {
      const result = this.validator.validate(content, schema);
      
      return {
        valid: result.valid,
        errors: result.errors.map((e) => ({
          type: 'schema',
          message: e.message || 'Schema validation error',
          path: e.property,
        })),
        warnings: [],
      };
    } catch (error) {
      return {
        valid: false,
        errors: [{
          type: 'schema',
          message: `Failed to validate schema: ${error}`,
          path: 'root',
        }],
        warnings: [],
      };
    }
  }

  /**
   * Validate documentation structure
   */
  validateStructure(dir: string, expectedFiles: string[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    expectedFiles.forEach((file) => {
      const path = resolve(dir, file);
      try {
        readFileSync(path);
      } catch (error) {
        errors.push({
          type: 'structure',
          message: `Missing required file: ${file}`,
          path: path,
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Format validation results
   */
  formatResults(results: ValidationResult): string {
    const output: string[] = [];

    if (results.errors.length > 0) {
      output.push('\n❌ Errors:');
      results.errors.forEach((error) => {
        output.push(`  - [${error.type}] ${error.message}`);
        if (error.line) {
          output.push(`    at ${error.path}:${error.line}:${error.column}`);
        } else {
          output.push(`    in ${error.path}`);
        }
      });
    }

    if (results.warnings.length > 0) {
      output.push('\n⚠️ Warnings:');
      results.warnings.forEach((warning) => {
        output.push(`  - [${warning.type}] ${warning.message}`);
        if (warning.line) {
          output.push(`    at ${warning.path}:${warning.line}:${warning.column}`);
        } else {
          output.push(`    in ${warning.path}`);
        }
      });
    }

    if (output.length === 0) {
      output.push('✅ All validations passed');
    }

    return output.join('\n');
  }
}

export default new DocumentationValidator();