"""Build data/meta.json: per-issue character and writers, plus events.
Usage: python3 build_meta.py <dump.txt> <outdir>"""
import json,sys,re
t=open(sys.argv[1]).read()
try: d=json.loads(t)
except Exception: d=json.loads(json.loads(t)[0]['text'])
d=d.get('content',d)
S={s['properties']['title']:s for s in d['sheets']}
def rows(title,k=0): return [[c.get('formattedValue','') for c in r.get('values',[])] for r in S[title]['data'][k].get('rowData',[])]
events=[[r[0],r[1]] for r in rows('Event Map',0)[1:] if len(r)>1 and r[0]]
issue_rows=rows('Event Map',1)[1:]
writers={}
for r in rows('Writers')[1:]:
  r=r+['']*3
  if r[0] and r[0].lower() not in writers: writers[r[0].lower()]=r[1]
chars=set(); wset=set()
# per issue title: character (col K = idx 4 of G..L), writers from Writers sheet (fallback col L)
issue={}
for r in issue_rows:
  r=r+['']*6
  t=r[0]
  if not t: continue
  ch=r[4]; wr=writers.get(t.lower(), r[5])
  issue[t]=[ch,wr]
# compress: index characters and writer strings
ci=sorted({v[0] for v in issue.values() if v[0]}); cmap={c:i for i,c in enumerate(ci)}
wi=sorted({w.strip() for v in issue.values() for w in v[1].split(';') if w.strip()}); wmap={w:i for i,w in enumerate(wi)}
out={'characters':ci,'writers':wi,'events':events,
     'issues':{t:[cmap.get(v[0],-1),[wmap[w.strip()] for w in v[1].split(';') if w.strip()]] for t,v in issue.items()}}
json.dump(out,open(sys.argv[2]+'/data/meta.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(events),'events',len(issue),'issues',len(ci),'characters',len(wi),'writers',sum(1 for v in issue.values() if v[1]),'with writers')
