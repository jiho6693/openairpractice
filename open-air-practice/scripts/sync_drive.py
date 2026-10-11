"""Fetch public Drive folders and atomically create the static archive snapshot."""
import concurrent.futures, html, json, re, time, urllib.request
from datetime import datetime, timezone
from pathlib import Path
BASE=Path(__file__).resolve().parents[1]
ROOT=json.loads((BASE/'config.json').read_text())['driveFolderId']
if not re.fullmatch(r'[A-Za-z0-9_-]+',ROOT):raise ValueError('Invalid folder ID')
def listing(folder):
    for attempt in range(3):
        try:
            req=urllib.request.Request('https://drive.google.com/embeddedfolderview?id='+folder,headers={'User-Agent':'OpenAirPractice-Archive/1.0'})
            with urllib.request.urlopen(req,timeout=45) as response:body=response.read().decode('utf-8')
            if 'flip-contents' not in body:raise ValueError('Folder is not publicly readable: '+folder)
            result=[]
            for m in re.finditer(r'class="flip-entry" id="entry-([A-Za-z0-9_-]+)"([\s\S]*?)(?=<div class="flip-entry"|$)',body):
                part=m[2];title=re.search(r'class="flip-entry-title">([^<]*)</',part);href=re.search(r'<a href="([^"]+)"',part);thumb=re.search(r'class="flip-entry-thumb"><img src="([^"]+)"',part)
                if not title or not href:continue
                name=html.unescape(title[1]);url=html.unescape(href[1]);src=html.unescape(thumb[1]) if thumb else ''
                image=src if re.search(r'\.(jpe?g|png|webp|gif|heic)$',name,re.I) and src.startswith('https://lh3.googleusercontent.com/') else None
                result.append({'id':m[1],'name':name,'url':url,'folder':'/folders/' in url,'image':'https://lh3.googleusercontent.com/d/'+m[1]+'=s1400' if image else None})
            return result
        except Exception:
            if attempt==2:raise
            time.sleep(1+attempt)
folders=sorted([f for f in listing(ROOT) if f['folder']],key=lambda f:f['name'],reverse=True)
def album(f):
    return {'id':f['id'],'name':f['name'],'url':f['url'],'photos':[p for p in listing(f['id']) if p['image']]}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:folders=list(pool.map(album,folders))
data={'driveUrl':'https://drive.google.com/drive/folders/'+ROOT,'syncedAt':datetime.now(timezone.utc).isoformat(),'folders':folders}
path=BASE/'site/data/archive.json';path.parent.mkdir(parents=True,exist_ok=True);temp=path.with_suffix('.tmp');temp.write_text(json.dumps(data,ensure_ascii=False,indent=2));temp.replace(path)
print('Synced',len(folders),'folders and',sum(len(f['photos']) for f in folders),'photographs.')
