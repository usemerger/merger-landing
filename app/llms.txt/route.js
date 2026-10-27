import { llmsIndex } from '../lib/llmsText';

// /llms.txt — the llmstxt.org index AI assistants read to understand Merger.
export const dynamic = 'force-static';

export function GET() {
  return new Response(llmsIndex(), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
