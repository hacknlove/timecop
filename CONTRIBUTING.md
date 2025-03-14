# Contributing to TimeCop

Thank you for your interest in contributing to TimeCop! This document provides guidelines and steps for contributing.

## Development Setup

1. Clone the repository:

```bash
git clone https://github.com/hacknlove/timecop.git
cd timecop
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

## Project Structure

```
.
├── src/
│   ├── index.ts              # Main entry point
│   ├── types.ts              # Shared type definitions
│   ├── collectors/           # Requirement collectors
│   │   ├── label.ts         # Label-based requirements
│   │   ├── description.ts   # PR description requirements
│   │   └── commit.ts        # Commit message requirements
│   └── utils/               # Utility functions
│       ├── github-client.ts # GitHub API interactions
│       ├── pr-validator.ts  # PR validation logic
│       ├── date-parser.ts   # Date parsing and validation
│       └── timezone.ts      # Timezone handling
├── __tests__/               # Test files
│   ├── unit/               # Unit tests
│   └── integration/        # Integration tests
├── dist/                    # Compiled code
├── action.yml              # Action definition
└── package.json            # Project dependencies
```

## Running Tests

There are several types of tests:

### Unit Tests

Run the test suite:

```bash
npm test
```

### Integration Tests

Tests that interact with GitHub's API:

```bash
# For public repos, no token needed:
npm run test:integration

# For private repos or higher rate limits:
GITHUB_TOKEN=your_github_token npm run test:integration
```

Note: Integration tests use real GitHub API calls. They work without a token for public repositories,
but providing a token is recommended for development to avoid rate limiting.

Run linting:

```bash
npm run lint
```

Format code:

```bash
npm run format
```

## Development Workflow

1. **Fork and Clone**

   - Fork the repository on GitHub
   - Clone your fork locally

2. **Create a Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Development Loop**

   - Write your code
   - Add tests
   - Run tests: `npm test`
   - Run linting: `npm run lint`
   - Format code: `npm run format`

4. **Before Submitting**

   - Run `npm run check` to verify everything
   - Update documentation if needed
   - Add comments explaining complex logic

5. **Commit Guidelines**

   - Use clear commit messages
   - Reference issues/PRs where appropriate
   - Keep commits focused and atomic

6. **Pull Request Process**
   - Create PR against main branch
   - Fill out PR template
   - Wait for CI checks
   - Address review comments

## Pull Request Requirements

- Include tests for new functionality
- Update documentation if needed
- Ensure all checks pass
- Follow the existing code style
- Include a clear PR description with:
  - What changes were made
  - Why the changes were made
  - How to test the changes

## Code Style

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Add JSDoc comments for public APIs
- Keep functions focused and small
- Use meaningful variable names
- Add comments explaining complex logic

## Building the Action

The action needs to be built before changes can be tested:

1. Make your changes
2. Run the build:

```bash
npm run build
```

3. Commit the `dist` directory

## Release Process

1. Update version in package.json
2. Create a new release in GitHub
3. Tag the release following semver (v1.0.0)
4. Update action.yml if needed

## Need Help?

If you have questions or need help, you can:

- Open an issue
- Ask questions in PR comments
- Review existing PRs and issues

## Code of Conduct

- Be respectful and inclusive
- Keep discussions professional
- Focus on the technical merits
- Help others learn and grow

## License

By contributing to TimeCop, you agree that your contributions will be licensed under the MIT License.
