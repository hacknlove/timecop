# Contributing to TimeCop

Thank you for your interest in contributing to TimeCop! This document provides guidelines and steps for contributing.

## Development Setup

1. Clone the repository:

```bash
git clone https://github.com/gmsllc/timecop.git
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

## Running Tests

Run the test suite:

```bash
npm test
```

Run linting:

```bash
npm run lint
```

Format code:

```bash
npm run format
```

## Development Workflow

1. Create a new branch:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and ensure:

   - All tests pass
   - Code is properly formatted
   - No linting errors
   - Documentation is updated

3. Commit your changes:

   - Use clear commit messages
   - Reference any relevant issues

4. Push your branch and create a Pull Request

## Pull Request Requirements

- Include tests for new functionality
- Update documentation if needed
- Ensure all checks pass
- Follow the existing code style
- Include a clear PR description with:
  - What changes were made
  - Why the changes were made
  - How to test the changes

## Project Structure

```
.
├── src/
│   ├── index.ts           # Main entry point
│   ├── types.ts           # Type definitions
│   └── utils/             # Utility functions
├── dist/                  # Compiled code
├── tests/                 # Test files
├── action.yml            # Action definition
└── package.json          # Project dependencies
```

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
