from pathlib import Path
import base64
root=Path(__file__).resolve().parent
html=(root/'preview.html').read_text(encoding='utf-8')
for name in ('Geist','GeistMono'):
 data=base64.b64encode((root/'fonts'/f'{name}.ttf').read_bytes()).decode()
 html=html.replace(f"url('./fonts/{name}.ttf')",f"url('data:font/ttf;base64,{data}')")
icons=(root/'channel-icons.mjs').read_text(encoding='utf-8').replace('export default ','const brandIcons = ',1)
scenes=(root/'scenes.mjs').read_text(encoding='utf-8').replace("import brandIcons from './channel-icons.mjs';",'').replace('export const ','const ').replace('export function ','function ')
player=(root/'player.mjs').read_text(encoding='utf-8').replace("import {FILMS,renderFrame} from './scenes.mjs';",'')
html=html.replace('<script type="module" src="./player.mjs"></script>','<script>\n'+icons+'\n'+scenes+'\n'+player+'\n</script>')
(root/'review.html').write_text(html,encoding='utf-8')
print('Self-contained review.html created.')
