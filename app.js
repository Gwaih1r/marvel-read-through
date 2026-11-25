import { firebaseConfig } from './config.js';

const FB = 'https://www.gstatic.com/firebasejs/10.12.2/';
const APP_VERSION = '1.0.0';

const app = document.getElementById('app'), toastHost = document.getElementById('toastHost');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const today = () => iso(new Date());
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const short = s => { if (!s) return ''; const [, m, d] = s.split('-'); return MON[+m - 1] + ' ' + (+d); };
const fmt = n => n.toLocaleString('en-US');

let chapters = [], cat = {}, prog = {}, loaded = false, synced = false, note = '';
let mode = 'preview';            // preview (no Firebase yet) | live
let user = null, canWrite = false, fb = null;
const dirty = {}, writing = {}, timers = {}, open = {};
let lastUndo = null;

const P = sid => prog[sid] || (prog[sid] = { reads: {}, ratings: {} });
function allDays() { const m = {}; for (const sid in prog) for (const k in prog[sid].reads) { const d = prog[sid].reads[k]; if (d) m[d] = (m[d] || 0) + 1; } return m; }
const readCount = sid => Object.keys(P(sid).reads).length;
const totalRead = () => chapters.reduce((a, c) => a + readCount(c.id), 0);
function curChapter() { return chapters.find(c => readCount(c.id) > 0 && readCount(c.id) < c.total) || chapters.find(c => readCount(c.id) < c.total) || chapters[chapters.length - 1]; }
const issues = sid => (cat[sid] || []).filter(r => r[0] === 'i');
function nextUp(sid) {
  const list = issues(sid); if (!list.length) return null; const rd = P(sid).reads;
  let last = -1; list.forEach((r, i) => { if (rd[r[1]] !== undefined) last = i; });
  for (let i = last + 1; i < list.length; i++) if (rd[list[i][1]] === undefined) return list[i];
  return list.find(r => rd[r[1]] === undefined) || null;
}
function arcOf(sid, n) { let a = null; for (const r of cat[sid] || []) { if (r[0] === 'a') a = r; if (r[0] === 'i' && r[1] === n) return a; } return null; }
function streak(m) { const d = new Date(); if (!m[iso(d)]) d.setDate(d.getDate() - 1); let s = 0; while (m[iso(d)]) { s++; d.setDate(d.getDate() - 1); } return s; }

async function loadCat(sid) {
  if (cat[sid] !== undefined) return cat[sid];
  try { const r = await fetch('data/c' + sid + '.json'); if (!r.ok) throw 0; cat[sid] = await r.json(); } catch (e) { cat[sid] = null; }
  return cat[sid];
}

/* ---------- saving ---------- */
function queue(sid) { dirty[sid] = true; clearTimeout(timers[sid]); timers[sid] = setTimeout(() => flush(sid), 500); }
async function flush(sid) {
  if (!fb || !canWrite || writing[sid] || !dirty[sid]) return;
  writing[sid] = true; dirty[sid] = false;
  const body = JSON.parse(JSON.stringify(P(sid)));
  try { await fb.setDoc(fb.doc(fb.db, 'progress', 'c' + sid), body); }
  catch (e) {
    if (e && e.code === 'permission-denied') { canWrite = false; toast('This account can’t save changes. Check the Firestore rules.'); }
    else { dirty[sid] = true; setTimeout(() => flush(sid), 3000); }
  }
  writing[sid] = false; if (dirty[sid]) flush(sid);
}
function guard() {
  if (canWrite) return true;
  toast(mode === 'preview' ? 'Preview mode: saving turns on once Firebase is set up.' : 'Sign in to check off issues.');
  return false;
}

