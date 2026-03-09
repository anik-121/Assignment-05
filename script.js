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


