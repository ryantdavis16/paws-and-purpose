/* =============================================
   PAWS & PURPOSE — Tracker JS
   ============================================= */

let donations = [], volunteer = [], fosters = [], sponsors = [];
let fosterStatus = 'current';
let sponsorTier = 'gold';

// Set today's date on all date inputs
['d-date','v-date','f-date'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.valueAsDate = new Date();
});

/* ---- TABS ---- */
function switchTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('panel-' + name).classList.add('active');
}

/* ---- INIT ---- */
function init() {
  donations = PawsStorage.loadOrDefault('donations');
  volunteer = PawsStorage.loadOrDefault('volunteer');
  fosters   = PawsStorage.loadOrDefault('fosters');
  sponsors  = PawsStorage.loadOrDefault('sponsors');
  render();
}

function render() {
  updateSummary();
  renderDonations();
  renderVolunteer();
  renderFosters();
  renderSponsors();
}

function save(type, data) {
  PawsStorage.set(PawsStorage.KEYS[type], data);
}

/* ---- SUMMARY ---- */
function updateSummary() {
  const totalVal = donations.reduce((s, d) => s + (d.value || 0), 0);
  const totalHrs = volunteer.reduce((s, v) => s + v.hours, 0);
  document.getElementById('s-donations').textContent = donations.length;
  document.getElementById('s-value').textContent = '$' + totalVal.toLocaleString();
  document.getElementById('s-hours').textContent = totalHrs % 1 === 0 ? totalHrs : totalHrs.toFixed(1);
  document.getElementById('s-fosters').textContent = fosters.length;
  document.getElementById('s-sponsors').textContent = sponsors.length;
}

/* ---- DONATIONS ---- */
window.addDonation = function() {
  const date = document.getElementById('d-date').value;
  const shelter = document.getElementById('d-shelter').value.trim();
  const items = document.getElementById('d-items').value.trim();
  const value = parseFloat(document.getElementById('d-value').value) || 0;
  const category = document.getElementById('d-category').value;
  if (!date || !shelter || !items) { alert('Please fill in date, shelter name, and items donated.'); return; }
  donations.push({ id: Date.now(), date, shelter, items, value, category });
  save('donations', donations);
  document.getElementById('d-shelter').value = '';
  document.getElementById('d-items').value = '';
  document.getElementById('d-value').value = '';
  render();
};

function renderDonations() {
  const list = document.getElementById('donation-list');
  document.getElementById('d-count').textContent = donations.length + ' records';
  if (!donations.length) {
    list.innerHTML = '<div class="empty-state">No donations yet. Log your first one above!</div>';
    return;
  }
  const sorted = [...donations].sort((a, b) => new Date(b.date) - new Date(a.date));
  list.innerHTML = sorted.map(d => `
    <div class="record-item">
      <div class="record-icon icon-donate">🛍️</div>
      <div class="record-body">
        <div class="record-title">${d.shelter}</div>
        <div class="record-meta">${formatDateShort(d.date)} · ${d.category}</div>
        <div class="record-meta">${d.items}</div>
      </div>
      <div class="record-right">
        <span class="record-badge badge-green">$${d.value}</span>
        <button class="delete-btn" onclick="del('donations',${d.id})" title="Delete">✕</button>
      </div>
    </div>
  `).join('');
}

/* ---- VOLUNTEER ---- */
window.addVolunteer = function() {
  const date = document.getElementById('v-date').value;
  const hours = parseFloat(document.getElementById('v-hours').value) || 0;
  const shelter = document.getElementById('v-shelter').value.trim();
  const activity = document.getElementById('v-activity').value.trim();
  if (!date || !hours || !activity) { alert('Please fill in date, hours, and activity description.'); return; }
  volunteer.push({ id: Date.now(), date, hours, shelter, activity });
  save('volunteer', volunteer);
  document.getElementById('v-hours').value = '';
  document.getElementById('v-activity').value = '';
  render();
};

function renderVolunteer() {
  const list = document.getElementById('volunteer-list');
  document.getElementById('v-count').textContent = volunteer.length + ' sessions';
  if (!volunteer.length) {
    list.innerHTML = '<div class="empty-state">No sessions logged yet!</div>';
    return;
  }
  const sorted = [...volunteer].sort((a, b) => new Date(b.date) - new Date(a.date));
  list.innerHTML = sorted.map(v => `
    <div class="record-item">
      <div class="record-icon icon-vol">⏱️</div>
      <div class="record-body">
        <div class="record-title">${v.activity}</div>
        <div class="record-meta">${formatDateShort(v.date)}${v.shelter ? ' · ' + v.shelter : ''}</div>
      </div>
      <div class="record-right">
        <span class="record-badge badge-gold">${v.hours}h</span>
        <button class="delete-btn" onclick="del('volunteer',${v.id})" title="Delete">✕</button>
      </div>
    </div>
  `).join('');
}

