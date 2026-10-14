const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const state = { role: 'student', kid: 0, cls: null, subj: null, ct: 'stream', st: 'all', tab: 'home', discId: null, msgThread: null, fresh: [] };

const T = m => {
  const t = $('#toast');
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
  const open = force === undefined ? !s.classList.contains('open') : force;
  s.classList.toggle('open', open);
  o.classList.toggle('open', open);
}

function toggleTheme() {
  const root = document.documentElement;
  const cur = root.getAttribute('data-theme');
  if (cur === 'dark') root.setAttribute('data-theme', 'light');
  else if (cur === 'light') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', 'dark');
}

/* ========== Landing ========== */
const plans = [
  ['Starter', 'Starter Academy', '₱24,900', 'Up to 300 learners', ['Gradebook & SF9', 'Student hub', 'Discussions', 'Email support']],
  ['Academy', 'School Academy', '₱79,900', 'Up to 1,000 learners', ['Everything in Starter', 'Parent portal', 'Principal console', 'Messages & calendar', 'Offline-safe quizzes']],
  ['Enterprise', 'Division Enterprise', 'Custom', 'Unlimited schools', ['Division dashboards', 'SSO & data export', 'Dedicated manager', 'Custom training']]
];
$('#plans').innerHTML = plans.map(p =>
  `<div class="card price ${p[0] === 'Academy' ? 'feat' : ''}">
    <h3>${p[1]}</h3>
    ${p[0] === 'Academy' ? '<span class="pill g" style="width:fit-content">Most popular</span>' : ''}
    <div class="amt">${p[2]}</div>
    <div class="muted">${p[3]} / year</div>
    <ul>${p[4].map(x => `<li>${x}</li>`).join('')}</ul>
    <button class="btn" onclick="openBuy('${p[0]}')">Buy Plan</button>
  </div>`
).join('');
$('#bp').innerHTML = plans.map(p => `<option value="${p[0]}">${p[1]} – ${p[2]}</option>`).join('');

function openBuy(p) {
  $('#bp').value = p;
  $('#bf').hidden = false;
  $('#bd').hidden = true;
  $('#buy').hidden = false;
}
function submitBuy() {
  if (!$('#bs').value || !$('#bn').value) return T('Please fill in school name and email');
  $('#ref').textContent = 'LW-' + Math.floor(100000 + Math.random() * 900000);
  $('#bf').hidden = true;
  $('#bd').hidden = false;
}

/* ========== Login ========== */
const R = [
  ['student', 'Student'],
  ['teacher', 'Teacher'],
  ['parent', 'Parent'],
  ['principal', 'Principal']
];
function drawRoles() {
  $('#roles').innerHTML = R.map(r =>
    `<button class="${state.role === r[0] ? 'on' : ''}" onclick="state.role='${r[0]}';drawRoles()">${r[1]}</button>`
  ).join('');
}
drawRoles();

const NAV = {
  student: [
    { k: 'home', ico: 'Ho', label: 'Home' },
    { k: 'subj', ico: 'Co', label: 'My Courses' },
    { k: 'todo', ico: 'Td', label: 'To-Do' },
    { k: 'disc', ico: 'Di', label: 'Discussions' },
    { k: 'cal', ico: 'Ca', label: 'Calendar' },
    { k: 'msg', ico: 'Ms', label: 'Messages' },
    { k: 'res', ico: 'Rs', label: 'Resources' },
    { k: 'up', ico: 'Up', label: 'Submit Work' },
    { k: 'quiz', ico: 'Qz', label: 'Quiz' },
    { k: 'alerts', ico: 'Nt', label: 'Notifications' }
  ],
  teacher: [
    { k: 'home', ico: 'Ho', label: 'Home' },
    { k: 'cls', ico: 'Cl', label: 'My Classes' },
    { k: 'recent', ico: 'Rp', label: 'Recent Posts' },
    { k: 'disc', ico: 'Di', label: 'Discussions' },
    { k: 'cal', ico: 'Ca', label: 'Calendar' },
    { k: 'msg', ico: 'Ms', label: 'Messages' },
    { k: 'res', ico: 'Rs', label: 'Resources' },
    { k: 'grades', ico: 'Gr', label: 'Grade Center' }
  ],
  parent: [
    { k: 'home', ico: 'Ho', label: 'Home' },
    { k: 'rad', ico: 'Pr', label: 'Progress' },
    { k: 'sf9', ico: 'RC', label: 'Report Card' },
    { k: 'cal', ico: 'Ca', label: 'Calendar' },
    { k: 'msg', ico: 'Ms', label: 'Messages' }
  ],
  principal: [
    { k: 'home', ico: 'Ho', label: 'Home' },
    { k: 'ops', ico: 'Op', label: 'Operations' },
    { k: 'comp', ico: 'Cm', label: 'Compliance' },
    { k: 'lic', ico: 'Lc', label: 'Licenses' },
    { k: 'msg', ico: 'Ms', label: 'Messages' }
  ]
};

const USER_NAMES = {
  student: 'Ana Dela Cruz',
  teacher: 'Mrs. Santos',
  parent: 'Mr. Santos',
  principal: 'Dr. Reyes'
};

function doLogin() {
  state.cls = null;
  state.subj = null;
  state.ct = 'stream';
  state.st = 'all';
  state.fresh = [];
  state.discId = null;
  state.msgThread = null;
  view('dash');
  const roleLabel = R.find(r => r[0] === state.role)[1];
  $('#userName').textContent = USER_NAMES[state.role];
  $('#userRole').textContent = roleLabel;
  $('#av').textContent = USER_NAMES[state.role].charAt(0);
  $('#kid').hidden = state.role !== 'parent';
  buildSideNav();
  tab('home');
  updateNotifBadge();
}

