# Contributing Guide

Thank you for considering contributing to the Stripe webhook handler! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/webhook.git
   cd webhook
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

## Development Process

1. Create a new branch:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. Make your changes following our conventions:
   - Use TypeScript
   - Follow ESLint rules
   - Write tests for new features
   - Update documentation as needed

3. Run tests:
   ```bash
   npm run test        # Unit tests
   npm run test:int    # Integration tests
   npm run test:e2e    # End-to-end tests
   ```

4. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```
   Follow [Conventional Commits](https://www.conventionalcommits.org/) format:
   - `feat:` New features
   - `fix:` Bug fixes
   - `docs:` Documentation changes
   - `style:` Code style changes
   - `refactor:` Code refactoring
   - `perf:` Performance improvements
   - `test:` Test updates
   - `chore:` Maintenance tasks

5. Push to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```

6. Create a Pull Request following the template

## Pull Request Process

1. Fill out the PR template completely
2. Ensure all checks pass:
   - Tests
   - Linting
   - Type checking
   - Code coverage
3. Request review from maintainers
4. Address review feedback
5. Update documentation if needed
6. Ensure CI/CD pipeline passes

## Testing Guidelines

- Write unit tests for all new functions
- Include integration tests for database operations
- Add end-to-end tests for critical paths
- Maintain 80% code coverage minimum
- Test error scenarios and edge cases

## Code Style

- Use TypeScript strictly
- Follow ESLint configuration
- Use Prettier for formatting
- Keep functions small and focused
- Write meaningful comments
- Use descriptive variable names

## Documentation

Update documentation when you:
- Add new features
- Change existing functionality
- Modify database schema
- Update configuration options
- Change deployment process

## Security

- Never commit secrets or credentials
- Use environment variables for sensitive data
- Validate all webhook inputs
- Implement rate limiting
- Follow security best practices
- Report vulnerabilities privately

## Database Changes

1. Create new migration:
   ```bash
   npm run migration:create your-migration-name
   ```
2. Update types and schemas
3. Add rollback procedure
4. Test migrations locally
5. Update documentation

## Monitoring

When adding features, consider:
- Adding relevant metrics
- Creating dashboard panels
- Setting up alerts
- Logging important events
- Error tracking

## Release Process

1. Follow semantic versioning
2. Update changelog
3. Create release notes
4. Tag the release
5. Deploy to staging
6. Verify functionality
7. Deploy to production

## Getting Help

- Check the documentation
- Join our Discord community
- Ask in GitHub Discussions
- Contact maintainers
- Review existing issues

## License

By contributing, you agree that your contributions will be licensed under the project's license.

## Questions?

Feel free to open an issue for:
- Feature discussions
- Bug reports
- Documentation improvements
- General questions

Thank you for contributing! 🚀