import landingHtml from './landingContent';

// The marketing page is static, author-controlled markup carried over from the
// original index.html (inline SVG, keyframes and all). Rendering it as a server
// component keeps the identity byte-for-byte identical to what shipped before.
export default function LandingPage() {
  return <div dangerouslySetInnerHTML={{ __html: landingHtml }} />;
}
