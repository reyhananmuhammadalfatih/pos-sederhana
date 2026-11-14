/* TutupKas — prototipe front-end (data disimpan di localStorage perangkat) */
'use strict';

/* ---------- Ikon ---------- */
const P = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v11h14V9"/><path d="M10 20v-6h4v6"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M2 20h20"/>',
  gear: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  unlock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  camera: '<path d="M4 7h3l2-3h6l2 3h3v13H4z"/><circle cx="12" cy="13" r="4"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  alert: '<path d="M12 3 2 21h20z"/><path d="M12 10v4M12 17.5v.01"/>',
  left: '<path d="M15 18l-6-6 6-6"/>',
  right: '<path d="M9 18l6-6-6-6"/>',
  wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/>',
  share: '<path d="M4 12v8h16v-8M12 3v13M7 8l5-5 5 5"/>',
  store: '<path d="M3 9l2-5h14l2 5M4 9v11h16V9M3 9h18"/><path d="M9 20v-6h6v6"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  upload: '<path d="M12 21V9M7 14l5-5 5 5M4 3h16"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V4H3v13h5"/>',
  receipt: '<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  moon: '<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
};
const ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ''}</svg>`;

/* ---------- Util ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rp = n => (n < 0 ? '−' : '') + 'Rp' + Math.abs(Math.round(n || 0)).toLocaleString('id-ID');
const rpSigned = n => (n > 0 ? '+' : '') + rp(n);
const rpShort = n => {
  const a = Math.abs(n);
  if (a >= 1e6) return (n / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + 'jt';
  if (a >= 1e3) return Math.round(n / 1e3) + 'rb';
  return String(Math.round(n));
};
const numOnly = s => parseInt(String(s ?? '').replace(/\D/g, ''), 10) || 0;
const fmtNum = n => (n ? Number(n).toLocaleString('id-ID') : '');
const uid = () => Math.random().toString(36).slice(2, 9);
const pad = n => String(n).padStart(2, '0');
const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dateOf = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (k, n) => { const d = dateOf(k); d.setDate(d.getDate() + n); return keyOf(d); };
const daysBetween = (a, b) => Math.round((dateOf(b) - dateOf(a)) / 864e5);
const fDate = (k, o = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) => dateOf(k).toLocaleDateString('id-ID', o);
const fDateShort = k => fDate(k, { weekday: 'short', day: 'numeric', month: 'short' });
const fTime = ts => new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
const fMonth = (y, m) => new Date(y, m, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
const toMin = hhmm => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

/* ---------- State ---------- */
const STORE_KEY = 'tutupkas.v1';
const DENOMS = [100000, 50000, 20000, 10000, 5000, 2000, 1000];
const CAT_COLORS = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)', 'var(--c6)', 'var(--c1)', 'var(--c2)'];
const SOURCES = { kas: 'Kas laci', owner: 'Uang owner', transfer: 'Transfer/QRIS' };

const defaultSettings = () => ({
  businessName: 'Warung Makan Rasa Bunda',
  outlet: 'Outlet Pusat',
  closeTime: '21:00',
  rollover: 5,           // jam pergantian hari bisnis (closing lewat tengah malam tetap dihitung hari sebelumnya)
  openingCash: 300000,   // modal kembalian di laci
  backfillDays: 3,       // batas input susulan (hari)
  ignoreCloseTime: false,
  role: 'owner',
  staff: ['Andi', 'Sari', 'Budi'],
  channels: [
    { id: 'tunai', name: 'Tunai', cash: true },
    { id: 'qris', name: 'QRIS', cash: false },
    { id: 'transfer', name: 'Debit / Transfer', cash: false },
    { id: 'gofood', name: 'GoFood', cash: false },
    { id: 'grabfood', name: 'GrabFood', cash: false },
    { id: 'shopeefood', name: 'ShopeeFood', cash: false },
  ],
  cats: [
    { id: 'bahan', name: 'Bahan baku' },
    { id: 'gas', name: 'Gas & BBM' },
    { id: 'kemasan', name: 'Kemasan' },
    { id: 'gaji', name: 'Gaji harian' },
    { id: 'ops', name: 'Operasional' },
    { id: 'lain', name: 'Lain-lain' },
  ],
  quick: [
    { cat: 'gas', name: 'Gas LPG 3 kg', amount: 22000 },
    { cat: 'bahan', name: 'Es batu', amount: 10000 },
    { cat: 'bahan', name: 'Sayur pasar', amount: 85000 },
    { cat: 'kemasan', name: 'Plastik & styrofoam', amount: 35000 },
    { cat: 'gaji', name: 'Uang makan karyawan', amount: 50000 },
    { cat: 'ops', name: 'Air galon', amount: 20000 },
  ],
});

let S = null;
S = load();
/* Lengkapi data lama/backup lama dengan nilai bawaan — hanya MENAMBAH field yang hilang, tidak menghapus/mengubah isi */
function normalizeData(s) {
  s.settings = { ...defaultSettings(), ...(s.settings || {}) };
  s.closings ||= {}; s.drafts ||= {}; s.storeClosed ||= {}; s.meta ||= {};
  for (const [k, c] of Object.entries(s.closings)) {
    if (!c || typeof c !== 'object') { delete s.closings[k]; continue; }
    c.date ||= k;
    c.income ||= {};
    c.expenses = Array.isArray(c.expenses) ? c.expenses : [];
    c.revisions = Array.isArray(c.revisions) ? c.revisions : [];
    c.pic ??= '-';
  }
  for (const d of Object.values(s.drafts)) {
    if (!d || typeof d !== 'object') continue;
    d.income ||= {}; d.denoms ||= {};
    d.expenses = Array.isArray(d.expenses) ? d.expenses : [];
  }
  return s;
}
function load() {
  const raw = localStorage.getItem(STORE_KEY);
  if (raw) {
    try { return normalizeData(JSON.parse(raw)); }
    catch (e) {
      // jangan timpa data yang gagal dibaca — simpan salinannya dulu
      try { localStorage.setItem(`${STORE_KEY}.rusak-${Date.now()}`, raw); } catch (_) { /* abaikan */ }
    }
  }
  return seed();
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); }
  catch (e) { toast('Penyimpanan perangkat penuh. Kurangi foto nota.'); }
}

/* ---------- Data demo ---------- */
function seed() {
  const s = { settings: defaultSettings(), closings: {}, drafts: {}, storeClosed: {}, meta: {} };
  const today = bizToday(s.settings);
  const start = addDays(today, -62);
  s.meta.startDate = start;
  let r = 7;
  const rnd = (a, b) => { r = (r * 9301 + 49297) % 233280; return a + Math.floor((r / 233280) * (b - a)); };
  const round = n => Math.round(n / 500) * 500;
  const skip = new Set([addDays(today, -1), addDays(today, -3)]); // sengaja dikosongkan untuk demo input susulan
  for (let i = 62; i >= 1; i--) {
    const k = addDays(today, -i);
    if (skip.has(k)) continue;
    const dow = dateOf(k).getDay();
    if (dow === 1 && rnd(0, 10) < 3) continue; // kadang libur Senin
    const boost = (dow === 0 || dow === 6) ? 1.35 : 1;
    const income = {
      tunai: round(rnd(650, 1500) * 1000 * boost), qris: round(rnd(350, 1000) * 1000 * boost),
      transfer: rnd(0, 10) < 3 ? round(rnd(50, 250) * 1000) : 0,
      gofood: round(rnd(250, 850) * 1000 * boost), grabfood: round(rnd(180, 650) * 1000 * boost),
      shopeefood: round(rnd(60, 380) * 1000 * boost),
    };
    const ex = [];
    const add = (cat, name, amount, source = 'kas') => ex.push({ id: uid(), cat, name, amount: round(amount), source, note: '', photo: null });
    add('bahan', 'Belanja pasar (ayam, sayur, bumbu)', rnd(550, 1150) * 1000, rnd(0, 10) < 7 ? 'kas' : 'owner');
    if (rnd(0, 10) < 4) add('gas', 'Gas LPG 3 kg x2', 44000);
    add('bahan', 'Es batu', 10000);
    if (rnd(0, 10) < 3) add('kemasan', 'Plastik & styrofoam', rnd(30, 90) * 1000);
    add('gaji', 'Gaji harian 2 orang', 300000, 'kas');
    if (rnd(0, 10) < 3) add('ops', ['Air galon', 'Sabun & tisu', 'Parkir & bensin'][rnd(0, 3)], rnd(15, 60) * 1000);
    if (rnd(0, 20) < 1) add('lain', 'Servis kompor', 150000, 'owner');
    const draft = { income, expenses: ex, openingCash: s.settings.openingCash, channels: s.settings.channels };
    const t = totals(draft);
    const diffs = [0, 0, 0, 0, 0, -2000, 1000, -5000, 500, -10000];
    const diff = diffs[rnd(0, diffs.length)];
    const staff = s.settings.staff[rnd(0, 3)];
    const ct = dateOf(k); ct.setHours(21, rnd(10, 59));
    s.closings[k] = {
      date: k, pic: staff, income, trx: rnd(70, 160), expenses: ex, openingCash: s.settings.openingCash,
      countMode: 'total', denoms: {}, coins: 0, countedTotal: t.expected + diff,
      note: '', diffNote: diff ? (diff < 0 ? 'Kemungkinan salah kembalian' : 'Pembeli tidak ambil kembalian') : '',
      lateNote: '', channels: s.settings.channels, submittedAt: ct.getTime(), late: false, revisions: [],
    };
  }
  return s;
}

/* ---------- Aturan waktu closing ---------- */
function bizToday(st = S.settings) {
  const n = new Date();
  if (n.getHours() < st.rollover) n.setDate(n.getDate() - 1);
  return keyOf(n);
}
function afterClose() {
  const n = new Date();
  const m = n.getHours() * 60 + n.getMinutes();
  return n.getHours() < S.settings.rollover || m >= toMin(S.settings.closeTime);
}
function minutesToClose() {
  const n = new Date();
  return toMin(S.settings.closeTime) - (n.getHours() * 60 + n.getMinutes());
}
function access(date) {
  const today = bizToday();
  const dr = S.drafts[date];
  if (date > today) return { ok: false, reason: 'future' };
  if (S.closings[date] && !(dr && dr.isRevision)) return { ok: false, reason: 'done' };
  if (dr && dr.isRevision) return { ok: true, revision: true };
  if (date === today) {
    if (S.settings.ignoreCloseTime || afterClose() || S.storeClosed[today]) return { ok: true };
    return { ok: false, reason: 'open' };
  }
  const start = S.meta?.startDate;
  if (start && date < start) return { ok: false, reason: 'expired' };
  if (daysBetween(date, today) <= S.settings.backfillDays) return { ok: true, late: true };
  return { ok: false, reason: 'expired' };
}
function missedDays() {
  const today = bizToday();
  const out = [];
  for (let i = 1; i <= S.settings.backfillDays; i++) {
    const k = addDays(today, -i);
    if (S.meta?.startDate && k < S.meta.startDate) break;
    if (!S.closings[k]) out.push(k);
  }
  return out;
}

/* ---------- Perhitungan ---------- */
function counted(d) {
  if (d.countMode === 'pecahan') return DENOMS.reduce((a, v) => a + v * (+d.denoms?.[v] || 0), 0) + (+d.coins || 0);
  return +d.countedTotal || 0;
}
function totals(d) {
  const chs = d.channels || S.settings.channels;
  let income = 0, cashIncome = 0;
  for (const c of chs) { const v = +d.income?.[c.id] || 0; income += v; if (c.cash) cashIncome += v; }
  let expense = 0, cashExpense = 0;
  for (const e of d.expenses || []) { expense += e.amount; if (e.source === 'kas') cashExpense += e.amount; }
  const expected = (+d.openingCash || 0) + cashIncome - cashExpense;
  const cnt = counted(d);
  return {
    income, cashIncome, nonCash: income - cashIncome, expense, cashExpense, expected,
    counted: cnt, diff: cnt - expected, profit: income - expense,
    deposit: Math.max(0, cnt - (S ? S.settings.openingCash : (+d.openingCash || 0))),
  };
}
const catOf = id => S.settings.cats.find(c => c.id === id) || { id, name: id };
const catColor = id => { const i = S.settings.cats.findIndex(c => c.id === id); return CAT_COLORS[i < 0 ? 5 : i % CAT_COLORS.length]; };
const initials = s => s.replace(/[^\p{L}\p{N}\s]/gu, ' ').trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

/* ---------- UI helpers ---------- */
let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400);
}
let overlayGen = 0;
function closeOverlay() {
  const o = $('#overlay');
  if (!o.innerHTML) return;
  const gen = ++overlayGen;
  $$('.scrim, .sheet, .dialog', o).forEach(e => e.classList.remove('show'));
  setTimeout(() => { if (gen === overlayGen) o.innerHTML = ''; }, 220);
}
function openSheet(html, mount) {
  const o = $('#overlay'); overlayGen++;
  o.innerHTML = `<div class="scrim"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  $('.scrim', o).onclick = closeOverlay;
  requestAnimationFrame(() => { $('.scrim', o).classList.add('show'); $('.sheet', o).classList.add('show'); });
  mount && mount($('.sheet', o));
}
function confirmBox(title, msg, ok = 'Ya, lanjutkan', opts = {}) {
  return new Promise(res => {
    const o = $('#overlay'); overlayGen++;
    o.innerHTML = `<div class="scrim"></div><div class="dialog" role="alertdialog" aria-modal="true">
      <h3>${title}</h3><p>${msg}</p>
      ${opts.input ? `<div class="field" style="margin:-4px 0 16px"><textarea id="dlgInput" placeholder="${esc(opts.input)}"></textarea></div>` : ''}
      <div class="btn-row"><button class="btn" data-r="0">Batal</button><button class="btn primary ${opts.danger ? 'danger' : ''}" data-r="1">${ok}</button></div></div>`;
    requestAnimationFrame(() => { $('.scrim', o).classList.add('show'); $('.dialog', o).classList.add('show'); });
    const done = v => { closeOverlay(); res(v); };
    $('.scrim', o).onclick = () => done(false);
    $$('[data-r]', o).forEach(b => b.onclick = () => {
      if (b.dataset.r === '1' && opts.input) {
        const v = $('#dlgInput').value.trim();
        if (!v) { $('#dlgInput').focus(); return; }
        return done(v);
      }
      done(b.dataset.r === '1');
    });
  });
}
function bindMoney(root) {
  $$('input[data-money]', root).forEach(inp => {
    inp.addEventListener('input', () => {
      const n = numOnly(inp.value);
      inp.value = fmtNum(n);
      inp.dispatchEvent(new CustomEvent('money', { detail: n }));
    });
    inp.addEventListener('focus', () => setTimeout(() => inp.select(), 0));
  });
}
const moneyInput = (attrs, val, ph = '0') => `<span class="money-wrap"><input inputmode="numeric" autocomplete="off" data-money ${attrs} value="${fmtNum(val)}" placeholder="${ph}"></span>`;

