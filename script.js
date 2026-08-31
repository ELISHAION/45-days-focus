/* =========================================================================
   45 DAYS FOCUS — app logic
   Vanilla JS, no build step, no dependencies. IndexedDB for storage,
   Service Worker for offline. Everything lives on this device.
   ========================================================================= */

/* ---------------------------------------------------------------------
   1. CONSTANTS & CONTENT DATA
   --------------------------------------------------------------------- */
const TOTAL_DAYS = 45;

const PHASES = [
  { from: 1, to: 15, name: 'Foundation' },
  { from: 16, to: 30, name: 'Intermediate' },
  { from: 31, to: 45, name: 'Advanced + Project' }
];

function phaseForDay(day) {
  return PHASES.find(p => day >= p.from && day <= p.to) || PHASES[PHASES.length - 1];
}

// One topic per day per subject (index 0 = Day 1).
const MONGO_TOPICS = [
  "Introduction to NoSQL & MongoDB",
  "Installing MongoDB & tooling (Compass / Atlas)",
  "Databases & collections",
  "Documents & BSON data types",
  "CRUD: insertOne & insertMany",
  "CRUD: find() & query basics",
  "CRUD: updateOne & updateMany",
  "CRUD: deleteOne & deleteMany",
  "Query operators ($gt, $lt, $in, $or, $and)",
  "Working with arrays & embedded documents",
  "Data modeling: embedding vs referencing",
  "Indexes: basics & types",
  "Aggregation framework: $match & $group",
  "Aggregation framework: $project & $sort",
  "Foundation practice project: build a CRUD app",
  "Advanced queries & projections",
  "Indexing strategies: compound & multikey indexes",
  "Text & wildcard indexes",
  "Explain plans & query performance",
  "Query optimization techniques",
  "Aggregation pipeline: advanced stages",
  "Aggregation: $lookup & joins",
  "Transactions in MongoDB",
  "Replica sets: concepts",
  "Replica sets: setup & failover",
  "High availability concepts",
  "Sharding: concepts & shard keys",
  "Sharding: setup basics",
  "Backup & restore strategies",
  "Security: authentication, roles & monitoring",
  "MongoDB Atlas: overview & cluster setup",
  "Atlas security configuration",
  "Atlas monitoring & alerts",
  "Performance tuning deep dive",
  "Backup & disaster recovery planning",
  "Production scenario: scaling reads",
  "Production scenario: handling failover",
  "Troubleshooting common issues",
  "Capacity planning & production readiness",
  "Interview prep: core concepts review",
  "Interview prep: system design with MongoDB",
  "Capstone project: design schema",
  "Capstone project: build & test",
  "Revision: full topic review",
  "Final assessment & reflection"
];

const AI_TOPICS = [
  "What is AI, ML & DL — overview & differences",
  "Python basics refresher for AI/ML",
  "NumPy fundamentals",
  "Pandas fundamentals",
  "Data preprocessing & exploration",
  "Introduction to Generative AI",
  "LLM basics: how language models work",
  "Transformer architecture overview",
  "Prompting fundamentals",
  "Prompt engineering techniques",
  "Hugging Face: models & pipelines",
  "Hugging Face: tokenizers & inference",
  "LangChain basics: chains & prompts",
  "LangChain basics: memory & output parsers",
  "Foundation practice project: simple AI script",
  "LLM architecture deep dive",
  "Attention mechanism explained",
  "Embeddings: concepts & generation",
  "Vector databases overview",
  "Introduction to RAG (Retrieval-Augmented Generation)",
  "RAG architecture & components",
  "LangChain: document loaders",
  "LangChain: text splitting strategies",
  "LangChain: vector store integration",
  "Prompt templates & chains in LangChain",
  "Retrieval chains & QA chains",
  "Evaluating RAG quality",
  "Building a basic RAG pipeline — part 1",
  "Building a basic RAG pipeline — part 2",
  "Intermediate RAG project: wrap-up",
  "Advanced RAG techniques",
  "Retrieval optimization & re-ranking",
  "Agents: concepts & architectures",
  "Tool calling & function calling",
  "Advanced LangChain: agents & tools",
  "Building AI applications: architecture",
  "MongoDB + AI integration (Atlas Vector Search)",
  "Practical project: MongoDB-backed RAG app — part 1",
  "Practical project: MongoDB-backed RAG app — part 2",
  "Testing AI applications",
  "Debugging AI pipelines",
  "Interview prep: AI/ML concepts",
  "Interview prep: system design for AI apps",
  "Revision: full topic review",
  "Final assessment & reflection"
];

const EXPENSE_CATEGORIES = [
  { name: 'Food', emoji: '🍔' },
  { name: 'Groceries', emoji: '🛒' },
  { name: 'Travel', emoji: '🚌' },
  { name: 'Snacks/Drinks', emoji: '🥤' },
  { name: 'Shopping', emoji: '🛍️' },
  { name: 'Learning', emoji: '📚' },
  { name: 'Home', emoji: '🏠' },
  { name: 'Bills/Recharge', emoji: '🧾' },
  { name: 'Personal', emoji: '🧴' },
  { name: 'Entertainment', emoji: '🎬' },
  { name: 'Other', emoji: '❔' }
];
const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank'];
const INCOME_TYPES = ['Salary', 'Bonus', 'Other Income'];
const CATEGORY_EMOJI = Object.fromEntries(EXPENSE_CATEGORIES.map(c => [c.name, c.emoji]));

const VERDICTS = {
  5: { emoji: '🔥', label: 'Excellent Day' },
  4: { emoji: '✅', label: 'Productive Day' },
  3: { emoji: '👍', label: 'Good Day' },
  2: { emoji: '⚠️', label: 'Average Day' },
  1: { emoji: '🚨', label: 'Poor Day' }
};
const VERDICT_COLOR = { 5: 'var(--mongo)', 4: 'var(--mongo)', 3: 'var(--ai)', 2: 'var(--amber)', 1: 'var(--danger)' };

const TIME_USED_OPTIONS = ['Excellent', 'Good', 'Average', 'Poor', 'Wasted Most'];
const WASTED_OPTIONS = ['No', 'Little', 'Moderate', 'A lot', 'Too much'];
const DISTRACTION_OPTIONS = ['Social Media', 'YouTube', 'Procrastination', 'Poor Planning', 'Tiredness', 'Work', 'Nothing'];

function uid() {
  return (crypto.randomUUID ? crypto.randomUUID() : (Date.now() + '-' + Math.random().toString(16).slice(2)));
}

function defaultActivities() {
  const mk = (name, planned, startTime) => ({ id: uid(), name, plannedMin: planned, actualMin: 0, status: 'not_started', notes: '', startTime: startTime || null });
  return {
    morning: [mk('Wake up & plan the day', 15, '07:00'), mk('MongoDB study session', 45, '07:20')],
    afternoon: [mk('AI study session', 60, '13:00'), mk('Practice / project work', 45, '14:15')],
    evening: [mk('Review & revise notes', 30, '18:00'), mk('Exercise / walk', 30, '18:35')],
    night: [mk('Light reading', 20, '21:00'), mk('End-of-day reflection', 15, '21:25')]
  };
}

function defaultRoadmapTasks(dayIndex) {
  const mongoTopic = MONGO_TOPICS[dayIndex] || 'Revision';
  const aiTopic = AI_TOPICS[dayIndex] || 'Revision';
  const mk = (text, practice) => ({ id: uid(), text, done: false, notes: '', practice: !!practice });
  return {
    mongodb: {
      topic: mongoTopic,
      tasks: [
        mk('Learn: ' + mongoTopic, false),
        mk('Practice task: apply "' + mongoTopic + '" hands-on in mongosh / Compass', true)
      ]
    },
    ai: {
      topic: aiTopic,
      tasks: [
        mk('Learn: ' + aiTopic, false),
        mk('Practice task: apply "' + aiTopic + '" in a small script / notebook', true)
      ]
    }
  };
}

/* ---------------------------------------------------------------------
   2. INDEXEDDB LAYER
   --------------------------------------------------------------------- */
const DB_NAME = 'focus45db';
const DB_VERSION = 2;
let _db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' });
      if (!db.objectStoreNames.contains('days')) db.createObjectStore('days', { keyPath: 'day' });
      if (!db.objectStoreNames.contains('expenses')) db.createObjectStore('expenses', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('income')) db.createObjectStore('income', { keyPath: 'id' });
    };
    req.onsuccess = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror = (e) => reject(e.target.error);
  });
}

function tx(store, mode) { return _db.transaction(store, mode).objectStore(store); }

function idbGet(store, key) {
  return new Promise((resolve, reject) => {
    const r = tx(store, 'readonly').get(key);
    r.onsuccess = () => resolve(r.result || null);
    r.onerror = () => reject(r.error);
  });
}
function idbGetAll(store) {
  return new Promise((resolve, reject) => {
    const r = tx(store, 'readonly').getAll();
    r.onsuccess = () => resolve(r.result || []);
    r.onerror = () => reject(r.error);
  });
}
function idbPut(store, value) {
  return new Promise((resolve, reject) => {
    const r = tx(store, 'readwrite').put(value);
    r.onsuccess = () => resolve(value);
    r.onerror = () => reject(r.error);
  });
}
function idbDelete(store, key) {
  return new Promise((resolve, reject) => {
    const r = tx(store, 'readwrite').delete(key);
    r.onsuccess = () => resolve();
    r.onerror = () => reject(r.error);
  });
}
function idbClear(store) {
  return new Promise((resolve, reject) => {
    const r = tx(store, 'readwrite').clear();
    r.onsuccess = () => resolve();
    r.onerror = () => reject(r.error);
  });
}

async function getSetting(key, fallback) {
  const rec = await idbGet('settings', key);
  return rec ? rec.value : fallback;
}
async function setSetting(key, value) {
  return idbPut('settings', { key, value });
}

async function getDay(dayNumber) {
  let rec = await idbGet('days', dayNumber);
  if (!rec) {
    rec = {
      day: dayNumber,
      activities: defaultActivities(),
      roadmap: defaultRoadmapTasks(dayNumber - 1),
      review: null,
      tasksWritten: false
    };
    await idbPut('days', rec);
  }
  return rec;
}
async function saveDay(rec) { return idbPut('days', rec); }
async function getAllDays() { return idbGetAll('days'); }

/* ---------------------------------------------------------------------
   3d. EXPENSES / INCOME DATA LAYER
   --------------------------------------------------------------------- */
async function addExpense(rec) { rec.id = rec.id || uid(); return idbPut('expenses', rec); }
async function deleteExpense(id) { return idbDelete('expenses', id); }
async function getAllExpenses() { return idbGetAll('expenses'); }

async function addIncome(rec) { rec.id = rec.id || uid(); return idbPut('income', rec); }
async function deleteIncome(id) { return idbDelete('income', id); }
async function getAllIncome() { return idbGetAll('income'); }

/* ---------------------------------------------------------------------
   3. DATE / DAY-NUMBER HELPERS
   --------------------------------------------------------------------- */
function toDateOnly(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function parseYMD(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function fmtYMD(d) { const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0'); return `${y}-${m}-${day}`; }
function fmtDisplayDate(d) { return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }); }

function dayNumberForToday(startDateStr) {
  const start = toDateOnly(parseYMD(startDateStr));
  const today = toDateOnly(new Date());
  const diffMs = today - start;
  return Math.round(diffMs / 86400000) + 1;
}
function dateStrForDay(startDateStr, dayNumber) {
  const start = toDateOnly(parseYMD(startDateStr));
  const d = new Date(start);
  d.setDate(d.getDate() + (dayNumber - 1));
  return d;
}

/* ---------------------------------------------------------------------
   3e. MONEY DATE-RANGE HELPERS (week = Sun-Sat, month = calendar month)
   --------------------------------------------------------------------- */
function nowTimeStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function monthKeyOf(dateStr) { return dateStr.slice(0, 7); } // 'YYYY-MM'
function monthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}
function startOfWeek(d) {
  const x = toDateOnly(d);
  x.setDate(x.getDate() - x.getDay());
  return x;
}
function inRange(dateStr, fromDate, toDateIncl) {
  const d = toDateOnly(parseYMD(dateStr));
  return d >= fromDate && d <= toDateIncl;
}
function sum(arr, fn) { return arr.reduce((s, x) => s + (Number(fn(x)) || 0), 0); }

const USER_NAME = 'Elisha';

