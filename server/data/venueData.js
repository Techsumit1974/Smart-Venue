// Static venue configuration — replace with DB in production
const venue = {
  id: 'stadium_01',
  name: 'CloudArena Stadium',
  capacity: 60000,
  zones: [
    { id: 'Z1', name: 'North Stand', capacity: 15000, gates: ['G1', 'G2'], section: 'north' },
    { id: 'Z2', name: 'South Stand', capacity: 15000, gates: ['G3', 'G4'], section: 'south' },
    { id: 'Z3', name: 'East Stand', capacity: 12000, gates: ['G5'], section: 'east' },
    { id: 'Z4', name: 'West Stand', capacity: 12000, gates: ['G6'], section: 'west' },
    { id: 'Z5', name: 'VIP Lounge', capacity: 3000, gates: ['G7'], section: 'vip' },
    { id: 'Z6', name: 'Family Zone', capacity: 3000, gates: ['G8'], section: 'family' }
  ],
  gates: [
    { id: 'G1', name: 'Gate 1 - North Main',   lat: 51.556, lng: -0.279, zone: 'Z1' },
    { id: 'G2', name: 'Gate 2 - North East',   lat: 51.557, lng: -0.277, zone: 'Z1' },
    { id: 'G3', name: 'Gate 3 - South Main',   lat: 51.552, lng: -0.279, zone: 'Z2' },
    { id: 'G4', name: 'Gate 4 - South West',   lat: 51.551, lng: -0.281, zone: 'Z2' },
    { id: 'G5', name: 'Gate 5 - East',         lat: 51.554, lng: -0.274, zone: 'Z3' },
    { id: 'G6', name: 'Gate 6 - West',         lat: 51.554, lng: -0.284, zone: 'Z4' },
    { id: 'G7', name: 'Gate 7 - VIP',          lat: 51.556, lng: -0.281, zone: 'Z5' },
    { id: 'G8', name: 'Gate 8 - Family',       lat: 51.553, lng: -0.276, zone: 'Z6' }
  ],
  concessionStands: [
    { id: 'CS1', name: 'North Grill',     zone: 'Z1', type: 'food',     items: ['Burger', 'Hot Dog', 'Fries'] },
    { id: 'CS2', name: 'South Bites',     zone: 'Z2', type: 'food',     items: ['Pizza', 'Nachos', 'Wrap'] },
    { id: 'CS3', name: 'East Drinks',     zone: 'Z3', type: 'beverages',items: ['Beer', 'Soft Drink', 'Water'] },
    { id: 'CS4', name: 'West Bar',        zone: 'Z4', type: 'beverages',items: ['Beer', 'Wine', 'Cocktail'] },
    { id: 'CS5', name: 'VIP Lounge Bar',  zone: 'Z5', type: 'premium',  items: ['Premium Spirits', 'Fine Dining'] },
    { id: 'CS6', name: 'Family Snacks',   zone: 'Z6', type: 'snacks',   items: ['Popcorn', 'Ice Cream', 'Juice'] },
    { id: 'CS7', name: 'Central Kiosk A', zone: 'Z1', type: 'snacks',   items: ['Candy', 'Chips', 'Soft Drink'] },
    { id: 'CS8', name: 'Central Kiosk B', zone: 'Z2', type: 'snacks',   items: ['Candy', 'Chips', 'Coffee'] }
  ],
  restrooms: [
    { id: 'R1', zone: 'Z1', gender: 'mixed',  level: 1 },
    { id: 'R2', zone: 'Z2', gender: 'mixed',  level: 1 },
    { id: 'R3', zone: 'Z3', gender: 'male',   level: 2 },
    { id: 'R4', zone: 'Z3', gender: 'female', level: 2 },
    { id: 'R5', zone: 'Z4', gender: 'male',   level: 1 },
    { id: 'R6', zone: 'Z4', gender: 'female', level: 1 },
    { id: 'R7', zone: 'Z5', gender: 'mixed',  level: 3 },
    { id: 'R8', zone: 'Z6', gender: 'mixed',  level: 1 }
  ]
};

// Mutable real-time state
let crowdState = {};
let queueState = {};
let concessionState = {};

venue.zones.forEach(z => {
  crowdState[z.id] = {
    current: Math.floor(z.capacity * 0.3),
    capacity: z.capacity,
    density: 'low',       // low | medium | high | critical
    flow: 'normal'        // normal | slow | blocked
  };
});

venue.gates.forEach(g => {
  queueState[g.id] = {
    waitMinutes: Math.floor(Math.random() * 10) + 2,
    queueLength: Math.floor(Math.random() * 100) + 10,
    isOpen: true
  };
});

venue.concessionStands.forEach(cs => {
  concessionState[cs.id] = {
    waitMinutes: Math.floor(Math.random() * 15) + 1,
    isOpen: true,
    stockLevel: 'full'    // full | low | out
  };
});

module.exports = { venue, crowdState, queueState, concessionState };