"""Build Pre-Modern chapter files (data/c2NN.json) from compact guide dumps.
Each dump: line 1 is a |-separated series list; then @dates, k^#lo-hi~marvelAppId, N entry notes, I issue notes.
Usage: python3 tools/build_premodern.py <dump dir>"""
import json,re,sys
import os
SRC=sys.argv[1] if len(sys.argv)>1 else '/tmp/pm'; OUT=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),'data')
META=json.load(open(f'{OUT}/meta.json')); CH=META['characters']
def cid(name):
    if name not in CH: CH.append(name)
    return CH.index(name)
FIX={'Sub-Mariner (1978)':'Sub-Mariner (1968)','Sub-Mariner (1963)':'Sub-Mariner (1968)','Incredible Hulk (1961)':'Incredible Hulk (1962)',
 'Incredible Hulk (1972)':'Incredible Hulk (1962)','Uncanny X-men (1963)':'Uncanny X-Men (1963)','Werewolf By Night (1972)':'Werewolf by Night (1972)',
 'Peter Parker, the Spectacular Spider-Man (1976)':'Peter Parker, The Spectacular Spider-Man (1976)','Thor Annual (1967)':'Thor Annual (1966)','Iron Man Annual (1970)':'Iron Man Annual (1976)'}
BASE={'Fantastic Four':'Fantastic Four','Incredible Hulk':'Hulk','Amazing Fantasy':'Spider-Man','Journey into Mystery':'Thor','Amazing Spider-Man':'Spider-Man',
 'Uncanny X-Men':'X-Men','Avengers':'Avengers','Sgt. Fury':'Sgt. Fury','Daredevil':'Daredevil','Thor':'Thor','Iron Man':'Iron Man','Iron Man and the Sub-Mariner':'Iron Man',
 'Captain America':'Captain America','Sub-Mariner':'Namor','Captain Marvel':'Captain Marvel','Nick Fury, Agent of S.H.I.E.L.D.':'S.H.I.E.L.D.','Doctor Strange':'Doctor Strange',
 'Silver Surfer':'Silver Surfer','Spectacular Spider-Man':'Spider-Man','Marvel Team-Up':'Spider-Man','Tomb of Dracula':'Dracula','Hero for Hire':'Luke Cage','Power Man':'Luke Cage',
 'The Cat':'Tigra','Defenders':'Defenders','Ghost Rider':'Ghost Rider','Werewolf by Night':'Werewolf by Night','Jungle Action':'Black Panther',
 'Giant-Size Super-Villain Team-Up':'Doctor Doom','Super-Villain Team-Up':'Doctor Doom','Marvel Two-In-One':'Fantastic Four','Marvel Two-in-One':'Fantastic Four','Giant-Size Creatures':'Tigra',
 'Giant-Size Avengers':'Avengers','Giant-Size Man-Thing':'Man-Thing','Man-Thing':'Man-Thing','Giant-Size Defenders':'Defenders','Warlock':'Adam Warlock',
 'Giant-Size Fantastic Four':'Fantastic Four','Giant-Size Spider-Man':'Spider-Man','Iron Fist':'Iron Fist','Marvel Presents':'Guardians of the Galaxy',
 'Giant-Size X-Men':'X-Men','Champions':'Champions','Eternals':'Eternals','Nova':'Nova','Peter Parker, The Spectacular Spider-Man':'Spider-Man','Captain Britain':'Captain Britain',
 'Ms. Marvel':'Ms. Marvel','Spider-Woman':'Spider-Woman','Machine Man':'Machine Man','Power Man and Iron Fist':'Power Man and Iron Fist','Bizarre Adventures':'X-Men',
 'Savage She-Hulk':'She-Hulk','What If...?':'What If...?','Alpha Flight':'Alpha Flight','Moon Knight':'Moon Knight','Dazzler':'Dazzler','The Death of Captain Marvel':'Captain Marvel',
 'Contest of Champions':'Contest of Champions','Vision and the Scarlet Witch':'Vision','The New Mutants Graphic Novel':'New Mutants','New Mutants':'New Mutants',
 'X-Men: God Loves, Man Kills - Special Edition':'X-Men','Wolverine':'Wolverine','Thing':'Fantastic Four','Magik':'New Mutants','Cloak and Dagger':'Cloak and Dagger','Secret Wars':'Secret Wars'}
def base(series):
    b=re.sub(r'\s*\(\d{4}\)$','',series); b=re.sub(r' Annual$','',b); return b
