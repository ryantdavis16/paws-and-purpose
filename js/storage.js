/* =============================================
   PAWS & PURPOSE — Shared Storage (localStorage)
   ============================================= */

const PawsStorage = {
  KEYS: {
    donations: 'paws_donations',
    volunteer: 'paws_volunteer',
    fosters: 'paws_fosters',
    sponsors: 'paws_sponsors'
  },

  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch(e) { return null; }
  },

  set(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch(e) { return false; }
  },

  defaults: {
    donations: [
      { id: 1, date: '2025-01-15', shelter: 'Happy Tails Animal Shelter', items: 'Dog food (50 lbs), cat litter (20 lbs), 12 chew toys', value: 180, category: 'Food & Supplies' },
      { id: 2, date: '2025-02-08', shelter: 'Eastside Animal Rescue', items: 'Fleece blankets (x10), puppy pads (100 pack), grooming brushes', value: 145, category: 'Bedding & Comfort' },
      { id: 3, date: '2025-03-22', shelter: 'Happy Tails Animal Shelter', items: 'Cat food (30 lbs), wet food cans (x48), cat toys', value: 210, category: 'Food & Supplies' }
    ],
    volunteer: [
      { id: 1, date: '2025-01-20', activity: 'Dog walking & socialization', hours: 3, shelter: 'Happy Tails Animal Shelter' },
      { id: 2, date: '2025-02-03', activity: 'Rabbit care & enclosure cleaning', hours: 2.5, shelter: 'Eastside Animal Rescue' },
      { id: 3, date: '2025-02-17', activity: 'Cat socialization & playtime', hours: 3, shelter: 'Happy Tails Animal Shelter' },
      { id: 4, date: '2025-03-10', activity: 'Adoption event assistance', hours: 5, shelter: 'Happy Tails Animal Shelter' },
      { id: 5, date: '2025-03-30', activity: 'Supply sorting & organization', hours: 2, shelter: 'Happy Tails Animal Shelter' }
    ],
    fosters: [
      { id: 1, date: '2025-01-05', name: 'Cinnamon', type: 'Holland Lop Rabbit', emoji: '🐰', status: 'current' },
      { id: 2, date: '2024-10-12', name: 'Pepper', type: 'Mini Rex Rabbit', emoji: '🐰', status: 'adopted' },
      { id: 3, date: '2024-08-20', name: 'Luna', type: 'Tabby Kitten', emoji: '🐱', status: 'adopted' },
      { id: 4, date: '2024-06-14', name: 'Biscuit', type: 'Beagle Mix', emoji: '🐶', status: 'adopted' }
    ],
    sponsors: [
      { id: 1, name: 'PetPlus Supply Co.', tier: 'gold', desc: 'Premium pet supplies & bulk food donations', logo: '🏪' },
      { id: 2, name: 'Westside Vet Clinic', tier: 'gold', desc: 'Medical supplies & veterinary support', logo: '🏥' },
      { id: 3, name: 'Green Paw Foods', tier: 'silver', desc: 'Organic pet food contributions', logo: '🌿' },
      { id: 4, name: 'The Johnson Family', tier: 'silver', desc: 'Community supporters since 2024', logo: '❤️' },
      { id: 5, name: 'Paws & Claws Boutique', tier: 'bronze', desc: 'Accessories & comfort items', logo: '🛍️' }
    ]
  },

  loadOrDefault(type) {
    const stored = this.get(this.KEYS[type]);
    if (stored && stored.length > 0) return stored;
    // Seed defaults on first load
    this.set(this.KEYS[type], this.defaults[type]);
    return this.defaults[type];
  }
};

// Shared nav mobile toggle
function toggleMenu() {
  const links = document.getElementById('nav-links');
  links.classList.toggle('open');
}

// Format date helper
function formatDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
function formatDateShort(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