const FOCUS_QUOTES = [
  "Discipline is choosing between what you want now and what you want most.",
  "Small daily improvements lead to staggering long-term results.",
  "You don't have to be great to start, but you have to start to be great.",
  "The expert in anything was once a beginner who refused to quit.",
  "Consistency beats intensity — show up today, and tomorrow will thank you.",
  "Every line of code and every honest review is a brick in the life you're building.",
  "Focus on progress, not perfection.",
  "Your future is built in the quiet, unglamorous work you do today.",
  "Discipline is the bridge between goals and accomplishment.",
  "One day at a time. One task at a time. That's how mastery happens.",
  "The best investment you'll ever make is in yourself.",
  "Success isn't a big leap — it's forty-five small, honest steps."
];

function greetingForNow() {
  const h = new Date().getHours();
  if (h < 5) return `Still up, ${USER_NAME}?`;
  if (h < 12) return `Good morning, ${USER_NAME}`;
  if (h < 17) return `Good afternoon, ${USER_NAME}`;
  if (h < 21) return `Good evening, ${USER_NAME}`;
  return `Good night, ${USER_NAME}`;
}

function showSplashScreen() {
  const greetEl = document.getElementById('splash-greeting');
  const quoteEl = document.getElementById('splash-quote');
  if (greetEl) greetEl.textContent = greetingForNow();
  if (quoteEl) {
    const q = FOCUS_QUOTES[Math.floor(Math.random() * FOCUS_QUOTES.length)];
    quoteEl.innerHTML = `<span class="qmark">“</span>${q}<span class="qmark">”</span>`;
  }
  const splash = document.getElementById('splash');
  setTimeout(() => { if (splash) splash.classList.add('hide'); }, 1600);
}

/* ---------------------------------------------------------------------
   3b. TIME HELPERS
   --------------------------------------------------------------------- */
function formatTime12(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  let h12 = h % 12; if (h12 === 0) h12 = 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}
function minutesToHHMM(mins) {
  mins = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
function hhmmToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}
function periodForTime(hhmm) {
  const h = Number(hhmm.split(':')[0]);
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

/* ---------------------------------------------------------------------
   3c. CALENDAR WIDGET (self-contained, works the same on every browser)
   --------------------------------------------------------------------- */
function buildCalendar(containerId, initialDateStr, onPick) {
  const container = document.getElementById(containerId);
  let selected = initialDateStr ? parseYMD(initialDateStr) : new Date();
  let viewYear = selected.getFullYear();
  let viewMonth = selected.getMonth();
  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DOW = ['S','M','T','W','T','F','S'];

  function draw() {
    const today = toDateOnly(new Date());
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    let cells = '';
    for (let i = 0; i < startWeekday; i++) cells += `<button class="cal-day" disabled></button>`;
    for (let d = 1; d <= daysInMonth; d++) {
      const thisDate = toDateOnly(new Date(viewYear, viewMonth, d));
      const isSelected = fmtYMD(thisDate) === fmtYMD(selected);
      const isToday = thisDate.getTime() === today.getTime();
      cells += `<button class="cal-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}" data-d="${d}">${d}</button>`;
    }
    container.innerHTML = `
      <div class="cal-wrap">
        <div class="cal-header">
          <button class="cal-nav-btn" id="cal-prev">‹</button>
          <span class="cal-title">${MONTH_NAMES[viewMonth]} ${viewYear}</span>
          <button class="cal-nav-btn" id="cal-next">›</button>
        </div>
        <div class="cal-grid">${DOW.map(d => `<div class="cal-dow">${d}</div>`).join('')}${cells}</div>
        <div class="cal-selected-label">Selected: <b>${fmtDisplayDate(selected)}</b></div>
      </div>`;
    container.querySelector('#cal-prev').addEventListener('click', () => {
      viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } draw();
    });
    container.querySelector('#cal-next').addEventListener('click', () => {
      viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } draw();
    });
    container.querySelectorAll('.cal-day[data-d]').forEach(btn => {
      btn.addEventListener('click', () => {
        selected = toDateOnly(new Date(viewYear, viewMonth, Number(btn.dataset.d)));
        onPick(fmtYMD(selected));
        draw();
      });
    });
  }
  draw();
  return { getValue: () => fmtYMD(selected) };
}

/* ---------------------------------------------------------------------
   4. APP STATE
   --------------------------------------------------------------------- */
const state = {
  startDate: null,
  currentTab: 'daily',
  todayDayNumber: 1,
  viewingDay: 1,        // which day the Daily tab currently displays
  roadmapDay: 1,        // which day the Roadmap tab currently displays
  historyOpenDay: null,
  theme: 'dark',
  moneyMonth: null // {year, month} currently viewed in Expenses tab
};

const $root = () => document.getElementById('view-root');
const $topbarTitle = () => document.getElementById('topbar-title');

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.add('hidden'), 1800);
}

function closeModal() {
  document.getElementById('modal-backdrop').classList.add('hidden');
  document.getElementById('modal-card').innerHTML = '';
}
function openModal(html) {
  document.getElementById('modal-card').innerHTML = html;
  document.getElementById('modal-backdrop').classList.remove('hidden');
}
document.getElementById('modal-backdrop').addEventListener('click', (e) => {
  if (e.target.id === 'modal-backdrop') closeModal();
});

/* ---------------------------------------------------------------------
   5. INIT
   --------------------------------------------------------------------- */
async function init() {
  showSplashScreen();
  await openDB();
  const startDate = await getSetting('startDate', null);
  state.theme = await getSetting('theme', 'dark');
  applyTheme();

  if (!startDate) {
    document.getElementById('onboarding').classList.remove('hidden');
    const cal = buildCalendar('onboarding-calendar', fmtYMD(new Date()), () => {});
    document.getElementById('onboarding-confirm').addEventListener('click', async () => {
      const val = cal.getValue();
      await setSetting('startDate', val);
      document.getElementById('onboarding').classList.add('hidden');
      state.startDate = val;
      boot();
    });
    return;
  }
  state.startDate = startDate;
  boot();
}

function boot() {
  document.getElementById('app').classList.remove('hidden');
  $topbarTitle().textContent = greetingForNow();
  state.todayDayNumber = dayNumberForToday(state.startDate);
  state.viewingDay = clamp(state.todayDayNumber, 1, TOTAL_DAYS);
  state.roadmapDay = clamp(state.todayDayNumber, 1, TOTAL_DAYS);
  const today = new Date();
  state.moneyMonth = { year: today.getFullYear(), month: today.getMonth() };

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('settings-btn').addEventListener('click', openSettings);

  if (state.todayDayNumber > TOTAL_DAYS) {
    renderFinalReportGate();
  } else {
    renderCurrentTab();
  }
  registerSW();
}

function clamp(n, min, max) { return Math.min(Math.max(n, min), max); }

function switchTab(tab) {
  state.currentTab = tab;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  $topbarTitle().textContent = tab === 'daily' ? greetingForNow() : tab === 'roadmap' ? '45-Day Roadmap' : 'Expenses';
  renderCurrentTab();
}

function renderCurrentTab() {
  if (state.currentTab === 'daily') { hideMoneyFab(); renderDailyView(); }
  else if (state.currentTab === 'roadmap') { hideMoneyFab(); renderRoadmapView(); }
  else renderExpensesView();
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = state.theme === 'dark' ? '🌙' : '☀️';
}
async function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
  await setSetting('theme', state.theme);
}

/* ---------------------------------------------------------------------
   6. PRODUCTIVITY CALCULATIONS
   --------------------------------------------------------------------- */
function allActivities(day) {
  return [...day.activities.morning, ...day.activities.afternoon, ...day.activities.evening, ...day.activities.night];
}
function activityStats(day) {
  const acts = allActivities(day);
  const total = acts.length;
  const completed = acts.filter(a => a.status === 'completed').length;
  const plannedMin = acts.reduce((s, a) => s + (Number(a.plannedMin) || 0), 0);
  const actualMin = acts.reduce((s, a) => s + (Number(a.actualMin) || 0), 0);
  const wastedMin = Math.max(0, plannedMin - actualMin);
  const completionPct = total ? Math.round((completed / total) * 100) : 0;
  const timeRatio = plannedMin ? Math.min(actualMin / plannedMin, 1) : 0;
  const productivityScore = total ? Math.round(completionPct * 0.5 + timeRatio * 100 * 0.5) : 0;
  return { total, completed, plannedMin, actualMin, wastedMin, completionPct, productivityScore };
}
function roadmapStatsForDay(day) {
  const tasks = [...day.roadmap.mongodb.tasks, ...day.roadmap.ai.tasks];
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const mTotal = day.roadmap.mongodb.tasks.length;
  const mDone = day.roadmap.mongodb.tasks.filter(t => t.done).length;
  const aTotal = day.roadmap.ai.tasks.length;
  const aDone = day.roadmap.ai.tasks.filter(t => t.done).length;
  return {
    total, done, pct: total ? Math.round((done / total) * 100) : 0,
    mongoPct: mTotal ? Math.round((mDone / mTotal) * 100) : 0,
    aiPct: aTotal ? Math.round((aDone / aTotal) * 100) : 0
  };
}
function verdictForRating(rating) {
  return VERDICTS[rating] || VERDICTS[3];
}

/* ---------------------------------------------------------------------
   6b. WRITE-YOUR-TASKS → AUTO SCHEDULE
   --------------------------------------------------------------------- */
const TIME_LINE_RE = /^\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?\s*[-–:]?\s*(.*)$/;

function parseTasksText(text) {
  return text.split('\n').map(l => l.trim()).filter(Boolean).map(line => {
    const m = line.match(TIME_LINE_RE);
    if (m && m[4] && m[4].trim() && (m[3] || Number(m[1]) <= 24)) {
      let hour = Number(m[1]);
      const min = m[2] ? Number(m[2]) : 0;
      const ap = m[3] ? m[3].toLowerCase() : null;
      if (ap === 'pm' && hour < 12) hour += 12;
      if (ap === 'am' && hour === 12) hour = 0;
      if (!ap && hour > 23) return { name: line, startTime: null };
      return { name: m[4].trim(), startTime: `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}` };
    }
    return { name: line, startTime: null };
  }).filter(t => t.name);
}

function generateDayFromTasks(day, text, defaultDurationMin) {
  const parsed = parseTasksText(text);
  const groups = { morning: [], afternoon: [], evening: [], night: [] };
  let cursor = 7 * 60; // default cursor starts at 7:00 AM
  parsed.forEach(t => {
    if (t.startTime) cursor = hhmmToMinutes(t.startTime);
    const hhmm = minutesToHHMM(cursor);
    const period = periodForTime(hhmm);
    groups[period].push({
      id: uid(), name: t.name, plannedMin: defaultDurationMin, actualMin: 0,
      status: 'not_started', notes: '', startTime: hhmm
    });
    cursor += defaultDurationMin;
  });
  for (const p of Object.keys(groups)) groups[p].sort((a, b) => hhmmToMinutes(a.startTime) - hhmmToMinutes(b.startTime));
  day.activities = groups;
  day.tasksWritten = true;
}

function taskWriterCardHTML() {
  return `
    <div class="task-writer-card">
      <div class="card-title" style="margin-bottom:2px;">✍️ Write Your Tasks</div>
      <p>List today's tasks, one per line. Add a time if you want (e.g. "7:00am Study MongoDB"). We'll build your full-day schedule automatically — you can edit the timing after.</p>
      <textarea class="textarea-field" id="tw-input" style="min-height:120px;" placeholder="7:00am Wake up &amp; plan the day&#10;MongoDB study session&#10;1:00pm AI study session&#10;Exercise&#10;Evening revision"></textarea>
      <div class="field-block" style="margin-top:10px;margin-bottom:0;">
        <label>Default duration per task (minutes, used when you don't set one)</label>
        <input class="text-field" id="tw-duration" type="number" min="5" value="30">
      </div>
      <div class="row" style="margin-top:12px;gap:10px;">
        <button class="btn-secondary" id="tw-skip" style="margin-top:0;">Skip, use defaults</button>
        <button class="btn-primary" id="tw-generate" style="margin-top:0;">Generate My Day</button>
      </div>
    </div>`;
}

function wireTaskWriterCard(day) {
  const skipBtn = document.getElementById('tw-skip');
  const genBtn = document.getElementById('tw-generate');
  if (skipBtn) skipBtn.addEventListener('click', async () => {
    day.tasksWritten = true;
    await saveDay(day);
    renderDailyView();
  });
  if (genBtn) genBtn.addEventListener('click', async () => {
    const text = document.getElementById('tw-input').value;
    if (!text.trim()) { showToast('Write at least one task'); return; }
    const dur = Number(document.getElementById('tw-duration').value) || 30;
    generateDayFromTasks(day, text, dur);
    await saveDay(day);
    renderDailyView();
    showToast('Day generated — tap ✎ on any task to adjust timing');
  });
}

