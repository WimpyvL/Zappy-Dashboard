# Documentation Tools

Tools for generating, validating, and publishing documentation for the Stripe webhook handler.

## Overview

This package contains a set of tools for managing project documentation:

- 📚 Documentation generation from source code
- 🔍 Validation and quality checks
- 📦 Publishing and deployment
- 🔄 Automatic updates
- 🎨 Template-based formatting

## Installation

```bash
# Install dependencies
npm install

# Initialize documentation environment
npm run docs:init
```

## Usage

### Generate Documentation

```bash
# Generate all documentation
npm run docs:generate

# Generate specific parts
npm run openapi:generate    # OpenAPI spec
npm run types:generate      # TypeScript types
npm run markdown:generate   # Markdown docs
```

### Validate Documentation

```bash
# Validate all documentation
npm run docs:validate

# Validate specific parts
npm run validate:openapi    # OpenAPI spec
npm run validate:markdown   # Markdown docs
npm run validate:types      # TypeScript types

# Fix validation issues
npm run fix:all
```

### Watch for Changes

```bash
# Watch documentation files
npm run docs:watch

# Serve documentation locally
npm run docs:serve
```

### Publish Documentation

```bash
# Publish to Git
npm run docs:publish

# Deploy to Supabase
npm run docs:deploy -- \
  --project <project-id> \
  --key <service-role-key> \
  --bucket docs
```

## Directory Structure

```
.
├── data/               # Documentation data files
├── helpers/            # Helper functions
├── templates/          # Handlebars templates
├── docs.config.ts      # Configuration
├── generate-docs.ts    # Generation script
├── validate-docs.ts    # Validation script
├── publish-docs.ts     # Publishing script
└── deploy-docs.ts      # Deployment script
```

## Templates

### Available Templates

- `index.hbs` - Landing page
- `endpoint.hbs` - API endpoints
- `type.hbs` - Type definitions
- `error.hbs` - Error documentation
- `example.hbs` - Usage examples
- `database.hbs` - Database schema
- `monitoring.hbs` - Monitoring setup
- `security.hbs` - Security guide
- `config.hbs` - Configuration guide
- `testing.hbs` - Testing guide

### Template Data

Templates use data from:
- OpenAPI specification
- TypeScript types
- Custom YAML/JSON files
- Source code comments

## Configuration

### docs.config.ts

```typescript
{
  project: {
    name: string;
    version: string;
    description: string;
  };
  paths: {
    docs: string;
    source: string;
    output: {
      typedoc: string;
      openapi: string;
      markdown: string;
      types: string;
    };
  };
  // ... other options
}
```

### Environment Variables

```bash
# Required
SUPABASE_PROJECT_ID=your-project-id
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional
DOCS_BUCKET=docs
DOCS_PUBLIC=true
```

## Validation Rules

### OpenAPI

- Valid OpenAPI 3.1.0 specification
- Required fields present
- Example values provided
- Security defined
- Operations documented

### Markdown

- Valid markdown syntax
- Links working
- Headers properly nested
- Code blocks valid
- Images accessible

### Types

- Valid TypeScript
- Documentation comments
- Examples provided
- Proper exports
- No type errors

## CI/CD Integration

### GitHub Actions

```yaml
name: Documentation

on:
  push:
    branches: [main]
    paths:
      - 'docs/**'
      - 'src/**/*.ts'

jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run docs:validate
      - run: npm run docs:publish
      - run: npm run docs:deploy
```

## Contributing

1. Create documentation in appropriate template
2. Generate documentation: `npm run docs:generate`
3. Validate changes: `npm run docs:validate`
4. Submit pull request

## Troubleshooting

### Common Issues

- **Validation Errors**: Run `npm run fix:all` to auto-fix common issues
- **Build Failures**: Check template syntax and data files
- **Missing Content**: Ensure source files are properly documented
- **Deployment Errors**: Verify Supabase credentials and permissions

### Support

- Create an issue for bugs/features
- See [CONTRIBUTING.md](../CONTRIBUTING.md)
- Contact maintainers

## License

MIT License - see [LICENSE](../LICENSE)