/* ---------- actions ---------- */
function toggle(sid, n) {
  if (!guard()) return;
  const rd = P(sid).reads, was = rd[n];
  if (was !== undefined) delete rd[n]; else rd[n] = today();
  lastUndo = { sid, n, was }; queue(sid); render();
  const r = issues(sid).find(x => x[1] === n);
  toast((was === undefined ? 'Read: ' : 'Unmarked: ') + (r ? r[2] : '#' + n), true);
}
function undo() { if (!lastUndo) return; const { sid, n, was } = lastUndo; const rd = P(sid).reads; if (was === undefined) delete rd[n]; else rd[n] = was; lastUndo = null; queue(sid); render(); toastHost.innerHTML = ''; }
function rate(sid, ai, k) {
  if (!guard()) return;
  const rt = P(sid).ratings, cur = rt[ai];
  if (cur === k) rt[ai] = k - .5; else if (cur === k - .5) delete rt[ai]; else rt[ai] = k;
  queue(sid); render();
}
let tt;
function toast(msg, canUndo) { clearTimeout(tt); toastHost.innerHTML = '<div class="toast" role="status"><span>' + esc(msg) + '</span>' + (canUndo ? '<button data-act="undo">Undo</button>' : '') + '</div>'; tt = setTimeout(() => { toastHost.innerHTML = ''; }, 5000); }

/* ---------- views ---------- */
const gear = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';

function banner() {
  if (mode === 'preview') return '<div class="banner"><span>Preview mode. Your progress shows as of the last sync from the Google Sheet, and saving turns on once Firebase is set up.</span></div>';
  if (!user) return '<div class="banner"><span>Sign in to check off issues and rate arcs.</span><button class="btn r" data-act="settings">Sign in</button></div>';
  return '';
}

function home() {
  const m = allDays(), t = today(), tot = totalRead(), guide = chapters.reduce((a, c) => a + c.total, 0);
  let wk = 0; const d = new Date(); for (let i = 0; i < 7; i++) { wk += m[iso(d)] || 0; d.setDate(d.getDate() - 1); }
  const cur = curChapter(), nx = cat[cur.id] ? nextUp(cur.id) : null, arc = nx ? arcOf(cur.id, nx[1]) : null;
  const days = []; const s = new Date(); s.setDate(s.getDate() - 29); for (let i = 0; i < 30; i++) { days.push([iso(s), m[iso(s)] || 0]); s.setDate(s.getDate() + 1); }
  const mx = Math.max(1, ...days.map(x => x[1]));
  const best = Object.entries(m).sort((a, b) => b[1] - a[1])[0];
  return `<div class="top"><span class="cond" style="font-size:22px">Marvel read-through</span><span class="acts"><small>${esc(fmt(tot))} of ${esc(fmt(guide))}</small><button class="ibtn" data-act="settings" aria-label="Settings">${gear}</button></span></div>
  ${banner()}
  <section class="hero">
    <div class="lab">Next up in Chapter ${cur.num}: ${esc(cur.name)}</div>
    ${nx ? `<h1>${esc(nx[2])}</h1><p>${arc ? esc(arc[2] || arc[1]) : ''}</p>
    <div class="row"><button class="btn w" data-act="read" data-s="${cur.id}" data-n="${nx[1]}">Mark read</button><button class="btn o" data-act="go" data-s="${cur.id}">Open chapter</button></div>`
      : `<h1>${cat[cur.id] === undefined ? 'Loading…' : 'All caught up'}</h1>`}
  </section>
  <div class="figs">
    <div class="fig"><b>${esc(fmt(tot))}</b><span>issues read</span></div>
    <div class="fig"><b>${m[t] || 0}</b><span>read today</span></div>
    <div class="fig"><b>${streak(m)}</b><span>day streak</span></div>
    <div class="fig"><b>${(wk / 7).toFixed(1)}</b><span>a day this week</span></div>
  </div>
  <div class="gp"><div><span>Guide progress</span><span>${(tot / guide * 100).toFixed(1)}%</span></div><div class="meter"><i style="width:${Math.min(100, tot / guide * 100)}%"></i></div></div>
  <h2>Last 30 days</h2>
  <div class="bars" aria-label="Issues read per day, last 30 days">${days.map(([k, v]) => `<i class="${v ? '' : 'z'}${k === t ? ' t' : ''}" style="height:${v ? Math.max(4, v / mx * 100) : 2}%" title="${esc(short(k))}: ${v}"></i>`).join('')}</div>
  <div class="axis"><span>${esc(short(days[0][0]))}</span><span>${best ? 'Best day: ' + best[1] + ' on ' + esc(short(best[0])) : ''}</span><span>Today</span></div>
  <h2>Chapters</h2>
  <div class="chs">${chapters.map(c => { const r = readCount(c.id), p = r / c.total * 100; return `<button class="ch${c === cur ? ' cur' : ''}${r >= c.total ? ' done' : ''}" data-act="go" data-s="${c.id}"><span class="n">${c.num}</span><span><strong>${esc(c.name)}</strong><div class="meter"><i style="width:${p}%"></i></div></span><em>${r >= c.total ? 'Done' : esc(fmt(r)) + ' / ' + esc(fmt(c.total))}</em></button>`; }).join('')}</div>
  ${note ? `<p class="status">${esc(note)}</p>` : ''}`;
}