function buildSideNav() {
  const items = NAV[state.role] || [];
  $('#sideNav').innerHTML = items.map(n =>
    `<button data-tab="${n.k}" class="${state.tab === n.k ? 'on' : ''}" onclick="tab('${n.k}')"><span class="nav-ico">${n.ico}</span> ${n.label}</button>`
  ).join('');
}

function tab(k) {
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
    rad: () => renderParent(),
    sf9: () => { renderParent(); initSig(); },
    quiz: drawQuiz,
    ops: () => {},
    comp: () => {},
    lic: () => {},
    up: () => {}
  };
  (renderers[k] || (() => {}))();
  updateNotifBadge();
}

function onSearch(q) {
  if (!q.trim()) return;
  T('Search: “' + q.trim() + '” (demo — results would appear here)');
}

/* ========== Shared data ========== */
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

const seed = () => ({
  classes: [
    { id: 'm1', subj: 'Mathematics', sec: '7-Rizal', ico: 'MA', col: '#1B2A4A', t: 'You', mine: 1 },
    { id: 'm2', subj: 'Mathematics', sec: '7-Bonifacio', ico: 'MA', col: '#1B2A4A', t: 'You', mine: 1 },
    { id: 's1', subj: 'Science', sec: '7-Rizal', ico: 'SC', col: '#059669', t: 'You', mine: 1 },
    { id: 'e1', subj: 'English', sec: '7-Rizal', ico: 'EN', col: '#2563EB', t: 'Mrs. Villanueva' },
    { id: 'f1', subj: 'Filipino', sec: '7-Rizal', ico: 'FL', col: '#7C3AED', t: 'Mr. Aquino' },
    { id: 'a1', subj: 'Araling Panlipunan', sec: '7-Rizal', ico: 'AP', col: '#D97706', t: 'Ms. Castillo' }
  ],
  items: [
    { id: 1, cid: 'm1', type: 'homework', title: 'Worksheet 5: Fractions', body: 'Answer items 1–20 in your notebook. Show your solutions.', due: day(1), at: Date.now() - 9e6 },
    { id: 2, cid: 'm1', type: 'announcement', title: 'Quiz on Friday', body: 'Bring a calculator and pencil. Covers Chapters 3–4.', at: Date.now() - 8e6 },
    { id: 3, cid: 's1', type: 'task', title: 'Plant Growth Project', body: 'Submit photos of your plant every week for 4 weeks.', due: day(0), at: Date.now() - 7e6 },
    { id: 4, cid: 'e1', type: 'task', title: 'Essay: My Hero', body: 'Write 300 words about someone you admire. Use proper MLA format.', due: day(5), at: Date.now() - 6e6 },
    { id: 5, cid: 'f1', type: 'announcement', title: 'Buwan ng Wika Practice', body: 'Rehearsal at the gym after class. Wear school uniform.', at: Date.now() - 5e6 },
    { id: 6, cid: 'a1', type: 'homework', title: 'Map of Luzon', body: 'Label all provinces. Use colored pencils.', due: day(3), at: Date.now() - 4e6 },
    { id: 7, cid: 's1', type: 'homework', title: 'Lab Report: Density', body: 'Complete the lab worksheet from yesterday’s experiment.', due: day(2), at: Date.now() - 3e6 }
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
        { author: 'Mrs. Santos', body: 'Try the “keep-change-flip” method for division, and always simplify before multiplying.', at: Date.now() - 2.5e7 }
      ]
    },
    {
      id: 3, cid: 'e1', title: 'Book recommendations for essay', author: 'Jose Lopez', at: Date.now() - 4e7,
      body: 'Looking for short stories about Filipino heroes for the My Hero essay.',
      replies: []
    }
  ],
  messages: [
    { id: 1, from: 'Mrs. Villanueva', to: 'me', subj: 'Essay deadline extension', body: 'Hi Ana, you may submit the essay until Monday. Let me know if you need help with the outline.', at: Date.now() - 5e6, read: false },
    { id: 2, from: 'me', to: 'Mrs. Santos', subj: 'Question about Worksheet 5', body: 'Ma’am, for item 12, should we reduce to lowest terms?', at: Date.now() - 8e6, read: true },
    { id: 3, from: 'School Admin', to: 'me', subj: 'Parent-Teacher Conference', body: 'PTC is scheduled for Oct 25. Please confirm attendance via the parent portal.', at: Date.now() - 1e7, read: false }
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
  done: {},
  read: {},
  grades: {},
  n: 20,
  discN: 10,
  msgN: 10
});

let DB;
(function () {
  try { DB = JSON.parse(localStorage.getItem('learningWheel_db_v3')); } catch (e) {}
  if (!DB || !DB.items) DB = seed();
})();
const save = () => { try { localStorage.setItem('learningWheel_db_v3', JSON.stringify(DB)); } catch (e) {} };
function resetDB() {
  DB = seed();
  save();
  T('Demo data reset');
  if (!$('#dash').hidden) tab(state.tab);
}

const cls = id => DB.classes.find(c => c.id == id);
const mine = () => DB.classes.filter(c => c.mine);
const mySec = '7-Rizal';
const TYPE = { task: ['Task', 'Task'], homework: ['HW', 'Homework'], announcement: ['Ann', 'Announcement'] };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const days = d => Math.round((new Date(d) - new Date(day(0))) / 864e5);
const sItems = () => DB.items.filter(i => cls(i.cid) && cls(i.cid).sec == mySec).sort((a, b) => b.at - a.at);
const unread = () => sItems().filter(i => !DB.read[i.id]).length + DB.messages.filter(m => m.to === 'me' && !m.read).length;
const isT = i => i.type !== 'announcement';

function updateNotifBadge() {
  const n = unread();
  const b = $('#notifBadge');
  if (b) {
    b.textContent = n;
    b.hidden = n === 0;
  }
}

