/* learningWheel – Role-Based LMS + PWA
   Roles: student, teacher, parent, principal
   Each role has scoped data, guarded tabs, and dedicated renderers.
*/

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const state = {
  role: null,
  kid: 0,
  cls: null,
  subj: null,
  ct: 'stream',
  st: 'all',
  tab: 'home',
  discId: null,
  msgThread: null,
  fresh: [],
  quarter: 'Q3',
  examId: null,
  examEdit: null,
  examReview: false
};

const T = m => {
  const t = $('#toast');
  if (!t) return;
  t.textContent = m;
  t.hidden = false;
  clearTimeout(T.i);
  T.i = setTimeout(() => t.hidden = true, 2800);
};
const toast = T;

function view(id) {
  $$('.view').forEach(v => v.hidden = v.id !== id);
  scrollTo(0, 0);
  if (id !== 'dash') toggleSide(false);
}

function toggleSide(force) {
  const s = $('#sidebar');
  const o = $('#sideOverlay');
  if (!s) return;
  const open = force === undefined ? !s.classList.contains('open') : force;
  s.classList.toggle('open', open);
  if (o) o.classList.toggle('open', open);
}

/* ========== Landing ========== */
const plans = [
  ['Starter', 'Starter Academy', '₱24,900', 'Up to 300 learners', ['Gradebook & SF9', 'Student hub', 'Discussions', 'Email support']],
  ['Academy', 'School Academy', '₱79,900', 'Up to 1,000 learners', ['Everything in Starter', 'Parent portal', 'Principal console', 'Messages & calendar', 'Offline-safe quizzes']],
  ['Enterprise', 'Division Enterprise', 'Custom', 'Unlimited schools', ['Division dashboards', 'SSO & data export', 'Dedicated manager', 'Custom training']]
];

const plansEl = $('#plans');
if (plansEl) {
  plansEl.innerHTML = plans.map(p => `
    <div class="col-md-4">
      <div class="card h-100 ${p[0] === 'Academy' ? 'border-dark' : ''}">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start mb-1">
            <h3 class="h6 mb-0">${p[1]}</h3>
            ${p[0] === 'Academy' ? '<span class="badge text-bg-dark">Popular</span>' : ''}
          </div>
          <div class="fs-3 fw-bold mb-1">${p[2]}</div>
          <p class="text-secondary small">${p[3]} / year</p>
          <ul class="small text-secondary mb-3 flex-grow-1 ps-3">
            ${p[4].map(x => `<li class="mb-1">${x}</li>`).join('')}
          </ul>
          <button class="btn ${p[0] === 'Academy' ? 'btn-primary' : 'btn-outline-secondary'} btn-sm w-100" onclick="openBuy('${p[0]}')">Choose plan</button>
        </div>
      </div>
    </div>`).join('');
}

const bpEl = $('#bp');
if (bpEl) {
  bpEl.innerHTML = plans.map(p => `<option value="${p[0]}">${p[1]} – ${p[2]}</option>`).join('');
}

let buyModal;
function openBuy(p) {
  $('#bp').value = p;
  $('#bf').hidden = false;
  $('#bd').hidden = true;
  if (!buyModal) buyModal = new bootstrap.Modal($('#buyModal'));
  buyModal.show();
}
function submitBuy() {
  if (!$('#bs').value || !$('#bn').value) return T('Please fill in school name and email');
  $('#ref').textContent = 'LW-' + Math.floor(100000 + Math.random() * 900000);
  $('#bf').hidden = true;
  $('#bd').hidden = false;
}

/* ========== Login / Roles ========== */
const R = [
  ['student', 'Student'],
  ['teacher', 'Teacher'],
  ['parent', 'Parent'],
  ['principal', 'Principal']
];

function drawRoles() {
  const el = $('#roles');
  if (!el) return;
  el.innerHTML = R.map(r =>
    `<div class="col-6 col-sm-3">
      <button type="button" class="role-btn w-100 ${state.role === r[0] ? 'active' : ''}" onclick="state.role='${r[0]}';drawRoles()">${r[1]}</button>
    </div>`
  ).join('');
}
drawRoles();

/* Role-based navigation. Only tabs listed here can be opened by that role. */
const NAV = {
  student: [
    { k: 'home', ico: 'bi-house', label: 'Home' },
    { k: 'subj', ico: 'bi-journal-bookmark', label: 'My Courses' },
    { k: 'todo', ico: 'bi-check2-square', label: 'To-Do' },
    { k: 'exams', ico: 'bi-file-earmark-richtext', label: 'Assessments' },
    { k: 'disc', ico: 'bi-chat-dots', label: 'Discussions' },
    { k: 'cal', ico: 'bi-calendar3', label: 'Calendar' },
    { k: 'msg', ico: 'bi-envelope', label: 'Messages' },
    { k: 'res', ico: 'bi-folder2-open', label: 'Resources' },
    { k: 'up', ico: 'bi-cloud-upload', label: 'Submit Work' },
    { k: 'quiz', ico: 'bi-pencil-square', label: 'Practice Quiz' },
    { k: 'alerts', ico: 'bi-bell', label: 'Notifications' }
  ],
  teacher: [
    { k: 'home', ico: 'bi-house', label: 'Home' },
    { k: 'cls', ico: 'bi-collection', label: 'My Classes' },
    { k: 'exams', ico: 'bi-file-earmark-richtext', label: 'Assessments' },
    { k: 'recent', ico: 'bi-megaphone', label: 'Recent Posts' },
    { k: 'disc', ico: 'bi-chat-dots', label: 'Discussions' },
    { k: 'cal', ico: 'bi-calendar3', label: 'Calendar' },
    { k: 'msg', ico: 'bi-envelope', label: 'Messages' },
    { k: 'res', ico: 'bi-folder2-open', label: 'Resources' },
    { k: 'grades', ico: 'bi-bar-chart', label: 'Grade Center' }
  ],
  parent: [
    { k: 'home', ico: 'bi-house', label: 'Home' },
    { k: 'rad', ico: 'bi-speedometer2', label: 'Progress' },
    { k: 'sf9', ico: 'bi-file-earmark-text', label: 'Report Card' },
    { k: 'cal', ico: 'bi-calendar3', label: 'Calendar' },
    { k: 'msg', ico: 'bi-envelope', label: 'Messages' }
  ],
  principal: [
    { k: 'home', ico: 'bi-house', label: 'Home' },
    { k: 'ops', ico: 'bi-graph-up', label: 'Operations' },
    { k: 'comp', ico: 'bi-clipboard-check', label: 'Compliance' },
    { k: 'lic', ico: 'bi-key', label: 'Licenses' },
    { k: 'msg', ico: 'bi-envelope', label: 'Messages' }
  ]
};

/* Human-readable names per role. */
const USER_NAMES = {
  student: 'Ana Dela Cruz',
  teacher: 'Mrs. Santos',
  parent: 'Mr. Santos',
  principal: 'Dr. Reyes'
};

/* Which role the currently logged-in user is (for ownership checks). */
const isRole = r => state.role === r;
const isTeacher = () => isRole('teacher');
const isStudent = () => isRole('student');
const isParent = () => isRole('parent');
const isPrincipal = () => isRole('principal');

/* Check that a tab is allowed for the current role. */
function tabAllowed(k) {
  if (k === 'take') return isStudent(); // students only take exams
  return (NAV[state.role] || []).some(n => n.k === k);
}

function doLogin() {
  if (!state.role) state.role = 'student';
  state.cls = null;
  state.subj = null;
  state.ct = 'stream';
  state.st = 'all';
  state.fresh = [];
  state.discId = null;
  state.msgThread = null;
  state.examId = null;
  state.examEdit = null;
  state.examReview = false;

  view('dash');
  const roleLabel = R.find(r => r[0] === state.role)[1];
  $('#userName').textContent = USER_NAMES[state.role];
  $('#userRole').textContent = roleLabel;
  $('#av').textContent = USER_NAMES[state.role].charAt(0);

  // Parent child switcher only for parents
  const kidEl = $('#kid');
  if (kidEl) {
    kidEl.hidden = !isParent();
    if (isParent()) {
      state.kid = 0;
      kidEl.value = '0';
    }
  }

  buildSideNav();
  const qel = $('#quarter');
  if (qel) qel.value = state.quarter;
  tab('home');
  updateNotifBadge();
}

function buildSideNav() {
  const el = $('#sideNav');
  if (!el) return;
  const items = NAV[state.role] || [];
  el.innerHTML = items.map(n =>
    `<a href="#" class="nav-link ${state.tab === n.k ? 'active' : ''}" onclick="tab('${n.k}');return false">
      <i class="bi ${n.ico}"></i> ${n.label}
    </a>`
  ).join('');
}

function tab(k) {
  if (!tabAllowed(k)) {
    T('Access denied for your role');
    return;
  }
  state.tab = k;
  toggleSide(false);
  buildSideNav();
  $$('.panel').forEach(p => p.hidden = true);
  const panel = $('#p-' + k);
  if (panel) panel.hidden = false;

  const renderers = {
    home: rHome,
    cls: rCls,
    recent: rRecent,
    subj: rSubj,
    todo: rTodo,
    alerts: rAlerts,
    disc: rDisc,
    cal: rCal,
    msg: rMsg,
    res: rRes,
    grades: rGrades,
    exams: rExams,
    take: rTake,
    rad: () => renderParent(),
    sf9: () => { renderParent(); initSig(); },
    quiz: drawQuiz,
    ops: rOps,
    comp: rComp,
    lic: rLic,
    up: () => {}
  };
  (renderers[k] || (() => {}))();
  updateNotifBadge();
}

function onSearch(q) {
  if (!q.trim()) return;
  T('Search: "' + q.trim() + '" (demo)');
}

function setQuarter(q) {
  state.quarter = q;
  const el = $('#quarter');
  if (el) el.value = q;
  if (!$('#dash').hidden) tab(state.tab);
  T('Switched to ' + q + ' · S.Y. 2026–2027');
}

/* ========== Shared utilities ========== */
const day = n => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const dayLabel = d => {
  const n = days(d);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n === -1) return 'Yesterday';
  return d;
};
const days = d => Math.round((new Date(d) - new Date(day(0))) / 864e5);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const empty = m => `<div class="card"><div class="card-body text-center text-secondary py-4">${m}</div></div>`;

