# Video.js v10

[![package-badge]][package]
[![discord-badge]][discord]
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)

Modern, modular, and composable media player framework for Web and React.

🚧 Technical Preview - not recommended for production. 🚧

Thanks for checking out the project! It's in its early stages and currently a mix of prototyping
and early structure pointing in the direction we want to go with Video.js v10 (so be kind 🙏).

- Read our early [architecture goals](./docs/ARCHITECTURE.md).
- Read the [v10 discussion topic](https://github.com/videojs/video.js/discussions/9035)
- Watch [Heff's recent presentation](https://players.brightcove.net/3737230800001/eyILA5XG7K_default/index.html?videoId=6379311036112)

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Timeline](#timeline)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Community](#community)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [How can I help?](#how-can-i-help)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Timeline

🚧 Detailed roadmap coming soon. 🚧

- **Technical Preview (current):** Initial showcase for Demuxed.
- **Beta (Feb 2026):** Core goals accomplished, stable core, adoption in real projects.
- **GA (Mid 2026):** Stable APIs. Feature parity w/ Media Chrome, Vidstack, and Plyr.
- **Video.js (End of 2026):** Video.js core/contrib parity and supported plugins migrated.

## Documentation

If you'd like to get started and learn more, you can find our documentation on our website:

- [Website][site]
- [Documentation][docs]

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
  - [react-demo](./examples/react-demo/) - an example application for using and smoke testing [@videojs/react](./packages/react/)
  - [next-demo](./examples/html-demo/) - an example application for using and smoke testing [@videojs/react](./packages/react/) (Useful for validating things like SSR or other complexities not surfaced by [react-demo](./examples/react-demo/)
- **Other**
  - [site](./site) - the codebase for the [Video.js 10 website](http://v10.videojs.org)

## Community

If you need help with anything related to Video.js 10, or if you'd like to casually chat with other
members:

- [Join Discord Server][discord]
- [See GitHub Discussions][gh-discussions]

## Contributing

Video.js is a free and open source library, and we appreciate any help you're willing to give - whether it's fixing bugs, improving documentation, or suggesting new features. Check out the [contributing guide](./CONTRIBUTING.md) for more! Contributions and project decisions are overseen by the
[Video.js Technical Steering Committee (TSC)](https://github.com/videojs/admin/blob/main/GOVERNANCE.md).

By submitting a pull request, you agree that your contribution is provided under the
[Apache 2.0 License](./LICENSE) and may be included in future releases. No contributor license agreement (CLA) has ever been required for contributions to Video.js. See the [Developer's Certificate of Origin 1.1
](./CONTRIBUTING.md#developers-certificate-of-origin-11).

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](https://github.com/videojs/video.js/blob/main/CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## How can I help?

Join our community channels above and give us feedback! Keep in mind this is a technical preview
and we're working on a lot of polish over the coming months. Feedback on any of the following
would help us:

- Player skin designs
- Architecture and general approach
- Initial embed code and component structure
- Package structure and exports
- Repo, workspace, contributor guides
- Component structures and APIs

[site]: http://v10.videojs.org
[docs]: http://v10.videojs.org/docs
[package]: https://www.npmjs.com/package/@videojs/core
[package-badge]: https://img.shields.io/npm/v/@videojs/core/next?label=@videojs/core@next
[discord]: https://discord.gg/JBqHh485uF
[discord-badge]: https://img.shields.io/discord/507627062434070529?color=%235865F2&label=%20&logo=discord&logoColor=white
[gh-discussions]: https://github.com/videojs/v10/discussions
