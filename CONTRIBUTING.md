# Contributing

First off, thank you for taking the time to contribute to **Video.js 10** ❤️
Your input helps shape the next generation of open web media players.

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
git clone https://github.com/{your-github-username}/vjs-10-monorepo.git
cd vjs-10-monorepo

git remote add upstream git@github.com:videojs/vjs-10-monorepo.git
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

[vjs-gh]: https://github.com/videojs/vjs-10-monorepo
[semantic-commit-style]: https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716
[discord]: https://discord.gg/b664Gq3pdy
[gh-discussions]: https://github.com/videojs/vjs-10-monorepo/discussions
