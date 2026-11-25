"""List arcs that still need a recap.

Usage: python3 tools/recap_todo.py [chapter_id ...]
       python3 tools/recap_todo.py --flagged
  chapter_id is 100 (Prologue) through 125 (Chapter 25). With no ids, prints a
  per-chapter count of arcs still to do and arcs flagged for deeper research.
  --flagged lists every flagged arc, oldest and least-tried first.

Recaps live in data/recaps.json as {"<chapter_id>": {"<arc_key>": "One sentence."}}.
arc_key is the index of the FIRST arc header in that chapter file with the same arc
name (column 3 of an "a" row), counting "a" rows from 0. Arcs that share a name share
one key and one recap. Each line printed below is: arc_key | arc name | every series
range filed under that name | release dates.
"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
recaps = json.load(open(os.path.join(ROOT, 'data', 'recaps.json')))
# Arcs a run could not verify yet, kept for a deeper search later:
# {"<chapter_id>": {"<arc_key>": {"name": ..., "reason": ..., "tried": ["sources or queries"], "attempts": n, "last": "YYYY-MM-DD"}}}
# Flagged arcs are left out of the normal to-do list so first passes keep moving forward.
FLAG_PATH = os.path.join(ROOT, 'tools', 'recap_flagged.json')
skipped = json.load(open(FLAG_PATH)) if os.path.exists(FLAG_PATH) else {}
RETRY = False
if '--flagged' in sys.argv:
    rows = []
    for sid, arcs_ in skipped.items():
        for key, f in arcs_.items():
            if str(key) in recaps.get(sid, {}):
                continue
            f = f if isinstance(f, dict) else {'reason': f}
            rows.append((f.get('attempts', 1), f.get('last', ''), int(sid), int(key), f))
    rows.sort()
    print(f'{len(rows)} flagged arcs')
    for att, last, sid, key, f in rows:
        print(f"{sid} | {key} | {f.get('name', '')} | attempts {att} | last {last} | {f.get('reason', '')} | tried: {'; '.join(f.get('tried', []))}")
    sys.exit(0)


def arcs(sid):
    rows = json.load(open(os.path.join(ROOT, 'data', f'c{sid}.json')))
    out, first, ai = {}, {}, -1
    for r in rows:
        if r[0] != 'a':
            continue
        ai += 1
        name = r[2] or r[1]
        key = first.setdefault(name, ai) if r[2] else ai
        a = out.setdefault(key, {'name': name, 'series': [], 'dates': r[3]})
        a['series'].append(r[1])
    return out


ids = [int(x) for x in sys.argv[1:]] or list(range(100, 126))
for sid in ids:
    have = recaps.get(str(sid), {})
    skip = {} if RETRY else skipped.get(str(sid), {})
    todo = {k: v for k, v in arcs(sid).items() if str(k) not in have and str(k) not in skip}
    if len(sys.argv) == 1:
        print(f'{sid}: {len(todo)} to do, {len(skip)} flagged, of {len(arcs(sid))}')
        continue
    print(f'== Chapter file c{sid}: {len(todo)} arcs need recaps')
    for k, v in todo.items():
        print(f"{k} | {v['name']} | {'; '.join(v['series'])} | {v['dates']}")
