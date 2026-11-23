/* ============================================================
   מודל הנתונים – מערכת ניהול תורים למרפאה
   משותף לאפליקציה ולעמוד ה-ERD: ישויות, תכונות, מפתחות וקשרים
   ============================================================ */
window.SCHEMA = {
  entities: [
    {
      key: 'doctors', label: 'רופאים', single: 'רופא', en: 'Doctor', color: '#0d9488',
      desc: 'רופאי המרפאה. כל רופא מזוהה באופן ייחודי לפי מספר רישיון, ומקבל תורים רבים.',
      pk: ['licenseNo'],
      fields: [
        { key: 'licenseNo', label: 'מספר רישיון', type: 'text', required: true, pattern: '^\\d{5,6}$', hint: '5-6 ספרות' },
        { key: 'name', label: 'שם הרופא', type: 'text', required: true, minLen: 2 }
      ],
      title: r => `ד"ר ${r.name}`
    },
    {
      key: 'patients', label: 'מטופלים', single: 'מטופל', en: 'Patient', color: '#3b82f6',
      desc: 'מטופלי המרפאה. כל מטופל מזוהה באופן ייחודי לפי תעודת זהות, ויכול להזמין תורים רבים.',
      pk: ['patientId'],
      fields: [
        { key: 'patientId', label: 'תעודת זהות', type: 'text', required: true, pattern: '^\\d{9}$', digits9: true, israeliId: true, hint: '9 ספרות, כולל ספרת ביקורת' },
        { key: 'name', label: 'שם המטופל', type: 'text', required: true, minLen: 2 },
        { key: 'phone', label: 'מספר טלפון', type: 'tel', required: true, pattern: '^0\\d{1,2}-?\\d{7}$', hint: 'לדוגמה 050-1234567' }
      ],
      title: r => r.name
    },
    {
      key: 'appointments', label: 'תורים', single: 'תור', en: 'Appointment', color: '#8b5cf6',
      desc: 'תורים במרפאה. כל תור מזוהה במספר תור רץ, ומשויך לרופא אחד (שמקבל אותו) ולמטופל אחד (שמזמין אותו).',
      pk: ['apptNo'],
      fields: [
        { key: 'apptNo', label: 'מספר תור', type: 'number', required: true, auto: true },
        { key: 'dateTime', label: 'תאריך ושעת התור', type: 'datetime', required: true },
        { key: 'reason', label: 'סיבת הביקור', type: 'text', required: true, minLen: 2,
          suggest: ['בדיקה כללית', 'מעקב', 'חידוש מרשם', 'בדיקת דם – תוצאות', 'כאבי גב', 'חום ושיעול', 'הפניה למומחה', 'חיסון'] },
        { key: 'licenseNo', label: 'רופא', type: 'ref', ref: 'doctors', required: true },
        { key: 'patientId', label: 'מטופל', type: 'ref', ref: 'patients', required: true }
      ],
      computed: [
        { key: 'when', label: 'מצב', type: 'tag', fn: r => window.__apptState ? window.__apptState(r) : '' }
      ],
      title: r => `תור ${r.apptNo}`
    }
  ],

  /* קשרים – משמשים לעמוד ה-ERD ולתצוגת הקשרים באפליקציה */
  relations: [
    { key: 'r_receives', label: 'מקבל', a: 'doctors', b: 'appointments', pA: '(0,N)', pB: '(1,1)',
      part: ['רופא מקבל 0 עד N תורים', 'כל תור מתקבל אצל רופא אחד בדיוק'], card: '1:N', degree: 'בינארי',
      impl: 'מפתח זר "מספר רישיון" בטבלת תורים (צד ה"רבים")',
      text: 'רופא מקבל תורים רבים; כל תור מתקבל אצל רופא אחד' },
    { key: 'r_books', label: 'מזמין', a: 'patients', b: 'appointments', pA: '(0,N)', pB: '(1,1)',
      part: ['מטופל מזמין 0 עד N תורים', 'כל תור מוזמן על ידי מטופל אחד בדיוק'], card: '1:N', degree: 'בינארי',
      impl: 'מפתח זר "תעודת זהות" בטבלת תורים (צד ה"רבים")',
      text: 'מטופל מזמין תורים רבים; כל תור מוזמן על ידי מטופל אחד' }
  ],

  /* עובדות מהדרישות שהוצאו מהמודל (סעיף 6 בהנחיות) */
  excluded: [
    { fact: 'חניה לכלל צוות הרופאים',
      why: 'החניה משותפת לכל הרופאים, ולכן היא אינה תכונה שמתארת או מבדילה רופא מסוים. ערך זהה בכל מופע של "רופא" לא מוסיף מידע, ושמירתו בכל רשומה יוצרת כפילות. היא גם לא קשורה לניהול יומן התורים, שהוא מטרת המערכת.' }
  ]
};

