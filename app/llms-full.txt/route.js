import { llmsFull } from '../lib/llmsText';
import { ILLUSTRATIVE_NOTE } from '../playbooks/content';

// /llms-full.txt — the FAQ and every Playbook as one markdown file.
export const dynamic = 'force-static';

export function GET() {
  return new Response(llmsFull(ILLUSTRATIVE_NOTE), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
