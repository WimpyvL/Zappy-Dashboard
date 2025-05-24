# Contributing to Documentation

Thank you for your interest in contributing to our documentation! This guide will help you understand our documentation process and standards.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Documentation Structure](#documentation-structure)
- [Writing Guidelines](#writing-guidelines)
- [Submitting Changes](#submitting-changes)
- [Review Process](#review-process)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- Git

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/company/webhook.git
   cd webhook/scripts
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize documentation:
   ```bash
   npm run docs:init
   ```

## Development Environment

### Available Commands

```bash
# Generate documentation
npm run docs:generate

# Validate documentation
npm run docs:validate

# Watch for changes
npm run docs:watch

# Serve documentation locally
npm run docs:serve

# Fix common issues
npm run fix:all
```

### Directory Structure

```
docs/
├── api/            # API documentation
├── config/         # Configuration guides
├── database/       # Database documentation
├── errors/         # Error documentation
├── examples/       # Usage examples
├── security/       # Security documentation
├── testing/        # Testing documentation
└── types/          # Type documentation
```

## Documentation Structure

### Templates

We use Handlebars templates for consistent formatting:

- `index.hbs` - Landing pages
- `endpoint.hbs` - API endpoints
- `type.hbs` - Type definitions
- `error.hbs` - Error documentation
- `example.hbs` - Usage examples

### Data Sources

Documentation is generated from:
1. Source code comments
2. OpenAPI specification
3. TypeScript types
4. Custom YAML/JSON files

## Writing Guidelines

### General Principles

1. **Clarity**: Write clear, concise content
2. **Completeness**: Include all necessary information
3. **Correctness**: Ensure technical accuracy
4. **Consistency**: Follow established patterns

### Code Examples

- Include realistic, working examples
- Use TypeScript when possible
- Include error handling
- Add comments for complex logic

```typescript
// Good example
try {
  const client = new WebhookClient({
    secret: process.env.WEBHOOK_SECRET
  });
  
  await client.handleEvent(event);
} catch (error) {
  logger.error('Failed to handle webhook:', error);
  throw new WebhookError(error.message);
}
```

### API Documentation

1. Describe all parameters
2. Include request/response examples
3. Document error cases
4. Provide authentication details

### Type Documentation

1. Add JSDoc comments
2. Include usage examples
3. Document constraints
4. Show relationships

## Submitting Changes

### Pull Request Process

1. Create feature branch:
   ```bash
   git checkout -b docs/feature-name
   ```

2. Make changes and validate:
   ```bash
   npm run docs:validate
   ```

3. Commit changes:
   ```bash
   git add docs/
   git commit -m "docs: add feature documentation"
   ```

4. Open pull request

### Validation

All documentation changes must pass:
- OpenAPI validation
- Markdown linting
- Link checking
- Type validation

## Review Process

### Acceptance Criteria

1. Follows style guide
2. Passes validation
3. Includes examples
4. No broken links
5. Proper formatting

### Review Timeline

- Initial review: 2 business days
- Updates requested: 1 business day
- Final approval: 1 business day

## Best Practices

### Do's

✅ Use clear headings  
✅ Include code examples  
✅ Add error handling  
✅ Document edge cases  
✅ Link related docs  
✅ Add table of contents  
✅ Use proper formatting  

### Don'ts

❌ Skip validation  
❌ Leave TODO comments  
❌ Include sensitive data  
❌ Use unclear language  
❌ Duplicate content  
❌ Ignore templates  

## Help and Support

### Getting Help

- Create an issue
- Ask in #documentation channel
- Contact documentation team

### Resources

- [Documentation Guide](docs/guide.md)
- [Style Guide](docs/style.md)
- [Template Reference](docs/templates.md)

## Recognition

Contributors will be:
- Listed in docs/CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

Thank you for helping improve our documentation! 🎉