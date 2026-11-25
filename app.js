import { firebaseConfig } from './config.js';
import { ART } from './art.js';

const FB = 'https://www.gstatic.com/firebasejs/10.12.2/';
const APP_VERSION = '2.2.1';

/* ================= helpers ================= */
const $ = id => document.getElementById(id);
const app = $('app'), toastHost = $('toastHost'), sheetHost = $('sheetHost'), navHost = $('nav'), stickyHost = $('stickyHost');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const today = () => iso(new Date());
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/* AP style month abbreviations for dates */
const APM = ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const short = s => { if (!s) return ''; const [y, m, d] = s.split('-'); return APM[+m - 1] + ' ' + (+d) + (+y !== new Date().getFullYear() ? ', ' + y : ''); };
const longDate = s => { if (!s) return ''; const [y, m, d] = s.split('-'); return APM[+m - 1] + ' ' + (+d) + ', ' + y; };
const fmt = n => Math.round(n).toLocaleString('en-US');
const plural = (n, w, p) => fmt(n) + ' ' + (n === 1 ? w : (p || w + 's'));
const monday = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - (x.getDay() + 6) % 7); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const starTxt = v => '★'.repeat(Math.floor(v)) + (v % 1 ? '½' : '');
const FULLMON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/* "1 Nov 1998 - 1 Jun 1999" -> "November 1998 to June 1999"; same year -> "March to August 2003" */
function pubRange(s) {
  if (!s) return '';
  const p = String(s).split(/\s+-\s+/).map(x => { const m = /(\d{1,2})?\s*([A-Za-z]{3})[a-z]*\.?\s+(\d{4})/.exec(x); return m ? { mo: MON.indexOf(m[2].slice(0, 1).toUpperCase() + m[2].slice(1, 3).toLowerCase()), y: m[3] } : null; });
  if (!p[0] || p[0].mo < 0) return s;
  const a = p[0], b = p[1];
  if (!b || b.mo < 0 || (a.mo === b.mo && a.y === b.y)) return FULLMON[a.mo] + ' ' + a.y;
  return a.y === b.y ? FULLMON[a.mo] + ' to ' + FULLMON[b.mo] + ' ' + b.y : FULLMON[a.mo] + ' ' + a.y + ' to ' + FULLMON[b.mo] + ' ' + b.y;
}
const chLabel = c => c.num ? 'Chapter ' + c.num + ': ' + c.name : c.name;
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;

const I = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  books: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="18" rx="1.5"/><rect x="14" y="3" width="7" height="18" rx="1.5"/><path d="M6.5 7v3M17.5 7v3"/></svg>',
  stats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>',
  checkDark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  dots: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
  ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
  pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
  mark: '<svg viewBox="0 0 32 32" fill="none"><rect x="5" y="5" width="9" height="9" rx="1.5" fill="#fff"/><rect x="18" y="5" width="9" height="9" rx="1.5" fill="#fff"/><rect x="5" y="18" width="9" height="9" rx="1.5" fill="#fff"/><path d="M18.5 22.5l3 3 5.5-6.5" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
const STAR = 'M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9z';
const starSvg = fill => `<svg viewBox="0 0 24 24"><defs><clipPath id="h"><rect width="12" height="24"/></clipPath></defs><path class="bg" d="${STAR}"/>${fill === 1 ? `<path class="fg" d="${STAR}"/>` : fill === .5 ? `<path class="fg" d="${STAR}" clip-path="url(#h)"/>` : ''}</svg>`;

/* ================= state ================= */
let recaps = {}, chapters = [], meta = null, cat = {}, prog = {}, loaded = false, synced = false, note = '';
let mode = 'preview', user = null, canWrite = false, fb = null, lastServer = null;
const dirty = {}, writing = {}, timers = {}, open = {};
let lastUndo = null, popKey = '', filter = 'all', statTab = 'overview', q = '', authErr = '', importPending = null, swWaiting = null;
const chById = {}, evIdx = {};

const P = sid => { const p = prog[sid] || (prog[sid] = { reads: {}, ratings: {} }); if (!p.notes) p.notes = {}; return p; };
const readCount = sid => Object.keys(P(sid).reads).length;
const guideTotal = () => chapters.reduce((a, c) => a + c.total, 0);
const totalRead = () => chapters.reduce((a, c) => a + readCount(c.id), 0);
const isRead = (sid, n) => P(sid).reads[n] !== undefined;
function allDays() { const m = {}; for (const sid in prog) for (const k in prog[sid].reads) { const d = prog[sid].reads[k]; if (d) m[d] = (m[d] || 0) + 1; } return m; }
function curChapter() { return chapters.find(c => readCount(c.id) > 0 && readCount(c.id) < c.total) || chapters.find(c => readCount(c.id) < c.total) || chapters[chapters.length - 1]; }
const issues = sid => (cat[sid] || []).filter(r => r[0] === 'i');
const charName = id => (meta && id !== '' && id != null) ? meta.characters[id] || '' : '';
const writerNames = ids => (meta && ids) ? ids.map(i => meta.writers[i]).filter(Boolean) : [];
function nextUp(sid) {
  const list = issues(sid); if (!list.length) return null; const rd = P(sid).reads;
  let last = -1; list.forEach((r, i) => { if (rd[r[1]] !== undefined) last = i; });
  for (let i = last + 1; i < list.length; i++) if (rd[list[i][1]] === undefined) return list[i];
  return list.find(r => rd[r[1]] === undefined) || null;
}
function streakFrom(m) { const d = new Date(); if (!m[iso(d)]) d.setDate(d.getDate() - 1); let s = 0; while (m[iso(d)]) { s++; d.setDate(d.getDate() - 1); } return s; }

/* Arc groups: consecutive headers with the same arc name merge into one card;
   every header with the same name in a chapter shares one rating key (the first index). */
const groupMemo = {};
function groups(sid) {
  if (groupMemo[sid]) return groupMemo[sid];
  const rows = cat[sid]; if (!rows) return [];
  const out = [], first = {}; let g = null, ai = -1;
  for (const row of rows) {
    if (row[0] === 'a') {
      ai++; const nm = row[2]; if (nm && first[nm] === undefined) first[nm] = ai;
      if (g && g.a && nm && g.a[2] === nm) { g.items.push(['s', row]); continue; }
      g = { a: row, ai: nm ? first[nm] : ai, items: [], gi: out.length }; out.push(g);
    } else { if (!g) { g = { a: null, ai: -1, items: [], gi: out.length }; out.push(g); } g.items.push(row); }
  }
  for (const x of out) x.iss = x.items.filter(r => r[0] === 'i');
  return groupMemo[sid] = out;
}
/* All arcs of a chapter keyed by rating key, with every issue that shares the key. */
const arcMemo = {};
function arcs(sid) {
  if (arcMemo[sid]) return arcMemo[sid];
  const m = new Map();
  for (const g of groups(sid)) {
    if (g.ai < 0) continue;
    if (!m.has(g.ai)) m.set(g.ai, { sid, ai: g.ai, name: g.a[2] || g.a[1], series: g.a[1], dates: g.a[3], iss: [], gi: g.gi });
    m.get(g.ai).iss.push(...g.iss);
  }
  for (const a of m.values()) {
    const cc = {}; a.iss.forEach(r => { if (r[5] !== '' && r[5] != null) cc[r[5]] = (cc[r[5]] || 0) + 1; });
    const top = Object.entries(cc).sort((x, y) => y[1] - x[1])[0]; a.char = top ? +top[0] : null;
    const ws = new Set(); a.iss.forEach(r => (r[6] || []).forEach(w => ws.add(w))); a.writers = [...ws];
    a.event = a.iss.map(r => evIdx[sid + ':' + r[1]]).find(Boolean) || '';
  }
  return arcMemo[sid] = m;
}
function arcOfIssue(sid, n) { for (const g of groups(sid)) if (g.iss.some(r => r[1] === n)) return g; return null; }

async function loadCat(sid) {
  if (cat[sid] !== undefined) return cat[sid];
  if (loadCat.p[sid]) return loadCat.p[sid];
  return loadCat.p[sid] = (async () => {
    try { const r = await fetch('data/c' + sid + '.json'); if (!r.ok) throw 0; cat[sid] = await r.json(); } catch (e) { cat[sid] = null; }
    delete loadCat.p[sid]; return cat[sid];
  })();
}
loadCat.p = {};
let allLoaded = false;
async function loadAll() { if (allLoaded) return; await Promise.all(chapters.map(c => loadCat(c.id))); allLoaded = chapters.every(c => cat[c.id]); }

/* ================= saving ================= */
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
const pending = () => Object.keys(dirty).filter(k => dirty[k]).length + Object.keys(writing).filter(k => writing[k]).length;
function guard() {
  if (canWrite) return true;
  toast(mode === 'preview' ? 'Preview mode. Saving turns on once sync is set up.' : 'Sign in from Settings to check off issues.');
  return false;
}

