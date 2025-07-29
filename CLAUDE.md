# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a Video.js 10 monorepo organized by platform/runtime with a clear dependency hierarchy:

### Package Structure
- **Core packages** (`packages/core/*`) - Runtime-agnostic packages that form the foundation
- **HTML packages** (`packages/html/*`) - DOM/Browser-specific implementations 
- **React packages** (`packages/react/*`) - React-specific implementations
- **React Native packages** (`packages/react-native/*`) - React Native implementations

### Dependency Hierarchy
- Core packages have no dependencies on other vjs-10 packages
- HTML packages depend only on core packages
- React packages depend only on core packages (with React peer deps)
- React Native packages depend only on core packages (with React Native peer deps)

This prevents circular dependencies and ensures maximum reusability.

### Key Core Packages
- `@vjs-10/media-store` - State management for media players
- `@vjs-10/playback-engine` - Abstraction layer for media engines (HLS.js, Dash.js, etc.)
- `@vjs-10/media` - HTMLMediaElement contracts and utilities
- `@vjs-10/icons` - SVG icon definitions and utilities

## Common Development Commands

### Monorepo Commands (run from root)
```bash
# Install all dependencies
npm install

# Build all packages
npm run build

# Run tests across all packages
npm run test

# Type checking across all packages
npm run typecheck

# Lint all packages
npm run lint

# Clean all packages
npm run clean
```

### Working with Specific Packages
```bash
# Build specific package
npm run build --workspace=@vjs-10/media-store

# Work in specific package directory
cd packages/core/media-store
npm run build
```

## TypeScript Configuration

The monorepo uses TypeScript project references for efficient compilation:
- `tsconfig.base.json` - Shared compiler options with strict settings
- `tsconfig.json` - Root config with path mappings and project references
- Each package has its own `tsconfig.json` extending the base

Key TypeScript features:
- Strict mode enabled with additional checks (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- Path mappings for all `@vjs-10/*` packages point to source directories
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

This uses npm workspaces with the following workspace patterns:
- `packages/core/*`
- `packages/html/*` 
- `packages/react/*`
- `packages/react-native/*`

Internal dependencies use `workspace:*` protocol for linking between packages.

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
- `feat(media-store): add pause state management`
- `fix(react-icons): resolve SVG rendering issue`
- `docs(readme): update installation instructions`
- `chore(deps): update typescript to 5.4.0`

### Breaking Changes
For breaking changes, add `!` after the type/scope:
```
feat!: remove deprecated playback API
feat(media-store)!: change state interface structure
```