/* ---------- Layout ---------- */
function topbarHome() {
  return `<div class="brand"><div class="brand-logo">${ic('store')}</div>
    <div style="min-width:0"><b>${esc(S.settings.businessName)}</b><small>${esc(S.settings.outlet)}</small></div></div>
    <button class="role-chip ${navigator.onLine ? '' : 'offline'}" data-act="role" title="Ganti peran (simulasi)"><span class="dot"></span>${S.settings.role === 'owner' ? 'Owner' : 'Staf'}</button>`;
}
function topbarBack(title, sub, back = '#/') {
  return `<a class="icon-btn" href="${back}" aria-label="Kembali">${ic('left')}</a><h1>${title}${sub ? `<small class="muted">${sub}</small>` : ''}</h1>`;
}
function renderNav(route) {
  const today = bizToday();
  const acc = access(today);
  const pending = missedDays().length + (!S.closings[today] && acc.ok ? 1 : 0);
  const fabLocked = !acc.ok && !missedDays().length && !S.closings[today];
  const items = [
    ['', 'home', 'Beranda'], ['riwayat', 'list', 'Riwayat'], ['closing', 'plus', 'Closing'],
    ['laporan', 'chart', 'Laporan'], ['pengaturan', 'gear', 'Atur'],
  ];
  $('#nav').innerHTML = items.map(([r, i, l]) => r === 'closing'
    ? `<a href="#/closing" class="fab ${fabLocked ? 'locked' : ''}"><span class="circle">${ic(fabLocked ? 'lock' : 'plus')}</span>${l}${pending ? `<span class="badge">${pending}</span>` : ''}</a>`
    : `<a href="#/${r}" class="${route === r ? 'active' : ''}">${ic(i)}${l}</a>`).join('');
}

/* ---------- Router ---------- */
const routes = {};
let current = '';
function render() {
  const parts = location.hash.replace(/^#\/?/, '').split('/');
  const [r, p] = [parts[0] || '', parts[1]];
  current = r;
  const fn = routes[r] || routes[''];
  closeOverlay();
  $$('#app > .stepper').forEach(e => e.remove());
  const res = fn(p) || {};
  $('#topbar').innerHTML = res.top ?? topbarHome();
  $('#view').innerHTML = res.html ?? '';
  const showNav = !res.noNav;
  $('#nav').style.display = showNav ? '' : 'none';
  $('#app').classList.toggle('no-nav', !showNav);
  if (showNav) renderNav(r);
  bindMoney($('#view'));
  res.mount && res.mount($('#view'));
  if (!res.keepScroll) window.scrollTo(0, 0);
}
window.addEventListener('hashchange', render);
window.addEventListener('scroll', () => $('#topbar').classList.toggle('scrolled', scrollY > 4), { passive: true });
document.addEventListener('click', async e => {
  const a = e.target.closest('[data-act]');
  if (!a) return;
  const act = a.dataset.act;
  if (act === 'role') {
    S.settings.role = S.settings.role === 'owner' ? 'staf' : 'owner'; save(); render();
    toast(`Mode simulasi: ${S.settings.role === 'owner' ? 'Owner' : 'Staf'}`);
  }
  if (act === 'store-closed') {
    const ok = await confirmBox('Toko sudah tutup?', `Jam tutup normal ${S.settings.closeTime}. Konfirmasi bahwa operasional hari ini sudah selesai — setelah ini input closing dibuka dan tercatat jam tutup lebih awal.`, 'Ya, toko sudah tutup');
    if (ok) { S.storeClosed[bizToday()] = Date.now(); save(); location.hash = '#/closing'; render(); }
  }
});

/* ================= BERANDA ================= */
routes[''] = () => {
  const today = bizToday();
  const c = S.closings[today];
  const acc = access(today);
  const dr = S.drafts[today];
  const hour = new Date().getHours();
  const greet = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam';
  let status;
  if (c && !(dr && dr.isRevision)) {
    const t = totals(c);
    status = `<section class="card status done">
      <span class="tag">${ic('check', 'xs')} Closing hari ini selesai</span>
      <div><h2>${fDate(today, { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
      <p>Dikirim ${fTime(c.submittedAt)} oleh ${esc(c.pic)}</p></div>
      <div class="split"><div><small>Pemasukan</small><b class="in num">${rp(t.income)}</b></div>
      <div><small>Pengeluaran</small><b class="out num">${rp(t.expense)}</b></div></div>
      <a class="btn block" href="#/riwayat/${today}">Lihat detail closing</a></section>`;
  } else if (acc.ok) {
    const early = S.storeClosed[today] && !afterClose();
    status = `<section class="card status ready">
      <span class="tag">${ic('store', 'xs')} ${early ? `Tutup lebih awal · ${fTime(S.storeClosed[today])}` : 'Toko sudah tutup'}</span>
      <div><h2>Saatnya closing hari ini</h2>
      <p>${dr ? `Draf tersimpan — lanjutkan dari langkah ${dr.step + 1} dari 4.` : 'Catat pemasukan, pengeluaran, lalu hitung uang di laci. ±5 menit.'}</p></div>
      <a class="btn primary block" href="#/closing">${dr ? 'Lanjutkan closing' : 'Mulai closing'} ${ic('right', 'sm')}</a></section>`;
  } else {
    const m = minutesToClose();
    const openMin = 8 * 60; // ilustrasi bar progres jam operasional
    const pct = Math.min(100, Math.max(0, ((toMin(S.settings.closeTime) - m) - openMin) / (toMin(S.settings.closeTime) - openMin) * 100));
    status = `<section class="card status locked">
      <span class="tag">${ic('lock', 'xs')} Toko masih buka</span>
      <div><p>Input closing dibuka dalam</p>
      <div class="countdown num" id="countdown">${Math.floor(m / 60)}<small> jam </small>${m % 60}<small> menit</small></div>
      <p>Fokus melayani pelanggan dulu. Pencatatan dilakukan setelah tutup pukul <b>${S.settings.closeTime}</b>.</p></div>
      <div class="timeline"><span>Buka</span><div class="bar"><i style="width:${pct}%"></i></div><span>${S.settings.closeTime}</span></div>
      <button class="btn block" data-act="store-closed">${ic('store', 'sm')} Toko sudah tutup lebih awal</button></section>`;
  }

  const missed = missedDays();
  const missedHtml = missed.length ? `<div class="alert danger">${ic('alert')}<div style="flex:1">
      <b>${missed.length} hari belum closing</b>
      <p>Input susulan maksimal ${S.settings.backfillDays} hari ke belakang, wajib isi alasan.</p>
      <div class="chips" style="margin-top:8px">${missed.map(k => `<a class="chip" href="#/closing/${k}">${fDateShort(k)} ${ic('right', 'xs')}</a>`).join('')}</div>
    </div></div>` : '';

  // ringkasan 7 hari
  const days = [...Array(7)].map((_, i) => addDays(today, i - 6));
  const sum = days.reduce((a, k) => { const c = S.closings[k]; if (c) { const t = totals(c); a.i += t.income; a.e += t.expense; a.n++; } return a; }, { i: 0, e: 0, n: 0 });
  const prevDays = days.map(k => addDays(k, -7));
  const prev = prevDays.reduce((a, k) => { const c = S.closings[k]; if (c) a += totals(c).income; return a; }, 0);
  const delta = prev ? Math.round((sum.i - prev) / prev * 100) : 0;
  const isOwner = S.settings.role === 'owner';

  const recent = Object.values(S.closings).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  return {
    html: `
      <div style="padding:4px 2px 0"><small class="muted">${greet} 👋</small><h2 style="font-size:22px">${fDate(today, { weekday: 'long', day: 'numeric', month: 'long' })}</h2></div>
      ${status}
      ${missedHtml}
      ${isOwner ? `
      <div class="sec-title">7 hari terakhir <a href="#/laporan">Laporan lengkap</a></div>
      <div class="kpis">
        <div class="kpi"><small>Pemasukan</small><b class="num">${rp(sum.i)}</b><span class="delta ${delta >= 0 ? 'in' : 'out'}">${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta)}% vs minggu lalu</span></div>
        <div class="kpi"><small>Pengeluaran</small><b class="num">${rp(sum.e)}</b><span class="delta muted">${sum.i ? Math.round(sum.e / sum.i * 100) : 0}% dari pemasukan</span></div>
        <div class="kpi wide"><small>Laba bersih (sebelum biaya tetap)</small><b class="num ${sum.i - sum.e >= 0 ? 'in' : 'out'}" style="font-size:22px">${rp(sum.i - sum.e)}</b>
          ${barChart(days, { height: 90, labels: 'dow' })}</div>
      </div>` : `<div class="alert info">${ic('info')}<div><b>Mode Staf</b><p>Ringkasan keuangan hanya terlihat oleh Owner. Tugas staf: closing tepat waktu & hitung kas dengan teliti.</p></div></div>`}
      <div class="sec-title">Closing terakhir <a href="#/riwayat">Semua</a></div>
      <div class="card tight">${recent.map(closingRow).join('') || `<div class="empty">Belum ada data</div>`}</div>
      <p class="foot-note">Prototipe front-end · data tersimpan di perangkat ini</p>`,
  };
};

