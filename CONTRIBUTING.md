# Contributing to SVU Community

Thank you for your interest in contributing! This document provides guidelines and best practices for contributing to the SVU Community platform.

## Code of Conduct

Be respectful, constructive, and collaborative. All contributors must adhere to the project's community guidelines.

## How to Contribute

### 1. Setup

Clone the repository and install dependencies:
```bash
git clone https://github.com/hozai/svu-community.git
cd "svu community v3.0.0_cleantree"
npm install
```

### 2. Create a Branch

```bash
git checkout -b feat/your-feature-name
```

### 3. Make Changes

- Follow the coding standards in `AGENTS.md`
- Write tests for any new functionality
- Ensure all tests pass before submitting
- Run `npm run lint` and fix any issues

### 4. Commit

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:
```
feat: add course search functionality
fix: resolve redirect loop on login
docs: update deployment guide
```

### 5. Push and Create Pull Request

```bash
git push origin feat/your-feature-name
```

Open a pull request with a clear description of your changes.

## Pull Request Checklist

- [ ] Tests added or updated
- [ ] Lint passes (`npm run lint`)
- [ ] TypeScript typechecks (`npm run typecheck`)
- [ ] All tests pass (`npm test`)
- [ ] Documentation updated (if applicable)
- [ ] No secrets committed
- [ ] Follows existing code style

## Code Review Process

All PRs require at least one approval before merging. Reviewers will check:
- Code correctness and security
- Test coverage
- Documentation completeness
- Performance implications

## Getting Help

If you have questions or need help:
- Open a discussion on GitHub
- Check existing documentation in `docs/`
- Review `apps/web/CRITICAL_FIXES_PLAN.md` for known issues