function stat(i) {
  if (DB.done[i.id]) return ['grn', 'Done'];
  if (!i.due) return ['org', 'No due date'];
  const n = days(i.due);
  return [n <= 2 ? 'red' : 'org', n < 0 ? 'Overdue' : n === 0 ? 'Due today' : 'Due in ' + n + ' day' + (n > 1 ? 's' : '')];
}

const chips = (i, subj) =>
  `<span class="chip">${TYPE[i.type][1]}</span>` +
  (subj ? `<span class="chip" style="background:${cls(i.cid).col};color:#fff">${cls(i.cid).subj}${cls(i.cid).mine ? ' ' + cls(i.cid).sec : ''}</span>` : '');

const empty = m => `<div class="card muted" style="text-align:center;padding:32px">${m}</div>`;

/* ========== Home dashboards ========== */
function rHome() {
  const el = $('#p-home');
  if (state.role === 'student') {
    const todo = sItems().filter(i => isT(i) && !DB.done[i.id]);
    const urgent = todo.filter(i => i.due && days(i.due) <= 2).length;
    const msgs = DB.messages.filter(m => m.to === 'me' && !m.read).length;
    el.innerHTML = `
      <h2>Welcome back, Ana</h2>
      <p class="muted">Here’s what’s happening in your classes today.</p>
      <div class="stat-grid">
        <div class="stat-card"><div class="label">To-Do</div><div class="value">${todo.length}</div><div class="sub">${urgent} urgent</div></div>
        <div class="stat-card"><div class="label">Unread</div><div class="value">${unread()}</div><div class="sub">alerts & messages</div></div>
        <div class="stat-card"><div class="label">Courses</div><div class="value">${DB.classes.filter(c => c.sec == mySec).length}</div><div class="sub">active this term</div></div>
        <div class="stat-card"><div class="label">Messages</div><div class="value">${msgs}</div><div class="sub">unread</div></div>
      </div>
      <div class="grid-2">
        <div class="card">
          <h3>Upcoming due dates</h3>
          ${todo.slice(0, 4).map(i => sItem(i, 1, 1)).join('') || empty('Nothing due soon.')}
          <button class="btn ghost sm" onclick="tab('todo')">View all to-do →</button>
        </div>
        <div class="card">
          <h3>Recent activity</h3>
          ${sItems().slice(0, 4).map(i => `
            <div class="feed-item">
              <div class="feed-avatar" style="background:${cls(i.cid).col};color:#fff">${cls(i.cid).ico}</div>
              <div class="feed-body">
                <b>${esc(i.title)}</b>
                <div class="feed-meta">${cls(i.cid).subj} · ${TYPE[i.type][1]} · ${dayLabel(new Date(i.at).toISOString().slice(0,10))}</div>
              </div>
            </div>`).join('') || empty('No activity yet.')}
        </div>
      </div>`;
  } else if (state.role === 'teacher') {
    const posts = DB.items.filter(i => cls(i.cid).mine);
    el.innerHTML = `
      <h2>Teacher Dashboard</h2>
      <p class="muted">Manage classes, post work, and track compliance.</p>
      <div class="stat-grid">
        <div class="stat-card"><div class="label">My Classes</div><div class="value">${mine().length}</div></div>
        <div class="stat-card"><div class="label">Posts</div><div class="value">${posts.length}</div></div>
        <div class="stat-card"><div class="label">Discussions</div><div class="value">${DB.discussions.length}</div></div>
        <div class="stat-card"><div class="label">Learners</div><div class="value">${stu.length * mine().length}</div><div class="sub">across sections</div></div>
      </div>
      <div class="grid-2">
        <div class="card">
          <h3>Quick actions</h3>
          <div style="display:flex;flex-direction:column;gap:8px">
            <button class="btn" onclick="tab('cls')">Open a class</button>
            <button class="btn ghost" onclick="tab('disc')">View discussions</button>
            <button class="btn ghost" onclick="tab('grades')">Grade Center</button>
          </div>
        </div>
        <div class="card">
          <h3>Recent posts</h3>
          ${posts.slice(0, 3).map(i => tItem(i, 1)).join('') || empty('No posts yet.')}
        </div>
      </div>`;
  } else if (state.role === 'parent') {
    renderParent();
    const k = kids[state.kid];
    el.innerHTML = `
      <h2>Parent Home</h2>
      <p class="muted">Overview for ${k.n} · ${k.g}</p>
      <div class="stat-grid">
        <div class="stat-card"><div class="label">General Average</div><div class="value">${k.gen}</div><div class="sub">${k.gen >= 85 ? 'On track' : k.gen >= 75 ? 'Watch closely' : 'Needs help'}</div></div>
        <div class="stat-card"><div class="label">Pending Tasks</div><div class="value">${k.pend}</div></div>
        <div class="stat-card"><div class="label">Attendance</div><div class="value">${k.att}%</div></div>
      </div>
      <div class="card">
        <h3>Quick links</h3>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn" onclick="tab('rad')">Full progress</button>
          <button class="btn ghost" onclick="tab('sf9')">Report card</button>
          <button class="btn ghost" onclick="tab('msg')">Messages</button>
        </div>
      </div>`;
  } else {
    el.innerHTML = `
      <h2>Principal Dashboard</h2>
      <p class="muted">School-wide operations at a glance.</p>
      <div class="stat-grid">
        <div class="stat-card"><div class="label">Enrollment</div><div class="value">1,120</div></div>
        <div class="stat-card"><div class="label">Avg GPA</div><div class="value">82.3</div></div>
        <div class="stat-card"><div class="label">Attendance</div><div class="value">93.5%</div></div>
        <div class="stat-card"><div class="label">License</div><div class="value">75%</div><div class="sub">750 / 1000</div></div>
      </div>
      <div class="card">
        <h3>Quick links</h3>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn" onclick="tab('ops')">Operations</button>
          <button class="btn ghost" onclick="tab('comp')">Compliance</button>
          <button class="btn ghost" onclick="tab('lic')">Licenses</button>
        </div>
      </div>`;
  }
}