/* ---- FOSTERS ---- */
window.selectStatus = function(el, status) {
  fosterStatus = status;
  document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('selected', 'sel-adopted'));
  el.classList.add(status === 'adopted' ? 'sel-adopted' : 'selected');
};

window.addFoster = function() {
  const name = document.getElementById('f-name').value.trim();
  const type = document.getElementById('f-type').value.trim();
  const date = document.getElementById('f-date').value;
  const emoji = document.getElementById('f-emoji').value;
  if (!name || !type) { alert('Please fill in the animal name and species/breed.'); return; }
  fosters.push({ id: Date.now(), name, type, date, emoji, status: fosterStatus });
  save('fosters', fosters);
  document.getElementById('f-name').value = '';
  document.getElementById('f-type').value = '';
  render();
};

function renderFosters() {
  const list = document.getElementById('foster-list');
  document.getElementById('f-count').textContent = fosters.length + ' animals';
  if (!fosters.length) {
    list.innerHTML = '<div class="empty-state">No foster animals added yet!</div>';
    return;
  }
  const labels = { current: 'Currently Fostering', adopted: 'Found Forever Home', returned: 'Returned to Shelter' };
  const badgeClass = { current: 'badge-green', adopted: 'badge-gold', returned: 'badge-terra' };
  const sorted = [...fosters].sort((a, b) => new Date(b.date) - new Date(a.date));
  list.innerHTML = sorted.map(f => `
    <div class="record-item">
      <div class="record-icon icon-foster">${f.emoji}</div>
      <div class="record-body">
        <div class="record-title">${f.name}</div>
        <div class="record-meta">${f.type}${f.date ? ' · Arrived ' + formatDateShort(f.date) : ''}</div>
      </div>
      <div class="record-right">
        <span class="record-badge ${badgeClass[f.status] || 'badge-green'}">${labels[f.status] || f.status}</span>
        <button class="delete-btn" onclick="del('fosters',${f.id})" title="Delete">✕</button>
      </div>
    </div>
  `).join('');
}

/* ---- SPONSORS ---- */
window.selectTier = function(el, tier) {
  sponsorTier = tier;
  document.querySelectorAll('.tier-opt').forEach(t => t.className = 'tier-opt');
  el.classList.add('selected-' + tier);
};

window.addSponsor = function() {
  const name = document.getElementById('sp-name').value.trim();
  const desc = document.getElementById('sp-desc').value.trim();
  const logo = document.getElementById('sp-emoji').value;
  if (!name) { alert('Please enter a sponsor name.'); return; }
  sponsors.push({ id: Date.now(), name, tier: sponsorTier, desc, logo });
  save('sponsors', sponsors);
  document.getElementById('sp-name').value = '';
  document.getElementById('sp-desc').value = '';
  render();
};

function renderSponsors() {
  const list = document.getElementById('sponsor-list');
  document.getElementById('sp-count').textContent = sponsors.length + ' sponsors';
  if (!sponsors.length) {
    list.innerHTML = '<div class="empty-state">No sponsors yet — add your first one!</div>';
    return;
  }
  const tierOrder = { gold: 0, silver: 1, bronze: 2 };
  const tierLabel = { gold: '⭐ Gold', silver: '🥈 Silver', bronze: '🥉 Bronze' };
  const badgeClass = { gold: 'badge-gold', silver: 'badge-green', bronze: 'badge-terra' };
  const sorted = [...sponsors].sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);
  list.innerHTML = sorted.map(s => `
    <div class="record-item">
      <div class="record-icon icon-sponsor">${s.logo}</div>
      <div class="record-body">
        <div class="record-title">${s.name}</div>
        <div class="record-meta">${s.desc}</div>
      </div>
      <div class="record-right">
        <span class="record-badge ${badgeClass[s.tier]}">${tierLabel[s.tier]}</span>
        <button class="delete-btn" onclick="del('sponsors',${s.id})" title="Delete">✕</button>
      </div>
    </div>
  `).join('');
}

/* ---- DELETE ---- */
window.del = function(type, id) {
  if (type === 'donations') { donations = donations.filter(d => d.id !== id); save('donations', donations); }
  else if (type === 'volunteer') { volunteer = volunteer.filter(v => v.id !== id); save('volunteer', volunteer); }
  else if (type === 'fosters') { fosters = fosters.filter(f => f.id !== id); save('fosters', fosters); }
  else if (type === 'sponsors') { sponsors = sponsors.filter(s => s.id !== id); save('sponsors', sponsors); }
  render();
};

init();
