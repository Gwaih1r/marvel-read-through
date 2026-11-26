"""Writer credits. tools/writers.json is the ledger:
{"<exact issue title>": {"writers": "A; B", "status": "Verified" | "Needs review", "note": "..."}}
  python3 tools/build_writers.py          fold Verified credits into data/c1xx.json and data/meta.json
  python3 tools/build_writers.py todo     list issues with no ledger entry, in reading order
  python3 tools/build_writers.py review   list Needs review entries
Writer ids in meta.json only grow (new names are appended) so existing rows keep their ids."""
import json, glob, sys, os
os.chdir(os.path.dirname(os.path.abspath(__file__)) + '/..')
L = json.load(open('tools/writers.json'))
low = {k.lower(): v for k, v in L.items()}
files = sorted(glob.glob('data/c1*.json'))
mode = sys.argv[1] if len(sys.argv) > 1 else ''
if mode == 'todo':
    seen = set()
    for f in files:
        for r in json.load(open(f)):
            k = r[2].lower() if r[0] == 'i' else None
            if k and k not in low and k not in seen:
                seen.add(k)
                print(f[-9:-5], r[1], r[2], sep=' | ')
    raise SystemExit
if mode == 'review':
    for k, v in L.items():
        if v['status'] != 'Verified':
            print(k, '|', v['writers'], '|', v['note'])
    raise SystemExit
m = json.load(open('data/meta.json'))
W = m['writers']
def wid(n):
    if n not in W:
        W.append(n)
    return W.index(n)
n = 0
for f in files:
    rows = json.load(open(f))
    for r in rows:
        if r[0] != 'i':
            continue
        while len(r) < 7:
            r.append(-1 if len(r) == 5 else [])
        e = low.get(r[2].lower())
        ids = [wid(w.strip()) for w in e['writers'].split(';') if w.strip()] if e and e['status'] == 'Verified' else []
        if r[6] != ids:
            r[6] = ids
            n += 1
    json.dump(rows, open(f, 'w'), ensure_ascii=False, separators=(',', ':'))
json.dump(m, open('data/meta.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(n, 'issue rows changed;', sum(v['status'] == 'Verified' for v in L.values()), 'verified credits;', len(W), 'writers')
