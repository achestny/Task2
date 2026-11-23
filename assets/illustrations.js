/* איורים מקוריים (SVG) – משותפים לאפליקציה ולעמוד ה-ERD. ללא קבצים חיצוניים. */
(function () {
  'use strict';
  const S = (vb, body, cls) => `<svg class="illus ${cls || ''}" viewBox="${vb}" aria-hidden="true" focusable="false">${body}</svg>`;
  const blob = fill => `<path d="M206 48c26 22 34 66 14 94s-74 34-112 26S36 140 30 104 44 30 86 18s94 8 120 30z" fill="${fill}"/>`;
  const sparkle = (x, y, c) => `<path d="M${x} ${y - 7}l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="${c}"/>`;
  const cross = (x, y, s, c) => `<path d="M${x - s / 6} ${y - s / 2}h${s / 3}v${s / 3}h${s / 3}v${s / 3}h-${s / 3}v${s / 3}h-${s / 3}v-${s / 3}h-${s / 3}v-${s / 3}h${s / 3}z" fill="${c}"/>`;
  const person = (x, y, c, s, coat) => { s = s || 1; return `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="-34" r="15" fill="#fde2cf"/><path d="M-15 -40c2-12 28-12 30 0-6-6-24-6-30 0z" fill="#334155"/><path d="M-28 12c0-22 12-32 28-32s28 10 28 32z" fill="${c}"/>${coat ? `<path d="M-6 -20 0 -8 6 -20" fill="none" stroke="#fff" stroke-width="3"/><path d="M-10 -14c-4 8-2 16 6 16" fill="none" stroke="#334155" stroke-width="2.4"/><circle cx="-4" cy="3" r="3" fill="#334155"/>` : ''}</g>`; };
  const cal = (x, y, w, h) => `<g transform="translate(${x} ${y})"><rect width="${w}" height="${h}" rx="9" fill="#fff"/><rect width="${w}" height="${h * .26}" rx="9" fill="#8b5cf6"/><rect y="${h * .18}" width="${w}" height="${h * .08}" fill="#8b5cf6"/>
    <rect x="${w * .22}" y="-6" width="6" height="16" rx="3" fill="#475569"/><rect x="${w * .7}" y="-6" width="6" height="16" rx="3" fill="#475569"/>
    ${[0, 1, 2].map(r => [0, 1, 2, 3].map(c => `<rect x="${w * .1 + c * w * .21}" y="${h * .38 + r * h * .19}" width="${w * .15}" height="${h * .12}" rx="2" fill="${r === 1 && c === 2 ? '#14b8a6' : '#ede9fe'}"/>`).join('')).join('')}</g>`;

  window.ILLUS = {
    /* פס הפתיחה – על רקע כהה */
    clinic: S('0 0 320 220', `
      <ellipse cx="160" cy="204" rx="136" ry="11" fill="#000" opacity=".18"/>
      <rect x="70" y="62" width="150" height="134" rx="8" fill="#ecfeff"/><rect x="70" y="62" width="150" height="26" rx="8" fill="#99f6e4"/>
      ${cross(145, 40, 34, '#f43f5e')}
      ${[0, 1].map(r => [0, 1, 2].map(c => `<rect x="${86 + c * 44}" y="${100 + r * 34}" width="30" height="22" rx="3" fill="#bae6fd"/>`).join('')).join('')}
      <rect x="128" y="164" width="34" height="32" rx="3" fill="#5eead4"/><circle cx="154" cy="181" r="2.5" fill="#0f766e"/>
      ${cal(226, 104, 74, 74)}
      <g transform="translate(40 150)"><circle r="22" fill="#fff"/><circle r="22" fill="none" stroke="#5eead4" stroke-width="4"/><path d="M0 -12v12l8 6" stroke="#0f766e" stroke-width="3.5" stroke-linecap="round" fill="none"/></g>
      ${sparkle(34, 64, '#fde68a')}${sparkle(290, 60, '#99f6e4')}${sparkle(112, 24, '#fff')}`, 'il-bank'),

    doctors: S('0 0 240 170', `${blob('#ccfbf1')}
      ${person(104, 132, '#f8fafc', 1.2, true)}
      <rect x="150" y="44" width="58" height="40" rx="8" fill="#fff" stroke="#99f6e4" stroke-width="2"/>${cross(179, 64, 22, '#14b8a6')}
      ${sparkle(46, 46, '#fbbf24')}${sparkle(210, 116, '#5eead4')}`),

    patients: S('0 0 240 170', `${blob('#dbeafe')}
      ${person(92, 130, '#3b82f6', 1.1)}${person(150, 136, '#f59e0b', .95)}
      <rect x="170" y="42" width="50" height="62" rx="6" fill="#fff" stroke="#bfdbfe" stroke-width="2"/><rect x="182" y="36" width="26" height="10" rx="3" fill="#93c5fd"/>
      <rect x="179" y="58" width="32" height="4" rx="2" fill="#bfdbfe"/><rect x="179" y="68" width="24" height="4" rx="2" fill="#dbeafe"/><rect x="179" y="78" width="28" height="4" rx="2" fill="#dbeafe"/>
      ${sparkle(40, 48, '#fbbf24')}${sparkle(214, 128, '#93c5fd')}`),

    appointments: S('0 0 240 170', `${blob('#ede9fe')}
      ${cal(62, 44, 104, 98)}
      <g transform="translate(176 118)"><circle r="26" fill="#fff"/><circle r="26" fill="none" stroke="#a78bfa" stroke-width="4"/><path d="M0 -14v14l10 7" stroke="#6d28d9" stroke-width="4" stroke-linecap="round" fill="none"/></g>
      ${sparkle(40, 126, '#fbbf24')}${sparkle(206, 44, '#c4b5fd')}`),


    erd: S('0 0 240 170', `${blob('#e0e7ff')}
      <path d="M70 70L120 100M170 70L120 100M120 100v30" stroke="#64748b" stroke-width="3"/>
      <rect x="34" y="50" width="72" height="34" rx="5" fill="#fff8e8" stroke="#c9802b" stroke-width="3"/>
      <rect x="134" y="50" width="72" height="34" rx="5" fill="#fff8e8" stroke="#c9802b" stroke-width="3"/>
      <path d="M120 82l24 18-24 18-24-18z" fill="#e4f0fb" stroke="#2b4f9e" stroke-width="3"/>
      <ellipse cx="120" cy="140" rx="30" ry="13" fill="#eef6e7" stroke="#5c9a4b" stroke-width="3"/>
      ${sparkle(212, 120, '#fbbf24')}${sparkle(30, 128, '#93c5fd')}`),

    empty: S('0 0 200 140', `<ellipse cx="100" cy="122" rx="70" ry="8" fill="#e2e8f0"/>
      <path d="M50 60l50-22 50 22v50l-50 20-50-20z" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2"/><path d="M50 60l50 20 50-20M100 80v50" fill="none" stroke="#cbd5e1" stroke-width="2"/>
      <path d="M50 60l-14 18 50 20 14-18zM150 60l14 18-50 20-14-18z" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2"/>
      ${sparkle(150, 30, '#fbbf24')}${sparkle(46, 36, '#93c5fd')}`, 'il-empty')
  };
})();

