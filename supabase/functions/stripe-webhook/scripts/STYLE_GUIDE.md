# Documentation Style Guide

This guide defines the style and formatting standards for our documentation.

## General Principles

1. **Clarity**: Write clear, concise, and unambiguous content
2. **Consistency**: Maintain consistent style throughout
3. **Completeness**: Include all necessary information
4. **Correctness**: Ensure technical accuracy

## Writing Style

### Voice and Tone

- Use active voice
- Write in present tense
- Be direct and objective
- Maintain professional tone
- Use second person ("you")

✅ Good:
```text
You can configure the webhook handler using environment variables.
```

❌ Bad:
```text
The webhook handler will be configured by using environment variables.
```

### Formatting

#### Headers

- Use sentence case
- No punctuation at end
- Maximum 3 levels deep
- Clear hierarchy

```markdown
# Main title
## Section title
### Subsection title
```

#### Lists

- Use bullet points for unordered lists
- Use numbers for sequential steps
- Capitalize first word
- End with period if complete sentence

✅ Good:
```markdown
1. Install dependencies.
2. Configure environment.
3. Start server.

- Supports multiple events
- Handles retries automatically
- Validates signatures
```

#### Code Blocks

- Use appropriate language tags
- Include meaningful examples
- Add comments for clarity
- Format consistently

```typescript
// Initialize webhook handler
const handler = new WebhookHandler({
  secret: process.env.WEBHOOK_SECRET,
  maxRetries: 3
});
```

## Technical Documentation

### API Documentation

#### Endpoints

- Include HTTP method
- Show complete path
- List all parameters
- Document responses

```markdown
## Create Webhook

POST /api/webhooks

Creates a new webhook endpoint.

### Parameters

| Name   | Type   | Required | Description        |
|--------|--------|----------|--------------------|
| url    | string | Yes      | Webhook URL        |
| events | array  | Yes      | Events to monitor  |

### Response

```json
{
  "id": "webhook_123",
  "url": "https://api.example.com/webhook",
  "events": ["payment.succeeded"]
}
```
```

#### Error Documentation

- List error codes
- Explain causes
- Show example responses
- Provide resolution steps

### Type Documentation

- Document all properties
- Include type constraints
- Show relationships
- Add usage examples

```typescript
/**
 * Webhook configuration options.
 *
 * @property secret - Webhook signing secret
 * @property maxRetries - Maximum retry attempts
 * @property timeout - Request timeout in ms
 */
interface WebhookOptions {
  secret: string;
  maxRetries?: number;
  timeout?: number;
}
```

## Markdown Guidelines

### Links

- Use descriptive text
- Check for broken links
- Prefer relative paths
- Include title attributes

✅ Good:
```markdown
[View webhook configuration guide](../config/webhooks.md "Webhook Configuration")
```

### Images

- Include alt text
- Use descriptive filenames
- Optimize for web
- Caption when needed

```markdown
![Webhook flow diagram](./images/webhook-flow.png "Webhook request flow")
```

### Tables

- Include headers
- Align columns
- Use consistent format
- Add padding

```markdown
| Status | Description          | Action Required |
|--------|---------------------|-----------------|
| 200    | Success            | None            |
| 400    | Invalid request    | Check payload   |
| 401    | Unauthorized       | Check secret    |
```

## Best Practices

### Do's

- ✅ Update table of contents
- ✅ Check spelling and grammar
- ✅ Validate code examples
- ✅ Include version info
- ✅ Link related docs
- ✅ Use consistent terminology
- ✅ Add metadata

### Don'ts

- ❌ Use slang or jargon
- ❌ Include sensitive data
- ❌ Leave placeholder text
- ❌ Duplicate content
- ❌ Skip validation
- ❌ Mix formats
- ❌ Ignore templates

## File Organization

### Directory Structure

```
docs/
├── README.md          # Overview
├── api/               # API docs
│   ├── index.md      # API intro
│   └── webhooks.md   # Webhook API
├── examples/          # Code examples
└── reference/         # Technical reference
```

### File Naming

- Use lowercase
- Separate words with hyphens
- Be descriptive
- Include type if needed

Examples:
```
webhook-configuration.md
error-handling.md
rate-limits.md
```

## Version Control

### Commit Messages

Format:
```
docs: brief description

Longer description with details
[skip ci] if no build needed
```

### Branches

Format:
```
docs/feature-name
docs/fix-issue
```

## Review Guidelines

### Checklist

- [ ] Follows style guide
- [ ] No spelling errors
- [ ] Code examples work
- [ ] Links valid
- [ ] Images optimized
- [ ] ToC updated
- [ ] Metadata complete

### Common Issues

- Missing punctuation
- Inconsistent capitalization
- Broken code examples
- Dead links
- Outdated content
- Poor formatting
- Unclear explanations

## Tools

### Recommended

- VS Code with extensions:
  - markdownlint
  - Prettier
  - Code Spell Checker
- Preview tools:
  - Docsify
  - GitHub Pages

### Validation

```bash
# Lint markdown
npm run lint:md

# Check links
npm run check:links

# Validate all
npm run validate:docs
```

## Questions

For questions about style:
1. Check this guide
2. Ask in #documentation
3. Create an issue

Remember: When in doubt, prioritize clarity and consistency!