/* ================= actions ================= */
function snapshot(sid, label) { lastUndo = { sid, reads: { ...P(sid).reads }, ratings: { ...P(sid).ratings }, notes: { ...P(sid).notes } }; }
function toggle(sid, n) {
  if (!guard()) return;
  const rd = P(sid).reads, was = rd[n]; snapshot(sid);
  if (was !== undefined) delete rd[n]; else { rd[n] = today(); popKey = sid + ':' + n; if (navigator.vibrate) navigator.vibrate(8); }
  queue(sid); render();
  const r = issues(sid).find(x => x[1] === n);
  toast((was === undefined ? 'Read ' : 'Unmarked ') + (r ? r[2] : '#' + n), true);
}
function setDate(sid, n, d) { if (!guard()) return; snapshot(sid); P(sid).reads[n] = d; queue(sid); render(); toast('Read date set to ' + longDate(d), true); }
function unmark(sid, n) { if (!guard()) return; snapshot(sid); delete P(sid).reads[n]; queue(sid); render(); toast('Marked unread', true); }
function arcAll(sid, ai, read) {
  if (!guard()) return; const a = arcs(sid).get(ai); if (!a) return; snapshot(sid);
  const rd = P(sid).reads, t = today(); let c = 0;
  for (const r of a.iss) { if (read && rd[r[1]] === undefined) { rd[r[1]] = t; c++; } if (!read && rd[r[1]] !== undefined) { delete rd[r[1]]; c++; } }
  queue(sid); render(); toast((read ? 'Marked ' : 'Unmarked ') + plural(c, 'issue') + ' in ' + a.name, true);
}
function undo() { if (!lastUndo) return; const { sid, reads, ratings, notes } = lastUndo; prog[sid] = { reads, ratings, notes }; lastUndo = null; queue(sid); render(); toastHost.innerHTML = ''; }
function rate(sid, ai, k) {
  if (!guard()) return;
  const rt = P(sid).ratings, cur = rt[ai];
  if (cur === k) rt[ai] = k - .5; else if (cur === k - .5) delete rt[ai]; else rt[ai] = k;
  queue(sid); render();
}
function clearRating(sid, ai) { if (!guard()) return; snapshot(sid); delete P(sid).ratings[ai]; queue(sid); render(); toast('Rating cleared', true); }
let tt;
function toast(msg, canUndo) {
  clearTimeout(tt);
  toastHost.innerHTML = '<div class="toast" role="status"><span>' + esc(msg) + '</span>' + (canUndo ? '<button data-act="undo">Undo</button>' : '') + '</div>';
  tt = setTimeout(() => { toastHost.innerHTML = ''; }, 4500);
}

/* ================= bottom sheet (closes with Android back) ================= */
let sheetOpen = false, ignorePop = false;
function openSheet(html) {
  sheetHost.innerHTML = `<div class="scrim" data-act="scrim"><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div></div>`;
  if (!sheetOpen) { sheetOpen = true; history.pushState({ sheet: 1 }, ''); }
}
function closeSheet() { if (!sheetOpen) return; sheetOpen = false; sheetHost.innerHTML = ''; ignorePop = true; history.back(); }
window.addEventListener('popstate', () => {
  if (ignorePop) { ignorePop = false; return; }
  if (sheetOpen) { sheetOpen = false; sheetHost.innerHTML = ''; }
});

function issueSheet(sid, n) {
  const r = issues(sid).find(x => x[1] === n); if (!r) return;
  const g = arcOfIssue(sid, n), d = P(sid).reads[n];
  const who = [charName(r[5]), writerNames(r[6]).join(' and ')].filter(Boolean).join(', ');
  openSheet(`<h3>${esc(r[2])}</h3><p>${g && g.a ? esc(g.a[2] || g.a[1]) + '. ' : ''}${who ? esc(who) + '. ' : ''}${d ? 'Read ' + esc(longDate(d)) + '.' : 'Not read yet.'}</p>
    <div class="field"><label for="rdate">Date read</label><input id="rdate" type="date" value="${esc(d || today())}" max="${today()}"></div>
    <button class="btn red" style="width:100%;margin-bottom:8px" data-act="savedate" data-s="${sid}" data-n="${n}">${d ? 'Save date' : 'Mark read on this date'}</button>
    ${d ? `<button class="opt dan" data-act="unmark" data-s="${sid}" data-n="${n}">${I.undo}Mark unread</button>` : ''}
    <button class="opt" data-act="closesheet">Cancel</button>`);
}
function noteSheet(sid, ai) {
  const a = arcs(sid).get(ai); if (!a) return; const cur = P(sid).notes[ai] || '';
  openSheet(`<h3>${esc(a.name)}</h3><p>A line or two to jog your memory later. It syncs with your other devices.</p>
    <div class="field"><label for="notetext">Your note</label><textarea id="notetext" rows="4" maxlength="500">${esc(cur)}</textarea></div>
    <button class="btn red" style="width:100%;margin-bottom:8px" data-act="savenote" data-s="${sid}" data-a="${ai}">Save note</button>
    ${cur ? `<button class="opt dan" data-act="delnote" data-s="${sid}" data-a="${ai}">${I.undo}Delete note</button>` : ''}
    <button class="opt" data-act="closesheet">Cancel</button>`);
  setTimeout(() => $('notetext')?.focus(), 250);
}
function saveNote(sid, ai, text) {
  if (!guard()) return; snapshot(sid); const t = (text || '').trim().slice(0, 500);
  if (t) P(sid).notes[ai] = t; else delete P(sid).notes[ai];
  queue(sid); render(); toast(t ? 'Note saved' : 'Note deleted', true);
}
function arcSheet(sid, ai) {
  const a = arcs(sid).get(ai); if (!a) return;
  const rd = P(sid).reads, left = a.iss.filter(r => rd[r[1]] === undefined).length, v = P(sid).ratings[ai];
  openSheet(`<h3>${esc(a.name)}</h3><p>${plural(a.iss.length, 'issue')}${left ? ', ' + fmt(left) + ' unread' : ', all read'}${v ? '. Rated ' + starTxt(v) : ''}.</p>
    ${left ? `<button class="opt" data-act="arcread" data-s="${sid}" data-a="${ai}">${I.checkDark}Mark ${left === a.iss.length ? 'all' : 'remaining ' + fmt(left)} read today</button>` : ''}
    ${left < a.iss.length ? `<button class="opt dan" data-act="arcunread" data-s="${sid}" data-a="${ai}">${I.undo}Mark whole arc unread</button>` : ''}
    ${v ? `<button class="opt" data-act="clearrate" data-s="${sid}" data-a="${ai}">${I.star}Clear rating</button>` : ''}
    <button class="opt" data-act="note" data-s="${sid}" data-a="${ai}">${I.pen}${P(sid).notes[ai] ? 'Edit your note' : 'Add a note to remember it by'}</button>
    <button class="opt" data-act="closesheet">Cancel</button>`);
}

/* ================= shared pieces ================= */
function banner() {
  let h = '';
  if (swWaiting) h += '<div class="banner"><span>A new version of the app is ready.</span><button class="btn red" data-act="update">Update</button></div>';
  if (mode === 'preview') h += '<div class="banner"><span>Preview mode. You’re seeing progress from the last Google Sheet sync. Saving turns on once sync is set up.</span></div>';
  else if (!user) h += '<div class="banner"><span>Sign in to check off issues and rate arcs.</span><button class="btn red" data-act="nav" data-h="settings">Sign in</button></div>';
  if (note) h += `<div class="banner"><span>${esc(note)}</span></div>`;
  return h;
}
const coverStyle = c => `--c1:${c.colors[0]};--c2:${c.colors[1]}`;
const artMemo = {};
const coverArt = (c, cls = '') => ART[c.id] ? `<svg class="art ${cls}" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${artMemo[c.id] || (artMemo[c.id] = ART[c.id]())}</svg>` : '';
function coverTile(c, cur) {
  const r = readCount(c.id), p = Math.min(100, r / c.total * 100), done = r >= c.total;
  return `<button class="cv cover${c === cur ? ' cur' : ''}" style="${coverStyle(c)}" data-act="nav" data-h="ch-${c.id}" aria-label="${esc(chLabel(c))}, ${fmt(r)} of ${fmt(c.total)} read">${coverArt(c)}
    ${done ? '<span class="badge">Done</span>' : c === cur ? '<span class="badge">Reading</span>' : ''}
    <span class="num">${c.num || 'P'}</span>
    <span><span class="lab">${c.num ? 'Chapter ' + c.num + ' · ' : ''}${esc(c.years)}</span><span class="nm" style="display:block">${esc(c.name)}</span>
    <span class="meter" style="display:block"><i style="width:${p}%"></i></span><span class="pc"><span>${done ? 'Complete' : fmt(r) + ' / ' + fmt(c.total)}</span><span>${p >= 99.95 || p === 0 ? Math.round(p) : p.toFixed(1)}%</span></span></span></button>`;
}
function appbar(title, sub) {
  return `<header class="appbar"><div class="brand"><span class="mark" aria-hidden="true">${I.mark}</span><span><b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</span></div>
  <button class="ibtn" data-act="nav" data-h="settings" aria-label="Settings">${I.gear}</button></header>`;
}

