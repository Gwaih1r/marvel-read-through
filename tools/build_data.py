"""Convert a Sheets API grid dump (chapter tabs A6:F, formattedValue) into app data files.
Usage: python3 build_data.py <dump.txt> <outdir>
Writes data/c<sheetId>.json per chapter and seed.json (reads + ratings)."""
import json,re,sys,datetime
src,out=sys.argv[1],sys.argv[2]
t=open(src).read()
try: d=json.loads(t)
except Exception: d=json.loads(json.loads(t)[0]['text'])
d=d.get('content',d)
ARC=re.compile(r'\(\d{4}\) #')
def stars(s): return s.count('★')+(0.5 if '½' in s else 0)
seed={}
for s in d['sheets']:
  sid=s['properties']['sheetId']; rows=[]; reads={}; ratings={}; ai=-1; first={}
  for r in s['data'][0].get('rowData',[]):
    v=[c.get('formattedValue','') for c in r.get('values',[])]+['']*6
    a,b,c,dd,e,f=v[:6]
    if not a and not c: continue
    if a:
      n=int(a); rows.append(["i",n,c,dd,e])
      if b=='TRUE':
        reads[str(n)]=datetime.datetime.strptime(f,'%b %d, %Y').strftime('%Y-%m-%d') if f else ''
    elif ARC.search(c):
      ai+=1; rows.append(["a",c,dd,e])
      key=ai
      if dd:
        if dd not in first: first[dd]=ai
        key=first[dd]
      if f and str(key) not in ratings: ratings[str(key)]=stars(f)
    else:
      rows.append(["n",c])
  json.dump(rows,open(f'{out}/data/c{sid}.json','w'),ensure_ascii=False,separators=(',',':'))
  seed[f'c{sid}']={'reads':reads,'ratings':ratings}
  print(sid,'issues',sum(1 for x in rows if x[0]=='i'),'read',len(reads),'rated',len(ratings))
json.dump(seed,open(f'{out}/data/seed.json','w'),separators=(',',':'))