/* ========== Student ========== */
function sItem(i, subj, noBtn) {
  const s = stat(i);
  const un = !DB.read[i.id] || (state.fresh || []).includes(i.id);
  return `<div class="task ${isT(i) ? s[0] : 'ann'}">
    <div style="flex:1">
      ${chips(i, subj)}${un ? '<span class="chip new">NEW</span>' : ''}
      <div><b>${esc(i.title)}</b></div>
      <div class="muted">${esc(i.body)}</div>
      ${isT(i) ? `<div class="muted"><b>${s[1]}</b>${i.due ? ' · ' + i.due : ''}</div>` : ''}
    </div>
    ${isT(i) && !noBtn ? `<button class="btn ${DB.done[i.id] ? 'ghost' : 'ok'} sm" style="width:auto;flex-shrink:0" onclick="tog(${i.id})">${DB.done[i.id] ? 'Undo' : 'Mark done'}</button>` : ''}
  </div>`;
}
function tog(id) {
  DB.done[id] = !DB.done[id];
  save();
  tab(state.tab);
}
function openSubj(id) {
  state.subj = id;
  state.st = 'all';
  state.fresh = sItems().filter(i => i.cid == id && !DB.read[i.id]).map(i => i.id);
  DB.items.forEach(i => { if (i.cid == id) DB.read[i.id] = 1; });
  save();
  updateNotifBadge();
  tab('subj');
}
function rSubj() {
  const el = $('#p-subj');
  if (!state.subj) {
    state.fresh = [];
    el.innerHTML = `<h2>My Courses</h2>
      <p class="muted">Tap a subject to see tasks, homework, announcements, and resources.</p>
      <div class="grid">${DB.classes.filter(c => c.sec == mySec).map(c => {
        const it = DB.items.filter(i => i.cid == c.id);
        const p = it.filter(i => isT(i) && !DB.done[i.id]).length;
        const u = it.filter(i => !DB.read[i.id]).length;
        return `<button class="click" onclick="openSubj('${c.id}')" style="border-top:6px solid ${c.col}">
          <div class="feed-avatar" style="margin-bottom:10px;background:${c.col};color:#fff">${c.ico}</div>
          <h3>${c.subj}</h3>
          <p class="muted">${c.t}</p>
          <span class="pill y">${p} to do</span> ${u ? `<span class="pill r">${u} new</span>` : ''}
        </button>`;
      }).join('')}</div>`;
    return;
  }
  const c = cls(state.subj);
  const all = DB.items.filter(i => i.cid == c.id).sort((a, b) => b.at - a.at);
  const f = state.st === 'todo' ? all.filter(isT) : state.st === 'ann' ? all.filter(i => !isT(i)) : all;
  el.innerHTML = `
    <button class="btn ghost sm" style="width:auto" onclick="state.subj=null;tab('subj')">← All Courses</button>
    <div class="card" style="margin:14px 0;border-left:6px solid ${c.col}">
      <h2>${c.subj}</h2>
      <div class="muted">Teacher: ${c.t} · Grade ${c.sec}</div>
    </div>
    <div class="tabs">
      ${[['all', 'All'], ['todo', 'To-Do'], ['ann', 'Announcements']].map(t =>
        `<button class="${state.st === t[0] ? 'on' : ''}" onclick="state.st='${t[0]}';tab('subj')">${t[1]}</button>`
      ).join('')}
    </div>
    ${f.map(i => sItem(i)).join('') || empty('Nothing here yet.')}`;
}
function rTodo() {
  const l = sItems().filter(isT).sort((a, b) => (!!DB.done[a.id] - !!DB.done[b.id]) || (a.due > b.due ? 1 : -1));
  $('#p-todo').innerHTML = `<h2>My To-Do</h2>
    <p class="muted">Color bar: urgent · later · done</p>
    ${l.map(i => sItem(i, 1)).join('') || empty("No tasks yet. You are all caught up.")}`;
}
function rAlerts() {
  const u = sItems().filter(i => !DB.read[i.id]);
  const um = DB.messages.filter(m => m.to === 'me' && !m.read);
  $('#p-alerts').innerHTML = `<h2>Notifications</h2>
    ${u.length || um.length
      ? `<p><button class="btn ghost sm" style="width:auto" onclick="markAllRead()">Mark all as read</button></p>
         ${um.map(m => `<div class="task ann" style="cursor:pointer" onclick="tab('msg')"><div style="flex:1"><span class="chip new">MSG</span><div><b>${esc(m.subj)}</b></div><div class="muted">From ${esc(m.from)}</div></div></div>`).join('')}
         ${u.map(i => `<div style="cursor:pointer" onclick="state.tab='subj';openSubj('${i.cid}')">${sItem(i, 1, 1)}</div>`).join('')}`
      : empty('You are all caught up.')}`;
}
function markAllRead() {
  DB.items.forEach(i => DB.read[i.id] = 1);
  DB.messages.forEach(m => { if (m.to === 'me') m.read = true; });
  save();
  tab('alerts');
}

