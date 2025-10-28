## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
├── public/
├── src/
│  ├── components/
│  ├── content/
│  ├── layouts/
│  └── pages/
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

The `src/content/` directory contains "collections" of related Markdown and MDX documents. Use `getCollection()` to retrieve posts from `src/content/blog/`, and type-check your frontmatter using an optional schema. See [Astro's Content Collections docs](https://docs.astro.build/en/guides/content-collections/) to learn more.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `pnpm install`         | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

## 🚀 Project architecture

### Overview

The website serves two main purposes:

1. **Blog** - News, updates, and announcements about Video.js
2. **Documentation** - Multi-framework documentation system with conditional content

### Project Structure

```text
website/
├── src/
│   ├── components/     # Reusable UI components
│   │   └── docs/       # Documentation-specific components
│   ├── config/         # Configuration files
│   │   └── docs/       # Documentation sidebar configuration
│   ├── content/        # Content collections (blog, docs)
│   │   ├── blog/       # Blog posts (Markdown/MDX)
│   │   └── docs/       # Documentation pages (MDX)
│   ├── layouts/        # Page layouts
│   ├── pages/          # Route definitions
│   ├── styles/         # Global styles
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── consts.ts       # Site-wide constants
├── public/             # Static assets (fonts, favicon, images)
└── astro.config.mjs    # Astro configuration
```

### Key Features

#### 1. Blog System

The blog uses Astro's Content Collections API with a custom loader for automatic metadata extraction.

##### Filename Convention

Blog posts use date-prefixed filenames: `YYYY-MM-DD-slug.{md,mdx}`

Example: `2024-01-15-new-release.md`

##### Automatic Metadata

- **Publication date** is extracted from the filename
- **Updated date** is pulled from git history (last commit that modified the file)
- **URL slug** has the date prefix removed for clean URLs (`/blog/new-release/`)

##### Implementation

See [content.config.ts](src/content.config.ts) for the blog collection definition and [utils/globWithParser.ts](src/utils/globWithParser.ts) for the custom loader implementation.

#### 2. Multi-Framework Documentation System

The most sophisticated part of the website is the documentation system, which adapts content based on:

- **Framework** (HTML, React)
- **Styling approach** (CSS, more coming soon)

##### URL Structure

```text
/docs/framework/{framework}/style/{style}/{slug}/
```

Example: `/docs/framework/react/style/css/concepts/state-management/`

##### Framework/Style Matrix

| Framework | Available Styles |
| --------- | ---------------- |
| HTML      | css              |
| React     | css              |

##### Content Filtering

Documentation pages can be restricted to specific frameworks or styles:

**In sidebar config** ([config/docs/sidebar.ts](src/config/docs/sidebar.ts)):

```ts
const sidebar = {
  title: 'React Concepts',
  guides: [
    { slug: 'concepts/hooks' }, // Available to all
    {
      slug: 'concepts/styling',
      frameworks: ['react'], // Only for React
      styles: ['styled-components'] // Only for styled-components
    }
  ]
};
```

**Within MDX content** (using conditional components):

```mdx
<FrameworkCase frameworks={['react']}>This content only appears in React docs.</FrameworkCase>

<StyleCase styles={['tailwind']}>This content only appears when Tailwind is selected.</StyleCase>
```

##### Static Site Generation

The docs system generates all valid framework/style/slug combinations at build time:

1. Filter sidebar based on framework/style
2. Generate pages only for guides visible in that combination
3. Each page is pre-rendered with the appropriate filtered sidebar

See [pages/docs/framework/[framework]/style/[style]/[...slug].astro](src/pages/docs/framework/[framework]/style/[style]/[...slug].astro) for implementation.

##### Smart Navigation

The framework/style selectors ([components/docs/Selectors.tsx](src/components/docs/Selectors.tsx)) attempt to preserve the current guide when switching:

1. User switches from "React" to "HTML"
2. System checks if current guide supports HTML
3. If yes: Navigate to same guide with HTML/best-style
4. If no: Navigate to first available guide for HTML

This creates a seamless experience where users don't lose their place when switching contexts.

### Custom Utilities

#### globWithParser ([utils/globWithParser.ts](src/utils/globWithParser.ts))

Wraps Astro's `glob` loader to provide access to both transformed entry IDs and original filenames. This is essential for extracting dates from date-prefixed blog post filenames while maintaining clean URLs.

**How it works:**

1. Wraps the `generateId` function to capture ID transformations
2. Stores mapping: `transformed ID → original filename`
3. Injects custom parser that receives both values
4. Parser adds metadata to entry before schema validation

**Why it's needed:**

- `generateId` transforms: `2024-01-15-post.md` → `post`
- Parser needs access to `2024-01-15-post.md` to extract the date
- Without this utility, the original filename is lost after transformation

### Content Collections

#### Blog Collection

- **Location**: `src/content/blog/`
- **Formats**: Markdown (`.md`) and MDX (`.mdx`)
- **Required frontmatter**: `title`, `description`
- **Auto-injected**: `pubDate` (from filename), `updatedDate` (from git)

#### Docs Collection

- **Location**: `src/content/docs/`
- **Formats**: MDX only (needs conditional components)
- **Required frontmatter**: `title`, `description`
- **Auto-injected**: `updatedDate` (from git)
- **Visibility**: Controlled by sidebar configuration

### Layouts

#### Base Layout

Base HTML structure with:

- SEO meta tags (Open Graph, Twitter Cards)
- Font preloading
- Client-side routing (Astro Transitions)

#### BlogPost Layout

Extends Base with blog-specific elements:

- Hero image display
- Publication and updated dates
- Article formatting

#### Docs Layout

Extends Base with documentation features:

- Filtered sidebar navigation
- Framework/style selectors (React component with client-side routing)
- Two-column layout (sidebar + content)

### Configuration

#### Site Configuration

[astro.config.mjs](astro.config.mjs) includes:

- MDX integration for rich content authoring
- React integration for interactive components (selectors)
- Sitemap generation
- RSS feed generation
- Tailwind CSS via Vite plugin

### Sidebar Configuration

[config/docs/sidebar.ts](src/config/docs/sidebar.ts) defines the documentation structure:

- Hierarchical sections and subsections
- Guide definitions with framework/style restrictions
- Custom sidebar labels (overrides doc titles)

### Type System

The documentation system is fully typed in TypeScript:

- `SupportedFramework` - Union type of available frameworks
- `SupportedStyle<F>` - Style type specific to a framework
- `Guide` - Guide definition with optional restrictions
- `Section` - Recursive type for sidebar sections
- `Sidebar` - Array of top-level sections

See [types/docs.ts](src/types/docs.ts) for complete type definitions.

### Development Workflow

#### Adding a Blog Post

1. Create file: `src/content/blog/YYYY-MM-DD-slug.md`
2. Add frontmatter: `title`, `description`
3. Write content in Markdown or MDX
4. The `pubDate` is automatically extracted from filename
5. The `updatedDate` is automatically pulled from git on subsequent commits

#### Adding a Documentation Page

1. Create file: `src/content/docs/category/page-name.mdx`
2. Add frontmatter: `title`, `description`
3. Add to sidebar in `src/config/docs/sidebar.ts`:

   ```ts
   const sidebar = {
     title: 'Category',
     guides: [
       {
         slug: 'category/page-name',
         frameworks: ['react'], // optional
         styles: ['tailwind', 'css'] // optional
       }
     ]
   };
   ```

4. Use conditional components for framework/style-specific content

#### Adding a New Framework

1. Update `FRAMEWORK_STYLES` in [types/docs.ts](src/types/docs.ts)
2. Add available styles for the framework
3. Update documentation to include framework-specific guides
4. The system will automatically generate all URL combinations

#### Adding a New Style

1. Update `FRAMEWORK_STYLES` in [types/docs.ts](src/types/docs.ts)
2. Add the style to appropriate framework(s)
3. Update documentation guides to support the new style
4. The system will automatically generate all URL combinations

### Build Output

The site is statically generated with:

- Pre-rendered HTML for all pages
- Client-side routing for SPA-like navigation
- Optimized images via Astro's image optimization
- Sitemap at `/sitemap-index.xml`
- RSS feed at `/rss.xml`

### Dependencies

#### Core Framework

- **Astro** - Static site generator with island architecture
- **React** - For interactive components (framework/style selectors)
- **TypeScript** - Type safety throughout

#### Content Processing

- **@astrojs/mdx** - MDX support for rich content
- **@astrojs/rss** - RSS feed generation
- **@astrojs/sitemap** - Sitemap generation

#### Styling

- **Tailwind CSS** - Via @tailwindcss/vite plugin
- **@astrojs/react** - React component support

#### Git Integration

- **simple-git** - For extracting file modification dates from git history

### Performance Considerations

- All pages are pre-rendered at build time
- Client-side routing eliminates full page reloads
- Images are optimized with Astro's built-in image optimization
- Fonts are preloaded to prevent layout shift
- Minimal JavaScript (only for interactive selectors)

### Future Enhancements

Areas for potential improvement:

- Add search functionality
- Implement active link highlighting in sidebar
- Create custom 404 page with framework/style context
- Add automated testing for sidebar filtering logic
- Consider server-side rendering for dynamic content
