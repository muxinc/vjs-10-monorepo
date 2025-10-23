# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a Video.js 10 monorepo organized by platform/runtime with a clear dependency hierarchy:

### Package Structure

- **Core package** (`packages/core`) - Runtime-agnostic packages that form the foundation
- **HTML package** (`packages/html`) - DOM/Browser-specific implementation
- **React package** (`packages/react`) - React-specific implementation
- **React Native package** (`packages/react-native`) - React Native implementation
- **Examples** (`examples/*`) - Demo applications for different platforms
- **Website** (`website/`) - Astro-based website, including documentation and blog

### Dependency Hierarchy

- Core packages have no dependencies on other vjs-10 packages
- HTML packages depend only on core packages
- React packages depend only on core packages (with React peer deps)
- React Native packages depend only on core packages (with React Native peer deps)

This prevents circular dependencies and ensures maximum reusability.

## Common Development Commands

### Monorepo Commands (run from root)

```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm build

# Build only library packages (excludes examples)
pnpm build:libs

# Run tests across all packages
pnpm test

# Type checking across all packages
pnpm typecheck

# Lint all packages
pnpm lint

# Clean all packages
pnpm clean
```

### Development Servers

```bash
# Run HTML demo
pnpm dev:html

# Run React demo
pnpm dev:react

# Run website
pnpm dev:website

# Run all dev servers in parallel
pnpm dev
```

### Working with Specific Packages

```bash
# Build specific package
pnpm --filter @videojs/core build

# Run website independently
cd website
pnpm dev

# Work in specific package directory
cd packages/core
pnpm build
```

## TypeScript Configuration

The monorepo uses TypeScript project references for efficient compilation:

- `tsconfig.base.json` - Shared compiler options with strict settings
- `tsconfig.json` - Root config with path mappings and project references
- Each package has its own `tsconfig.json` extending the base

Key TypeScript features:

- Strict mode enabled with additional checks (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- Path mappings for all `@videojs/*` packages point to source directories
- Composite builds for incremental compilation

## Package Development

### Individual Package Scripts

Most packages follow this pattern:

```bash
npm run build    # Compile TypeScript (tsc)
npm run test     # Currently placeholder "No tests yet"
npm run clean    # Remove dist directory
```

### Package Types

- **Core packages** - Pure TypeScript, no external dependencies
- **HTML packages** - May include DOM-specific code, depend on core packages
- **React packages** - Include React peer dependencies, depend on core packages
- **React Native packages** - Include React Native peer dependencies (react-native-video, react-native-svg)

## Workspace Management

This uses pnpm workspaces with the following workspace patterns:

- `packages/core` - Core library package
- `packages/html` - HTML/DOM package
- `packages/react` - React package
- `packages/react-native` - React Native package
- `examples/*` - Demo applications
- `website` - Website (Astro)

Internal dependencies use `workspace:*` protocol for linking between packages.

### Website

The `website/` directory contains an Astro-based website with its own dependencies and build process. It's integrated into the monorepo workspace but can be developed independently:

```bash
# From root - runs via Turbo
pnpm dev:website

# From website directory - runs directly
cd website && pnpm dev
```

The website uses Astro with MDX support for content authoring.

## Git Workflow

This project uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#specification) for commit messages.

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Common Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, semicolons, etc.)
- `refactor:` - Code refactoring without feature changes
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks, dependency updates

### Scope Examples

Use package names or areas of the codebase:

- `feat(core): add pause state management`
- `fix(icons): resolve SVG rendering issue`
- `docs(readme): update installation instructions`
- `chore(deps): update typescript to 5.4.0`

### Breaking Changes

For breaking changes, add `!` after the type/scope:

```
feat!: remove deprecated playback API
feat(media-store)!: change state interface structure
```
