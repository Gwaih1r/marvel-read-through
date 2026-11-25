"""Fold character and writer ids into each chapter file's issue rows, and slim meta.json.
Issue rows become ["i", number, title, arc, release, characterId, [writerIds]]."""
import json,glob
m=json.load(open('data/meta.json'))
iss=m.pop('issues',None)
if iss is None: raise SystemExit('meta.json already slim; rebuild it first')
miss=0
for f in sorted(glob.glob('data/c1*.json')):
  rows=json.load(open(f))
  for r in rows:
    if r[0]=='i':
      v=iss.get(r[2]); 
      if v is None: miss+=1; v=[-1,[]]
      del r[5:]; r+= [v[0],v[1]]
  json.dump(rows,open(f,'w'),ensure_ascii=False,separators=(',',':'))
json.dump(m,open('data/meta.json','w'),ensure_ascii=False,separators=(',',':'))
print('missing',miss)
