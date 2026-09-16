from pathlib import Path
import sys,subprocess,json
from concurrent.futures import ProcessPoolExecutor
ROOT=Path(__file__).resolve().parent
import resvg_py
FONTS=[str(p) for p in (ROOT/'fonts').glob('*.ttf')]
def render(svg,w=1440):
 return resvg_py.svg_to_bytes(svg_string=svg,width=w,height=round(w*900/1440),font_files=FONTS,skip_system_fonts=True)
def render_file(path):return render(Path(path).read_text(encoding='utf-8'))
def main():
 films=[('channels',16),('deals',18),('documents',20)]
 only=next((a[7:].split(',') for a in sys.argv if a.startswith('--only=')),None)
 if only: films=[f for f in films if f[0] in only]
 for name,duration in films:
  (ROOT/f'{name}-poster.png').write_bytes(render((ROOT/f'{name}-poster.svg').read_text(encoding='utf-8')))
  print(name+' poster ready',flush=True)
 if '--posters' in sys.argv:return
 with ProcessPoolExecutor(max_workers=4) as pool:
  for name,duration in films:
   cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','image2pipe','-vcodec','png','-framerate','30','-i','-',
        '-an','-c:v','libx264','-crf','18','-preset','medium','-pix_fmt','yuv420p','-movflags','+faststart',str(ROOT/f'{name}.mp4')]
   proc=subprocess.Popen(cmd,stdin=subprocess.PIPE)
   files=sorted((ROOT/'frames'/name).glob('*.svg'))
   assert len(files)==duration*30
   for i,png in enumerate(pool.map(render_file,files,chunksize=4)):
    proc.stdin.write(png)
    if i%150==0:print(f'{name}: {i}/{len(files)}',flush=True)
   proc.stdin.close()
   assert proc.wait()==0
   report=subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height,nb_frames,r_frame_rate,duration','-of','json',str(ROOT/f'{name}.mp4')],text=True)
   data=json.loads(report)['streams'][0]
   assert int(data['nb_frames'])==duration*30 and abs(float(data['duration'])-duration)<.01
   (ROOT/f'{name}-verification.json').write_text(report)
   print(name+' video verified',flush=True)
if __name__=='__main__':main()
