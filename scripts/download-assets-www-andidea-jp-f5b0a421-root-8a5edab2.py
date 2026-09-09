"""Download the assets actually used by the And Idea root page."""
import concurrent.futures, hashlib, json, pathlib, urllib.request
ROOT=pathlib.Path(__file__).resolve().parents[1]
DEST=ROOT/'public/sites/www-andidea-jp-f5b0a421/root-8a5edab2'
ASSETS={
 'logo.png':'/andidea.png',
 'background.mp4':'/media/bg-02.mp4?v=16daa9ff5f86',
 'background.jpg':'/media/bg-02.jpg?v=16daa9ff5f86',
 'favicon.ico':'/favicon.ico?v=andidea-20260908',
 'geist.woff2':'/_next/static/_vinext_fonts/geist-8ac0455e797f/geist-98bbbccb.woff2',
 'geist-mono.woff2':'/_next/static/_vinext_fonts/geist-mono-00e989178794/geist-mono-013b2f2f.woff2',
}
def download(item):
 name,path=item;url='https://www.andidea.jp'+path
 with urllib.request.urlopen(url,timeout=60) as r:data=r.read();mime=r.headers.get('Content-Type')
 (DEST/name).write_bytes(data)
 return {'file':name,'url':url,'bytes':len(data),'contentType':mime,'sha256':hashlib.sha256(data).hexdigest()}
if __name__=='__main__':
 DEST.mkdir(parents=True,exist_ok=True)
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(download,ASSETS.items()))
 (ROOT/'docs/research/www-andidea-jp-f5b0a421/root-8a5edab2/assets.json').write_text(json.dumps(results,indent=2))
 print('Downloaded',len(results),'assets;',sum(x['bytes'] for x in results),'bytes')
