/* learningWheel – Demo LMS logic */

// ===== STATE =====
const state = {
  role: 'Student',
  user: { name: 'Demo User', id: 1 },
  quarter: 'Q3',
  kid: 0,
  search: '',
  tab: 'home',
  quizAnswers: {},
  sigData: null,
  notifications: [
    { id: 1, text: 'New assignment posted in Science', time: '2h ago', read: false },
    { id: 2, text: 'Quiz graded: 18/20', time: '5h ago', read: false },
    { id: 3, text: 'Parent-teacher meeting scheduled', time: '1d ago', read: true }
  ]
};

// ===== DEMO DATA =====
const courses = [
  { id: 1, code: 'SCI', name: 'Science 9', teacher: 'Ms. Reyes', color: '#2563EB', progress: 72 },
  { id: 2, code: 'MTH', name: 'Mathematics 9', teacher: 'Mr. Cruz', color: '#059669', progress: 65 },
  { id: 3, code: 'ENG', name: 'English 9', teacher: 'Mrs. Santos', color: '#7C3AED', progress: 80 },
  { id: 4, code: 'FIL', name: 'Filipino 9', teacher: 'G. Dela Cruz', color: '#D97706', progress: 58 },
  { id: 5, code: 'AP', name: 'Araling Panlipunan', teacher: 'Ms. Bautista', color: '#DC2626', progress: 70 },
  { id: 6, code: 'TLE', name: 'TLE – ICT', teacher: 'Mr. Gomez', color: '#0891B2', progress: 85 }
];

const assignments = [
  { id: 1, course: 'SCI', title: 'Volcano Lab Report', due: '2026-10-18', status: 'pending', points: 50 },
  { id: 2, course: 'MTH', title: 'Quadratic Equations Set B', due: '2026-10-20', status: 'pending', points: 40 },
  { id: 3, course: 'ENG', title: 'Essay: My Hero', due: '2026-10-15', status: 'submitted', points: 60 },
  { id: 4, course: 'FIL', title: 'Tula: Kalikasan', due: '2026-10-22', status: 'pending', points: 30 },
  { id: 5, course: 'AP', title: 'Timeline: Martial Law', due: '2026-10-25', status: 'pending', points: 50 }
];

const discussions = [
  { id: 1, course: 'SCI', author: 'Ms. Reyes', title: 'What causes earthquakes?', replies: 12, time: '3h ago', body: 'Share your thoughts on plate tectonics and how it affects the Philippines.' },
  { id: 2, course: 'ENG', author: 'Juan D.', title: 'Tips for persuasive writing?', replies: 8, time: '5h ago', body: 'I struggle with organizing my arguments. Any advice?' },
  { id: 3, course: 'MTH', author: 'Mr. Cruz', title: 'Quadratic formula mnemonic', replies: 15, time: '1d ago', body: 'Pop goes the weasel! Let us share tricks to remember the formula.' }
];

const calendarEvents = {
  '2026-10-15': [{ title: 'English Essay Due', type: 'due' }],
  '2026-10-18': [{ title: 'Science Lab Report Due', type: 'due' }],
  '2026-10-20': [{ title: 'Math Problem Set Due', type: 'due' }],
  '2026-10-25': [{ title: 'AP Timeline Due', type: 'due' }],
  '2026-10-30': [{ title: 'Quarterly Exam', type: 'exam' }]
};

const messages = [
  { id: 1, from: 'Ms. Reyes', subject: 'Science Lab Report', preview: 'Remember to include your hypothesis...', time: '2h ago', unread: true },
  { id: 2, from: 'Mr. Cruz', subject: 'Math Consultation', preview: 'Available for consultation tomorrow at...', time: '5h ago', unread: true },
  { id: 3, from: 'Mrs. Santos', subject: 'Essay Feedback', preview: 'Great work on your draft! Just a few...', time: '1d ago', unread: false }
];

const resources = [
  { id: 1, course: 'SCI', title: 'Periodic Table PDF', type: 'pdf', size: '2.4 MB' },
  { id: 2, course: 'MTH', title: 'Quadratic Formula Sheet', type: 'pdf', size: '1.1 MB' },
  { id: 3, course: 'ENG', title: 'Essay Rubric', type: 'doc', size: '0.5 MB' },
  { id: 4, course: 'FIL', title: 'Tula Guide', type: 'pdf', size: '0.8 MB' }
];