/* צילומים (Unsplash – שימוש חופשי לפי Unsplash License). אם צילום לא נטען – מוצג האיור במקומו */
(function () {
  'use strict';
  const U = (id, w) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;
  window.PHOTOS = {
    hero:         { id: 'photo-1519494026892-80bbd2d6fd0d', pos: 'center 55%', page: 'hospital-lobby-reception-with-signage-nMyM7fxpokE' },          // קבלה במרפאה
    doctors:      { id: 'photo-1638202993928-7267aad84c31', pos: 'center 30%', page: 'a-woman-in-a-white-shirt-holding-a-stethoscope-tE7_jvK-_YU' }, // רופאה עם סטטוסקופ
    patients:     { id: 'photo-1758691462863-9e1b8a863140', pos: 'center 40%', page: 'doctor-consulting-with-a-patient-in-an-office-MJmsLpeHPfg' },  // רופאה ומטופל
    appointments: { id: 'photo-1576091160550-2173dba999ef', pos: 'center 50%', page: 'person-sitting-while-using-laptop-computer-and-green-stethoscope-near-NFvdKIhxYlU' }  // תורים
  };
  window.photoImg = (key, w, cls, eager) => {
    const p = window.PHOTOS[key];
    if (!p) return (window.ILLUS && ILLUS[key]) || '';
    return `<img class="${cls}" src="${U(p.id, w)}" srcset="${U(p.id, w)} 1x, ${U(p.id, w * 2)} 2x" alt="" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'}
      style="object-position:${p.pos}" decoding="async" referrerpolicy="no-referrer" title="צילום: Unsplash" data-k="${key}" onerror="__photoFail(this)" onload="this.classList.add('ok')">`;
  };
  window.__photoFail = img => {
    const k = img.dataset.k, host = img.parentElement;
    img.remove();
    if (!host) return;
    if (host.classList.contains('wl-photo-wrap')) host.closest('.welcome').classList.remove('has-photo');
    else host.innerHTML = (window.ILLUS && ILLUS[k === 'hero' ? 'clinic' : k]) || '';
  };
})();
