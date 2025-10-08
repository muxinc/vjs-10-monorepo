import { file } from 'astro/loaders';
import { defineCollection, reference, z } from 'astro:content';
import { simpleGit } from 'simple-git';
import { globWithParser } from './utils/globWithParser';

const git = simpleGit();

/**
 * Extract date from filename in format: YYYY-MM-DD-slug.{md,mdx}
 * Throws an error if the filename doesn't match the expected pattern
 */
function extractDateFromFilename(id: string): Date {
  const match = id.match(/^(\d{4})-(\d{2})-(\d{2})-/);
  if (!match) {
    throw new Error(
      `Filename "${id}" must follow format: YYYY-MM-DD-slug.{md,mdx}`,
    );
  }

  const [, year, month, day] = match;
  return new Date(`${year}-${month}-${day}`);
}

/**
 * Get the last modified date of a file from git history
 * Returns null if git command fails or file is not in git history
 */
async function getGitLastModifiedDate(filePath: string): Promise<Date | null> {
  try {
    const log = await git.log({ file: filePath, maxCount: 1 });
    if (!log.latest) return null;

    return new Date(log.latest.date);
  }
  catch {
    return null;
  }
}

const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: globWithParser({
    base: './src/content/blog',
    pattern: '**/*.{md,mdx}',
    generateId: ({ entry }) => {
      // Remove date prefix and extension from slug (e.g., "2022-07-08-first-post.md" -> "first-post")
      return entry.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.mdx?$/, '');
    },
    parser: async (entry, originalEntry) => {
      // Extract pubDate from original filename (before date prefix was removed)
      const pubDate = extractDateFromFilename(originalEntry);

      // Get updatedDate from git history (last modification date)
      const filePath = `website/src/content/blog/${originalEntry}`;
      const updatedDate = await getGitLastModifiedDate(filePath);

      // Return transformed entry with added fields
      return {
        ...entry,
        data: {
          ...entry.data,
          pubDate,
          ...(updatedDate
            && updatedDate.getTime() !== pubDate.getTime()
            ? { updatedDate }
            : {}),
        },
      };
    },
  }),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      authors: z.array(reference('authors')),
    }),
});

const docs = defineCollection({
  loader: globWithParser({
    base: './src/content/docs',
    pattern: '**/*.{md,mdx}',
    parser: async (entry, originalEntry) => {
      // Get updatedDate from git history
      const filePath = `website/src/content/docs/${originalEntry}`;
      const updatedDate = await getGitLastModifiedDate(filePath);

      // Return transformed entry with added field if updatedDate exists
      return {
        ...entry,
        data: {
          ...entry.data,
          ...(updatedDate ? { updatedDate } : {}),
        },
      };
    },
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    updatedDate: z.coerce.date().optional(),
  }),
});

const authors = defineCollection({
  loader: file('./src/content/authors.json'),
  schema: z.object({
    name: z.string(),
    shortName: z.string(),
    bio: z.string().optional(),
    avatar: z.string().optional(),
    socialLinks: z
      .object({
        x: z.string().optional(),
        bluesky: z.string().optional(),
        mastodon: z.string().optional(),
        github: z.string().optional(),
        linkedin: z.string().optional(),
        website: z.string().optional(),
      })
      .optional(),
  }),
});

export const collections = { blog, docs, authors };