const grades = [
  { course: 'Science 9', q1: 88, q2: 90, q3: 87, q4: null },
  { course: 'Mathematics 9', q1: 85, q2: 87, q3: 86, q4: null },
  { course: 'English 9', q1: 92, q2: 91, q3: 93, q4: null },
  { course: 'Filipino 9', q1: 89, q2: 88, q3: 90, q4: null },
  { course: 'Araling Panlipunan', q1: 87, q2: 89, q3: 88, q4: null },
  { course: 'TLE – ICT', q1: 94, q2: 95, q3: 93, q4: null }
];

const exams = [
  { id: 1, course: 'SCI', title: 'Science Quarterly Exam', date: '2026-10-30', duration: '60 min', status: 'upcoming' },
  { id: 2, course: 'MTH', title: 'Math Unit Test', date: '2026-11-05', duration: '45 min', status: 'upcoming' },
  { id: 3, course: 'ENG', title: 'English Oral Exam', date: '2026-11-12', duration: '30 min', status: 'upcoming' }
];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initRoles();
  initPlans();
  initSideNav();
  initSignature();
  renderHome();
  setupRippleEffect();
  setupRoleButtons();
  setupTooltips();
});

// ===== RIPPLE EFFECT =====
function setupRippleEffect() {
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn-ripple');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
}

// ===== ROLE BUTTONS =====
function setupRoleButtons() {
  document.addEventListener('click', function(e) {
    const rb = e.target.closest('.role-btn');
    if (!rb) return;
    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    rb.classList.add('active');
    state.role = rb.dataset.role || rb.textContent.trim();
  });
}

// ===== TOOLTIPS =====
function setupTooltips() {
  // Tooltips are handled via CSS, but we ensure data attributes are present
  document.querySelectorAll('[title]').forEach(el => {
    if (!el.dataset.tooltip) {
      el.dataset.tooltip = el.getAttribute('title');
      el.removeAttribute('title');
    }
  });
}

// ===== VIEWS =====
function view(name) {
  document.querySelectorAll('.view').forEach(v => v.hidden = true);
  const el = document.getElementById(name);
  if (el) {
    el.hidden = false;
    if (name === 'dash') {
      renderDash();
    }
  }
}

// ===== ROLES =====
function initRoles() {
  const roles = ['Student', 'Teacher', 'Parent', 'Principal'];
  const container = document.getElementById('roles');
  if (!container) return;
  container.innerHTML = roles.map((r, i) => `
    <div class="col-6">
      <button class="role-btn w-100 ${i === 0 ? 'active' : ''}" data-role="${r}">${r}</button>
    </div>
  `).join('');
}