/* ================= HOME ================= */
function home() {
  const m = allDays(), t = today(), tot = totalRead(), guide = guideTotal();
  const cur = curChapter(), ready = !!cat[cur.id], nx = ready ? nextUp(cur.id) : null;
  let hero;
  if (!ready) hero = `<section class="hero cover" style="${coverStyle(cur)}">${coverArt(cur, 'wide')}<div class="eyebrow"><span>${esc(chLabel(cur))}</span></div><h1>${cat[cur.id] === null ? 'Couldn’t load this chapter' : 'Loading…'}</h1></section>`;
  else if (!nx) hero = `<section class="hero cover" style="${coverStyle(cur)}">${coverArt(cur, 'wide')}<div class="eyebrow"><span>${esc(chLabel(cur))}</span></div><h1>All caught up</h1><p class="arcline">Every issue in the guide is checked off.</p></section>`;
  else {
    const g = arcOfIssue(cur.id, nx[1]), list = g ? g.iss : [nx], pos = list.findIndex(r => r[1] === nx[1]);
    const rdc = list.filter(r => isRead(cur.id, r[1])).length;
    const who = [charName(nx[5]), writerNames(nx[6])[0]].filter(Boolean).join(' · ');
    hero = `<section class="hero cover" style="${coverStyle(cur)}">${coverArt(cur, 'wide')}
      <div class="eyebrow"><span>Up next · ${esc(chLabel(cur))}</span><span>${fmt(readCount(cur.id))} / ${fmt(cur.total)}</span></div>
      <h1>${esc(nx[2])}</h1>
      <p class="arcline">${g && g.a ? esc(g.a[2] || g.a[1]) : ''}${who ? ' <span style="opacity:.75">· ' + esc(who) + '</span>' : ''}</p>
      ${list.length > 1 ? (list.length <= 24 ? `<div class="arcbar">${list.map(r => `<i class="${isRead(cur.id, r[1]) ? 'on' : ''}"></i>`).join('')}</div>`
        : `<div class="meter" style="margin:14px 0 4px;background:rgba(255,255,255,.28)"><i style="width:${rdc / list.length * 100}%;background:#fff"></i></div>`)
        + `<div class="arcmeta">Issue ${pos + 1} of ${list.length} in this arc</div>` : ''}
      <div class="acts"><button class="btn prim" data-act="read" data-s="${cur.id}" data-n="${nx[1]}">${I.checkDark}Mark as read</button><button class="btn ghost" data-act="nav" data-h="ch-${cur.id}/${nx[1]}">Open</button></div>
    </section>`;
  }
  // queue: next five unread after the hero issue, in guide order
  let qh = '';
  if (nx) {
    const list = issues(cur.id), i0 = list.findIndex(r => r[1] === nx[1]), rd = P(cur.id).reads, nxt = [];
    for (let i = i0 + 1; i < list.length && nxt.length < 5; i++) if (rd[list[i][1]] === undefined) nxt.push(list[i]);
    if (nxt.length) qh = `<div class="sec"><h2>Coming up</h2><button data-act="nav" data-h="ch-${cur.id}/${nx[1]}">See chapter</button></div><div class="queue">${nxt.map(r => {
      const g = arcOfIssue(cur.id, r[1]);
      return `<div class="qi"><span class="no">${r[1]}</span><button class="qb" data-act="nav" data-h="ch-${cur.id}/${r[1]}"><b>${esc(r[2])}</b><small>${g && g.a ? esc(g.a[2] || g.a[1]) : ''}</small></button><button class="tap" data-act="read" data-s="${cur.id}" data-n="${r[1]}" aria-label="Mark ${esc(r[2])} read"><span class="chk">${I.check}</span></button></div>`;
    }).join('')}</div>`;
  }
  // this week, Monday to Sunday
  const mon = monday(new Date()), wk = [];
  for (let i = 0; i < 7; i++) { const k = iso(addDays(mon, i)); wk.push([k, m[k] || 0]); }
  const wmax = Math.max(1, ...wk.map(x => x[1])), wsum = wk.reduce((a, x) => a + x[1], 0);
  let last7 = 0; for (let i = 0; i < 7; i++) last7 += m[iso(addDays(new Date(), -i))] || 0;
  return `${appbar('Read-Through', 'Modern-era Marvel · Continuity Guide order')}
  ${banner()}${hero}
  <div class="figs">
    <div class="fig"><b>${fmt(tot)}</b><span>issues read</span></div>
    <div class="fig"><b>${m[t] || 0}</b><span>today</span></div>
    <div class="fig"><b>${streakFrom(m)}</b><span>day streak</span></div>
    <div class="fig"><b>${(last7 / 7).toFixed(1)}</b><span>7-day average</span></div>
  </div>
  <div class="guide"><div class="top"><span>Through the guide</span><span><b>${(tot / guide * 100).toFixed(1)}%</b> of ${fmt(guide)}</span></div><div class="meter"><i style="width:${Math.min(100, tot / guide * 100)}%"></i></div></div>
  ${qh}
  <div class="sec"><h2>This week</h2><button data-act="nav" data-h="stats">${plural(wsum, 'issue')} · All stats</button></div>
  <div class="week" role="img" aria-label="Issues read each day this week">${wk.map(([k, v], i) => `<div class="${k === t ? 't' : ''}"><strong>${v || ''}</strong><span class="b"><i class="${v ? '' : 'z'}" style="height:${v ? Math.max(6, v / wmax * 100) : 3}%"></i></span><span>${DOW[i].slice(0, 1)}</span></div>`).join('')}</div>
  <div class="sec"><h2>Chapters</h2><button data-act="nav" data-h="chapters">See all</button></div>
  <div class="rail" id="rail">${chapters.map(c => coverTile(c, cur)).join('')}</div>`;
}

/* ================= CHAPTERS ================= */
function chaptersView() {
  const cur = curChapter(), done = chapters.filter(c => readCount(c.id) >= c.total).length;
  return `${appbar('Chapters', `${done} of ${chapters.length} finished`)}${banner()}<div class="grid">${chapters.map(c => coverTile(c, cur)).join('')}</div>`;
}