/* ========== Teacher ========== */
const stu = ['Dela Cruz, Ana', 'Reyes, Miguel', 'Garcia, Sofia', 'Lopez, Jose', 'Tan, Bea'];
const base = [[42, 45, 38], [30, 35, 25], [48, 50, 46], [20, 28, 22], [38, 40, 30]];
const G = id => DB.grades[id] || (DB.grades[id] = base.map((r, i) => r.map(v => Math.max(0, Math.min(50, v + ((id.charCodeAt(1) + i) % 5) - 2)))));
function tr(ig) { return ig >= 60 ? 75 + Math.floor((ig - 60) / 1.6) : 60 + Math.floor(ig / 4); }
function calc(i) {
  const r = $$(`[data-r="${i}"]`).map(x => Math.min(50, Math.max(0, +x.value || 0)));
  G(state.cls)[i] = r;
  save();
  const ig = r[0] / 50 * 40 + r[1] / 50 * 40 + r[2] / 50 * 20;
  const g = tr(ig);
  const ii = $('#i' + i);
  if (ii) ii.textContent = ig.toFixed(2);
  const o = $('#t' + i);
  if (o) { o.textContent = g; o.className = 'out ' + (g >= 85 ? 'ok-t' : g >= 75 ? '' : 'warn-t'); }
}
function tItem(i, showCls) {
  const n = (i.id * 3) % 6;
  return `<div class="task ${isT(i) ? 'org' : 'ann'}">
    <div style="flex:1">
      ${chips(i)}${showCls ? `<span class="chip" style="background:${cls(i.cid).col};color:#fff">${cls(i.cid).subj} · ${cls(i.cid).sec}</span>` : ''}
      <div><b>${esc(i.title)}</b></div>
      <div class="muted">${esc(i.body)}</div>
      <div class="muted">${isT(i) ? `Due ${i.due || '—'} · Submitted ${n}/${stu.length}` : 'Visible to all learners'}</div>
    </div>
    <button class="btn ghost sm" style="width:auto;flex-shrink:0" onclick="del(${i.id})">Delete</button>
  </div>`;
}
function del(id) {
  DB.items = DB.items.filter(i => i.id != id);
  save();
  tab(state.tab);
  T('Post deleted');
}
function openCls(id) {
  state.cls = id;
  state.ct = 'stream';
  tab('cls');
}
function post(cid) {
  const t = $('#ptl').value.trim();
  if (!t) return T('Please enter a title');
  const ids = [cid, ...$$('.xc:checked').map(x => x.value)];
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
  const el = $('#p-cls');
  if (!state.cls) {
    el.innerHTML = `<h2>My Classes</h2>
      <p class="muted">Tap a class to post tasks, homework, and announcements.</p>
      <div class="grid">${mine().map(c =>
        `<button class="click" onclick="openCls('${c.id}')" style="border-top:6px solid ${c.col}">
          <div class="feed-avatar" style="margin-bottom:10px;background:${c.col};color:#fff">${c.ico}</div>
          <h3>${c.subj}</h3>
          <p class="muted">Grade ${c.sec} · ${stu.length} learners</p>
          <span class="pill n">${DB.items.filter(i => i.cid == c.id).length} posts</span>
        </button>`
      ).join('')}</div>`;
    return;
  }
  const c = cls(state.cls);
  const ct = state.ct;
  let body = '';
  if (ct === 'stream') {
    body = DB.items.filter(i => i.cid == c.id).sort((a, b) => b.at - a.at).map(i => tItem(i)).join('') || empty('No posts yet. Use “Post New”.');
  } else if (ct === 'post') {
    body = `<div class="card">
      <h3>Post to ${c.subj} · ${c.sec}</h3>
      <label for="pt">Type</label>
      <select id="pt"><option value="task">Task</option><option value="homework">Homework</option><option value="announcement">Announcement</option></select>
      <label for="ptl">Title</label>
      <input id="ptl" placeholder="e.g. Chapter 3 Reading">
      <label for="pb">Details</label>
      <textarea id="pb" placeholder="Instructions for learners"></textarea>
      <label for="pd">Due date (tasks & homework)</label>
      <input type="date" id="pd" value="${day(3)}">
      <label>Also post to my other classes</label>
      ${mine().filter(x => x.id != c.id).map(x =>
        `<label class="opt"><input type="checkbox" class="xc" value="${x.id}">${x.subj} · ${x.sec}</label>`
      ).join('')}
      <p style="margin-top:12px"><button class="btn ok" onclick="post('${c.id}')">Post</button></p>
    </div>`;
  } else {
    body = `<div class="card">
      <h3>Gradebook (DepEd Order 8, s. 2015)</h3>
      <p class="muted">WW 40% · PT 40% · Exam 20%. Type a raw score to recalculate.</p>
      <div class="scroll"><table>
        <thead><tr><th>Learner</th><th>WW /50</th><th>PT /50</th><th>Exam /50</th><th>Initial</th><th>Grade</th></tr></thead>
        <tbody>${G(c.id).map((r, i) =>
          `<tr><td>${stu[i]}</td>${r.map(v =>
            `<td><input type="number" min="0" max="50" data-r="${i}" value="${v}" oninput="calc(${i})" aria-label="score"></td>`
          ).join('')}<td id="i${i}"></td><td class="out" id="t${i}"></td></tr>`
        ).join('')}</tbody>
      </table></div>
      <p style="margin-top:12px"><button class="btn" onclick="toast('SF9/SF10 report cards exported (simulated)')">Export SF9/SF10</button></p>
    </div>`;
  }
  el.innerHTML = `
    <button class="btn ghost sm" style="width:auto" onclick="state.cls=null;tab('cls')">← All Classes</button>
    <div class="card" style="margin:14px 0;border-left:6px solid ${c.col}">
      <h2>${c.subj} · ${c.sec}</h2>
      <div class="muted">${stu.length} learners</div>
    </div>
    <div class="tabs">
      ${[['stream', 'Stream'], ['post', 'Post new'], ['grade', 'Gradebook']].map(t =>
        `<button class="${ct === t[0] ? 'on' : ''}" onclick="state.ct='${t[0]}';tab('cls')">${t[1]}</button>`
      ).join('')}
    </div>
    ${body}`;
  if (ct === 'grade') G(c.id).forEach((_, i) => calc(i));
}
function rRecent() {
  const l = DB.items.filter(i => cls(i.cid).mine).sort((a, b) => b.at - a.at);
  $('#p-recent').innerHTML = `<h2>Recent Posts</h2>
    <p class="muted">Everything you posted across all classes.</p>
    ${l.map(i => tItem(i, 1)).join('') || empty('No posts yet.')}`;
}
function rGrades() {
  const el = $('#p-grades');
  el.innerHTML = `<h2>Grade Center</h2>
    <p class="muted">Select a class to open its gradebook (DepEd Order 8, s. 2015).</p>
    <div class="grid">${mine().map(c =>
      `<button class="click" onclick="state.cls='${c.id}';state.ct='grade';tab('cls')" style="border-top:6px solid ${c.col}">
        <div class="feed-avatar" style="margin-bottom:10px;background:${c.col};color:#fff">${c.ico}</div>
        <h3>${c.subj}</h3>
        <p class="muted">${c.sec} · ${stu.length} learners</p>
      </button>`
    ).join('')}</div>`;
}