// ===== PLANS =====
function initPlans() {
  const container = document.getElementById('plans');
  if (!container) return;
  const plans = [
    { name: 'Starter', price: '₱29,900', desc: 'Up to 200 students', features: ['Gradebook', 'SF9/SF10', 'Discussions'] },
    { name: 'Academy', price: '₱79,900', desc: 'Up to 1000 students', features: ['Everything in Starter', 'Parent portal', 'Messaging', 'Calendar'] },
    { name: 'Enterprise', price: 'Custom', desc: 'Unlimited students', features: ['Everything in Academy', 'Dedicated support', 'On-premise option'] }
  ];
  container.innerHTML = plans.map((p, i) => `
    <div class="col-md-4">
      <div class="card h-100 card-hover-lift animate-fade-up" style="animation-delay: ${i * 0.1}s;">
        <div class="card-body text-center">
          <h3 class="h6 text-uppercase text-secondary">${p.name}</h3>
          <p class="fs-4 fw-bold mb-1">${p.price}</p>
          <p class="text-secondary small mb-3">${p.desc}</p>
          <ul class="list-unstyled small text-start mb-3">
            ${p.features.map(f => `<li class="mb-1"><i class="bi bi-check-circle-fill text-success me-2"></i>${f}</li>`).join('')}
          </ul>
          <button class="btn ${i === 1 ? 'btn-primary' : 'btn-outline-secondary'} w-100 btn-ripple" onclick="openBuy('${p.name}')">Choose ${p.name}</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ===== BUY MODAL =====
function openBuy(plan) {
  const modal = new bootstrap.Modal(document.getElementById('buyModal'));
  document.getElementById('bf').hidden = false;
  document.getElementById('bd').hidden = true;
  const bp = document.getElementById('bp');
  if (bp) {
    bp.innerHTML = ['Starter', 'Academy', 'Enterprise'].map(p => `<option ${p === plan ? 'selected' : ''}>${p}</option>`).join('');
  }
  modal.show();
}

function submitBuy() {
  const ref = 'LW-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  document.getElementById('ref').textContent = ref;
  document.getElementById('bf').hidden = true;
  document.getElementById('bd').hidden = false;
}

// ===== SIDEBAR =====
function initSideNav() {
  const nav = document.getElementById('sideNav');
  if (!nav) return;
  const items = getNavItems();
  nav.innerHTML = items.map(item => `
    <a class="nav-link ${item.active ? 'active' : ''}" href="#" onclick="tab('${item.id}');return false">
      <i class="bi ${item.icon}"></i>
      <span>${item.label}</span>
    </a>
  `).join('');
}

function getNavItems() {
  const common = [
    { id: 'home', label: 'Home', icon: 'bi-house' },
    { id: 'cls', label: 'My Classes', icon: 'bi-book' },
    { id: 'recent', label: 'Recent', icon: 'bi-clock-history' },
    { id: 'subj', label: 'Subjects', icon: 'bi-grid' },
    { id: 'todo', label: 'To-Do', icon: 'bi-check2-square' },
    { id: 'alerts', label: 'Alerts', icon: 'bi-bell' }
  ];
  const student = [
    { id: 'up', label: 'Submit Work', icon: 'bi-cloud-upload' },
    { id: 'quiz', label: 'Quizzes', icon: 'bi-pencil-square' },
    { id: 'grades', label: 'My Grades', icon: 'bi-bar-chart' },
    { id: 'exams', label: 'Exams', icon: 'bi-journal-text' }
  ];
  const teacher = [
    { id: 'rad', label: 'Review & Grade', icon: 'bi-check2-circle' },
    { id: 'disc', label: 'Discussions', icon: 'bi-chat-dots' }
  ];
  const parent = [
    { id: 'sf9', label: 'Report Card', icon: 'bi-file-earmark-text' },
    { id: 'rad', label: 'Child Progress', icon: 'bi-graph-up' }
  ];
  const principal = [
    { id: 'ops', label: 'Operations', icon: 'bi-gear' },
    { id: 'comp', label: 'Compliance', icon: 'bi-shield-check' },
    { id: 'lic', label: 'Licenses', icon: 'bi-key' }
  ];
  
  let items = [...common];
  if (state.role === 'Student') items = [...items, ...student];
  else if (state.role === 'Teacher') items = [...items, ...teacher];
  else if (state.role === 'Parent') items = [...items, ...parent];
  else if (state.role === 'Principal') items = [...items, ...principal];
  
  items.push(
    { id: 'disc', label: 'Discussions', icon: 'bi-chat-dots' },
    { id: 'cal', label: 'Calendar', icon: 'bi-calendar' },
    { id: 'msg', label: 'Messages', icon: 'bi-envelope' },
    { id: 'res', label: 'Resources', icon: 'bi-folder' }
  );
  
  return items.map(item => ({
    ...item,
    active: state.tab === item.id
  }));
}

function toggleSide(force) {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sideOverlay');
  if (!sidebar || !overlay) return;
  const open = force !== undefined ? force : !sidebar.classList.contains('open');
  sidebar.classList.toggle('open', open);
  overlay.classList.toggle('open', open);
}

// ===== TABS =====
function tab(id) {
  state.tab = id;
  initSideNav();
  document.querySelectorAll('.panel').forEach(p => p.hidden = true);
  const panel = document.getElementById('p-' + id);
  if (panel) {
    panel.hidden = false;
    panel.classList.add('animate-fade-up');
    setTimeout(() => panel.classList.remove('animate-fade-up'), 600);
  }
  
  const renderers = {
    home: renderHome,
    cls: renderClasses,
    recent: renderRecent,
    subj: renderSubjects,
    todo: renderTodo,
    alerts: renderAlerts,
    up: renderUpload,
    quiz: renderQuiz,
    rad: renderReview,
    sf9: renderSF9,
    ops: renderOps,
    comp: renderCompliance,
    lic: renderLicense,
    disc: renderDiscussions,
    cal: renderCalendar,
    msg: renderMessages,
    res: renderResources,
    grades: renderGrades,
    exams: renderExams,
    take: renderTakeExam
  };
  
  if (renderers[id]) renderers[id]();
}

// ===== RENDER: HOME =====
function renderHome() {
  const el = document.getElementById('p-home');
  if (!el) return;
  const pending = assignments.filter(a => a.status === 'pending').length;
  const unread = messages.filter(m => m.unread).length;
  
  el.innerHTML = `
    <div class="dash-hero">
      <h1 class="h3 mb-1">Good day, ${state.user.name.split(' ')[0]}!</h1>
      <p class="text-secondary mb-0">You have ${pending} pending assignments and ${unread} unread messages.</p>
    </div>
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="card stat-card animate-fade-up" style="animation-delay: 0.05s;">
          <div class="card-body">
            <div class="stat-label">Pending</div>
            <div class="stat-value">${pending}</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card stat-card animate-fade-up" style="animation-delay: 0.1s;">
          <div class="card-body">
            <div class="stat-label">Average</div>
            <div class="stat-value">88.5</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card stat-card animate-fade-up" style="animation-delay: 0.15s;">
          <div class="card-body">
            <div class="stat-label">Attendance</div>
            <div class="stat-value">96%</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card stat-card animate-fade-up" style="animation-delay: 0.2s;">
          <div class="card-body">
            <div class="stat-label">Courses</div>
            <div class="stat-value">6</div>
          </div>
        </div>
      </div>
    </div>
    <h2 class="h5 mb-3">My Courses</h2>
    <div class="row g-3 mb-4">
      ${courses.map((c, i) => `
        <div class="col-md-6 col-lg-4 animate-fade-up" style="animation-delay: ${i * 0.05}s;">
          <div class="course-tile" onclick="tab('cls')">
            <div class="d-flex align-items-center gap-3">
              <div class="course-badge" style="background:${c.color}">${c.code}</div>
              <div class="flex-grow-1">
                <div class="fw-semibold">${c.name}</div>
                <div class="text-secondary small">${c.teacher}</div>
              </div>
            </div>
            <div class="progress mt-3" style="height:4px;">
              <div class="progress-bar" style="width:${c.progress}%;background:${c.color}"></div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
    <h2 class="h5 mb-3">Upcoming</h2>
    ${assignments.filter(a => a.status === 'pending').slice(0, 3).map(a => {
      const course = courses.find(c => c.code === a.course);
      return `
        <div class="task-item border-warning animate-fade-up">
          <div class="course-badge" style="background:${course.color}">${a.course}</div>
          <div class="flex-grow-1">
            <div class="fw-semibold">${a.title}</div>
            <div class="text-secondary small">Due ${a.due} · ${course.name}</div>
          </div>
          <span class="chip chip-new">${a.points} pts</span>
        </div>
      `;
    }).join('')}
  `;
}

// ===== RENDER: CLASSES =====
function renderClasses() {
  const el = document.getElementById('p-cls');
  if (!el) return;
  el.innerHTML = `
    <h2 class="h4 mb-3">My Classes</h2>
    <div class="row g-3">
      ${courses.map((c, i) => `
        <div class="col-md-6 col-lg-4 animate-fade-up" style="animation-delay: ${i * 0.05}s;">
          <div class="card h-100 card-hover-lift">
            <div class="card-body">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="course-badge" style="background:${c.color}">${c.code}</div>
                <div>
                  <h3 class="h6 mb-0">${c.name}</h3>
                  <div class="text-secondary small">${c.teacher}</div>
                </div>
              </div>
              <div class="progress mb-3" style="height:6px;">
                <div class="progress-bar" style="width:${c.progress}%;background:${c.color}"></div>
              </div>
              <div class="d-flex justify-content-between small text-secondary mb-3">
                <span>Progress</span>
                <span>${c.progress}%</span>
              </div>
              <button class="btn btn-outline-secondary btn-sm w-100 btn-ripple" onclick="tab('subj')">View Course</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ===== RENDER: RECENT =====
function renderRecent() {
  const el = document.getElementById('p-recent');
  if (!el) return;
  const items = [
    { icon: 'bi-cloud-upload', text: 'Submitted Essay: My Hero', time: '2h ago', color: '#059669' },
    { icon: 'bi-check2-circle', text: 'Quiz graded: Science 18/20', time: '5h ago', color: '#2563EB' },
    { icon: 'bi-chat-dots', text: 'Replied to discussion on plate tectonics', time: '1d ago', color: '#7C3AED' },
    { icon: 'bi-calendar', text: 'Added Math Problem Set to calendar', time: '2d ago', color: '#D97706' }
  ];
  el.innerHTML = `
    <h2 class="h4 mb-3">Recent Activity</h2>
    ${items.map((item, i) => `
      <div class="task-item border-info animate-fade-up" style="animation-delay: ${i * 0.05}s;">
        <div class="course-badge" style="background:${item.color}"><i class="bi ${item.icon}"></i></div>
        <div class="flex-grow-1">
          <div class="fw-semibold">${item.text}</div>
          <div class="text-secondary small">${item.time}</div>
        </div>
      </div>
    `).join('')}
  `;
}

// ===== RENDER: SUBJECTS =====
function renderSubjects() {
  const el = document.getElementById('p-subj');
  if (!el) return;
  el.innerHTML = `
    <h2 class="h4 mb-3">Subjects</h2>
    <div class="row g-3">
      ${courses.map((c, i) => `
        <div class="col-md-6 animate-fade-up" style="animation-delay: ${i * 0.05}s;">
          <div class="card card-hover-lift">
            <div class="card-body">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="course-badge" style="background:${c.color}">${c.code}</div>
                <div>
                  <h3 class="h6 mb-0">${c.name}</h3>
                  <div class="text-secondary small">${c.teacher}</div>
                </div>
              </div>
              <div class="row g-2">
                ${assignments.filter(a => a.course === c.code).map(a => `
                  <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center small">
                      <span>${a.title}</span>
                      <span class="chip ${a.status === 'pending' ? 'chip-new' : ''}">${a.status}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ===== RENDER: TODO =====
function renderTodo() {
  const el = document.getElementById('p-todo');
  if (!el) return;
  const pending = assignments.filter(a => a.status === 'pending');
  el.innerHTML = `
    <h2 class="h4 mb-3">To-Do (${pending.length})</h2>
    ${pending.length ? pending.map((a, i) => {
      const course = courses.find(c => c.code === a.course);
      return `
        <div class="task-item border-warning animate-fade-up" style="animation-delay: ${i * 0.05}s;">
          <div class="course-badge" style="background:${course.color}">${a.course}</div>
          <div class="flex-grow-1">
            <div class="fw-semibold">${a.title}</div>
            <div class="text-secondary small">Due ${a.due} · ${course.name}</div>
          </div>
          <span class="chip chip-new">${a.points} pts</span>
        </div>
      `;
    }).join('') : `
      <div class="text-center py-5">
        <i class="bi bi-check2-circle text-success" style="font-size:3rem;"></i>
        <p class="text-secondary mt-3">All caught up!</p>
      </div>
    `}
  `;
}

// ===== RENDER: ALERTS =====
function renderAlerts() {
  const el = document.getElementById('p-alerts');
  if (!el) return;
  el.innerHTML = `
    <h2 class="h4 mb-3">Alerts</h2>
    ${state.notifications.map((n, i) => `
      <div class="task-item ${n.read ? 'border-success' : 'border-danger'} animate-fade-up" style="animation-delay: ${i * 0.05}s;">
        <div class="course-badge" style="background:${n.read ? '#64748B' : '#DC2626'}"><i class="bi bi-bell"></i></div>
        <div class="flex-grow-1">
          <div class="fw-semibold">${n.text}</div>
          <div class="text-secondary small">${n.time}</div>
        </div>
        ${!n.read ? '<span class="chip chip-new">New</span>' : ''}
      </div>
    `).join('')}
  `;
}

// ===== RENDER: UPLOAD =====
function renderUpload() {
  // Static in HTML, just reset progress
  const pb = document.getElementById('pb');
  if (pb) pb.style.width = '0%';
}

// ===== RENDER: QUIZ =====
function renderQuiz() {
  const el = document.getElementById('qz');
  if (!el) return;
  const questions = [
    { q: 'What is the capital of the Philippines?', options: ['Manila', 'Cebu', 'Davao', 'Baguio'], answer: 0 },
    { q: 'What is 15 × 4?', options: ['45', '60', '55', '50'], answer: 1 },
    { q: 'Who wrote Noli Me Tangere?', options: ['Andres Bonifacio', 'Jose Rizal', 'Emilio Aguinaldo', 'Apolinario Mabini'], answer: 1 }
  ];
  el.innerHTML = questions.map((q, i) => `
    <div class="mb-3">
      <p class="fw-semibold mb-2">${i + 1}. ${q.q}</p>
      ${q.options.map((o, j) => `
        <div class="form-check">
          <input class="form-check-input" type="radio" name="q${i}" id="q${i}o${j}" value="${j}" onchange="state.quizAnswers[${i}]=${j}">
          <label class="form-check-label" for="q${i}o${j}">${o}</label>
        </div>
      `).join('')}
    </div>
  `).join('');
}

// ===== RENDER: REVIEW & GRADE =====
function renderReview() {
  const el = document.getElementById('p-rad');
  if (!el) return;
  const kn = document.getElementById('kn');
  if (kn) kn.textContent = 'Student Progress';
  const tl = document.getElementById('tl');
  if (!tl) return;
  tl.innerHTML = `
    <div class="col-md-6">
      <div class="card">
        <div class="card-body">
          <h3 class="h6 mb-3">Submission Status</h3>
          ${assignments.map(a => `
            <div class="d-flex justify-content-between align-items-center mb-2 small">
              <span>${a.title}</span>
              <span class="chip ${a.status === 'submitted' ? '' : 'chip-new'}">${a.status}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card">
        <div class="card-body">
          <h3 class="h6 mb-3">Class Average</h3>
          ${courses.slice(0, 4).map(c => `
            <div class="bar-row">
              <span class="lb">${c.code}</span>
              <div class="progress">
                <div class="progress-bar" style="width:${c.progress}%;background:${c.color}"></div>
              </div>
              <span class="small text-secondary">${c.progress}%</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ===== RENDER: SF9 =====
function renderSF9() {
  const el = document.getElementById('sf');
  if (!el) return;
  el.innerHTML = `
    <div class="table-responsive">
      <table class="table table-sm">
        <thead><tr><th>Subject</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th></tr></thead>
        <tbody>
          ${grades.map(g => `
            <tr>
              <td>${g.course}</td>
              <td>${g.q1}</td>
              <td>${g.q2}</td>
              <td>${g.q3}</td>
              <td>${g.q4 || '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ===== RENDER: OPERATIONS =====
function renderOps() {
  const c1 = document.getElementById('c1');
  const c2 = document.getElementById('c2');
  const c3 = document.getElementById('c3');
  if (c1) c1.innerHTML = '<div class="stat-value">1,245</div><div class="text-secondary small">Students</div>';
  if (c2) c2.innerHTML = '<div class="stat-value">88.2</div><div class="text-secondary small">School average</div>';
  if (c3) c3.innerHTML = '<div class="stat-value">94.5%</div><div class="text-secondary small">Daily attendance</div>';
}

// ===== RENDER: COMPLIANCE =====
function renderCompliance() {
  const el = document.getElementById('cl');
  if (!el) return;
  const data = [
    { name: 'Ms. Reyes', reviewed: 45, logs: 12, status: 'Complete' },
    { name: 'Mr. Cruz', reviewed: 38, logs: 10, status: 'Complete' },
    { name: 'Mrs. Santos', reviewed: 52, logs: 12, status: 'Complete' },
    { name: 'G. Dela Cruz', reviewed: 30, logs: 8, status: 'Pending' }
  ];
  el.innerHTML = data.map(d => `
    <tr>
      <td>${d.name}</td>
      <td>${d.reviewed}</td>
      <td>${d.logs}</td>
      <td><span class="badge ${d.status === 'Complete' ? 'text-bg-success' : 'text-bg-warning'}">${d.status}</span></td>
    </tr>
  `).join('');
}

// ===== RENDER: LICENSE =====
function renderLicense() {
  // Static in HTML
}

// ===== RENDER: DISCUSSIONS =====
function renderDiscussions() {
  const el = document.getElementById('p-disc');
  if (!el) return;
  el.innerHTML = `
    <h2 class="h4 mb-3">Discussions</h2>
    ${discussions.map((d, i) => {
      const course = courses.find(c => c.code === d.course);
      return `
        <div class="card mb-3 animate-fade-up" style="animation-delay: ${i * 0.05}s;">
          <div class="card-body">
            <div class="d-flex align-items-center gap-3 mb-2">
              <div class="feed-avatar">${d.author.substring(0, 2).toUpperCase()}</div>
              <div>
                <div class="fw-semibold">${d.title}</div>
                <div class="text-secondary small">${d.author} · ${course.name} · ${d.time}</div>
              </div>
            </div>
            <p class="text-secondary small mb-2">${d.body}</p>
            <div class="d-flex gap-2">
              <span class="chip">${d.replies} replies</span>
              <button class="btn btn-outline-secondary btn-sm btn-ripple">Reply</button>
            </div>
          </div>
        </div>
      `;
    }).join('')}
  `;
}

// ===== RENDER: CALENDAR =====
function renderCalendar() {
  const el = document.getElementById('p-cal');
  if (!el) return;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();
  
  let daysHtml = '';
  for (let i = 0; i < firstDay; i++) daysHtml += '<div class="cal-day"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const hasEvent = calendarEvents[dateStr];
    daysHtml += `<div class="cal-day ${d === today ? 'today' : ''} ${hasEvent ? 'has-ev' : ''}">${d}</div>`;
  }
  
  el.innerHTML = `
    <h2 class="h4 mb-3">Calendar</h2>
    <div class="card">
      <div class="card-body">
        <div class="cal-grid mb-2">
          <div class="cal-hd">Sun</div><div class="cal-hd">Mon</div><div class="cal-hd">Tue</div>
          <div class="cal-hd">Wed</div><div class="cal-hd">Thu</div><div class="cal-hd">Fri</div><div class="cal-hd">Sat</div>
        </div>
        <div class="cal-grid">${daysHtml}</div>
      </div>
    </div>
  `;
}

// ===== RENDER: MESSAGES =====
function renderMessages() {
  const el = document.getElementById('p-msg');
  if (!el) return;
  el.innerHTML = `
    <h2 class="h4 mb-3">Messages</h2>
    ${messages.map((m, i) => `
      <div class="task-item ${m.unread ? 'border-danger' : 'border-success'} animate-fade-up" style="animation-delay: ${i * 0.05}s;">
        <div class="feed-avatar">${m.from.substring(0, 2).toUpperCase()}</div>
        <div class="flex-grow-1">
          <div class="fw-semibold">${m.subject}</div>
          <div class="text-secondary small">${m.from} · ${m.time}</div>
          <div class="text-secondary small">${m.preview}</div>
        </div>
        ${m.unread ? '<span class="chip chip-new">Unread</span>' : ''}
      </div>
    `).join('')}
  `;
}

// ===== RENDER: RESOURCES =====
function renderResources() {
  const el = document.getElementById('p-res');
  if (!el) return;
  el.innerHTML = `
    <h2 class="h4 mb-3">Resources</h2>
    <div class="row g-3">
      ${resources.map((r, i) => {
        const course = courses.find(c => c.code === r.course);
        return `
          <div class="col-md-6 animate-fade-up" style="animation-delay: ${i * 0.05}s;">
            <div class="card card-hover-lift">
              <div class="card-body d-flex align-items-center gap-3">
                <div class="course-badge" style="background:${course.color}"><i class="bi bi-file-earmark-text"></i></div>
                <div class="flex-grow-1">
                  <div class="fw-semibold">${r.title}</div>
                  <div class="text-secondary small">${course.name} · ${r.size}</div>
                </div>
                <button class="btn btn-outline-secondary btn-sm btn-ripple"><i class="bi bi-download"></i></button>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ===== RENDER: GRADES =====
function renderGrades() {
  const el = document.getElementById('p-grades');
  if (!el) return;
  el.innerHTML = `
    <h2 class="h4 mb-3">My Grades</h2>
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead><tr><th>Subject</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th><th>Final</th></tr></thead>
            <tbody>
              ${grades.map(g => {
                const avg = ((g.q1 + g.q2 + g.q3) / 3).toFixed(1);
                return `
                  <tr>
                    <td>${g.course}</td>
                    <td>${g.q1}</td>
                    <td>${g.q2}</td>
                    <td>${g.q3}</td>
                    <td>${g.q4 || '—'}</td>
                    <td><strong>${avg}</strong></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ===== RENDER: EXAMS =====
function renderExams() {
  const el = document.getElementById('p-exams');
  if (!el) return;
  el.innerHTML = `
    <h2 class="h4 mb-3">Exams</h2>
    ${exams.map((e, i) => {
      const course = courses.find(c => c.code === e.course);
      return `
        <div class="task-item border-info animate-fade-up" style="animation-delay: ${i * 0.05}s;">
          <div class="course-badge" style="background:${course.color}">${e.course}</div>
          <div class="flex-grow-1">
            <div class="fw-semibold">${e.title}</div>
            <div class="text-secondary small">${e.date} · ${e.duration}</div>
          </div>
          <button class="btn btn-primary btn-sm btn-ripple" onclick="tab('take')">Take Exam</button>
        </div>
      `;
    }).join('')}
  `;
}

// ===== RENDER: TAKE EXAM =====
function renderTakeExam() {
  const el = document.getElementById('p-take');
  if (!el) return;
  el.innerHTML = `
    <div class="card animate-fade-up">
      <div class="card-body">
        <h2 class="h5">Science Quarterly Exam</h2>
        <p class="text-secondary small">60 minutes · 20 questions</p>
        <div class="progress mb-3" style="height:6px;">
          <div class="progress-bar bg-success progress-bar-striped progress-bar-animated" style="width:0%"></div>
        </div>
        <p class="mb-3">Question 1 of 20</p>
        <p class="fw-semibold">What is the powerhouse of the cell?</p>
        <div class="form-check mb-2">
          <input class="form-check-input" type="radio" name="exam" id="e1">
          <label class="form-check-label" for="e1">Nucleus</label>
        </div>
        <div class="form-check mb-2">
          <input class="form-check-input" type="radio" name="exam" id="e2">
          <label class="form-check-label" for="e2">Mitochondria</label>
        </div>
        <div class="form-check mb-3">
          <input class="form-check-input" type="radio" name="exam" id="e3">
          <label class="form-check-label" for="e3">Ribosome</label>
        </div>
        <button class="btn btn-primary btn-ripple" onclick="toast('Answer saved')">Next Question</button>
      </div>
    </div>
  `;
}

// ===== DASHBOARD INIT =====
function renderDash() {
  const userName = document.getElementById('userName');
  const userRole = document.getElementById('userRole');
  const av = document.getElementById('av');
  if (userName) userName.textContent = state.user.name;
  if (userRole) userRole.textContent = state.role;
  if (av) av.textContent = state.user.name.substring(0, 1);
  
  initSideNav();
  tab('home');
}

// ===== LOGIN =====
function doLogin() {
  const roleBtn = document.querySelector('.role-btn.active');
  if (roleBtn) state.role = roleBtn.dataset.role || roleBtn.textContent.trim();
  const email = document.getElementById('em')?.value || 'demo@school.edu.ph';
  state.user.name = email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Demo User';
  view('dash');
  toast('Signed in as ' + state.role);
}

function resetDB() {
  toast('Demo data reset');
  setTimeout(() => location.reload(), 800);
}

// ===== SEARCH =====
function onSearch(val) {
  state.search = val;
}

// ===== QUARTER =====
function setQuarter(val) {
  state.quarter = val;
  toast('Switched to ' + val);
}

// ===== QUIZ =====
function gradeQuiz() {
  const qm = document.getElementById('qm');
  if (qm) qm.textContent = 'Score: 2 / 3 (67%)';
  toast('Quiz submitted');
}

function brownout() {
  const qm = document.getElementById('qm');
  if (qm) qm.textContent = 'Brownout simulated — answers recovered from local storage.';
  toast('Answers recovered');
}

// ===== UPLOAD =====
function compress() {
  const pb = document.getElementById('pb');
  const pm = document.getElementById('pm');
  const cb = document.getElementById('cb');
  if (cb) cb.disabled = true;
  let p = 0;
  const iv = setInterval(() => {
    p += 10;
    if (pb) pb.style.width = p + '%';
    if (pm) pm.textContent = p < 100 ? `Compressing… ${p}%` : 'Submitted successfully!';
    if (p >= 100) {
      clearInterval(iv);
      if (cb) cb.disabled = false;
      toast('File compressed & submitted');
    }
  }, 200);
}

// ===== SIGNATURE =====
function initSignature() {
  const canvas = document.getElementById('sig');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let drawing = false;
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  ctx.strokeStyle = '#041E42';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  
  canvas.addEventListener('mousedown', () => drawing = true);
  canvas.addEventListener('mouseup', () => drawing = false);
  canvas.addEventListener('mousemove', e => {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  });
  canvas.addEventListener('mouseleave', () => drawing = false);
  
  canvas.addEventListener('touchstart', e => { e.preventDefault(); drawing = true; });
  canvas.addEventListener('touchend', () => drawing = false);
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctx.stroke();
  });
}

function clearSig() {
  const canvas = document.getElementById('sig');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function approve(method) {
  const ap = document.getElementById('ap');
  if (ap) ap.textContent = `Approved via ${method} on ${new Date().toLocaleDateString()}`;
  toast('Report card approved');
}

// ===== TOAST =====
function toast(msg, type) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.hidden = false;
  t.style.animation = 'none';
  void t.offsetWidth;
  t.style.animation = 'fadeUp 0.3s ease both';
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => { t.hidden = true; }, 2800);
}

// Expose globally
window.toast = toast;
window.tab = tab;
window.view = view;
window.doLogin = doLogin;
window.resetDB = resetDB;
window.openBuy = openBuy;
window.submitBuy = submitBuy;
window.toggleSide = toggleSide;
window.onSearch = onSearch;
window.setQuarter = setQuarter;
window.gradeQuiz = gradeQuiz;
window.brownout = brownout;
window.compress = compress;
window.clearSig = clearSig;
window.approve = approve;
