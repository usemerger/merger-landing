import Link from 'next/link';

// The only inline markup articles may use: **bold** and [text](href).
// Internal links (starting with "/") go through next/link; anything else is an
// external link that opens normally and is marked as such for screen readers.
const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g;

export default function Inline({ text }) {
  return text.split(TOKEN).filter(Boolean).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      const [, label, href] = link;
      return href.startsWith('/')
        ? <Link key={i} href={href}>{label}</Link>
        : <a key={i} href={href} rel="noopener">{label}<span className="pb-sr"> (external link)</span></a>;
    }
    return part;
  });
}