/* ========== Discussions ========== */
function rDisc() {
  const el = $('#p-disc');
  if (state.discId) {
    const d = DB.discussions.find(x => x.id == state.discId);
    if (!d) { state.discId = null; return rDisc(); }
    const c = cls(d.cid);
    el.innerHTML = `
      <button class="btn ghost sm" style="width:auto" onclick="state.discId=null;tab('disc')">← All Discussions</button>
      <div class="card" style="margin-top:14px">
        <span class="chip" style="background:${c.col};color:#fff">${c.subj}</span>
        <h2 style="margin-top:8px">${esc(d.title)}</h2>
        <div class="muted">${esc(d.author)} · ${new Date(d.at).toLocaleDateString()}</div>
        <p style="margin-top:12px">${esc(d.body)}</p>
        <h3 style="margin-top:20px">Replies (${d.replies.length})</h3>
        ${d.replies.map(r => `
          <div class="disc-reply">
            <b>${esc(r.author)}</b>
            <div class="muted" style="font-size:.85rem">${new Date(r.at).toLocaleDateString()}</div>
            <p style="margin:6px 0 0">${esc(r.body)}</p>
          </div>`).join('') || '<p class="muted">No replies yet. Be the first!</p>'}
        <div style="margin-top:16px">
          <label for="replyBody">Your reply</label>
          <textarea id="replyBody" placeholder="Write a reply…"></textarea>
          <button class="btn ok sm" style="margin-top:8px;width:auto" onclick="postReply(${d.id})">Post Reply</button>
        </div>
      </div>`;
    return;
  }
  el.innerHTML = `<h2>Discussions</h2>
    <p class="muted">Class forums — ask questions, share ideas, help classmates.</p>
    ${state.role === 'teacher' || state.role === 'student' ? `
      <div class="card" style="margin-bottom:16px">
        <h3>Start a new discussion</h3>
        <label for="dt">Title</label>
        <input id="dt" placeholder="e.g. Help with Chapter 4">
        <label for="db">Message</label>
        <textarea id="db" placeholder="What would you like to discuss?"></textarea>
        <label for="dc">Course</label>
        <select id="dc">${(state.role === 'teacher' ? mine() : DB.classes.filter(c => c.sec == mySec)).map(c =>
          `<option value="${c.id}">${c.subj} · ${c.sec}</option>`
        ).join('')}</select>
        <button class="btn ok sm" style="margin-top:10px;width:auto" onclick="newDisc()">Post Discussion</button>
      </div>` : ''}
    ${DB.discussions.sort((a, b) => b.at - a.at).map(d => {
      const c = cls(d.cid);
      return `<div class="disc-item" style="cursor:pointer" onclick="state.discId=${d.id};tab('disc')">
        <div class="feed-avatar">${c ? c.ico : 'Di'}</div>
        <div class="feed-body">
          <b>${esc(d.title)}</b>
          <div class="muted">${c ? c.subj : ''} · ${esc(d.author)} · ${d.replies.length} ${d.replies.length === 1 ? 'reply' : 'replies'}</div>
          <div class="muted" style="margin-top:4px">${esc(d.body).slice(0, 100)}${d.body.length > 100 ? '…' : ''}</div>
        </div>
      </div>`;
    }).join('') || empty('No discussions yet.')}`;
}
function newDisc() {
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
  const b = $('#replyBody').value.trim();
  if (!b) return T('Please write a reply');
  const d = DB.discussions.find(x => x.id == id);
  d.replies.push({ author: USER_NAMES[state.role], body: b, at: Date.now() });
  save();
  tab('disc');
  T('Reply posted');
}

/* ========== Calendar ========== */
function rCal() {
  const el = $('#p-cal');
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const first = new Date(y, m, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const todayStr = day(0);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const evMap = {};
  DB.events.forEach(e => {
    if (!evMap[e.date]) evMap[e.date] = [];
    evMap[e.date].push(e);
  });
  let cells = '';
  for (let i = 0; i < startDay; i++) cells += '<div class="cal-day"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const has = !!evMap[ds];
    const isToday = ds === todayStr;
    cells += `<div class="cal-day${isToday ? ' today' : ''}${has ? ' has-ev' : ''}" title="${has ? evMap[ds].map(e => e.title).join(', ') : ''}">${d}</div>`;
  }
  const upcoming = DB.events.filter(e => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8);
  el.innerHTML = `<h2>Calendar</h2>
    <p class="muted">Due dates, quizzes, and school events.</p>
    <div class="grid-2">
      <div class="card">
        <h3>${monthNames[m]} ${y}</h3>
        <div class="cal-grid" style="margin-top:8px">
          ${['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => `<div class="cal-hd">${d}</div>`).join('')}
          ${cells}
        </div>
      </div>
      <div class="card">
        <h3>Upcoming</h3>
        ${upcoming.map(e => `
          <div class="feed-item">
            <div class="feed-avatar">${e.type === 'due' ? 'Due' : e.type === 'quiz' ? 'Quiz' : 'Evt'}</div>
            <div class="feed-body">
              <b>${esc(e.title)}</b>
              <div class="feed-meta">${dayLabel(e.date)} · ${e.date}</div>
            </div>
          </div>`).join('') || empty('No upcoming events.')}
      </div>
    </div>`;
}

