import { getCollection } from 'astro:content';

import { SITE_DESCRIPTION, SITE_TITLE } from '@/consts';
import rss from '@astrojs/rss';

export async function GET(context) {
  const posts = await getCollection('blog');
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      ...post.data,
      link: `/blog/${post.id}/`,
    })),
  });
}
