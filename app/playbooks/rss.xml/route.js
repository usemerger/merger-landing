import { articles } from '../content';
import { buildFeed } from '../feed';

// Built once at deploy from the same list as the hub and the sitemap.
export const dynamic = 'force-static';

export function GET() {
  return new Response(buildFeed(articles), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