function openRewriteTasksModal(day) {
  openModal(`
    <div class="modal-title">Rewrite Today's Tasks</div>
    <p class="muted" style="margin-top:-8px;">This replaces all of today's scheduled activities.</p>
    ${taskWriterCardHTML()}
  `);
  document.getElementById('tw-skip').textContent = 'Cancel';
  document.getElementById('tw-skip').addEventListener('click', closeModal);
  document.getElementById('tw-generate').addEventListener('click', async () => {
    const text = document.getElementById('tw-input').value;
    if (!text.trim()) { showToast('Write at least one task'); return; }
    const dur = Number(document.getElementById('tw-duration').value) || 30;
    generateDayFromTasks(day, text, dur);
    await saveDay(day);
    closeModal();
    renderDailyView();
    showToast('Day regenerated — tap ✎ on any task to adjust timing');
  });
}

/* ---------------------------------------------------------------------
   7. DAILY ACTIVITY VIEW
   --------------------------------------------------------------------- */
const GROUP_LABELS = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', night: 'Night' };
const STATUS_LABELS = { not_started: 'Not Started', in_progress: 'In Progress', completed: 'Completed', skipped: 'Skipped' };

async function renderDailyView() {
  const dayNum = state.viewingDay;
  $topbarTitle().textContent = greetingForNow();

  if (dayNum < 1) {
    $root().innerHTML = `
      <div class="card" style="text-align:center;">
        <div class="card-title">Not started yet</div>
        <p class="muted">Your challenge starts on <b>${fmtDisplayDate(parseYMD(state.startDate))}</b>.</p>
      </div>`;
    return;
  }

  const day = await getDay(dayNum);
  const stats = activityStats(day);
  const dateStr = dateStrForDay(state.startDate, dayNum);
  const ring = ringSVG(stats.completionPct);

  $root().innerHTML = `
    <div class="card">
      <div class="day-hero">
        <div class="day-hero-ring">${ring}
          <div class="day-hero-num"><span class="n">${dayNum}</span><span class="d">/ ${TOTAL_DAYS}</span></div>
        </div>
        <div class="day-hero-meta">
          <div class="day-hero-date">${fmtDisplayDate(dateStr)}</div>
          <div class="day-hero-pct">${stats.completionPct}% <span style="font-size:12px;color:var(--text-muted);font-weight:400;">complete</span></div>
          <div class="progress-bar" style="margin-top:6px;"><i style="width:${stats.completionPct}%"></i></div>
        </div>
      </div>
      ${dayNum !== state.todayDayNumber ? `<div class="row" style="margin-top:10px;">
        <button class="link-btn" id="jump-today-btn">← Back to Today (Day ${clamp(state.todayDayNumber,1,TOTAL_DAYS)})</button>
      </div>` : ''}
    </div>

    <div class="card">
      <div class="card-title">Productivity</div>
      <div class="stat-grid">
        <div class="stat-box"><div class="stat-num">${stats.plannedMin}m</div><div class="stat-label">Planned time</div></div>
        <div class="stat-box"><div class="stat-num">${stats.actualMin}m</div><div class="stat-label">Actual time</div></div>
        <div class="stat-box"><div class="stat-num" style="color:var(--danger)">${stats.wastedMin}m</div><div class="stat-label">Wasted time</div></div>
        <div class="stat-box"><div class="stat-num">${stats.productivityScore}%</div><div class="stat-label">Productivity score</div></div>
      </div>
    </div>

    ${plannedVsActualCard(day, stats)}

    <div id="today-money-slot"></div>

    <div id="task-writer-slot">${!day.tasksWritten ? taskWriterCardHTML() : ''}</div>

    <div id="activity-groups"></div>

    <div id="eod-section"></div>

    <div class="card">
      <div class="card-title">Daily History <span style="font-weight:400;text-transform:none;letter-spacing:0;">Previous days</span></div>
      <div id="history-list"></div>
    </div>
  `;

  renderActivityGroups(day);
  renderEodSection(day, stats);
  renderHistoryList();
  wireTaskWriterCard(day);
  todaysMoneyHTML().then(html => { const slot = document.getElementById('today-money-slot'); if (slot) slot.innerHTML = html; });

  const jumpBtn = document.getElementById('jump-today-btn');
  if (jumpBtn) jumpBtn.addEventListener('click', () => { state.viewingDay = clamp(state.todayDayNumber, 1, TOTAL_DAYS); renderDailyView(); });
}

function ringSVG(pct) {
  const r = 32, c = 2 * Math.PI * r;
  const offset = c - (c * pct) / 100;
  return `<svg width="76" height="76" viewBox="0 0 76 76">
    <circle class="ring-bg" cx="38" cy="38" r="${r}" fill="none" stroke-width="7"/>
    <circle class="ring-fg" cx="38" cy="38" r="${r}" fill="none" stroke-width="7"
      stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${offset}"/>
  </svg>`;
}

function plannedVsActualCard(day, stats) {
  const rstats = roadmapStatsForDay(day);
  return `
    <div class="card">
      <div class="card-title">Planned Learning vs Actual Work</div>
      <div class="compare-row">
        <div class="compare-label">Roadmap</div>
        <div class="compare-bars">
          <div class="progress-bar ai"><i style="width:${rstats.pct}%"></i></div>
          <div style="font-size:11px;color:var(--text-muted);">${rstats.done}/${rstats.total} roadmap tasks done today</div>
        </div>
      </div>
      <div class="compare-row" style="margin-bottom:0;">
        <div class="compare-label">Day Activity</div>
        <div class="compare-bars">
          <div class="progress-bar"><i style="width:${stats.completionPct}%"></i></div>
          <div style="font-size:11px;color:var(--text-muted);">${stats.completed}/${stats.total} scheduled activities done</div>
        </div>
      </div>
    </div>`;
}

function renderActivityGroups(day) {
  const el = document.getElementById('activity-groups');
  let html = '';
  if (day.tasksWritten) {
    html += `<div class="row" style="margin-bottom:4px;"><span></span><button class="link-btn" id="rewrite-tasks-btn">✍️ Rewrite today's tasks</button></div>`;
  }
  for (const period of ['morning', 'afternoon', 'evening', 'night']) {
    html += `<div class="group-title">${GROUP_LABELS[period]}</div>`;
    const acts = day.activities[period];
    if (!acts.length) html += `<div class="empty-state">No activities yet.</div>`;
    acts.forEach((a, idx) => { html += activityItemHTML(period, a, idx, acts.length); });
    html += `<button class="add-activity-btn" data-period="${period}">+ Add activity</button>`;
  }
  el.innerHTML = html;

  el.querySelectorAll('.checkbox').forEach(cb => cb.addEventListener('click', () => onToggleActivity(day, cb.dataset.period, cb.dataset.id)));
  el.querySelectorAll('.activity-edit-btn').forEach(b => b.addEventListener('click', () => openActivityEditor(day, b.dataset.period, b.dataset.id)));
  el.querySelectorAll('.add-activity-btn').forEach(b => b.addEventListener('click', () => openActivityEditor(day, b.dataset.period, null)));
  el.querySelectorAll('[data-move]').forEach(b => b.addEventListener('click', () => {
    moveActivity(day, b.dataset.period, b.dataset.id, b.dataset.move);
  }));
  const rewriteBtn = document.getElementById('rewrite-tasks-btn');
  if (rewriteBtn) rewriteBtn.addEventListener('click', () => openRewriteTasksModal(day));
}

