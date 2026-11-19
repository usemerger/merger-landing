"""Read-only dependency inventory for the approved local funnel, not a deployer.

Usage: python scripts/audit-funnel-migration.py PREVIEW_DIR REPORT_JSON
Known frame sequences are explicit: interpolated URLs cannot safely be inferred
from a generic string scan. Unreferenced candidates must not be deleted by this tool.
"""
import hashlib
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit

root = Path(sys.argv[1]).resolve()
output = Path(sys.argv[2]).resolve()
html = (root / 'index.html').read_text(encoding='utf-8')
public_html = html.split('<div class="review-index-note"')[0]
scripts = re.findall(r'<script[^>]+src="([^"]+)"', html)
styles = re.findall(r'<link[^>]+href="([^"]+\.css[^" ]*)"', html)
dynamic = {
    'assets/trust/frames': [f'frame-{i:03}.webp' for i in range(96)],
    'assets/aspiration/car-silhouette-frames': [f'{i:02}.webp' for i in range(16)],
    'assets/aspiration/watch-cinematic-frames': [f'{i:02}.webp' for i in range(96)],
    'assets/aspiration/handshake-frames': [f'{i:02}.webp' for i in range(96)],
}
required, missing, visited, queue = {}, set(), set(), []

def reference(value, owner='index.html'):
    value = unquote(value).split('?')[0].split('#')[0]
    if not value or '${' in value or urlsplit(value).scheme or value.startswith('//'):
        return
    # Runtime image/fetch URLs are document-relative; module imports are file-relative.
    if value.startswith(('assets/', 'vendor/')):
        path = root / value
    else:
        path = root / Path(owner).parent / value
    path = path.resolve()
    if not path.is_relative_to(root):
        return
    name = path.relative_to(root).as_posix()
    if not path.is_file():
        missing.add(name)
        return
    required[name] = {'bytes': path.stat().st_size,
                      'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}
    if path.suffix in ('.js', '.css') and name not in visited:
        visited.add(name)
        queue.append(name)

reference('index.html')
for item in scripts + styles:
    reference(item)
for value in re.findall(r'(?:src|poster|href)="([^"]+)"', public_html):
    if value.startswith(('assets/', 'vendor/')):
        reference(value)
for folder, frames in dynamic.items():
    for frame in frames:
        reference(f'{folder}/{frame}')
while queue:
    owner = queue.pop()
    source = (root / owner).read_text(encoding='utf-8')
    for value in re.findall(r'[\'"`]((?:assets/|vendor/|\./|\.\./)[^\'"`\s]+)[\'"`]', source):
        if re.search(r'\.(?:js|css|png|webp|svg|jpe?g|woff2|mp4)(?:\?|$)', value):
            reference(value, owner)
    if owner.endswith('.css'):
        for value in re.findall(r'url\([\'\"]?([^\)\'\"]+)', source):
            reference(value, owner)

assets = {p.relative_to(root).as_posix(): p.stat().st_size
          for p in (root / 'assets').rglob('*') if p.is_file()}
unreferenced = {name: size for name, size in assets.items() if name not in required}
report = {
    'source': str(root), 'scope': 'conservative declared dependency inventory; not measured network transfer',
    'htmlSha256': required['index.html']['sha256'],
    'scriptEntrypoints': scripts, 'stylesheets': styles,
    'dynamicFrameSequences': {folder: len(frames) for folder, frames in dynamic.items()},
    'requiredFileCount': len(required),
    'requiredBytes': sum(v['bytes'] for v in required.values()),
    'allAssetFileCount': len(assets), 'allAssetBytes': sum(assets.values()),
    'unreferencedCandidateCount': len(unreferenced),
    'unreferencedCandidateBytes': sum(unreferenced.values()),
    'missing': sorted(missing),
    'required': dict(sorted(required.items())),
    'unreferencedCandidates': dict(sorted(unreferenced.items())),
    'note': 'Snapshot index still contains workshop markup. Port approved content; do not publish this directory wholesale.',
}
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps({k: v for k, v in report.items() if k not in ('required', 'unreferencedCandidates', 'scriptEntrypoints', 'stylesheets')}, indent=2))
sys.exit(1 if missing else 0)
