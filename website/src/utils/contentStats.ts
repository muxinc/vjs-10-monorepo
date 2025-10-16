/**
 * Calculate content statistics (word count and reading time) from markdown/MDX content.
 */

/**
 * Calculate word count from text content.
 * Strips markdown/HTML and counts words.
 */
export function calculateWordCount(text: string | undefined): number {
  if (!text) return 0;

  // Remove code blocks (both ``` and ```)
  let content = text.replace(/```[\s\S]*?```/g, '');
  content = content.replace(/`[^`]+`/g, '');

  // Remove HTML tags
  content = content.replace(/<[^>]*>/g, '');

  // Remove markdown links but keep the text [text](url) -> text
  content = content.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove markdown images ![alt](url)
  content = content.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');

  // Remove markdown formatting (bold, italic, etc)
  content = content.replace(/[*_~`]/g, '');

  // Remove frontmatter (YAML between ---)
  content = content.replace(/^---[\s\S]*?---/, '');

  // Split by whitespace and count non-empty strings
  const words = content
    .split(/\s+/)
    .filter(word => word.length > 0 && /\w/.test(word));

  return words.length;
}

/**
 * Calculate estimated reading time in minutes.
 * Average reading speed: 200 words per minute.
 * Minimum reading time: 1 minute.
 */
export function calculateReadingTime(wordCount: number): number {
  const wordsPerMinute = 200;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, minutes);
}

/**
 * Calculate both word count and reading time from content.
 */
export function calculateContentStats(text: string | undefined): {
  wordCount: number;
  readingTime: number;
} {
  const wordCount = calculateWordCount(text);
  const readingTime = calculateReadingTime(wordCount);
  return { wordCount, readingTime };
}