/* נתוני הדגמה (פיקטיביים). התורים נבנים יחסית לתאריך של היום, כך שיש תמיד תורים להיום ולימים הקרובים. */
window.buildSeed = function () {
  const pad = n => String(n).padStart(2, '0');
  const base = new Date(); base.setHours(0, 0, 0, 0);
  // נתוני ההדגמה נקבעים רק בימים א'-ה': שישי/שבת מוזזים לחמישי (עבר) או לראשון (עתיד)
  const at = (dayOffset, hhmm) => {
    const d = new Date(base); d.setDate(d.getDate() + dayOffset);
    while (d.getDay() === 5 || d.getDay() === 6) d.setDate(d.getDate() + (dayOffset < 0 ? -1 : 1));
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${hhmm}`;
  };
  const doctors = [
    { licenseNo: '42817', name: 'מיכל ברק' },
    { licenseNo: '38265', name: 'יוסף אלון' },
    { licenseNo: '51093', name: 'נועה שטרן' },
    { licenseNo: '29540', name: 'עומר חביב' }
  ];
  const patients = [
    { patientId: '031458722', name: 'דנה כהן', phone: '050-1112233' },
    { patientId: '208774315', name: 'אורי לוי', phone: '052-2223344' },
    { patientId: '312905649', name: 'רונית אברהם', phone: '054-3334455' },
    { patientId: '055612394', name: 'משה מזרחי', phone: '053-4445566' },
    { patientId: '328477104', name: 'שירה פרידמן', phone: '058-5556677' },
    { patientId: '214556086', name: 'איתי חדד', phone: '050-6667788' },
    { patientId: '043899152', name: 'גלית ביטון', phone: '052-7778899' },
    { patientId: '330124769', name: 'יונתן רז', phone: '054-8889900' }
  ];
  const plan = [
    [-12, '09:00', 'בדיקה כללית', 0, 0], [-10, '10:30', 'חום ושיעול', 1, 1], [-9, '16:20', 'כאבי גב', 2, 2],
    [-7, '08:40', 'בדיקת דם – תוצאות', 0, 3], [-6, '12:00', 'חידוש מרשם', 3, 4], [-5, '11:10', 'מעקב', 1, 0],
    [-3, '09:30', 'חיסון', 2, 5], [-2, '17:00', 'הפניה למומחה', 3, 6], [-1, '10:00', 'מעקב', 0, 2],
    [0, '08:30', 'בדיקה כללית', 0, 7], [0, '09:20', 'חידוש מרשם', 1, 3], [0, '11:00', 'כאבי גב', 2, 1],
    [0, '14:40', 'מעקב', 0, 4], [0, '18:10', 'חום ושיעול', 3, 5],
    [1, '09:00', 'בדיקת דם – תוצאות', 1, 6], [1, '13:30', 'מעקב', 2, 0], [2, '10:20', 'הפניה למומחה', 0, 1],
    [3, '08:50', 'חיסון', 3, 2], [3, '15:00', 'בדיקה כללית', 1, 7], [5, '11:40', 'כאבי גב', 2, 3],
    [7, '09:10', 'מעקב', 0, 5], [9, '16:00', 'חידוש מרשם', 3, 6]
  ];
  const appointments = plan.map(([off, t, reason, d, p], i) => ({
    apptNo: 1001 + i, dateTime: at(off, t), reason, licenseNo: doctors[d].licenseNo, patientId: patients[p].patientId
  }));
  return { doctors, patients, appointments };
};
