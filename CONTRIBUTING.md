# Contributing to Text-to-PDF Converter

Thank you for your interest in contributing! This document outlines the process and guidelines for contributing to this project.

## Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [Code Style Guidelines](#code-style-guidelines)
- [Branch Naming Conventions](#branch-naming-conventions)
- [Commit Message Format](#commit-message-format)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)

---

## Development Environment Setup

### Prerequisites

- **Node.js** 18.x or 20.x
- **pnpm** 10.x (`npm install -g pnpm`)
- Git

### Steps

```bash
# 1. Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/text-to-pdf-converter.git
cd text-to-pdf-converter

# 2. Install dependencies
pnpm install

# 3. Build the shared package
pnpm --filter @text2pdf/pdf-engine build

# 4. Start development servers
pnpm dev
```

The frontend will be available at `http://localhost:3000` and the API at `http://localhost:4000`.

---

## Code Style Guidelines

- **TypeScript** is required for all new code — no plain `.js` files in `src/`.
- Use `import type` for type-only imports when `verbatimModuleSyntax` is enabled.
- Prefer `const` over `let`; avoid `var`.
- Keep functions small and focused (single responsibility).
- Add JSDoc comments for exported functions and complex logic.
- Run `pnpm format` before committing to apply Prettier formatting.
- Run `pnpm lint` to check for TypeScript and ESLint errors.

---

## Branch Naming Conventions

Use the following prefixes for branch names:

| Prefix      | Purpose                                          |
| ----------- | ------------------------------------------------ |
| `feat/`     | New feature                                      |
| `fix/`      | Bug fix                                          |
| `docs/`     | Documentation only                               |
| `refactor/` | Code refactoring without behavior change         |
| `test/`     | Adding or improving tests                        |
| `chore/`    | Maintenance tasks (dependency updates, CI, etc.) |
| `perf/`     | Performance improvement                          |

**Examples:**

```
feat/markdown-preview
fix/file-upload-validation
docs/api-reference
```

---

## Commit Message Format

This project uses [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance (CI, build, deps)
- `perf`: Performance improvement

### Scopes (optional)

- `web`: Frontend changes
- `api`: Backend changes
- `pdf-engine`: Shared PDF library changes
- `ci`: CI/CD pipeline changes

### Examples

```
feat(web): add dark mode toggle
fix(api): handle empty text in convert endpoint
docs: update deployment guide
chore(deps): bump pdf-lib to 1.17.1
```

---

## Pull Request Process

1. **Create a branch** from `main` following the branch naming convention.
2. **Make your changes** with tests where applicable.
3. **Run the full test suite** locally: `pnpm test` (once testing infrastructure is set up).
4. **Ensure the build passes**: `pnpm build`.
5. **Run lint checks**: `pnpm lint`.
6. **Update documentation** if you changed public APIs or added features.
7. **Submit the PR** with a clear description of what changed and why.
8. **Link any related issues** using GitHub keywords (`Closes #123`).
9. **Wait for CI** — all checks must pass before merge.
10. **Address review feedback** promptly.

PRs are merged using **squash and merge** to keep a clean history on `main`.

---

## Testing Requirements

- All new features must include tests.
- Bug fixes must include a regression test.
- Maintain test coverage above 80%.
- Run tests with: `pnpm test` (unit) and `pnpm test:e2e` (end-to-end).

---

## Questions?

Open a [GitHub Discussion](https://github.com/sarthaksha9709/text-to-pdf-converter/discussions) or file an [issue](https://github.com/sarthaksha9709/text-to-pdf-converter/issues).
