/* מעטפת משותפת: אייקונים, תפריט צד ופס עליון – משמשת את שני העמודים */
(function () {
  'use strict';
  const svg = (p, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const P = {
    home: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
    doctors: '<path d="M6 3v5a4 4 0 0 0 8 0V3"/><path d="M5 3h2M13 3h2"/><path d="M10 12v3a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="11" r="2"/>',
    patients: '<circle cx="12" cy="7" r="4"/><path d="M5 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2"/>',
    appointments: '<rect x="3" y="4" width="18" height="17" rx="2.5"/><path d="M3 9h18M8 2v4M16 2v4"/><path d="m9 15 2 2 4-4"/>',
    calendar: '<rect x="3" y="4" width="18" height="17" rx="2.5"/><path d="M3 9h18M8 2v4M16 2v4"/><path d="M7 13h2M11 13h2M15 13h2M7 17h2M11 17h2"/>',
    clinic: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 7.5v9M7.5 12h9"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 20h16"/>',
    chevR: '<path d="m9 18 6-6-6-6"/>',
    chevL: '<path d="m15 18-6-6 6-6"/>',
    erd: '<rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3M12 12V8"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    back: '<path d="m9 18 6-6-6-6"/>',
    bank: '<path d="M3 10 12 4l9 6"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8"/><path d="M3 20h18"/>',
    key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.3-9.3M17 6l3 3M15 8l2 2"/>',
    zoomIn: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/>',
    zoomOut: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M8 11h6"/>',
    fit: '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>',
    arrowLeft: '<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>',
    check: '<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'
  };
  window.ICON = (name, size) => svg(P[name] || '', size);

  /* ---------- גרסה ובדיקת עדכונים ----------
     הדפדפן עלול להמשיך להריץ גרסה ישנה בלשונית פתוחה. בודקים מול השרת (בלי מטמון)
     ואם פורסמה גרסה חדשה – מציגים פס "רענון". */
  const metaV = document.querySelector('meta[name="app-version"]');
  const APP_VERSION = metaV ? metaV.content : '?';
  window.APP_VERSION = APP_VERSION;
  async function checkUpdate() {
    if (location.protocol === 'file:') return;
    try {
      const res = await fetch(location.pathname + '?_=' + Date.now(), { cache: 'no-store' });
      const m = (await res.text()).match(/name="app-version" content="([^"]+)"/);
      if (m && m[1] !== APP_VERSION && !document.getElementById('updBar')) {
        const bar = document.createElement('div');
        bar.id = 'updBar'; bar.className = 'upd-bar';
        bar.innerHTML = `<span>פורסמה גרסה חדשה של האתר (${m[1]})</span><button type="button" class="btn sm primary">רענון</button>`;
        bar.querySelector('button').addEventListener('click', () => location.reload());
        document.body.appendChild(bar);
      }
    } catch (e) { /* ללא רשת – מתעלמים */ }
  }
  window.addEventListener('load', checkUpdate);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkUpdate(); });

  /**
   * בניית תפריט הצד.
   * @param {string} active  מפתח הפריט הפעיל ('home' | שם ישות | 'erd')
   * @param {string} base    '' באפליקציה, 'index.html' בעמוד ה-ERD
   * @param {object} counts  מספר רשומות לכל ישות (אופציונלי)
   */
  window.renderSidebar = function (active, base, counts) {
    const S = window.SCHEMA;
    const link = (href, key, label, extra = '') =>
      `<a href="${href}" class="nav-item${active === key ? ' active' : ''}" ${extra}>
        <span class="nav-ic">${ICON(key)}</span><span class="nav-lbl">${label}</span>
        ${counts && counts[key] != null ? `<span class="nav-count">${counts[key]}</span>` : ''}</a>`;
    document.getElementById('sidebar').innerHTML = `
      <a class="brand" href="${base}#/">
        <span class="brand-mark">${ICON('clinic', 20)}</span>
        <span><b>ניהול תורים</b><small>מרפאה · הדגמה</small></span>
      </a>
      <div class="nav-sec">ראשי</div>
      ${link(`${base}#/`, 'home', 'לוח בקרה')}
      ${link(`${base}#/calendar`, 'calendar', 'יומן תורים')}
      <div class="nav-sec">ישויות</div>
      ${S.entities.map(e => link(`${base}#/e/${e.key}`, e.key, e.label, `style="--c:${e.color}"`)).join('')}
      <div class="nav-sec">מודל הנתונים</div>
      ${link('erd.html', 'erd', 'תרשים ERD')}
      <div class="side-foot">גרסה ${APP_VERSION} · נתונים פיקטיביים</div>`;
  };

  /* טבלאות רספונסיביות: כל תא מקבל את שם העמודה שלו (data-label),
     כדי שבמסך צר כל שורה תוצג ככרטיס עם תוויות */
  function labelTables() {
    document.querySelectorAll('table.data').forEach(t => {
      const heads = [...t.querySelectorAll('thead th')].map(th => th.textContent.trim());
      t.querySelectorAll('tbody tr').forEach(tr => [...tr.children].forEach((td, i) => {
        if (!td.hasAttribute('data-label')) td.setAttribute('data-label', heads[i] || '');
      }));
    });
  }
  /* ---------- מיון בכל טבלה: לחיצה על כותרת עמודה ----------
     עולה ← יורד ← חזרה לסדר המקורי. המיון נשמר גם כשהטבלה מצוירת מחדש (למשל בחיפוש). */
  const sortState = {};
  const tableKey = t => location.pathname.split('/').pop() + location.hash.split('?')[0] + '|' +
    ((t.closest('.card') && t.closest('.card').querySelector('h2') || {}).textContent || t.id || 'main');
  function sortValue(td) {
    if (!td) return '';
    if (td.dataset.sort != null) return td.dataset.sort;
    const t = td.textContent.replace(/[\u200e\u200f\u2066-\u2069]/g, '').trim();
    let m = t.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:,?\s+(\d{1,2}):(\d{2}))?$/);   // תאריך 14.2.2018 [09:30]
    if (m) return Number(m[3] + m[2].padStart(2, '0') + m[1].padStart(2, '0') + (m[4] || '00').padStart(2, '0') + (m[5] || '00'));
    m = t.match(/^([+\-−])?\s*[₪$€£]?\s*([\d,]+(?:\.\d+)?)\s*[₪$€£%]?$/);   // מספר / סכום / אחוז
    if (m) return (m[1] === '-' || m[1] === '−' ? -1 : 1) * Number(m[2].replace(/,/g, ''));
    return t;
  }
  const collator = new Intl.Collator('he', { numeric: true, sensitivity: 'base' });
  function applySort(t, st) {
    const tb = t.tBodies[0]; if (!tb) return;
    const rows = [...tb.rows];
    rows.forEach((r, i) => { if (r.dataset.orig == null) r.dataset.orig = i; });
    rows.sort((a, b) => {
      if (!st || st.dir === 0) return a.dataset.orig - b.dataset.orig;
      const x = sortValue(a.cells[st.col]), y = sortValue(b.cells[st.col]);
      const r = (typeof x === 'number' && typeof y === 'number') ? x - y : collator.compare(String(x), String(y));
      return (r || a.dataset.orig - b.dataset.orig) * st.dir;
    });
    rows.forEach(r => tb.appendChild(r));
    [...t.tHead.rows[0].cells].forEach((th, i) => {
      const d = st && st.col === i ? st.dir : 0;
      th.classList.toggle('sort-asc', d === 1); th.classList.toggle('sort-desc', d === -1);
      if (th.classList.contains('sortable')) th.setAttribute('aria-sort', d === 1 ? 'ascending' : d === -1 ? 'descending' : 'none');
    });
  }
  function setupSorting() {
    document.querySelectorAll('table.data').forEach(t => {
      if (!t.tHead || !t.tBodies[0] || t.tBodies[0].rows.length < 2) return;
      const head = t.tHead.rows[0];
      [...head.cells].forEach(th => {
        if (th.classList.contains('sortable') || !th.textContent.trim()) return;
        th.classList.add('sortable'); th.tabIndex = 0; th.setAttribute('aria-sort', 'none');
        th.title = 'מיון לפי עמודה זו';
      });
      if (t.dataset.sortBound !== '1') {
        t.dataset.sortBound = '1';
        const go = th => {
          const key = tableKey(t), col = th.cellIndex, cur = sortState[key];
          const dir = !cur || cur.col !== col ? 1 : cur.dir === 1 ? -1 : cur.dir === -1 ? 0 : 1;
          sortState[key] = { col, dir }; applySort(t, sortState[key]);
        };
        t.tHead.addEventListener('click', ev => { const th = ev.target.closest('th.sortable'); if (th) go(th); });
        t.tHead.addEventListener('keydown', ev => { const th = ev.target.closest('th.sortable'); if (th && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); go(th); } });
      }
      const st = sortState[tableKey(t)];
      if (st && t.dataset.sortedRows !== String(t.tBodies[0].rows.length) + st.col + st.dir) {
        t.dataset.sortedRows = String(t.tBodies[0].rows.length) + st.col + st.dir;
        applySort(t, st);
      }
    });
  }
  window.__setupSorting = setupSorting;

  let lt = 0;
  new MutationObserver(() => { cancelAnimationFrame(lt); lt = requestAnimationFrame(() => { labelTables(); setupSorting(); }); })
    .observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', () => { labelTables(); setupSorting(); });

  // תפריט נייד
  document.addEventListener('click', ev => {
    const app = document.querySelector('.app');
    if (ev.target.closest('#menuBtn')) { app.classList.toggle('nav-open'); return; }
    if (ev.target.closest('.scrim') || ev.target.closest('.nav-item')) app.classList.remove('nav-open');
  });
})();
