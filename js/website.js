/* =============================================
   PAWS & PURPOSE — Website JS
   ============================================= */

let allDonations = [];
let showAllDonations = false;

function init() {
  const donations = PawsStorage.loadOrDefault('donations');
  const volunteer = PawsStorage.loadOrDefault('volunteer');
  const fosters   = PawsStorage.loadOrDefault('fosters');
  const sponsors  = PawsStorage.loadOrDefault('sponsors');

  allDonations = donations;

  renderStats(donations, volunteer, sponsors);
  renderDonations(donations);
  renderVolunteer(volunteer);
  renderFosters(fosters);
  renderSponsors(sponsors);
  animateCounters();
}

/* ---- STATS ---- */
function renderStats(donations, volunteer, sponsors) {
  const shelters = new Set(donations.map(d => d.shelter)).size;
  const totalHours = volunteer.reduce((s, v) => s + v.hours, 0);
  document.getElementById('stat-donations').dataset.target = donations.length;
  document.getElementById('stat-hours').dataset.target = totalHours;
  document.getElementById('stat-shelters').dataset.target = shelters;
  document.getElementById('stat-sponsors').dataset.target = sponsors.length;
}

function animateCounters() {
  document.querySelectorAll('[data-target]').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const isDecimal = !Number.isInteger(target);
    const dur = 1400;
    const start = performance.now();
    const update = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = isDecimal ? val.toFixed(1) : Math.round(val);
      if (p < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  });
}

/* ---- DONATIONS ---- */
function renderDonations(donations) {
  const grid = document.getElementById('donations-grid');
  if (!donations.length) {
    grid.innerHTML = '<div class="loading-msg">No donations recorded yet. Add some via the <a href="tracker.html">tracker</a>!</div>';
    return;
  }
  const sorted = [...donations].sort((a, b) => new Date(b.date) - new Date(a.date));
  const toShow = showAllDonations ? sorted : sorted.slice(0, 6);
  grid.innerHTML = toShow.map(d => `
    <div class="donation-card">
      <div class="donation-date">${formatDate(d.date)}</div>
      <div class="donation-shelter">${d.shelter}</div>
      <div class="donation-items">${d.items}</div>
      <span class="donation-value">✓ $${d.value} in supplies</span>
    </div>
  `).join('');
  const wrap = document.getElementById('see-more-wrap');
  wrap.style.display = (donations.length > 6 && !showAllDonations) ? 'block' : 'none';
}

window.showAllDonations = function() {
  showAllDonations = true;
  renderDonations(allDonations);
};

/* ---- VOLUNTEER ---- */
function renderVolunteer(volunteer) {
  if (!volunteer.length) {
    document.getElementById('vol-log').innerHTML = '<div style="color:rgba(255,255,255,0.4);font-size:14px">No sessions logged yet.</div>';
    return;
  }
  const total = volunteer.reduce((s, v) => s + v.hours, 0);
  const now = new Date();
  const thisMonth = volunteer.filter(v => {
    const d = new Date(v.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, v) => s + v.hours, 0);

  document.getElementById('vol-total').dataset.target = total;
  document.getElementById('vol-sessions').dataset.target = volunteer.length;
  document.getElementById('vol-avg').dataset.target = (total / volunteer.length).toFixed(1);
  document.getElementById('vol-month').dataset.target = thisMonth;

  const recent = [...volunteer].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  document.getElementById('vol-log').innerHTML = recent.map(v => `
    <div class="vol-entry">
      <div class="vol-dot"></div>
      <div class="vol-entry-info">
        <div class="vol-entry-title">${v.activity}</div>
        <div class="vol-entry-meta">${formatDate(v.date)}${v.shelter ? ' · ' + v.shelter : ''}</div>
      </div>
      <div class="vol-hours">${v.hours}h</div>
    </div>
  `).join('');
}

/* ---- FOSTERS ---- */
function renderFosters(fosters) {
  const grid = document.getElementById('fosters-grid');
  if (!fosters.length) {
    grid.innerHTML = '<div class="loading-msg">No foster animals added yet.</div>';
    return;
  }
  const labels = { current: 'Currently Fostering', adopted: 'Found Forever Home', returned: 'Returned to Shelter' };
  const statusClass = { current: 'status-current', adopted: 'status-adopted', returned: 'status-returned' };
  grid.innerHTML = fosters.map(f => `
    <div class="foster-card">
      <div class="foster-emoji">${f.emoji}</div>
      <div class="foster-info">
        <div class="foster-name">${f.name}</div>
        <div class="foster-type">${f.type}</div>
        <span class="foster-status ${statusClass[f.status] || 'status-current'}">${labels[f.status] || f.status}</span>
      </div>
    </div>
  `).join('');
}

/* ---- SPONSORS ---- */
function renderSponsors(sponsors) {
  const grid = document.getElementById('sponsors-grid');
  if (!sponsors.length) {
    grid.innerHTML = '<div class="loading-msg">Be the first sponsor! <a href="mailto:contact@pawsandpurpose.org">Get in touch.</a></div>';
    return;
  }
  const tierOrder = { gold: 0, silver: 1, bronze: 2 };
  const sorted = [...sponsors].sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);
  grid.innerHTML = sorted.map(s => `
    <div class="sponsor-card">
      <div class="sponsor-logo">${s.logo}</div>
      <div class="sponsor-tier tier-${s.tier}">${s.tier} sponsor</div>
      <div class="sponsor-name">${s.name}</div>
      <div class="sponsor-desc">${s.desc}</div>
    </div>
  `).join('');
}

// Kick off
init();
