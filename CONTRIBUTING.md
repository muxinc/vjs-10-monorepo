# Contributor Guide

First off, thank you for taking the time to contribute to **Video.js 10** ❤️
Your input helps shape the next generation of open web media players.
There are a variety of ways you can help out.

> [!NOTE]
> If you're looking to contribute to the current version of Video.js (v8), please refer to its [contributor guide][vjs-contributor-guide] instead.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Filing issues](#filing-issues)
  - [Reporting a Bug](#reporting-a-bug)
  - [Requesting a Feature](#requesting-a-feature)
- [🎒 Contributing code](#-contributing-code)
  - [Running locally](#running-locally)
    - [Prerequisites](#prerequisites)
    - [Fork & Clone](#fork--clone)
    - [Install Dependencies](#install-dependencies)
    - [🏗 Building & Development](#-building--development)
    - [🧹 Style & Linting](#-style--linting)
    - [🧪 Testing](#-testing)
    - [📦 Managing Dependencies](#-managing-dependencies)
  - [Making Changes](#making-changes)
    - [Step 1: Verify](#step-1-verify)
    - [Step 2: Update remote](#step-2-update-remote)
    - [Step 3: Branch](#step-3-branch)
    - [Step 4: Commits](#step-4-commits)
    - [Step 5: Test](#step-5-test)
    - [Step 6: Pushing & Pull Requests](#step-6-pushing--pull-requests)
- [Community Engagement](#community-engagement)
- [Developer's Certificate of Origin 1.1](#developers-certificate-of-origin-11)
- [Doc Credit](#doc-credit)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Filing issues

[GitHub Issues](https://github.com/videojs/v10/issues) are used for all discussions around the codebase, including **bugs**, **features**, and other **enhancements**.

When filling out an issue, please respond to all of the questions in the template, including as much information as possible.

### Reporting a Bug

**A bug is a demonstrable problem** that is caused by the code in the repository. Good bug reports are extremely helpful. Thank You!

Guidelines for bug reports:

1. Use the [GitHub issue search](https://github.com/videojs/v10/issues) — check if the issue has already been reported.
1. Check if the issue has already been fixed — try to reproduce it using the latest `main` branch in the repository.
1. Isolate the problem — **create a [reduced test case](https://stackoverflow.com/help/minimal-reproducible-example)** with a live example.
1. Answer all questions in the issue template. The questions in the issue template are designed to try and provide the maintainers with as much information possible to minimize back-and-forth to get the issue resolved.

A good bug report should be as detailed as possible, so that others won't have to follow up for the essential details.

**[File a bug report](https://github.com/videojs/v10/issues/new?template=1.bug_report.yml)**

### Requesting a Feature

1. [Search the issues](https://github.com/videojs/v10/issues) and [ideas](https://github.com/videojs/v10/discussions/categories/ideas) for any previous requests for the same feature, and give a thumbs up or +1 on existing requests.
1. If no previous requests exist, create a new issue. Please be as clear as possible about why the feature is needed and the intended use case.
1. Once again, be as detailed as possible and follow the issue template.

- **[Request a smaller feature](https://github.com/videojs/v10/issues/new?template=2.feature_request.yml)**
- **[Propose a larger feature](https://github.com/videojs/v10/discussions/new?category=ideas)**

### Providing Docs Feedback

1. [Search the issues](https://github.com/videojs/v10/issues) for any potential overlapping docs feedback, and give a thumbs up or +1 on existing requests.
1. If no previous requests exist, create a new issue. Please be as clear as possible about your docs feedback.
1. Once again, be as detailed as possible and follow the issue template.

**[Provide docs feedback](https://github.com/videojs/v10/issues/new?template=3.docs_feedback.yml)**

## 🎒 Contributing code

To contribute code you'll need to be able to build a copy of Video.js and run tests locally. There are a few requirements before getting started.

### Running locally

> [!IMPORTANT]
> Video.js 10 is set up a monorepo using [`pnpm` workspaces](https://pnpm.io/workspaces). As such, most scripts run will be done from the project/workspace root. Unless otherwise specified, assume commands and similar should be run from the root directory. For a high level breakdown of the monorepo structure, see the [README](./README.md#project-structure).

#### Prerequisites

You’ll need the following installed:

- [Node.js](https://nodejs.org/en/download) (≥ 22.19.0)
- [Git](https://git-scm.com/downloads)
- [PNPM](https://pnpm.io/installation) (≥ 10.17.0)
- [Volta](https://docs.volta.sh/guide) or [NVM](https://github.com/nvm-sh/nvm) (we recommend Volta for automatic Node management)

> [!TIP]
> PNPM will automatically use the correct Node version when running scripts.
> If you prefer NVM: after installing it, simply run `nvm use` in the repo root.

---

#### Fork & Clone

1. [Fork on GitHub][vjs-gh].
2. Clone your fork locally and set up upstream tracking:

```sh
git clone https://github.com/{your-github-username}/v10.git
cd v10

git remote add upstream git@github.com:videojs/v10.git
git fetch upstream
git branch --set-upstream-to=upstream/main main
```

To update your local main branch later:

```sh
git fetch upstream
git checkout main
git pull upstream main
```

---

#### Install Dependencies

```sh
pnpm install
```

Then build all workspace packages:

```sh
pnpm build:packages
```

> ℹ️ **VS Code Users:** the project may suggest extensions to enhance the developer
> experience.
> If imports like `react` are not resolving, set your TS version to the workspace one:
> `CMD/CTRL + Shift + P` → `TypeScript: Select TypeScript Version` → _Use Workspace Version_.

---

#### 🏗 Building & Development

To facilitate faster iterations when experimenting, smoke testing, and validating code changes, we employ "developer mode",
which watches for code changes and automatically rebuilds (and reloads) all core code, including framework packages, example applications, and our website.

To run the workspace in development mode:

```sh
pnpm dev
```

This will run the entire workspace in developer mode, meaning all applications (examples and website) will also be started on their respective ports.

To run a specific application:

```sh
pnpm dev:html
pnpm dev:react
pnpm dev:next
pnpm dev:site
```

Sometimes you may want to do (non-dev) builds, say, to validate the full build process or evaluate production artifacts.

As mentioned above, you can build just our framework packages via:

```sh
pnpm build:packages
```

To build all workspace packages and applications:

```sh
pnpm build
```

---

#### 🧹 Style & Linting

For the bulk of our core code, we use a [slightly modified](./eslint.config.mjs) version of [`@antfu/eslint-config`](https://www.npmjs.com/package/@antfu/eslint-config) along with [`prettier`](https://prettier.io/) for things like markdown or svgs. Between IDE configs, pre-commit hooks, and manual CLI fixes, many styling and linting issues should get caught without too much concern.

To ensure your code follows our lint rules with:

```sh
pnpm lint
pnpm lint:fix
```

Pre‑commit hooks automatically lint staged files via **simple-git-hooks** and **lint‑staged**.

---

#### 🧪 Testing

We use [Vitest](https://vitest.dev) for unit testing.

You can run tests with:

```sh
pnpm test                 # all workspace tests
pnpm test:core            # just core package
pnpm test:core --watch
pnpm test:core file.spec
```

---

#### 📦 Managing Dependencies

To add a dependency to a specific package, you can use [`pnpm` Filtering](https://pnpm.io/filtering) from the workspace root:

```sh
pnpm -F <scope> add <package>
# Example:
pnpm -F react add @floating-ui/react-dom
```

To upgrade a dependency across all packages:

```sh
pnpm up <package>@<version> -r
```

> [!CAUTION]
> We try to be very intentional with any dependencies we add to this project. This is true of both developer/tooling dependencies and especially package-level (source) dependencies. If you find yourself needing to add a dependency, we strongly encourage you to check in with the core maintainers before proceeding to avoid wasted time and effort for everyone involved (yourself included!).

---

### Making Changes

#### Step 1: Verify

Whether you're adding something new, making something better, or fixing a bug, you'll first want to search the [GitHub issues](https://github.com/videojs/v10/issues) to make sure you're aware of any previous discussion or work. If an unclaimed issue exists, claim it via a comment. If no issue exists for your change, submit one, following the [issue filing guidelines](#filing-issues)

#### Step 2: Update remote

Before starting work, you want to update your local repository to have all the latest changes from `upstream/main`.

```sh
git fetch upstream
git checkout main
git pull upstream main
```

> [!NOTE]
> If `git pull upstream main` fails, this means either you've committed changes to your local clone of `main` or there was a (rare) change in `upstream/main`'s commit history. In either case, if you simply want to base your local clone off of the latest in `upstream/main`, you can simply run: `git checkout -B main upstream/main` (assuming you've already `fetch`ed). For more on `git checkout -B`, check out the [git docs](https://git-scm.com/docs/git-checkout#Documentation/git-checkout.txt-gitcheckout-b-Bnew-branchstart-point).

#### Step 3: Branch

You want to do your work in a separate branch. In general, you want to make sure the branch is based off of the latest in `upstream/main`.

```sh
git checkout -b my-branch
```

One helpful naming convention approximates [conventional commits](conventional-commit-style), e.g.:

- `fix/some-issue`
- `feat/my-media-store-feature`
- `docs/site-docs-for-x`
- `chore/repo-cleanup-task`

#### Step 4: Commits

We follow **[conventional commits semantics][conventional-commit-style]** to enable automated releases.

Examples:

- `feat(core): add volume smoothing hook`
- `fix(react): correct prop mapping for picture-in-picture`
- `chore(root): update linting`

> [!TIP]
> Run `git log` (or `git log --oneline`) to check recent examples before committing.

---

#### Step 5: Test

Any code change should come with corresponding test changes. Especially bug fixes.
Tests attached to bug fixes should fail before the change and succeed with it.

```sh
pnpm test
```

See [Testing](#-testing) for more information.

---

#### Step 6: Pushing & Pull Requests

When ready, push your branch up to your fork (or upstream if you are a core contributor):

```sh
git push --set-upstream origin fix/my-issue
```

Then, open a PR via the green **“Compare & Pull Request”** button. In the description, make sure you thoroughly describe your changes and [link](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword) any related issues or discussions.

- Keep PRs focused and small when possible.
- Give reviewers time to provide feedback.
- Even if a PR isn’t merged, your work helps shape the direction of Video.js 10 ❤️

## Community Engagement

To discuss larger ideas or prototypes, or to help out with ongoing discussions, open a thread in:

- [Discord][discord]
- [GitHub Discussions][gh-discussions]

## Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

- (a) The contribution was created in whole or in part by me and I
  have the right to submit it under the open source license
  indicated in the file; or

- (b) The contribution is based upon previous work that, to the best
  of my knowledge, is covered under an appropriate open source
  license and I have the right under that license to submit that
  work with modifications, whether created in whole or in part
  by me, under the same open source license (unless I am
  permitted to submit under a different license), as indicated
  in the file; or

- (c) The contribution was provided directly to me by some other
  person who certified (a), (b) or (c) and I have not modified
  it.

- (d) I understand and agree that this project and the contribution
  are public and that a record of the contribution (including all
  personal information I submit with it, including my sign-off) is
  maintained indefinitely and may be redistributed consistent with
  this project or the open source license(s) involved.

## Doc Credit

This doc was heavily inspired by the [contributor guide][vjs-contributor-guide] for the current (v8) version of Video.js.

[vjs-gh]: https://github.com/videojs/v10
[conventional-commit-style]: https://www.conventionalcommits.org/en/v1.0.0/#summary
[discord]: https://discord.gg/JBqHh485uF
[gh-discussions]: https://github.com/videojs/v10/discussions
[vjs-contributor-guide]: https://github.com/videojs/admin/blob/main/CONTRIBUTING.md
