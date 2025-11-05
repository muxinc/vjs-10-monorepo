# Contributor Guide

First off, thank you for taking the time to contribute to **Video.js 10** ❤️
Your input helps shape the next generation of open web media players.
There are a variety of ways you can help out.

## Project Structure

This project is organized as a monorepo. Here's an overview:

- **Packages** - publicly published packages that make up the Video.js 10 media player framework
  - [core](./packages/core/) - shared platform/framework agnostic functionality, including
    - media store compositional definitions
    - media renderer and playback Engine functionality
    - common core component behaviors and functionality
  - [icons](./packages/icons/) - core (svg) icon set definitions used by platform/framework-specific implementations
  - [html](./packages/html/) - web component implementations of
    - media UI components
    - media icons
    - media renderers
    - media (state) providers
  - [react](./packages/react/) - React implementations of
    - media UI components
    - media icons
    - media renderers
    - media (state) providers
  - [utils](./packages/utils/) - various platform agnostic (shared) and platform specific (dom) utility functions
- **Examples** - example applications for using Video.js 10.
  - [html-demo](./examples/html-demo/) - an example application for using and smoke testing [@videojs/html](./packages/html/)
  - [react-demo](./examples/html-demo/) - an example application for using and smoke testing [@videojs/react](./packages/react/)
  - [next-demo](./examples/html-demo/) - an example application for using and smoke testing [@videojs/react](./packages/react/) (Useful for validating things like SSR or other complexities not surfaced by [react-demo](./examples/html-demo/)
- **Other**
  - [site](./site) - the codebase for the [Video.js 10 website](http://v10.videojs.org)

## 🎒 Getting Started

### Requirements

You’ll need the following installed:

- [Node.js](https://nodejs.org/en/download) (≥ 22.19.0)
- [Git](https://git-scm.com/downloads)
- [PNPM](https://pnpm.io/installation) (≥ 10.17.0)
- [Volta](https://docs.volta.sh/guide) or [NVM](https://github.com/nvm-sh/nvm) (we recommend Volta for automatic Node management)

> 💡 **Tip:** PNPM will automatically use the correct Node version when running scripts.
> If you prefer NVM: after installing it, simply run `nvm use` in the repo root.

---

### Fork & Clone

1. [Fork on GitHub][vjs-gh].
2. Clone your fork locally and set up upstream tracking:

```bash
git clone https://github.com/{your-github-username}/v10.git
cd v10

git remote add upstream git@github.com:videojs/v10.git
git fetch upstream
git branch --set-upstream-to=upstream/main main
```

To update your local main branch later:

```bash
git pull upstream --rebase
```

---

### Install Dependencies

```bash
pnpm install
```

Then build all workspace packages:

```bash
pnpm build:packages
```

> ℹ️ **VS Code Users:** the project may suggest extensions to enhance the developer
> experience.
> If imports like `react` are not resolving, set your TS version to the workspace one:
> `CMD/CTRL + Shift + P` → `TypeScript: Select TypeScript Version` → _Use Workspace Version_.

---

## 🏗 Development

Run the workspace in development mode:

```bash
pnpm dev
```

To run a specific app:

```bash
pnpm dev:html
pnpm dev:react
pnpm dev:site
```

---

## 🧹 Linting

Ensure your code follows our lint rules with:

```bash
pnpm lint
pnpm lint:fix
```

Pre‑commit hooks automatically lint staged files via **simple-git-hooks** and **lint‑staged**.

---

## 🧪 Testing

We use [Vitest](https://vitest.dev) for unit testing.

Run tests with:

```bash
pnpm test                 # all workspace tests
pnpm test:core            # just core package
pnpm test:core --watch
pnpm test:core file.spec
```

---

## 📦 Managing Dependencies

To add a dependency to a specific package:

```bash
pnpm -F <scope> add <package>
# Example:
pnpm -F react add @floating-ui/react-dom
```

To upgrade a dependency across all packages:

```bash
pnpm up <package>@<version> -r
```

---

## ✍️ Committing

We follow **[semantic commit messages][semantic-commit-style]** to enable automated releases.

Examples:

- `feat(core): add volume smoothing hook`
- `fix(react): correct prop mapping for picture-in-picture`
- `chore(root): update linting`

> 💡 Run `git log` to check recent examples before committing.

---

## 🎉 Pull Requests

When ready, push your branch and open a PR via the green **“Compare & Pull Request”** button.

- Keep PRs focused and small when possible.
- Give reviewers time to provide feedback.
- Even if a PR isn’t merged, your work helps shape the direction of Video.js 10 ❤️

To discuss larger ideas or prototypes, open a thread in:

- [Discord][discord]
- [GitHub Discussions][gh-discussions]

[vjs-gh]: https://github.com/videojs/v10
[semantic-commit-style]: https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716
[discord]: https://discord.gg/zdrCwByt
[gh-discussions]: https://github.com/videojs/v10/discussions
