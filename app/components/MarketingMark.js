export default function MarketingMark({ size = 29 }) {
  return <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <rect x="1" y="1" width="26" height="26" rx="7" stroke="currentColor" strokeWidth="1.4" />
    <path d="m14 6 8 8-8 8-8-8 8-8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M14 6v16" stroke="currentColor" strokeWidth="1.1" opacity=".35" />
  </svg>;
}