/* ========== Messages ========== */
function rMsg() {
  const el = $('#p-msg');
  if (state.msgThread != null) {
    const m = DB.messages.find(x => x.id == state.msgThread);
    if (!m) { state.msgThread = null; return rMsg(); }
    m.read = true;
    save();
    updateNotifBadge();
    el.innerHTML = `
      <button class="btn ghost sm" style="width:auto" onclick="state.msgThread=null;tab('msg')">← Inbox</button>
      <div class="card" style="margin-top:14px">
        <h2>${esc(m.subj)}</h2>
        <div class="muted">From: ${esc(m.from)} · To: ${esc(m.to)} · ${new Date(m.at).toLocaleString()}</div>
        <p style="margin-top:16px;white-space:pre-wrap">${esc(m.body)}</p>
        <div style="margin-top:20px;border-top:1px solid var(--bd);padding-top:16px">
          <label for="replyMsg">Reply</label>
          <textarea id="replyMsg" placeholder="Type your reply…"></textarea>
          <button class="btn ok sm" style="margin-top:8px;width:auto" onclick="sendReply(${m.id})">Send Reply</button>
        </div>
      </div>`;
    return;
  }
  const list = [...DB.messages].sort((a, b) => b.at - a.at);
  el.innerHTML = `<h2>Messages</h2>
    <p class="muted">Private messages with teachers, students, and school staff.</p>
    <div class="card" style="margin-bottom:16px">
      <h3>Compose</h3>
      <label for="msgTo">To</label>
      <select id="msgTo">
        <option>Mrs. Santos</option><option>Mrs. Villanueva</option><option>Mr. Aquino</option>
        <option>School Admin</option><option>Ana Dela Cruz</option>
      </select>
      <label for="msgSubj">Subject</label>
      <input id="msgSubj" placeholder="Subject">
      <label for="msgBody">Message</label>
      <textarea id="msgBody" placeholder="Write your message…"></textarea>
      <button class="btn ok sm" style="margin-top:8px;width:auto" onclick="sendMsg()">Send</button>
    </div>
    <h3>Inbox</h3>
    ${list.map(m => `
      <div class="msg-item" style="cursor:pointer" onclick="state.msgThread=${m.id};tab('msg')">
        <div class="feed-avatar">${m.read ? 'Rd' : 'New'}</div>
        <div class="feed-body">
          <b>${esc(m.subj)}</b> ${!m.read && m.to === 'me' ? '<span class="chip new">NEW</span>' : ''}
          <div class="muted">${esc(m.from)} → ${esc(m.to)} · ${new Date(m.at).toLocaleDateString()}</div>
        </div>
      </div>`).join('') || empty('No messages.')}`;
}
function sendMsg() {
  const subj = $('#msgSubj').value.trim();
  const body = $('#msgBody').value.trim();
  if (!subj || !body) return T('Please fill subject and message');
  DB.messages.unshift({
    id: DB.msgN++, from: USER_NAMES[state.role], to: $('#msgTo').value,
    subj, body, at: Date.now(), read: true
  });
  save();
  tab('msg');
  T('Message sent');
}
function sendReply(id) {
  const body = $('#replyMsg').value.trim();
  if (!body) return T('Please write a reply');
  const m = DB.messages.find(x => x.id == id);
  DB.messages.unshift({
    id: DB.msgN++, from: USER_NAMES[state.role], to: m.from,
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
  const list = state.role === 'teacher'
    ? DB.resources
    : DB.resources.filter(r => cls(r.cid) && cls(r.cid).sec == mySec);
  el.innerHTML = `<h2>Resources</h2>
    <p class="muted">Course files, handouts, and media shared by teachers.</p>
    ${state.role === 'teacher' ? `
      <div class="card" style="margin-bottom:16px">
        <h3>Upload resource (demo)</h3>
        <label for="rt">Title</label>
        <input id="rt" placeholder="e.g. Chapter 5 Notes">
        <label for="rc">Course</label>
        <select id="rc">${mine().map(c => `<option value="${c.id}">${c.subj} · ${c.sec}</option>`).join('')}</select>
        <label for="rtype">Type</label>
        <select id="rtype"><option>PDF</option><option>DOCX</option><option>PPTX</option><option>MP4</option><option>PNG</option></select>
        <button class="btn ok sm" style="margin-top:8px;width:auto" onclick="addRes()">Add Resource</button>
      </div>` : ''}
    <div class="grid">${list.map(r => {
      const c = cls(r.cid);
      return `<div class="card">
        <div class="feed-avatar" style="margin-bottom:10px">${r.type === 'PDF' ? 'PDF' : r.type === 'MP4' ? 'VID' : r.type === 'PNG' ? 'IMG' : 'FILE'}</div>
        <h3 style="font-size:1rem">${esc(r.title)}</h3>
        <div class="muted">${c ? c.subj : ''} · ${r.type} · ${r.size}</div>
        <div class="muted" style="font-size:.85rem;margin-top:4px">Added ${r.at}</div>
        <button class="btn ghost sm" style="margin-top:10px;width:auto" onclick="toast('Download started (demo)')">Download</button>
      </div>`;
    }).join('') || empty('No resources yet.')}</div>`;
}
function addRes() {
  const t = $('#rt').value.trim();
  if (!t) return T('Please enter a title');
  DB.resources.unshift({
    id: Date.now(), cid: $('#rc').value, title: t,
    type: $('#rtype').value, size: Math.floor(50 + Math.random() * 500) + ' KB', at: day(0)
  });
  save();
  tab('res');
  T('Resource added');
}

/* ========== Student extras ========== */
function compress() {
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
  qa[q] = o;
  try { localStorage.setItem('learningWheel_quiz', JSON.stringify(qa)); } catch (e) {}
  T('Answer saved');
}
function drawQuiz() {
  $('#qz').innerHTML = Q.map((q, i) =>
    `<h3>${i + 1}. ${q[0]}</h3>${q[1].map((o, j) =>
      `<label class="opt"><input type="radio" name="q${i}" ${qa[i] === j ? 'checked' : ''} onclick="pick(${i},${j})">${o}</label>`
    ).join('')}`
  ).join('');
}
function brownout() {
  $('#qz').innerHTML = '<p class="bad-t out">Power lost… restarting</p>';
  qa = {};
  setTimeout(() => {
    load();
    drawQuiz();
    $('#qm').textContent = 'Recovered ' + Object.keys(qa).length + ' saved answer(s) from this device.';
  }, 1200);
}
function gradeQuiz() {
  $('#qm').textContent = 'Score: ' + ans.filter((a, i) => qa[i] === a).length + ' / 3';
}
load();

/* ========== Parent ========== */
const kids = [
  { n: 'Maria Santos', g: 'Grade 5', gen: 92, pend: 1, att: 98 },
  { n: 'Juan Santos', g: 'Grade 2', gen: 78, pend: 3, att: 92 },
  { n: 'Pedro Santos', g: 'Grade 9', gen: 72, pend: 6, att: 85 }
];
$('#kid').innerHTML = kids.map((k, i) => `<option value="${i}">${k.n} (${k.g})</option>`).join('');
const col = (v, a, b) => v >= a ? 'g' : v >= b ? 'y' : 'r';
function renderParent() {
  const k = kids[state.kid];
  if ($('#kn')) $('#kn').textContent = k.n + ' · ' + k.g;
  const L = [
    ['General average', k.gen, col(k.gen, 85, 75), k.gen >= 85 ? 'On track' : k.gen >= 75 ? 'Watch closely' : 'Needs help'],
    ['Pending tasks', k.pend, col(-k.pend, -2, -4), k.pend + ' to finish'],
    ['Attendance', k.att + '%', col(k.att, 95, 90), k.att >= 95 ? 'Excellent' : k.att >= 90 ? 'Some absences' : 'Too many absences']
  ];
  if ($('#tl')) {
    $('#tl').innerHTML = L.map(l =>
      `<div class="card light"><div class="dot ${l[2]}" style="background:var(--${l[2] === 'g' ? 'ok' : l[2] === 'y' ? 'warn' : 'bad'})"></div>
        <div><h3>${l[0]}</h3><div class="out">${l[1]}</div><div class="muted">${l[3]}</div></div></div>`
    ).join('');
  }
  const s = ['Filipino', 'English', 'Math', 'Science', 'Araling Panlipunan'];
  if ($('#sf')) {
    $('#sf').innerHTML = `<p><b>${k.n}</b> · ${k.g} · S.Y. 2026–2027</p>
      <div class="scroll"><table>
        <tr><th>Subject</th><th>Q1</th><th>Q2</th><th>Final</th></tr>
        ${s.map((x, i) => {
          const a = Math.min(100, k.gen + [2, -3, 4, -1, 0][i]);
          return `<tr><td>${x}</td><td>${a - 1}</td><td>${a + 1 > 100 ? 100 : a + 1}</td><td class="out">${a}</td></tr>`;
        }).join('')}
        <tr><th>General Average</th><th></th><th></th><th>${k.gen}</th></tr>
      </table></div>`;
  }
  if ($('#ap')) $('#ap').textContent = '';
}

/* Signature */
let drawing = false;
function initSig() {
  const c = $('#sig');
  if (!c) return;
  c.width = c.clientWidth;
  c.height = 140;
  const x = c.getContext('2d');
  x.lineWidth = 3;
  x.lineCap = 'round';
  x.strokeStyle = '#1E3A8A';
  const pos = e => {
    const r = c.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  c.onpointerdown = e => { drawing = true; x.beginPath(); x.moveTo(...pos(e)); };
  c.onpointermove = e => { if (drawing) { x.lineTo(...pos(e)); x.stroke(); } };
  c.onpointerup = () => drawing = false;
}
function clearSig() {
  const c = $('#sig');
  if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height);
}
function approve(m) {
  $('#ap').textContent = `${kids[state.kid].n}'s report card approved via ${m} · ${new Date().toLocaleDateString()}`;
  T('Report card approved');
}

/* Principal */
function bars(id, d, max, u, c) {
  const el = $(id);
  if (!el) return;
  el.innerHTML = d.map(x =>
    `<div class="row"><span class="lb">${x[0]}</span><div class="bar"><i style="width:${x[1] / max * 100}%;background:${c}"></i></div><b>${x[1]}${u}</b></div>`
  ).join('');
}
bars('#c1', [['Gr 7', 310], ['Gr 8', 285], ['Gr 9', 270], ['Gr 10', 255]], 320, '', '#1E3A8A');
bars('#c2', [['Gr 7', 84], ['Gr 8', 82], ['Gr 9', 80], ['Gr 10', 83]], 100, '', '#047857');
bars('#c3', [['Gr 7', 96], ['Gr 8', 94], ['Gr 9', 91], ['Gr 10', 93]], 100, '%', '#B45309');
const clEl = $('#cl');
if (clEl) {
  clEl.innerHTML = [
    ['Mrs. Villanueva', '12 of 12 reviewed', 'Up to date', 'g', 'Compliant'],
    ['Mr. Aquino', '8 of 11 reviewed', '2 weeks late', 'y', 'Pending'],
    ['Ms. Castillo', '3 of 10 reviewed', 'Missing', 'r', 'Overdue'],
    ['Mr. Ramos', '10 of 10 reviewed', 'Up to date', 'g', 'Compliant']
  ].map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td><span class="pill ${r[3]}">${r[4]}</span></td></tr>`).join('');
}

window.addEventListener('resize', () => { if ($('#p-sf9') && !$('#p-sf9').hidden) initSig(); });