function chapterView(sid) {
  const c = chapters.find(x => x.id === sid); if (!c) return home();
  const rows = cat[sid], r = readCount(sid);
  const head = `<div class="bar"><button class="back" data-act="home">‹ All chapters</button><h1>Chapter ${c.num}: ${esc(c.name)}</h1>
    <div class="meta"><span>${esc(fmt(r))} of ${esc(fmt(c.total))} read</span><span>${(r / c.total * 100).toFixed(1)}%</span></div><div class="meter" style="margin-top:6px"><i style="width:${r / c.total * 100}%"></i></div></div>
    ${banner()}
    <p class="sum"><b style="color:var(--ink)">${esc(c.years)}.</b> ${esc(c.summary)}</p>
    <div class="links"><button class="btn r" data-act="jump">Jump to next issue</button><a class="btn g" href="${c.url.startsWith('https://') ? esc(c.url) : '#'}" target="_blank" rel="noopener">Guide page</a></div>`;
  if (rows === undefined) return head + '<p class="status">Loading issues…</p>';
  if (rows === null) return head + '<div class="empty">This chapter couldn’t load. Check your connection and try again.</div>';
  const rd = P(sid).reads, rt = P(sid).ratings, nx = nextUp(sid);
  const groups = [], first = {}; let g = null, ai = -1;
  for (const row of rows) {
    if (row[0] === 'a') {
      ai++; const nm = row[2]; if (nm && first[nm] === undefined) first[nm] = ai;
      if (g && g.a && nm && g.a[2] === nm) { g.items.push(['s', row]); continue; }
      g = { a: row, ai: nm ? first[nm] : ai, items: [] }; groups.push(g);
    } else { if (!g) { g = { a: null, ai: -1, items: [] }; groups.push(g); } g.items.push(row); }
  }
  return head + groups.map((g, gi) => {
    const iss = g.items.filter(x => x[0] === 'i'), done = iss.length && iss.every(x => rd[x[1]] !== undefined);
    const key = sid + '-' + gi, isOpen = open[key] ?? (!done || iss.some(x => nx && x[1] === nx[1]));
    const v = rt[g.ai];
    const stars = g.a ? `<div class="stars" aria-label="Rating">${[1, 2, 3, 4, 5].map(k => `<button aria-label="${k} stars" data-act="rate" data-s="${sid}" data-a="${g.ai}" data-k="${k}" class="${v >= k ? 'on' : v === k - .5 ? 'half' : ''}">★</button>`).join('')}</div>` : '';
    const hd = g.a ? `<div class="ah${done ? ' done' : ''}"><div class="t">${esc(g.a[2] || g.a[1])}</div><span class="s">${esc(g.a[2] ? g.a[1] : '')}${g.a[2] && g.a[3] ? ', ' : ''}${esc(g.a[3] || '')}</span><button class="tog" data-act="fold" data-k="${key}" aria-expanded="${isOpen}">${isOpen ? 'Hide' : iss.length + ' issues'}</button>${stars}</div>` : '';
    const body = isOpen ? g.items.map(x => x[0] === 's' ? `<p class="sub">${esc(x[1][1])}${x[1][3] ? ', ' + esc(x[1][3]) : ''}</p>`
      : x[0] === 'n' ? `<p class="note">${esc(x[1])}</p>`
      : `<button class="is${rd[x[1]] !== undefined ? ' r' : ''}${nx && x[1] === nx[1] ? ' nx' : ''}" ${nx && x[1] === nx[1] ? 'id="next"' : ''} data-act="read" data-s="${sid}" data-n="${x[1]}"><span class="c">${rd[x[1]] !== undefined ? '✓' : ''}</span><span class="tt"><small>${x[1]}</small>${esc(x[2])}</span><span class="d">${esc(short(rd[x[1]]))}</span></button>`).join('') : '';
    return `<section class="arc">${hd}${body}</section>`;
  }).join('');
}

