#!/usr/bin/env node
import { program } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { load as loadYaml, dump as dumpYaml } from 'js-yaml';
import * as TypeDoc from 'typedoc';
import { OpenAPIV3 } from 'openapi-types';

program
  .name('generate-openapi')
  .description('Generate OpenAPI documentation from TypeScript')
  .requiredOption('-o, --output <path>', 'Output file path')
  .option('-t, --title <title>', 'API title', 'Stripe Webhook Handler')
  .option('-v, --version <version>', 'API version', '1.0.0')
  .option('-d, --description <text>', 'API description')
  .parse(process.argv);

const options = program.opts();

async function generateOpenAPI() {
  try {
    // Initialize TypeDoc
    const app = new TypeDoc.Application();
    app.options.addReader(new TypeDoc.TSConfigReader());

    // Configure TypeDoc
    app.bootstrap({
      entryPoints: ['src/index.ts'],
      tsconfig: 'tsconfig.json',
      excludePrivate: true,
      excludeInternal: true,
    });

    // Generate documentation
    const project = app.convert();
    if (!project) {
      throw new Error('Failed to generate TypeDoc documentation');
    }

    // Extract API information
    const apiSpec: OpenAPIV3.Document = {
      openapi: '3.1.0',
      info: {
        title: options.title,
        version: options.version,
        description: options.description,
      },
      paths: extractPaths(project),
      components: {
        schemas: extractSchemas(project),
        securitySchemes: {
          stripeSignature: {
            type: 'apiKey',
            name: 'Stripe-Signature',
            in: 'header',
          },
        },
      },
    };

    // Write output
    const outputPath = resolve(options.output);
    if (outputPath.endsWith('.json')) {
      writeFileSync(outputPath, JSON.stringify(apiSpec, null, 2));
    } else {
      writeFileSync(outputPath, dumpYaml(apiSpec));
    }

    console.log(`OpenAPI documentation generated: ${outputPath}`);
  } catch (error) {
    console.error('Error generating OpenAPI documentation:', error);
    process.exit(1);
  }
}

function extractPaths(project: TypeDoc.ProjectReflection): OpenAPIV3.PathsObject {
  const paths: OpenAPIV3.PathsObject = {};

  // Extract webhook handler path
  paths['/stripe'] = {
    post: {
      summary: 'Handle Stripe webhook event',
      operationId: 'handleWebhook',
      tags: ['webhook'],
      security: [{ stripeSignature: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/WebhookEvent',
            },
          },
        },
      },
      responses: extractResponses(),
    },
  };

  return paths;
}

function extractSchemas(project: TypeDoc.ProjectReflection): Record<string, OpenAPIV3.SchemaObject> {
  const schemas: Record<string, OpenAPIV3.SchemaObject> = {};

  // Process type declarations
  project.children?.forEach((child) => {
    if (child.kindString === 'Interface' || child.kindString === 'Type alias') {
      schemas[child.name] = convertTypeToSchema(child);
    }
  });

  return schemas;
}

function convertTypeToSchema(type: TypeDoc.DeclarationReflection): OpenAPIV3.SchemaObject {
  const schema: OpenAPIV3.SchemaObject = {
    type: 'object',
    properties: {},
    required: [],
  };

  type.children?.forEach((prop) => {
    const propertySchema = getPropertySchema(prop);
    if (propertySchema) {
      schema.properties![prop.name] = propertySchema;
      if (isRequired(prop)) {
        schema.required!.push(prop.name);
      }
    }
  });

  return schema;
}

function getPropertySchema(prop: TypeDoc.DeclarationReflection): OpenAPIV3.SchemaObject | undefined {
  const type = prop.type;
  if (!type) return undefined;

  switch (type.type) {
    case 'intrinsic':
      return {
        type: type.name.toLowerCase(),
        description: prop.comment?.shortText,
      };
    case 'reference':
      return {
        $ref: `#/components/schemas/${type.name}`,
      };
    case 'union':
      return {
        oneOf: type.types.map((t) => getPropertySchema({ ...prop, type: t })),
      };
    default:
      return {
        type: 'object',
        description: prop.comment?.shortText,
      };
  }
}

function isRequired(prop: TypeDoc.DeclarationReflection): boolean {
  return !prop.flags.isOptional;
}

function extractResponses(): OpenAPIV3.ResponsesObject {
  return {
    '200': {
      description: 'Event processed successfully',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/SuccessResponse',
          },
        },
      },
    },
    '400': {
      description: 'Invalid request',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ErrorResponse',
          },
        },
      },
    },
    // Add other response codes...
  };
}

// Run generator
generateOpenAPI().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});