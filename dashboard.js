/* ============================================================
   DecidIA — Dashboard Controller
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  DecidIA.Particles.init('particle-canvas');

  // Cargar datos del localStorage
  const history = loadHistory();
  const xp = loadXP();
  const badges = loadBadges();

  // Actualizar estado
  DecidIA.state.history = history;
  DecidIA.state.xp = xp;
  DecidIA.state.badges = badges;

  renderLevel(xp);
  renderStats(history, xp);
  renderHistory(history);
  renderBadges(badges);
  renderProfileDimensions();
});

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem('decidia_history') || '[]');
  } catch { return []; }
}

function loadXP() {
  return parseInt(localStorage.getItem('decidia_xp') || '0');
}

function loadBadges() {
  try {
    return JSON.parse(localStorage.getItem('decidia_badges') || '[]');
  } catch { return []; }
}

function renderLevel(xp) {
  const level = DecidIA.getLevelFromXP(xp);
  const progress = DecidIA.getXPProgress(xp);
  const nextLevel = DecidIA.LEVELS.find(l => l.id === level.id + 1);

  document.getElementById('level-icon').textContent = level.icon;
  document.getElementById('level-name').textContent = level.name;
  document.getElementById('level-badge').textContent = `${level.icon} ${level.name}`;
  document.getElementById('current-xp').textContent = xp;
  document.getElementById('next-xp').textContent = level.max === Infinity ? '∞' : level.max;
  document.getElementById('xp-bar').style.width = `${progress}%`;
  document.getElementById('level-next').textContent = nextLevel
    ? `Siguiente: ${nextLevel.icon} ${nextLevel.name}`
    : '¡Nivel máximo alcanzado!';
}

function renderStats(history, xp) {
  const total = history.length;
  const positive = history.filter(h => ['positive'].includes(h.category)).length;
  const successRate = total > 0 ? Math.round((positive / total) * 100) : 0;

  // Streak: consecutive positive feedbacks
  let streak = 0;
  for (const h of history) {
    if (h.feedback === 1) streak++;
    else break;
  }

  document.getElementById('stat-total').textContent  = total;
  document.getElementById('stat-success').textContent = `${successRate}%`;
  document.getElementById('stat-streak').textContent  = streak;
  document.getElementById('stat-xp').textContent      = xp;
}

function renderHistory(history) {
  const container = document.getElementById('history-list');
  if (!history.length) return; // keep empty state

  const colorMap = { positive: '#22D47B', negative: '#FF5C7A', neutral: '#00D4CC', mysterious: '#6C3EFF', unknown: '#9898C8' };

  container.innerHTML = '';
  history.slice(0, 6).forEach(h => {
    const item = document.createElement('div');
    item.className = 'history-item';
    const color = colorMap[h.category] || colorMap.unknown;
    item.innerHTML = `
      <div class="history-item__dot" style="background: ${color}"></div>
      <div>
        <p class="history-item__question">${escapeHTML(h.question)}</p>
        <p class="history-item__response">${escapeHTML(h.response)} · ${formatDate(h.date)}</p>
      </div>
    `;
    container.appendChild(item);
  });
}

function renderBadges(earned) {
  const container = document.getElementById('badges-grid');
  container.innerHTML = '';

  DecidIA.BADGES.forEach(badge => {
    const isEarned = earned.includes(badge.id);
    const el = document.createElement('div');
    el.className = `badge-item${isEarned ? ' earned' : ''}`;
    el.title = badge.description;
    el.innerHTML = `
      <span class="badge-item__icon">${badge.icon}</span>
      <span class="badge-item__name">${badge.name}</span>
    `;
    container.appendChild(el);
  });
}

function renderProfileDimensions() {
  const dims = [
    { label: 'Estrés',     value: 0 },
    { label: 'Optimismo',  value: 0 },
    { label: 'Confianza',  value: 0 },
    { label: 'Análisis',   value: 0 },
    { label: 'Riesgo',     value: 0 },
  ];
  const container = document.getElementById('profile-dimensions');
  container.innerHTML = '';
  dims.forEach(d => {
    const el = document.createElement('div');
    el.className = 'profile-dimension';
    el.innerHTML = `
      <div class="profile-dimension__label">${d.label}</div>
      <div class="profile-dimension__bar">
        <div class="profile-dimension__fill" style="height: ${d.value}%"></div>
      </div>
      <div class="profile-dimension__value">${d.value}%</div>
    `;
    container.appendChild(el);
  });
}

function escapeHTML(str) {
  return (str || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function formatDate(iso) {
  try {
    return new Intl.DateTimeFormat('es', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
  } catch { return ''; }
}