def char(series,lo,hi,occ):
    b=base(series)
    if b=='Tales to Astonish': return 'Hulk' if (lo,hi)==(60,69) or lo>=70 else 'Ant-Man'
    if b=='Strange Tales':
        if series.startswith('Strange Tales Annual'): return 'The Torch'
        if lo>=178: return 'Adam Warlock'
        if lo>=135: return 'S.H.I.E.L.D.'
        if (lo,hi) in ((110,111),(114,115),(117,118),(119,119),(120,121),(123,124),(125,127)) : return 'Doctor Strange' if (lo,hi) in ((110,111),(125,127)) else 'The Torch'
        return 'The Torch'
    if b=='Tales of Suspense': return 'Captain America' if ((lo,hi) in ((60,61),(79,86))) or (lo,hi)==(99,99) else 'Iron Man'
    if b=='Marvel Feature': return 'Defenders' if hi<=3 else 'Ant-Man' if hi<=10 else 'Fantastic Four'
    if b=='Amazing Adventures': return 'Inhumans' if hi<=10 else 'X-Men' if hi<=17 else 'Killraven'
    if b=='Astonishing Tales': return 'Doctor Doom' if hi<=8 else 'Ka-Zar' if hi<=20 else 'Deathlok'
    if b=='Marvel Spotlight': return {31:'S.H.I.E.L.D.',32:'Spider-Woman',33:'Deathlok'}.get(lo,'Ghost Rider' if hi<=11 else 'Son of Satan')
    if b=='Marvel Premiere': return 'Adam Warlock' if hi<=2 else 'Doctor Strange' if hi<=14 else 'Iron Fist' if hi<=25 else 'Ant-Man'
    if b=='Marvel Super-Heroes': return {12:'Captain Marvel',17:'Black Knight',18:'Guardians of the Galaxy',20:'Doctor Doom'}.get(lo,'Captain Marvel')
    return BASE[b]
CHAP=[(201,1,'Assemble','1961-1968','assemble','assemble',['#1f4e9c','#f2c230'],
 "The Marvel Age starts here. The Fantastic Four, Spider-Man, Thor, Iron Man and the X-Men all debut within a couple of years, and Stan Lee, Jack Kirby and Steve Ditko stitch their books into one shared universe."),
 (202,2,'Kree/Skrull War','1967-1972','kree','kreeskrullwar',['#2e7d4f','#c62828'],
 "Iron Man, Captain America and the Sub-Mariner finally get solo books, Captain Marvel brings the Kree to Earth and the Avengers get dragged into a fight between two alien empires."),
 (203,3,'Kang War','1972-1976','kang','kangwar',['#5b2a86','#3fae4f'],
 "Marvel gets darker and stranger. Tomb of Dracula and Ghost Rider bring horror into the mix, Thanos makes his first moves in Captain Marvel, and the crossovers keep getting bigger."),
 (204,4,'Phoenix Saga','1975-1980','phoenix','phoenixsaga',['#b3261e','#f4a300'],
 "Giant-Size X-Men brings in a new team, and Chris Claremont's X-Men grows into Marvel's signature book. Jack Kirby's Eternals add a new layer of cosmic history along the way."),
 (205,5,'Secret Wars','1978-1984','sw','secretwars80s',['#1b1b3a','#d9d9e6'],
 "Frank Miller remakes Daredevil, Dazzler and the New Mutants debut, Walt Simonson takes over Thor and the era closes with Marvel's first line-wide crossover.")]
out=[]
for sid,num,name,years,src,slug,cols,summ in CHAP:
    t=open(f'{SRC}/{src}.txt').read().split('\n'); D=t[0].split('|'); rows=[]; n=0; seen={}
    ents=[]; cur=None
    for l in t[1:]:
        if l.startswith('@'): cur={'d':l[1:],'L':[],'N':[],'I':[]}; ents.append(cur)
        elif l.startswith('N '): cur['N'].append(l[2:])
        elif l.startswith('I '): cur['I'].append(l[2:])
        else:
            k,rest=l.split('^',1); nums,link=rest.split('~',1); cur['L'].append((D[int(k)],nums,link))
    for e in ents:
        d=e['d']; extra=[]
        if d=='' : d='1983'; extra.append('Date added here: the guide gives no release date for this annual, and Marvel dates it to 1983.')
        if d.startswith('- '): extra.append('The guide lists only an end date ('+d[2:]+').'); d=d[2:]
        for i,(ser,nums,link) in enumerate(e['L']):
            ser=FIX.get(ser,ser); m=re.fullmatch(r'#(\d+)(?:-(\d+))?',nums); lo=int(m[1]); hi=int(m[2] or m[1])
            if not link.isdigit(): link={'New Mutants (1983)#15-17':'6948'}[ser+nums]
            line=f'{ser} {nums}'; occ=seen.get(line,0); seen[line]=occ+1
            rows.append(['a',line,'',d if i==0 else '',int(link)])
            if i==0:
                for x in e['N']+extra: rows.append(['n',x])
            c=cid(char(ser,lo,hi,occ))
            for k in range(lo,hi+1): n+=1; rows.append(['i',n,f'{ser} #{k}','','',c,[]])
        for x in e['I']: rows.append(['n',x])
    json.dump(rows,open(f'{OUT}/c{sid}.json','w'),ensure_ascii=False,separators=(',',':'))
    out.append({'id':sid,'num':num,'name':name,'years':years,'summary':summ,'total':n,'url':f'https://www.continuityguide.net/{slug}','colors':cols,'era':'pre'})
    print(sid,name,n,'issues',sum(r[0]=='a' for r in rows),'lines',sum(r[0]=='n' for r in rows),'notes')
chs=[c for c in json.load(open(f'{OUT}/chapters.json')) if c.get('era')!='pre']+out
json.dump(chs,open(f'{OUT}/chapters.json','w'),ensure_ascii=False,separators=(',',':'))
json.dump(META,open(f'{OUT}/meta.json','w'),ensure_ascii=False,separators=(',',':'))
print('characters',len(CH))