/* ================= CHAPTER DETAIL ================= */
function chapterView(sid, focus) {
  const c = chById[sid]; if (!c) return home();
  const rows = cat[sid], r = readCount(sid), p = r / c.total * 100;
  const head = `<header class="chead cover" style="${coverStyle(c)}">${coverArt(c, 'wide')}
    <button class="back" data-act="nav" data-h="chapters">${I.back}Chapters</button>
    <div class="k">${c.num ? 'Chapter ' + c.num : 'Prologue'} · ${esc(c.years)}</div>
    <h1>${esc(c.name)}</h1><p>${esc(c.summary)}</p>
    <div class="prog"><span>${fmt(r)} of ${fmt(c.total)} read</span><span>${p.toFixed(1)}%</span></div><div class="meter"><i style="width:${p}%"></i></div>
    <div class="acts">${r < c.total ? `<button class="btn prim" style="flex:0 1 auto" data-act="jump">${I.down}Jump to next issue</button>` : ''}<a class="btn ghost" href="${c.url.startsWith('https://') ? esc(c.url) : '#'}" target="_blank" rel="noopener">${I.ext}Guide page</a></div>
  </header>`;
  const chips = `<div class="chips" role="tablist"><button class="chip${filter === 'all' ? ' on' : ''}" data-act="filter" data-f="all">All arcs</button><button class="chip${filter === 'unread' ? ' on' : ''}" data-act="filter" data-f="unread">Unread only</button><button class="chip" data-act="foldall" data-s="${sid}">Collapse finished</button></div>`;
  if (rows === undefined) return head + banner() + '<p class="status">Loading issues…</p>';
  if (rows === null) return head + banner() + '<div class="empty">This chapter couldn’t load. Check your connection and try again.</div>';
  const rd = P(sid).reads, rt = P(sid).ratings, nx = nextUp(sid);
  const body = groups(sid).map(g => {
    const iss = g.iss, done = iss.length > 0 && iss.every(x => rd[x[1]] !== undefined);
    if (filter === 'unread' && done) return '';
    const key = sid + '-' + g.gi, hasFocus = flashN && iss.some(x => x[1] === flashN);
    if (hasFocus) open[key] = true;
    const isOpen = hasFocus || (open[key] ?? (!done || iss.some(x => nx && x[1] === nx[1])));
    let hd = '';
    if (g.a) {
      const A = arcs(sid).get(g.ai), v = rt[g.ai], rdn = iss.filter(x => rd[x[1]] !== undefined).length;
      const tags = [A.event ? `<span class="tag ev">${esc(A.event)}</span>` : '', ...writerNames(A.writers).slice(0, 2).map(w => `<span class="tag">${esc(w)}</span>`), A.char != null && charName(A.char) ? `<span class="tag">${esc(charName(A.char))}</span>` : ''].join('');
      hd = `<div class="ah"><div class="t${done ? ' done-t' : ''}">${esc(g.a[2] || g.a[1])}</div>
        <button class="more" data-act="arcsheet" data-s="${sid}" data-a="${g.ai}" aria-label="Arc options">${I.dots}</button>
        <span class="s">${esc(g.a[2] ? g.a[1] : '')}${g.a[2] && g.a[3] ? ' · ' : ''}${esc(pubRange(g.a[3]))}</span>
        ${tags ? `<div class="tags">${tags}</div>` : ''}
        ${(() => { const rc = recaps[sid] && recaps[sid][g.ai], nt = P(sid).notes[g.ai]; if (!done && !nt) return ''; return (done ? (rc ? `<p class="recap"><span>Recap</span>${esc(rc)}</p>` : `<p class="recap pending"><span>Recap</span>Still being researched. It will show up here once it's verified.</p>`) : '') + (nt ? `<button class="mynote" data-act="note" data-s="${sid}" data-a="${g.ai}"><span>Your note</span>${esc(nt)}</button>` : ''); })()}
        <div class="arow"><div class="stars" role="group" aria-label="Rate this arc">${[1, 2, 3, 4, 5].map(k => `<button aria-label="${k} star${k > 1 ? 's' : ''}" data-act="rate" data-s="${sid}" data-a="${g.ai}" data-k="${k}">${starSvg(v >= k ? 1 : v === k - .5 ? .5 : 0)}</button>`).join('')}</div>
        <button class="fold" data-act="fold" data-k="${key}" aria-expanded="${isOpen}">${isOpen ? 'Hide issues' : `${fmt(rdn)} / ${plural(iss.length, 'issue')}`}</button></div></div>`;
    }
    const items = isOpen ? g.items.map(x => {
      if (x[0] === 's') return `<p class="sub">${esc(x[1][1])}${x[1][3] ? ' · ' + esc(pubRange(x[1][3])) : ''}</p>`;
      if (x[0] === 'n') return `<p class="note">${esc(x[1])}</p>`;
      const on = rd[x[1]] !== undefined, isNx = nx && x[1] === nx[1];
      if (filter === 'unread' && on) return '';
      const who = isNx ? 'Up next' : [charName(x[5]), writerNames(x[6])[0]].filter(Boolean).join(' · ');
      const k = sid + ':' + x[1];
      return `<button class="is${on ? ' on' : ''}${isNx ? ' nx' : ''}${popKey === k ? ' pop' : ''}${flashN === x[1] ? ' flash' : ''}" id="i${x[1]}" data-act="read" data-s="${sid}" data-n="${x[1]}" aria-pressed="${on}">
        <span class="chk">${I.check}</span><span class="tt"><b>${esc(x[2])}</b>${who ? `<small>${esc(who)}</small>` : ''}</span>
        <span class="dt" data-act="isheet" data-s="${sid}" data-n="${x[1]}">${on ? esc(short(rd[x[1]])) : '#' + x[1]}</span></button>`;
    }).join('') : '';
    return `<section class="arc">${hd}${items}</section>`;
  }).join('');
  return head + banner() + chips + (body || '<div class="empty">Nothing unread here. This chapter is finished.</div>');
}

/* ================= SEARCH ================= */
let searchIdx = null;
function buildSearch() {
  searchIdx = [];
  for (const c of chapters) {
    if (!cat[c.id]) continue;
    for (const g of groups(c.id)) for (const r of g.iss) {
      const arc = g.a ? (g.a[2] || '') : '';
      searchIdx.push({ sid: c.id, r, arc, hay: (r[2] + ' ' + arc + ' ' + charName(r[5]) + ' ' + writerNames(r[6]).join(' ')).toLowerCase() });
    }
  }
}
function searchView() {
  return `<div class="search"><label>${I.search}<input id="q" type="search" placeholder="Series, arc, character or writer" value="${esc(q)}" autocomplete="off" enterkeyhint="search" aria-label="Search every issue"></label></div><div id="results">${results()}</div>`;
}
function results() {
  if (!allLoaded) return '<p class="hint">Loading every chapter so you can search the whole guide…</p>';
  if (!searchIdx) buildSearch();
  const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return `<p class="hint">Search all ${fmt(searchIdx.length)} issues. Try “Schism,” “Ultimates” or “Bendis.”</p>`;
  const hits = searchIdx.filter(x => terms.every(t => x.hay.includes(t)));
  if (!hits.length) return '<p class="hint">No issues match that search.</p>';
  return `<p class="hint" style="margin:4px 0 10px;text-align:left">${plural(hits.length, 'match', 'matches')}${hits.length > 100 ? '. Showing the first 100' : ''}</p><div class="res">${hits.slice(0, 100).map(x => {
    const c = chById[x.sid], on = isRead(x.sid, x.r[1]);
    return `<button class="ri${on ? ' on' : ''}" data-act="nav" data-h="ch-${x.sid}/${x.r[1]}"><span class="chk${on ? ' on' : ''}">${I.check}</span><span><b>${esc(x.r[2])}</b><small>${c.num ? 'Ch. ' + c.num : 'Prologue'}${x.arc ? ' · ' + esc(x.arc) : ''}${on ? ' · Read ' + esc(short(P(x.sid).reads[x.r[1]])) : ''}</small></span></button>`;
  }).join('')}</div>`;
}

/* ================= STATS ================= */
function computeStats() {
  const m = allDays(), days = Object.keys(m).sort(), t = today(), tot = totalRead(), guide = guideTotal();
  const S = { m, days, tot, guide, today: m[t] || 0 };
  S.streak = streakFrom(m);
  let best = 0, run = 0, prev = null;
  for (const d of days) { run = prev && iso(addDays(parse(prev), 1)) === d ? run + 1 : 1; best = Math.max(best, run); prev = d; }
  S.longest = best;
  S.readingDays = days.length;
  S.perDay = days.length ? tot / days.length : 0;
  let l7 = 0, l30 = 0; for (let i = 0; i < 30; i++) { const v = m[iso(addDays(new Date(), -i))] || 0; l30 += v; if (i < 7) l7 += v; }
  S.avg7 = l7 / 7; S.avg30 = l30 / 30;
  const bd = Object.entries(m).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? 1 : -1))[0]; S.bestDay = bd;
  const wk = {}, mo = {};
  for (const [d, v] of Object.entries(m)) { const w = iso(monday(parse(d))); wk[w] = (wk[w] || 0) + v; const k = d.slice(0, 7); mo[k] = (mo[k] || 0) + v; }
  S.bestWeek = Object.entries(wk).sort((a, b) => b[1] - a[1])[0];
  S.bestMonth = Object.entries(mo).sort((a, b) => b[1] - a[1])[0];
  const tw = iso(monday(new Date())), lw = iso(addDays(monday(new Date()), -7));
  S.thisWeek = wk[tw] || 0; S.lastWeek = wk[lw] || 0;
  const dIdx = (new Date().getDay() + 6) % 7; S.lastWeekSoFar = 0; for (let i = 0; i <= dIdx; i++) S.lastWeekSoFar += m[iso(addDays(parse(lw), i))] || 0;
  S.thisMonth = mo[t.slice(0, 7)] || 0;
  const span = days.length ? Math.min(30, Math.round((parse(t) - parse(days[0])) / 864e5) + 1) : 0;
  let lspan = 0; for (let i = 0; i < span; i++) lspan += m[iso(addDays(new Date(), -i))] || 0;
  S.spanDays = span; const pace = span ? lspan / span : 0;
  const cur = curChapter(), left = cur.total - readCount(cur.id);
  S.cur = cur; S.pace = pace;
  S.chFinish = pace > 0 && left > 0 ? iso(addDays(new Date(), Math.ceil(left / pace))) : null;
  S.guideFinish = pace > 0 && guide > tot ? iso(addDays(new Date(), Math.ceil((guide - tot) / pace))) : null;
  S.dow = [0, 0, 0, 0, 0, 0, 0]; for (const [d, v] of Object.entries(m)) S.dow[(parse(d).getDay() + 6) % 7] += v;
  // milestones
  const all = []; for (const sid in prog) for (const k in prog[sid].reads) if (prog[sid].reads[k]) all.push(prog[sid].reads[k]); all.sort();
  const marks = [1, 10, 25, 50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 750, 800, 900, 1000]; for (let x = 1250; x <= 12000; x += 250) marks.push(x);
  S.ms = marks.filter(x => x <= all.length).map(x => ({ label: 'Issue ' + fmt(x), date: all[x - 1], seq: x }));
  S.nextMs = marks.find(x => x > all.length);
  for (const c of chapters) if (readCount(c.id) >= c.total) { const ds = Object.values(P(c.id).reads).filter(Boolean).sort(); const fd = ds[ds.length - 1]; S.ms.push({ label: 'Finished ' + (c.num ? 'Chapter ' + c.num + ': ' : '') + c.name, date: fd, ch: 1, seq: all.filter(x => x <= fd).length + .5 }); }
  S.ms.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.seq - a.seq));
  if (!allLoaded) return S;
  // characters, writers, events
  const ch = {}, wr = {};
  for (const c of chapters) { const rd = P(c.id).reads; for (const r of issues(c.id)) if (rd[r[1]] !== undefined) { if (r[5] !== '' && r[5] != null) ch[r[5]] = (ch[r[5]] || 0) + 1; (r[6] || []).forEach(w => wr[w] = (wr[w] || 0) + 1); } }
  S.chars = Object.entries(ch).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => [charName(+k), v]);
  S.writers = Object.entries(wr).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => [meta.writers[+k], v]);
  const cn = cat[cur.id] && nextUp(cur.id); S.curWriter = cn ? writerNames(cn[6]).join(' and ') : '';
  S.curChar = cn ? charName(cn[5]) : '';
  S.events = meta.events.map(e => { let r = 0; for (const sid in e.issues) for (const n of e.issues[sid]) if (isRead(+sid, n)) r++; return { name: e.name, total: e.total, read: r }; });
  // ratings
  const rated = [], unrated = [];
  for (const c of chapters) {
    const rt = P(c.id).ratings, rd = P(c.id).reads;
    for (const a of arcs(c.id).values()) {
      const v = rt[a.ai];
      if (v) rated.push({ ...a, v, ch: c });
      else if (a.iss.length && a.iss.every(r => rd[r[1]] !== undefined)) unrated.push({ ...a, ch: c });
    }
  }
  S.rated = rated; S.unrated = unrated; S.avgRating = avg(rated.map(a => a.v));
  S.spread = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, .5].map(s => [s, rated.filter(a => a.v === s).length]);
  const by = (keyf) => { const o = {}; for (const a of rated) for (const k of keyf(a)) (o[k] = o[k] || []).push(a.v); return Object.entries(o).filter(x => x[1].length >= 2).map(([k, v]) => [k, avg(v), v.length]).sort((a, b) => b[1] - a[1] || b[2] - a[2]); };
  S.byChar = by(a => a.char != null && charName(a.char) ? [charName(a.char)] : []).slice(0, 8);
  S.byWriter = by(a => writerNames(a.writers)).slice(0, 8);
  S.byChapter = chapters.map(c => { const v = rated.filter(a => a.sid === c.id).map(a => a.v); return [c, avg(v), v.length]; }).filter(x => x[2]);
  S.top = [...rated].sort((a, b) => b.v - a.v || b.iss.length - a.iss.length).slice(0, 5);
  S.low = [...rated].sort((a, b) => a.v - b.v || b.iss.length - a.iss.length).slice(0, 5);
  const lg = rated.filter(a => a.iss.length >= 6).map(a => a.v), sh = rated.filter(a => a.iss.length < 6).map(a => a.v);
  S.longShort = [[avg(lg), lg.length], [avg(sh), sh.length]];
  // Marvel time: the publication dates of the arc you're in
  if (cn) { const g = arcOfIssue(cur.id, cn[1]); S.marvelTime = g && g.a ? pubRange(g.a[3]) : ''; S.marvelArc = g && g.a ? (g.a[2] || g.a[1]) : ''; }
  return S;
}
const kv = (k, v) => `<div class="kv"><span>${k}</span><span>${v}</span></div>`;
const hbar = (label, v, max, right) => `<div class="hb"><span>${label}</span><span>${right ?? fmt(v)}</span><div class="meter"><i style="width:${max ? Math.max(2, v / max * 100) : 0}%"></i></div></div>`;
function weekLabel(k) { const d = parse(k), e = addDays(d, 6); return APM[d.getMonth()] + ' ' + d.getDate() + '–' + (e.getMonth() !== d.getMonth() ? APM[e.getMonth()] + ' ' : '') + e.getDate(); }
function monthLabel(k) { const [y, mm] = k.split('-'); return FULLMON[+mm - 1] + ' ' + y; }
function heatmap(m) {
  const ds = Object.keys(m).sort(), first = ds.length ? monday(parse(ds[0])) : monday(new Date());
  const since = Math.round((monday(new Date()) - first) / 6048e5) + 1;
  const weeks = Math.max(12, Math.min(26, since + 1)), start = addDays(monday(new Date()), -7 * (weeks - 1)), t = today();
  const vals = Object.values(m), mx = Math.max(1, ...vals);
  let cells = '';
  for (let i = 0; i < weeks * 7; i++) {
    const d = iso(addDays(start, i)), v = m[d] || 0;
    const l = d > t ? 'f' : !v ? '' : v <= mx * .25 ? 'l1' : v <= mx * .5 ? 'l2' : v <= mx * .75 ? 'l3' : 'l4';
    cells += `<i class="${l}" title="${esc(short(d))}: ${v}"></i>`;
  }
  return `<div class="heat" role="img" aria-label="Issues read per day over the last ${weeks} weeks">${cells}</div><div class="heatk"><span>${esc(short(iso(start)))}</span><span>Stronger red, more issues</span><span>Today</span></div>`;
}
function arcLine(a) { return `<button class="kv" style="width:100%;text-align:left" data-act="nav" data-h="ch-${a.sid}/${a.iss[0] ? a.iss[0][1] : ''}"><span>${esc(a.name)}<br><small style="color:var(--dim)">${a.ch.num ? 'Ch. ' + a.ch.num : 'Prologue'} · ${plural(a.iss.length, 'issue')}</small></span><span style="color:var(--gold);white-space:nowrap">${a.v ? starTxt(a.v) : 'Rate'}</span></button>`; }

function statsView() {
  const S = computeStats();
  const tabs = [['overview', 'Overview'], ['pace', 'Pace'], ['ratings', 'Ratings'], ['universe', 'Universe'], ['milestones', 'Milestones']];
  let body = '';
  const needAll = ['ratings', 'universe'].includes(statTab) && !allLoaded;
  if (needAll) body = '<p class="status">Crunching every chapter…</p>';
  else if (statTab === 'overview') {
    const diff = S.thisWeek - S.lastWeekSoFar;
    body = `<div class="figs" style="margin-bottom:10px">
      <div class="fig wide"><b>${fmt(S.tot)}</b><span>issues read, ${(S.tot / S.guide * 100).toFixed(1)}% of the guide</span></div>
      <div class="fig"><b>${S.today}</b><span>today</span></div>
      <div class="fig"><b>${S.thisWeek}</b><span>this week</span><em class="${diff >= 0 ? '' : 'dn'}">${diff >= 0 ? '+' : ''}${diff} vs. last</em></div>
      <div class="fig"><b>${S.streak}</b><span>day streak</span></div>
      <div class="fig"><b>${S.longest}</b><span>longest streak</span></div>
      <div class="fig"><b>${S.avg7.toFixed(1)}</b><span>7-day average</span></div>
      <div class="fig"><b>${S.perDay.toFixed(1)}</b><span>per reading day</span></div>
    </div>
    <section class="panel"><h3>Reading calendar</h3><p class="k">Each square is one day. Columns run Monday to Sunday.</p>${heatmap(S.m)}</section>
    <section class="panel"><h3>Chapters</h3><div class="rows">${chapters.filter(c => readCount(c.id) > 0 || c === S.cur).map(c => hbar(esc((c.num ? c.num + '. ' : '') + c.name), readCount(c.id), c.total, fmt(readCount(c.id)) + ' / ' + fmt(c.total))).join('')}</div></section>`;
  } else if (statTab === 'pace') {
    const dmax = Math.max(1, ...S.dow);
    body = `<section class="panel"><h3>Personal bests</h3>
      ${kv('Best day', S.bestDay ? `${S.bestDay[1]} on ${esc(longDate(S.bestDay[0]))}` : 'None yet')}
      ${kv('Best week', S.bestWeek ? `${S.bestWeek[1]}, ${esc(weekLabel(S.bestWeek[0]))}` : 'None yet')}
      ${kv('Best month', S.bestMonth ? `${S.bestMonth[1]} in ${esc(monthLabel(S.bestMonth[0]))}` : 'None yet')}
      ${kv('Longest streak', plural(S.longest, 'day'))}
      ${kv('Reading days', fmt(S.readingDays))}</section>
    <section class="panel"><h3>Pace</h3>
      ${kv('This week', `${S.thisWeek} <small>(last week ${S.lastWeek})</small>`)}
      ${kv('This month', fmt(S.thisMonth))}
      ${kv('Daily average, last 7 days', S.avg7.toFixed(1))}
      ${kv('Daily average, last 30 days', S.avg30.toFixed(1))}
      ${kv('Average per reading day', S.perDay.toFixed(1))}</section>
    <section class="panel"><h3>At this pace</h3><p class="k">Based on your average of ${S.pace.toFixed(1)} a day over the last ${plural(S.spanDays, 'day')}.</p>
      ${kv(`Finish ${esc(chLabel(S.cur))}`, S.chFinish ? esc(longDate(S.chFinish)) : '—')}
      ${kv('Finish the whole guide', S.guideFinish ? esc(longDate(S.guideFinish)) : '—')}
      ${kv('Issues left in the guide', fmt(S.guide - S.tot))}</section>
    <section class="panel"><h3>By weekday</h3><div class="rows">${S.dow.map((v, i) => hbar(DOW[i], v, dmax)).join('')}</div></section>`;
  } else if (statTab === 'ratings') {
    const smax = Math.max(1, ...S.spread.map(x => x[1]));
    body = `<div class="figs" style="margin-bottom:10px;grid-template-columns:repeat(3,minmax(0,1fr))">
      <div class="fig"><b>${S.rated.length}</b><span>arcs rated</span></div>
      <div class="fig"><b>${S.avgRating ? S.avgRating.toFixed(2) : '—'}</b><span>average stars</span></div>
      <div class="fig"><b>${S.unrated.length}</b><span>finished, not rated</span></div></div>
    <section class="panel"><h3>Star spread</h3><div class="spread">${S.spread.map(([s, n]) => `<div><span class="st">${starTxt(s)}</span><div class="meter"><i style="width:${n / smax * 100}%"></i></div><span>${n}</span></div>`).join('')}</div></section>
    ${S.unrated.length ? `<section class="panel"><h3>Finished, waiting on a rating</h3>${S.unrated.slice(-6).reverse().map(arcLine).join('')}${S.unrated.length > 6 ? `<p class="k" style="margin:10px 0 0">Plus ${fmt(S.unrated.length - 6)} more.</p>` : ''}</section>` : ''}
    ${S.top.length ? `<section class="panel"><h3>Highest rated</h3>${S.top.map(arcLine).join('')}</section>` : ''}
    ${S.low.length > 2 ? `<section class="panel"><h3>Lowest rated</h3>${S.low.map(arcLine).join('')}</section>` : ''}
    ${S.byChapter.length ? `<section class="panel"><h3>By chapter</h3>${S.byChapter.map(([c, a, n]) => kv(esc((c.num ? c.num + '. ' : '') + c.name), `<span style="color:var(--gold)">${a.toFixed(2)}</span> · ${plural(n, 'arc')}`)).join('')}</section>` : ''}
    ${S.byChar.length ? `<section class="panel"><h3>By character</h3><p class="k">Characters with at least two rated arcs.</p>${S.byChar.map(([k, a, n]) => kv(esc(k), `<span style="color:var(--gold)">${a.toFixed(2)}</span> · ${n}`)).join('')}</section>` : ''}
    ${S.byWriter.length ? `<section class="panel"><h3>By writer</h3>${S.byWriter.map(([k, a, n]) => kv(esc(k), `<span style="color:var(--gold)">${a.toFixed(2)}</span> · ${n}`)).join('')}</section>` : ''}
    <section class="panel"><h3>Long arcs vs. short arcs</h3>${kv('Six issues or more', S.longShort[0][1] ? `${S.longShort[0][0].toFixed(2)} · ${plural(S.longShort[0][1], 'arc')}` : '—')}${kv('Five issues or fewer', S.longShort[1][1] ? `${S.longShort[1][0].toFixed(2)} · ${plural(S.longShort[1][1], 'arc')}` : '—')}</section>`;
  } else if (statTab === 'universe') {
    const cmax = S.chars[0] ? S.chars[0][1] : 1, wmax = S.writers[0] ? S.writers[0][1] : 1;
    const evs = S.events.filter(e => e.read > 0).sort((a, b) => b.read / b.total - a.read / a.total), evDone = S.events.filter(e => e.read >= e.total).length;
    body = `<section class="panel"><h3>Marvel time</h3>${kv('Now reading', esc(S.marvelArc || '—'))}${kv('Originally published', esc(S.marvelTime || '—'))}${kv('Current lead', esc(S.curChar || '—'))}${kv('Current writer', esc(S.curWriter || 'Not credited yet'))}</section>
    <section class="panel"><h3>Most-read characters</h3><div class="rows">${S.chars.map(([k, v]) => hbar(esc(k), v, cmax)).join('') || '<p class="k">Nothing yet.</p>'}</div></section>
    <section class="panel"><h3>Most-read writers</h3><p class="k">Writer credits cover part of the guide so far.</p><div class="rows">${S.writers.map(([k, v]) => hbar(esc(k), v, wmax)).join('') || '<p class="k">Nothing yet.</p>'}</div></section>
    <section class="panel"><h3>Events</h3><p class="k">${evDone} of ${S.events.length} finished.</p>${evs.map(e => `<div class="ev${e.read >= e.total ? ' done' : ''}"><b style="font-weight:500">${esc(e.name)}</b><span>${e.read} / ${e.total}</span><div class="meter"><i style="width:${e.read / e.total * 100}%"></i></div></div>`).join('')}
      ${S.events.filter(e => !e.read).length ? `<p class="k" style="margin:12px 0 0">Still ahead: ${esc(S.events.filter(e => !e.read).map(e => e.name).join(', '))}.</p>` : ''}</section>`;
  } else {
    const all = S.tot;
    body = `${S.nextMs ? `<section class="panel"><h3>Next milestone</h3>${kv('Issue ' + fmt(S.nextMs), plural(S.nextMs - all, 'issue') + ' to go')}${S.pace > 0 ? kv('Expected', esc(longDate(iso(addDays(new Date(), Math.ceil((S.nextMs - all) / S.pace)))))) : ''}<div class="meter" style="margin-top:10px"><i style="width:${all / S.nextMs * 100}%"></i></div></section>` : ''}
    <section class="panel"><h3>Reached</h3>${S.ms.map(x => `<div class="ml"><span class="dot${x.ch ? ' c' : ''}"></span><span>${esc(x.label)}</span><span>${esc(short(x.date))}</span></div>`).join('') || '<p class="k">Your first issue unlocks the first milestone.</p>'}</section>`;
  }
  return `${appbar('Stats', `${fmt(S.tot)} issues · ${S.readingDays} reading days`)}${banner()}
  <div class="tabs2" role="tablist">${tabs.map(([k, l]) => `<button class="chip${statTab === k ? ' on' : ''}" data-act="stattab" data-t="${k}" role="tab" aria-selected="${statTab === k}">${l}</button>`).join('')}</div>${body}`;
}

/* ================= SETTINGS ================= */
function settingsView() {
  const th = localStorage.getItem('theme') || 'system';
  const acct = mode === 'preview'
    ? '<p class="k" style="margin:0">Sync isn’t set up yet. Once the Firebase config is added, you’ll sign in here and every check mark saves to the cloud.</p>'
    : user
      ? `${kv('Signed in as', esc(user.email))}${kv('Can save changes', canWrite ? 'Yes' : 'No')}<div class="row" style="margin-top:12px"><button class="btn line" data-act="signout">Sign out</button></div>`
      : `<p class="k" style="margin:0 0 12px">Use the same email and password on every device so they stay in sync. The first time, tap Create account.</p>
        <form id="auth"><div class="field"><label for="em">Email</label><input id="em" type="email" autocomplete="username" inputmode="email" required></div>
        <div class="field"><label for="pw">Password</label><input id="pw" type="password" autocomplete="current-password" minlength="6" required></div>
        <p class="err" role="alert">${esc(authErr)}</p>
        <div class="row"><button class="btn red" type="submit">Sign in</button><button class="btn line" type="button" data-act="signup">Create account</button></div></form>`;
  const sync = mode === 'preview' ? 'Preview' : !navigator.onLine ? 'Offline, changes save when you reconnect' : pending() ? plural(pending(), 'change') + ' saving' : lastServer ? 'Up to date' : 'Connecting';
  return `<header class="appbar"><button class="back ibtn" data-act="back" aria-label="Back">${I.back}</button><div class="brand" style="flex:1"><b>Settings</b></div></header>
  ${banner()}
  <section class="panel"><h3>Account</h3>${acct}</section>
  <section class="panel"><h3>Appearance</h3><div class="seg" role="radiogroup" aria-label="Theme">${[['system', 'System'], ['dark', 'Dark'], ['light', 'Light']].map(([k, l]) => `<button role="radio" aria-checked="${th === k}" class="${th === k ? 'on' : ''}" data-act="theme" data-t="${k}">${l}</button>`).join('')}</div></section>
  <section class="panel"><h3>Sync</h3>${kv('Status', esc(sync))}${lastServer ? kv('Last synced', esc(lastServer.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))) : ''}</section>
  <section class="panel"><h3>Backup</h3><p class="k" style="margin:0 0 12px">Save every check mark, date and rating to a file, or restore from one.</p>
    <div class="row"><button class="btn line" data-act="export">Download backup</button><label class="btn line" style="cursor:pointer">Restore backup<input id="imp" type="file" accept="application/json,.json" hidden></label></div></section>
  <section class="panel"><h3>About</h3>${kv('App version', APP_VERSION)}${kv('Reading order', '<a href="https://www.continuityguide.net/" target="_blank" rel="noopener">Continuity Guide</a>')}${kv('Issues in the guide', fmt(guideTotal()))}${kv('Chapters', chapters.length)}
    <div class="row" style="margin-top:12px"><button class="btn line" data-act="checkupdate">Check for updates</button></div>
    <p class="k" style="margin:12px 0 0">Fan-made reading tracker. Not affiliated with Marvel or the Continuity Guide.</p></section>`;
}

/* ================= router ================= */
let view = 'home', focus = null, flashN = null;
const scrollMem = {};
function navTo(h) { if (location.hash.slice(1) === h) route(); else location.hash = h; }
function route() {
  scrollMem[view + (focus ? '/' + focus : '')] = window.scrollY;
  let h = location.hash.slice(1) || 'home';
  if (h === 'continue') { const c = curChapter(); loadCat(c.id).then(() => { const n = nextUp(c.id); history.replaceState(null, '', '#ch-' + c.id + (n ? '/' + n[1] : '')); route(); }); return; }
  focus = null; flashN = null;
  const mm = /^ch-(1\d\d)(?:\/(\d+))?$/.exec(h);
  if (mm) { view = +mm[1]; focus = flashN = mm[2] ? +mm[2] : null; }
  else view = ['home', 'chapters', 'stats', 'search', 'settings'].includes(h) ? h : 'home';
  if (typeof view === 'number') { if (!cat[view]) loadCat(view).then(() => render(true)); }
  if (view === 'stats' || view === 'search') loadAll().then(() => { if (view === 'stats' || view === 'search') { if (view === 'search') { const r = $('results'); if (r) r.innerHTML = results(); } else render(); } });
  if (sheetOpen) { sheetOpen = false; sheetHost.innerHTML = ''; }
  render(true);
}
function render(fresh) {
  if (!loaded) return;
  navHost.innerHTML = navBar();
  if (!synced) { app.innerHTML = '<p class="status">Loading your read-through…</p>'; return; }
  const y = window.scrollY, foc = document.activeElement && document.activeElement.id;
  const em = $('em')?.value, pw = $('pw')?.value, rx = $('rail')?.scrollLeft;
  app.innerHTML = view === 'home' ? home() : view === 'chapters' ? chaptersView() : view === 'stats' ? statsView() : view === 'search' ? searchView() : view === 'settings' ? settingsView() : chapterView(view, focus);
  if (em !== undefined && $('em')) { $('em').value = em; $('pw').value = pw || ''; }
  if (rx !== undefined && $('rail')) $('rail').scrollLeft = rx;
  if (foc && $(foc) && foc !== 'q') $(foc).focus();
  popKey = ''; const hadFlash = flashN;
  if (typeof view === 'number' && cat[view]) flashN = null;
  if (fresh) {
    if (typeof view === 'number' && hadFlash && cat[view]) { const el = $('i' + hadFlash); if (el) { el.scrollIntoView({ block: 'center' }); } else window.scrollTo(0, 0); }
    else window.scrollTo(0, scrollMem[view] || 0);
    if (view === 'home' && $('rail')) { const rl = $('rail'), c = rl.querySelector('.cur'); if (c) rl.scrollLeft += c.getBoundingClientRect().left - rl.getBoundingClientRect().left - 16; }
    if (view === 'search' && $('q') && !q) $('q').focus();
  } else window.scrollTo(0, y);
  sticky();
}
function navBar() {
  const on = k => (view === k || (k === 'chapters' && typeof view === 'number')) ? ' on' : '';
  const b = (k, l, ic) => `<button class="${on(k).trim()}" data-act="nav" data-h="${k}" aria-label="${l}"${on(k) ? ' aria-current="page"' : ''}>${ic}<span>${l}</span></button>`;
  return `<div>${b('home', 'Home', I.home)}${b('chapters', 'Chapters', I.books)}${b('stats', 'Stats', I.stats)}${b('search', 'Search', I.search)}</div>`;
}
function sticky() {
  if (typeof view !== 'number') { stickyHost.innerHTML = ''; return; }
  const c = chById[view], hd = app.querySelector('.chead'); if (!c || !hd) return;
  const show = window.scrollY > hd.offsetHeight - 20;
  if (!stickyHost.firstChild) stickyHost.innerHTML = `<div class="sticky"><button class="ibtn" data-act="nav" data-h="chapters" aria-label="Back to chapters">${I.back}</button><b></b><span></span></div>`;
  const s = stickyHost.firstChild; s.classList.toggle('show', show);
  s.querySelector('b').textContent = (c.num ? c.num + '. ' : '') + c.name;
  s.querySelector('span').textContent = fmt(readCount(view)) + ' / ' + fmt(c.total);
}
window.addEventListener('scroll', () => { if (typeof view === 'number') sticky(); }, { passive: true });

/* ================= events ================= */
let lp = null, lpFired = false, lpX = 0, lpY = 0;
document.addEventListener('pointerdown', e => {
  const r = e.target.closest('.is'); if (!r) return;
  lpFired = false; lpX = e.clientX; lpY = e.clientY;
  lp = setTimeout(() => { lpFired = true; if (navigator.vibrate) navigator.vibrate(15); issueSheet(+r.dataset.s, +r.dataset.n); }, 480);
});
document.addEventListener('pointermove', e => { if (lp && (Math.abs(e.clientX - lpX) > 8 || Math.abs(e.clientY - lpY) > 8)) { clearTimeout(lp); lp = null; } }, { passive: true });
['pointerup', 'pointercancel'].forEach(t => document.addEventListener(t, () => { clearTimeout(lp); lp = null; }));
document.addEventListener('contextmenu', e => { if (e.target.closest('.is')) e.preventDefault(); });

document.addEventListener('click', e => {
  if (lpFired) { lpFired = false; e.preventDefault(); return; }
  const b = e.target.closest('[data-act]'); if (!b) return;
  const a = b.dataset.act, s = +b.dataset.s, n = +b.dataset.n;
  if (a === 'scrim') { if (e.target === b) closeSheet(); return; }
  switch (a) {
    case 'read': toggle(s, n); break;
    case 'isheet': e.stopPropagation(); issueSheet(s, n); break;
    case 'nav': navTo(b.dataset.h); break;
    case 'back': history.length > 1 ? history.back() : navTo('home'); break;
    case 'undo': undo(); break;
    case 'rate': rate(s, +b.dataset.a, +b.dataset.k); break;
    case 'fold': open[b.dataset.k] = b.getAttribute('aria-expanded') !== 'true'; render(); break;
    case 'foldall': { const rd = P(s).reads; for (const g of groups(s)) if (g.iss.length && g.iss.every(x => rd[x[1]] !== undefined)) open[s + '-' + g.gi] = false; render(); toast('Finished arcs collapsed'); break; }
    case 'filter': filter = b.dataset.f; render(); break;
    case 'jump': { const el = app.querySelector('.is.nx'); if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); break; }
    case 'stattab': statTab = b.dataset.t; render(); window.scrollTo(0, 0); break;
    case 'arcsheet': arcSheet(s, +b.dataset.a); break;
    case 'arcread': closeSheet(); arcAll(s, +b.dataset.a, true); break;
    case 'arcunread': closeSheet(); arcAll(s, +b.dataset.a, false); break;
    case 'clearrate': closeSheet(); clearRating(s, +b.dataset.a); break;
    case 'savedate': { const v = $('rdate')?.value; if (!v || v > today()) { toast('Pick a date up to today.'); break; } closeSheet(); setDate(s, n, v); break; }
    case 'unmark': closeSheet(); unmark(s, n); break;
    case 'closesheet': closeSheet(); break;
    case 'note': if (!guard()) break; if (sheetOpen) { sheetOpen = false; sheetHost.innerHTML = ''; history.back(); setTimeout(() => noteSheet(s, +b.dataset.a), 60); } else noteSheet(s, +b.dataset.a); break;
    case 'savenote': { const v = $('notetext')?.value; closeSheet(); saveNote(s, +b.dataset.a, v); break; }
    case 'delnote': closeSheet(); saveNote(s, +b.dataset.a, ''); break;
    case 'theme': localStorage.setItem('theme', b.dataset.t); applyTheme(); render(); break;
    case 'export': exportBackup(); break;
    case 'doimport': closeSheet(); doImport(); break;
    case 'signout': if (fb) fb.signOut(fb.auth); break;
    case 'signup': authSubmit(true); break;
    case 'update': if (swWaiting) swWaiting.postMessage('skipWaiting'); break;
    case 'checkupdate': checkUpdate(); break;
  }
});
document.addEventListener('submit', e => { if (e.target.id === 'auth') { e.preventDefault(); authSubmit(false); } });
let qt;
document.addEventListener('input', e => {
  if (e.target.id === 'q') { q = e.target.value; clearTimeout(qt); qt = setTimeout(() => { const r = $('results'); if (r) r.innerHTML = results(); }, 120); }
});
document.addEventListener('change', e => { if (e.target.id === 'imp' && e.target.files[0]) readImport(e.target.files[0]); });
window.addEventListener('hashchange', route);
window.addEventListener('online', () => render());
window.addEventListener('offline', () => render());

/* ================= theme ================= */
const mq = matchMedia('(prefers-color-scheme: light)');
function applyTheme() {
  const t = localStorage.getItem('theme') || 'system', light = t === 'light' || (t === 'system' && mq.matches);
  document.documentElement.dataset.theme = light ? 'light' : 'dark';
  document.querySelector('meta[name=theme-color]').setAttribute('content', light ? '#f3f3f5' : '#0b0b0e');
}
mq.addEventListener?.('change', applyTheme);
applyTheme();

/* ================= backup ================= */
function exportBackup() {
  const blob = new Blob([JSON.stringify({ app: 'marvel-read-through', version: APP_VERSION, exported: new Date().toISOString(), progress: prog }, null, 1)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'marvel-read-through-' + today() + '.json';
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  toast('Backup downloaded');
}
async function readImport(file) {
  try {
    const j = JSON.parse(await file.text()), p = j.progress; if (!p || typeof p !== 'object') throw 0;
    const clean = {}; let n = 0;
    for (const k in p) { const sid = +k; if (!chById[sid]) continue; const reads = {}, ratings = {}, notes = {};
      for (const [i, d] of Object.entries(p[k].reads || {})) if (/^\d{4}-\d\d-\d\d$/.test(d)) { reads[i] = d; n++; }
      for (const [i, v] of Object.entries(p[k].ratings || {})) if (typeof v === 'number' && v > 0 && v <= 5) ratings[i] = v;
      for (const [i, v] of Object.entries(p[k].notes || {})) if (typeof v === 'string' && v.trim()) notes[i] = v.slice(0, 500);
      clean[sid] = { reads, ratings, notes }; }
    importPending = clean;
    openSheet(`<h3>Restore this backup?</h3><p>It has ${plural(n, 'read issue')}${j.exported ? ' and was saved ' + esc(longDate(j.exported.slice(0, 10))) : ''}. It replaces what’s in the app now, on every device.</p>
      <button class="btn red" style="width:100%;margin-bottom:8px" data-act="doimport">Replace my progress</button><button class="opt" data-act="closesheet">Cancel</button>`);
  } catch (e) { toast('That file isn’t a Read-Through backup.'); }
  const f = $('imp'); if (f) f.value = '';
}
function doImport() {
  if (!importPending || !guard()) return;
  for (const c of chapters) { prog[c.id] = importPending[c.id] || { reads: {}, ratings: {}, notes: {} }; queue(c.id); }
  importPending = null; render(); toast('Backup restored');
}

/* ================= auth ================= */
async function authSubmit(create) {
  if (!fb) return;
  const em = $('em')?.value.trim(), pw = $('pw')?.value;
  if (!em || !pw) { authErr = 'Enter an email and password.'; render(); return; }
  authErr = '';
  try { await (create ? fb.createUserWithEmailAndPassword : fb.signInWithEmailAndPassword)(fb.auth, em, pw); navTo('home'); }
  catch (e) {
    const c = e && e.code || '';
    authErr = c.includes('email-already-in-use') ? 'That email already has an account. Tap Sign in instead.'
      : c.includes('weak-password') ? 'Use at least 6 characters.'
      : c.includes('invalid') || c.includes('wrong-password') || c.includes('user-not-found') ? 'That email and password don’t match.'
      : c.includes('network') ? 'No connection. Try again when you’re online.' : 'Sign-in failed (' + c + ').';
    render();
  }
}

/* ================= data sources ================= */
async function loadSeed() {
  try { const s = await (await fetch('data/seed.json')).json(); for (const k in s) prog[+k.slice(1)] = { reads: { ...s[k].reads }, ratings: { ...s[k].ratings } }; } catch (e) { }
}
async function startFirebase() {
  const [A, Au, F] = await Promise.all([import(FB + 'firebase-app.js'), import(FB + 'firebase-auth.js'), import(FB + 'firebase-firestore.js')]);
  const fbApp = A.initializeApp(firebaseConfig);
  let db;
  try { db = F.initializeFirestore(fbApp, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) }); }
  catch (e) { db = F.getFirestore(fbApp); }
  const auth = Au.getAuth(fbApp);
  try { await Au.setPersistence(auth, Au.indexedDBLocalPersistence); } catch (e) { }
  fb = { db, auth, doc: F.doc, setDoc: F.setDoc, signOut: Au.signOut, signInWithEmailAndPassword: Au.signInWithEmailAndPassword, createUserWithEmailAndPassword: Au.createUserWithEmailAndPassword };
  mode = 'live';
  let seededCheck = false, serverEmpty = false;
  const maybeSeed = async () => { if (serverEmpty && canWrite && !seededCheck) { seededCheck = true; await importSeed(); } };
  const timer = setTimeout(() => { if (!synced) { synced = true; note = 'Still waiting on your saved progress. What you see may be out of date.'; render(); } }, 10000);
  F.onSnapshot(F.collection(db, 'progress'), { includeMetadataChanges: true }, async snap => {
    synced = true;
    if (!snap.metadata.fromCache) { clearTimeout(timer); note = ''; lastServer = new Date(); }
    for (const d of snap.docs) { const sid = +d.id.slice(1); if (dirty[sid] || writing[sid]) continue; const v = d.data() || {}; prog[sid] = { reads: { ...(v.reads || {}) }, ratings: { ...(v.ratings || {}) }, notes: { ...(v.notes || {}) } }; }
    if (!snap.metadata.fromCache) { serverEmpty = snap.empty; await maybeSeed(); }
    const cur = curChapter(); if (cat[cur.id] === undefined) loadCat(cur.id).then(() => render());
    if (!sheetOpen && document.activeElement?.id !== 'q') render();
  }, () => { synced = true; clearTimeout(timer); note = 'Your progress stopped syncing. Close and reopen the app to reconnect.'; render(); });
  Au.onAuthStateChanged(fb.auth, u => { user = u; canWrite = !!u; render(); maybeSeed(); });
}
async function importSeed() {
  let s; try { const r = await fetch('data/seed.json'); if (!r.ok) return; s = await r.json(); } catch (e) { return; }
  for (const k in s) {
    const sid = +k.slice(1); if (!Object.keys(s[k].reads).length && !Object.keys(s[k].ratings).length) continue;
    prog[sid] = { reads: { ...s[k].reads }, ratings: { ...s[k].ratings } }; dirty[sid] = true; await flush(sid);
  }
  render(); toast('Imported your progress from the Google Sheet.');
}

/* ================= service worker updates ================= */
let reg = null;
function watchSW(r) {
  reg = r;
  if (r.waiting && navigator.serviceWorker.controller) { swWaiting = r.waiting; render(); }
  r.addEventListener('updatefound', () => {
    const w = r.installing; if (!w) return;
    w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) { swWaiting = w; render(); } });
  });
}
async function checkUpdate() {
  if (!reg) { toast('Updates aren’t available in this browser.'); return; }
  toast('Checking…'); try { await reg.update(); } catch (e) { }
  setTimeout(() => { if (!swWaiting) toast('You’re on the latest version.'); }, 2500);
}
if ('serviceWorker' in navigator) {
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloading) return; reloading = true; location.reload(); });
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').then(watchSW).catch(() => { }));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && reg) reg.update().catch(() => { }); });
}

/* ================= boot ================= */
(async () => {
  try {
    const [c, m] = await Promise.all([fetch('data/chapters.json').then(r => r.json()), fetch('data/meta.json').then(r => r.json()).catch(() => null)]);
    chapters = c; meta = m || { characters: [], writers: [], events: [] };
    fetch('data/recaps.json').then(r => r.ok ? r.json() : {}).then(j => { recaps = j || {}; render(); }).catch(() => { });
  } catch (e) { app.innerHTML = '<p class="status">Couldn’t load the chapter list. Check your connection.</p>'; return; }
  chapters.forEach(c => chById[c.id] = c);
  for (const e of meta.events) for (const sid in e.issues) for (const n of e.issues[sid]) { const k = sid + ':' + n; if (!evIdx[k]) evIdx[k] = e.name; }
  loaded = true;
  if (!firebaseConfig) { mode = 'preview'; await loadSeed(); synced = true; }
  route();
  const cur = curChapter(); loadCat(cur.id).then(() => render());
  if (firebaseConfig) { try { await startFirebase(); } catch (e) { synced = true; note = 'Couldn’t reach the sync service. Showing what’s saved on this device.'; render(); } }
  setTimeout(() => loadAll(), 1500);
})();
