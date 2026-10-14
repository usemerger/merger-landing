'use client';

import { useState } from 'react';

export default function CopyCode({ label, children }) {
  const [status, setStatus] = useState('');
  async function copy() {
    try {
      await navigator.clipboard.writeText(children);
      setStatus('Copied');
    } catch {
      setStatus('Select the text below to copy it.');
    }
  }
  return <div className="dev-code">
    <div className="dev-code-head"><span>{label}</span><button type="button" aria-label={`Copy ${label}`} onClick={copy}>{status === 'Copied' ? 'Copied' : 'Copy'}</button></div>
    <pre tabIndex={0} aria-label={label}><code>{children}</code></pre>
    <span className="dev-copy-status" role="status">{status}</span>
  </div>;
}