/* ========== Seed data ========== */
const seed = () => ({
  classes: [
    { id: 'm1', subj: 'Mathematics', sec: '7-Rizal', ico: 'MA', col: '#1B2A4A', t: 'Mrs. Santos', teacherRole: 'teacher' },
    { id: 'm2', subj: 'Mathematics', sec: '7-Bonifacio', ico: 'MA', col: '#1B2A4A', t: 'Mrs. Santos', teacherRole: 'teacher' },
    { id: 's1', subj: 'Science', sec: '7-Rizal', ico: 'SC', col: '#059669', t: 'Mrs. Santos', teacherRole: 'teacher' },
    { id: 'e1', subj: 'English', sec: '7-Rizal', ico: 'EN', col: '#2563EB', t: 'Mrs. Villanueva', teacherRole: 'teacher' },
    { id: 'f1', subj: 'Filipino', sec: '7-Rizal', ico: 'FL', col: '#7C3AED', t: 'Mr. Aquino', teacherRole: 'teacher' },
    { id: 'a1', subj: 'Araling Panlipunan', sec: '7-Rizal', ico: 'AP', col: '#D97706', t: 'Ms. Castillo', teacherRole: 'teacher' }
  ],
  items: [
    { id: 1, cid: 'm1', type: 'homework', title: 'Worksheet 5: Fractions', body: 'Answer items 1–20 in your notebook. Show your solutions.', due: day(1), at: Date.now() - 9e6 },
    { id: 2, cid: 'm1', type: 'announcement', title: 'Quiz on Friday', body: 'Bring a calculator and pencil. Covers Chapters 3–4.', at: Date.now() - 8e6 },
    { id: 3, cid: 's1', type: 'task', title: 'Plant Growth Project', body: 'Submit photos of your plant every week for 4 weeks.', due: day(0), at: Date.now() - 7e6 },
    { id: 4, cid: 'e1', type: 'task', title: 'Essay: My Hero', body: 'Write 300 words about someone you admire. Use proper MLA format.', due: day(5), at: Date.now() - 6e6 },
    { id: 5, cid: 'f1', type: 'announcement', title: 'Buwan ng Wika Practice', body: 'Rehearsal at the gym after class. Wear school uniform.', at: Date.now() - 5e6 },
    { id: 6, cid: 'a1', type: 'homework', title: 'Map of Luzon', body: 'Label all provinces. Use colored pencils.', due: day(3), at: Date.now() - 4e6 },
    { id: 7, cid: 's1', type: 'homework', title: 'Lab Report: Density', body: 'Complete the lab worksheet from yesterday\'s experiment.', due: day(2), at: Date.now() - 3e6 }
  ],
  discussions: [
    {
      id: 1, cid: 's1', title: 'Why do leaves change color?', author: 'Ana Dela Cruz', at: Date.now() - 2e7,
      body: 'I noticed the mango leaves near our house are turning yellow. Is it the same process as in temperate countries?',
      replies: [
        { author: 'Mrs. Santos', body: 'Great observation! In tropical climates it is often related to water stress or nutrient deficiency rather than seasons.', at: Date.now() - 1.5e7 },
        { author: 'Miguel Reyes', body: 'We learned about chlorophyll breakdown last week. Maybe the same?', at: Date.now() - 1e7 }
      ]
    },
    {
      id: 2, cid: 'm1', title: 'Help with fractions word problems', author: 'Sofia Garcia', at: Date.now() - 3e7,
      body: 'Anyone have a tip for converting mixed numbers faster?',
      replies: [
        { author: 'Mrs. Santos', body: 'Try the "keep-change-flip" method for division, and always simplify before multiplying.', at: Date.now() - 2.5e7 }
      ]
    },
    {
      id: 3, cid: 'e1', title: 'Book recommendations for essay', author: 'Jose Lopez', at: Date.now() - 4e7,
      body: 'Looking for short stories about Filipino heroes for the My Hero essay.',
      replies: []
    }
  ],
  messages: [
    { id: 1, from: 'Mrs. Villanueva', to: 'Ana Dela Cruz', subj: 'Essay deadline extension', body: 'Hi Ana, you may submit the essay until Monday. Let me know if you need help with the outline.', at: Date.now() - 5e6, read: false },
    { id: 2, from: 'Ana Dela Cruz', to: 'Mrs. Santos', subj: 'Question about Worksheet 5', body: 'Ma\'am, for item 12, should we reduce to lowest terms?', at: Date.now() - 8e6, read: true },
    { id: 3, from: 'School Admin', to: 'Mr. Santos', subj: 'Parent-Teacher Conference', body: 'PTC is scheduled for Oct 25. Please confirm attendance via the parent portal.', at: Date.now() - 1e7, read: false },
    { id: 4, from: 'Dr. Reyes', to: 'Mrs. Santos', subj: 'Lesson log reminder', body: 'Please submit your Q3 lesson logs before Friday.', at: Date.now() - 2e6, read: false }
  ],
  resources: [
    { id: 1, cid: 'm1', title: 'Fractions Reference Sheet', type: 'PDF', size: '240 KB', at: day(-5) },
    { id: 2, cid: 's1', title: 'Plant Growth Rubric', type: 'DOCX', size: '85 KB', at: day(-3) },
    { id: 3, cid: 'e1', title: 'MLA Citation Guide', type: 'PDF', size: '310 KB', at: day(-10) },
    { id: 4, cid: 's1', title: 'Lab Safety Video', type: 'MP4', size: '12 MB', at: day(-7) },
    { id: 5, cid: 'a1', title: 'Philippine Map (printable)', type: 'PNG', size: '1.2 MB', at: day(-2) }
  ],
  events: [
    { date: day(0), title: 'Plant Growth photos due', type: 'due' },
    { date: day(1), title: 'Fractions Worksheet due', type: 'due' },
    { date: day(2), title: 'Lab Report due', type: 'due' },
    { date: day(3), title: 'Map of Luzon due', type: 'due' },
    { date: day(5), title: 'Essay: My Hero due', type: 'due' },
    { date: day(4), title: 'Science Quiz – Chapter 2', type: 'quiz' },
    { date: day(7), title: 'Buwan ng Wika Showcase', type: 'event' },
    { date: day(11), title: 'Parent-Teacher Conference', type: 'event' }
  ],
  exams: [
    {
      id: 1, title: 'Mathematics Quarterly Exam – Fractions & Decimals',
      quarter: 'Q3', cids: ['m1', 'm2'], owner: 'Mrs. Santos',
      duration: 45, points: 50,
      instructions: 'Answer all items. Show solutions for problem-solving questions when applicable.',
      published: true, at: Date.now() - 2e6,
      questions: [
        { id: 1, type: 'mc', prompt: 'What is 3/4 + 1/2?', choices: ['5/4', '1', '5/6', '7/8'], answer: 0, pts: 5 },
        { id: 2, type: 'mc', prompt: '0.25 as a fraction in lowest terms is…', choices: ['1/2', '1/4', '2/5', '3/10'], answer: 1, pts: 5 },
        { id: 3, type: 'mc', prompt: 'Which is greater: 2/3 or 3/5?', choices: ['2/3', '3/5', 'They are equal', 'Cannot tell'], answer: 0, pts: 5 },
        { id: 4, type: 'tf', prompt: 'All improper fractions are greater than 1.', answer: true, pts: 5 },
        { id: 5, type: 'mc', prompt: 'Simplify 12/18.', choices: ['2/3', '3/4', '4/6', '6/9'], answer: 0, pts: 5 }
      ]
    },
    {
      id: 2, title: 'Science – Photosynthesis Check',
      quarter: 'Q3', cids: ['s1'], owner: 'Mrs. Santos',
      duration: 20, points: 20,
      instructions: 'Multiple choice. One answer per item.',
      published: true, at: Date.now() - 1e6,
      questions: [
        { id: 1, type: 'mc', prompt: 'What gas do plants absorb during photosynthesis?', choices: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Helium'], answer: 1, pts: 5 },
        { id: 2, type: 'mc', prompt: 'The green pigment in leaves is called…', choices: ['Carotene', 'Chlorophyll', 'Xanthophyll', 'Melanin'], answer: 1, pts: 5 },
        { id: 3, type: 'tf', prompt: 'Photosynthesis occurs only at night.', answer: false, pts: 5 },
        { id: 4, type: 'mc', prompt: 'The main product of photosynthesis used by the plant for energy is…', choices: ['Water', 'Glucose', 'Salt', 'Protein'], answer: 1, pts: 5 }
      ]
    },
    {
      id: 3, title: 'English – Reading Comprehension (Draft)',
      quarter: 'Q3', cids: ['e1'], owner: 'Mrs. Villanueva',
      duration: 30, points: 30,
      instructions: 'Draft — not yet published to students.',
      published: false, at: Date.now() - 5e5,
      questions: [
        { id: 1, type: 'mc', prompt: 'The main idea of a paragraph is…', choices: ['The first word', 'The central point', 'A supporting detail', 'The title only'], answer: 1, pts: 10 }
      ]
    }
  ],
  examSubs: {},
  examN: 10,
  done: {},
  read: {},
  grades: {},
  n: 20,
  discN: 10,
  msgN: 10
});

let DB;
(function () {
  try { DB = JSON.parse(localStorage.getItem('learningWheel_db_v6')); } catch (e) {}
  if (!DB || !DB.items) DB = seed();
  if (!DB.exams) { const s = seed(); DB.exams = s.exams; DB.examSubs = s.examSubs || {}; DB.examN = s.examN || 10; save(); }
  if (!DB.examSubs) DB.examSubs = {};
  if (!DB.grades) DB.grades = {};
})();
const save = () => { try { localStorage.setItem('learningWheel_db_v6', JSON.stringify(DB)); } catch (e) {} };

function resetDB() {
  DB = seed();
  save();
  T('Demo data reset');
  if (!$('#dash').hidden) tab(state.tab);
}

const cls = id => DB.classes.find(c => c.id == id);

/* Teachers own classes where c.t === their name. */
const myClasses = () => DB.classes.filter(c => c.t === USER_NAMES.teacher);

/* Students are enrolled in section 7-Rizal (demo scope). */
const mySec = '7-Rizal';
const studentClasses = () => DB.classes.filter(c => c.sec === mySec);

/* Parents see data for the currently selected child. */
const kids = [
  { id: 'k1', n: 'Maria Santos', g: 'Grade 7', sec: '7-Rizal', gen: 92, pend: 1, att: 98, lrn: '136745120001' },
  { id: 'k2', n: 'Juan Santos', g: 'Grade 7', sec: '7-Rizal', gen: 78, pend: 3, att: 92, lrn: '136745120002' },
  { id: 'k3', n: 'Pedro Santos', g: 'Grade 7', sec: '7-Rizal', gen: 72, pend: 6, att: 85, lrn: '136745120003' }
];

const TYPE = { task: 'Task', homework: 'Homework', announcement: 'Announcement' };
const isT = i => i.type !== 'announcement';

/* Items visible to the logged-in user. */
function visibleItems() {
  if (isStudent()) return DB.items.filter(i => cls(i.cid) && cls(i.cid).sec === mySec);
  if (isTeacher()) return DB.items.filter(i => cls(i.cid) && cls(i.cid).t === USER_NAMES.teacher);
  if (isParent()) return DB.items.filter(i => cls(i.cid) && cls(i.cid).sec === kids[state.kid].sec);
  return DB.items;
}

const sItems = () => visibleItems().slice().sort((a, b) => b.at - a.at);

function unread() {
  if (isStudent()) {
    return sItems().filter(i => !DB.read[i.id]).length +
           DB.messages.filter(m => m.to === USER_NAMES.student && !m.read).length;
  }
  if (isTeacher()) {
    return DB.messages.filter(m => m.to === USER_NAMES.teacher && !m.read).length;
  }
  if (isParent()) {
    return DB.messages.filter(m => m.to === USER_NAMES.parent && !m.read).length;
  }
  if (isPrincipal()) {
    return DB.messages.filter(m => m.to === USER_NAMES.principal && !m.read).length;
  }
  return 0;
}

function updateNotifBadge() {
  const n = unread();
  const b = $('#notifBadge');
  if (b) { b.textContent = n; b.hidden = n === 0; }
}

function stat(i) {
  if (DB.done[i.id]) return ['border-success', 'Done'];
  if (!i.due) return ['border-warning', 'No due date'];
  const n = days(i.due);
  return [n <= 2 ? 'border-danger' : 'border-warning', n < 0 ? 'Overdue' : n === 0 ? 'Due today' : 'Due in ' + n + ' day' + (n > 1 ? 's' : '')];
}

const chips = (i, subj) =>
  `<span class="chip">${TYPE[i.type]}</span>` +
  (subj && cls(i.cid) ? `<span class="chip" style="background:${cls(i.cid).col};color:#fff">${cls(i.cid).subj} ${cls(i.cid).sec}</span>` : '');

/* ========== Student: Home ========== */
function rHome() {
  const el = $('#p-home');
  if (!el) return;
  if (isStudent()) return rHomeStudent(el);
  if (isTeacher()) return rHomeTeacher(el);
  if (isParent()) return rHomeParent(el);
  if (isPrincipal()) return rHomePrincipal(el);
}

function rHomeStudent(el) {
  const todo = sItems().filter(i => isT(i) && !DB.done[i.id]);
  const urgent = todo.filter(i => i.due && days(i.due) <= 2).length;
  const msgs = DB.messages.filter(m => m.to === USER_NAMES.student && !m.read).length;
  const courses = studentClasses();
  el.innerHTML = `
    <div class="dash-hero">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h1 class="h4 mb-1">Welcome back, Ana</h1>
          <p class="text-secondary small mb-0">Here is what is happening in your classes today.</p>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-outline-secondary btn-sm" onclick="tab('todo')"><i class="bi bi-check2-square me-1"></i>To-Do</button>
          <button class="btn btn-primary btn-sm" onclick="tab('subj')"><i class="bi bi-journal-bookmark me-1"></i>Courses</button>
        </div>
      </div>
    </div>
    <div class="row g-3 mb-4">
      <div class="col-6 col-xl-3"><div class="card stat-card h-100"><div class="card-body">
        <div class="d-flex justify-content-between align-items-start"><div class="stat-label">To-Do</div><i class="bi bi-check2-square text-secondary"></i></div>
        <div class="stat-value">${todo.length}</div>
        <div class="text-secondary small">${urgent} urgent</div>
      </div></div></div>
      <div class="col-6 col-xl-3"><div class="card stat-card h-100"><div class="card-body">
        <div class="d-flex justify-content-between align-items-start"><div class="stat-label">Unread</div><i class="bi bi-bell text-secondary"></i></div>
        <div class="stat-value">${unread()}</div>
        <div class="text-secondary small">alerts & messages</div>
      </div></div></div>
      <div class="col-6 col-xl-3"><div class="card stat-card h-100"><div class="card-body">
        <div class="d-flex justify-content-between align-items-start"><div class="stat-label">Courses</div><i class="bi bi-journal-bookmark text-secondary"></i></div>
        <div class="stat-value">${courses.length}</div>
        <div class="text-secondary small">active this term</div>
      </div></div></div>
      <div class="col-6 col-xl-3"><div class="card stat-card h-100"><div class="card-body">
        <div class="d-flex justify-content-between align-items-start"><div class="stat-label">Messages</div><i class="bi bi-envelope text-secondary"></i></div>
        <div class="stat-value">${msgs}</div>
        <div class="text-secondary small">unread</div>
      </div></div></div>
    </div>
    <div class="row g-3">
      <div class="col-xl-7"><div class="card h-100"><div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2 class="h6 mb-0"><i class="bi bi-clock me-1"></i>Upcoming due dates</h2>
          <button class="btn btn-link btn-sm px-0" onclick="tab('todo')">View all</button>
        </div>
        ${todo.slice(0, 5).map(i => sItem(i, 1, 1)).join('') || empty('Nothing due soon.')}
      </div></div></div>
      <div class="col-xl-5"><div class="card h-100"><div class="card-body">
        <h2 class="h6 mb-3"><i class="bi bi-activity me-1"></i>Recent activity</h2>
        ${sItems().slice(0, 6).map(i => `
          <div class="d-flex gap-2 py-2 border-bottom align-items-center">
            <div class="course-badge" style="background:${cls(i.cid).col}">${cls(i.cid).ico}</div>
            <div class="min-w-0 flex-grow-1">
              <div class="fw-semibold small text-truncate">${esc(i.title)}</div>
              <div class="text-secondary" style="font-size:0.75rem">${cls(i.cid).subj} · ${TYPE[i.type]} · ${dayLabel(new Date(i.at).toISOString().slice(0,10))}</div>
            </div>
          </div>`).join('') || empty('No activity yet.')}
      </div></div></div>
    </div>
    <h2 class="h6 mt-4 mb-3"><i class="bi bi-journal-bookmark me-1"></i>Your courses</h2>
    <div class="row g-3">${courses.map(c => {
      const it = DB.items.filter(i => i.cid == c.id);
      const p = it.filter(i => isT(i) && !DB.done[i.id]).length;
      return `<div class="col-sm-6 col-lg-4 col-xxl-3">
        <button class="course-tile" style="border-top:3px solid ${c.col}" onclick="openSubj('${c.id}')">
          <div class="d-flex align-items-center gap-2 mb-2">
            <div class="course-badge" style="background:${c.col}">${c.ico}</div>
            <div class="min-w-0"><div class="fw-semibold small text-truncate">${c.subj}</div>
            <div class="text-secondary" style="font-size:0.75rem">${c.t}</div></div>
          </div>
          <span class="badge text-bg-light text-secondary border">${p} to do</span>
        </button>
      </div>`;
    }).join('')}</div>`;
}

function rHomeTeacher(el) {
  const posts = DB.items.filter(i => cls(i.cid) && cls(i.cid).t === USER_NAMES.teacher);
  const myClassesArr = myClasses();
  el.innerHTML = `
    <div class="dash-hero">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h1 class="h4 mb-1">Teacher dashboard</h1>
          <p class="text-secondary small mb-0">Manage classes, post work, and track progress.</p>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-outline-secondary btn-sm" onclick="tab('disc')"><i class="bi bi-chat-dots me-1"></i>Discussions</button>
          <button class="btn btn-primary btn-sm" onclick="tab('cls')"><i class="bi bi-plus-lg me-1"></i>Post to class</button>
        </div>
      </div>
    </div>
    <div class="row g-3 mb-4">
      <div class="col-6 col-xl-3"><div class="card stat-card h-100"><div class="card-body">
        <div class="d-flex justify-content-between"><div class="stat-label">Classes</div><i class="bi bi-collection text-secondary"></i></div>
        <div class="stat-value">${myClassesArr.length}</div>
      </div></div></div>
      <div class="col-6 col-xl-3"><div class="card stat-card h-100"><div class="card-body">
        <div class="d-flex justify-content-between"><div class="stat-label">Posts</div><i class="bi bi-megaphone text-secondary"></i></div>
        <div class="stat-value">${posts.length}</div>
      </div></div></div>
      <div class="col-6 col-xl-3"><div class="card stat-card h-100"><div class="card-body">
        <div class="d-flex justify-content-between"><div class="stat-label">Discussions</div><i class="bi bi-chat-dots text-secondary"></i></div>
        <div class="stat-value">${DB.discussions.filter(d => cls(d.cid) && cls(d.cid).t === USER_NAMES.teacher).length}</div>
      </div></div></div>
      <div class="col-6 col-xl-3"><div class="card stat-card h-100"><div class="card-body">
        <div class="d-flex justify-content-between"><div class="stat-label">Learners</div><i class="bi bi-people text-secondary"></i></div>
        <div class="stat-value">${stu.length * myClassesArr.length}</div>
      </div></div></div>
    </div>
    <div class="row g-3">
      <div class="col-xl-4"><div class="card h-100"><div class="card-body">
        <h2 class="h6 mb-3"><i class="bi bi-lightning me-1"></i>Quick actions</h2>
        <div class="d-grid gap-2">
          <button class="btn btn-primary btn-sm text-start" onclick="tab('cls')"><i class="bi bi-collection me-2"></i>Open a class</button>
          <button class="btn btn-outline-secondary btn-sm text-start" onclick="tab('grades')"><i class="bi bi-bar-chart me-2"></i>Grade Center</button>
          <button class="btn btn-outline-secondary btn-sm text-start" onclick="tab('disc')"><i class="bi bi-chat-dots me-2"></i>Discussions</button>
          <button class="btn btn-outline-secondary btn-sm text-start" onclick="tab('res')"><i class="bi bi-folder2-open me-2"></i>Resources</button>
        </div>
      </div></div></div>
      <div class="col-xl-8"><div class="card h-100"><div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2 class="h6 mb-0"><i class="bi bi-megaphone me-1"></i>Recent posts</h2>
          <button class="btn btn-link btn-sm px-0" onclick="tab('recent')">View all</button>
        </div>
        ${posts.slice(0, 5).map(i => tItem(i, 1)).join('') || empty('No posts yet.')}
      </div></div></div>
    </div>
    <h2 class="h6 mt-4 mb-3"><i class="bi bi-collection me-1"></i>Your classes</h2>
    <div class="row g-3">${myClassesArr.map(c =>
      `<div class="col-sm-6 col-lg-4 col-xxl-3">
        <button class="course-tile" style="border-top:3px solid ${c.col}" onclick="openCls('${c.id}')">
          <div class="d-flex align-items-center gap-2 mb-2">
            <div class="course-badge" style="background:${c.col}">${c.ico}</div>
            <div class="min-w-0"><div class="fw-semibold small">${c.subj}</div>
            <div class="text-secondary" style="font-size:0.75rem">${c.sec} · ${stu.length} learners</div></div>
          </div>
          <span class="badge text-bg-light text-secondary border">${DB.items.filter(i => i.cid == c.id).length} posts</span>
        </button>
      </div>`
    ).join('')}</div>`;
}

function rHomeParent(el) {
  const k = kids[state.kid];
  el.innerHTML = `
    <div class="dash-hero">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h1 class="h4 mb-1">Parent home</h1>
          <p class="text-secondary small mb-0">Overview for ${k.n} · ${k.g}</p>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-outline-secondary btn-sm" onclick="tab('msg')"><i class="bi bi-envelope me-1"></i>Messages</button>
          <button class="btn btn-primary btn-sm" onclick="tab('sf9')"><i class="bi bi-file-earmark-text me-1"></i>Report card</button>
        </div>
      </div>
    </div>
    <div class="row g-3 mb-4">
      <div class="col-md-4"><div class="card stat-card h-100"><div class="card-body">
        <div class="d-flex justify-content-between"><div class="stat-label">General average</div><i class="bi bi-mortarboard text-secondary"></i></div>
        <div class="stat-value">${k.gen}</div>
        <div class="text-secondary small">${k.gen >= 85 ? 'On track' : k.gen >= 75 ? 'Watch closely' : 'Needs help'}</div>
      </div></div></div>
      <div class="col-md-4"><div class="card stat-card h-100"><div class="card-body">
        <div class="d-flex justify-content-between"><div class="stat-label">Pending tasks</div><i class="bi bi-list-task text-secondary"></i></div>
        <div class="stat-value">${k.pend}</div>
      </div></div></div>
      <div class="col-md-4"><div class="card stat-card h-100"><div class="card-body">
        <div class="d-flex justify-content-between"><div class="stat-label">Attendance</div><i class="bi bi-calendar-check text-secondary"></i></div>
        <div class="stat-value">${k.att}%</div>
      </div></div></div>
    </div>
    <div class="row g-3">
      <div class="col-lg-6"><div class="card h-100"><div class="card-body">
        <h2 class="h6 mb-3"><i class="bi bi-lightning me-1"></i>Quick links</h2>
        <div class="d-grid gap-2">
          <button class="btn btn-primary btn-sm text-start" onclick="tab('rad')"><i class="bi bi-speedometer2 me-2"></i>Full progress</button>
          <button class="btn btn-outline-secondary btn-sm text-start" onclick="tab('sf9')"><i class="bi bi-file-earmark-text me-2"></i>Report card (SF9)</button>
          <button class="btn btn-outline-secondary btn-sm text-start" onclick="tab('cal')"><i class="bi bi-calendar3 me-2"></i>Calendar</button>
          <button class="btn btn-outline-secondary btn-sm text-start" onclick="tab('msg')"><i class="bi bi-envelope me-2"></i>Messages</button>
        </div>
      </div></div></div>
      <div class="col-lg-6"><div class="card h-100"><div class="card-body">
        <h2 class="h6 mb-3"><i class="bi bi-info-circle me-1"></i>About this portal</h2>
        <p class="text-secondary small mb-0">Track grades, attendance, and pending work for each child. Switch children from the top bar when available. Approve report cards digitally from the Report Card tab.</p>
      </div></div></div>
    </div>`;
}

function rHomePrincipal(el) {
  el.innerHTML = `
    <div class="dash-hero">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h1 class="h4 mb-1">Principal dashboard</h1>
          <p class="text-secondary small mb-0">School-wide operations at a glance.</p>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-outline-secondary btn-sm" onclick="tab('comp')"><i class="bi bi-clipboard-check me-1"></i>Compliance</button>
          <button class="btn btn-primary btn-sm" onclick="tab('ops')"><i class="bi bi-graph-up me-1"></i>Operations</button>
        </div>
      </div>
    </div>
    <div class="row g-3 mb-4">
      <div class="col-6 col-xl-3"><div class="card stat-card h-100"><div class="card-body">
        <div class="d-flex justify-content-between"><div class="stat-label">Enrollment</div><i class="bi bi-people text-secondary"></i></div>
        <div class="stat-value">1,120</div>
      </div></div></div>
      <div class="col-6 col-xl-3"><div class="card stat-card h-100"><div class="card-body">
        <div class="d-flex justify-content-between"><div class="stat-label">Avg GPA</div><i class="bi bi-mortarboard text-secondary"></i></div>
        <div class="stat-value">82.3</div>
      </div></div></div>
      <div class="col-6 col-xl-3"><div class="card stat-card h-100"><div class="card-body">
        <div class="d-flex justify-content-between"><div class="stat-label">Attendance</div><i class="bi bi-calendar-check text-secondary"></i></div>
        <div class="stat-value">93.5%</div>
      </div></div></div>
      <div class="col-6 col-xl-3"><div class="card stat-card h-100"><div class="card-body">
        <div class="d-flex justify-content-between"><div class="stat-label">License</div><i class="bi bi-key text-secondary"></i></div>
        <div class="stat-value">75%</div>
        <div class="text-secondary small">750 / 1000</div>
      </div></div></div>
    </div>
    <div class="row g-3">
      <div class="col-lg-4"><div class="card h-100"><div class="card-body">
        <h2 class="h6 mb-3"><i class="bi bi-lightning me-1"></i>Quick links</h2>
        <div class="d-grid gap-2">
          <button class="btn btn-primary btn-sm text-start" onclick="tab('ops')"><i class="bi bi-graph-up me-2"></i>Operations</button>
          <button class="btn btn-outline-secondary btn-sm text-start" onclick="tab('comp')"><i class="bi bi-clipboard-check me-2"></i>Compliance ledger</button>
          <button class="btn btn-outline-secondary btn-sm text-start" onclick="tab('lic')"><i class="bi bi-key me-2"></i>Licenses & billing</button>
          <button class="btn btn-outline-secondary btn-sm text-start" onclick="tab('msg')"><i class="bi bi-envelope me-2"></i>Messages</button>
        </div>
      </div></div></div>
      <div class="col-lg-8"><div class="card h-100"><div class="card-body">
        <h2 class="h6 mb-3"><i class="bi bi-info-circle me-1"></i>At a glance</h2>
        <p class="text-secondary small mb-0">Monitor enrollment, academic performance, attendance, and license utilization. Use Compliance to review teacher assignment and lesson-log status across the school.</p>
      </div></div></div>
    </div>`;
}

/* ========== Student item rendering ========== */
function sItem(i, subj, noBtn) {
  const s = stat(i);
  const un = !DB.read[i.id] || (state.fresh || []).includes(i.id);
  const canToggle = isStudent(); // only students mark their own work done
  return `<div class="task-item ${isT(i) ? s[0] : 'border-info'}">
    <div class="flex-grow-1 min-w-0">
      ${chips(i, subj)}${un ? '<span class="chip chip-new">New</span>' : ''}
      <div class="fw-semibold small">${esc(i.title)}</div>
      <div class="text-secondary small">${esc(i.body)}</div>
      ${isT(i) ? `<div class="text-secondary small mt-1"><strong>${s[1]}</strong>${i.due ? ' · ' + i.due : ''}</div>` : ''}
    </div>
    ${isT(i) && !noBtn && canToggle ? `<button class="btn ${DB.done[i.id] ? 'btn-outline-secondary' : 'btn-success'} btn-sm flex-shrink-0" onclick="tog(${i.id})">${DB.done[i.id] ? 'Undo' : 'Mark done'}</button>` : ''}
  </div>`;
}

function tog(id) {
  if (!isStudent()) return T('Only students can update their own to-do');
  DB.done[id] = !DB.done[id];
  save();
  tab(state.tab);
}

function openSubj(id) {
  if (!isStudent() && !isParent()) return T('Access denied');
  const c = cls(id);
  if (!c) return;
  // Students can only open classes in their section
  if (isStudent() && c.sec !== mySec) return T('Access denied');
  state.subj = id;
  state.st = 'all';
  if (isStudent()) {
    state.fresh = DB.items.filter(i => i.cid == id && !DB.read[i.id]).map(i => i.id);
    DB.items.forEach(i => { if (i.cid == id) DB.read[i.id] = 1; });
    save();
  }
  updateNotifBadge();
  tab('subj');
}

function rSubj() {
  if (!isStudent()) return T('Access denied');
  const el = $('#p-subj');
  if (!el) return;
  if (!state.subj) {
    state.fresh = [];
    el.innerHTML = `<h1 class="h4 mb-1">My courses</h1>
      <p class="text-secondary small mb-4">Select a subject to see tasks, homework, and announcements.</p>
      <div class="row g-3">${studentClasses().map(c => {
        const it = DB.items.filter(i => i.cid == c.id);
        const p = it.filter(i => isT(i) && !DB.done[i.id]).length;
        const u = it.filter(i => !DB.read[i.id]).length;
        return `<div class="col-md-6 col-lg-4">
          <button class="card h-100 w-100 text-start border-0 shadow-sm" style="border-top:3px solid ${c.col}!important" onclick="openSubj('${c.id}')">
            <div class="card-body">
              <div class="course-badge mb-2" style="background:${c.col}">${c.ico}</div>
              <h3 class="h6 mb-1">${c.subj}</h3>
              <p class="text-secondary small mb-2">${c.t}</p>
              <span class="badge text-bg-warning">${p} to do</span>
              ${u ? ` <span class="badge text-bg-danger">${u} new</span>` : ''}
            </div>
          </button>
        </div>`;
      }).join('')}</div>`;
    return;
  }
  const c = cls(state.subj);
  const all = DB.items.filter(i => i.cid == c.id).sort((a, b) => b.at - a.at);
  const f = state.st === 'todo' ? all.filter(isT) : state.st === 'ann' ? all.filter(i => !isT(i)) : all;
  el.innerHTML = `
    <button class="btn btn-link btn-sm px-0 mb-2" onclick="state.subj=null;tab('subj')">← All courses</button>
    <div class="card mb-3" style="border-left:3px solid ${c.col}">
      <div class="card-body py-3">
        <h1 class="h5 mb-0">${c.subj}</h1>
        <div class="text-secondary small">Teacher: ${c.t} · Grade ${c.sec}</div>
      </div>
    </div>
    <ul class="nav nav-pills mb-3 gap-1">
      ${[['all', 'All'], ['todo', 'To-Do'], ['ann', 'Announcements']].map(t =>
        `<li class="nav-item"><button class="nav-link ${state.st === t[0] ? 'active' : ''}" style="${state.st === t[0] ? 'background:var(--lw-primary)' : ''}" onclick="state.st='${t[0]}';tab('subj')">${t[1]}</button></li>`
      ).join('')}
    </ul>
    ${f.map(i => sItem(i)).join('') || empty('Nothing here yet.')}`;
}

function rTodo() {
  if (!isStudent()) return T('Access denied');
  const l = sItems().filter(isT).sort((a, b) => (!!DB.done[a.id] - !!DB.done[b.id]) || (a.due > b.due ? 1 : -1));
  const el = $('#p-todo');
  if (!el) return;
  el.innerHTML = `<h1 class="h4 mb-1">My to-do</h1>
    <p class="text-secondary small mb-4">Left border: urgent · later · done</p>
    ${l.map(i => sItem(i, 1)).join('') || empty('No tasks yet. You are all caught up.')}`;
}

function rAlerts() {
  if (!isStudent()) return T('Access denied');
  const el = $('#p-alerts');
  if (!el) return;
  const u = sItems().filter(i => !DB.read[i.id]);
  const um = DB.messages.filter(m => m.to === USER_NAMES.student && !m.read);
  el.innerHTML = `<h1 class="h4 mb-3">Notifications</h1>
    ${u.length || um.length
      ? `<button class="btn btn-outline-secondary btn-sm mb-3" onclick="markAllRead()">Mark all as read</button>
         ${um.map(m => `<div class="task-item border-info" style="cursor:pointer" onclick="tab('msg')">
           <div class="flex-grow-1"><span class="chip chip-new">Msg</span>
           <div class="fw-semibold small">${esc(m.subj)}</div>
           <div class="text-secondary small">From ${esc(m.from)}</div></div></div>`).join('')}
         ${u.map(i => `<div style="cursor:pointer" onclick="state.tab='subj';openSubj('${i.cid}')">${sItem(i, 1, 1)}</div>`).join('')}`
      : empty('You are all caught up.')}`;
}

function markAllRead() {
  if (!isStudent()) return T('Access denied');
  sItems().forEach(i => DB.read[i.id] = 1);
  DB.messages.forEach(m => { if (m.to === USER_NAMES.student) m.read = true; });
  save();
  tab('alerts');
}

/* ========== Teacher ========== */
const stu = ['Dela Cruz, Ana', 'Reyes, Miguel', 'Garcia, Sofia', 'Lopez, Jose', 'Tan, Bea'];
const base = [[42, 45, 38], [30, 35, 25], [48, 50, 46], [20, 28, 22], [38, 40, 30]];
const G = id => DB.grades[id] || (DB.grades[id] = base.map((r, i) => r.map(v => Math.max(0, Math.min(50, v + ((id.charCodeAt(1) + i) % 5) - 2)))));
function tr(ig) { return ig >= 60 ? 75 + Math.floor((ig - 60) / 1.6) : 60 + Math.floor(ig / 4); }

function calc(i) {
  if (!isTeacher()) return;
  const r = $$(`[data-r="${i}"]`).map(x => Math.min(50, Math.max(0, +x.value || 0)));
  G(state.cls)[i] = r; save();
  const ig = r[0] / 50 * 40 + r[1] / 50 * 40 + r[2] / 50 * 20;
  const g = tr(ig);
  const ii = $('#i' + i); if (ii) ii.textContent = ig.toFixed(2);
  const o = $('#t' + i); if (o) { o.textContent = g; o.className = 'fw-bold ' + (g >= 85 ? 'text-success' : g >= 75 ? '' : 'text-warning'); }
}

function tItem(i, showCls) {
  const n = (i.id * 3) % 6;
  const canDelete = isTeacher() && cls(i.cid) && cls(i.cid).t === USER_NAMES.teacher;
  return `<div class="task-item ${isT(i) ? 'border-warning' : 'border-info'}">
    <div class="flex-grow-1 min-w-0">
      ${chips(i)}${showCls ? `<span class="chip" style="background:${cls(i.cid).col};color:#fff">${cls(i.cid).subj} · ${cls(i.cid).sec}</span>` : ''}
      <div class="fw-semibold small">${esc(i.title)}</div>
      <div class="text-secondary small">${esc(i.body)}</div>
      <div class="text-secondary small mt-1">${isT(i) ? `Due ${i.due || '—'} · Submitted ${n}/${stu.length}` : 'Visible to all learners'}</div>
    </div>
    ${canDelete ? `<button class="btn btn-outline-secondary btn-sm flex-shrink-0" onclick="del(${i.id})">Delete</button>` : ''}
  </div>`;
}

function del(id) {
  if (!isTeacher()) return T('Access denied');
  const it = DB.items.find(i => i.id == id);
  if (!it) return;
  const c = cls(it.cid);
  if (!c || c.t !== USER_NAMES.teacher) return T('You can only delete your own posts');
  DB.items = DB.items.filter(i => i.id != id);
  save();
  tab(state.tab);
  T('Post deleted');
}

function openCls(id) {
  if (!isTeacher()) return T('Access denied');
  const c = cls(id);
  if (!c || c.t !== USER_NAMES.teacher) return T('You can only open your own classes');
  state.cls = id;
  state.ct = 'stream';
  tab('cls');
}

function post(cid) {
  if (!isTeacher()) return T('Access denied');
  const c = cls(cid);
  if (!c || c.t !== USER_NAMES.teacher) return T('Access denied');
  const t = $('#ptl').value.trim();
  if (!t) return T('Please enter a title');
  const ids = [cid, ...$$('.xc:checked').map(x => x.value).filter(id => { const cc = cls(id); return cc && cc.t === USER_NAMES.teacher; })];
  const ty = $('#pt').value;
  ids.forEach(id => DB.items.push({
    id: DB.n++, cid: id, type: ty, title: t,
    body: $('#pb').value.trim(), due: ty === 'announcement' ? '' : $('#pd').value, at: Date.now()
  }));
  save();
  state.ct = 'stream';
  tab('cls');
  T(`Posted to ${ids.length} class${ids.length > 1 ? 'es' : ''}`);
}

function rCls() {
  if (!isTeacher()) return T('Access denied');
  const el = $('#p-cls');
  if (!el) return;
  if (!state.cls) {
    el.innerHTML = `<h1 class="h4 mb-1">My classes</h1>
      <p class="text-secondary small mb-4">Select a class to post tasks, homework, and announcements.</p>
      <div class="row g-3">${myClasses().map(c =>
        `<div class="col-md-6 col-lg-4">
          <button class="card h-100 w-100 text-start border-0 shadow-sm" style="border-top:3px solid ${c.col}!important" onclick="openCls('${c.id}')">
            <div class="card-body">
              <div class="course-badge mb-2" style="background:${c.col}">${c.ico}</div>
              <h3 class="h6 mb-1">${c.subj}</h3>
              <p class="text-secondary small mb-2">Grade ${c.sec} · ${stu.length} learners</p>
              <span class="badge text-bg-secondary">${DB.items.filter(i => i.cid == c.id).length} posts</span>
            </div>
          </button>
        </div>`
      ).join('')}</div>`;
    return;
  }
  const c = cls(state.cls);
  if (!c || c.t !== USER_NAMES.teacher) { state.cls = null; return rCls(); }
  const ct = state.ct;
  let body = '';
  if (ct === 'stream') {
    body = DB.items.filter(i => i.cid == c.id).sort((a, b) => b.at - a.at).map(i => tItem(i)).join('') || empty('No posts yet. Use Post new.');
  } else if (ct === 'post') {
    body = `<div class="card"><div class="card-body">
      <h2 class="h6 mb-3">Post to ${c.subj} · ${c.sec}</h2>
      <div class="mb-3"><label class="form-label small fw-semibold" for="pt">Type</label>
        <select class="form-select form-select-sm" id="pt"><option value="task">Task</option><option value="homework">Homework</option><option value="announcement">Announcement</option></select></div>
      <div class="mb-3"><label class="form-label small fw-semibold" for="ptl">Title</label>
        <input class="form-control form-control-sm" id="ptl" placeholder="e.g. Chapter 3 Reading"></div>
      <div class="mb-3"><label class="form-label small fw-semibold" for="pb">Details</label>
        <textarea class="form-control form-control-sm" id="pb" rows="3" placeholder="Instructions for learners"></textarea></div>
      <div class="mb-3"><label class="form-label small fw-semibold" for="pd">Due date (tasks & homework)</label>
        <input type="date" class="form-control form-control-sm" id="pd" value="${day(3)}"></div>
      <label class="form-label small fw-semibold">Also post to my other classes</label>
      ${myClasses().filter(x => x.id != c.id).map(x =>
        `<div class="form-check"><input class="form-check-input xc" type="checkbox" value="${x.id}" id="xc${x.id}">
         <label class="form-check-label small" for="xc${x.id}">${x.subj} · ${x.sec}</label></div>`
      ).join('')}
      <button class="btn btn-primary btn-sm mt-3" onclick="post('${c.id}')">Post</button>
    </div></div>`;
  } else {
    body = `<div class="card"><div class="card-body">
      <h2 class="h6">Gradebook (DepEd Order 8, s. 2015)</h2>
      <p class="text-secondary small">WW 40% · PT 40% · Exam 20%. Type a raw score to recalculate.</p>
      <div class="table-responsive"><table class="table table-sm align-middle">
        <thead><tr><th>Learner</th><th>WW /50</th><th>PT /50</th><th>Exam /50</th><th>Initial</th><th>Grade</th></tr></thead>
        <tbody>${G(c.id).map((r, i) =>
          `<tr><td>${stu[i]}</td>${r.map(v =>
            `<td><input type="number" class="form-control form-control-sm" min="0" max="50" data-r="${i}" value="${v}" oninput="calc(${i})" aria-label="score"></td>`
          ).join('')}<td id="i${i}"></td><td id="t${i}"></td></tr>`
        ).join('')}</tbody>
      </table></div>
      <button class="btn btn-outline-secondary btn-sm mt-2" onclick="toast('SF9/SF10 report cards exported (simulated)')">Export SF9/SF10</button>
    </div></div>`;
  }
  el.innerHTML = `
    <button class="btn btn-link btn-sm px-0 mb-2" onclick="state.cls=null;tab('cls')">← All classes</button>
    <div class="card mb-3" style="border-left:3px solid ${c.col}">
      <div class="card-body py-3">
        <h1 class="h5 mb-0">${c.subj} · ${c.sec}</h1>
        <div class="text-secondary small">${stu.length} learners</div>
      </div>
    </div>
    <ul class="nav nav-pills mb-3 gap-1">
      ${[['stream', 'Stream'], ['post', 'Post new'], ['grade', 'Gradebook']].map(t =>
        `<li class="nav-item"><button class="nav-link ${ct === t[0] ? 'active' : ''}" style="${ct === t[0] ? 'background:var(--lw-primary)' : ''}" onclick="state.ct='${t[0]}';tab('cls')">${t[1]}</button></li>`
      ).join('')}
    </ul>
    ${body}`;
  if (ct === 'grade') G(c.id).forEach((_, i) => calc(i));
}

function rRecent() {
  if (!isTeacher()) return T('Access denied');
  const l = DB.items.filter(i => cls(i.cid) && cls(i.cid).t === USER_NAMES.teacher).sort((a, b) => b.at - a.at);
  const el = $('#p-recent');
  if (!el) return;
  el.innerHTML = `<h1 class="h4 mb-1">Recent posts</h1>
    <p class="text-secondary small mb-4">Everything you posted across all classes.</p>
    ${l.map(i => tItem(i, 1)).join('') || empty('No posts yet.')}`;
}

function rGrades() {
  if (!isTeacher()) return T('Access denied');
  const el = $('#p-grades');
  if (!el) return;
  el.innerHTML = `<h1 class="h4 mb-1">Grade Center</h1>
    <p class="text-secondary small mb-4">Select a class to open its gradebook.</p>
    <div class="row g-3">${myClasses().map(c =>
      `<div class="col-md-6 col-lg-4">
        <button class="card h-100 w-100 text-start border-0 shadow-sm" style="border-top:3px solid ${c.col}!important" onclick="state.cls='${c.id}';state.ct='grade';tab('cls')">
          <div class="card-body">
            <div class="course-badge mb-2" style="background:${c.col}">${c.ico}</div>
            <h3 class="h6 mb-1">${c.subj}</h3>
            <p class="text-secondary small mb-0">${c.sec} · ${stu.length} learners</p>
          </div>
        </button>
      </div>`
    ).join('')}</div>`;
}

/* ========== Discussions ========== */
function rDisc() {
  if (!isStudent() && !isTeacher()) return T('Access denied');
  const el = $('#p-disc');
  if (!el) return;
  if (state.discId) {
    const d = DB.discussions.find(x => x.id == state.discId);
    if (!d) { state.discId = null; return rDisc(); }
    const c = cls(d.cid);
    if (isStudent() && c && c.sec !== mySec) { state.discId = null; return rDisc(); }
    el.innerHTML = `
      <button class="btn btn-link btn-sm px-0 mb-2" onclick="state.discId=null;tab('disc')">← All discussions</button>
      <div class="card"><div class="card-body">
        <span class="chip" style="background:${c.col};color:#fff">${c.subj}</span>
        <h1 class="h5 mt-2">${esc(d.title)}</h1>
        <div class="text-secondary small mb-3">${esc(d.author)} · ${new Date(d.at).toLocaleDateString()}</div>
        <p>${esc(d.body)}</p>
        <h2 class="h6 mt-4">Replies (${d.replies.length})</h2>
        ${d.replies.map(r => `
          <div class="disc-reply">
            <div class="fw-semibold small">${esc(r.author)}</div>
            <div class="text-secondary" style="font-size:0.75rem">${new Date(r.at).toLocaleDateString()}</div>
            <p class="mb-0 mt-1 small">${esc(r.body)}</p>
          </div>`).join('') || '<p class="text-secondary small">No replies yet.</p>'}
        <div class="mt-3">
          <label class="form-label small fw-semibold" for="replyBody">Your reply</label>
          <textarea class="form-control form-control-sm" id="replyBody" rows="2" placeholder="Write a reply…"></textarea>
          <button class="btn btn-primary btn-sm mt-2" onclick="postReply(${d.id})">Post reply</button>
        </div>
      </div></div>`;
    return;
  }
  const discList = DB.discussions.filter(d => {
    const c = cls(d.cid);
    if (!c) return false;
    if (isStudent()) return c.sec === mySec;
    if (isTeacher()) return c.t === USER_NAMES.teacher;
    return false;
  }).sort((a, b) => b.at - a.at);
  const courseOpts = isTeacher() ? myClasses() : studentClasses();
  el.innerHTML = `<h1 class="h4 mb-1">Discussions</h1>
    <p class="text-secondary small mb-4">Class forums — ask questions, share ideas, help classmates.</p>
    <div class="card mb-4"><div class="card-body">
      <h2 class="h6 mb-3">Start a new discussion</h2>
      <div class="mb-2"><label class="form-label small fw-semibold" for="dt">Title</label>
        <input class="form-control form-control-sm" id="dt" placeholder="e.g. Help with Chapter 4"></div>
      <div class="mb-2"><label class="form-label small fw-semibold" for="db">Message</label>
        <textarea class="form-control form-control-sm" id="db" rows="2" placeholder="What would you like to discuss?"></textarea></div>
      <div class="mb-2"><label class="form-label small fw-semibold" for="dc">Course</label>
        <select class="form-select form-select-sm" id="dc">${courseOpts.map(c =>
          `<option value="${c.id}">${c.subj} · ${c.sec}</option>`
        ).join('')}</select></div>
      <button class="btn btn-primary btn-sm" onclick="newDisc()">Post discussion</button>
    </div></div>
    ${discList.map(d => {
      const c = cls(d.cid);
      return `<div class="card mb-2" style="cursor:pointer" onclick="state.discId=${d.id};tab('disc')">
        <div class="card-body py-3 d-flex gap-2">
          <div class="course-badge" style="background:${c ? c.col : '#6C757D'}">${c ? c.ico : 'Di'}</div>
          <div class="min-w-0">
            <div class="fw-semibold small">${esc(d.title)}</div>
            <div class="text-secondary" style="font-size:0.75rem">${c ? c.subj : ''} · ${esc(d.author)} · ${d.replies.length} ${d.replies.length === 1 ? 'reply' : 'replies'}</div>
            <div class="text-secondary small mt-1 text-truncate">${esc(d.body)}</div>
          </div>
        </div>
      </div>`;
    }).join('') || empty('No discussions yet.')}`;
}

function newDisc() {
  if (!isStudent() && !isTeacher()) return T('Access denied');
  const t = $('#dt').value.trim();
  const b = $('#db').value.trim();
  if (!t || !b) return T('Please enter title and message');
  DB.discussions.unshift({
    id: DB.discN++, cid: $('#dc').value, title: t, body: b,
    author: USER_NAMES[state.role], at: Date.now(), replies: []
  });
  save();
  tab('disc');
  T('Discussion posted');
}

function postReply(id) {
  if (!isStudent() && !isTeacher()) return T('Access denied');
  const b = $('#replyBody').value.trim();
  if (!b) return T('Please write a reply');
  const d = DB.discussions.find(x => x.id == id);
  if (!d) return;
  d.replies.push({ author: USER_NAMES[state.role], body: b, at: Date.now() });
  save();
  tab('disc');
  T('Reply posted');
}

/* ========== Calendar ========== */
function rCal() {
  const el = $('#p-cal');
  if (!el) return;
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const first = new Date(y, m, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const todayStr = day(0);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const evMap = {};
  DB.events.forEach(e => { if (!evMap[e.date]) evMap[e.date] = []; evMap[e.date].push(e); });
  let cells = '';
  for (let i = 0; i < startDay; i++) cells += '<div class="cal-day"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const has = !!evMap[ds];
    const isToday = ds === todayStr;
    cells += `<div class="cal-day${isToday ? ' today' : ''}${has ? ' has-ev' : ''}" title="${has ? evMap[ds].map(e => e.title).join(', ') : ''}">${d}</div>`;
  }
  const upcoming = DB.events.filter(e => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8);
  el.innerHTML = `<h1 class="h4 mb-1">Calendar</h1>
    <p class="text-secondary small mb-4">Due dates, quizzes, and school events.</p>
    <div class="row g-3">
      <div class="col-lg-6">
        <div class="card"><div class="card-body">
          <h2 class="h6 mb-3">${monthNames[m]} ${y}</h2>
          <div class="cal-grid">
            ${['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => `<div class="cal-hd">${d}</div>`).join('')}
            ${cells}
          </div>
        </div></div>
      </div>
      <div class="col-lg-6">
        <div class="card"><div class="card-body">
          <h2 class="h6 mb-3">Upcoming</h2>
          ${upcoming.map(e => `
            <div class="d-flex gap-2 py-2 border-bottom">
              <div class="feed-avatar">${e.type === 'due' ? 'Due' : e.type === 'quiz' ? 'Quiz' : 'Evt'}</div>
              <div>
                <div class="fw-semibold small">${esc(e.title)}</div>
                <div class="text-secondary" style="font-size:0.75rem">${dayLabel(e.date)} · ${e.date}</div>
              </div>
            </div>`).join('') || empty('No upcoming events.')}
        </div></div>
      </div>
    </div>`;
}

/* ========== Messages ========== */
function rMsg() {
  const el = $('#p-msg');
  if (!el) return;
  const me = USER_NAMES[state.role];
  if (!isStudent() && !isTeacher() && !isParent() && !isPrincipal()) return T('Access denied');

  if (state.msgThread != null) {
    const m = DB.messages.find(x => x.id == state.msgThread);
    if (!m) { state.msgThread = null; return rMsg(); }
    if (m.from !== me && m.to !== me) { state.msgThread = null; return rMsg(); }
    m.read = true; save(); updateNotifBadge();
    el.innerHTML = `
      <button class="btn btn-link btn-sm px-0 mb-2" onclick="state.msgThread=null;tab('msg')">← Inbox</button>
      <div class="card"><div class="card-body">
        <h1 class="h5">${esc(m.subj)}</h1>
        <div class="text-secondary small mb-3">From: ${esc(m.from)} · To: ${esc(m.to)} · ${new Date(m.at).toLocaleString()}</div>
        <p style="white-space:pre-wrap">${esc(m.body)}</p>
        <hr>
        <label class="form-label small fw-semibold" for="replyMsg">Reply</label>
        <textarea class="form-control form-control-sm" id="replyMsg" rows="2" placeholder="Type your reply…"></textarea>
        <button class="btn btn-primary btn-sm mt-2" onclick="sendReply(${m.id})">Send reply</button>
      </div></div>`;
    return;
  }

  const list = DB.messages.filter(m => m.from === me || m.to === me).sort((a, b) => b.at - a.at);

  let recipients = [];
  if (isStudent()) recipients = ['Mrs. Santos', 'Mrs. Villanueva', 'Mr. Aquino', 'Ms. Castillo', 'School Admin'];
  else if (isTeacher()) recipients = ['Ana Dela Cruz', 'Miguel Reyes', 'Sofia Garcia', 'Dr. Reyes', 'School Admin'];
  else if (isParent()) recipients = ['Mrs. Santos', 'Mrs. Villanueva', 'School Admin'];
  else if (isPrincipal()) recipients = ['Mrs. Santos', 'Mrs. Villanueva', 'Mr. Aquino', 'Ms. Castillo', 'School Admin'];

  el.innerHTML = `<h1 class="h4 mb-1">Messages</h1>
    <p class="text-secondary small mb-4">Private messages with teachers, students, parents, and school staff.</p>
    <div class="card mb-4"><div class="card-body">
      <h2 class="h6 mb-3">Compose</h2>
      <div class="mb-2"><label class="form-label small fw-semibold" for="msgTo">To</label>
        <select class="form-select form-select-sm" id="msgTo">
          ${recipients.map(r => `<option>${r}</option>`).join('')}
        </select></div>
      <div class="mb-2"><label class="form-label small fw-semibold" for="msgSubj">Subject</label>
        <input class="form-control form-control-sm" id="msgSubj" placeholder="Subject"></div>
      <div class="mb-2"><label class="form-label small fw-semibold" for="msgBody">Message</label>
        <textarea class="form-control form-control-sm" id="msgBody" rows="2" placeholder="Write your message…"></textarea></div>
      <button class="btn btn-primary btn-sm" onclick="sendMsg()">Send</button>
    </div></div>
    <h2 class="h6 mb-2">Inbox</h2>
    ${list.map(m => `
      <div class="card mb-2" style="cursor:pointer" onclick="state.msgThread=${m.id};tab('msg')">
        <div class="card-body py-3 d-flex gap-2">
          <div class="feed-avatar">${m.read ? 'Rd' : 'New'}</div>
          <div class="min-w-0">
            <div class="fw-semibold small">${esc(m.subj)} ${!m.read && m.to === me ? '<span class="chip chip-new">New</span>' : ''}</div>
            <div class="text-secondary" style="font-size:0.75rem">${esc(m.from)} → ${esc(m.to)} · ${new Date(m.at).toLocaleDateString()}</div>
          </div>
        </div>
      </div>`).join('') || empty('No messages.')}`;
}

function sendMsg() {
  const me = USER_NAMES[state.role];
  const subj = $('#msgSubj').value.trim();
  const body = $('#msgBody').value.trim();
  if (!subj || !body) return T('Please fill subject and message');
  DB.messages.unshift({
    id: DB.msgN++, from: me, to: $('#msgTo').value,
    subj, body, at: Date.now(), read: true
  });
  save();
  tab('msg');
  T('Message sent');
}

function sendReply(id) {
  const me = USER_NAMES[state.role];
  const body = $('#replyMsg').value.trim();
  if (!body) return T('Please write a reply');
  const m = DB.messages.find(x => x.id == id);
  if (!m) return;
  if (m.from !== me && m.to !== me) return T('Access denied');
  DB.messages.unshift({
    id: DB.msgN++, from: me, to: m.from === me ? m.to : m.from,
    subj: 'Re: ' + m.subj, body, at: Date.now(), read: true
  });
  save();
  state.msgThread = null;
  tab('msg');
  T('Reply sent');
}

/* ========== Resources ========== */
function rRes() {
  const el = $('#p-res');
  if (!el) return;
  if (!isStudent() && !isTeacher()) return T('Access denied');
  const list = isTeacher()
    ? DB.resources.filter(r => cls(r.cid) && cls(r.cid).t === USER_NAMES.teacher)
    : DB.resources.filter(r => cls(r.cid) && cls(r.cid).sec === mySec);
  el.innerHTML = `<h1 class="h4 mb-1">Resources</h1>
    <p class="text-secondary small mb-4">Course files, handouts, and media shared by teachers.</p>
    ${isTeacher() ? `
      <div class="card mb-4"><div class="card-body">
        <h2 class="h6 mb-3">Upload resource (demo)</h2>
        <div class="mb-2"><label class="form-label small fw-semibold" for="rt">Title</label>
          <input class="form-control form-control-sm" id="rt" placeholder="e.g. Chapter 5 Notes"></div>
        <div class="mb-2"><label class="form-label small fw-semibold" for="rc">Course</label>
          <select class="form-select form-select-sm" id="rc">${myClasses().map(c => `<option value="${c.id}">${c.subj} · ${c.sec}</option>`).join('')}</select></div>
        <div class="mb-2"><label class="form-label small fw-semibold" for="rtype">Type</label>
          <select class="form-select form-select-sm" id="rtype"><option>PDF</option><option>DOCX</option><option>PPTX</option><option>MP4</option><option>PNG</option></select></div>
        <button class="btn btn-primary btn-sm" onclick="addRes()">Add resource</button>
      </div></div>` : ''}
    <div class="row g-3">${list.map(r => {
      const c = cls(r.cid);
      return `<div class="col-md-6 col-lg-4">
        <div class="card h-100"><div class="card-body">
          <div class="feed-avatar mb-2">${r.type === 'PDF' ? 'PDF' : r.type === 'MP4' ? 'VID' : r.type === 'PNG' ? 'IMG' : 'FILE'}</div>
          <h3 class="h6 mb-1">${esc(r.title)}</h3>
          <div class="text-secondary small">${c ? c.subj : ''} · ${r.type} · ${r.size}</div>
          <div class="text-secondary" style="font-size:0.75rem">Added ${r.at}</div>
          <button class="btn btn-outline-secondary btn-sm mt-2" onclick="toast('Download started (demo)')">Download</button>
        </div></div>
      </div>`;
    }).join('') || `<div class="col-12">${empty('No resources yet.')}</div>`}</div>`;
}

function addRes() {
  if (!isTeacher()) return T('Access denied');
  const t = $('#rt').value.trim();
  if (!t) return T('Please enter a title');
  const cid = $('#rc').value;
  const c = cls(cid);
  if (!c || c.t !== USER_NAMES.teacher) return T('Access denied');
  DB.resources.unshift({
    id: Date.now(), cid, title: t,
    type: $('#rtype').value, size: Math.floor(50 + Math.random() * 500) + ' KB', at: day(0)
  });
  save();
  tab('res');
  T('Resource added');
}

/* ========== Student extras ========== */
function compress() {
  if (!isStudent()) return T('Access denied');
  const b = $('#cb');
  b.disabled = true;
  let p = 0;
  const iv = setInterval(() => {
    p += 4;
    $('#pb').style.width = p + '%';
    const mb = 5000 - (4850 * p / 100);
    $('#sz').textContent = mb > 1000 ? (mb / 1000).toFixed(1) + ' MB' : Math.round(mb) + ' KB';
    $('#pm').textContent = 'Compressing… ' + p + '%';
    if (p >= 100) {
      clearInterval(iv);
      $('#pm').textContent = '5 MB → 150 KB. Submitted.';
      b.disabled = false;
      T('Submitted using 97% less data');
    }
  }, 90);
}

const Q = [
  ['What gas do plants absorb?', ['Oxygen', 'Carbon dioxide', 'Helium']],
  ['Which planet is closest to the Sun?', ['Mercury', 'Venus', 'Mars']],
  ['Water boils at…', ['50°C', '100°C', '150°C']]
];
const ans = [1, 0, 1];
let qa = {};
function load() { try { qa = JSON.parse(localStorage.getItem('learningWheel_quiz') || '{}'); } catch (e) { qa = {}; } }
function pick(q, o) {
  if (!isStudent()) return T('Access denied');
  qa[q] = o;
  try { localStorage.setItem('learningWheel_quiz', JSON.stringify(qa)); } catch (e) {}
  T('Answer saved');
}
function drawQuiz() {
  if (!isStudent()) return T('Access denied');
  const el = $('#qz');
  if (!el) return;
  el.innerHTML = Q.map((q, i) =>
    `<div class="mb-3"><div class="fw-semibold small mb-2">${i + 1}. ${q[0]}</div>
      ${q[1].map((o, j) =>
        `<div class="form-check"><input class="form-check-input" type="radio" name="q${i}" id="q${i}_${j}" ${qa[i] === j ? 'checked' : ''} onclick="pick(${i},${j})">
         <label class="form-check-label small" for="q${i}_${j}">${o}</label></div>`
      ).join('')}</div>`
  ).join('');
}
function brownout() {
  if (!isStudent()) return T('Access denied');
  $('#qz').innerHTML = '<p class="text-danger fw-semibold">Power lost… restarting</p>';
  qa = {};
  setTimeout(() => {
    load(); drawQuiz();
    $('#qm').textContent = 'Recovered ' + Object.keys(qa).length + ' saved answer(s) from this device.';
  }, 1200);
}
function gradeQuiz() {
  if (!isStudent()) return T('Access denied');
  $('#qm').textContent = 'Score: ' + ans.filter((a, i) => qa[i] === a).length + ' / 3';
}
load();

/* ========== Parent ========== */
const col = (v, a, b) => v >= a ? 'success' : v >= b ? 'warning' : 'danger';

function renderParent() {
  if (!isParent()) return T('Access denied');
  const k = kids[state.kid];
  if ($('#kn')) $('#kn').textContent = k.n + ' · ' + k.g;
  const L = [
    ['General average', k.gen, col(k.gen, 85, 75), k.gen >= 85 ? 'On track' : k.gen >= 75 ? 'Watch closely' : 'Needs help'],
    ['Pending tasks', k.pend, col(-k.pend, -2, -4), k.pend + ' to finish'],
    ['Attendance', k.att + '%', col(k.att, 95, 90), k.att >= 95 ? 'Excellent' : k.att >= 90 ? 'Some absences' : 'Too many absences']
  ];
  if ($('#tl')) {
    $('#tl').innerHTML = L.map(l =>
      `<div class="col-md-4"><div class="card"><div class="card-body d-flex align-items-center gap-3">
        <span class="rounded-circle bg-${l[2]}" style="width:10px;height:10px;flex-shrink:0"></span>
        <div><div class="small text-secondary">${l[0]}</div><div class="fs-5 fw-bold">${l[1]}</div>
        <div class="text-secondary small">${l[3]}</div></div>
      </div></div></div>`
    ).join('');
  }
  const s = ['Filipino', 'English', 'Math', 'Science', 'Araling Panlipunan'];
  if ($('#sf')) {
    $('#sf').innerHTML = `<p class="small"><strong>${k.n}</strong> · ${k.g} · LRN ${k.lrn} · S.Y. 2026–2027</p>
      <div class="table-responsive"><table class="table table-sm">
        <thead><tr><th>Subject</th><th>Q1</th><th>Q2</th><th>Final</th></tr></thead>
        <tbody>${s.map((x, i) => {
          const a = Math.min(100, k.gen + [2, -3, 4, -1, 0][i]);
          return `<tr><td>${x}</td><td>${a - 1}</td><td>${a + 1 > 100 ? 100 : a + 1}</td><td class="fw-bold">${a}</td></tr>`;
        }).join('')}
        <tr><th>General average</th><th></th><th></th><th>${k.gen}</th></tr>
      </tbody></table></div>`;
  }
  if ($('#ap')) $('#ap').textContent = '';
}

/* Signature */
let drawing = false;
function initSig() {
  if (!isParent()) return;
  const c = $('#sig');
  if (!c) return;
  c.width = c.clientWidth;
  c.height = 130;
  const x = c.getContext('2d');
  x.lineWidth = 3; x.lineCap = 'round'; x.strokeStyle = '#1B2A4A';
  const pos = e => { const r = c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  c.onpointerdown = e => { drawing = true; x.beginPath(); x.moveTo(...pos(e)); };
  c.onpointermove = e => { if (drawing) { x.lineTo(...pos(e)); x.stroke(); } };
  c.onpointerup = () => drawing = false;
}
function clearSig() {
  if (!isParent()) return;
  const c = $('#sig');
  if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height);
}
function approve(m) {
  if (!isParent()) return T('Access denied');
  $('#ap').textContent = kids[state.kid].n + "'s report card approved via " + m + ' · ' + new Date().toLocaleDateString();
  T('Report card approved');
}

/* ========== Principal: Operations ========== */
function rOps() {
  if (!isPrincipal()) return T('Access denied');
  const el = $('#p-ops');
  if (!el) return;
  el.innerHTML = `
    <div class="dash-hero">
      <div>
        <h1 class="h4 mb-1"><i class="bi bi-graph-up me-1"></i>Operations</h1>
        <p class="text-secondary small mb-0">School-wide enrollment, performance, and attendance.</p>
      </div>
    </div>
    <div class="row g-3">
      <div class="col-md-4"><div class="card"><div class="card-body"><h3 class="h6">Enrollment by grade</h3><div id="c1"></div></div></div></div>
      <div class="col-md-4"><div class="card"><div class="card-body"><h3 class="h6">Average GPA</h3><div id="c2"></div></div></div></div>
      <div class="col-md-4"><div class="card"><div class="card-body"><h3 class="h6">Attendance %</h3><div id="c3"></div></div></div></div>
    </div>
    <div class="card mt-3"><div class="card-body">
      <h3 class="h6 mb-3">Enrollment trend (last 5 school years)</h3>
      <div id="c4"></div>
    </div></div>`;
  bars('#c1', [['Gr 7', 310], ['Gr 8', 285], ['Gr 9', 270], ['Gr 10', 255]], 320, '', '#1B2A4A');
  bars('#c2', [['Gr 7', 84], ['Gr 8', 82], ['Gr 9', 80], ['Gr 10', 83]], 100, '', '#059669');
  bars('#c3', [['Gr 7', 96], ['Gr 8', 94], ['Gr 9', 91], ['Gr 10', 93]], 100, '%', '#D97706');
  bars('#c4', [['SY22', 1010], ['SY23', 1055], ['SY24', 1080], ['SY25', 1105], ['SY26', 1120]], 1200, '', '#2563EB');
}

function bars(id, d, max, u, color) {
  const el = $(id);
  if (!el) return;
  el.innerHTML = d.map(x =>
    `<div class="bar-row"><span class="lb">${x[0]}</span>
      <div class="progress"><div class="progress-bar" style="width:${x[1] / max * 100}%;background:${color}"></div></div>
      <b class="small">${x[1]}${u}</b></div>`
  ).join('');
}

/* ========== Principal: Compliance ========== */
function rComp() {
  if (!isPrincipal()) return T('Access denied');
  const el = $('#p-comp');
  if (!el) return;
  el.innerHTML = `
    <div class="dash-hero">
      <div>
        <h1 class="h4 mb-1"><i class="bi bi-clipboard-check me-1"></i>Compliance ledger</h1>
        <p class="text-secondary small mb-0">Teacher assignment and lesson-log review status.</p>
      </div>
    </div>
    <div class="card"><div class="card-body">
      <div class="table-responsive">
        <table class="table table-sm align-middle mb-0">
          <thead><tr><th>Teacher</th><th>Assignments reviewed</th><th>Lesson logs</th><th>Status</th></tr></thead>
          <tbody id="cl"></tbody>
        </table>
      </div>
    </div></div>`;
  const clEl = $('#cl');
  if (clEl) {
    clEl.innerHTML = [
      ['Mrs. Santos', '12 of 12 reviewed', 'Up to date', 'success', 'Compliant'],
      ['Mrs. Villanueva', '12 of 12 reviewed', 'Up to date', 'success', 'Compliant'],
      ['Mr. Aquino', '8 of 11 reviewed', '2 weeks late', 'warning', 'Pending'],
      ['Ms. Castillo', '3 of 10 reviewed', 'Missing', 'danger', 'Overdue'],
      ['Mr. Ramos', '10 of 10 reviewed', 'Up to date', 'success', 'Compliant']
    ].map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td><span class="badge text-bg-${r[3]}">${r[4]}</span></td></tr>`).join('');
  }
}

/* ========== Principal: Licenses ========== */
function rLic() {
  if (!isPrincipal()) return T('Access denied');
  const el = $('#p-lic');
  if (!el) return;
  el.innerHTML = `
    <div class="dash-hero">
      <div>
        <h1 class="h4 mb-1"><i class="bi bi-key me-1"></i>Licenses & billing</h1>
        <p class="text-secondary small mb-0">Seat utilization and subscription status.</p>
      </div>
    </div>
    <div class="row g-3">
      <div class="col-md-6"><div class="card"><div class="card-body">
        <h2 class="h5">License slots</h2>
        <p class="fs-3 fw-bold mb-2">750 / 1000 filled</p>
        <div class="progress mb-2" style="height:6px"><div class="progress-bar" style="width:75%;background:var(--lw-primary)"></div></div>
        <p class="text-secondary small mb-0">250 slots remaining · 12 new learners this month</p>
      </div></div></div>
      <div class="col-md-6"><div class="card"><div class="card-body">
        <h2 class="h5">Billing</h2>
        <p><span class="badge text-bg-success">Active</span> Academy plan</p>
        <p class="text-secondary small">Renews Jun 30, 2027 · ₱79,900 / year</p>
        <button class="btn btn-outline-secondary btn-sm" onclick="toast('Invoice sent to finance@school.edu.ph')">Download invoice</button>
      </div></div></div>
    </div>`;
}

/* ========== Assessments / Exams ========== */
function mySectionIds() {
  if (isTeacher()) return myClasses().map(c => c.id);
  if (isStudent()) return studentClasses().map(c => c.id);
  return [];
}

function examsForUser() {
  if (isStudent()) {
    const ids = new Set(mySectionIds());
    return (DB.exams || []).filter(e => e.published && e.quarter === state.quarter && e.cids.some(cid => ids.has(cid))).sort((a, b) => b.at - a.at);
  }
  if (isTeacher()) {
    const ids = new Set(mySectionIds());
    return (DB.exams || []).filter(e => e.cids.some(cid => ids.has(cid))).sort((a, b) => b.at - a.at);
  }
  return [];
}

function examSubKey(examId) {
  return examId + '_' + (USER_NAMES[state.role] || 'user') + '_' + state.quarter;
}
function getSub(examId) {
  return (DB.examSubs || {})[examSubKey(examId)];
}

function rExams() {
  if (isStudent()) return rExamsStudent($('#p-exams'));
  if (isTeacher()) return rExamsTeacher($('#p-exams'));
  return T('Access denied');
}

function rExamsStudent(el) {
  if (!el) return;
  const list = examsForUser();
  el.innerHTML = `
    <div class="dash-hero">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h1 class="h4 mb-1"><i class="bi bi-file-earmark-richtext me-1"></i>Assessments</h1>
          <p class="text-secondary small mb-0">${state.quarter} · S.Y. 2026–2027 — exams and quizzes assigned to your sections</p>
        </div>
      </div>
    </div>
    ${list.length ? list.map(e => {
      const sub = getSub(e.id);
      const cnames = e.cids.map(id => { const c = cls(id); return c ? c.subj : id; }).join(', ');
      return `<div class="card mb-3"><div class="card-body">
        <div class="d-flex flex-wrap justify-content-between gap-2">
          <div>
            <span class="badge text-bg-light text-secondary border me-1">${e.quarter}</span>
            <span class="badge text-bg-primary">${e.points} pts</span>
            <span class="badge text-bg-secondary">${e.duration} min</span>
            <h2 class="h6 mt-2 mb-1">${esc(e.title)}</h2>
            <div class="text-secondary small">${cnames} · ${e.questions.length} questions</div>
          </div>
          <div class="text-end">
            ${sub
              ? `<div class="fw-bold text-success mb-1">${sub.score} / ${e.points}</div>
                 <button class="btn btn-outline-secondary btn-sm" onclick="openTake(${e.id}, true)">Review</button>`
              : `<button class="btn btn-primary btn-sm" onclick="openTake(${e.id})"><i class="bi bi-pencil me-1"></i>Take exam</button>`}
          </div>
        </div>
      </div></div>`;
    }).join('') : empty('No assessments for ' + state.quarter + ' yet.')}`;
}

function rExamsTeacher(el) {
  if (!el) return;
  if (state.examEdit === 'new') return rExamBuilder(el);
  const list = (DB.exams || []).filter(e => e.cids.some(cid => myClasses().some(c => c.id === cid))).sort((a, b) => b.at - a.at);
  el.innerHTML = `
    <div class="dash-hero">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h1 class="h4 mb-1"><i class="bi bi-file-earmark-richtext me-1"></i>Assessments</h1>
          <p class="text-secondary small mb-0">Create exams, assign to sections, publish by quarter</p>
        </div>
        <button class="btn btn-primary btn-sm" onclick="state.examEdit='new';tab('exams')"><i class="bi bi-plus-lg me-1"></i>Create assessment</button>
      </div>
    </div>
    <div class="table-responsive">
      <table class="table table-sm align-middle">
        <thead><tr><th>Title</th><th>Quarter</th><th>Sections</th><th>Items</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${list.map(e => {
            const secs = e.cids.map(id => { const c = cls(id); return c ? c.subj + ' ' + c.sec : id; }).join(', ');
            const subs = Object.keys(DB.examSubs || {}).filter(k => k.startsWith(e.id + '_')).length;
            return `<tr>
              <td><div class="fw-semibold small">${esc(e.title)}</div>
                <div class="text-secondary" style="font-size:0.75rem">${e.points} pts · ${e.duration} min · ${subs} submission(s)</div></td>
              <td><span class="badge text-bg-light border">${e.quarter}</span></td>
              <td class="small">${esc(secs)}</td>
              <td>${e.questions.length}</td>
              <td>${e.published ? '<span class="badge text-bg-success">Published</span>' : '<span class="badge text-bg-secondary">Draft</span>'}</td>
              <td class="text-nowrap">
                <button class="btn btn-outline-secondary btn-sm" onclick="togglePublish(${e.id})">${e.published ? 'Unpublish' : 'Publish'}</button>
                <button class="btn btn-outline-danger btn-sm" onclick="deleteExam(${e.id})">Delete</button>
              </td>
            </tr>`;
          }).join('') || '<tr><td colspan="6" class="text-secondary text-center py-4">No assessments yet. Create one to assign to your sections.</td></tr>'}
        </tbody>
      </table>
    </div>`;
}

function togglePublish(id) {
  if (!isTeacher()) return T('Access denied');
  const e = DB.exams.find(x => x.id == id);
  if (!e) return;
  if (!e.cids.some(cid => myClasses().some(c => c.id === cid))) return T('You can only publish your own assessments');
  e.published = !e.published;
  save();
  tab('exams');
  T(e.published ? 'Published to assigned sections' : 'Unpublished (hidden from students)');
}

function deleteExam(id) {
  if (!isTeacher()) return T('Access denied');
  const e = DB.exams.find(x => x.id == id);
  if (!e) return;
  if (!e.cids.some(cid => myClasses().some(c => c.id === cid))) return T('You can only delete your own assessments');
  DB.exams = DB.exams.filter(x => x.id != id);
  save();
  tab('exams');
  T('Assessment deleted');
}

function rExamBuilder(el) {
  if (!isTeacher()) return T('Access denied');
  const classes = myClasses();
  el.innerHTML = `
    <button class="btn btn-link btn-sm px-0 mb-2" onclick="state.examEdit=null;tab('exams')">← Back to assessments</button>
    <div class="card"><div class="card-body">
      <h1 class="h5 mb-3">Create assessment</h1>
      <div class="row g-3">
        <div class="col-md-8">
          <label class="form-label small fw-semibold">Title</label>
          <input class="form-control" id="exTitle" placeholder="e.g. Q3 Math Quarterly Exam">
        </div>
        <div class="col-md-2">
          <label class="form-label small fw-semibold">Quarter</label>
          <select class="form-select" id="exQ">
            <option value="Q1">Q1</option><option value="Q2">Q2</option>
            <option value="Q3" selected>Q3</option><option value="Q4">Q4</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label small fw-semibold">Minutes</label>
          <input type="number" class="form-control" id="exDur" value="40" min="5" max="180">
        </div>
        <div class="col-12">
          <label class="form-label small fw-semibold">Assign to sections</label>
          <div class="d-flex flex-wrap gap-3">
            ${classes.map(c => `
              <div class="form-check">
                <input class="form-check-input ex-sec" type="checkbox" value="${c.id}" id="sec_${c.id}" checked>
                <label class="form-check-label small" for="sec_${c.id}">${c.subj} · ${c.sec}</label>
              </div>`).join('') || '<span class="text-secondary small">No classes</span>'}
          </div>
        </div>
        <div class="col-12">
          <label class="form-label small fw-semibold">Instructions</label>
          <textarea class="form-control" id="exInstr" rows="2" placeholder="Instructions shown to students before they start"></textarea>
        </div>
      </div>
      <hr>
      <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
        <h2 class="h6 mb-0">Questions</h2>
        <div class="btn-group btn-group-sm">
          <button type="button" class="btn btn-outline-secondary" onclick="addExQ('mc')">+ Multiple choice</button>
          <button type="button" class="btn btn-outline-secondary" onclick="addExQ('tf')">+ True / False</button>
        </div>
      </div>
      <div id="exQuestions"></div>
      <div class="mt-3 d-flex flex-wrap gap-2">
        <button class="btn btn-primary" onclick="saveExam(true)"><i class="bi bi-send me-1"></i>Save & publish</button>
        <button class="btn btn-outline-secondary" onclick="saveExam(false)">Save as draft</button>
        <button class="btn btn-link" onclick="state.examEdit=null;tab('exams')">Cancel</button>
      </div>
    </div></div>`;
  window._exQ = [];
  addExQ('mc');
  addExQ('mc');
}

function addExQ(type) {
  if (!isTeacher()) return;
  if (!window._exQ) window._exQ = [];
  const id = Date.now() + Math.random();
  window._exQ.push({ id, type, prompt: '', choices: type === 'mc' ? ['', '', '', ''] : null, answer: type === 'tf' ? true : 0, pts: 5 });
  renderExQ();
}

function renderExQ() {
  const box = $('#exQuestions');
  if (!box) return;
  box.innerHTML = window._exQ.map((q, i) => `
    <div class="card mb-2 border"><div class="card-body py-3">
      <div class="d-flex justify-content-between mb-2">
        <span class="small fw-semibold">Item ${i + 1} · ${q.type === 'mc' ? 'Multiple choice' : 'True / False'}</span>
        <button type="button" class="btn btn-sm btn-outline-danger" onclick="window._exQ.splice(${i},1);renderExQ()">Remove</button>
      </div>
      <input class="form-control form-control-sm mb-2" placeholder="Question prompt" value="${esc(q.prompt)}" oninput="window._exQ[${i}].prompt=this.value">
      <div class="row g-2 align-items-end">
        <div class="col-auto">
          <label class="form-label small mb-0">Points</label>
          <input type="number" class="form-control form-control-sm" style="width:4.5rem" value="${q.pts}" min="1" oninput="window._exQ[${i}].pts=+this.value||1">
        </div>
        ${q.type === 'tf' ? `
        <div class="col-auto">
          <label class="form-label small mb-0">Correct answer</label>
          <select class="form-select form-select-sm" onchange="window._exQ[${i}].answer=this.value==='true'">
            <option value="true" ${q.answer === true ? 'selected' : ''}>True</option>
            <option value="false" ${q.answer === false ? 'selected' : ''}>False</option>
          </select>
        </div>` : q.choices.map((ch, j) => `
        <div class="col-md-6">
          <div class="input-group input-group-sm">
            <div class="input-group-text">
              <input class="form-check-input mt-0" type="radio" name="ans${i}" ${q.answer === j ? 'checked' : ''} onchange="window._exQ[${i}].answer=${j}" title="Mark correct">
            </div>
            <input class="form-control" placeholder="Choice ${j + 1}" value="${esc(ch)}" oninput="window._exQ[${i}].choices[${j}]=this.value">
          </div>
        </div>`).join('')}
      </div>
    </div></div>`).join('') || '<p class="text-secondary small">Add at least one question.</p>';
}

function saveExam(publish) {
  if (!isTeacher()) return T('Access denied');
  const title = ($('#exTitle') || {}).value?.trim();
  if (!title) return T('Enter a title');
  const cids = $$('.ex-sec:checked').map(x => x.value).filter(id => myClasses().some(c => c.id === id));
  if (!cids.length) return T('Select at least one section');
  const questions = (window._exQ || []).filter(q => q.prompt.trim());
  if (!questions.length) return T('Add at least one question with a prompt');
  for (const q of questions) {
    if (q.type === 'mc' && (!q.choices || q.choices.filter(c => c.trim()).length < 2))
      return T('Each multiple-choice item needs at least 2 choices');
  }
  const pts = questions.reduce((s, q) => s + (q.pts || 5), 0);
  const exam = {
    id: DB.examN++,
    title,
    quarter: $('#exQ').value,
    cids,
    owner: USER_NAMES.teacher,
    duration: +$('#exDur').value || 40,
    points: pts,
    instructions: ($('#exInstr') || {}).value?.trim() || '',
    published: !!publish,
    at: Date.now(),
    questions: questions.map((q, i) => ({
      id: i + 1,
      type: q.type,
      prompt: q.prompt.trim(),
      choices: q.type === 'mc' ? q.choices.map(c => c.trim()).filter(Boolean) : undefined,
      answer: q.answer,
      pts: q.pts || 5
    }))
  };
  DB.exams.unshift(exam);
  save();
  state.examEdit = null;
  tab('exams');
  T(publish ? 'Assessment published to ' + cids.length + ' section(s)' : 'Draft saved');
}

function openTake(id, review) {
  if (!isStudent()) return T('Access denied');
  const e = DB.exams.find(x => x.id == id);
  if (!e || !e.published) return T('This assessment is not available');
  if (!e.cids.some(cid => studentClasses().some(c => c.id === cid))) return T('This assessment is not assigned to you');
  state.examId = id;
  state.examReview = !!review;
  tab('take');
}

function rTake() {
  if (!isStudent()) return T('Access denied');
  const el = $('#p-take');
  if (!el) return;
  const e = (DB.exams || []).find(x => x.id == state.examId);
  if (!e) {
    el.innerHTML = empty('Assessment not found.') + '<button class="btn btn-link" onclick="state.examId=null;tab(\'exams\')">Back</button>';
    return;
  }
  const sub = getSub(e.id);
  const review = state.examReview || !!sub;

  if (review && sub) {
    el.innerHTML = `
      <button class="btn btn-link btn-sm px-0 mb-2" onclick="state.examId=null;tab('exams')">← Assessments</button>
      <div class="card"><div class="card-body">
        <h1 class="h5">${esc(e.title)}</h1>
        <p class="text-secondary small">${e.quarter} · Score: <strong class="text-success">${sub.score} / ${e.points}</strong> (${Math.round(100 * sub.score / e.points)}%)</p>
        ${e.questions.map((q, i) => {
          const ua = sub.answers[i];
          const ok = q.type === 'tf' ? ua === q.answer : ua === q.answer;
          return `<div class="mb-3 p-3 rounded border ${ok ? 'border-success' : 'border-danger'}">
            <div class="small fw-semibold mb-1">${i + 1}. ${esc(q.prompt)} <span class="text-secondary">(${q.pts} pts)</span></div>
            ${q.type === 'mc' ? q.choices.map((c, j) =>
              `<div class="small ${j === q.answer ? 'text-success fw-semibold' : ''} ${ua === j && j !== q.answer ? 'text-danger' : ''}">${ua === j ? '→ ' : ''}${esc(c)}${j === q.answer ? ' ✓' : ''}</div>`
            ).join('') : `<div class="small">Your answer: <strong>${ua === true ? 'True' : ua === false ? 'False' : '—'}</strong> · Correct: ${q.answer ? 'True' : 'False'}</div>`}
          </div>`;
        }).join('')}
      </div></div>`;
    return;
  }

  el.innerHTML = `
    <button class="btn btn-link btn-sm px-0 mb-2" onclick="state.examId=null;tab('exams')">← Assessments</button>
    <div class="card"><div class="card-body">
      <div class="d-flex flex-wrap justify-content-between gap-2 mb-3">
        <div>
          <h1 class="h5 mb-1">${esc(e.title)}</h1>
          <p class="text-secondary small mb-0">${e.quarter} · ${e.questions.length} items · ${e.points} points · ${e.duration} minutes</p>
        </div>
        <span class="badge text-bg-light border align-self-start">${state.quarter}</span>
      </div>
      ${e.instructions ? `<p class="small border-start border-3 ps-2 mb-3">${esc(e.instructions)}</p>` : ''}
      <div id="takeBody">
        ${e.questions.map((q, i) => `
          <div class="mb-4">
            <div class="fw-semibold small mb-2">${i + 1}. ${esc(q.prompt)} <span class="text-secondary">(${q.pts} pts)</span></div>
            ${q.type === 'mc' ? q.choices.map((c, j) => `
              <div class="form-check">
                <input class="form-check-input" type="radio" name="tq${i}" id="tq${i}_${j}" value="${j}">
                <label class="form-check-label small" for="tq${i}_${j}">${esc(c)}</label>
              </div>`).join('') : `
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="tq${i}" id="tq${i}_t" value="true">
                <label class="form-check-label small" for="tq${i}_t">True</label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="tq${i}" id="tq${i}_f" value="false">
                <label class="form-check-label small" for="tq${i}_f">False</label>
              </div>`}
          </div>`).join('')}
      </div>
      <button class="btn btn-primary" onclick="submitExam(${e.id})"><i class="bi bi-check2 me-1"></i>Submit assessment</button>
    </div></div>`;
}

function submitExam(id) {
  if (!isStudent()) return T('Access denied');
  const e = DB.exams.find(x => x.id == id);
  if (!e) return;
  const answers = [];
  let score = 0;
  e.questions.forEach((q, i) => {
    const sel = document.querySelector(`input[name="tq${i}"]:checked`);
    let ua = null;
    if (sel) {
      if (q.type === 'tf') ua = sel.value === 'true';
      else ua = +sel.value;
    }
    answers.push(ua);
    if (q.type === 'tf' ? ua === q.answer : ua === q.answer) score += q.pts;
  });
  if (answers.every(a => a === null)) return T('Answer at least one question');
  if (!DB.examSubs) DB.examSubs = {};
  DB.examSubs[examSubKey(id)] = { score, answers, at: Date.now(), points: e.points };
  save();
  state.examReview = true;
  tab('take');
  T('Submitted — score ' + score + ' / ' + e.points);
}

/* ========== Kid switcher ========== */
const kidEl = $('#kid');
if (kidEl) {
  kidEl.innerHTML = kids.map((k, i) => `<option value="${i}">${k.n} (${k.g})</option>`).join('');
}

/* Hook the parent selector */
document.addEventListener('change', e => {
  if (e.target && e.target.id === 'kid') {
    if (!isParent()) return;
    state.kid = +e.target.value;
    if (state.tab === 'rad' || state.tab === 'sf9') tab(state.tab);
    else renderParent();
  }
});

window.addEventListener('resize', () => {
  if ($('#p-sf9') && !$('#p-sf9').hidden) initSig();
});

/* =========================================================
   PWA: service worker registration + install prompt
   ========================================================= */

let deferredInstallPrompt = null;
let swRegistration = null;
let refreshing = false;

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
}

function updateInstallUI() {
  const topBtn = document.getElementById('installBtn');
  const sideBtn = document.getElementById('installBtnSide');
  const canInstall = !!deferredInstallPrompt && !isStandalone();

  if (topBtn) topBtn.hidden = !canInstall;
  if (sideBtn) sideBtn.hidden = !canInstall;
}

function promptInstall() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then(choice => {
      if (choice.outcome === 'accepted') {
        T('Installing learningWheel…');
      } else {
        T('Install dismissed');
      }
      deferredInstallPrompt = null;
      updateInstallUI();
    });
    return;
  }

  if (isStandalone()) {
    T('learningWheel is already installed');
    return;
  }

  if (isIOS()) {
    T('iOS: tap Share, then "Add to Home Screen"');
    return;
  }

  T('Open the browser menu and choose "Install app"');
}

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstallPrompt = e;
  updateInstallUI();
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  updateInstallUI();
  T('learningWheel installed — launching from home screen');
});

/* ---------- Service worker registration ---------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => {
        swRegistration = reg;
        console.log('[PWA] Service worker registered:', reg.scope);

        if (reg.waiting) showUpdateBanner();

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateBanner();
            }
          });
        });
      })
      .catch(err => {
        console.warn('[PWA] Service worker registration failed:', err);
      });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  });
}

function showUpdateBanner() {
  const b = document.getElementById('updateBanner');
  if (b) b.hidden = false;
}

function applyUpdate() {
  const b = document.getElementById('updateBanner');
  if (b) b.hidden = true;
  if (swRegistration && swRegistration.waiting) {
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  } else {
    window.location.reload();
  }
}

updateInstallUI();

/* Deep-link support: ?tab=home|subj|todo|msg opens that tab after login. */
(function handleDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const wanted = params.get('tab');
  if (!wanted) return;
  window._pendingTab = wanted;
})();

(function wrapDoLogin() {
  const original = window.doLogin;
  if (typeof original !== 'function') return;
  window.doLogin = function () {
    original.apply(this, arguments);
    const wanted = window._pendingTab;
    if (wanted && tabAllowed(wanted)) {
      window._pendingTab = null;
      tab(wanted);
    }
  };
})();

window.addEventListener('offline', () => T('You are offline — using cached content'));
window.addEventListener('online',  () => T('Back online'));
