#!/usr/bin/env node
import { program } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { load as loadYaml } from 'js-yaml';
import { OpenAPIV3 } from 'openapi-types';
import { Project, SourceFile, TypeAliasDeclaration, InterfaceDeclaration } from 'ts-morph';

program
  .name('generate-types')
  .description('Generate TypeScript definitions from OpenAPI spec')
  .requiredOption('-i, --input <path>', 'Input OpenAPI spec file')
  .requiredOption('-o, --output <path>', 'Output TypeScript file')
  .option('-p, --prefix <string>', 'Type prefix', '')
  .parse(process.argv);

const options = program.opts();

async function generateTypes() {
  try {
    // Read OpenAPI spec
    const specPath = resolve(options.input);
    const content = readFileSync(specPath, 'utf-8');
    const spec: OpenAPIV3.Document = specPath.endsWith('.json')
      ? JSON.parse(content)
      : loadYaml(content) as OpenAPIV3.Document;

    // Initialize TypeScript project
    const project = new Project({
      useInMemoryFileSystem: true,
      skipFileDependencyResolution: true,
    });

    // Create source file
    const sourceFile = project.createSourceFile(options.output, '', {
      overwrite: true,
    });

    // Add header comment
    addFileHeader(sourceFile, spec);

    // Generate types
    generateSchemaTypes(sourceFile, spec);
    generateRequestTypes(sourceFile, spec);
    generateResponseTypes(sourceFile, spec);
    generateUtilityTypes(sourceFile);

    // Format and save
    sourceFile.formatText();
    writeFileSync(options.output, sourceFile.getFullText());
    console.log(`TypeScript definitions generated: ${options.output}`);
  } catch (error) {
    console.error('Error generating types:', error);
    process.exit(1);
  }
}

function addFileHeader(sourceFile: SourceFile, spec: OpenAPIV3.Document): void {
  sourceFile.addStatements(`/**
 * Generated Types for ${spec.info.title}
 * Version: ${spec.info.version}
 * Generated on: ${new Date().toISOString()}
 *
 * This file is auto-generated. Do not edit directly.
 */

/* eslint-disable */
// @ts-nocheck
`);
}

function generateSchemaTypes(sourceFile: SourceFile, spec: OpenAPIV3.Document): void {
  const schemas = spec.components?.schemas || {};

  Object.entries(schemas).forEach(([name, schema]) => {
    if (!schema || !('type' in schema)) return;

    if (schema.type === 'object') {
      generateInterface(sourceFile, name, schema);
    } else {
      generateTypeAlias(sourceFile, name, schema);
    }
  });
}

function generateInterface(
  sourceFile: SourceFile,
  name: string,
  schema: OpenAPIV3.SchemaObject
): InterfaceDeclaration {
  const interfaceDecl = sourceFile.addInterface({
    name: `${options.prefix}${name}`,
    isExported: true,
  });

  if (schema.description) {
    interfaceDecl.addJsDoc({ description: schema.description });
  }

  Object.entries(schema.properties || {}).forEach(([propName, propSchema]) => {
    if (!('type' in propSchema)) return;

    const isRequired = schema.required?.includes(propName) ?? false;
    const type = getTypeFromSchema(propSchema);
    const property = interfaceDecl.addProperty({
      name: propName,
      type,
      hasQuestionToken: !isRequired,
    });

    if (propSchema.description) {
      property.addJsDoc({ description: propSchema.description });
    }
  });

  return interfaceDecl;
}

function generateTypeAlias(
  sourceFile: SourceFile,
  name: string,
  schema: OpenAPIV3.SchemaObject
): TypeAliasDeclaration {
  const type = getTypeFromSchema(schema);
  const typeAlias = sourceFile.addTypeAlias({
    name: `${options.prefix}${name}`,
    type,
    isExported: true,
  });

  if (schema.description) {
    typeAlias.addJsDoc({ description: schema.description });
  }

  return typeAlias;
}

function generateRequestTypes(sourceFile: SourceFile, spec: OpenAPIV3.Document): void {
  Object.entries(spec.paths || {}).forEach(([path, methods]) => {
    Object.entries(methods || {}).forEach(([method, operation]) => {
      if (!operation) return;

      const requestBody = 'requestBody' in operation ? operation.requestBody : undefined;
      if (!requestBody || !('content' in requestBody)) return;

      const schema = requestBody.content['application/json']?.schema;
      if (!schema) return;

      const typeName = `${options.prefix}${capitalize(operation.operationId || '')}Request`;
      if ('$ref' in schema) {
        generateTypeAlias(sourceFile, typeName, {
          type: 'object',
          allOf: [{ $ref: schema.$ref }],
        });
      } else {
        generateInterface(sourceFile, typeName, schema);
      }
    });
  });
}

function generateResponseTypes(sourceFile: SourceFile, spec: OpenAPIV3.Document): void {
  Object.entries(spec.paths || {}).forEach(([path, methods]) => {
    Object.entries(methods || {}).forEach(([method, operation]) => {
      if (!operation || !operation.responses) return;

      Object.entries(operation.responses).forEach(([code, response]) => {
        if (!('content' in response)) return;

        const schema = response.content?.['application/json']?.schema;
        if (!schema) return;

        const typeName = `${options.prefix}${capitalize(operation.operationId || '')}Response${code}`;
        if ('$ref' in schema) {
          generateTypeAlias(sourceFile, typeName, {
            type: 'object',
            allOf: [{ $ref: schema.$ref }],
          });
        } else {
          generateInterface(sourceFile, typeName, schema);
        }
      });
    });
  });
}

function generateUtilityTypes(sourceFile: SourceFile): void {
  sourceFile.addStatements([
    `export type ApiResponse<T> = {
      data: T;
      success: boolean;
      error?: {
        code: string;
        message: string;
      };
    };`,
    `export type ApiError = {
      code: string;
      message: string;
      details?: Record<string, any>;
    };`,
  ]);
}

function getTypeFromSchema(schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject): string {
  if ('$ref' in schema) {
    const name = schema.$ref.split('/').pop() || 'any';
    return `${options.prefix}${name}`;
  }

  if (!('type' in schema)) return 'any';

  switch (schema.type) {
    case 'string':
      if (schema.enum) {
        return schema.enum.map(e => `'${e}'`).join(' | ');
      }
      return 'string';
    case 'number':
    case 'integer':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array':
      return `Array<${getTypeFromSchema(schema.items)}>`;
    case 'object':
      if (schema.additionalProperties) {
        const valueType = getTypeFromSchema(schema.additionalProperties);
        return `Record<string, ${valueType}>`;
      }
      const properties = schema.properties || {};
      const types = Object.entries(properties).map(([key, value]) => {
        const type = getTypeFromSchema(value);
        const required = schema.required?.includes(key) ? '' : '?';
        return `${key}${required}: ${type}`;
      });
      return types.length ? `{ ${types.join('; ')} }` : 'Record<string, any>';
    default:
      return 'any';
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Run generator
generateTypes().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});