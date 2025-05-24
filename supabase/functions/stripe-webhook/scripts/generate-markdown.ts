#!/usr/bin/env node
import { program } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { load as loadYaml } from 'js-yaml';
import { OpenAPIV3 } from 'openapi-types';

program
  .name('generate-markdown')
  .description('Generate Markdown documentation from OpenAPI spec')
  .requiredOption('-i, --input <path>', 'Input OpenAPI spec file')
  .requiredOption('-o, --output <path>', 'Output markdown file')
  .parse(process.argv);

const options = program.opts();

async function generateMarkdown() {
  try {
    // Read OpenAPI spec
    const specPath = resolve(options.input);
    const content = readFileSync(specPath, 'utf-8');
    const spec: OpenAPIV3.Document = specPath.endsWith('.json')
      ? JSON.parse(content)
      : loadYaml(content) as OpenAPIV3.Document;

    // Generate markdown
    const markdown = [
      generateHeader(spec),
      generateDescription(spec),
      generateAuthentication(spec),
      generateEndpoints(spec),
      generateSchemas(spec),
      generateWebhooks(spec),
      generateErrors(spec),
    ].join('\n\n');

    // Write output
    writeFileSync(options.output, markdown);
    console.log(`Markdown documentation generated: ${options.output}`);
  } catch (error) {
    console.error('Error generating markdown:', error);
    process.exit(1);
  }
}

function generateHeader(spec: OpenAPIV3.Document): string {
  return [
    `# ${spec.info.title}`,
    `\`v${spec.info.version}\``,
    '',
    spec.info.description || '',
  ].join('\n');
}

function generateDescription(spec: OpenAPIV3.Document): string {
  return [
    '## Overview',
    '',
    'This API handles Stripe webhook events, providing:',
    '',
    '- Secure event reception',
    '- Signature verification',
    '- Event processing',
    '- Response handling',
  ].join('\n');
}

function generateAuthentication(spec: OpenAPIV3.Document): string {
  return [
    '## Authentication',
    '',
    'All webhook requests must include the `Stripe-Signature` header.',
    '',
    '```http',
    'Stripe-Signature: t=timestamp,v1=signature',
    '```',
  ].join('\n');
}

function generateEndpoints(spec: OpenAPIV3.Document): string {
  const paths = spec.paths || {};
  const sections = Object.entries(paths).map(([path, methods]) => {
    const endpoints = Object.entries(methods || {}).map(([method, operation]) => {
      if (!operation) return '';

      return [
        `### ${operation.summary || path}`,
        '',
        operation.description || '',
        '',
        '**Endpoint:**',
        '```http',
        `${method.toUpperCase()} ${path}`,
        '```',
        '',
        generateParameters(operation),
        generateRequestBody(operation),
        generateResponses(operation),
      ].join('\n');
    });

    return endpoints.join('\n\n');
  });

  return ['## Endpoints', '', ...sections].join('\n');
}

function generateParameters(operation: OpenAPIV3.OperationObject): string {
  if (!operation.parameters?.length) return '';

  const params = operation.parameters.map((param) => {
    if (!('name' in param)) return '';
    return `- \`${param.name}\` (${param.in}) - ${param.description || ''}`;
  });

  return ['**Parameters:**', '', ...params, ''].join('\n');
}

function generateRequestBody(operation: OpenAPIV3.OperationObject): string {
  if (!operation.requestBody) return '';

  const content = 'content' in operation.requestBody
    ? operation.requestBody.content
    : undefined;

  if (!content?.['application/json']?.schema) return '';

  return [
    '**Request Body:**',
    '```json',
    JSON.stringify(generateExample(content['application/json'].schema), null, 2),
    '```',
    '',
  ].join('\n');
}

function generateResponses(operation: OpenAPIV3.OperationObject): string {
  if (!operation.responses) return '';

  const responses = Object.entries(operation.responses).map(([code, response]) => {
    if (!('content' in response)) return '';

    const content = response.content?.['application/json']?.schema;
    if (!content) return '';

    return [
      `**${code} Response:**`,
      '```json',
      JSON.stringify(generateExample(content), null, 2),
      '```',
    ].join('\n');
  });

  return responses.join('\n\n');
}

function generateSchemas(spec: OpenAPIV3.Document): string {
  const schemas = spec.components?.schemas || {};
  const sections = Object.entries(schemas).map(([name, schema]) => {
    if (!schema) return '';

    return [
      `### ${name}`,
      '',
      'schema' in schema ? schema.description || '' : '',
      '',
      '```typescript',
      generateTypeDefinition(name, schema),
      '```',
    ].join('\n');
  });

  return ['## Schemas', '', ...sections].join('\n');
}

function generateTypeDefinition(name: string, schema: OpenAPIV3.SchemaObject): string {
  if (schema.type !== 'object') return `type ${name} = any;`;

  const properties = schema.properties || {};
  const props = Object.entries(properties).map(([prop, def]) => {
    const required = schema.required?.includes(prop) ? '' : '?';
    const type = getTypeFromSchema(def);
    return `  ${prop}${required}: ${type};`;
  });

  return [
    `interface ${name} {`,
    ...props,
    '}',
  ].join('\n');
}

function generateWebhooks(spec: OpenAPIV3.Document): string {
  return [
    '## Webhooks',
    '',
    'The webhook handler supports the following Stripe events:',
    '',
    '- `payment.succeeded`',
    '- `payment.failed`',
    '- `customer.subscription.created`',
    '- `customer.subscription.updated`',
    '- `customer.subscription.deleted`',
  ].join('\n');
}

function generateErrors(spec: OpenAPIV3.Document): string {
  return [
    '## Error Handling',
    '',
    'The API uses conventional HTTP response codes:',
    '',
    '- `200` - Success',
    '- `400` - Bad Request',
    '- `401` - Unauthorized',
    '- `422` - Unprocessable Entity',
    '- `429` - Too Many Requests',
    '- `500` - Internal Server Error',
  ].join('\n');
}

function generateExample(schema: OpenAPIV3.SchemaObject): any {
  if (schema.example) return schema.example;
  if (schema.type === 'object') {
    const obj: Record<string, any> = {};
    Object.entries(schema.properties || {}).forEach(([key, prop]) => {
      if ('type' in prop) {
        obj[key] = generateExample(prop);
      }
    });
    return obj;
  }
  return null;
}

function getTypeFromSchema(schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject): string {
  if ('$ref' in schema) {
    return schema.$ref.split('/').pop() || 'any';
  }
  if ('type' in schema) {
    switch (schema.type) {
      case 'string': return 'string';
      case 'number': return 'number';
      case 'boolean': return 'boolean';
      case 'array': return `${getTypeFromSchema(schema.items)}[]`;
      case 'object': return 'Record<string, any>';
      default: return 'any';
    }
  }
  return 'any';
}

// Run generator
generateMarkdown().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});