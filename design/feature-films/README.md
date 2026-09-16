# Merger feature films

Editable SVG animations used in the landing page workflow section. Typography matches the site: Geist for body and headings, Geist Mono for small labels. Fonts are OFL licensed; licenses are included.

These are illustrative workflows with sample data, not live recordings. The user approves deal suggestions and sends documents from their own DocuSign account. Available messaging networks vary during alpha.

## Rebuild

Requires Node.js, Python with `resvg_py` and Pillow (`pip install resvg-py pillow`), and FFmpeg on PATH.

Run `node export-frames.mjs`, `python render-films.py`, and `python bundle-preview.py` from this folder. The self-contained review.html supports pause, replay, tabs and scrubbing. Copy the three MP4 files into `public/feature-films`; convert the poster PNGs to WebP for the website. Each video is 1440x900 at 30 fps.

The renderer and font files are shared by browser and video exports. The page uses native video with controls and starts playback only while visible; reduced-motion preferences disable automatic playback. Only one video is mounted at a time.
