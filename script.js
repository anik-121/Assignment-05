const API = 'https://phi-lab-server.vercel.app/api/v1/lab';

let allIssues = [];
let activeTab = 'all';
let searchTimer = null;




document.getElementById('loginBtn').addEventListener('click', login);

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !document.getElementById('loginPage').classList.contains('hidden')) login();
});

function login() {
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value.trim();
  const err = document.getElementById('loginError');

  if (u === 'admin' && p === 'admin123') {
    err.classList.add('hidden');
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('dashboardPage').classList.remove('hidden');
    loadIssues();
  } else {
    err.classList.remove('hidden');
  }
}


/* ── LOAD ALL ISSUES ───────────────────────── */

async function loadIssues() {
  try {
    const res  = await fetch(`${API}/issues`);
    const json = await res.json();
    allIssues  = json.data || [];          // API returns { data: [...] }
    renderIssues(allIssues);
  } catch(e) {
    document.getElementById('issuesGrid').innerHTML =
      `<p class="col-span-4 text-center text-red-400 py-12">Failed to load issues. (${e.message})</p>`;
  }
}


/* ── RENDER CARDS ──────────────────────────── */

function renderIssues(issues) {
  const filtered = applyTab(issues);
  const grid  = document.getElementById('issuesGrid');
  const empty = document.getElementById('emptyState');

  document.getElementById('countLabel').textContent =
    `${filtered.length} Issue${filtered.length !== 1 ? 's' : ''}`;

  if (!filtered.length) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  grid.innerHTML = filtered.map(iss => {
    const status   = (iss.status || 'open').toLowerCase();
    const priority = (iss.priority || '').toLowerCase();
    const labels   = Array.isArray(iss.labels) ? iss.labels : [];

    return `
    <div class="issue-card bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2"
         onclick="openIssue(${iss.id})">

      <!-- status dot + priority badge -->
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full flex-shrink-0 ${status === 'open' ? 'bg-green-400' : 'bg-orange-400'}"></span>
        ${priority ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase
          ${priority === 'high' ? 'pri-high' : priority === 'medium' ? 'pri-medium' : 'pri-low'}">${esc(iss.priority)}</span>` : ''}
      </div>

      <!-- title -->
      <h3 class="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">${esc(iss.title)}</h3>

      <!-- description -->
      <p class="text-xs text-gray-400 line-clamp-2 flex-1">${esc(iss.description || '')}</p>

      <!-- labels -->
      <div class="flex flex-wrap gap-1">${labelTags(labels)}</div>

      <!-- footer -->
      <div class="text-[11px] text-gray-400 pt-1 border-t border-gray-50 mt-auto">
        By <span class="font-medium text-gray-500">${esc(iss.assignee || 'Unknown')}</span>
        &nbsp;·&nbsp; ${fmtDate(iss.createdAt || iss.created_at)}
      </div>
    </div>`;
  }).join('');
}

/* ── TABS ──────────────────────────────────── */

function switchTab(tab) {
  activeTab = tab;
  ['all','open','closed'].forEach(t => {
    document.getElementById(`tab-${t}`).className =
      t === tab
        ? 'px-5 py-1.5 rounded-full text-sm font-medium bg-[#4a00ff] text-white'
        : 'px-5 py-1.5 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50';
  });
  // re-render from last loaded list
  const q = document.getElementById('searchInput').value.trim();
  if (q) doSearch(q); else renderIssues(allIssues);
}

function applyTab(issues) {
  if (activeTab === 'all') return issues;
  return issues.filter(i => (i.status || 'open').toLowerCase() === activeTab);
}