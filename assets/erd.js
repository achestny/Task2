/* עמוד ה-ERD – תרשים ישויות-קשרים בסימון Chen:
   מלבן = ישות, מעוין = קשר, אליפסה = תכונה, קו תחתון = מפתח ראשי (PK) */
(function () {
  'use strict';
  const S = window.SCHEMA;
  const ent = k => S.entities.find(e => e.key === k);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = id => document.getElementById(id);

  /* ---------- מעטפת ---------- */
  renderSidebar('erd', 'index.html');
  $('crumbs').innerHTML = `<a href="index.html#/">לוח בקרה</a>${ICON('back', 14)}<b>תרשים ERD</b>`;
  $('menuBtn').innerHTML = ICON('menu', 20);
  $('today').textContent = new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  $('erdTile').innerHTML = ICON('erd', 16);
  if (window.ILLUS) $('erdArt').innerHTML = ILLUS.erd;
  $('zoomIn').innerHTML = ICON('zoomIn', 18); $('zoomOut').innerHTML = ICON('zoomOut', 18); $('zoomFit').innerHTML = ICON('fit', 18);

  /* ---------- פריסה (מימין לשמאל: רופא – מקבל – תור – מזמין – מטופל) ---------- */
  const W = 1240, H = 560, EW = 140, EH = 54, DW = 70, DH = 36;
  const L = {
    doctors:      { x: 1060, y: 290, attrs: { licenseNo: [1000, 150], name: [1150, 165] } },
    appointments: { x: 620,  y: 290, attrs: { apptNo: [510, 150], dateTime: [730, 150], reason: [620, 440] } },
    patients:     { x: 180,  y: 290, attrs: { patientId: [95, 150], name: [255, 150], phone: [180, 440] } }
  };
  const R = { r_receives: { x: 840, y: 290 }, r_books: { x: 400, y: 290 } };
  const rx = t => Math.max(44, t.length * 4.3 + 20);
  const P = { lines: [], attrs: [], labels: [], shapes: [] };

  /* צבעי הסגנון: ישות כתומה, קשר כחול, תכונה ירוקה, (min,max) באדום */
  const C = { entF: '#fff8e8', entS: '#c9802b', relF: '#e4f0fb', relS: '#2b4f9e', atF: '#eef6e7', atS: '#5c9a4b' };
  // (min,max) תמיד משמאל לימין – bidi-override מכריח את הסדר בכל דפדפן
  const badge = (x, y, t) => !t ? '' : `<text class="mm" x="${x}" y="${y + 5}" text-anchor="middle" direction="ltr" unicode-bidi="bidi-override">${t}</text>`;
  function cardLabel(ex, ey, tx, ty, text) {
    const dx = tx - ex, dy = ty - ey, len = Math.hypot(dx, dy) || 1;
    const tEdge = Math.min(Math.abs((EW / 2) / (dx || 1e-9)), Math.abs((EH / 2) / (dy || 1e-9)));
    const t = Math.min(tEdge + 34 / len, 0.5);
    const px = ex + dx * t, py = ey + dy * t, nx = -dy / len, ny = dx / len;
    return badge(px + nx * 20, py + ny * 20, text);
  }

  // ישויות + תכונות (מפתחות זרים אינם תכונות במודל המושגי – הקשר מייצג אותם)
  Object.keys(L).forEach(k => {
    const e = ent(k), p = L[k];
    e.fields.filter(f => f.type !== 'ref').forEach(f => {
      const pos = p.attrs[f.key]; if (!pos) return;
      const [ax, ay] = pos, pk = e.pk.includes(f.key);
      P.lines.push(`<line class="ln attr-ln" data-n="A:${k}" x1="${p.x}" y1="${p.y}" x2="${ax}" y2="${ay}"/>`);
      P.attrs.push(`<g class="attr${pk ? ' pk' : ''}" data-n="A:${k}">
        <ellipse cx="${ax}" cy="${ay}" rx="${rx(f.label)}" ry="22" fill="${C.atF}" stroke="${C.atS}"/>
        <text x="${ax}" y="${ay + 5}" text-anchor="middle" direction="rtl">${esc(f.label)}</text>
        <title>${esc(f.label)}${pk ? ' – מפתח ראשי (PK)' : ''}</title></g>`);
    });
    P.shapes.push(`<g class="ent clickable" data-n="E:${k}" data-sel="E:${k}">
      <rect class="box" x="${p.x - EW / 2}" y="${p.y - EH / 2}" width="${EW}" height="${EH}" rx="5" fill="${C.entF}" stroke="${C.entS}"/>
      <text x="${p.x}" y="${p.y + 6}" text-anchor="middle" direction="rtl" fill="#1f1a14">${esc(e.single)}</text>
      <title>${esc(e.single)} (${e.en}) – ${esc(e.desc)}</title></g>`);
  });

  // קשרים
  S.relations.forEach(r => {
    const p = R[r.key], n = `R:${r.key}`, A = L[r.a], B = L[r.b];
    P.lines.push(`<line class="ln" data-n="E:${r.a} ${n}" x1="${A.x}" y1="${A.y}" x2="${p.x}" y2="${p.y}"/>`);
    P.lines.push(`<line class="ln" data-n="E:${r.b} ${n}" x1="${B.x}" y1="${B.y}" x2="${p.x}" y2="${p.y}"/>`);
    P.labels.push(`<g data-n="E:${r.a} ${n}">${cardLabel(A.x, A.y, p.x, p.y, r.pB)}</g>`);
    P.labels.push(`<g data-n="E:${r.b} ${n}">${cardLabel(B.x, B.y, p.x, p.y, r.pA)}</g>`);
    P.shapes.push(`<g class="rel clickable" data-n="${n}" data-sel="${n}">
      <polygon points="${p.x},${p.y - DH} ${p.x + DW},${p.y} ${p.x},${p.y + DH} ${p.x - DW},${p.y}" fill="${C.relF}" stroke="${C.relS}"/>
      <text x="${p.x}" y="${p.y + 5}" text-anchor="middle" direction="rtl" fill="${C.relS}">${esc(r.label)}</text>
      <title>${esc(r.text)} (${r.card})</title></g>`);
  });

  const canvas = $('canvas');
  canvas.innerHTML = `<svg id="erd" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Heebo, Arial, sans-serif" role="img" aria-label="תרשים ישויות-קשרים: רופא, תור, מטופל">
    ${P.lines.join('')}${P.attrs.join('')}${P.shapes.join('')}${P.labels.join('')}</svg>`;
  const svgEl = $('erd');

  /* ---------- מקרא ---------- */
  $('legend').innerHTML = `
    <span class="item"><svg width="42" height="24"><rect x="1.5" y="2" width="39" height="20" rx="3" fill="${C.entF}" stroke="${C.entS}" stroke-width="2"/></svg>ישות</span>
    <span class="item"><svg width="42" height="26"><polygon points="21,2 40,13 21,24 2,13" fill="${C.relF}" stroke="${C.relS}" stroke-width="2"/></svg>קשר</span>
    <span class="item"><svg width="46" height="24"><ellipse cx="23" cy="12" rx="21" ry="10" fill="${C.atF}" stroke="${C.atS}" stroke-width="1.6"/></svg>תכונה</span>
    <span class="item"><svg width="46" height="24"><ellipse cx="23" cy="12" rx="21" ry="10" fill="${C.atF}" stroke="${C.atS}" stroke-width="1.6"/><text x="23" y="16" text-anchor="middle" font-size="10" font-weight="700" text-decoration="underline">מזהה</text></svg>מפתח ראשי (קו תחתון)</span>
    <span class="item"><b class="ltr" style="color:#a2332a">(min,max)</b>&nbsp;כמה מופעים של הישות שלידה מקושרים למופע אחד בצד השני – למשל <b class="ltr" style="color:#a2332a">(0,N)</b> ליד תור = רופא מקבל 0 עד N תורים</span>`;

  /* ---------- הדגשה ---------- */
  const info = $('selInfo'), clearBtn = $('clearSel'), DEFAULT_INFO = info.textContent;
  function select(id) {
    if (!id) {
      svgEl.classList.remove('focus'); svgEl.querySelectorAll('.dim').forEach(x => x.classList.remove('dim'));
      info.textContent = DEFAULT_INFO; clearBtn.hidden = true; return;
    }
    const active = new Set([id]);
    const [kind, key] = id.split(':');
    if (kind === 'E') {
      active.add('A:' + key);
      const rels = S.relations.filter(r => r.a === key || r.b === key);
      rels.forEach(r => ['R:' + r.key, 'E:' + r.a, 'E:' + r.b, 'A:' + r.a, 'A:' + r.b].forEach(t => active.add(t)));
      info.innerHTML = `<b style="color:var(--ink)">${esc(ent(key).single)}</b> · ${rels.map(r => `${esc(r.label)} <span class="ltr">${r.card}</span>`).join(' · ')}`;
    } else {
      const r = S.relations.find(x => x.key === key);
      ['E:' + r.a, 'E:' + r.b, 'A:' + r.a, 'A:' + r.b].forEach(t => active.add(t));
      info.innerHTML = `<b style="color:var(--ink)">${esc(r.label)}</b> · ${esc(r.text)} (<span class="ltr">${r.card}</span>)`;
    }
    svgEl.classList.add('focus'); clearBtn.hidden = false;
    svgEl.querySelectorAll('[data-n]').forEach(el => el.classList.toggle('dim', !el.dataset.n.split(' ').every(t => active.has(t))));
  }
  svgEl.addEventListener('click', ev => { const g = ev.target.closest('[data-sel]'); select(g ? g.dataset.sel : null); });
  clearBtn.addEventListener('click', () => select(null));

  /* ---------- זום ותכונות ---------- */
  let scale = 1;
  const apply = () => { svgEl.setAttribute('width', W * scale); svgEl.setAttribute('height', H * scale); };
  const fit = () => { scale = Math.max(0.5, Math.min(1.15, (canvas.clientWidth - 4) / W)); apply(); };
  $('zoomIn').addEventListener('click', () => { scale = Math.min(2.5, scale * 1.2); apply(); });
  $('zoomOut').addEventListener('click', () => { scale = Math.max(0.3, scale / 1.2); apply(); });
  $('zoomFit').addEventListener('click', fit);
  const tBtn = $('toggleAttrs');
  const setT = off => { tBtn.innerHTML = `${ICON('eye', 16)} ${off ? 'הצגת תכונות' : 'הסתרת תכונות'}`; };
  setT(false);
  tBtn.addEventListener('click', () => setT(svgEl.classList.toggle('no-attrs')));
  fit();
  window.addEventListener('resize', () => { if (scale <= 1.15) fit(); });

  /* ---------- הורדת התרשים (SVG / PNG) – להגשה ---------- */
  const EXPORT_CSS = `.ent rect.box,.rel polygon{stroke-width:2.2}.ent text{font-weight:700;font-size:16px}.rel text{font-size:14px;font-weight:700}
    .attr ellipse{stroke-width:1.8}.attr text{font-size:13px;fill:#1f2a1a}.attr.pk text{text-decoration:underline;font-weight:700;fill:#0f172a}
    .ln{stroke:#555;stroke-width:2.2;fill:none}.ln.attr-ln{stroke:#b5b5b5;stroke-width:1.3}
    .mm{font-size:15px;font-weight:700;fill:#a2332a;paint-order:stroke;stroke:#fff;stroke-width:4px;stroke-linejoin:round}text{font-family:Heebo,Arial,sans-serif}`;
  function exportSvg() {
    const c = svgEl.cloneNode(true);
    c.classList.remove('focus', 'no-attrs'); c.querySelectorAll('.dim').forEach(x => x.classList.remove('dim'));
    c.querySelectorAll('title').forEach(t => t.remove());
    c.setAttribute('width', W); c.setAttribute('height', H);
    c.insertAdjacentHTML('afterbegin', `<style>${EXPORT_CSS}</style><rect width="${W}" height="${H}" fill="#fff"/>`);
    return new XMLSerializer().serializeToString(c);
  }
  function download(blob, name) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  $('dlSvg').innerHTML = `${ICON('download', 16)} SVG`;
  $('dlPng').innerHTML = `${ICON('download', 16)} PNG`;
  $('dlSvg').addEventListener('click', () => download(new Blob([exportSvg()], { type: 'image/svg+xml' }), 'clinic-erd.svg'));
  $('dlPng').addEventListener('click', () => {
    const img = new Image(), k = 2;
    img.onload = () => {
      const cv = document.createElement('canvas'); cv.width = W * k; cv.height = H * k;
      const g = cv.getContext('2d'); g.scale(k, k); g.drawImage(img, 0, 0, W, H);
      cv.toBlob(b => download(b, 'clinic-erd.png'), 'image/png');
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(exportSvg());
  });

  /* ---------- טבלת קשרים ---------- */
  const chip = k => { const e = ent(k); return `<span class="chip" style="--c:${e.color}">${esc(e.single)}</span>`; };
  $('relCount').textContent = `${S.relations.length} קשרים`;
  $('relTable').innerHTML = `
    <thead><tr><th>קשר</th><th>ישויות</th><th>עוצמה</th><th>דרגה</th><th>(min,max) ליד כל ישות</th><th>מימוש בטבלאות</th></tr></thead>
    <tbody>${S.relations.map(r => `<tr>
      <td><b>${esc(r.label)}</b><div class="muted" style="font-size:12.5px;margin-top:2px">${esc(ent(r.a).single)} ${esc(r.label)} ${esc(ent(r.b).single)}</div></td>
      <td><span class="ent-pair">${chip(r.a)}${chip(r.b)}</span></td>
      <td><span class="rel-type">${r.card}</span></td><td>${esc(r.degree)}</td>
      <td style="white-space:normal"><div>ליד ${esc(ent(r.b).single)} <span class="rel-type mmc">${r.pA}</span> – ${esc(r.part[0])}</div><div style="margin-top:4px">ליד ${esc(ent(r.a).single)} <span class="rel-type mmc">${r.pB}</span> – ${esc(r.part[1])}</div></td>
      <td class="muted">${esc(r.impl)}</td></tr>`).join('')}</tbody>`;

  /* ---------- עובדות שהוצאו מהמודל ---------- */
  $('excluded').innerHTML = S.excluded.map(x => `<div class="excl"><span class="excl-ic">✕</span>
    <div><b>${esc(x.fact)}</b><p>${esc(x.why)}</p></div></div>`).join('');

  /* ---------- סכמה יחסית ---------- */
  $('schemaGrid').innerHTML = S.entities.map(e => `
    <div class="schema-tbl" style="--c:${e.color}">
      <div class="h"><span class="tile">${ICON(e.key, 16)}</span><b>${esc(e.label)}</b><small>${e.en}s</small></div>
      <ul>${e.fields.map(f => {
        const pk = e.pk.includes(f.key);
        return `<li>${pk ? '<span class="key-ic pk">PK</span>' : ''}${f.type === 'ref' ? '<span class="key-ic fk">FK</span>' : ''}
          <span${pk ? ' style="text-decoration:underline;font-weight:600"' : ''}>${esc(f.type === 'ref' ? ent(f.ref).fields.find(x => x.key === ent(f.ref).pk[0]).label + ' ' + ent(f.ref).single : f.label)}</span>
          ${f.type === 'ref' ? `<span class="ref">← ${esc(ent(f.ref).label)}</span>` : ''}</li>`;
      }).join('')}</ul></div>`).join('');
})();