function activityItemHTML(period, a, idx, len) {
  const statusClass = a.status.replace('_', '');
  const checked = a.status === 'completed';
  return `
    <div class="activity-item">
      <div class="activity-top">
        <button class="checkbox ${checked ? 'checked' : ''}" data-period="${period}" data-id="${a.id}">✓</button>
        <div class="activity-body">
          <div class="activity-name ${checked ? 'done' : ''}">${escapeHtml(a.name)}</div>
          <div class="activity-sub">
            ${a.startTime ? `<span class="time-badge">${formatTime12(a.startTime)}</span>` : ''}
            <span>Planned ${a.plannedMin}m</span>
            <span>· Actual ${a.actualMin}m</span>
            <span class="status-pill ${statusClass}">${STATUS_LABELS[a.status]}</span>
          </div>
          ${a.notes ? `<div class="activity-notes">${escapeHtml(a.notes)}</div>` : ''}
        </div>
        <button class="drag-handle" data-move="up" data-period="${period}" data-id="${a.id}" ${idx===0?'style="opacity:.25;pointer-events:none;"':''}>▲</button>
        <button class="drag-handle" data-move="down" data-period="${period}" data-id="${a.id}" ${idx===len-1?'style="opacity:.25;pointer-events:none;"':''}>▼</button>
        <button class="activity-edit-btn" data-period="${period}" data-id="${a.id}">✎</button>
      </div>
    </div>`;
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function onToggleActivity(day, period, id) {
  const a = day.activities[period].find(x => x.id === id);
  if (!a) return;
  a.status = a.status === 'completed' ? 'not_started' : 'completed';
  if (a.status === 'completed' && !a.actualMin) a.actualMin = a.plannedMin;
  await saveDay(day);
  renderDailyView();
}

async function moveActivity(day, period, id, dir) {
  const arr = day.activities[period];
  const i = arr.findIndex(x => x.id === id);
  const j = dir === 'up' ? i - 1 : i + 1;
  if (j < 0 || j >= arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  await saveDay(day);
  renderDailyView();
}

function openActivityEditor(day, period, id) {
  const existing = id ? day.activities[period].find(x => x.id === id) : null;
  const a = existing || { id: null, name: '', plannedMin: 30, actualMin: 0, status: 'not_started', notes: '', startTime: null };
  const statusChips = ['not_started', 'in_progress', 'completed', 'skipped'].map(s =>
    `<button class="select-chip ${a.status === s ? 'selected' : ''}" data-status="${s}">${STATUS_LABELS[s]}</button>`).join('');
  openModal(`
    <div class="modal-title">${existing ? 'Edit Activity' : 'Add Activity'} · ${GROUP_LABELS[period]}</div>
    <div class="field-block"><label>Activity name</label>
      <input class="text-field" id="af-name" value="${escapeHtml(a.name)}" placeholder="e.g. MongoDB study session"></div>
    <div class="field-block"><label>Start time</label>
      <input class="text-field" id="af-time" type="time" value="${a.startTime || ''}"></div>
    <div class="field-block"><label>Planned duration (minutes)</label>
      <input class="text-field" id="af-planned" type="number" min="0" value="${a.plannedMin}"></div>
    <div class="field-block"><label>Actual duration (minutes)</label>
      <input class="text-field" id="af-actual" type="number" min="0" value="${a.actualMin}"></div>
    <div class="field-block"><label>Status</label><div class="select-row">${statusChips}</div></div>
    <div class="field-block"><label>Notes</label>
      <textarea class="textarea-field" id="af-notes" placeholder="Optional notes...">${escapeHtml(a.notes)}</textarea></div>
    <div class="modal-actions">
      ${existing ? `<button class="btn-secondary btn-danger" id="af-delete">Delete</button>` : ''}
      <button class="btn-secondary" id="af-cancel">Cancel</button>
      <button class="btn-primary" id="af-save">Save</button>
    </div>
  `);
  let chosenStatus = a.status;
  document.querySelectorAll('#modal-card [data-status]').forEach(chip => {
    chip.addEventListener('click', () => {
      chosenStatus = chip.dataset.status;
      document.querySelectorAll('#modal-card [data-status]').forEach(c => c.classList.toggle('selected', c === chip));
    });
  });
  document.getElementById('af-cancel').addEventListener('click', closeModal);
  if (existing) {
    document.getElementById('af-delete').addEventListener('click', async () => {
      day.activities[period] = day.activities[period].filter(x => x.id !== id);
      await saveDay(day);
      closeModal();
      renderDailyView();
    });
  }
  document.getElementById('af-save').addEventListener('click', async () => {
    const name = document.getElementById('af-name').value.trim();
    if (!name) { showToast('Please enter a name'); return; }
    const startTime = document.getElementById('af-time').value || null;
    const planned = Number(document.getElementById('af-planned').value) || 0;
    const actual = Number(document.getElementById('af-actual').value) || 0;
    const notes = document.getElementById('af-notes').value.trim();
    if (existing) {
      Object.assign(existing, { name, plannedMin: planned, actualMin: actual, status: chosenStatus, notes, startTime });
      // If the new time belongs to a different period, move it there and keep the group sorted.
      const targetPeriod = startTime ? periodForTime(startTime) : period;
      if (targetPeriod !== period) {
        day.activities[period] = day.activities[period].filter(x => x.id !== existing.id);
        day.activities[targetPeriod].push(existing);
      }
      if (startTime) day.activities[targetPeriod].sort((x, y) => hhmmToMinutes(x.startTime || '00:00') - hhmmToMinutes(y.startTime || '00:00'));
    } else {
      const newAct = { id: uid(), name, plannedMin: planned, actualMin: actual, status: chosenStatus, notes, startTime };
      const targetPeriod = startTime ? periodForTime(startTime) : period;
      day.activities[targetPeriod].push(newAct);
      if (startTime) day.activities[targetPeriod].sort((x, y) => hhmmToMinutes(x.startTime || '00:00') - hhmmToMinutes(y.startTime || '00:00'));
    }
    await saveDay(day);
    closeModal();
    renderDailyView();
  });
}

/* ---------------------------------------------------------------------
   8. END-OF-DAY REVIEW
   --------------------------------------------------------------------- */
function renderEodSection(day, stats) {
  const el = document.getElementById('eod-section');
  if (day.review) {
    el.innerHTML = daySummaryHTML(day, stats);
    const editBtn = document.getElementById('edit-review-btn');
    if (editBtn) editBtn.addEventListener('click', () => openReviewForm(day, stats));
    return;
  }
  el.innerHTML = `
    <div class="eod-banner">
      <div style="font-size:26px;">🌙</div>
      <p>End your day with an honest review. Did you actually use your day well?</p>
      <button class="btn-primary" id="start-review-btn">Start End-of-Day Review</button>
    </div>`;
  document.getElementById('start-review-btn').addEventListener('click', () => openReviewForm(day, stats));
}

function daySummaryHTML(day, stats) {
  const r = day.review;
  const v = verdictForRating(r.overallRating);
  return `
    <div class="verdict-banner">
      <div class="verdict-emoji">${v.emoji}</div>
      <div class="verdict-label">${v.label}</div>
    </div>
    <div class="card">
      <div class="card-title">Day Summary <button class="link-btn" id="edit-review-btn">Edit</button></div>
      <div class="stat-grid">
        <div class="stat-box"><div class="stat-num">${stats.completed}/${stats.total}</div><div class="stat-label">Tasks completed</div></div>
        <div class="stat-box"><div class="stat-num">${stats.actualMin}m</div><div class="stat-label">Study time</div></div>
        <div class="stat-box"><div class="stat-num" style="color:var(--danger)">${stats.wastedMin}m</div><div class="stat-label">Wasted time</div></div>
        <div class="stat-box"><div class="stat-num">${r.focusRating}/5</div><div class="stat-label">Focus rating</div></div>
      </div>
      <div style="margin-top:12px;font-size:13px;line-height:1.7;">
        <div><b>Time used well:</b> ${r.timeUsed}</div>
        <div><b>Wasted time:</b> ${r.wasted}</div>
        ${r.distractions.length ? `<div><b>Distractions:</b> ${r.distractions.join(', ')}</div>` : ''}
        ${r.achievement ? `<div><b>Biggest achievement:</b> ${escapeHtml(r.achievement)}</div>` : ''}
        ${r.failed ? `<div><b>Didn't complete:</b> ${escapeHtml(r.failed)}</div>` : ''}
        ${r.improve ? `<div><b>Improve tomorrow:</b> ${escapeHtml(r.improve)}</div>` : ''}
        <div><b>Overall rating:</b> ${r.overallRating}/5</div>
        ${r.moneyWisely ? `<div><b>Spent money wisely?</b> ${r.moneyWisely}</div>` : ''}
        ${r.unnecessaryExpense ? `<div><b>Unnecessary expense:</b> ${escapeHtml(r.unnecessaryExpense)}</div>` : ''}
      </div>
    </div>`;
}

function openReviewForm(day, stats) {
  const r = day.review || { timeUsed: '', focusRating: 0, wasted: '', distractions: [], achievement: '', failed: '', improve: '', overallRating: 0, moneyWisely: '', unnecessaryExpense: '' };
  const chipRow = (options, selected, dataAttr) => options.map(o =>
    `<button class="choice-chip ${selected === o ? 'selected' : ''}" data-${dataAttr}="${o}">${o}</button>`).join('');
  const distractionRow = DISTRACTION_OPTIONS.map(o =>
    `<button class="choice-chip ${r.distractions.includes(o) ? 'selected' : ''}" data-dist="${o}">${o}</button>`).join('');
  const starRow = (name, val) => [1, 2, 3, 4, 5].map(n =>
    `<button class="star-btn ${n <= val ? 'active' : ''}" data-${name}="${n}">★</button>`).join('');

  openModal(`
    <div class="modal-title">End-of-Day Review — Day ${day.day}</div>

    <div class="field-block"><label>1. Did I use my time well?</label>
      <div class="choice-row" id="rf-timeused">${chipRow(TIME_USED_OPTIONS, r.timeUsed, 'timeused')}</div></div>

    <div class="field-block"><label>2. Focus rating</label>
      <div class="star-row" id="rf-focus">${starRow('focus', r.focusRating)}</div></div>

    <div class="field-block"><label>3. Did I waste time?</label>
      <div class="choice-row" id="rf-wasted">${chipRow(WASTED_OPTIONS, r.wasted, 'wasted')}</div></div>

    <div class="field-block"><label>4. Main distractions</label>
      <div class="choice-row" id="rf-dist">${distractionRow}</div>
      <input class="text-field" id="rf-dist-custom" placeholder="Custom distraction (optional)" style="margin-top:8px;"></div>

    <div class="field-block"><label>5. Biggest achievement today</label>
      <textarea class="textarea-field" id="rf-achievement">${escapeHtml(r.achievement)}</textarea></div>

    <div class="field-block"><label>6. What I failed to complete</label>
      <textarea class="textarea-field" id="rf-failed">${escapeHtml(r.failed)}</textarea></div>

    <div class="field-block"><label>7. What I will improve tomorrow</label>
      <textarea class="textarea-field" id="rf-improve">${escapeHtml(r.improve)}</textarea></div>

    <div class="field-block"><label>8. Overall day rating</label>
      <div class="star-row" id="rf-overall">${starRow('overall', r.overallRating)}</div></div>

    <div class="field-block"><label>💰 Did I spend money wisely today? <span class="muted" style="font-weight:400;">(optional)</span></label>
      <div class="choice-row" id="rf-moneywisely">${chipRow(['Yes', 'Mostly', 'Not really'], r.moneyWisely, 'moneywisely')}</div></div>

    <div class="field-block"><label>💰 What unnecessary expense did I make today? <span class="muted" style="font-weight:400;">(optional)</span></label>
      <input class="text-field" id="rf-unnecessary-expense" value="${escapeHtml(r.unnecessaryExpense)}" placeholder="e.g. Extra snacks, impulse buy..."></div>

    <div class="modal-actions">
      <button class="btn-secondary" id="rf-cancel">Cancel</button>
      <button class="btn-primary" id="rf-submit">Submit Review</button>
    </div>
  `);

  let picked = { timeUsed: r.timeUsed, focusRating: r.focusRating, wasted: r.wasted, distractions: [...r.distractions], overallRating: r.overallRating, moneyWisely: r.moneyWisely || '' };

  document.querySelectorAll('#rf-timeused [data-timeused]').forEach(b => b.addEventListener('click', () => {
    picked.timeUsed = b.dataset.timeused;
    document.querySelectorAll('#rf-timeused [data-timeused]').forEach(c => c.classList.toggle('selected', c === b));
  }));
  document.querySelectorAll('#rf-wasted [data-wasted]').forEach(b => b.addEventListener('click', () => {
    picked.wasted = b.dataset.wasted;
    document.querySelectorAll('#rf-wasted [data-wasted]').forEach(c => c.classList.toggle('selected', c === b));
  }));
  document.querySelectorAll('#rf-dist [data-dist]').forEach(b => b.addEventListener('click', () => {
    const val = b.dataset.dist;
    if (picked.distractions.includes(val)) picked.distractions = picked.distractions.filter(x => x !== val);
    else picked.distractions.push(val);
    b.classList.toggle('selected');
  }));
  document.querySelectorAll('#rf-focus [data-focus]').forEach(b => b.addEventListener('click', () => {
    picked.focusRating = Number(b.dataset.focus);
    document.querySelectorAll('#rf-focus [data-focus]').forEach(c => c.classList.toggle('active', Number(c.dataset.focus) <= picked.focusRating));
  }));
  document.querySelectorAll('#rf-overall [data-overall]').forEach(b => b.addEventListener('click', () => {
    picked.overallRating = Number(b.dataset.overall);
    document.querySelectorAll('#rf-overall [data-overall]').forEach(c => c.classList.toggle('active', Number(c.dataset.overall) <= picked.overallRating));
  }));
  document.querySelectorAll('#rf-moneywisely [data-moneywisely]').forEach(b => b.addEventListener('click', () => {
    picked.moneyWisely = b.dataset.moneywisely;
    document.querySelectorAll('#rf-moneywisely [data-moneywisely]').forEach(c => c.classList.toggle('selected', c === b));
  }));
  document.getElementById('rf-cancel').addEventListener('click', closeModal);

  document.getElementById('rf-submit').addEventListener('click', async () => {
    if (!picked.timeUsed || !picked.focusRating || !picked.wasted || !picked.overallRating) {
      showToast('Please answer every question'); return;
    }
    const customDist = document.getElementById('rf-dist-custom').value.trim();
    const distractions = [...picked.distractions];
    if (customDist) distractions.push(customDist);
    day.review = {
      timeUsed: picked.timeUsed,
      focusRating: picked.focusRating,
      wasted: picked.wasted,
      distractions,
      achievement: document.getElementById('rf-achievement').value.trim(),
      failed: document.getElementById('rf-failed').value.trim(),
      improve: document.getElementById('rf-improve').value.trim(),
      overallRating: picked.overallRating,
      moneyWisely: picked.moneyWisely,
      unnecessaryExpense: document.getElementById('rf-unnecessary-expense').value.trim()
    };
    await saveDay(day);
    closeModal();
    renderDailyView();
    showToast('Review saved');
  });
}

/* ---------------------------------------------------------------------
   9. DAILY HISTORY
   --------------------------------------------------------------------- */
async function renderHistoryList() {
  const el = document.getElementById('history-list');
  const allDays = await getAllDays();
  const past = allDays
    .filter(d => d.day <= state.todayDayNumber && d.day !== state.viewingDay)
    .filter(d => d.review || activityStats(d).completed > 0)
    .sort((a, b) => b.day - a.day);

  if (!past.length) { el.innerHTML = `<div class="empty-state">No previous days yet. Come back tomorrow!</div>`; return; }

  el.innerHTML = past.map(d => {
    const stats = activityStats(d);
    const dateStr = dateStrForDay(state.startDate, d.day);
    const v = d.review ? verdictForRating(d.review.overallRating) : { emoji: '⏳', label: 'No review' };
    return `
      <div class="history-item" data-day="${d.day}">
        <div class="history-emoji">${v.emoji}</div>
        <div class="history-main">
          <div class="history-date">Day ${d.day} · ${dateStr.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
          <div class="history-sub">${stats.completionPct}% complete · ${v.label}</div>
        </div>
        <div class="history-pct">${stats.productivityScore}%</div>
      </div>`;
  }).join('');

  el.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', () => openHistoryDetail(Number(item.dataset.day)));
  });
}

async function openHistoryDetail(dayNum) {
  const day = await getDay(dayNum);
  const stats = activityStats(day);
  const dateStr = dateStrForDay(state.startDate, dayNum);
  const v = day.review ? verdictForRating(day.review.overallRating) : null;
  const acts = allActivities(day);
  openModal(`
    <div class="modal-title">Day ${dayNum} · ${fmtDisplayDate(dateStr)}</div>
    ${v ? `<div class="verdict-banner"><div class="verdict-emoji">${v.emoji}</div><div class="verdict-label">${v.label}</div></div>` : `<div class="empty-state">No review submitted for this day.</div>`}
    <div class="stat-grid" style="margin-bottom:14px;">
      <div class="stat-box"><div class="stat-num">${stats.completionPct}%</div><div class="stat-label">Completion</div></div>
      <div class="stat-box"><div class="stat-num">${stats.productivityScore}%</div><div class="stat-label">Productivity</div></div>
      <div class="stat-box"><div class="stat-num">${stats.actualMin}m</div><div class="stat-label">Actual time</div></div>
      <div class="stat-box"><div class="stat-num" style="color:var(--danger)">${stats.wastedMin}m</div><div class="stat-label">Wasted time</div></div>
    </div>
    <div class="group-title" style="margin-top:0;">Activities</div>
    ${acts.map(a => `<div class="task-item"><div class="task-text ${a.status==='completed'?'done':''}">${escapeHtml(a.name)} <span class="status-pill ${a.status.replace('_','')}">${STATUS_LABELS[a.status]}</span></div></div>`).join('') || '<div class="empty-state">No activities logged.</div>'}
    ${day.review ? `<div class="group-title">Reflection</div>
      <div style="font-size:13px;line-height:1.7;">
        <div><b>Achievement:</b> ${escapeHtml(day.review.achievement) || '—'}</div>
        <div><b>Didn't complete:</b> ${escapeHtml(day.review.failed) || '—'}</div>
        <div><b>Improve:</b> ${escapeHtml(day.review.improve) || '—'}</div>
      </div>` : ''}
    <div class="modal-actions">
      <button class="btn-secondary" id="hd-open-btn">Open This Day</button>
      <button class="btn-primary" id="hd-close-btn">Close</button>
    </div>
  `);
  document.getElementById('hd-close-btn').addEventListener('click', closeModal);
  document.getElementById('hd-open-btn').addEventListener('click', () => {
    state.viewingDay = dayNum;
    closeModal();
    switchTab('daily');
  });
}

/* ---------------------------------------------------------------------
   10. ROADMAP VIEW
   --------------------------------------------------------------------- */
async function computeRoadmapDashboard() {
  const records = await getAllDays();
  const byDay = {};
  records.forEach(r => { byDay[r.day] = r; });

  let mongoTotal = 0, mongoDone = 0, aiTotal = 0, aiDone = 0;
  let daysCompleted = 0;
  const phaseTotals = { Foundation: { total: 0, done: 0 }, Intermediate: { total: 0, done: 0 }, 'Advanced + Project': { total: 0, done: 0 } };

  for (let d = 1; d <= TOTAL_DAYS; d++) {
    const rec = byDay[d] || { roadmap: defaultRoadmapTasks(d - 1), review: null };
    const mTasks = rec.roadmap.mongodb.tasks, aTasks = rec.roadmap.ai.tasks;
    mongoTotal += mTasks.length; mongoDone += mTasks.filter(t => t.done).length;
    aiTotal += aTasks.length; aiDone += aTasks.filter(t => t.done).length;
    if (rec.review) daysCompleted++;
    const phase = phaseForDay(d).name;
    const allTasks = [...mTasks, ...aTasks];
    phaseTotals[phase].total += allTasks.length;
    phaseTotals[phase].done += allTasks.filter(t => t.done).length;
  }
  const pct = (a, b) => b ? Math.round((a / b) * 100) : 0;
  return {
    daysCompleted,
    mongoPct: pct(mongoDone, mongoTotal),
    aiPct: pct(aiDone, aiTotal),
    overallPct: pct(mongoDone + aiDone, mongoTotal + aiTotal),
    foundationPct: pct(phaseTotals.Foundation.done, phaseTotals.Foundation.total),
    intermediatePct: pct(phaseTotals.Intermediate.done, phaseTotals.Intermediate.total),
    advancedPct: pct(phaseTotals['Advanced + Project'].done, phaseTotals['Advanced + Project'].total)
  };
}

async function renderRoadmapView() {
  $topbarTitle().textContent = '45-Day Roadmap';
  const dashboard = await computeRoadmapDashboard();
  const dayNum = state.roadmapDay;
  const day = await getDay(dayNum);
  const rstats = roadmapStatsForDay(day);
  const phase = phaseForDay(dayNum);

  $root().innerHTML = `
    <div class="card">
      <div class="card-title">45-Day Dashboard</div>
      <div class="stat-grid cols-3">
        <div class="stat-box"><div class="stat-num">${dashboard.daysCompleted}/${TOTAL_DAYS}</div><div class="stat-label">Days completed</div></div>
        <div class="stat-box"><div class="stat-num" style="color:var(--mongo)">${dashboard.mongoPct}%</div><div class="stat-label">MongoDB tasks</div></div>
        <div class="stat-box"><div class="stat-num" style="color:var(--ai)">${dashboard.aiPct}%</div><div class="stat-label">AI tasks</div></div>
        <div class="stat-box"><div class="stat-num">${dashboard.overallPct}%</div><div class="stat-label">Overall</div></div>
        <div class="stat-box"><div class="stat-num">${dashboard.foundationPct}%</div><div class="stat-label">Foundation</div></div>
        <div class="stat-box"><div class="stat-num">${dashboard.intermediatePct}%</div><div class="stat-label">Advanced set</div></div>
      </div>
      <div class="row" style="margin-top:12px;">
        <span class="phase-pill">Foundation ${dashboard.foundationPct}%</span>
        <span class="phase-pill">Intermediate ${dashboard.intermediatePct}%</span>
        <span class="phase-pill">Advanced ${dashboard.advancedPct}%</span>
      </div>
      <div class="row" style="margin-top:12px;">
        <button class="link-btn" id="view-strand-btn">View 45-day strand</button>
        <button class="link-btn" id="view-report-btn">Final Report</button>
      </div>
    </div>

    <div class="day-picker" id="day-picker"></div>

    <div class="card">
      <div class="row">
        <span class="phase-pill">${phase.name}</span>
        <span style="font-family:var(--font-display);font-weight:700;">Day ${dayNum} Progress: ${rstats.pct}%</span>
      </div>
      <div class="progress-bar" style="margin-top:8px;"><i style="width:${rstats.pct}%"></i></div>
    </div>

    <div class="card subject-card">
      <div class="subject-header"><span class="emoji">🍃</span><span class="name">MongoDB · ${escapeHtml(day.roadmap.mongodb.topic)}</span></div>
      <div class="progress-bar" style="margin-bottom:10px;"><i style="width:${rstats.mongoPct}%"></i></div>
      <div id="mongo-tasks"></div>
      <button class="add-activity-btn" id="add-mongo-task">+ Add MongoDB task</button>
    </div>

    <div class="card subject-card ai">
      <div class="subject-header"><span class="emoji">🤖</span><span class="name">AI · ${escapeHtml(day.roadmap.ai.topic)}</span></div>
      <div class="progress-bar ai" style="margin-bottom:10px;"><i style="width:${rstats.aiPct}%"></i></div>
      <div id="ai-tasks"></div>
      <button class="add-activity-btn" id="add-ai-task">+ Add AI task</button>
    </div>
  `;

  renderDayPicker(dayNum);
  renderRoadmapTasks('mongodb', day, '🍃');
  renderRoadmapTasks('ai', day, '🤖');

  document.getElementById('add-mongo-task').addEventListener('click', () => openRoadmapTaskEditor(day, 'mongodb', null));
  document.getElementById('add-ai-task').addEventListener('click', () => openRoadmapTaskEditor(day, 'ai', null));
  document.getElementById('view-strand-btn').addEventListener('click', () => openStrandModal());
  document.getElementById('view-report-btn').addEventListener('click', () => openFinalReport());
}

function renderDayPicker(activeDay) {
  const el = document.getElementById('day-picker');
  let html = '';
  for (let d = 1; d <= TOTAL_DAYS; d++) {
    html += `<button class="day-chip ${d === activeDay ? 'active' : ''}" data-day="${d}">${d}</button>`;
  }
  el.innerHTML = html;
  el.querySelectorAll('.day-chip').forEach(btn => btn.addEventListener('click', () => {
    state.roadmapDay = Number(btn.dataset.day);
    renderRoadmapView();
  }));
  const activeEl = el.querySelector('.day-chip.active');
  if (activeEl) activeEl.scrollIntoView({ inline: 'center', block: 'nearest' });
  markCompletedChips(el);
}
async function markCompletedChips(el) {
  const records = await getAllDays();
  const byDay = {}; records.forEach(r => byDay[r.day] = r);
  el.querySelectorAll('.day-chip').forEach(chip => {
    const rec = byDay[Number(chip.dataset.day)];
    if (rec) {
      const s = roadmapStatsForDay(rec);
      if (s.pct === 100) chip.classList.add('complete');
    }
  });
}

function renderRoadmapTasks(subject, day, emoji) {
  const el = document.getElementById(subject === 'mongodb' ? 'mongo-tasks' : 'ai-tasks');
  const tasks = day.roadmap[subject].tasks;
  el.innerHTML = tasks.map(t => `
    <div class="task-item">
      <button class="checkbox ${t.done ? 'checked' : ''}" data-task="${t.id}">✓</button>
      <div class="task-text ${t.done ? 'done' : ''}">${escapeHtml(t.text)}${t.practice ? '<span class="practice-badge">PRACTICE</span>' : ''}
        ${t.notes ? `<div class="activity-notes">${escapeHtml(t.notes)}</div>` : ''}
      </div>
      <button class="task-note-btn" data-edit="${t.id}">✎</button>
    </div>`).join('') || '<div class="empty-state">No tasks yet.</div>';

  el.querySelectorAll('[data-task]').forEach(cb => cb.addEventListener('click', async () => {
    const t = tasks.find(x => x.id === cb.dataset.task);
    t.done = !t.done;
    await saveDay(day);
    renderRoadmapView();
  }));
  el.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => openRoadmapTaskEditor(day, subject, b.dataset.edit)));
}

function openRoadmapTaskEditor(day, subject, taskId) {
  const tasks = day.roadmap[subject].tasks;
  const existing = taskId ? tasks.find(t => t.id === taskId) : null;
  const t = existing || { id: null, text: '', notes: '', done: false, practice: false };
  openModal(`
    <div class="modal-title">${existing ? 'Edit Task' : 'Add Task'} · ${subject === 'mongodb' ? 'MongoDB' : 'AI'}</div>
    <div class="field-block"><label>Task</label>
      <input class="text-field" id="tf-text" value="${escapeHtml(t.text)}" placeholder="Task description"></div>
    <div class="field-block"><label>Notes</label>
      <textarea class="textarea-field" id="tf-notes">${escapeHtml(t.notes)}</textarea></div>
    <div class="field-block">
      <label><input type="checkbox" id="tf-practice" ${t.practice ? 'checked' : ''}> This is a practice task</label>
    </div>
    <div class="modal-actions">
      ${existing ? `<button class="btn-secondary btn-danger" id="tf-delete">Delete</button>` : ''}
      <button class="btn-secondary" id="tf-cancel">Cancel</button>
      <button class="btn-primary" id="tf-save">Save</button>
    </div>
  `);
  document.getElementById('tf-cancel').addEventListener('click', closeModal);
  if (existing) document.getElementById('tf-delete').addEventListener('click', async () => {
    day.roadmap[subject].tasks = tasks.filter(x => x.id !== taskId);
    await saveDay(day); closeModal(); renderRoadmapView();
  });
  document.getElementById('tf-save').addEventListener('click', async () => {
    const text = document.getElementById('tf-text').value.trim();
    if (!text) { showToast('Please enter task text'); return; }
    const notes = document.getElementById('tf-notes').value.trim();
    const practice = document.getElementById('tf-practice').checked;
    if (existing) Object.assign(existing, { text, notes, practice });
    else tasks.push({ id: uid(), text, notes, practice, done: false });
    await saveDay(day); closeModal(); renderRoadmapView();
  });
}

async function openStrandModal() {
  const records = await getAllDays();
  const byDay = {}; records.forEach(r => byDay[r.day] = r);
  let cells = '';
  for (let d = 1; d <= TOTAL_DAYS; d++) {
    const rec = byDay[d];
    let color = 'var(--surface-3)';
    if (rec && rec.review) color = VERDICT_COLOR[rec.review.overallRating] || 'var(--surface-3)';
    else if (rec && roadmapStatsForDay(rec).pct > 0) color = 'var(--surface-2)';
    cells += `<div class="strand-cell" style="background:${color}" title="Day ${d}" data-day="${d}"></div>`;
  }
  openModal(`
    <div class="modal-title">45-Day Strand</div>
    <p class="muted" style="margin-top:-8px;">Each cell is one day, colored by that day's verdict.</p>
    <div class="strand">${cells}</div>
    <div class="strand-legend">
      <span><i class="legend-dot" style="background:var(--mongo)"></i>Excellent/Productive</span>
      <span><i class="legend-dot" style="background:var(--ai)"></i>Good</span>
      <span><i class="legend-dot" style="background:var(--amber)"></i>Average</span>
      <span><i class="legend-dot" style="background:var(--danger)"></i>Poor</span>
      <span><i class="legend-dot" style="background:var(--surface-3)"></i>No data</span>
    </div>
    <div class="modal-actions"><button class="btn-primary" id="strand-close">Close</button></div>
  `);
  document.getElementById('strand-close').addEventListener('click', closeModal);
  document.querySelectorAll('#modal-card .strand-cell').forEach(c => c.addEventListener('click', () => {
    closeModal();
    openHistoryDetail(Number(c.dataset.day));
  }));
}

/* ---------------------------------------------------------------------
   11. FINAL DAY REPORT
   --------------------------------------------------------------------- */
async function computeFinalReport() {
  const records = await getAllDays();
  const byDay = {}; records.forEach(r => byDay[r.day] = r);
  let totalTasksCompleted = 0, wastedTotal = 0;
  let prodSum = 0, prodCount = 0, focusSum = 0, focusCount = 0;
  const verdictCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let best = null, worst = null;
  let daysWithData = 0;

  for (let d = 1; d <= TOTAL_DAYS; d++) {
    const rec = byDay[d];
    if (!rec) continue;
    daysWithData++;
    const stats = activityStats(rec);
    const rstats = roadmapStatsForDay(rec);
    totalTasksCompleted += stats.completed + rstats.done;
    wastedTotal += stats.wastedMin;
    prodSum += stats.productivityScore; prodCount++;
    if (rec.review) {
      focusSum += rec.review.focusRating; focusCount++;
      verdictCounts[rec.review.overallRating] = (verdictCounts[rec.review.overallRating] || 0) + 1;
      if (!best || rec.review.overallRating > best.rating) best = { day: d, rating: rec.review.overallRating };
      if (!worst || rec.review.overallRating < worst.rating) worst = { day: d, rating: rec.review.overallRating };
    }
  }
  const dashboard = await computeRoadmapDashboard();
  return {
    daysCompleted: dashboard.daysCompleted,
    totalTasksCompleted,
    mongoPct: dashboard.mongoPct,
    aiPct: dashboard.aiPct,
    avgProductivity: prodCount ? Math.round(prodSum / prodCount) : 0,
    avgFocus: focusCount ? (focusSum / focusCount).toFixed(1) : '—',
    wastedTotal,
    verdictCounts,
    bestDay: best,
    worstDay: worst,
    daysWithData
  };
}

async function finalReportBodyHTML() {
  const r = await computeFinalReport();
  const reflection = await getSetting('finalReflection', { learned: '', improved: '', habits: '', continue: '' });
  return `
    <div class="report-hero">
      <div class="big">${r.daysCompleted}/${TOTAL_DAYS}</div>
      <div class="muted">Days completed</div>
    </div>
    <div class="stat-grid" style="margin-bottom:14px;">
      <div class="stat-box"><div class="stat-num">${r.totalTasksCompleted}</div><div class="stat-label">Total tasks completed</div></div>
      <div class="stat-box"><div class="stat-num" style="color:var(--mongo)">${r.mongoPct}%</div><div class="stat-label">MongoDB</div></div>
      <div class="stat-box"><div class="stat-num" style="color:var(--ai)">${r.aiPct}%</div><div class="stat-label">AI</div></div>
      <div class="stat-box"><div class="stat-num">${r.avgProductivity}%</div><div class="stat-label">Avg productivity</div></div>
      <div class="stat-box"><div class="stat-num">${r.avgFocus}/5</div><div class="stat-label">Avg focus</div></div>
      <div class="stat-box"><div class="stat-num" style="color:var(--danger)">${r.wastedTotal}m</div><div class="stat-label">Total wasted time</div></div>
    </div>
    <div class="card">
      <div class="card-title">Day Ratings</div>
      ${[5,4,3,2,1].map(n => `<div class="row" style="margin-bottom:6px;"><span>${VERDICTS[n].emoji} ${VERDICTS[n].label}</span><b>${r.verdictCounts[n] || 0}</b></div>`).join('')}
    </div>
    <div class="card">
      <div class="row"><span>🏆 Best day</span><b>${r.bestDay ? 'Day ' + r.bestDay.day : '—'}</b></div>
      <div class="row" style="margin-top:8px;"><span>🧗 Most difficult day</span><b>${r.worstDay ? 'Day ' + r.worstDay.day : '—'}</b></div>
    </div>
    <div class="card">
      <div class="card-title">Reflection</div>
      <div class="field-block"><label>What did I learn?</label><textarea class="textarea-field" id="fr-learned">${escapeHtml(reflection.learned)}</textarea></div>
      <div class="field-block"><label>What improved?</label><textarea class="textarea-field" id="fr-improved">${escapeHtml(reflection.improved)}</textarea></div>
      <div class="field-block"><label>What habits did I build?</label><textarea class="textarea-field" id="fr-habits">${escapeHtml(reflection.habits)}</textarea></div>
      <div class="field-block"><label>What should I continue?</label><textarea class="textarea-field" id="fr-continue">${escapeHtml(reflection.continue)}</textarea></div>
      <button class="btn-primary" id="fr-save">Save Reflection</button>
    </div>
  `;
}

async function openFinalReport() {
  const body = await finalReportBodyHTML();
  openModal(`<div class="modal-title">🏁 Final Day Report</div>${body}
    <div class="modal-actions"><button class="btn-secondary" id="fr-close">Close</button></div>`);
  document.getElementById('fr-close').addEventListener('click', closeModal);
  document.getElementById('fr-save').addEventListener('click', async () => {
    await setSetting('finalReflection', {
      learned: document.getElementById('fr-learned').value.trim(),
      improved: document.getElementById('fr-improved').value.trim(),
      habits: document.getElementById('fr-habits').value.trim(),
      continue: document.getElementById('fr-continue').value.trim()
    });
    showToast('Reflection saved');
  });
}

async function renderFinalReportGate() {
  const body = await finalReportBodyHTML();
  $root().innerHTML = `<div class="card" style="text-align:center;margin-bottom:6px;">
      <div style="font-size:40px;">🏁</div>
      <h2 style="font-family:var(--font-display);margin:6px 0;">Challenge Complete</h2>
      <p class="muted">You've reached the end of your 45-day journey.</p>
    </div>${body}
    <button class="btn-primary" id="enter-app-btn" style="margin-top:6px;">Continue to App</button>`;
  document.getElementById('fr-save').addEventListener('click', async () => {
    await setSetting('finalReflection', {
      learned: document.getElementById('fr-learned').value.trim(),
      improved: document.getElementById('fr-improved').value.trim(),
      habits: document.getElementById('fr-habits').value.trim(),
      continue: document.getElementById('fr-continue').value.trim()
    });
    showToast('Reflection saved');
  });
  document.getElementById('enter-app-btn').addEventListener('click', () => {
    state.viewingDay = TOTAL_DAYS;
    state.roadmapDay = TOTAL_DAYS;
    renderCurrentTab();
  });
}

/* ---------------------------------------------------------------------
   11b. EXPENSES TAB
   --------------------------------------------------------------------- */
function moneyRange() {
  const { year, month } = state.moneyMonth;
  const from = toDateOnly(new Date(year, month, 1));
  const to = toDateOnly(new Date(year, month + 1, 0));
  return { from, to, key: `${year}-${String(month + 1).padStart(2, '0')}` };
}

async function moneyData() {
  const [expenses, income] = await Promise.all([getAllExpenses(), getAllIncome()]);
  return { expenses, income };
}

function fmtRs(n) {
  const v = Math.round((Number(n) || 0) * 100) / 100;
  return '₹' + v.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

async function renderExpensesView() {
  $topbarTitle().textContent = 'Expenses';
  const { expenses, income } = await moneyData();
  const { from, to, key } = moneyRange();
  const today = toDateOnly(new Date());
  const weekStart = startOfWeek(today);

  const monthExpenses = expenses.filter(e => inRange(e.date, from, to));
  const monthIncome = income.filter(i => inRange(i.date, from, to));
  const totalIncome = sum(monthIncome, i => i.amount);
  const totalExpenses = sum(monthExpenses, e => e.amount);
  const remaining = totalIncome - totalExpenses;
  const savingsPct = totalIncome > 0 ? Math.round((remaining / totalIncome) * 100) : 0;

  const todayExpenses = expenses.filter(e => e.date === fmtYMD(today));
  const weekExpenses = expenses.filter(e => inRange(e.date, weekStart, today));
  const todaySpent = sum(todayExpenses, e => e.amount);
  const weekSpent = sum(weekExpenses, e => e.amount);
  const effectiveEnd = today < to ? today : to;
  const daysElapsed = Math.max(1, Math.round((effectiveEnd - from) / 86400000) + 1);
  const avgDaily = totalExpenses / daysElapsed;
  const largestExpense = monthExpenses.reduce((max, e) => (!max || e.amount > max.amount) ? e : max, null);

  const openingBalance = await getSetting('openingBalance', 0);
  const allIncomeTotal = sum(income, i => i.amount);
  const allExpenseTotal = sum(expenses, e => e.amount);
  const currentBalance = Number(openingBalance) + allIncomeTotal - allExpenseTotal;

  const budget = await getSetting('monthlyBudget', 0);
  const budgetSpent = totalExpenses;
  const budgetRemaining = Number(budget) - budgetSpent;
  const overBudget = Number(budget) > 0 && budgetSpent > Number(budget);

  $root().innerHTML = `
    <div class="card">
      <div class="month-switch">
        <button class="cal-nav-btn" id="mm-prev">‹</button>
        <span class="cal-title" style="font-size:14px;">${monthLabel(state.moneyMonth.year, state.moneyMonth.month)}</span>
        <button class="cal-nav-btn" id="mm-next">›</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Money Dashboard</div>
      <div class="stat-grid">
        <div class="stat-box"><div class="stat-num" style="color:var(--mongo)">${fmtRs(totalIncome)}</div><div class="stat-label">Total income</div></div>
        <div class="stat-box"><div class="stat-num" style="color:var(--danger)">${fmtRs(totalExpenses)}</div><div class="stat-label">Total expenses</div></div>
        <div class="stat-box"><div class="stat-num" style="color:${remaining>=0?'var(--mongo)':'var(--danger)'}">${fmtRs(remaining)}</div><div class="stat-label">Remaining</div></div>
        <div class="stat-box"><div class="stat-num">${savingsPct}%</div><div class="stat-label">Savings rate</div></div>
      </div>
      <div class="stat-grid cols-3" style="margin-top:10px;">
        <div class="stat-box"><div class="stat-num">${fmtRs(todaySpent)}</div><div class="stat-label">Today</div></div>
        <div class="stat-box"><div class="stat-num">${fmtRs(weekSpent)}</div><div class="stat-label">This week</div></div>
        <div class="stat-box"><div class="stat-num">${fmtRs(avgDaily)}</div><div class="stat-label">Avg / day</div></div>
        <div class="stat-box"><div class="stat-num">${monthExpenses.length}</div><div class="stat-label">Transactions</div></div>
        <div class="stat-box"><div class="stat-num">${largestExpense ? fmtRs(largestExpense.amount) : '—'}</div><div class="stat-label">Largest expense</div></div>
        <div class="stat-box"><div class="stat-num">${largestExpense ? CATEGORY_EMOJI[largestExpense.category] || '' : ''} ${largestExpense ? largestExpense.category : '—'}</div><div class="stat-label">Category</div></div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Balance <span style="font-weight:400;text-transform:none;letter-spacing:0;">Calculated, not linked to any bank</span></div>
      <div class="row">
        <span class="muted" style="font-size:13px;">Opening balance</span>
        <div style="display:flex;gap:8px;align-items:center;">
          <input class="text-field" id="ob-input" type="number" step="0.01" value="${openingBalance}" style="width:120px;text-align:right;">
          <button class="btn-ghost" id="ob-save">Save</button>
        </div>
      </div>
      <div class="row" style="margin-top:12px;">
        <span>Current balance</span>
        <span class="stat-num" style="font-size:20px;color:${currentBalance>=0?'var(--mongo)':'var(--danger)'}">${fmtRs(currentBalance)}</span>
      </div>
      <div style="font-size:11px;color:var(--text-faint);margin-top:4px;">Opening balance + all-time income − all-time expenses</div>
    </div>

    <div class="card">
      <div class="card-title">Budget <span style="font-weight:400;text-transform:none;letter-spacing:0;">This month</span></div>
      <div class="row">
        <span class="muted" style="font-size:13px;">Monthly budget</span>
        <div style="display:flex;gap:8px;align-items:center;">
          <input class="text-field" id="bg-input" type="number" step="0.01" value="${budget}" style="width:120px;text-align:right;">
          <button class="btn-ghost" id="bg-save">Save</button>
        </div>
      </div>
      ${Number(budget) > 0 ? `
        <div class="progress-bar ${overBudget ? '' : 'amber'}" style="margin-top:12px;${overBudget ? 'background:rgba(226,87,76,.25);' : ''}">
          <i style="width:${Math.min(100, Math.round((budgetSpent/Number(budget))*100))}%;${overBudget ? 'background:var(--danger);' : ''}"></i>
        </div>
        <div class="row" style="margin-top:8px;font-size:12px;color:var(--text-muted);">
          <span>Spent ${fmtRs(budgetSpent)}</span>
          <span style="color:${overBudget ? 'var(--danger)' : 'var(--text-muted)'}">${overBudget ? 'Over by ' + fmtRs(-budgetRemaining) + ' ⚠️' : 'Remaining ' + fmtRs(budgetRemaining)}</span>
        </div>` : `<div class="empty-state" style="padding:14px 0 0;">Set a monthly budget to track it here.</div>`}
    </div>

    <div class="card">
      <div class="card-title">Expense Breakdown</div>
      <div class="select-row" id="breakdown-scope" style="margin-bottom:12px;">
        <button class="select-chip" data-scope="day">Day</button>
        <button class="select-chip" data-scope="week">Week</button>
        <button class="select-chip selected" data-scope="month">Month</button>
        <button class="select-chip" data-scope="all">Category (All time)</button>
      </div>
      <div id="breakdown-chart"></div>
    </div>

    <div class="card">
      <div class="card-title">Monthly Analysis</div>
      <div id="monthly-analysis"></div>
    </div>

    <div class="card">
      <div class="card-title">Daily Expense History</div>
      <div id="daily-money-history"></div>
    </div>

    <div style="height:70px;"></div>
  `;

  document.getElementById('mm-prev').addEventListener('click', () => { shiftMoneyMonth(-1); });
  document.getElementById('mm-next').addEventListener('click', () => { shiftMoneyMonth(1); });
  document.getElementById('ob-save').addEventListener('click', async () => {
    await setSetting('openingBalance', Number(document.getElementById('ob-input').value) || 0);
    showToast('Opening balance saved');
    renderExpensesView();
  });
  document.getElementById('bg-save').addEventListener('click', async () => {
    await setSetting('monthlyBudget', Number(document.getElementById('bg-input').value) || 0);
    showToast('Budget saved');
    renderExpensesView();
  });

  renderBreakdownChart('month', expenses);
  document.querySelectorAll('#breakdown-scope [data-scope]').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('#breakdown-scope [data-scope]').forEach(c => c.classList.toggle('selected', c === b));
    renderBreakdownChart(b.dataset.scope, expenses);
  }));

  renderMonthlyAnalysis(expenses, income);
  renderDailyMoneyHistory(expenses);
  renderExpensesFab();
}

function shiftMoneyMonth(delta) {
  let { year, month } = state.moneyMonth;
  month += delta;
  if (month < 0) { month = 11; year--; }
  if (month > 11) { month = 0; year++; }
  state.moneyMonth = { year, month };
  renderExpensesView();
}

function renderBreakdownChart(scope, expenses) {
  const el = document.getElementById('breakdown-chart');
  const today = toDateOnly(new Date());
  let filtered;
  if (scope === 'day') filtered = expenses.filter(e => e.date === fmtYMD(today));
  else if (scope === 'week') filtered = expenses.filter(e => inRange(e.date, startOfWeek(today), today));
  else if (scope === 'all') filtered = expenses;
  else { const { from, to } = moneyRange(); filtered = expenses.filter(e => inRange(e.date, from, to)); }

  const totals = {};
  filtered.forEach(e => { totals[e.category] = (totals[e.category] || 0) + Number(e.amount); });
  const total = sum(Object.values(totals).map(v => ({ v })), x => x.v);
  const rows = Object.entries(totals).sort((a, b) => b[1] - a[1]);

  if (!rows.length) { el.innerHTML = `<div class="empty-state">No expenses in this range yet.</div>`; return; }
  el.innerHTML = rows.map(([cat, amt]) => {
    const pct = total ? Math.round((amt / total) * 100) : 0;
    return `<div style="margin-bottom:10px;">
      <div class="row" style="font-size:13px;margin-bottom:4px;"><span>${CATEGORY_EMOJI[cat] || ''} ${cat}</span><span>${fmtRs(amt)} · ${pct}%</span></div>
      <div class="progress-bar"><i style="width:${pct}%"></i></div>
    </div>`;
  }).join('');
}

async function renderMonthlyAnalysis(expenses, income) {
  const el = document.getElementById('monthly-analysis');
  const { from, to } = moneyRange();
  const mExpenses = expenses.filter(e => inRange(e.date, from, to));
  const mIncome = income.filter(i => inRange(i.date, from, to));
  const totalIncome = sum(mIncome, i => i.amount);
  const totalExpenses = sum(mExpenses, e => e.amount);
  const remaining = totalIncome - totalExpenses;
  const savingsPct = totalIncome > 0 ? Math.round((remaining / totalIncome) * 100) : 0;
  const daysInMonth = (to - from) / 86400000 + 1;
  const avgDaily = totalExpenses / daysInMonth;

  const byDay = {};
  mExpenses.forEach(e => { byDay[e.date] = (byDay[e.date] || 0) + Number(e.amount); });
  const highestDayEntry = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0];
  const highestExpense = mExpenses.reduce((max, e) => (!max || e.amount > max.amount) ? e : max, null);
  const byCat = {};
  mExpenses.forEach(e => { byCat[e.category] = (byCat[e.category] || 0) + Number(e.amount); });
  const topCategory = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];

  // previous month comparison
  let prevYear = state.moneyMonth.year, prevMonth = state.moneyMonth.month - 1;
  if (prevMonth < 0) { prevMonth = 11; prevYear--; }
  const prevFrom = toDateOnly(new Date(prevYear, prevMonth, 1));
  const prevTo = toDateOnly(new Date(prevYear, prevMonth + 1, 0));
  const prevExpenses = expenses.filter(e => inRange(e.date, prevFrom, prevTo));
  const prevTotal = sum(prevExpenses, e => e.amount);
  let compareHTML = '';
  if (prevExpenses.length) {
    const diff = totalExpenses - prevTotal;
    const diffPct = prevTotal ? Math.round((diff / prevTotal) * 100) : 0;
    const up = diff > 0;
    compareHTML = `<div class="row" style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);">
      <span class="muted" style="font-size:12px;">vs ${monthLabel(prevYear, prevMonth)}</span>
      <span style="font-size:13px;color:${up ? 'var(--danger)' : 'var(--mongo)'}">${up ? '▲' : '▼'} ${Math.abs(diffPct)}% (${fmtRs(Math.abs(diff))})</span>
    </div>`;
  }

  el.innerHTML = `
    <div class="stat-grid">
      <div class="stat-box"><div class="stat-num" style="color:var(--mongo)">${fmtRs(totalIncome)}</div><div class="stat-label">Income</div></div>
      <div class="stat-box"><div class="stat-num" style="color:var(--danger)">${fmtRs(totalExpenses)}</div><div class="stat-label">Expenses</div></div>
      <div class="stat-box"><div class="stat-num">${fmtRs(remaining)}</div><div class="stat-label">Remaining</div></div>
      <div class="stat-box"><div class="stat-num">${savingsPct}%</div><div class="stat-label">Savings %</div></div>
      <div class="stat-box"><div class="stat-num">${fmtRs(avgDaily)}</div><div class="stat-label">Avg / day</div></div>
      <div class="stat-box"><div class="stat-num">${highestDayEntry ? fmtRs(highestDayEntry[1]) : '—'}</div><div class="stat-label">Highest day</div></div>
    </div>
    <div style="font-size:13px;margin-top:10px;line-height:1.8;">
      <div><b>Highest expense:</b> ${highestExpense ? escapeHtml(highestExpense.description || highestExpense.category) + ' — ' + fmtRs(highestExpense.amount) : '—'}</div>
      <div><b>Top category:</b> ${topCategory ? (CATEGORY_EMOJI[topCategory[0]] || '') + ' ' + topCategory[0] + ' — ' + fmtRs(topCategory[1]) : '—'}</div>
    </div>
    ${compareHTML}
  `;
}

function renderDailyMoneyHistory(expenses) {
  const el = document.getElementById('daily-money-history');
  const { from, to } = moneyRange();
  const mExpenses = expenses.filter(e => inRange(e.date, from, to));
  const byDay = {};
  mExpenses.forEach(e => { (byDay[e.date] = byDay[e.date] || []).push(e); });
  const dates = Object.keys(byDay).sort((a, b) => b.localeCompare(a));
  if (!dates.length) { el.innerHTML = `<div class="empty-state">No expenses recorded this month yet.</div>`; return; }
  el.innerHTML = dates.map(d => {
    const total = sum(byDay[d], e => e.amount);
    const dateObj = parseYMD(d);
    return `<div class="history-item" data-date="${d}">
      <div class="history-emoji">💸</div>
      <div class="history-main">
        <div class="history-date">${dateObj.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</div>
        <div class="history-sub">${byDay[d].length} transaction${byDay[d].length > 1 ? 's' : ''}</div>
      </div>
      <div class="history-pct">${fmtRs(total)}</div>
    </div>`;
  }).join('');
  el.querySelectorAll('.history-item').forEach(item => item.addEventListener('click', () => openDayTransactions(item.dataset.date, byDay[item.dataset.date])));
}

function openDayTransactions(dateStr, txns) {
  const dateObj = parseYMD(dateStr);
  const sorted = [...txns].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  openModal(`
    <div class="modal-title">${fmtDisplayDate(dateObj)}</div>
    <div id="day-txn-list">${sorted.map(txnItemHTML).join('')}</div>
    <div class="modal-actions"><button class="btn-primary" id="dt-close">Close</button></div>
  `);
  document.getElementById('dt-close').addEventListener('click', closeModal);
  wireTxnItemButtons();
}

function txnItemHTML(e) {
  return `<div class="task-item">
    <div class="task-text">
      <div class="row"><span>${CATEGORY_EMOJI[e.category] || '💸'} ${escapeHtml(e.description || e.category)}</span><b style="color:var(--danger)">${fmtRs(e.amount)}</b></div>
      <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${e.category} · ${e.paymentMethod} ${e.time ? '· ' + formatTime12(e.time) : ''}</div>
    </div>
    <button class="task-note-btn" data-edit-expense="${e.id}">✎</button>
  </div>`;
}
function wireTxnItemButtons() {
  document.querySelectorAll('[data-edit-expense]').forEach(b => b.addEventListener('click', async () => {
    const all = await getAllExpenses();
    const rec = all.find(x => x.id === b.dataset.editExpense);
    if (rec) openExpenseModal(rec);
  }));
}

/* ---------- Today's Money (Daily Activity tab integration) ---------- */
async function todaysMoneyHTML() {
  const expenses = await getAllExpenses();
  const todayStr = fmtYMD(new Date());
  const todays = expenses.filter(e => e.date === todayStr);
  const spent = sum(todays, e => e.amount);
  const largest = todays.reduce((max, e) => (!max || e.amount > max.amount) ? e : max, null);
  const byCat = {};
  todays.forEach(e => { byCat[e.category] = (byCat[e.category] || 0) + Number(e.amount); });
  const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
  return `
    <div class="card">
      <div class="card-title">💰 Today's Money</div>
      <div class="stat-grid">
        <div class="stat-box"><div class="stat-num" style="color:var(--danger)">${fmtRs(spent)}</div><div class="stat-label">Spent today</div></div>
        <div class="stat-box"><div class="stat-num">${todays.length}</div><div class="stat-label">Expenses</div></div>
        <div class="stat-box"><div class="stat-num">${largest ? fmtRs(largest.amount) : '—'}</div><div class="stat-label">Largest expense</div></div>
        <div class="stat-box"><div class="stat-num">${top ? (CATEGORY_EMOJI[top[0]] || '') + ' ' + top[0] : '—'}</div><div class="stat-label">Top category</div></div>
      </div>
    </div>`;
}

/* ---------- FAB + Add/Edit Expense & Income modals ---------- */
function renderExpensesFab() {
  let fab = document.getElementById('money-fab');
  if (!fab) {
    fab = document.createElement('div');
    fab.id = 'money-fab';
    fab.className = 'money-fab';
    document.body.appendChild(fab);
  }
  fab.innerHTML = `
    <button class="fab-btn fab-income" id="fab-income" title="Add income">💵</button>
    <button class="fab-btn fab-expense" id="fab-expense" title="Add expense">＋</button>
  `;
  fab.classList.remove('hidden');
  document.getElementById('fab-expense').addEventListener('click', () => openExpenseModal(null));
  document.getElementById('fab-income').addEventListener('click', () => openIncomeModal(null));
}
function hideMoneyFab() {
  const fab = document.getElementById('money-fab');
  if (fab) fab.classList.add('hidden');
}

function openExpenseModal(existing) {
  const now = new Date();
  const e = existing || { id: null, amount: '', date: fmtYMD(now), time: nowTimeStr(), category: 'Food', description: '', paymentMethod: 'UPI' };
  const catChips = EXPENSE_CATEGORIES.map(c =>
    `<button class="select-chip ${e.category === c.name ? 'selected' : ''}" data-cat="${c.name}">${c.emoji} ${c.name}</button>`).join('');
  const payChips = PAYMENT_METHODS.map(p =>
    `<button class="select-chip ${e.paymentMethod === p ? 'selected' : ''}" data-pay="${p}">${p}</button>`).join('');

  openModal(`
    <div class="modal-title">${existing ? 'Edit Expense' : 'Add Expense'}</div>
    <div class="field-block">
      <label>Amount (₹)</label>
      <input class="text-field amount-input" id="ex-amount" type="number" inputmode="decimal" step="0.01" min="0" value="${e.amount}" placeholder="0" autofocus>
    </div>
    <div class="field-block"><label>Category</label><div class="select-row">${catChips}</div></div>
    <div class="field-block"><label>Payment method</label><div class="select-row">${payChips}</div></div>
    <div class="field-block"><label>Description (optional)</label>
      <input class="text-field" id="ex-desc" value="${escapeHtml(e.description)}" placeholder="e.g. Tea at canteen"></div>
    <div class="row" style="margin-bottom:8px;">
      <button class="link-btn" id="ex-toggle-datetime">✎ ${e.date === fmtYMD(now) ? 'Change date/time (defaults to now)' : 'Change date/time'}</button>
    </div>
    <div id="ex-datetime-block" class="hidden">
      <div class="field-block"><label>Date</label><div id="ex-cal"></div></div>
      <div class="field-block"><label>Time</label><input class="text-field" id="ex-time" type="time" value="${e.time}"></div>
    </div>
    <div class="modal-actions">
      ${existing ? `<button class="btn-secondary btn-danger" id="ex-delete">Delete</button>` : ''}
      <button class="btn-secondary" id="ex-cancel">Cancel</button>
      <button class="btn-primary" id="ex-save">Save</button>
    </div>
  `);

  let chosenCat = e.category, chosenPay = e.paymentMethod, chosenDate = e.date;
  document.querySelectorAll('#modal-card [data-cat]').forEach(b => b.addEventListener('click', () => {
    chosenCat = b.dataset.cat;
    document.querySelectorAll('#modal-card [data-cat]').forEach(c => c.classList.toggle('selected', c === b));
  }));
  document.querySelectorAll('#modal-card [data-pay]').forEach(b => b.addEventListener('click', () => {
    chosenPay = b.dataset.pay;
    document.querySelectorAll('#modal-card [data-pay]').forEach(c => c.classList.toggle('selected', c === b));
  }));
  document.getElementById('ex-toggle-datetime').addEventListener('click', () => {
    const block = document.getElementById('ex-datetime-block');
    block.classList.toggle('hidden');
    if (!block.dataset.built) {
      buildCalendar('ex-cal', chosenDate, (val) => { chosenDate = val; });
      block.dataset.built = '1';
    }
  });
  document.getElementById('ex-cancel').addEventListener('click', closeModal);
  if (existing) document.getElementById('ex-delete').addEventListener('click', async () => {
    await deleteExpense(existing.id);
    closeModal();
    showToast('Expense deleted');
    renderExpensesView();
  });
  document.getElementById('ex-save').addEventListener('click', async () => {
    const amount = Number(document.getElementById('ex-amount').value);
    if (!amount || amount <= 0) { showToast('Enter a valid amount'); return; }
    const time = document.getElementById('ex-time') ? document.getElementById('ex-time').value || e.time : e.time;
    const description = document.getElementById('ex-desc').value.trim();
    const rec = { id: existing ? existing.id : uid(), amount, date: chosenDate, time, category: chosenCat, description, paymentMethod: chosenPay };
    await addExpense(rec);
    closeModal();
    showToast('Expense saved');
    if (state.currentTab === 'expenses') renderExpensesView(); else if (state.currentTab === 'daily') renderDailyView();
  });
}

function openIncomeModal(existing) {
  const now = new Date();
  const inc = existing || { id: null, amount: '', date: fmtYMD(now), time: nowTimeStr(), type: 'Salary', description: '' };
  const typeChips = INCOME_TYPES.map(t =>
    `<button class="select-chip ${inc.type === t ? 'selected' : ''}" data-itype="${t}">${t}</button>`).join('');

  openModal(`
    <div class="modal-title">${existing ? 'Edit Income' : 'Add Income'}</div>
    <div class="field-block">
      <label>Amount (₹)</label>
      <input class="text-field amount-input" id="in-amount" type="number" inputmode="decimal" step="0.01" min="0" value="${inc.amount}" placeholder="0" autofocus>
    </div>
    <div class="field-block"><label>Type</label><div class="select-row">${typeChips}</div></div>
    <div class="field-block"><label>Description (optional)</label>
      <input class="text-field" id="in-desc" value="${escapeHtml(inc.description)}" placeholder="e.g. August salary"></div>
    <div class="row" style="margin-bottom:8px;">
      <button class="link-btn" id="in-toggle-datetime">✎ Change date/time (defaults to now)</button>
    </div>
    <div id="in-datetime-block" class="hidden">
      <div class="field-block"><label>Date</label><div id="in-cal"></div></div>
      <div class="field-block"><label>Time</label><input class="text-field" id="in-time" type="time" value="${inc.time}"></div>
    </div>
    <div class="modal-actions">
      ${existing ? `<button class="btn-secondary btn-danger" id="in-delete">Delete</button>` : ''}
      <button class="btn-secondary" id="in-cancel">Cancel</button>
      <button class="btn-primary" id="in-save">Save</button>
    </div>
  `);

  let chosenType = inc.type, chosenDate = inc.date;
  document.querySelectorAll('#modal-card [data-itype]').forEach(b => b.addEventListener('click', () => {
    chosenType = b.dataset.itype;
    document.querySelectorAll('#modal-card [data-itype]').forEach(c => c.classList.toggle('selected', c === b));
  }));
  document.getElementById('in-toggle-datetime').addEventListener('click', () => {
    const block = document.getElementById('in-datetime-block');
    block.classList.toggle('hidden');
    if (!block.dataset.built) {
      buildCalendar('in-cal', chosenDate, (val) => { chosenDate = val; });
      block.dataset.built = '1';
    }
  });
  document.getElementById('in-cancel').addEventListener('click', closeModal);
  if (existing) document.getElementById('in-delete').addEventListener('click', async () => {
    await deleteIncome(existing.id);
    closeModal();
    showToast('Income deleted');
    renderExpensesView();
  });
  document.getElementById('in-save').addEventListener('click', async () => {
    const amount = Number(document.getElementById('in-amount').value);
    if (!amount || amount <= 0) { showToast('Enter a valid amount'); return; }
    const time = document.getElementById('in-time') ? document.getElementById('in-time').value || inc.time : inc.time;
    const description = document.getElementById('in-desc').value.trim();
    const rec = { id: existing ? existing.id : uid(), amount, date: chosenDate, time, type: chosenType, description };
    await addIncome(rec);
    closeModal();
    showToast('Income saved');
    renderExpensesView();
  });
}
function openSettings() {
  openModal(`
    <div class="modal-title">Settings</div>
    <div class="settings-item">
      <span>Dark mode</span>
      <button class="toggle ${state.theme === 'dark' ? 'on' : ''}" id="set-theme-toggle"></button>
    </div>
    <div class="field-block" style="margin-top:14px;">
      <label>Challenge start date</label>
      <div id="set-startdate-cal"></div>
      <button class="btn-secondary" id="set-startdate-save" style="margin-top:8px;">Update Start Date</button>
    </div>
    <div class="settings-item" style="border-top:1px solid var(--border);padding-top:16px;">
      <span>Export data (JSON backup)</span>
      <button class="btn-ghost" id="set-export">Export</button>
    </div>
    <div class="settings-item">
      <span>Import data (restore backup)</span>
      <button class="btn-ghost" id="set-import">Import</button>
      <input type="file" id="set-import-file" accept="application/json" class="hidden">
    </div>
    <div class="settings-item">
      <span>Final Day Report</span>
      <button class="btn-ghost" id="set-final-report">View</button>
    </div>
    <div class="settings-item">
      <span style="color:var(--danger);">Reset all data</span>
      <button class="btn-ghost btn-danger" id="set-reset">Reset</button>
    </div>
    <div class="privacy-note" style="margin-top:14px;">
      🔒 <b>Your Data Stays on This Device</b><br>
      All activities, reflections and learning progress are stored locally in this browser.
    </div>
    <div class="modal-actions"><button class="btn-primary" id="set-close">Close</button></div>
  `);
  document.getElementById('set-close').addEventListener('click', closeModal);
  const settingsCal = buildCalendar('set-startdate-cal', state.startDate, () => {});
  document.getElementById('set-theme-toggle').addEventListener('click', async (e) => {
    await toggleTheme();
    e.target.classList.toggle('on', state.theme === 'dark');
  });
  document.getElementById('set-startdate-save').addEventListener('click', async () => {
    const val = settingsCal.getValue();
    if (!val) return;
    await setSetting('startDate', val);
    state.startDate = val;
    state.todayDayNumber = dayNumberForToday(state.startDate);
    closeModal();
    showToast('Start date updated');
    if (state.todayDayNumber > TOTAL_DAYS) renderFinalReportGate(); else renderCurrentTab();
  });
  document.getElementById('set-export').addEventListener('click', exportData);
  document.getElementById('set-final-report').addEventListener('click', () => { closeModal(); openFinalReport(); });
  document.getElementById('set-import').addEventListener('click', () => document.getElementById('set-import-file').click());
  document.getElementById('set-import-file').addEventListener('change', importData);
  document.getElementById('set-reset').addEventListener('click', confirmReset);
}

async function exportData() {
  const settingsRecs = await idbGetAll('settings');
  const dayRecs = await idbGetAll('days');
  const expenseRecs = await idbGetAll('expenses');
  const incomeRecs = await idbGetAll('income');
  const payload = {
    app: '45-days-focus', exportedAt: new Date().toISOString(),
    settings: settingsRecs, days: dayRecs, expenses: expenseRecs, income: incomeRecs
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `45-days-focus-backup-${fmtYMD(new Date())}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  showToast('Backup exported');
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || !Array.isArray(data.days) || !Array.isArray(data.settings)) throw new Error('bad format');
      await idbClear('days'); await idbClear('settings');
      for (const s of data.settings) await idbPut('settings', s);
      for (const d of data.days) await idbPut('days', d);
      // Expenses/income are optional — older backups (pre-Expenses feature) simply won't have them.
      if (Array.isArray(data.expenses)) {
        await idbClear('expenses');
        for (const x of data.expenses) await idbPut('expenses', x);
      }
      if (Array.isArray(data.income)) {
        await idbClear('income');
        for (const x of data.income) await idbPut('income', x);
      }
      showToast('Data imported. Reloading...');
      setTimeout(() => location.reload(), 900);
    } catch (err) {
      showToast('Import failed: invalid file');
    }
  };
  reader.readAsText(file);
}

function confirmReset() {
  openModal(`
    <div class="modal-title">⚠️ Reset All Data</div>
    <p class="muted">This will permanently delete every activity, review, roadmap task, expense, income record and setting stored on this device. This cannot be undone.</p>
    <div class="modal-actions">
      <button class="btn-secondary" id="rc-cancel">Cancel</button>
      <button class="btn-primary btn-danger" id="rc-confirm" style="background:var(--danger);">Yes, Reset Everything</button>
    </div>
  `);
  document.getElementById('rc-cancel').addEventListener('click', () => openSettings());
  document.getElementById('rc-confirm').addEventListener('click', async () => {
    await idbClear('days'); await idbClear('settings'); await idbClear('expenses'); await idbClear('income');
    showToast('All data reset. Reloading...');
    setTimeout(() => location.reload(), 800);
  });
}

/* ---------------------------------------------------------------------
   13. SERVICE WORKER
   --------------------------------------------------------------------- */
function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
}

/* ---------------------------------------------------------------------
   14. BOOT
   --------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', init);
