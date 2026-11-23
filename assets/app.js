/* ניהול תורים למרפאה – אפליקציית CRUD צד-לקוח */
(function () {
  'use strict';

  const S = window.SCHEMA;
  const STORE = 'clinic-appts-v1';
  let db;

  /* ---------- Storage ---------- */
  function load() {
    try { const raw = localStorage.getItem(STORE); if (raw) db = JSON.parse(raw); } catch (e) { db = null; }
    if (!db || !S.entities.every(e => Array.isArray(db[e.key]))) db = window.buildSeed();
  }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(db)); } catch (e) { /* ignore */ } }

  /* ---------- Helpers ---------- */
  const $ = s => document.querySelector(s);
  const ent = k => S.entities.find(e => e.key === k);
  const pkOf = (e, r) => e.pk.map(k => String(r[k])).join('|');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const toLocalISO = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const dayISO = d => toLocalISO(d).slice(0, 10);
  const parseDT = v => { const d = new Date(v); return isNaN(d) ? null : d; };
  const fdate = d => { if (!d) return ''; const x = new Date(String(d).slice(0, 10) + 'T00:00:00'); return isNaN(x) ? esc(d) : x.toLocaleDateString('he-IL'); };
  const ftime = v => String(v || '').slice(11, 16);
  const fdt = v => v ? `${fdate(v)}, ${ftime(v)}` : '';
  const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const dayName = v => { const d = parseDT(v); return d ? `יום ${DAYS[d.getDay()]}` : ''; };
  const findBy = (key, id) => { const e = ent(key); return db[key].find(r => pkOf(e, r) === String(id)); };
  const titleOf = (key, r) => r ? ent(key).title(r, db) : '—';
  const href = (key, r) => `#/e/${key}/${encodeURIComponent(pkOf(ent(key), r))}`;
  const initials = s => String(s || '').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('');
  const PEOPLE = ['doctors', 'patients'];
  const TAGS = { 'היום': 'mid', 'עתידי': 'ok', 'עבר': '' };
  const NEW = e => `${e.single} ${e.fem ? 'חדשה' : 'חדש'}`;
  const ADDED = e => `${e.single} ${e.fem ? 'נוספה' : 'נוסף'} בהצלחה`;
  const DELETED = e => `${e.single} ${e.fem ? 'נמחקה' : 'נמחק'}`;
  const plural = (n, one, many) => (n === 1 ? one : `${n} ${many}`);
  const tile = (e, size) => `<span class="tile" style="--c:${e.color}">${ICON(e.key, size || 20)}</span>`;

  const byTime = (a, b) => String(a.dateTime).localeCompare(String(b.dateTime)) || a.apptNo - b.apptNo;
  const DOC_COLORS = ['#0d9488', '#8b5cf6', '#f59e0b', '#3b82f6', '#e11d48', '#16a34a', '#0891b2', '#c026d3'];
  const docColor = lic => { const i = db.doctors.findIndex(d => String(d.licenseNo) === String(lic)); return DOC_COLORS[(i < 0 ? 0 : i) % DOC_COLORS.length]; };
  const docOf = a => findBy('doctors', a.licenseNo);
  const patOf = a => findBy('patients', a.patientId);

  /* ---------- תצוגת ערכים ---------- */
  function fmt(f, r) {
    const v = r[f.key];
    switch (f.type) {
      case 'datetime': return v ? `<span class="num" dir="ltr">${fdt(v)}</span>` : '';
      case 'date': return `<span class="num">${fdate(v)}</span>`;
      case 'ref': {
        if (v === '' || v == null) return '<span class="muted">—</span>';
        const t = findBy(f.ref, v);
        const c = f.ref === 'doctors' ? docColor(v) : ent(f.ref).color;
        return t ? `<a class="chip" style="--c:${c}" href="${href(f.ref, t)}">${esc(titleOf(f.ref, t))}</a>` : `<span class="muted">${esc(v)}</span>`;
      }
      case 'tel': return `<a class="ltr num tel" href="tel:${esc(String(v).replace(/-/g, ''))}">${esc(v)}</a>`;
      default: return esc(v);
    }
  }
  const searchText = (f, r) => {
    const v = r[f.key];
    if (f.type === 'ref') { const t = findBy(f.ref, v); return t ? titleOf(f.ref, t) : v; }
    if (f.type === 'datetime') return fdt(v) + ' ' + dayName(v);
    return v == null ? '' : v;
  };
  function cell(e, f, r) {
    if (f.key === 'name' && PEOPLE.includes(e.key)) {
      const c = e.key === 'doctors' ? docColor(r.licenseNo) : e.color;
      return `<span class="cell-main"><span class="avatar" style="--c:${c}">${esc(initials(r.name))}</span>${esc(e.key === 'doctors' ? titleOf(e.key, r) : r.name)}</span>`;
    }
    if (e.pk[0] === f.key && e.pk.length === 1 && f.type !== 'ref') return `<span class="num" style="font-weight:600">${esc(r[f.key])}</span>`;
    return fmt(f, r);
  }
  function fmtComputed(c, r) {
    const v = c.fn(r, db);
    return c.type === 'tag' ? `<span class="tag ${TAGS[v] || ''}">${esc(v)}</span>` : esc(v);
  }
  function reverseRefs(key) {
    const out = [];
    S.entities.forEach(e => e.fields.forEach(f => { if (f.type === 'ref' && f.ref === key) out.push({ e, f }); }));
    return out;
  }
  const related = (key, id) => reverseRefs(key).map(({ e, f }) => ({ e, f, rows: db[e.key].filter(r => String(r[f.key]) === String(id)).sort(e.key === 'appointments' ? byTime : () => 0) }));

  /* ---------- Shell ---------- */
  function shell(active, crumbs) {
    const counts = {}; S.entities.forEach(e => { counts[e.key] = db[e.key].length; });
    renderSidebar(active, '', counts);
    $('#crumbs').innerHTML = crumbs.map((c, i) => i < crumbs.length - 1
      ? `<a href="${c[1]}">${esc(c[0])}</a>${ICON('back', 14)}` : `<b>${esc(c[0])}</b>`).join('');
  }
  let toastT;
  function toast(msg, err) {
    const t = $('#toast');
    t.textContent = msg; t.className = 'toast show' + (err ? ' err' : '');
    clearTimeout(toastT); toastT = setTimeout(() => { t.className = 'toast' + (err ? ' err' : ''); }, 3400);
  }
  const greeting = () => { const h = new Date().getHours(); return h < 5 ? 'לילה טוב' : h < 12 ? 'בוקר טוב' : h < 17 ? 'צהריים טובים' : h < 21 ? 'ערב טוב' : 'לילה טוב'; };
  const miniStat = (label, value, color, icon) => `<div class="mini-stat" style="--c:${color}"><span class="tile">${ICON(icon, 18)}</span><div><div class="ms-v">${value}</div><div class="ms-l">${label}</div></div></div>`;
  const bars = (rows, unit) => {
    const max = Math.max(1, ...rows.map(r => r.v));
    return rows.length ? `<div class="bars">${rows.map(r => `<div class="bar-row" title="${esc(r.t)}: ${r.v} ${unit}">
      <span class="name">${r.link ? `<a href="${r.link}">${esc(r.t)}</a>` : esc(r.t)}</span>
      <span class="bar-track"><span class="bar-fill" style="--c:${r.c};width:${r.v / max * 100}%"></span></span>
      <span class="v">${r.v}</span></div>`).join('')}</div>` : '<div class="empty" style="padding:20px">אין נתונים</div>';
  };

  /* =====================================================================
     לוח תורים (בסגנון Qflow): לכל רופא – מספר התור שבטיפול עכשיו והבאים בתור.
     נגזר מהנתונים הקיימים בלבד (תאריך ושעת התור + הרופא), בלי שדה סטטוס נוסף:
     "בטיפול עכשיו" = התור האחרון של היום שמועדו כבר הגיע.
     ===================================================================== */
  const shortName = n => { const w = String(n || '').trim().split(/\s+/); return w.length > 1 ? `${w[0]} ${w[w.length - 1][0]}.` : w[0] || ''; };
  function queueOf(d) {
    const now = toLocalISO(new Date()), today = now.slice(0, 10);
    const mine = db.appointments.filter(a => String(a.licenseNo) === String(d.licenseNo) && a.dateTime).sort(byTime);
    const todays = mine.filter(a => a.dateTime.slice(0, 10) === today);
    const started = todays.filter(a => a.dateTime <= now);
    const current = started[started.length - 1] || null;
    const waiting = todays.filter(a => a.dateTime > now);
    const nextDay = waiting.length ? [] : mine.filter(a => a.dateTime.slice(0, 10) > today);
    return { current, waiting, nextDay, todayCount: todays.length };
  }
  function queueBoard(big) {
    if (!db.doctors.length) return '<div class="empty" style="padding:24px">אין רופאים במערכת</div>';
    return `<div class="q-grid${big ? ' big' : ''}">${db.doctors.map(d => {
      const q = queueOf(d), c = docColor(d.licenseNo), cur = q.current, p = cur && patOf(cur);
      const nextList = cur ? (q.waiting.length ? q.waiting : q.nextDay.slice(0, 3)) : (q.waiting.length ? q.waiting.slice(1) : q.nextDay.slice(0, 3));
      return `<div class="q-doc" style="--c:${c}">
        <a class="q-head" href="${href('doctors', d)}"><span class="avatar" style="--c:${c}">${esc(initials(d.name))}</span>
          <span><b>${esc(titleOf('doctors', d))}</b><small>${q.todayCount ? `${q.todayCount} תורים היום` : 'אין תורים היום'}</small></span></a>
        <div class="q-now">
          <span class="q-lbl">${cur ? 'תור נוכחי' : q.waiting.length ? 'התור הראשון היום' : 'אין תור כרגע'}</span>
          ${cur ? `<a class="q-num num" href="${href('appointments', cur)}">${esc(cur.apptNo)}</a><span class="q-who">${esc(shortName(p ? p.name : ''))} · <span class="num">${ftime(cur.dateTime)}</span></span>`
            : q.waiting.length ? `<a class="q-num num dim" href="${href('appointments', q.waiting[0])}">${esc(q.waiting[0].apptNo)}</a><span class="q-who">בשעה <span class="num">${ftime(q.waiting[0].dateTime)}</span></span>`
            : '<span class="q-num num dim">—</span>'}
        </div>
        <div class="q-next"><span class="q-lbl">${q.waiting.length ? `הבאים בתור${nextList.length ? ` (${nextList.length})` : ''}` : 'הבאים בתור'}</span>
          ${nextList.length ? `<ol>${nextList.slice(0, big ? 5 : 4).map(a => { const pp = patOf(a); return `<li><a href="${href('appointments', a)}"><b class="num">${esc(a.apptNo)}</b><span>${esc(shortName(pp ? pp.name : ''))}</span><span class="num t" dir="ltr">${q.waiting.length ? ftime(a.dateTime) : a.dateTime.slice(8, 10) + '.' + a.dateTime.slice(5, 7) + ' ' + ftime(a.dateTime)}</span></a></li>`; }).join('')}</ol>`
            : '<div class="q-empty">אין תורים ממתינים</div>'}
        </div></div>`;
    }).join('')}</div>`;
  }
  let qTimer = 0;
  function startQueueTimer() {
    clearInterval(qTimer);
    const tick = () => {
      const cl = $('#qClock'), bd = $('#qBoard');
      if (!cl || !bd) return clearInterval(qTimer);
      cl.textContent = new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
      if (!formCtx) bd.innerHTML = queueBoard(bd.dataset.big === '1');
    };
    tick(); qTimer = setInterval(tick, 20000);
  }
  /* מסך המתנה – לוח התורים בלבד, במסך מלא */
  function viewQueue() {
    document.body.classList.add('q-screen');
    $('#view').innerHTML = `<div class="q-wall">
        <div class="q-wall-head"><span class="brand-mark">${ICON('clinic', 22)}</span><h1>תור עכשיו במרפאה</h1>
          <span class="spacer"></span><span class="q-clock num" id="qClock"></span>
          <button class="btn sm" id="fsBtn" type="button">${ICON('fit', 15)} מסך מלא</button>
          <a class="btn sm" href="#/">יציאה</a></div>
        <div id="qBoard" data-big="1">${queueBoard(true)}</div></div>`;
    $('#fsBtn').addEventListener('click', () => { const el = document.documentElement; if (document.fullscreenElement) document.exitFullscreen(); else if (el.requestFullscreen) el.requestFullscreen(); });
    startQueueTimer();
  }

  /* ---------- Dashboard ---------- */
  function viewHome() {
    shell('home', [['לוח בקרה', '#/']]);
    const D = ent('doctors'), P = ent('patients'), A = ent('appointments');
    $('#view').innerHTML = `
      <section class="welcome${window.photoImg ? ' has-photo' : ''}">
        ${window.photoImg ? `<div class="wl-photo-wrap">${photoImg('hero', 1400, 'wl-photo', true)}</div>` : ''}
        <div class="wl-text"><div class="wl-greet">${greeting()}</div>
          <h1>ניהול תורים במרפאה</h1>
          <p>רופאים, מטופלים ותורים: רופא מקבל תור, מטופל מזמין תור.</p></div>
        <div class="qa">
          <button class="qa-btn" type="button" id="qAppt"><span class="tile" style="--c:${A.color}">${ICON('appointments', 20)}</span>תור חדש</button>
          <button class="qa-btn" type="button" id="qPat"><span class="tile" style="--c:${P.color}">${ICON('patients', 20)}</span>מטופל חדש</button>
          <button class="qa-btn" type="button" id="qDoc"><span class="tile" style="--c:${D.color}">${ICON('doctors', 20)}</span>רופא חדש</button>
          <a class="qa-btn" href="erd.html"><span class="tile" style="--c:#6366f1">${ICON('erd', 20)}</span>תרשים ERD</a>
        </div>
        <div class="wl-illus">${window.ILLUS ? ILLUS.clinic : ''}</div>
      </section>

      <div class="kpis k3">
        <a class="kpi hero k-teal2" href="#/e/doctors"><div class="top"><span class="lbl">רופאים</span>${tile(D)}</div>
          <div class="val">${db.doctors.length}</div><div class="foot">מזהה: מספר רישיון</div></a>
        <a class="kpi hero k-sky" href="#/e/patients"><div class="top"><span class="lbl">מטופלים</span>${tile(P)}</div>
          <div class="val">${db.patients.length}</div><div class="foot">מזהה: תעודת זהות</div></a>
        <a class="kpi hero k-violet" href="#/e/appointments"><div class="top"><span class="lbl">תורים</span>${tile(A)}</div>
          <div class="val">${db.appointments.length}</div><div class="foot">מזהה: מספר תור</div></a>
      </div>

      <div class="card q-card"><div class="card-head"><h2>תור עכשיו אצל הרופאים</h2>
          <span class="q-clock num" id="qClock"></span><a class="more" href="#/queue">${ICON('fit', 15)} מסך המתנה</a></div>
        <div id="qBoard">${queueBoard()}</div></div>

      <div class="foot-note">הנתונים נשמרים בדפדפן בלבד (localStorage) · כל הנתונים פיקטיביים
        <button class="btn sm ghost" id="resetBtn" type="button">איפוס לנתוני הדגמה</button></div>`;
    startQueueTimer();
    $('#qAppt').addEventListener('click', () => openForm('appointments'));
    $('#qPat').addEventListener('click', () => openForm('patients'));
    $('#qDoc').addEventListener('click', () => openForm('doctors'));
    $('#resetBtn').addEventListener('click', () => {
      if (!confirm('לאפס את כל הנתונים לנתוני ההדגמה?')) return;
      db = window.buildSeed(); save(); toast('הנתונים אופסו'); route();
    });
  }

  /* ---------- List ---------- */
  const searchState = {};
  function viewList(key, q) {
    const e = ent(key);
    if (!e) return viewHome();
    shell(key, [['לוח בקרה', '#/'], [e.label, `#/e/${key}`]]);
    const isAppt = key === 'appointments';
    $('#view').innerHTML = `
      <div class="page-head with-art" style="--c:${e.color}">
        <div class="ph-art">${window.photoImg ? photoImg(key, 420, 'ph-photo', true) : (window.ILLUS && ILLUS[key] || '')}</div>
        <div><h1>${esc(e.label)} <span class="count-pill" style="vertical-align:middle">${db[key].length}</span></h1>
          <p>${esc(e.desc)}</p></div>
        <div class="actions">
          <label class="search">${ICON('search', 17)}<input id="q" type="search" placeholder="חיפוש ב${esc(e.label)}..." value="${esc(searchState[key] || '')}" aria-label="חיפוש"></label>
          <button class="btn primary" id="addBtn" type="button">${ICON('plus', 17)} ${esc(NEW(e))}</button>
        </div>
      </div>
      <div class="card flush"><div class="table-wrap" id="tbl"></div></div>`;

    const draw = () => {
      const qq = (searchState[key] || '').trim().toLowerCase();
      let rows = db[key].filter(r => !qq || e.fields.some(f => String(searchText(f, r)).toLowerCase().includes(qq)));
      if (isAppt) rows = rows.slice().sort(byTime);
      const comp = e.computed || [];
      $('#tbl').innerHTML = rows.length ? `
        <table class="data"><thead><tr>
          ${e.fields.map(f => `<th>${esc(f.label)}</th>`).join('')}
          ${comp.map(c => `<th title="מחושב לפי תאריך התור">${esc(c.label)}</th>`).join('')}
          <th></th></tr></thead><tbody>
          ${rows.map(r => `<tr data-go="${href(key, r)}">
            ${e.fields.map(f => `<td>${cell(e, f, r)}</td>`).join('')}
            ${comp.map(c => `<td>${fmtComputed(c, r)}</td>`).join('')}
            <td class="actions">
              <button class="icon-btn" data-edit="${esc(pkOf(e, r))}" title="עריכה" aria-label="עריכה">${ICON('edit', 16)}</button>
              <button class="icon-btn del" data-del="${esc(pkOf(e, r))}" title="מחיקה" aria-label="מחיקה">${ICON('trash', 16)}</button>
            </td></tr>`).join('')}
          </tbody></table>`
        : `<div class="empty">${window.ILLUS ? ILLUS.empty : ''}<div class="empty-t">${qq ? 'לא נמצאו רשומות תואמות' : 'אין עדיין רשומות'}</div></div>`;
    };
    draw();
    $('#q').addEventListener('input', ev => { searchState[key] = ev.target.value; draw(); });
    $('#addBtn').addEventListener('click', () => openForm(key));
  }

  /* ---------- Detail ---------- */
  function viewDetail(key, id) {
    const e = ent(key);
    const r = e && findBy(key, id);
    if (!r) { location.hash = `#/e/${key}`; return; }
    const title = titleOf(key, r);
    shell(key, [['לוח בקרה', '#/'], [e.label, `#/e/${key}`], [title, '']]);

    const relSections = related(key, id).map(({ e: re, f, rows }) => {
      const cols = re.fields.filter(x => x.key !== f.key);
      return `<div class="card flush">
        <div class="card-head" style="padding:20px 24px 6px">${tile(re, 18)}<h2>${esc(re.label)}</h2><span class="count-pill">${rows.length}</span></div>
        ${rows.length ? `<div class="table-wrap"><table class="data"><thead><tr>
          ${cols.map(c => `<th>${esc(c.label)}</th>`).join('')}${(re.computed || []).map(c => `<th>${esc(c.label)}</th>`).join('')}
          </tr></thead><tbody>
          ${rows.map(x => `<tr data-go="${href(re.key, x)}">${cols.map(c => `<td>${cell(re, c, x)}</td>`).join('')}
            ${(re.computed || []).map(c => `<td>${fmtComputed(c, x)}</td>`).join('')}</tr>`).join('')}
          </tbody></table></div>` : '<div class="empty" style="padding:20px">אין רשומות קשורות</div>'}
      </div>`;
    }).join('');

    const c = key === 'doctors' ? docColor(r.licenseNo) : e.color;
    const hero = PEOPLE.includes(key) ? `<span class="avatar" style="--c:${c}">${esc(initials(r.name))}</span>` : tile(e, 26);
    const bookBtn = PEOPLE.includes(key) ? `<button class="btn primary" id="bookBtn" type="button">${ICON('plus', 16)} תור חדש</button>` : '';
    $('#view').innerHTML = `
      <div class="page-head">
        <div class="detail-hero">${hero}<div>
          <div class="eyebrow" style="--c:${c};margin:0">${esc(e.single)}</div>
          <h1>${esc(title)}</h1></div></div>
        <div class="actions">${bookBtn}
          <button class="btn" id="edBtn" type="button">${ICON('edit', 16)} עריכה</button>
          <button class="btn danger" id="dlBtn" type="button">${ICON('trash', 16)} מחיקה</button>
        </div>
      </div>
      ${visualFor(key, r)}
      <div class="card"><div class="card-head"><h2>פרטים</h2></div>
        <div class="attr-grid">
          ${e.fields.map(f => `<div class="attr"><div class="k">${esc(f.label)}${e.pk.includes(f.key) ? ' <span class="key-ic pk">PK</span>' : ''}${f.type === 'ref' ? ' <span class="key-ic fk">FK</span>' : ''}</div><div class="v">${fmt(f, r) || '<span class="muted">—</span>'}</div></div>`).join('')}
          ${(e.computed || []).map(cc => `<div class="attr"><div class="k">${esc(cc.label)} · מחושב</div><div class="v">${fmtComputed(cc, r)}</div></div>`).join('')}
        </div></div>
      ${relSections}`;
    $('#edBtn').addEventListener('click', () => openForm(key, r));
    $('#dlBtn').addEventListener('click', () => { if (remove(key, id)) location.hash = `#/e/${key}`; });
    if (bookBtn) $('#bookBtn').addEventListener('click', () => openForm('appointments', null, key === 'doctors' ? { licenseNo: r.licenseNo } : { patientId: r.patientId }));
  }

  /** אזור חזותי בראש עמוד תור */
  function visualFor(key, r) {
    if (key !== 'appointments') return '';
    const d = docOf(r), p = patOf(r);
    return `<div class="next-appt big" style="--c:${docColor(r.licenseNo)}">
        <div class="na-when"><span class="na-day">${esc(dayName(r.dateTime))} · <span class="num">${fdate(r.dateTime)}</span></span><b class="num">${ftime(r.dateTime)}</b></div>
        <div class="na-who"><span class="avatar" style="--c:${ent('patients').color}">${esc(initials(p ? p.name : ''))}</span>
          <span><div class="pname">${esc(p ? p.name : r.patientId)}</div><div class="psub">${esc(r.reason)}</div></span></div>
        <div class="na-doc">${ICON('doctors', 16)} ${esc(d ? titleOf('doctors', d) : '')}</div></div>`;
  }

  /* ---------- Delete (שלמות התייחסות) ---------- */
  function remove(key, id) {
    const e = ent(key);
    const r = findBy(key, id);
    if (!r) return false;
    const blockers = related(key, id).filter(x => x.rows.length);
    if (blockers.length) {
      toast(`לא ניתן למחוק – קיימות רשומות קשורות (${blockers.map(b => `${b.e.label}: ${b.rows.length}`).join(', ')}). יש למחוק אותן קודם.`, true);
      return false;
    }
    if (!confirm(`למחוק את "${titleOf(key, r)}"?`)) return false;
    db[key] = db[key].filter(x => pkOf(e, x) !== String(id));
    save(); toast(DELETED(e));
    if (!location.hash.includes(`/e/${key}/`)) route(true);
    return true;
  }

  /* =====================================================================
     בדיקת תקינות – בזמן הקלדה ובשמירה
     ===================================================================== */
  const NUMERIC = ['number'];
  /** ספרת ביקורת של תעודת זהות ישראלית */
  const validIsraeliId = id => /^\d{9}$/.test(id) && [...id].reduce((s, c, i) => { const d = Number(c) * (i % 2 + 1); return s + (d > 9 ? d - 9 : d); }, 0) % 10 === 0;

  function validateRecord(key, data, rec) {
    const e = ent(key), errs = {};
    const err = (k, m) => { if (!errs[k]) errs[k] = m; };
    e.fields.forEach(f => {
      const v = data[f.key];
      if (v === '' || v == null) { if (f.required) err(f.key, 'שדה חובה'); return; }
      if (f.type === 'number' && (typeof v !== 'number' || !Number.isInteger(v))) return err(f.key, 'יש להזין מספר שלם');
      if (f.pattern && !new RegExp(f.pattern).test(String(v))) return err(f.key, `פורמט לא תקין${f.hint ? ` (${f.hint})` : ''}`);
      if (f.israeliId && !validIsraeliId(v)) return err(f.key, 'מספר תעודת זהות לא תקין (ספרת ביקורת שגויה)');
      if (f.minLen && String(v).trim().length < f.minLen) return err(f.key, `לפחות ${f.minLen} תווים`);
      if (f.type === 'datetime' && !parseDT(v)) return err(f.key, 'תאריך ושעה לא תקינים');
      if (f.type === 'ref' && !findBy(f.ref, v)) return err(f.key, `${ent(f.ref).single} לא קיים במערכת (מפתח זר יתום)`);
    });
    const newPk = pkOf(e, data), oldPk = rec ? pkOf(e, rec) : null;
    if (e.pk.every(k => data[k] !== '' && data[k] != null) && newPk !== oldPk && db[key].some(r => pkOf(e, r) === newPk)) {
      errs._form = `${e.fields.find(f => f.key === e.pk[0]).label} כבר קיים – מפתח ראשי חייב להיות ייחודי`;
      err(e.pk[0], 'ערך זה כבר קיים');
    }
    return errs;
  }

  /* ---------- Form ---------- */
  let formCtx = null;
  const nextId = (key, field) => db[key].reduce((m, r) => Math.max(m, Number(r[field]) || 0), 1000) + 1;
  function inputFor(e, f, rec, prefill) {
    const isEdit = !!rec;
    const v = rec ? rec[f.key] : (prefill && prefill[f.key] != null && prefill[f.key] !== '' ? prefill[f.key] : (f.auto ? nextId(e.key, f.key) : ''));
    const lock = isEdit && e.pk.includes(f.key);
    const id = `f_${f.key}`;
    let ctl;
    if (f.type === 'ref') {
      const te = ent(f.ref);
      ctl = `<select id="${id}" name="${f.key}"><option value="">בחירה...</option>
        ${db[f.ref].map(o => { const k = pkOf(te, o); return `<option value="${esc(k)}" ${String(v) === k ? 'selected' : ''}>${esc(titleOf(f.ref, o))}${f.ref === 'patients' ? ` · ${esc(o.patientId)}` : ''}</option>`; }).join('')}</select>`;
    } else if (f.type === 'datetime') {
      ctl = `<input id="${id}" name="${f.key}" type="datetime-local" step="300" value="${esc(v)}">`;
    } else {
      const t = { tel: 'tel' }[f.type] || 'text';
      const im = NUMERIC.includes(f.type) || (f.pattern && /\\d/.test(f.pattern)) ? 'inputmode="numeric"' : '';
      const ltr = NUMERIC.includes(f.type) || t === 'tel' || f.pattern ? 'dir="ltr" style="text-align:right"' : '';
      const list = f.suggest ? `list="dl_${f.key}"` : '';
      ctl = `<input id="${id}" name="${f.key}" type="${t}" value="${esc(v)}" ${im} ${ltr} ${list} autocomplete="off" ${(lock || f.auto) ? 'readonly' : ''}>
        ${f.suggest ? `<datalist id="dl_${f.key}">${f.suggest.map(s => `<option value="${esc(s)}">`).join('')}</datalist>` : ''}`;
    }
    return `<div class="field${f.type === 'datetime' ? ' full' : ''}" data-field="${f.key}"><label for="${id}">${esc(f.label)} ${f.required ? '<span class="req">*</span>' : ''}</label>
      ${ctl}${f.hint ? `<span class="hint">${esc(f.hint)}</span>` : ''}${lock ? '<span class="hint">מפתח ראשי – לא ניתן לשנות</span>' : ''}<span class="err" data-err="${f.key}"></span></div>`;
  }
  function openForm(key, rec, prefill) {
    const e = ent(key);
    formCtx = { key, rec, touched: new Set(), submitted: false };
    $('#dlgTitle').textContent = rec ? `עריכת ${e.single}` : NEW(e);
    $('#dlgTile').style.setProperty('--c', e.color);
    $('#dlgTile').innerHTML = ICON(key, 20);
    // בתור: רופא ומטופל קודם, ואז המועד והסיבה
    const order = key === 'appointments' ? ['apptNo', 'licenseNo', 'patientId', 'dateTime', 'reason'] : e.fields.map(f => f.key);
    $('#dlgBody').innerHTML = order.map(k => inputFor(e, e.fields.find(f => f.key === k), rec, prefill)).join('');
    $('#dlgBody').scrollTop = 0;
    $('#formMsg').textContent = '';
    const d = $('#dlg');
    if (typeof d.showModal === 'function') { if (!d.open) d.showModal(); } else d.setAttribute('open', '');
    updateMoreHint();
  }
  function closeForm() { const d = $('#dlg'); if (d.close) d.close(); else d.removeAttribute('open'); formCtx = null; }

  const INVISIBLE = /[​-‏‪-‮⁦-⁩﻿]/g;
  function cleanText(f, raw) {
    let v = String(raw || '').replace(INVISIBLE, '').replace(/ /g, ' ').replace(/\s{2,}/g, ' ').trim();
    if (f.digits9 || f.key === 'licenseNo') v = v.replace(/[\s\-.]/g, '');
    if (f.type === 'tel') v = v.replace(/\s/g, '');
    return v;
  }
  function readValue(f, form) {
    const el = form.elements[f.key];
    if (!el) return '';
    const v = cleanText(f, el.value);
    if (v === '') return '';
    if (f.type === 'number') return /^\d+$/.test(v) ? Number(v) : NaN;
    return v;
  }
  function readForm() {
    const e = ent(formCtx.key), form = $('#dlgForm'), data = {};
    e.fields.forEach(f => { data[f.key] = readValue(f, form); });
    return data;
  }
  function showErrors(errs, all) {
    const form = $('#dlgForm');
    form.querySelectorAll('.field').forEach(fld => {
      const k = fld.dataset.field, show = all || formCtx.touched.has(k);
      const msg = show ? errs[k] : '';
      fld.classList.toggle('invalid', !!msg);
      const fd = ent(formCtx.key).fields.find(f => f.key === k);
      const val = fd ? readValue(fd, form) : '';
      fld.classList.toggle('valid', show && !msg && val !== '' && !fld.querySelector('[readonly]'));
      fld.querySelector('.err').textContent = msg || '';
    });
    const n = Object.keys(errs).filter(k => k !== '_form').length;
    const msg = errs._form || (n ? (n === 1 ? 'יש לתקן את השדה המסומן' : `יש לתקן ${n} שדות מסומנים`) : '');
    $('#formMsg').textContent = all || formCtx.submitted ? msg : '';
  }
  function liveValidate(ev) {
    if (!formCtx) return;
    const fld = ev.target.closest('.field');
    if (fld && (ev.type !== 'input' || fld.classList.contains('invalid') || formCtx.submitted)) formCtx.touched.add(fld.dataset.field);
    showErrors(validateRecord(formCtx.key, readForm(), formCtx.rec), formCtx.submitted);
  }
  function submitForm(ev) {
    if (ev) ev.preventDefault();
    if (!formCtx) return;
    const { key, rec } = formCtx;
    const e = ent(key);
    formCtx.submitted = true;
    const data = readForm();
    const errs = validateRecord(key, data, rec);
    showErrors(errs, true);
    if (Object.keys(errs).length) return formFail();
    if (rec) Object.assign(rec, data); else db[key].push(data);
    save(); closeForm();
    toast(rec ? 'השינויים נשמרו' : ADDED(e));
    route(true);
  }
  function formFail() {
    const first = document.querySelector('#dlgForm .field.invalid input, #dlgForm .field.invalid select');
    if (first) {
      const body = $('#dlgBody'), fld = first.closest('.field');
      body.scrollTop = Math.max(0, fld.offsetTop - body.offsetTop - 12);
      try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); }
    }
    const box = $('#dlg'); box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake');
  }
  function updateMoreHint() {
    const b = $('#dlgBody');
    $('#dlg').classList.toggle('has-more', b.scrollHeight - b.scrollTop - b.clientHeight > 8);
  }

  /* ---------- Router ---------- */
  function route(keepScroll) {
    const [path, qs] = location.hash.replace(/^#\/?/, '').split('?');
    const q = Object.fromEntries(new URLSearchParams(qs || ''));
    const parts = decodeURIComponent(path).split('/');
    if (parts[0] !== 'queue') { document.body.classList.remove('q-screen'); if (document.fullscreenElement) document.exitFullscreen(); }
    if (parts[0] === 'e' && parts[1] && parts[2]) viewDetail(parts[1], parts.slice(2).join('/'));
    else if (parts[0] === 'e' && parts[1]) viewList(parts[1], q);
    else if (parts[0] === 'queue') viewQueue();
    else viewHome();
    if (keepScroll !== true) window.scrollTo(0, 0);
  }

  document.addEventListener('click', ev => {
    const ed = ev.target.closest('[data-edit]'), dl = ev.target.closest('[data-del]');
    const key = (location.hash.match(/#\/e\/([^/?]+)/) || [])[1];
    if (ed) { ev.stopPropagation(); return openForm(key, findBy(key, ed.dataset.edit)); }
    if (dl) { ev.stopPropagation(); return remove(key, dl.dataset.del); }
    const row = ev.target.closest('tr[data-go]');
    if (row && !ev.target.closest('a')) location.hash = row.dataset.go;
  });
  $('#dlgForm').addEventListener('submit', submitForm);
  $('#dlgSave').addEventListener('click', ev => { ev.preventDefault(); submitForm(); });  // גיבוי ל-Safari/iOS
  $('#dlgForm').addEventListener('input', liveValidate);
  $('#dlgForm').addEventListener('change', liveValidate);
  $('#dlgForm').addEventListener('focusout', ev => {
    if (!ev.target.matches('input,select')) return;
    if (formCtx && ev.target.matches('input[type="text"],input[type="tel"]') && !ev.target.readOnly) {
      const f = ent(formCtx.key).fields.find(x => x.key === ev.target.name);
      if (f) { const c = cleanText(f, ev.target.value); if (c !== ev.target.value) ev.target.value = c; }
    }
    liveValidate(ev);
  });
  $('#dlgBody').addEventListener('scroll', updateMoreHint, { passive: true });
  $('#dlgCancel').addEventListener('click', closeForm);
  $('#dlg').addEventListener('close', () => { formCtx = null; });
  window.addEventListener('hashchange', route);

  $('#menuBtn').innerHTML = ICON('menu', 20);
  $('#today').textContent = new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  load();
  route();
})();