let authErr = '';
function settingsView() {
  const acct = mode === 'preview'
    ? '<p>Saving turns on once the Firebase config is added to the app. Until then the app shows your progress as of the last sync from the Google Sheet.</p>'
    : user
      ? `<div class="kv"><span>Signed in as</span><span>${esc(user.email)}</span></div><div class="row"><button class="btn g" data-act="signout">Sign out</button></div>`
      : `<p>Use the same email and password on your phone and iPad so they stay in sync. The first time, tap “Create account.”</p>
        <form id="auth"><div class="field"><label for="em">Email</label><input id="em" type="email" autocomplete="username" required></div>
        <div class="field"><label for="pw">Password</label><input id="pw" type="password" autocomplete="current-password" minlength="6" required></div>
        <p class="err">${esc(authErr)}</p>
        <div class="row"><button class="btn r" type="submit">Sign in</button><button class="btn g" type="button" data-act="signup">Create account</button></div></form>`;
  return `<div class="bar"><button class="back" data-act="home">‹ Back</button><h1>Settings</h1></div>
  <section class="panel"><h2>Account</h2>${acct}</section>
  <section class="panel"><h2>Backup</h2><p>Download everything you’ve checked off and rated as a JSON file.</p><button class="btn g" data-act="export">Download backup</button></section>
  <section class="panel"><h2>About</h2><div class="kv"><span>App version</span><span>${APP_VERSION}</span></div><div class="kv"><span>Reading order</span><span>Continuity Guide</span></div><div class="kv"><span>Issues in the guide</span><span>${esc(fmt(chapters.reduce((a, c) => a + c.total, 0)))}</span></div></section>`;
}

let view = 'home';
function route() {
  const h = location.hash.slice(1);
  view = /^ch-1\d\d$/.test(h) ? +h.slice(3) : h === 'settings' ? 'settings' : 'home';
  if (typeof view === 'number' && cat[view] === undefined) loadCat(view).then(render);
  render(); window.scrollTo(0, 0);
}
function render() {
  if (!loaded) return;
  if (!synced) { app.innerHTML = '<p class="status">Loading your read-through…</p>'; return; }
  const y = window.scrollY, foc = document.activeElement && document.activeElement.id;
  const em = document.getElementById('em')?.value, pw = document.getElementById('pw')?.value;
  app.innerHTML = view === 'home' ? home() : view === 'settings' ? settingsView() : chapterView(view);
  if (em !== undefined && document.getElementById('em')) { document.getElementById('em').value = em; document.getElementById('pw').value = pw || ''; }
  if (foc && document.getElementById(foc)) document.getElementById(foc).focus();
  window.scrollTo(0, y);
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act, s = +b.dataset.s;
  if (a === 'read') toggle(s, +b.dataset.n);
  else if (a === 'go') location.hash = 'ch-' + s;
  else if (a === 'home') location.hash = 'home';
  else if (a === 'settings') location.hash = 'settings';
  else if (a === 'undo') undo();
  else if (a === 'rate') rate(s, +b.dataset.a, +b.dataset.k);
  else if (a === 'fold') { open[b.dataset.k] = b.getAttribute('aria-expanded') !== 'true'; render(); }
  else if (a === 'jump') { const n = document.getElementById('next'); if (n) n.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  else if (a === 'export') exportBackup();
  else if (a === 'signout' && fb) fb.signOut(fb.auth);
  else if (a === 'signup') authSubmit(true);
});
document.addEventListener('submit', e => { if (e.target.id === 'auth') { e.preventDefault(); authSubmit(false); } });
window.addEventListener('hashchange', route);

