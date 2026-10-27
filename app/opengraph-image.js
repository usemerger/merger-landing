import { ImageResponse } from 'next/og';

// The share card for every page that does not set its own: LinkedIn, X,
// iMessage, Slack and WhatsApp previews, and the image Google and AI answer
// engines show beside a result. Brand colours only; no product screenshot,
// so it never goes stale.

export const alt = 'Merger: one inbox and deal desk for dealmakers';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const MARK = 'm40 4-17 48 17 4 17-4L40 4Zm-4 2L4 42l16 10L36 6Zm8 0 32 36-16 10L44 6ZM6 46l14 10 16 36L6 46Zm17 11 15 3v36L23 57Zm19 3 15-3-15 39V60Zm18-4 14-10-30 46 16-36Z';
const NETWORKS = ['WhatsApp', 'Telegram', 'LinkedIn', 'Slack', 'Signal', 'X'];

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '72px 80px', background: 'radial-gradient(circle at 80% 20%, #1c1a14 0%, #08090C 55%)', color: '#F4F1EA', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <svg width="56" height="70" viewBox="0 0 80 100"><path fill="#D7B777" d={MARK} /></svg>
          <span style={{ fontSize: 44, fontWeight: 600, letterSpacing: -1 }}>merger</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', fontSize: 74, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>One inbox and deal desk</div>
          <div style={{ display: 'flex', fontSize: 74, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, color: '#E2BE72' }}>for dealmakers.</div>
          <div style={{ display: 'flex', fontSize: 30, color: '#A7A9B0', marginTop: 8 }}>Claude flags the deals in your chats. You decide what goes on the desk.</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 26, color: '#A7A9B0' }}>
          <div style={{ display: 'flex', gap: 14 }}>
            {NETWORKS.map((name) => <span key={name} style={{ padding: '8px 18px', border: '1px solid #3a3426', borderRadius: 999 }}>{name}</span>)}
          </div>
          <span style={{ color: '#C9A052' }}>Windows · iPhone</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