function closingRow(c) {
  const t = totals(c);
  const d = dateOf(c.date);
  const isOwner = S.settings.role === 'owner';
  const pills = [];
  if (c.late) pills.push('<span class="pill warn">Susulan</span>');
  if (t.diff) pills.push(`<span class="pill ${t.diff < 0 ? 'out' : 'info'}">Selisih ${rpSigned(t.diff)}</span>`);
  if (c.revisions?.length) pills.push('<span class="pill">Direvisi</span>');
  return `<a class="list-item" href="#/riwayat/${c.date}">
    <div class="date-badge"><b>${d.getDate()}</b><small>${d.toLocaleDateString('id-ID', { weekday: 'short' })}</small></div>
    <div class="grow"><b>${fDate(c.date, { day: 'numeric', month: 'long' })}</b><small>PIC ${esc(c.pic)} · ${fTime(c.submittedAt)}</small>${pills.length ? `<div class="pills">${pills.join('')}</div>` : ''}</div>
    <div class="end">${isOwner ? `<b class="num">${rp(t.income)}</b><small class="out num">−${rpShort(t.expense)}</small>` : ic('right', 'sm')}</div></a>`;
}

/* group: 'day' | 'week' | 'month' — rentang panjang dikelompokkan agar grafik tetap terbaca */
function barChart(keys, { height = 120, labels = 'auto', group = 'day' } = {}) {
  let buckets;
  if (group === 'day') {
    buckets = keys.map(k => ({
      keys: [k], title: fDateShort(k),
      label: labels === 'dow' ? dateOf(k).toLocaleDateString('id-ID', { weekday: 'short' }) : String(dateOf(k).getDate()),
    }));
  } else {
    const map = new Map();
    for (const k of keys) {
      const d = dateOf(k);
      let id, label, title;
      if (group === 'week') {
        id = addDays(k, -((d.getDay() + 6) % 7)); // Senin
        const m = dateOf(id);
        label = `${m.getDate()}/${m.getMonth() + 1}`;
        title = `Minggu mulai ${fDate(id, { day: 'numeric', month: 'short', year: 'numeric' })}`;
      } else {
        id = k.slice(0, 7);
        label = d.toLocaleDateString('id-ID', { month: 'short' }) + (d.getMonth() === 0 ? ` '${String(d.getFullYear()).slice(2)}` : '');
        title = fMonth(d.getFullYear(), d.getMonth());
      }
      if (!map.has(id)) map.set(id, { keys: [], label, title });
      map.get(id).keys.push(k);
    }
    buckets = [...map.values()];
  }
  const data = buckets.map(b => {
    let has = false, income = 0, expense = 0;
    for (const k of b.keys) { const c = S.closings[k]; if (c) { has = true; const t = totals(c); income += t.income; expense += t.expense; } }
    return has ? { income, expense } : null;
  });
  const W = 320, H = height, pb = 16, n = buckets.length;
  const max = Math.max(1, ...data.map(t => t ? Math.max(t.income, t.expense) : 0));
  const slot = W / n, bw = Math.max(2, Math.min(14, slot * .34));
  let g = '';
  data.forEach((t, i) => {
    const x = i * slot + slot / 2;
    const tt = esc(buckets[i].title);
    if (t) {
      const hi = (t.income / max) * (H - pb - 4), he = (t.expense / max) * (H - pb - 4);
      g += `<rect x="${x - bw - 1}" y="${H - pb - hi}" width="${bw}" height="${hi}" rx="2" fill="var(--in)"><title>${tt}: masuk ${rp(t.income)}</title></rect>`;
      g += `<rect x="${x + 1}" y="${H - pb - he}" width="${bw}" height="${he}" rx="2" fill="var(--out)" opacity=".8"><title>${tt}: keluar ${rp(t.expense)}</title></rect>`;
    } else {
      g += `<rect x="${x - 3}" y="${H - pb - 3}" width="6" height="3" rx="1.5" fill="var(--line)"/>`;
    }
    const step = Math.ceil(n / 8);
    const show = labels === 'dow' || n <= 10 || (i % step === 0 && n - 1 - i >= step / 2) || i === n - 1;
    if (show) g += `<text x="${x}" y="${H - 3}" text-anchor="middle">${esc(buckets[i].label)}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik pemasukan dan pengeluaran harian">
    <line x1="0" x2="${W}" y1="${H - pb}" y2="${H - pb}" stroke="var(--line)"/>${g}</svg>
    <div class="legend"><span><i style="background:var(--in)"></i>Pemasukan</span><span><i style="background:var(--out)"></i>Pengeluaran</span></div>`;
}

/* ================= CLOSING (WIZARD) ================= */
const STEPS = ['Pemasukan', 'Pengeluaran', 'Hitung kas', 'Kirim'];
function getDraft(date) {
  if (!S.drafts[date]) {
    S.drafts[date] = {
      date, step: 0, pic: '', income: {}, trx: '', expenses: [], openingCash: S.settings.openingCash,
      countMode: 'pecahan', denoms: {}, coins: 0, countedTotal: 0, note: '', diffNote: '', lateNote: '',
      noExpense: false, startedAt: Date.now(), agree: false,
    };
  }
  return S.drafts[date];
}

routes.closing = (dateParam) => {
  const today = bizToday();
  let date = dateParam;
  if (!date) {
    // tombol tengah: arahkan ke hari ini bila bisa, jika tidak ke hari susulan tertua
    const missed = missedDays();
    if (access(today).ok || S.closings[today]) date = today;
    else date = missed.length ? missed[missed.length - 1] : today;
  }
  const acc = access(date);
  if (acc.reason === 'done') { location.replace(`#/riwayat/${date}`); return { html: '' }; }
  if (!acc.ok) return lockedView(date, acc);

  const d = getDraft(date);
  if (acc.late && !d.late) d.late = true;
  const sub = `${fDate(date, { weekday: 'long', day: 'numeric', month: 'long' })}${acc.late ? ' · susulan' : ''}${acc.revision ? ' · revisi' : ''}`;
  return {
    top: topbarBack('Closing harian', sub),
    noNav: true,
    html: `<div class="stepper" id="stepper"></div><div id="stepBody" class="form"></div><div class="wiz-foot" id="wizFoot"></div>`,
    mount: root => {
      // stepper di luar main agar lengket
      const st = $('#stepper', root);
      $('#app').insertBefore(st, $('#view'));
      renderStep(date);
    },
  };
};

function lockedView(date, acc) {
  const msgs = {
    open: ['Toko masih buka', `Input closing hari ini baru dibuka setelah jam tutup <b>${S.settings.closeTime}</b>. Ini agar staf fokus melayani dan data tidak dicatat setengah-setengah.`],
    future: ['Belum waktunya', 'Closing tidak bisa diisi untuk tanggal yang belum terjadi.'],
    expired: ['Batas susulan lewat', `Closing hanya bisa disusulkan maksimal ${S.settings.backfillDays} hari. Hubungi owner untuk koreksi manual.`],
  };
  const [h, p] = msgs[acc.reason] || msgs.open;
  return {
    top: topbarBack('Closing harian', fDate(date, { weekday: 'long', day: 'numeric', month: 'long' })),
    html: `<div class="card lock-wall">${ic('lock')}<h2>${h}</h2><p>${p}</p>
      ${acc.reason === 'open' ? `<div class="countdown num" style="margin-bottom:16px">${Math.floor(minutesToClose() / 60)}<small> jam </small>${minutesToClose() % 60}<small> menit lagi</small></div>
      <button class="btn block" data-act="store-closed">${ic('store', 'sm')} Toko sudah tutup lebih awal</button>` : ''}
      <a class="btn ghost block" href="#/" style="margin-top:8px">Kembali ke beranda</a></div>
      ${acc.reason === 'open' ? `<div class="alert info">${ic('info')}<div><b>Kenapa dikunci?</b><p>Sesuai kebutuhan operasional: tidak ada input di jam ramai. Semua nota & uang dikumpulkan dulu, lalu dicatat sekaligus saat closing.</p></div></div>` : ''}`,
  };
}

function renderStep(date) {
  const d = S.drafts[date];
  const st = $('#stepper');
  st.innerHTML = STEPS.map((s, i) => `<button class="${i < d.step ? 'done' : ''} ${i === d.step ? 'active' : ''}" data-go="${i}"><i></i>${i + 1}. ${s}</button>`).join('');
  $$('[data-go]', st).forEach(b => b.onclick = () => { const i = +b.dataset.go; if (i < d.step) { d.step = i; save(); renderStep(date); } });

  const body = $('#stepBody');
  const foot = $('#wizFoot');
  const views = [stepIncome, stepExpense, stepCash, stepReview];
  const v = views[d.step](d, date);
  body.innerHTML = v.html;
  bindMoney(body);
  foot.innerHTML = `<div class="wiz-total" id="wizTotal"></div>
    <div class="btn-row">${d.step > 0 ? `<button class="btn" id="prevBtn">${ic('left', 'sm')} Kembali</button>` : ''}
    <button class="btn primary" id="nextBtn">${d.step === 3 ? `${ic('lock', 'sm')} Kirim & kunci` : `Lanjut ${ic('right', 'sm')}`}</button></div>`;
  const updateTotal = () => { $('#wizTotal').innerHTML = v.total ? v.total() : ''; };
  v.mount && v.mount(body, () => { save(); updateTotal(); });
  updateTotal();
  if ($('#prevBtn')) $('#prevBtn').onclick = () => { d.step--; save(); renderStep(date); window.scrollTo(0, 0); };
  $('#nextBtn').onclick = async () => {
    const ok = await v.validate();
    if (!ok) return;
    if (d.step === 3) return submitClosing(date);
    d.step++; save(); renderStep(date); window.scrollTo(0, 0);
  };
}

/* Langkah 1: Pemasukan */
function stepIncome(d) {
  const chs = S.settings.channels;
  return {
    html: `
      <section class="card form">
        <div class="field"><span>Siapa yang closing?</span>
          <div class="chips" id="picChips">${S.settings.staff.map(s => `<button class="chip ${d.pic === s ? 'on' : ''}" data-pic="${esc(s)}">${ic('user', 'xs')} ${esc(s)}</button>`).join('')}</div></div>
        ${d.late ? `<div class="field" id="lateField"><span>Alasan terlambat closing <b class="out">*</b></span>
          <textarea id="lateNote" placeholder="Contoh: listrik padam, HP mati, lupa…">${esc(d.lateNote)}</textarea></div>` : ''}
      </section>
      <div class="sec-title">Penjualan per kanal</div>
      <div class="alert info" style="margin-top:-2px">${ic('receipt')}<div><p style="margin:0">Ambil angka dari rekap kasir / laporan aplikasi ojol / mutasi QRIS hari ini.</p></div></div>
      <section class="card tight">
        ${chs.map(c => `<label class="row-input">
          <span class="ch-ico ${c.cash ? 'cash' : 'non'}">${esc(initials(c.name))}</span>
          <span class="lbl"><b>${esc(c.name)}</b><small>${c.cash ? 'Uang masuk laci' : 'Non tunai'}</small></span>
          ${moneyInput(`data-inc="${c.id}"`, d.income[c.id])}</label>`).join('')}
      </section>
      <section class="card"><label class="field"><span>Jumlah transaksi / nota <small class="muted">(opsional)</small></span>
        <input type="number" inputmode="numeric" min="0" id="trx" value="${esc(d.trx)}" placeholder="Contoh: 112"></label></section>`,
    mount: (root, changed) => {
      $$('[data-pic]', root).forEach(b => b.onclick = () => {
        d.pic = b.dataset.pic; $$('[data-pic]', root).forEach(x => x.classList.toggle('on', x === b)); changed();
      });
      $$('[data-inc]', root).forEach(i => i.addEventListener('money', e => { d.income[i.dataset.inc] = e.detail; changed(); }));
      $('#trx', root).oninput = e => { d.trx = e.target.value; changed(); };
      if ($('#lateNote', root)) $('#lateNote', root).oninput = e => { d.lateNote = e.target.value; changed(); };
    },
    total: () => { const t = totals(d); return `<span class="muted">Total pemasukan <small>(tunai ${rpShort(t.cashIncome)} · non ${rpShort(t.nonCash)})</small></span><b class="in num">${rp(t.income)}</b>`; },
    validate: async () => {
      if (!d.pic) { toast('Pilih nama PIC closing dulu'); return false; }
      if (d.late && !d.lateNote.trim()) { toast('Isi alasan terlambat closing'); $('#lateField').classList.add('err'); return false; }
      if (!totals(d).income) return confirmBox('Pemasukan Rp0?', 'Tidak ada penjualan sama sekali hari ini (toko libur)? Pastikan bukan karena lupa mengisi.', 'Ya, memang Rp0');
      return true;
    },
  };
}

/* Langkah 2: Pengeluaran */
function stepExpense(d, date) {
  const list = () => d.expenses.length ? d.expenses.map(e => `<div class="exp-item">
      <span class="cat-dot" style="background:${catColor(e.cat)}">${esc(initials(catOf(e.cat).name))}</span>
      <div class="grow"><b>${esc(e.name)}</b><small>${esc(catOf(e.cat).name)} · ${SOURCES[e.source]}${e.note ? ' · ' + esc(e.note) : ''}</small></div>
      ${e.photo ? `<img class="thumb" src="${e.photo}" alt="Nota">` : ''}
      <b class="num out">${rp(e.amount)}</b>
      <div class="acts"><button data-edit="${e.id}" aria-label="Ubah">${ic('edit', 'xs')}</button><button data-del="${e.id}" aria-label="Hapus">${ic('trash', 'xs')}</button></div>
    </div>`).join('')
    : `<div class="empty">${ic('receipt')}<div>Belum ada pengeluaran dicatat</div>
       <label class="check" style="justify-content:center;margin-top:12px"><input type="checkbox" id="noExp" ${d.noExpense ? 'checked' : ''}><span>Hari ini memang tidak ada pengeluaran</span></label></div>`;
  return {
    html: `
      <div class="alert">${ic('receipt')}<div><b>Kumpulkan semua nota hari ini</b><p>Termasuk belanja yang dibayar pakai uang laci. Foto nota opsional tapi disarankan.</p></div></div>
      <div class="sec-title">Tambah cepat</div>
      <div class="scroll-x">${S.settings.quick.map((q, i) => `<button class="chip" data-quick="${i}">${ic('plus', 'xs')} ${esc(q.name)} <small>${rpShort(q.amount)}</small></button>`).join('')}</div>
      <div class="sec-title">Daftar pengeluaran <span class="muted" id="expCount" style="text-transform:none">${d.expenses.length} item</span></div>
      <section class="card tight" id="expList">${list()}</section>
      <button class="btn block" id="addExp" style="border-style:dashed">${ic('plus', 'sm')} Tambah pengeluaran</button>`,
    mount: (root, changed) => {
      const refresh = () => {
        $('#expList', root).innerHTML = list(); $('#expCount', root).textContent = `${d.expenses.length} item`;
        bindRows(); changed();
      };
      const bindRows = () => {
        $$('[data-del]', root).forEach(b => b.onclick = async () => {
          const e = d.expenses.find(x => x.id === b.dataset.del);
          if (await confirmBox('Hapus pengeluaran?', `${esc(e.name)} — ${rp(e.amount)}`, 'Hapus', { danger: true })) {
            d.expenses = d.expenses.filter(x => x !== e); refresh();
          }
        });
        $$('[data-edit]', root).forEach(b => b.onclick = () => expenseSheet(d, d.expenses.find(x => x.id === b.dataset.edit), refresh));
        const ne = $('#noExp', root); if (ne) ne.onchange = () => { d.noExpense = ne.checked; changed(); };
      };
      bindRows();
      $('#addExp', root).onclick = () => expenseSheet(d, null, refresh);
      $$('[data-quick]', root).forEach(b => b.onclick = () => {
        const q = S.settings.quick[+b.dataset.quick];
        expenseSheet(d, { ...q, source: 'kas', note: '', photo: null }, refresh, true);
      });
    },
    total: () => { const t = totals(d); return `<span class="muted">Total pengeluaran <small>(dari laci ${rpShort(t.cashExpense)})</small></span><b class="out num">${rp(t.expense)}</b>`; },
    validate: async () => {
      if (!d.expenses.length && !d.noExpense) {
        const ok = await confirmBox('Tidak ada pengeluaran?', 'Belum ada pengeluaran yang dicatat. Lanjut jika memang hari ini tidak ada belanja/biaya sama sekali.', 'Ya, tidak ada');
        if (ok) { d.noExpense = true; save(); }
        return ok;
      }
      return true;
    },
  };
}

function expenseSheet(d, item, onDone, isNewFromQuick = false) {
  const isEdit = item && !isNewFromQuick;
  const e = item ? { ...item } : { cat: S.settings.cats[0].id, name: '', amount: 0, source: 'kas', note: '', photo: null };
  const names = [...new Set(Object.values(S.closings).flatMap(c => c.expenses.map(x => x.name)))].slice(0, 40);
  openSheet(`<h3>${isEdit ? 'Ubah' : 'Tambah'} pengeluaran</h3>
    <div class="form">
      <div class="field"><span>Kategori</span><div class="chips" id="catChips">${S.settings.cats.map(c => `<button class="chip ${e.cat === c.id ? 'on' : ''}" data-cat="${c.id}">${esc(c.name)}</button>`).join('')}</div></div>
      <label class="field"><span>Keterangan</span><input id="exName" list="exNames" value="${esc(e.name)}" placeholder="Contoh: Ayam 5 kg"></label>
      <datalist id="exNames">${names.map(n => `<option value="${esc(n)}">`).join('')}</datalist>
      <label class="field"><span>Nominal</span>${moneyInput('id="exAmt"', e.amount).replace('money-wrap', 'money-wrap full')}</label>
      <div class="field"><span>Dibayar pakai</span><div class="seg" id="srcSeg">${Object.entries(SOURCES).map(([k, v]) => `<button class="${e.source === k ? 'on' : ''}" data-src="${k}">${v}</button>`).join('')}</div>
        <small class="muted" id="srcHint"></small></div>
      <label class="field"><span>Catatan <small class="muted">(opsional)</small></span><input id="exNote" value="${esc(e.note)}" placeholder="Contoh: harga naik"></label>
      <div class="field"><span>Foto nota <small class="muted">(opsional)</small></span>
        <label class="upload" id="upl">${e.photo ? `<img src="${e.photo}" alt="">` : ic('camera')}<div><b id="uplTxt">${e.photo ? 'Ganti foto' : 'Ambil foto nota'}</b><br><small>Kamera atau galeri</small></div>
        <input type="file" accept="image/*" capture="environment" id="exPhoto"></label></div>
      <div class="btn-row">${isEdit ? '' : ''}<button class="btn" id="exCancel">Batal</button><button class="btn primary" id="exSave">${ic('check', 'sm')} Simpan</button></div>
    </div>`, sheet => {
    bindMoney(sheet);
    const hint = () => { $('#srcHint', sheet).textContent = e.source === 'kas' ? 'Mengurangi uang di laci kasir.' : 'Tidak mengurangi uang laci (dicatat sebagai biaya saja).'; };
    hint();
    $$('[data-cat]', sheet).forEach(b => b.onclick = () => { e.cat = b.dataset.cat; $$('[data-cat]', sheet).forEach(x => x.classList.toggle('on', x === b)); });
    $$('[data-src]', sheet).forEach(b => b.onclick = () => { e.source = b.dataset.src; $$('[data-src]', sheet).forEach(x => x.classList.toggle('on', x === b)); hint(); });
    $('#exAmt', sheet).addEventListener('money', ev => { e.amount = ev.detail; });
    $('#exPhoto', sheet).onchange = async ev => {
      const f = ev.target.files[0]; if (!f) return;
      e.photo = await compressImage(f);
      $('#upl', sheet).querySelector('svg, img')?.replaceWith(Object.assign(document.createElement('img'), { src: e.photo }));
      $('#uplTxt', sheet).textContent = 'Ganti foto';
    };
    $('#exCancel', sheet).onclick = closeOverlay;
    $('#exSave', sheet).onclick = () => {
      e.name = $('#exName', sheet).value.trim(); e.note = $('#exNote', sheet).value.trim();
      if (!e.name) { $('#exName', sheet).focus(); return toast('Isi keterangan pengeluaran'); }
      if (!e.amount) { $('#exAmt', sheet).focus(); return toast('Isi nominal'); }
      if (isEdit) Object.assign(d.expenses.find(x => x.id === item.id), e);
      else d.expenses.push({ ...e, id: uid() });
      d.noExpense = false;
      closeOverlay(); onDone(); toast(isEdit ? 'Pengeluaran diperbarui' : 'Pengeluaran ditambahkan');
    };
    if (!isEdit && !isNewFromQuick) setTimeout(() => $('#exName', sheet).focus(), 250);
  });
}
function compressImage(file, max = 900) {
  return new Promise(res => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = img.width * s; c.height = img.height * s;
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', .6));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  });
}

/* Langkah 3: Hitung kas */
function stepCash(d) {
  const diffBox = () => {
    const t = totals(d);
    const cls = t.diff === 0 ? 'ok' : t.diff > 0 ? 'plus' : 'minus';
    const lbl = t.diff === 0 ? 'Kas pas 👍' : t.diff > 0 ? 'Kas lebih' : 'Kas kurang';
    return `<div class="diff-box ${cls}"><div><small class="muted">Uang fisik ${rp(t.counted)}</small><div style="font-weight:700">${lbl}</div></div><b class="num">${t.diff === 0 ? rp(0) : rpSigned(t.diff)}</b></div>`;
  };
  const denomRows = () => DENOMS.map(v => {
    const n = +d.denoms[v] || 0;
    const hue = { 100000: 'var(--out-soft)', 50000: 'var(--info-soft)', 20000: 'var(--in-soft)', 10000: 'var(--c5)', 5000: 'var(--warn-soft)', 2000: 'var(--surface-2)', 1000: 'var(--surface-2)' }[v];
    return `<div class="denom"><span class="note" style="background:${v === 10000 ? 'color-mix(in srgb,var(--c5) 18%,transparent)' : hue}">${rpShort(v).replace('rb', '.000')}</span>
      <div class="stepper-num"><button data-dec="${v}" aria-label="Kurangi">−</button><input inputmode="numeric" data-den="${v}" value="${n || ''}" placeholder="0"><button data-inc2="${v}" aria-label="Tambah">+</button></div>
      <span class="sub num" data-sub="${v}">${n ? rp(n * v) : '–'}</span></div>`;
  }).join('');
  return {
    html: `
      <section class="card">
        <h3>${ic('wallet', 'sm')} Uang yang seharusnya ada di laci</h3>
        <div class="recon">
          <div class="r"><span>Modal awal (kembalian)</span>${moneyInput('id="opening"', d.openingCash)}</div>
          <div class="r"><span>+ Penjualan tunai</span><b class="num in" id="rCashIn"></b></div>
          <div class="r"><span>− Pengeluaran dari laci</span><b class="num out" id="rCashOut"></b></div>
          <div class="r total"><span>Kas seharusnya</span><b class="num" id="rExp"></b></div>
        </div>
      </section>
      <section class="card form">
        <h3 style="margin:0">Hitung uang fisik di laci</h3>
        <div class="seg" id="modeSeg"><button data-mode="pecahan" class="${d.countMode === 'pecahan' ? 'on' : ''}">Per pecahan</button><button data-mode="total" class="${d.countMode === 'total' ? 'on' : ''}">Input total</button></div>
        <div id="countArea">${d.countMode === 'pecahan'
          ? `<div class="denoms">${denomRows()}</div><label class="row-input" style="padding:12px 0 0"><span class="lbl"><b>Koin</b><small>Total semua koin</small></span>${moneyInput('id="coins"', d.coins)}</label>`
          : `<label class="field"><span>Total uang di laci</span>${moneyInput('id="cTotal"', d.countedTotal).replace('money-wrap', 'money-wrap full')}</label>`}</div>
        <div id="diffBox">${diffBox()}</div>
        <div class="field ${totals(d).diff ? '' : 'hidden'}" id="diffField" ${totals(d).diff ? '' : 'style="display:none"'}><span>Penjelasan selisih <b class="out">*</b></span>
          <textarea id="diffNote" placeholder="Contoh: salah kembalian, uang pecahan ditukar, dll.">${esc(d.diffNote)}</textarea></div>
      </section>`,
    mount: (root, changed) => {
      const upd = () => {
        const t = totals(d);
        $('#rCashIn', root).textContent = rp(t.cashIncome);
        $('#rCashOut', root).textContent = '−' + rp(t.cashExpense);
        $('#rExp', root).textContent = rp(t.expected);
        $('#diffBox', root).innerHTML = diffBox();
        $('#diffField', root).style.display = t.diff ? '' : 'none';
        changed();
      };
      $('#opening', root).addEventListener('money', e => { d.openingCash = e.detail; upd(); });
      $$('[data-mode]', root).forEach(b => b.onclick = () => { d.countMode = b.dataset.mode; save(); renderStep(d.date); });
      const setDen = (v, n) => {
        n = Math.max(0, n); d.denoms[v] = n;
        $(`[data-den="${v}"]`, root).value = n || '';
        $(`[data-sub="${v}"]`, root).textContent = n ? rp(n * v) : '–';
        upd();
      };
      $$('[data-den]', root).forEach(i => { i.oninput = () => setDen(+i.dataset.den, numOnly(i.value)); i.onfocus = () => i.select(); });
      $$('[data-dec]', root).forEach(b => b.onclick = () => setDen(+b.dataset.dec, (+d.denoms[b.dataset.dec] || 0) - 1));
      $$('[data-inc2]', root).forEach(b => b.onclick = () => setDen(+b.dataset.inc2, (+d.denoms[b.dataset.inc2] || 0) + 1));
      if ($('#coins', root)) $('#coins', root).addEventListener('money', e => { d.coins = e.detail; upd(); });
      if ($('#cTotal', root)) $('#cTotal', root).addEventListener('money', e => { d.countedTotal = e.detail; upd(); });
      $('#diffNote', root).oninput = e => { d.diffNote = e.target.value; changed(); };
      upd();
    },
    total: () => { const t = totals(d); return `<span class="muted">Uang fisik dihitung</span><b class="num">${rp(t.counted)}</b>`; },
    validate: async () => {
      const t = totals(d);
      if (!t.counted) {
        const ok = await confirmBox('Uang laci Rp0?', 'Uang fisik belum dihitung. Hitung dulu uang di laci agar selisih kas bisa diketahui.', 'Tetap lanjut');
        if (!ok) return false;
      }
      if (t.diff && !d.diffNote.trim()) { toast('Jelaskan penyebab selisih kas'); $('#diffField').classList.add('err'); $('#diffNote').focus(); return false; }
      return true;
    },
  };
}

/* Langkah 4: Ringkasan & kirim */
function stepReview(d) {
  const t = totals(d);
  const chs = S.settings.channels.filter(c => +d.income[c.id]);
  const byCat = groupExpense(d.expenses);
  return {
    html: `
      <section class="card hero-num"><small class="muted">Laba kotor hari ini</small>
        <div class="big num ${t.profit >= 0 ? 'in' : 'out'}">${rp(t.profit)}</div>
        <div class="split"><div><small>Pemasukan</small><b class="num in">${rp(t.income)}</b></div><div><small>Pengeluaran</small><b class="num out">${rp(t.expense)}</b></div></div>
      </section>
      <section class="card"><h3>Pemasukan <span class="muted" style="font-weight:500;font-size:13px">${d.trx ? `· ${d.trx} transaksi` : ''}</span></h3>
        ${chs.map(c => `<div class="kv"><span>${esc(c.name)}</span><b class="num">${rp(d.income[c.id])}</b></div>`).join('') || '<div class="kv"><span>Tidak ada</span><b>–</b></div>'}</section>
      <section class="card"><h3>Pengeluaran <span class="muted" style="font-weight:500;font-size:13px">· ${d.expenses.length} item</span></h3>
        ${byCat.map(([k, v]) => `<div class="kv"><span>${esc(catOf(k).name)}</span><b class="num">${rp(v)}</b></div>`).join('') || '<div class="kv"><span>Tidak ada pengeluaran</span><b>–</b></div>'}</section>
      <section class="card"><h3>Kas laci</h3>
        <div class="kv"><span>Kas seharusnya</span><b class="num">${rp(t.expected)}</b></div>
        <div class="kv"><span>Uang fisik</span><b class="num">${rp(t.counted)}</b></div>
        <div class="kv"><span>Selisih</span><b class="num ${t.diff < 0 ? 'out' : t.diff > 0 ? 'in' : ''}">${t.diff ? rpSigned(t.diff) : 'Pas'}</b></div>
        ${t.diff ? `<div class="kv"><span>Alasan</span><b style="font-weight:500">${esc(d.diffNote)}</b></div>` : ''}
        <div class="kv"><span>Sisakan modal besok</span><b class="num">${rp(S.settings.openingCash)}</b></div>
        <div class="kv"><span>Setoran ke owner</span><b class="num" style="color:var(--primary)">${rp(t.deposit)}</b></div>
      </section>
      <section class="card form">
        <label class="field"><span>Catatan closing <small class="muted">(opsional)</small></span>
          <textarea id="note" placeholder="Contoh: stok ayam habis jam 19.00, kompor 2 bermasalah">${esc(d.note)}</textarea></label>
        <label class="check"><input type="checkbox" id="agree" ${d.agree ? 'checked' : ''}><span>Saya, <b>${esc(d.pic)}</b>, menyatakan data di atas sesuai nota & uang fisik. Setelah dikirim data <b>terkunci</b> dan hanya owner yang bisa membuka untuk revisi.</span></label>
      </section>`,
    mount: (root, changed) => {
      $('#note', root).oninput = e => { d.note = e.target.value; changed(); };
      $('#agree', root).onchange = e => { d.agree = e.target.checked; changed(); };
    },
    total: () => `<span class="muted">Setoran ke owner</span><b class="num">${rp(totals(d).deposit)}</b>`,
    validate: async () => {
      if (!d.agree) { toast('Centang pernyataan terlebih dulu'); return false; }
      return true;
    },
  };
}
function groupExpense(list) {
  const m = {};
  for (const e of list) m[e.cat] = (m[e.cat] || 0) + e.amount;
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}

function submitClosing(date) {
  const d = S.drafts[date];
  const prev = S.closings[date];
  const { step, agree, isRevision, revisionReason, ...data } = d;
  const rec = {
    ...data, channels: S.settings.channels.map(c => ({ ...c })),
    submittedAt: Date.now(), late: !!d.late, closedEarlyAt: S.storeClosed[date] || null,
    revisions: prev ? [...(prev.revisions || []), { at: Date.now(), reason: revisionReason || '', by: S.settings.role }] : [],
  };
  if (prev) rec.firstSubmittedAt = prev.firstSubmittedAt || prev.submittedAt;
  S.closings[date] = rec;
  delete S.drafts[date];
  save();
  location.hash = `#/selesai/${date}`;
}

/* ================= SELESAI ================= */
routes.selesai = date => {
  const c = S.closings[date];
  if (!c) { location.replace('#/'); return {}; }
  const t = totals(c);
  return {
    top: `<div style="flex:1"></div><a class="icon-btn" href="#/" aria-label="Tutup">${ic('x')}</a>`,
    noNav: true,
    html: `<div class="center"><div class="success-ic">${ic('check')}</div>
      <h2>Closing terkirim & terkunci</h2><p class="muted" style="margin:6px 0 0">${fDate(date)} · ${fTime(c.submittedAt)} · PIC ${esc(c.pic)}</p></div>
      <section class="card">
        <div class="kv"><span>Pemasukan</span><b class="num in">${rp(t.income)}</b></div>
        <div class="kv"><span>Pengeluaran</span><b class="num out">${rp(t.expense)}</b></div>
        <div class="kv"><span>Laba kotor</span><b class="num">${rp(t.profit)}</b></div>
        <div class="kv"><span>Selisih kas</span><b class="num">${t.diff ? rpSigned(t.diff) : 'Pas'}</b></div>
        <div class="kv"><span>Setoran ke owner</span><b class="num" style="color:var(--primary)">${rp(t.deposit)}</b></div>
      </section>
      <a class="btn primary block" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(shareText(c))}">${ic('share', 'sm')} Kirim laporan ke WhatsApp owner</a>
      <button class="btn block" id="copyBtn">${ic('copy', 'sm')} Salin ringkasan</button>
      <a class="btn ghost block" href="#/">Selesai</a>`,
    mount: root => { $('#copyBtn', root).onclick = () => copyText(shareText(c)); },
  };
};
function shareText(c) {
  const t = totals(c);
  const chs = (c.channels || S.settings.channels).filter(x => +c.income[x.id]);
  return [
    `*CLOSING ${S.settings.businessName.toUpperCase()}*`,
    `${S.settings.outlet} — ${fDate(c.date)}`,
    `PIC: ${c.pic}${c.late ? ' (susulan)' : ''}`, '',
    `*Pemasukan: ${rp(t.income)}*`, ...chs.map(x => `• ${x.name}: ${rp(c.income[x.id])}`),
    c.trx ? `• Transaksi: ${c.trx}` : null, '',
    `*Pengeluaran: ${rp(t.expense)}*`, ...groupExpense(c.expenses).map(([k, v]) => `• ${catOf(k).name}: ${rp(v)}`), '',
    `*Laba kotor: ${rp(t.profit)}*`,
    `Kas seharusnya ${rp(t.expected)} | fisik ${rp(t.counted)} | selisih ${t.diff ? rpSigned(t.diff) : 'pas'}`,
    t.diff ? `Alasan selisih: ${c.diffNote}` : null,
    `Setoran: ${rp(t.deposit)}`,
    c.note ? `\nCatatan: ${c.note}` : null,
  ].filter(x => x !== null).join('\n');
}
async function copyText(s) {
  try { await navigator.clipboard.writeText(s); toast('Ringkasan disalin'); }
  catch { toast('Gagal menyalin di browser ini'); }
}

/* ================= RIWAYAT ================= */
let histMonth = null;
routes.riwayat = date => {
  if (date) return detailView(date);
  const today = dateOf(bizToday());
  histMonth ||= [today.getFullYear(), today.getMonth()];
  const [y, m] = histMonth;
  const prefix = `${y}-${pad(m + 1)}`;
  const list = Object.values(S.closings).filter(c => c.date.startsWith(prefix)).sort((a, b) => b.date.localeCompare(a.date));
  const sum = list.reduce((a, c) => { const t = totals(c); a.i += t.income; a.e += t.expense; return a; }, { i: 0, e: 0 });
  const drafts = Object.values(S.drafts);
  const isOwner = S.settings.role === 'owner';
  const atMax = y === today.getFullYear() && m === today.getMonth();
  return {
    top: `<h1>Riwayat closing</h1>`,
    html: `
      ${drafts.length ? `<div class="sec-title">Draf belum dikirim</div><div class="card tight">${drafts.map(dr => `<a class="list-item" href="#/closing/${dr.date}">
        <div class="date-badge"><b>${dateOf(dr.date).getDate()}</b><small>${dateOf(dr.date).toLocaleDateString('id-ID', { weekday: 'short' })}</small></div>
        <div class="grow"><b>${fDate(dr.date, { day: 'numeric', month: 'long' })}</b><small>Langkah ${dr.step + 1}/4 ${dr.pic ? '· ' + esc(dr.pic) : ''}</small>
        <div class="pills"><span class="pill warn">${dr.isRevision ? 'Revisi' : 'Draf'}</span></div></div>${ic('right', 'sm')}</a>`).join('')}</div>` : ''}
      <div class="card month-nav">
        <button class="icon-btn" id="mPrev" aria-label="Bulan sebelumnya">${ic('left')}</button>
        <div class="center"><b>${fMonth(y, m)}</b><br><small>${list.length} hari tercatat</small></div>
        <button class="icon-btn" id="mNext" aria-label="Bulan berikutnya" ${atMax ? 'disabled style="opacity:.35"' : ''}>${ic('right')}</button>
      </div>
      ${isOwner ? `<div class="kpis"><div class="kpi"><small>Pemasukan</small><b class="num in">${rp(sum.i)}</b></div><div class="kpi"><small>Pengeluaran</small><b class="num out">${rp(sum.e)}</b></div></div>` : ''}
      <div class="card tight">${list.map(closingRow).join('') || `<div class="empty">${ic('list')}<div>Belum ada closing di bulan ini</div></div>`}</div>`,
    mount: root => {
      $('#mPrev', root).onclick = () => { histMonth = m === 0 ? [y - 1, 11] : [y, m - 1]; render(); };
      $('#mNext', root).onclick = () => { if (!atMax) { histMonth = m === 11 ? [y + 1, 0] : [y, m + 1]; render(); } };
    },
  };
};

function detailView(date) {
  const c = S.closings[date];
  if (!c) return { top: topbarBack('Detail closing', '', '#/riwayat'), html: `<div class="card empty">Data tidak ditemukan</div>` };
  const t = totals(c);
  const isOwner = S.settings.role === 'owner';
  const chs = (c.channels || S.settings.channels).filter(x => +c.income[x.id]);
  const photos = c.expenses.filter(e => e.photo);
  const pend = S.drafts[date]?.isRevision;
  return {
    top: topbarBack('Detail closing', fDate(date), '#/riwayat'),
    html: `
      <section class="card">
        <div class="kv"><span>PIC</span><b>${esc(c.pic)}</b></div>
        <div class="kv"><span>Dikirim</span><b>${fTime(c.submittedAt)} ${c.late ? `<span class="pill warn">Susulan</span>` : ''}</b></div>
        ${c.closedEarlyAt ? `<div class="kv"><span>Tutup lebih awal</span><b>${fTime(c.closedEarlyAt)}</b></div>` : ''}
        ${c.late ? `<div class="kv"><span>Alasan terlambat</span><b style="font-weight:500">${esc(c.lateNote)}</b></div>` : ''}
        <div class="kv"><span>Status</span><b><span class="pill in">${ic('lock', 'xs')} Terkunci</span></b></div>
      </section>
      ${isOwner ? `<section class="card hero-num"><small class="muted">Laba kotor</small><div class="big num ${t.profit >= 0 ? 'in' : 'out'}">${rp(t.profit)}</div>
        <div class="split"><div><small>Pemasukan</small><b class="num in">${rp(t.income)}</b></div><div><small>Pengeluaran</small><b class="num out">${rp(t.expense)}</b></div></div></section>` : ''}
      <section class="card"><h3>Pemasukan ${c.trx ? `<span class="muted" style="font-weight:500;font-size:13px">· ${c.trx} transaksi</span>` : ''}</h3>
        ${chs.map(x => `<div class="kv"><span>${esc(x.name)} ${x.cash ? '<span class="pill in">tunai</span>' : ''}</span><b class="num">${rp(c.income[x.id])}</b></div>`).join('') || '<div class="kv"><span>Tidak ada</span><b>–</b></div>'}
        <div class="kv"><span><b style="color:var(--text)">Total</b></span><b class="num in">${rp(t.income)}</b></div></section>
      <section class="card tight"><h3 style="padding:12px 16px 0">Pengeluaran · ${c.expenses.length} item</h3>
        ${c.expenses.map(e => `<div class="exp-item"><span class="cat-dot" style="background:${catColor(e.cat)}">${esc(initials(catOf(e.cat).name))}</span>
          <div class="grow"><b>${esc(e.name)}</b><small>${esc(catOf(e.cat).name)} · ${SOURCES[e.source]}${e.note ? ' · ' + esc(e.note) : ''}</small></div>
          <b class="num out">${rp(e.amount)}</b></div>`).join('') || '<div class="empty">Tidak ada pengeluaran</div>'}
        <div class="exp-item" style="border-top:1px solid var(--line)"><div class="grow"><b>Total</b></div><b class="num out">${rp(t.expense)}</b></div></section>
      ${photos.length ? `<section class="card"><h3>Foto nota</h3><div class="photos">${photos.map((e, i) => `<img src="${e.photo}" alt="${esc(e.name)}" data-ph="${i}">`).join('')}</div></section>` : ''}
      <section class="card"><h3>Rekonsiliasi kas laci</h3>
        <div class="kv"><span>Modal awal</span><b class="num">${rp(c.openingCash)}</b></div>
        <div class="kv"><span>+ Penjualan tunai</span><b class="num">${rp(t.cashIncome)}</b></div>
        <div class="kv"><span>− Pengeluaran dari laci</span><b class="num">${rp(t.cashExpense)}</b></div>
        <div class="kv"><span>Kas seharusnya</span><b class="num">${rp(t.expected)}</b></div>
        <div class="kv"><span>Uang fisik ${c.countMode === 'pecahan' ? '(per pecahan)' : ''}</span><b class="num">${rp(t.counted)}</b></div>
        <div class="kv"><span>Selisih</span><b class="num ${t.diff < 0 ? 'out' : ''}">${t.diff ? rpSigned(t.diff) : 'Pas'}</b></div>
        ${t.diff ? `<div class="kv"><span>Alasan</span><b style="font-weight:500">${esc(c.diffNote)}</b></div>` : ''}
        <div class="kv"><span>Setoran ke owner</span><b class="num" style="color:var(--primary)">${rp(t.deposit)}</b></div></section>
      ${c.note ? `<section class="card"><h3>Catatan</h3><p style="margin:0">${esc(c.note)}</p></section>` : ''}
      ${c.revisions?.length ? `<section class="card"><h3>Riwayat revisi</h3>${c.revisions.map(r => `<div class="kv"><span>${new Date(r.at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span><b style="font-weight:500">${esc(r.reason || '-')}</b></div>`).join('')}</section>` : ''}
      <div class="btn-row">
        <a class="btn" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(shareText(c))}">${ic('share', 'sm')} WhatsApp</a>
        <button class="btn" id="copyBtn">${ic('copy', 'sm')} Salin</button>
      </div>
      ${pend ? `<a class="btn primary block" href="#/closing/${date}">Lanjutkan revisi</a>` : isOwner
        ? `<button class="btn ghost block danger" id="reopen">${ic('unlock', 'sm')} Buka kunci untuk revisi (Owner)</button>`
        : `<p class="foot-note">${ic('lock', 'xs')} Data terkunci. Minta owner untuk membuka jika ada kesalahan.</p>`}`,
    mount: root => {
      $('#copyBtn', root).onclick = () => copyText(shareText(c));
      $$('[data-ph]', root).forEach(img => img.onclick = () => openSheet(`<h3>${esc(img.alt)}</h3><img src="${img.src}" style="width:100%;border-radius:12px" alt="">`));
      const ro = $('#reopen', root);
      if (ro) ro.onclick = async () => {
        const reason = await confirmBox('Buka kunci closing?', 'Closing akan dibuka sebagai draf revisi. Data lama tetap tersimpan sampai revisi dikirim ulang.', 'Buka kunci', { input: 'Alasan revisi (wajib)' });
        if (!reason) return;
        const { submittedAt, channels, revisions, ...rest } = JSON.parse(JSON.stringify(c));
        S.drafts[date] = { ...rest, step: 0, agree: false, isRevision: true, revisionReason: reason };
        save(); location.hash = `#/closing/${date}`;
      };
    },
  };
}

/* ================= LAPORAN ================= */
// Pilihan periode hanya disimpan di memori — tidak mengubah struktur data/backup JSON
let period = '30';
let customRange = { start: '', end: '' };
const PERIODS = [['7', '7 hari'], ['30', '30 hari'], ['bulan', 'Bulan ini'], ['lalu', 'Bulan lalu'], ['3b', '3B'], ['6b', '6B'], ['1t', '1 Tahun'], ['kustom', 'Pilih tanggal']];
const MAX_RANGE_DAYS = 1100; // ±3 tahun, menjaga laporan tetap ringan
function monthsBack(today, m) {
  const td = dateOf(today);
  const y = td.getFullYear(), mo = td.getMonth() - m;
  const dim = new Date(y, mo + 1, 0).getDate(); // jumlah hari di bulan tujuan
  return addDays(keyOf(new Date(y, mo, Math.min(td.getDate(), dim))), 1);
}
function periodRange(p, today) {
  const td = dateOf(today);
  switch (p) {
    case '7': case '30': return [addDays(today, -(+p - 1)), today];
    case 'bulan': return [keyOf(new Date(td.getFullYear(), td.getMonth(), 1)), today];
    case 'lalu': return [keyOf(new Date(td.getFullYear(), td.getMonth() - 1, 1)), keyOf(new Date(td.getFullYear(), td.getMonth(), 0))];
    case '3b': return [monthsBack(today, 3), today];
    case '6b': return [monthsBack(today, 6), today];
    case '1t': return [monthsBack(today, 12), today];
    default: {
      const valid = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '');
      let s = valid(customRange.start) ? customRange.start : addDays(today, -29);
      let e = valid(customRange.end) ? customRange.end : today;
      if (e > today) e = today;
      if (s > e) [s, e] = [e, s];
      if (daysBetween(s, e) > MAX_RANGE_DAYS) s = addDays(e, -MAX_RANGE_DAYS);
      return [s, e];
    }
  }
}
function keysBetween(s, e) {
  const out = [];
  for (let k = s; k <= e; k = addDays(k, 1)) out.push(k);
  return out;
}
routes.laporan = () => {
  if (S.settings.role !== 'owner') {
    return {
      top: '<h1>Laporan</h1>',
      html: `<div class="card lock-wall">${ic('lock')}<h2>Khusus Owner</h2><p>Laporan keuangan hanya bisa dilihat oleh owner.</p>
        <button class="btn block" data-act="role">Simulasikan sebagai Owner</button></div>`,
    };
  }
  const today = bizToday();
  const [rStart, rEnd] = periodRange(period, today);
  const keys = keysBetween(rStart, rEnd);
  const group = keys.length <= 45 ? 'day' : keys.length <= 200 ? 'week' : 'month';
  const groupLbl = { day: 'harian', week: 'mingguan', month: 'bulanan' }[group];
  const cs = keys.map(k => S.closings[k]).filter(Boolean);
  const agg = { i: 0, e: 0, diff: 0, minus: 0, trx: 0, late: 0, ch: {}, cat: {}, items: {} };
  for (const c of cs) {
    const t = totals(c);
    agg.i += t.income; agg.e += t.expense; agg.diff += t.diff; if (t.diff < 0) agg.minus += t.diff;
    agg.trx += +c.trx || 0; if (c.late) agg.late++;
    for (const ch of c.channels || S.settings.channels) agg.ch[ch.name] = (agg.ch[ch.name] || 0) + (+c.income?.[ch.id] || 0);
    for (const e of c.expenses || []) {
      const amt = +e.amount || 0;
      agg.cat[e.cat] = (agg.cat[e.cat] || 0) + amt;
      const nm = String(e.name || '-');
      const nk = nm.toLowerCase();
      agg.items[nk] ||= { name: nm, n: 0, sum: 0 }; agg.items[nk].n++; agg.items[nk].sum += amt;
    }
  }
  const profit = agg.i - agg.e;
  const margin = agg.i ? Math.round(profit / agg.i * 100) : 0;
  const missing = keys.filter(k => !S.closings[k] && (!S.meta?.startDate || k >= S.meta.startDate) && k !== today);
  const hbars = (obj, colorFn, labelFn = k => k) => {
    const ent = Object.entries(obj).filter(([, v]) => v).sort((a, b) => b[1] - a[1]);
    const tot = ent.reduce((a, [, v]) => a + v, 0) || 1;
    return `<div class="hbar">${ent.map(([k, v]) => `<div class="row"><span>${esc(labelFn(k))} <small>${Math.round(v / tot * 100)}%</small></span><b class="num">${rp(v)}</b>
      <div class="track"><i style="width:${v / ent[0][1] * 100}%;background:${colorFn(k)}"></i></div></div>`).join('')}</div>`;
  };
  const topItems = Object.values(agg.items).sort((a, b) => b.sum - a.sum).slice(0, 5);
  return {
    top: '<h1>Laporan</h1>',
    html: `
      <div class="scroll-x" id="perChips">${PERIODS.map(([k, l]) => `<button class="chip ${period === k ? 'on' : ''}" data-per="${k}">${k === 'kustom' ? ic('clock', 'xs') + ' ' : ''}${l}</button>`).join('')}</div>
      <section class="card range-card">
        <label class="field"><span>Tanggal mulai</span><input type="date" id="rStart" value="${rStart}" max="${today}"></label>
        <label class="field"><span>Tanggal akhir</span><input type="date" id="rEnd" value="${rEnd}" max="${today}"></label>
      </section>
      <small class="muted center">${fDate(rStart, { day: 'numeric', month: 'short', year: 'numeric' })} – ${fDate(rEnd, { day: 'numeric', month: 'short', year: 'numeric' })} · ${cs.length} dari ${keys.length} hari tercatat</small>
      <div class="kpis">
        <div class="kpi"><small>Pemasukan</small><b class="num in">${rp(agg.i)}</b></div>
        <div class="kpi"><small>Pengeluaran</small><b class="num out">${rp(agg.e)}</b></div>
        <div class="kpi"><small>Laba kotor</small><b class="num">${rp(profit)}</b><span class="delta muted">Margin ${margin}%</span></div>
        <div class="kpi"><small>Rata-rata / hari</small><b class="num">${rp(cs.length ? agg.i / cs.length : 0)}</b><span class="delta muted">${agg.trx ? `${rp(agg.i / agg.trx)}/nota` : ''}</span></div>
        <div class="kpi"><small>Selisih kas (net)</small><b class="num ${agg.diff < 0 ? 'out' : ''}">${rpSigned(agg.diff)}</b><span class="delta out">Kurang total ${rp(-agg.minus)}</span></div>
        <div class="kpi"><small>Kepatuhan closing</small><b class="num">${cs.length - agg.late}/${cs.length}</b><span class="delta ${missing.length ? 'out' : 'muted'}">${agg.late} susulan · ${missing.length} kosong</span></div>
      </div>
      <section class="card"><h3>Pemasukan vs pengeluaran ${groupLbl}</h3>${barChart(keys, { height: 140, group })}</section>
      <section class="card"><h3>Pengeluaran per kategori</h3>${hbars(agg.cat, catColor, k => catOf(k).name) || '<div class="empty">Tidak ada data</div>'}</section>
      <section class="card"><h3>Pemasukan per kanal</h3>${hbars(agg.ch, () => 'var(--in)')}</section>
      <section class="card tight"><h3 style="padding:12px 16px 0">Pengeluaran terbesar</h3>
        ${topItems.map(it => `<div class="exp-item"><div class="grow"><b>${esc(it.name)}</b><small>${it.n}× dicatat</small></div><b class="num out">${rp(it.sum)}</b></div>`).join('') || '<div class="empty">Tidak ada data</div>'}</section>
      <button class="btn block" id="csvBtn">${ic('download', 'sm')} Unduh CSV (Excel)</button>`,
    mount: root => {
      $$('[data-per]', root).forEach(b => b.onclick = () => {
        period = b.dataset.per;
        if (period === 'kustom') customRange = { start: rStart, end: rEnd }; // mulai dari rentang yang sedang tampil
        render();
      });
      const onDate = () => {
        const s = $('#rStart', root).value, e = $('#rEnd', root).value;
        if (!s || !e) return;
        if (s > e) toast('Tanggal mulai melewati tanggal akhir — urutan ditukar');
        if (daysBetween(s < e ? s : e, s < e ? e : s) > MAX_RANGE_DAYS) toast('Rentang maksimal ±3 tahun');
        period = 'kustom'; customRange = { start: s, end: e }; render();
      };
      $('#rStart', root).onchange = onDate;
      $('#rEnd', root).onchange = onDate;
      const on = $('#perChips .chip.on', root);
      if (on) on.scrollIntoView({ inline: 'center', block: 'nearest' });
      $('#csvBtn', root).onclick = () => exportCSV(cs, keys);
    },
  };
};
function exportCSV(cs, keys) {
  const chs = S.settings.channels;
  const head = ['Tanggal', 'PIC', ...chs.map(c => c.name), 'Total Pemasukan', ...S.settings.cats.map(c => 'Biaya ' + c.name), 'Total Pengeluaran', 'Laba Kotor', 'Kas Seharusnya', 'Uang Fisik', 'Selisih', 'Susulan', 'Catatan'];
  const rows = cs.map(c => {
    const t = totals(c); const cat = Object.fromEntries(groupExpense(c.expenses));
    return [c.date, c.pic, ...chs.map(x => +c.income[x.id] || 0), t.income, ...S.settings.cats.map(x => cat[x.id] || 0), t.expense, t.profit, t.expected, t.counted, t.diff, c.late ? 'Ya' : '', c.note || ''];
  });
  const csv = [head, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `closing_${keys[0]}_${keys[keys.length - 1]}.csv`;
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('CSV diunduh');
}

/* ================= PENGATURAN ================= */
routes.pengaturan = () => {
  const s = S.settings;
  const isOwner = s.role === 'owner';
  return {
    top: '<h1>Pengaturan</h1>',
    html: `
      <section class="card form">
        <div class="switch" data-act="role"><span class="t"><b>Peran saat ini: ${isOwner ? 'Owner' : 'Staf'}</b><small class="muted">Simulasi untuk review. Nanti diganti login.</small></span>
          <span class="chip on">${isOwner ? 'Owner' : 'Staf'}</span></div>
      </section>
      ${installBtnHtml()}
      ${!isOwner ? `<div class="alert info">${ic('lock')}<div><b>Pengaturan dikunci</b><p>Hanya owner yang dapat mengubah pengaturan usaha.</p></div></div>` : `
      <div class="sec-title">Usaha</div>
      <section class="card form">
        <label class="field"><span>Nama usaha</span><input data-set="businessName" value="${esc(s.businessName)}"></label>
        <label class="field"><span>Outlet</span><input data-set="outlet" value="${esc(s.outlet)}"></label>
      </section>
      <div class="sec-title">Aturan closing</div>
      <section class="card form">
        <label class="field"><span>Jam tutup toko</span><input type="time" data-set="closeTime" value="${s.closeTime}"><small class="muted">Input closing baru terbuka setelah jam ini.</small></label>
        <label class="field"><span>Modal awal / kembalian di laci</span>${moneyInput('data-setmoney="openingCash"', s.openingCash).replace('money-wrap', 'money-wrap full')}</label>
        <label class="field"><span>Batas input susulan</span><select data-setnum="backfillDays">${[1, 2, 3, 5, 7].map(n => `<option value="${n}" ${s.backfillDays === n ? 'selected' : ''}>${n} hari</option>`).join('')}</select></label>
        <label class="switch"><span class="t"><b>Mode demo: abaikan jam tutup</b><small class="muted">Agar reviewer bisa mencoba input kapan saja.</small></span><input type="checkbox" data-setbool="ignoreCloseTime" ${s.ignoreCloseTime ? 'checked' : ''}></label>
      </section>
      <div class="sec-title">Staf / PIC</div>
      <section class="card">${listEditor('staff', s.staff.map(x => ({ name: x })))}</section>
      <div class="sec-title">Kanal pemasukan</div>
      <section class="card">${listEditor('channels', s.channels, true)}</section>
      <div class="sec-title">Kategori pengeluaran</div>
      <section class="card">${listEditor('cats', s.cats)}</section>
      <div class="sec-title">Data</div>
      <section class="card form">
        <button class="btn primary block" id="shareBkBtn">${ic('share', 'sm')} Bagikan backup</button>
        <small class="muted center" style="margin-top:-8px">Kirim ke Gmail, Google Drive, atau WhatsApp</small>
        <small class="muted center">${S.meta?.lastBackupAt ? `Backup terakhir: ${new Date(S.meta.lastBackupAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}` : 'Belum pernah backup dari perangkat ini'}</small>
        <div class="btn-row"><button class="btn sm" id="bkBtn">${ic('download', 'xs')} Unduh backup</button><label class="btn sm">${ic('upload', 'xs')} Pulihkan<input type="file" accept="application/json,text/plain,.json,.txt" id="rsFile" hidden></label></div>
        <button class="btn sm" id="seedBtn">Isi ulang data demo</button>
        <button class="btn sm danger" id="wipeBtn">${ic('trash', 'xs')} Hapus semua data</button>
      </section>`}
      <p class="foot-note">TutupKas · prototipe v0.1 · ${navigator.onLine ? 'online' : 'offline'}</p>`,
    mount: root => {
      $$('[data-set]', root).forEach(i => i.onchange = () => { s[i.dataset.set] = i.value; save(); toast('Tersimpan'); });
      $$('[data-setnum]', root).forEach(i => i.onchange = () => { s[i.dataset.setnum] = +i.value; save(); toast('Tersimpan'); });
      $$('[data-setbool]', root).forEach(i => i.onchange = () => { s[i.dataset.setbool] = i.checked; save(); toast('Tersimpan'); });
      $$('[data-setmoney]', root).forEach(i => i.addEventListener('money', e => { s[i.dataset.setmoney] = e.detail; save(); }));
      bindListEditors(root);
      bindInstall(root);
      if (!isOwner) return;
      $('#shareBkBtn', root).onclick = shareBackup;
      $('#bkBtn', root).onclick = () => { downloadBackup(); markBackup(); toast('Backup diunduh'); };
      $('#rsFile', root).onchange = async e => {
        const f = e.target.files[0]; if (!f) return;
        try { const d = JSON.parse(await f.text()); if (!d || typeof d.closings !== 'object') throw 0; S = normalizeData(d); save(); toast('Data dipulihkan'); render(); }
        catch { toast('File backup tidak valid'); }
      };
      $('#seedBtn', root).onclick = async () => { if (await confirmBox('Isi ulang data demo?', 'Semua data saat ini akan diganti dengan data contoh 2 bulan.', 'Isi ulang', { danger: true })) { S = seed(); save(); toast('Data demo dimuat'); location.hash = '#/'; } };
      $('#wipeBtn', root).onclick = async () => {
        if (await confirmBox('Hapus semua data?', 'Seluruh closing, draf, dan pengaturan di perangkat ini akan dihapus permanen.', 'Hapus permanen', { danger: true })) {
          S = { settings: defaultSettings(), closings: {}, drafts: {}, storeClosed: {}, meta: { startDate: bizToday(defaultSettings()) } };
          save(); toast('Semua data dihapus'); location.hash = '#/';
        }
      };
    },
  };
};
/* ---------- Backup ---------- */
const backupName = ext => `tutupkas-backup-${bizToday()}.${ext}`;
function downloadBackup() {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(S)], { type: 'application/json' }));
  a.download = backupName('json'); a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function markBackup() { S.meta ||= {}; S.meta.lastBackupAt = Date.now(); save(); if (current === 'pengaturan') render(); }
async function shareBackup() {
  const data = JSON.stringify(S);
  const n = Object.keys(S.closings).length;
  const text = `Backup TutupKas — ${S.settings.businessName} (${S.settings.outlet})\n${fDate(bizToday())} · ${n} data closing.\nPulihkan lewat Pengaturan → Pulihkan.`;
  // Chrome Android tidak mengizinkan berbagi file .json, jadi siapkan cadangan .txt (isi tetap JSON)
  const candidates = [
    new File([data], backupName('json'), { type: 'application/json' }),
    new File([data], backupName('txt'), { type: 'text/plain' }),
  ];
  const file = navigator.canShare ? candidates.find(f => navigator.canShare({ files: [f] })) : null;
  if (!file) {
    downloadBackup(); markBackup();
    toast('Browser ini belum bisa berbagi file — backup diunduh, lampirkan manual ke Gmail/Drive');
    return;
  }
  try {
    await navigator.share({ files: [file], title: 'Backup TutupKas', text });
    markBackup(); toast('Backup dibagikan');
  } catch (e) {
    if (e.name !== 'AbortError') { downloadBackup(); markBackup(); toast('Gagal membagikan — backup diunduh sebagai gantinya'); }
  }
}

function listEditor(key, items, withCash = false) {
  return `<div class="list-edit" data-list="${key}">${items.map((it, i) => `<div class="le">
      <input type="text" value="${esc(it.name)}" data-i="${i}">
      ${withCash ? `<button class="chip ${it.cash ? 'on' : ''}" data-cash="${i}" style="padding:6px 10px;font-size:12px">${it.cash ? 'Tunai' : 'Non'}</button>` : ''}
      <button class="x" data-rm="${i}" aria-label="Hapus">${ic('x', 'xs')}</button></div>`).join('')}
    <button class="chip add" data-add style="align-self:flex-start">${ic('plus', 'xs')} Tambah</button></div>`;
}
function bindListEditors(root) {
  $$('[data-list]', root).forEach(box => {
    const key = box.dataset.list;
    const arr = S.settings[key];
    const isStr = key === 'staff';
    $$('input[data-i]', box).forEach(inp => inp.onchange = () => {
      const i = +inp.dataset.i, v = inp.value.trim(); if (!v) return;
      if (isStr) arr[i] = v; else arr[i].name = v;
      save(); toast('Tersimpan');
    });
    $$('[data-cash]', box).forEach(b => b.onclick = () => { const it = arr[+b.dataset.cash]; it.cash = !it.cash; save(); render(); });
    $$('[data-rm]', box).forEach(b => b.onclick = async () => {
      if (arr.length <= 1) return toast('Minimal satu item');
      if (await confirmBox('Hapus item?', 'Data closing lama tetap aman.', 'Hapus', { danger: true })) { arr.splice(+b.dataset.rm, 1); save(); render(); }
    });
    $('[data-add]', box).onclick = () => {
      if (isStr) arr.push('Staf baru');
      else arr.push(key === 'channels' ? { id: uid(), name: 'Kanal baru', cash: false } : { id: uid(), name: 'Kategori baru' });
      save(); render();
    };
  });
}

/* ---------- PWA ---------- */
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; if (current === 'pengaturan') render(); });
function installBtnHtml() {
  const standalone = matchMedia('(display-mode: standalone)').matches;
  if (standalone) return `<div class="alert ok">${ic('check')}<div><b>Berjalan sebagai aplikasi</b><p>TutupKas sudah terpasang di perangkat ini.</p></div></div>`;
  return `<div class="alert info">${ic('download')}<div style="flex:1"><b>Pasang di HP</b><p>${deferredPrompt ? 'Pasang TutupKas ke layar utama agar bisa dibuka seperti aplikasi & offline.' : 'Buka menu browser → “Tambahkan ke layar utama” untuk memasang.'}</p>
    ${deferredPrompt ? '<button class="btn sm primary" id="installBtn">Pasang aplikasi</button>' : ''}</div></div>`;
}
function bindInstall(root) {
  const b = $('#installBtn', root); if (!b) return;
  b.onclick = async () => { deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; render(); };
}
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
window.addEventListener('online', () => { toast('Kembali online'); render(); });
window.addEventListener('offline', () => { toast('Offline — data tetap tersimpan di perangkat'); render(); });

/* Perbarui hitung mundur di beranda tiap menit */
setInterval(() => { if (current === '' && !$('#overlay').innerHTML && $('#countdown')) render(); }, 60000);

render();