function exportBackup() {
  const blob = new Blob([JSON.stringify({ exported: new Date().toISOString(), progress: prog }, null, 1)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'marvel-read-through-' + today() + '.json';
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

async function authSubmit(create) {
  if (!fb) return;
  const em = document.getElementById('em')?.value.trim(), pw = document.getElementById('pw')?.value;
  if (!em || !pw) { authErr = 'Enter an email and password.'; render(); return; }
  authErr = '';
  try { await (create ? fb.createUserWithEmailAndPassword : fb.signInWithEmailAndPassword)(fb.auth, em, pw); location.hash = 'home'; }
  catch (e) {
    const c = e && e.code || '';
    authErr = c.includes('email-already-in-use') ? 'That email already has an account. Tap Sign in instead.'
      : c.includes('weak-password') ? 'Use at least 6 characters.'
      : c.includes('invalid') || c.includes('wrong-password') || c.includes('user-not-found') ? 'That email and password don’t match.'
      : c.includes('network') ? 'No connection. Try again when you’re online.' : 'Sign-in failed (' + c + ').';
    render();
  }
}

/* ---------- data sources ---------- */
async function loadSeed() {
  try { const s = await (await fetch('data/seed.json')).json(); for (const k in s) prog[+k.slice(1)] = { reads: { ...s[k].reads }, ratings: { ...s[k].ratings } }; } catch (e) { }
}

async function startFirebase() {
  const [A, Au, F] = await Promise.all([import(FB + 'firebase-app.js'), import(FB + 'firebase-auth.js'), import(FB + 'firebase-firestore.js')]);
  const fbApp = A.initializeApp(firebaseConfig);
  let db;
  try { db = F.initializeFirestore(fbApp, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) }); }
  catch (e) { db = F.getFirestore(fbApp); }
  fb = { db, auth: Au.getAuth(fbApp), doc: F.doc, setDoc: F.setDoc, signOut: Au.signOut, signInWithEmailAndPassword: Au.signInWithEmailAndPassword, createUserWithEmailAndPassword: Au.createUserWithEmailAndPassword };
  mode = 'live';
  let seededCheck = false, serverEmpty = false;
  const maybeSeed = async () => { if (serverEmpty && canWrite && !seededCheck) { seededCheck = true; await importSeed(); } };
  const timer = setTimeout(() => { synced = true; note = 'Still waiting on your saved progress. It may be out of date.'; render(); }, 10000);
  F.onSnapshot(F.collection(db, 'progress'), { includeMetadataChanges: true }, async snap => {
    synced = true;
    if (!snap.metadata.fromCache) { clearTimeout(timer); note = ''; }
    for (const d of snap.docs) { const sid = +d.id.slice(1); if (dirty[sid] || writing[sid]) continue; const v = d.data() || {}; prog[sid] = { reads: { ...(v.reads || {}) }, ratings: { ...(v.ratings || {}) } }; }
    if (!snap.metadata.fromCache) { serverEmpty = snap.empty; await maybeSeed(); }
    const cur = curChapter(); if (cat[cur.id] === undefined) loadCat(cur.id).then(render);
    render();
  }, () => { synced = true; clearTimeout(timer); note = 'Your progress stopped syncing. Close and reopen the app to reconnect.'; render(); });
  Au.onAuthStateChanged(fb.auth, u => { user = u; canWrite = !!u; render(); maybeSeed(); });
}

async function importSeed() {
  let s; try { s = await (await fetch('data/seed.json')).json(); } catch (e) { return; }
  for (const k in s) {
    const sid = +k.slice(1); if (!Object.keys(s[k].reads).length && !Object.keys(s[k].ratings).length) continue;
    prog[sid] = { reads: { ...s[k].reads }, ratings: { ...s[k].ratings } }; dirty[sid] = true; await flush(sid);
  }
  toast('Imported your progress from the Google Sheet.');
}

(async () => {
  try { chapters = await (await fetch('data/chapters.json')).json(); }
  catch (e) { app.innerHTML = '<p class="status">Couldn’t load the chapter list. Check your connection.</p>'; return; }
  loaded = true;
  if (!firebaseConfig) { mode = 'preview'; await loadSeed(); synced = true; }
  route();
  const cur = curChapter(); loadCat(cur.id).then(render);
  if (firebaseConfig) { try { await startFirebase(); } catch (e) { synced = true; note = 'Couldn’t reach the sync service. Showing what’s saved on this device.'; render(); } }
})();

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));
